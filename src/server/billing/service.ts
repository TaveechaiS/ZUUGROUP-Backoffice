import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { customerScope } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { object, str, id, day, bangkokDay, addDays } from '@/server/operations/domain';
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
import { INVOICE_STATUSES, PAYMENT_METHODS } from '@/config/billing';
import type { InvoicePaymentRow, InvoiceRow, UninvoicedOrder } from '@/types/api/billing';

export const BILLING_WRITERS = ['ADMIN', 'ACCOUNTING_CFO'];

function money(value: unknown, label: string) {
  const v = String(value ?? '');
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(v) || Number(v) <= 0)
    throw new RecordError(400, `${label}ต้องมากกว่า 0 และทศนิยมไม่เกิน 2 หลัก`);
  return v;
}
const paidSql = (invoice: Prisma.Sql) =>
  Prisma.sql`COALESCE((SELECT sum(p.amount) FROM invoice_payments p WHERE p.invoice_id=${invoice} AND p.voided_at IS NULL),0)`;
const displayStatus = (today: string) =>
  Prisma.sql`CASE WHEN i.status IN ('ค้างชำระ','ชำระบางส่วน') AND i.due_date<${today}::date THEN 'เกินกำหนด' ELSE i.status END`;
const uuidOrCode = (value: string) =>
  /^[0-9a-f-]{36}$/i.test(value)
    ? Prisma.sql`(i.id=${value}::uuid OR i.code=${value})`
    : Prisma.sql`i.code=${value}`;

async function refreshStatus(tx: Tx, invoiceId: string) {
  await tx.$executeRaw(
    Prisma.sql`UPDATE invoices i SET status=CASE WHEN t.paid=0 THEN 'ค้างชำระ' WHEN t.paid>=i.amount THEN 'ชำระครบ' ELSE 'ชำระบางส่วน' END,updated_at=clock_timestamp() FROM (SELECT ${paidSql(Prisma.sql`${invoiceId}::uuid`)} AS paid) t WHERE i.id=${invoiceId}::uuid`,
  );
}

