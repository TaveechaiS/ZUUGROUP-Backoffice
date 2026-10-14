import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { allowRead } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { object, str, id, day, bangkokDay } from '@/server/operations/domain';
import {
  allow,
  command,
  nextDocumentCode,
  page,
  pageResult,
  query,
  type Actor,
} from '@/server/operations/service';
import { customerStorage, inspectCustomerFile } from '@/server/customers/storage';
import { reportRange, likeOf } from '@/server/reports/range';
import type { ExpenseFileRow, ExpenseRow } from '@/types/api/expenses';

export const EXPENSE_WRITERS = ['ADMIN', 'ACCOUNTING_CFO'];
const FILE_LIMIT = 10485760;

function amount(value: unknown) {
  const v = String(value ?? '');
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(v) || Number(v) <= 0)
    throw new RecordError(400, 'จำนวนเงินต้องมากกว่า 0 และทศนิยมไม่เกิน 2 หลัก');
  return v;
}
const uuidOrCode = (value: string) =>
  /^[0-9a-f-]{36}$/i.test(value)
    ? Prisma.sql`(e.id=${value}::uuid OR e.code=${value})`
    : Prisma.sql`e.code=${value}`;

async function fields(tx: Prisma.TransactionClient, b: Record<string, unknown>) {
  const expenseDate = day(b.expenseDate);
  if (expenseDate > bangkokDay()) throw new RecordError(400, 'วันที่ค่าใช้จ่ายต้องไม่เกินวันนี้');
  const categoryId = id(b.categoryId, 'หมวดค่าใช้จ่าย');
  const category = await query<{ id: string }>(
    tx,
    Prisma.sql`SELECT id FROM customer_options WHERE id=${categoryId}::uuid AND kind='expenseCategory' AND active FOR KEY SHARE`,
  );
  if (!category[0]) throw new RecordError(400, 'หมวดค่าใช้จ่ายไม่พร้อมใช้งาน');
  return {
    name: str(b.name, 'รายการ', true, 200),
    expenseDate,
    categoryId,
    amount: amount(b.amount),
    payee: str(b.payee, 'ผู้รับเงิน', false, 200),
    description: str(b.description, 'รายละเอียด', false),
    notes: str(b.notes, 'หมายเหตุ', false),
  };
}

