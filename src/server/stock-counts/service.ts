import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { object, str, id, qty } from '@/server/operations/domain';
import {
  allow,
  command,
  nextDocumentCode,
  page,
  pageResult,
  query,
  type Actor,
  type Tx,
} from '@/server/operations/service';
import { likeOf } from '@/server/reports/range';
import type { StockCountLineRow, StockCountRow } from '@/types/api/stock-counts';

const STATUSES = ['กำลังนับ', 'ปิดแล้ว', 'ยกเลิก'];

async function summarize(tx: Tx, sessionId: string) {
  const rows = await query<{ matched: number; short: number; over: number; pending: number }>(
    tx,
    Prisma.sql`SELECT count(*) FILTER (WHERE counted_quantity=system_quantity)::int AS matched,COALESCE(sum(system_quantity-counted_quantity) FILTER (WHERE counted_quantity<system_quantity),0)::int AS short,COALESCE(sum(counted_quantity-system_quantity) FILTER (WHERE counted_quantity>system_quantity),0)::int AS over,count(*) FILTER (WHERE counted_quantity IS NULL)::int AS pending FROM stock_count_lines WHERE session_id=${sessionId}::uuid`,
  );
  const r = rows[0];
  return `ตรงกัน ${r.matched} ล็อต · ขาด ${r.short} ชิ้น · เกิน ${r.over} ชิ้น${r.pending ? ` · ยังไม่นับ ${r.pending} ล็อต` : ''}`;
}