export async function billingWrite(actor: Actor, raw: unknown, invoiceId?: string) {
  const b = object(raw),
    action = invoiceId ? str(b.action, 'คำสั่ง') : 'create';
  allow(actor, BILLING_WRITERS);
  return command(actor, b, `billing.${action}`, async (tx) => {
    if (action === 'create') {
      const orderId = id(b.salesOrderId, 'คำสั่งซื้อ');
      const issueDate =
        b.issueDate === undefined || b.issueDate === '' ? bangkokDay() : day(b.issueDate);
      if (issueDate > bangkokDay()) throw new RecordError(400, 'วันที่ออกต้องไม่เกินวันนี้');
      const order = (
        await query<{ customerId: string; amount: string; days: number; code: string }>(
          tx,
          Prisma.sql`SELECT o.customer_id AS "customerId",COALESCE(o.amount,0)::text AS amount,o.code,COALESCE(c.credit_days,t.days,0)::int AS days FROM sales_orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN customer_options t ON t.id=c.credit_term_id WHERE o.id=${orderId}::uuid AND o.deleted_at IS NULL AND o.workflow_managed AND o.status='เสร็จสิ้น' FOR UPDATE OF o`,
        )
      )[0];
      if (!order) throw new RecordError(400, 'วางบิลได้เฉพาะคำสั่งซื้อที่เสร็จสิ้นแล้ว');
      const existing = await query<{ code: string }>(
        tx,
        Prisma.sql`SELECT code FROM invoices WHERE sales_order_id=${orderId}::uuid AND status<>'ยกเลิก' AND deleted_at IS NULL`,
      );
      if (existing[0]) throw new RecordError(409, `คำสั่งซื้อนี้วางบิลแล้ว (${existing[0].code})`);
      const newId = randomUUID(),
        code = await nextDocumentCode(tx, 'INV'),
        dueDate = addDays(issueDate, order.days);
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO invoices(id,code,name,status,customer_id,sales_order_id,issue_date,due_date,amount,notes,owner,created_by_id) VALUES(${newId}::uuid,${code},${order.code},'ค้างชำระ',${order.customerId}::uuid,${orderId}::uuid,${issueDate}::date,${dueDate}::date,${order.amount}::numeric,${str(b.notes, 'หมายเหตุ', false)},${actor.name},${actor.id}::uuid)`,
      );
      return { data: { id: newId, code, dueDate } };
    }
    const iid = id(invoiceId);
    const before = (
      await query<{ status: string; updatedAt: Date; amount: string; paid: string }>(
        tx,
        Prisma.sql`SELECT i.status,i.updated_at AS "updatedAt",i.amount::text AS amount,${paidSql(Prisma.sql`i.id`)}::text AS paid FROM invoices i WHERE i.id=${iid}::uuid AND i.deleted_at IS NULL FOR UPDATE`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบใบแจ้งหนี้');
    if (
      b.expectedUpdatedAt !== undefined &&
      String(b.expectedUpdatedAt) !== before.updatedAt.toISOString()
    )
      throw new RecordError(409, 'ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    if (before.status === 'ยกเลิก') throw new RecordError(409, 'ใบแจ้งหนี้ถูกยกเลิกแล้ว');
    if (action === 'pay') {
      const amount = new Prisma.Decimal(money(b.amount, 'จำนวนเงิน'));
      const outstanding = new Prisma.Decimal(before.amount).sub(before.paid);
      if (amount.gt(outstanding))
        throw new RecordError(409, `รับชำระเกินยอดค้าง (ค้าง ${outstanding.toFixed(2)})`);
      const paidOn = day(b.paidOn);
      if (paidOn > bangkokDay()) throw new RecordError(400, 'วันที่รับชำระต้องไม่เกินวันนี้');
      const method = str(b.method, 'วิธีชำระ');
      if (!(PAYMENT_METHODS as readonly string[]).includes(method))
        throw new RecordError(400, 'วิธีชำระไม่ถูกต้อง');
      const paymentId = randomUUID();
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO invoice_payments(id,invoice_id,paid_on,amount,method,reference,notes,created_by_id) VALUES(${paymentId}::uuid,${iid}::uuid,${paidOn}::date,${amount.toFixed(2)}::numeric,${method},${str(b.reference, 'เลขอ้างอิง', false, 200)},${str(b.notes, 'หมายเหตุ', false)},${actor.id}::uuid)`,
      );
      await refreshStatus(tx, iid);
      return { data: { id: iid, paymentId } };
    }
    if (action === 'void-payment') {
      const paymentId = id(b.paymentId, 'รายการรับชำระ');
      const reason = str(b.reason, 'เหตุผล');
      const voided = await tx.$executeRaw(
        Prisma.sql`UPDATE invoice_payments SET voided_at=clock_timestamp(),void_reason=${reason} WHERE id=${paymentId}::uuid AND invoice_id=${iid}::uuid AND voided_at IS NULL`,
      );
      if (!voided) throw new RecordError(404, 'ไม่พบรายการรับชำระที่ยังใช้งาน');
      await refreshStatus(tx, iid);
      return { data: { id: iid, paymentId } };
    }
    if (action === 'cancel') {
      const reason = str(b.reason, 'เหตุผล');
      if (Number(before.paid) > 0)
        throw new RecordError(409, 'มีรายการรับชำระแล้ว ยกเลิกรายการรับชำระก่อน');
      await tx.$executeRaw(
        Prisma.sql`UPDATE invoices SET status='ยกเลิก',cancel_reason=${reason},updated_at=clock_timestamp() WHERE id=${iid}::uuid`,
      );
      return { data: { id: iid, status: 'ยกเลิก', reason } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

const invoiceFrom = Prisma.sql`invoices i JOIN customers c ON c.id=i.customer_id JOIN sales_orders o ON o.id=i.sales_order_id LEFT JOIN users u ON u.id=i.created_by_id`;
const invoiceSelect = (today: string) =>
  Prisma.sql`i.id,i.code,${displayStatus(today)} AS status,i.status AS "savedStatus",i.customer_id AS "customerId",c.code AS "customerCode",c.name AS "customerName",i.sales_order_id AS "salesOrderId",o.code AS "salesOrderCode",i.issue_date::text AS "issueDate",i.due_date::text AS "dueDate",i.amount::text AS amount,${paidSql(Prisma.sql`i.id`)}::numeric(14,2)::text AS paid,(i.amount-${paidSql(Prisma.sql`i.id`)})::numeric(14,2)::text AS outstanding,(${today}::date-i.due_date)::int AS "daysOverdue",i.notes,i.cancel_reason AS "cancelReason",COALESCE(u.name,i.owner) AS "createdByName",i.created_at AS "createdAt",i.updated_at AS "updatedAt"`;

export async function billingRead(actor: Actor, params: URLSearchParams, invoiceId?: string) {
  const today = bangkokDay();
  return getPrismaClient().$transaction(
    async (tx) => {
      if (invoiceId) {
        const row = (
          await query<InvoiceRow>(
            tx,
            Prisma.sql`SELECT ${invoiceSelect(today)} FROM ${invoiceFrom} WHERE ${uuidOrCode(invoiceId)} AND i.deleted_at IS NULL ${customerScope(actor, Prisma.sql`i.customer_id`)}`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบใบแจ้งหนี้');
        row.payments = await query<InvoicePaymentRow>(
          tx,
          Prisma.sql`SELECT p.id,p.paid_on::text AS "paidOn",p.amount::text AS amount,p.method,p.reference,p.notes,u.name AS "createdByName",p.created_at AS "createdAt",p.voided_at AS "voidedAt",p.void_reason AS "voidReason" FROM invoice_payments p JOIN users u ON u.id=p.created_by_id WHERE p.invoice_id=${row.id}::uuid ORDER BY p.paid_on,p.created_at`,
        );
        return { data: row, actor };
      }
      if (params.get('view') === 'uninvoiced') {
        const data = await query<UninvoicedOrder>(
          tx,
          Prisma.sql`SELECT o.id,o.code,c.name AS "customerName",COALESCE(o.amount,0)::text AS amount,COALESCE(c.credit_days,t.days,0)::int AS "creditDays" FROM sales_orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN customer_options t ON t.id=c.credit_term_id WHERE o.deleted_at IS NULL AND o.workflow_managed AND o.status='เสร็จสิ้น' AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.sales_order_id=o.id AND i.status<>'ยกเลิก' AND i.deleted_at IS NULL) ORDER BY o.code DESC LIMIT 200`,
        );
        return { data, actor };
      }
      const { offset, limit, search } = page(params),
        like = likeOf(search),
        status = params.get('status') ?? '';
      if (status && !(INVOICE_STATUSES as readonly string[]).includes(status))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      const where = Prisma.sql`i.deleted_at IS NULL AND (i.code ILIKE ${like} OR o.code ILIKE ${like} OR c.name ILIKE ${like} OR c.code ILIKE ${like}) ${status ? Prisma.sql`AND ${displayStatus(today)}=${status}` : Prisma.empty} ${customerScope(actor, Prisma.sql`i.customer_id`)}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`i.code`,
          customerName: Prisma.sql`c.name`,
          issueDate: Prisma.sql`i.issue_date`,
          dueDate: Prisma.sql`i.due_date`,
          amount: Prisma.sql`i.amount`,
          outstanding: Prisma.sql`i.amount-${paidSql(Prisma.sql`i.id`)}`,
          status: displayStatus(today),
        },
        Prisma.sql`i.created_at DESC`,
        Prisma.sql`i.id`,
      );
      const rows = await query<InvoiceRow>(
        tx,
        Prisma.sql`SELECT ${invoiceSelect(today)} FROM ${invoiceFrom} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const totals = await query<{ total: number; outstanding: string }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total,COALESCE(sum(i.amount-${paidSql(Prisma.sql`i.id`)}) FILTER (WHERE i.status<>'ยกเลิก'),0)::numeric(14,2)::text AS outstanding FROM ${invoiceFrom} WHERE ${where}`,
      );
      return {
        ...pageResult(rows, totals[0].total, offset, limit),
        totalOutstanding: totals[0].outstanding,
        actor,
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