export async function expenseWrite(actor: Actor, raw: unknown, expenseId?: string) {
  const b = object(raw),
    action = expenseId ? str(b.action, 'คำสั่ง') : 'create';
  allow(actor, EXPENSE_WRITERS);
  return command(actor, b, `expenses.${action}`, async (tx) => {
    if (action === 'create') {
      const f = await fields(tx, b),
        newId = randomUUID(),
        code = await nextDocumentCode(tx, 'EX');
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO expenses(id,code,name,status,expense_date,category_id,amount,payee,description,notes,owner,created_by_id) VALUES(${newId}::uuid,${code},${f.name},'บันทึกแล้ว',${f.expenseDate}::date,${f.categoryId}::uuid,${f.amount}::numeric,${f.payee},${f.description},${f.notes},${actor.name},${actor.id}::uuid)`,
      );
      return { data: { id: newId, code } };
    }
    const eid = id(expenseId);
    const before = (
      await query<{ status: string; updatedAt: Date }>(
        tx,
        Prisma.sql`SELECT status,updated_at AS "updatedAt" FROM expenses WHERE id=${eid}::uuid AND deleted_at IS NULL FOR UPDATE`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบค่าใช้จ่าย');
    if (
      b.expectedUpdatedAt !== undefined &&
      String(b.expectedUpdatedAt) !== before.updatedAt.toISOString()
    )
      throw new RecordError(409, 'ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    if (before.status === 'ยกเลิก') throw new RecordError(409, 'ค่าใช้จ่ายถูกยกเลิกแล้ว');
    if (action === 'edit') {
      const f = await fields(tx, b);
      await tx.$executeRaw(
        Prisma.sql`UPDATE expenses SET name=${f.name},expense_date=${f.expenseDate}::date,category_id=${f.categoryId}::uuid,amount=${f.amount}::numeric,payee=${f.payee},description=${f.description},notes=${f.notes},updated_at=clock_timestamp() WHERE id=${eid}::uuid`,
      );
      return { data: { id: eid } };
    }
    if (action === 'cancel') {
      const reason = str(b.reason, 'เหตุผล');
      await tx.$executeRaw(
        Prisma.sql`UPDATE expenses SET status='ยกเลิก',cancel_reason=${reason},updated_at=clock_timestamp() WHERE id=${eid}::uuid`,
      );
      return { data: { id: eid, status: 'ยกเลิก', reason } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

const expenseFrom = Prisma.sql`expenses e LEFT JOIN customer_options c ON c.id=e.category_id LEFT JOIN users u ON u.id=e.created_by_id`;
const expenseSelect = Prisma.sql`e.id,e.code,e.name,e.status,e.expense_date::text AS "expenseDate",e.category_id AS "categoryId",COALESCE(c.name,'-') AS "categoryName",e.amount::text AS amount,e.payee,e.description,e.notes,e.cancel_reason AS "cancelReason",(SELECT count(*)::int FROM expense_files f WHERE f.expense_id=e.id) AS "fileCount",COALESCE(u.name,e.owner) AS "createdByName",e.created_at AS "createdAt",e.updated_at AS "updatedAt"`;

export async function expenseRead(actor: Actor, params: URLSearchParams, expenseId?: string) {
  allowRead(actor, ['ADMIN', 'ACCOUNTING_CFO', 'MANAGER']);
  return getPrismaClient().$transaction(
    async (tx) => {
      if (expenseId) {
        const row = (
          await query<ExpenseRow>(
            tx,
            Prisma.sql`SELECT ${expenseSelect} FROM ${expenseFrom} WHERE ${uuidOrCode(expenseId)} AND e.deleted_at IS NULL`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบค่าใช้จ่าย');
        row.files = await query<ExpenseFileRow>(
          tx,
          Prisma.sql`SELECT id,name,type,size,created_at AS "createdAt" FROM expense_files WHERE expense_id=${row.id}::uuid ORDER BY created_at,id`,
        );
        return { data: row, actor };
      }
      const { offset, limit, search } = page(params),
        like = likeOf(search),
        { from, to } = reportRange(params),
        status = params.get('status') ?? '',
        categoryId = params.get('categoryId') ?? '';
      if (status && !['บันทึกแล้ว', 'ยกเลิก'].includes(status))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      const where = Prisma.sql`e.deleted_at IS NULL AND e.expense_date BETWEEN ${from}::date AND ${to}::date AND (e.code ILIKE ${like} OR e.name ILIKE ${like} OR e.payee ILIKE ${like}) ${status ? Prisma.sql`AND e.status=${status}` : Prisma.empty} ${categoryId ? Prisma.sql`AND e.category_id=${id(categoryId, 'หมวดค่าใช้จ่าย')}::uuid` : Prisma.empty}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`e.code`,
          expenseDate: Prisma.sql`e.expense_date`,
          name: Prisma.sql`e.name`,
          categoryName: Prisma.sql`c.name`,
          amount: Prisma.sql`e.amount`,
          status: Prisma.sql`e.status`,
        },
        Prisma.sql`e.expense_date DESC,e.code DESC`,
        Prisma.sql`e.id`,
      );
      const rows = await query<ExpenseRow>(
        tx,
        Prisma.sql`SELECT ${expenseSelect} FROM ${expenseFrom} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const totals = await query<{ total: number; amount: string }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total,COALESCE(sum(e.amount) FILTER (WHERE e.status='บันทึกแล้ว'),0)::numeric(14,2)::text AS amount FROM ${expenseFrom} WHERE ${where}`,
      );
      const categories = await query<{ id: string; name: string }>(
        tx,
        Prisma.sql`SELECT id,name FROM customer_options WHERE kind='expenseCategory' AND active ORDER BY name,id`,
      );
      return {
        ...pageResult(rows, totals[0].total, offset, limit),
        totalAmount: totals[0].amount,
        range: { from, to },
        categories,
        actor,
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

export async function uploadExpenseFile(actor: Actor, expenseId: string, file: unknown) {
  allow(actor, EXPENSE_WRITERS);
  const eid = id(expenseId);
  if (!(file instanceof File)) throw new RecordError(400, 'กรุณาแนบไฟล์');
  if (!file.size || file.size > FILE_LIMIT) throw new RecordError(400, 'ไฟล์ต้องไม่เกิน 10 MB');
  const bytes = new Uint8Array(await file.arrayBuffer());
  let type: string;
  try {
    type = inspectCustomerFile(bytes, file.type);
  } catch (error) {
    throw new RecordError(400, error instanceof Error ? error.message : 'ชนิดไฟล์ไม่รองรับ');
  }
  const fileId = randomUUID(),
    path = `expenses/${eid}/${fileId}`,
    name = file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 255) || 'ไฟล์แนบ';
  return getPrismaClient().$transaction(
    async (tx) => {
      const expense = await query<{ status: string }>(
        tx,
        Prisma.sql`SELECT status FROM expenses WHERE id=${eid}::uuid AND deleted_at IS NULL FOR UPDATE`,
      );
      if (!expense[0]) throw new RecordError(404, 'ไม่พบค่าใช้จ่าย');
      if (expense[0].status === 'ยกเลิก') throw new RecordError(409, 'ค่าใช้จ่ายถูกยกเลิกแล้ว');
      const { error } = await customerStorage().upload(path, bytes, {
        contentType: type,
        upsert: false,
      });
      if (error) throw new RecordError(503, 'อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่');
      try {
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO expense_files(id,expense_id,name,type,size,path,created_by_id) VALUES(${fileId}::uuid,${eid}::uuid,${name},${type},${file.size},${path},${actor.id}::uuid)`,
        );
      } catch (caught) {
        await customerStorage().remove([path]);
        throw caught;
      }
      return { data: { id: fileId, name, type, size: file.size } };
    },
    { timeout: 60000 },
  );
}

export async function readExpenseFile(fileId: string) {
  const rows = await getPrismaClient().$queryRaw<
    { name: string; type: string; size: number; path: string }[]
  >(
    Prisma.sql`SELECT f.name,f.type,f.size,f.path FROM expense_files f JOIN expenses e ON e.id=f.expense_id WHERE f.id=${id(fileId)}::uuid AND e.deleted_at IS NULL`,
  );
  if (!rows[0]) throw new RecordError(404, 'ไม่พบไฟล์');
  const { data, error } = await customerStorage().download(rows[0].path);
  if (error || !data) throw new RecordError(503, 'เปิดไฟล์ไม่สำเร็จ');
  return { file: rows[0], bytes: await data.arrayBuffer() };
}