export async function stockCountWrite(actor: Actor, raw: unknown, sessionId?: string) {
  const b = object(raw),
    action = sessionId ? str(b.action, 'คำสั่ง') : 'create';
  allow(actor, ['ADMIN']);
  return command(actor, b, `stock-counts.${action}`, async (tx) => {
    if (action === 'create') {
      const warehouse = (
        await query<{ id: string; name: string }>(
          tx,
          Prisma.sql`SELECT id,name FROM warehouses WHERE id=${id(b.warehouseId, 'คลัง')}::uuid`,
        )
      )[0];
      if (!warehouse) throw new RecordError(400, 'ไม่พบคลัง');
      const newId = randomUUID(),
        code = await nextDocumentCode(tx, 'SC'),
        name = str(b.name, 'ชื่อรอบตรวจนับ', false, 200) || `ตรวจนับ ${warehouse.name}`;
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO stock_count_sessions(id,code,name,status,warehouse_id,notes,owner,created_by_id) VALUES(${newId}::uuid,${code},${name},'กำลังนับ',${warehouse.id}::uuid,${str(b.notes, 'หมายเหตุ', false)},${actor.name},${actor.id}::uuid)`,
      );
      const lines = await tx.$executeRaw(
        Prisma.sql`INSERT INTO stock_count_lines(session_id,lot_id,system_quantity) SELECT ${newId}::uuid,b.lot_id,b.quantity FROM stock_balances b WHERE b.warehouse_id=${warehouse.id}::uuid AND b.quantity>0`,
      );
      if (!lines) throw new RecordError(409, 'คลังนี้ไม่มีสินค้าคงเหลือให้ตรวจนับ');
      return { data: { id: newId, code, lines } };
    }
    const sid = id(sessionId);
    const before = (
      await query<{ status: string; updatedAt: Date }>(
        tx,
        Prisma.sql`SELECT status,updated_at AS "updatedAt" FROM stock_count_sessions WHERE id=${sid}::uuid AND deleted_at IS NULL FOR UPDATE`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบรอบตรวจนับ');
    if (
      b.expectedUpdatedAt !== undefined &&
      String(b.expectedUpdatedAt) !== before.updatedAt.toISOString()
    )
      throw new RecordError(409, 'ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    if (before.status !== 'กำลังนับ') throw new RecordError(409, 'รอบตรวจนับนี้ปิดแล้ว');
    if (action === 'count') {
      if (!Array.isArray(b.lines) || !b.lines.length || b.lines.length > 2000)
        throw new RecordError(400, 'กรุณาส่งรายการนับ');
      for (const value of b.lines) {
        const line = object(value);
        const counted =
          line.countedQuantity === null || line.countedQuantity === ''
            ? null
            : qty(line.countedQuantity, true);
        const updated = await tx.$executeRaw(
          Prisma.sql`UPDATE stock_count_lines SET counted_quantity=${counted},note=${str(line.note, 'หมายเหตุ', false, 500)} WHERE id=${id(line.id, 'รายการนับ')}::uuid AND session_id=${sid}::uuid`,
        );
        if (!updated) throw new RecordError(400, 'รายการนับไม่ตรงกับรอบนี้');
      }
      const result = await summarize(tx, sid);
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_count_sessions SET result_text=${result},updated_at=clock_timestamp() WHERE id=${sid}::uuid`,
      );
      return { data: { id: sid, result } };
    }
    if (action === 'close') {
      const pending = await query<{ n: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS n FROM stock_count_lines WHERE session_id=${sid}::uuid AND counted_quantity IS NULL`,
      );
      if (pending[0].n) throw new RecordError(409, `ยังไม่นับ ${pending[0].n} ล็อต`);
      const result = await summarize(tx, sid);
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_count_sessions SET status='ปิดแล้ว',result_text=${result},closed_at=clock_timestamp(),updated_at=clock_timestamp() WHERE id=${sid}::uuid`,
      );
      return { data: { id: sid, status: 'ปิดแล้ว', result } };
    }
    if (action === 'cancel') {
      const reason = str(b.reason, 'เหตุผล');
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_count_sessions SET status='ยกเลิก',cancel_reason=${reason},updated_at=clock_timestamp() WHERE id=${sid}::uuid`,
      );
      return { data: { id: sid, status: 'ยกเลิก', reason } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

const from = Prisma.sql`stock_count_sessions s JOIN warehouses w ON w.id=s.warehouse_id LEFT JOIN users u ON u.id=s.created_by_id`;
const select = Prisma.sql`s.id,s.code,s.name,s.status,s.warehouse_id AS "warehouseId",w.name AS "warehouseName",s.result_text AS "resultText",s.notes,s.cancel_reason AS "cancelReason",(SELECT count(*)::int FROM stock_count_lines l WHERE l.session_id=s.id) AS "lineCount",(SELECT count(*)::int FROM stock_count_lines l WHERE l.session_id=s.id AND l.counted_quantity IS NOT NULL AND l.counted_quantity<>l.system_quantity) AS "diffCount",COALESCE(u.name,s.owner) AS "createdByName",s.created_at AS "createdAt",s.closed_at AS "closedAt",s.updated_at AS "updatedAt"`;

export async function stockCountRead(actor: Actor, params: URLSearchParams, sessionId?: string) {
  return getPrismaClient().$transaction(
    async (tx) => {
      if (sessionId) {
        const match = /^[0-9a-f-]{36}$/i.test(sessionId)
          ? Prisma.sql`(s.id=${sessionId}::uuid OR s.code=${sessionId})`
          : Prisma.sql`s.code=${sessionId}`;
        const row = (
          await query<StockCountRow>(
            tx,
            Prisma.sql`SELECT ${select} FROM ${from} WHERE ${match} AND s.deleted_at IS NULL`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบรอบตรวจนับ');
        row.lines = await query<StockCountLineRow>(
          tx,
          Prisma.sql`SELECT l.id,l.lot_id AS "lotId",p.code AS "productCode",p.name AS "productName",p.unit,pl.lot_number AS "lotNumber",r.code AS "receiptCode",pl.expires_on::text AS "expiresOn",l.system_quantity AS "systemQuantity",l.counted_quantity AS "countedQuantity",l.note FROM stock_count_lines l JOIN product_lots pl ON pl.id=l.lot_id JOIN products p ON p.id=pl.product_id JOIN stock_receipts r ON r.id=pl.receipt_id WHERE l.session_id=${row.id}::uuid ORDER BY p.name,pl.expires_on,l.id`,
        );
        return { data: row, actor };
      }
      const { offset, limit, search } = page(params),
        like = likeOf(search),
        status = params.get('status') ?? '';
      if (status && !STATUSES.includes(status)) throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      const where = Prisma.sql`s.deleted_at IS NULL AND (s.code ILIKE ${like} OR s.name ILIKE ${like}) ${status ? Prisma.sql`AND s.status=${status}` : Prisma.empty}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`s.code`,
          warehouseName: Prisma.sql`w.name`,
          createdAt: Prisma.sql`s.created_at`,
          status: Prisma.sql`s.status`,
        },
        Prisma.sql`s.created_at DESC`,
        Prisma.sql`s.id`,
      );
      const rows = await query<StockCountRow>(
        tx,
        Prisma.sql`SELECT ${select} FROM ${from} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${from} WHERE ${where}`,
      );
      const warehouses = await query<{ id: string; code: string; name: string }>(
        tx,
        Prisma.sql`SELECT id,code,name FROM warehouses WHERE code IN ('MAIN','MARKETING','DISPOSAL') ORDER BY code`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), warehouses, actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
