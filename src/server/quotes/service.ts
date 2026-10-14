import 'server-only';
// TASK-275: quotation workflow. Sales create → Manager approves (Admin-created quotes skip it);
// quotes never reserve stock; an approved, unexpired quote converts once into a sales order.
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { assertCustomerInScope, customerScope } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import {
  object,
  str,
  id,
  day,
  addDays,
  bangkokDay,
  requestedLines,
} from '@/server/operations/domain';
import {
  allow,
  command,
  createOrder,
  lockProducts,
  nextDocumentCode,
  page,
  pageResult,
  query,
  type Actor,
  type Tx,
} from '@/server/operations/service';
import { QUOTE_DISPLAY_STATUSES, QUOTE_VALID_DAYS } from '@/config/quotes';
import { evaluatePromotion, promotionIdOf } from '@/server/promotions/apply';
import type { QuoteLine, QuoteRow } from '@/types/api/quotes';

const Q = {
  pending: 'รออนุมัติ',
  returned: 'ส่งกลับแก้ไข',
  approved: 'อนุมัติ',
  rejected: 'ไม่อนุมัติ',
  cancelled: 'ยกเลิก',
} as const;
const open: string[] = [Q.pending, Q.returned, Q.approved];

const quoteFrom = Prisma.sql`quotations q LEFT JOIN customers c ON c.id=q.customer_id LEFT JOIN sales_territories t ON t.id=q.territory_id LEFT JOIN users m ON m.id=t.manager_id LEFT JOIN LATERAL (SELECT string_agg(u.name,', ' ORDER BY u.name,u.id) AS name FROM sales_territory_sales member JOIN users u ON u.id=member.user_id WHERE member.territory_id=t.id) s ON true LEFT JOIN users creator ON creator.id=q.created_by_id LEFT JOIN users approver ON approver.id=q.approved_by_id LEFT JOIN sales_orders so ON so.quotation_id=q.id`;
const displayStatus = (today: string) =>
  Prisma.sql`CASE WHEN q.workflow_managed AND q.status IN (${Prisma.join(open)}) AND so.id IS NULL AND q.valid_until<${today}::date THEN 'หมดอายุ' ELSE q.status END`;
const quoteSelect = (today: string) =>
  Prisma.sql`q.id,q.code,q.status,${displayStatus(today)} AS "displayStatus",q.customer_id AS "customerId",COALESCE(c.code,'') AS "customerCode",COALESCE(c.name,q.name,'-') AS "customerName",COALESCE(t.name,'-') AS "territoryName",COALESCE(s.name,'-') AS "salesName",COALESCE(m.name,'-') AS "managerName",COALESCE(creator.name,q.owner) AS "createdByName",q.created_by_id AS "createdById",COALESCE(approver.name,'-') AS "approvedByName",q.return_reason AS "returnReason",q.notes,COALESCE(q.amount,0)::text AS amount,q.valid_until::text AS "validUntil",q.created_at AS "createdAt",q.updated_at AS "updatedAt",q.workflow_managed AS "workflowManaged",so.id AS "orderId",so.code AS "orderCode",q.promotion_id AS "promotionId",q.promotion_snapshot AS "promotion",q.bill_discount::text AS "billDiscount"`;

function validUntil(value: unknown) {
  if (value === undefined || value === null || value === '')
    return addDays(bangkokDay(), QUOTE_VALID_DAYS);
  const v = day(value);
  if (v < bangkokDay()) throw new RecordError(400, 'วันที่ใช้ได้ถึงต้องไม่ก่อนวันนี้');
  return v;
}
function reasonOf(value: unknown) {
  return str(value, 'เหตุผล', true, 1000);
}

// Prices are locked when a line is written; products already on the quote keep their price.
async function writeLines(
  tx: Tx,
  quoteId: string,
  lines: ReturnType<typeof requestedLines>,
  locked: Map<string, string>,
) {
  let total = new Prisma.Decimal(0);
  for (const line of lines) {
    const product = (
      await query<{ id: string; name: string; price: string }>(
        tx,
        Prisma.sql`SELECT id,name,sale_price::text AS price FROM products WHERE id=${line.productId}::uuid AND deleted_at IS NULL AND status='ACTIVE' FOR KEY SHARE`,
      )
    )[0];
    if (!product) throw new RecordError(400, 'สินค้าไม่พร้อมขาย');
    const price = new Prisma.Decimal(locked.get(line.productId) ?? product.price),
      discount = new Prisma.Decimal(line.discount);
    if (discount.gt(price.mul(line.quantity)))
      throw new RecordError(400, `ส่วนลด ${product.name} เกินราคารวมของรายการ`);
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO quotation_lines(id,quotation_id,product_id,product_name,quantity,unit_price,discount) VALUES(${randomUUID()}::uuid,${quoteId}::uuid,${product.id}::uuid,${product.name},${line.quantity},${price.toFixed(2)}::numeric,${discount.toFixed(2)}::numeric)`,
    );
    total = total.add(price.mul(line.quantity)).sub(discount);
  }
  return total.toFixed(2);
}

async function applyQuotePromotion(
  tx: Tx,
  quoteId: string,
  paidTotal: string,
  promotionId: string | null,
) {
  const lines = await query<{
    productId: string;
    quantity: number;
    unitPrice: string;
    discount: string;
  }>(
    tx,
    Prisma.sql`SELECT product_id AS "productId",quantity,unit_price::text AS "unitPrice",discount::text AS discount FROM quotation_lines WHERE quotation_id=${quoteId}::uuid AND NOT is_gift`,
  );
  const applied = promotionId ? await evaluatePromotion(tx, promotionId, lines) : null;
  for (const gift of applied?.gifts ?? [])
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO quotation_lines(id,quotation_id,product_id,product_name,quantity,unit_price,discount,is_gift,warehouse_id) VALUES(${randomUUID()}::uuid,${quoteId}::uuid,${gift.productId}::uuid,${gift.productName},${gift.quantity},0,0,true,${gift.warehouseId}::uuid)`,
    );
  const discount = new Prisma.Decimal(applied?.billDiscount ?? '0');
  const amount = Prisma.Decimal.max(new Prisma.Decimal(paidTotal).sub(discount), 0).toFixed(2);
  await tx.$executeRaw(
    Prisma.sql`UPDATE quotations SET amount=${amount}::numeric,promotion_id=${applied?.promotionId ?? null}::uuid,promotion_snapshot=${applied ? JSON.stringify(applied.snapshot) : null}::jsonb,bill_discount=${discount.toFixed(2)}::numeric WHERE id=${quoteId}::uuid`,
  );
  return amount;
}

export async function quoteWrite(actor: Actor, raw: unknown, quoteId?: string) {
  const b = object(raw),
    action = quoteId ? str(b.action, 'คำสั่ง') : 'create';
  const roles: Record<string, string[]> = {
    create: ['SALES', 'ADMIN'],
    edit: ['SALES', 'MANAGER', 'ADMIN'],
    approve: ['MANAGER'],
    reject: ['MANAGER'],
    return: ['MANAGER', 'ADMIN'],
    cancel: ['SALES', 'MANAGER', 'ADMIN'],
    convert: ['SALES', 'ADMIN'],
  };
  allow(actor, roles[action] ?? []);
  return command(actor, b, `quotes.${action}`, async (tx) => {
    const today = bangkokDay();
    if (action === 'create') {
      const lines = requestedLines(b.lines),
        customerId = id(b.customerId, 'ลูกค้า');
      await lockProducts(
        tx,
        lines.map((line) => line.productId),
      );
      const customer = (
        await query<{ territoryId: string | null; name: string }>(
          tx,
          Prisma.sql`SELECT territory_id AS "territoryId",name FROM customers WHERE id=${customerId}::uuid AND deleted_at IS NULL FOR KEY SHARE`,
        )
      )[0];
      if (!customer) throw new RecordError(400, 'ไม่พบลูกค้า');
      await assertCustomerInScope(tx, actor, customerId);
      const newId = randomUUID(),
        code = await nextDocumentCode(tx, 'QT'),
        admin = actor.roleId === 'ADMIN',
        status = admin ? Q.approved : Q.pending;
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO quotations(id,code,name,status,customer_id,territory_id,owner,notes,workflow_managed,valid_until,created_by_id,approved_by_id) VALUES(${newId}::uuid,${code},${customer.name},${status},${customerId}::uuid,${customer.territoryId}::uuid,${actor.name},${str(b.notes, 'หมายเหตุ', false)},true,${validUntil(b.validUntil)}::date,${actor.id}::uuid,${admin ? actor.id : null}::uuid)`,
      );
      const paidTotal = await writeLines(tx, newId, lines, new Map());
      await applyQuotePromotion(tx, newId, paidTotal, promotionIdOf(b.promotionId));
      return { data: { id: newId, code, status } };
    }
    const qid = id(quoteId);
    const before = (
      await query<{
        status: string;
        workflowManaged: boolean;
        updatedAt: Date;
        createdById: string | null;
        approvedById: string | null;
        customerId: string | null;
        validUntil: string | null;
        notes: string;
        orderId: string | null;
        promotionId: string | null;
        promotionSnapshot: Record<string, unknown> | null;
        billDiscount: string;
      }>(
        tx,
        Prisma.sql`SELECT q.status,q.workflow_managed AS "workflowManaged",q.updated_at AS "updatedAt",q.created_by_id AS "createdById",q.approved_by_id AS "approvedById",q.customer_id AS "customerId",q.valid_until::text AS "validUntil",q.notes,q.promotion_id AS "promotionId",q.promotion_snapshot AS "promotionSnapshot",q.bill_discount::text AS "billDiscount",(SELECT so.id FROM sales_orders so WHERE so.quotation_id=q.id) AS "orderId" FROM quotations q WHERE q.id=${qid}::uuid AND q.deleted_at IS NULL FOR UPDATE OF q`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบใบเสนอราคา');
    if (!before.workflowManaged)
      throw new RecordError(409, 'ใบเสนอราคาเดิมไม่มีรายการสินค้า ดำเนินการต่อไม่ได้');
    if (
      b.expectedUpdatedAt !== undefined &&
      String(b.expectedUpdatedAt) !== before.updatedAt.toISOString()
    )
      throw new RecordError(409, 'เอกสารถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    if (before.orderId) throw new RecordError(409, 'ใบเสนอราคานี้สร้างคำสั่งซื้อแล้ว');
    if (!open.includes(before.status))
      throw new RecordError(409, 'ใบเสนอราคาไม่อนุมัติหรือยกเลิกแล้ว');
    const isCreator = before.createdById === actor.id;
    if (actor.roleId === 'SALES' && !isCreator)
      throw new RecordError(403, 'Sales ดำเนินการได้เฉพาะใบที่สร้างเอง');
    const expired = (before.validUntil ?? '') < today;
    const setStatus = (status: string, extra = Prisma.empty) =>
      tx.$executeRaw(
        Prisma.sql`UPDATE quotations SET status=${status}${extra},updated_at=clock_timestamp() WHERE id=${qid}::uuid`,
      );

    if (action === 'edit') {
      if (actor.roleId === 'SALES' && before.status === Q.approved)
        throw new RecordError(409, 'ใบเสนอราคาอนุมัติแล้ว ต้องส่งกลับก่อนแก้');
      const lines = requestedLines(b.lines);
      const oldLines = await query<{ productId: string; unitPrice: string }>(
        tx,
        Prisma.sql`SELECT product_id AS "productId",unit_price::text AS "unitPrice" FROM quotation_lines WHERE quotation_id=${qid}::uuid AND NOT is_gift`,
      );
      await lockProducts(
        tx,
        [...oldLines, ...lines].map((line) => line.productId),
      );
      await tx.$executeRaw(Prisma.sql`DELETE FROM quotation_lines WHERE quotation_id=${qid}::uuid`);
      const paidTotal = await writeLines(
        tx,
        qid,
        lines,
        new Map(oldLines.map((line) => [line.productId, line.unitPrice])),
      );
      const amount = await applyQuotePromotion(
        tx,
        qid,
        paidTotal,
        b.promotionId === undefined ? before.promotionId : promotionIdOf(b.promotionId),
      );
      // Any edit needs a fresh Manager approval, except Admin who skips that step.
      const admin = actor.roleId === 'ADMIN';
      await setStatus(
        admin ? Q.approved : Q.pending,
        Prisma.sql`,approved_by_id=${admin ? actor.id : null}::uuid,return_reason='',amount=${amount}::numeric,notes=${str(b.notes, 'หมายเหตุ', false)},valid_until=${b.validUntil === undefined ? (before.validUntil ?? addDays(today, QUOTE_VALID_DAYS)) : validUntil(b.validUntil)}::date`,
      );
      return { data: { id: qid, status: admin ? Q.approved : Q.pending } };
    }
    if (action === 'approve') {
      if (![Q.pending, Q.returned].includes(before.status as typeof Q.pending))
        throw new RecordError(409, 'สถานะนี้อนุมัติไม่ได้');
      if (expired) throw new RecordError(409, 'ใบเสนอราคาหมดอายุแล้ว กรุณาแก้วันที่ใช้ได้ถึง');
      await setStatus(Q.approved, Prisma.sql`,approved_by_id=${actor.id}::uuid,return_reason=''`);
      return { data: { id: qid, status: Q.approved } };
    }
    if (action === 'reject') {
      if (![Q.pending, Q.returned].includes(before.status as typeof Q.pending))
        throw new RecordError(409, 'สถานะนี้ไม่อนุมัติไม่ได้');
      const reason = reasonOf(b.reason);
      await setStatus(Q.rejected, Prisma.sql`,approved_by_id=NULL,return_reason=${reason}`);
      return { data: { id: qid, status: Q.rejected, reason } };
    }
    if (action === 'return') {
      if (before.status === Q.returned) throw new RecordError(409, 'ส่งกลับแก้ไขอยู่แล้ว');
      const reason = reasonOf(b.reason);
      await setStatus(Q.returned, Prisma.sql`,approved_by_id=NULL,return_reason=${reason}`);
      return { data: { id: qid, status: Q.returned, reason } };
    }
    if (action === 'cancel') {
      const reason = reasonOf(b.reason);
      await setStatus(Q.cancelled, Prisma.sql`,return_reason=${reason}`);
      return { data: { id: qid, status: Q.cancelled, reason } };
    }
    if (action === 'convert') {
      if (before.status !== Q.approved)
        throw new RecordError(409, 'ต้องเป็นใบเสนอราคาที่อนุมัติแล้ว');
      if (expired) throw new RecordError(409, 'ใบเสนอราคาหมดอายุแล้ว สร้างคำสั่งซื้อไม่ได้');
      const lines = await query<{
        productId: string;
        quantity: number;
        unitPrice: string;
        discount: string;
        isGift: boolean;
        warehouseId: string | null;
        productName: string;
      }>(
        tx,
        Prisma.sql`SELECT product_id AS "productId",product_name AS "productName",quantity,unit_price::text AS "unitPrice",discount::text AS discount,is_gift AS "isGift",warehouse_id AS "warehouseId" FROM quotation_lines WHERE quotation_id=${qid}::uuid ORDER BY product_name,id`,
      );
      const order = await createOrder(tx, actor, {
        customerId: before.customerId!,
        notes: before.notes,
        lines: lines
          .filter((line) => !line.isGift)
          .map(({ productId, quantity, unitPrice, discount }) => ({
            productId,
            quantity,
            unitPrice,
            discount,
          })),
        promotion: before.promotionId
          ? {
              promotionId: before.promotionId,
              snapshot: before.promotionSnapshot ?? {},
              billDiscount: before.billDiscount,
              gifts: lines
                .filter((line) => line.isGift)
                .map((line) => ({
                  productId: line.productId,
                  productName: line.productName,
                  quantity: line.quantity,
                  warehouseId: line.warehouseId!,
                })),
            }
          : null,
        quotationId: qid,
        // The order is the agreed quote, so it carries the quote approval (TASK-275 owner rule).
        approvedById: before.approvedById ?? actor.id,
      });
      await tx.$executeRaw(
        Prisma.sql`UPDATE quotations SET updated_at=clock_timestamp() WHERE id=${qid}::uuid`,
      );
      return { data: { id: qid, orderId: order.id, orderCode: order.code } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

export async function quoteRead(actor: Actor, params: URLSearchParams, quoteId?: string) {
  const today = bangkokDay();
  return getPrismaClient().$transaction(
    async (tx) => {
      if (quoteId) {
        const match = /^[0-9a-f-]{36}$/i.test(quoteId)
          ? Prisma.sql`q.id=${quoteId}::uuid OR q.code=${quoteId}`
          : Prisma.sql`q.code=${quoteId}`;
        const row = (
          await query<QuoteRow>(
            tx,
            Prisma.sql`SELECT ${quoteSelect(today)} FROM ${quoteFrom} WHERE (${match}) AND q.deleted_at IS NULL ${customerScope(actor, Prisma.sql`q.customer_id`)}`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบใบเสนอราคา');
        row.lines = await query<QuoteLine>(
          tx,
          Prisma.sql`SELECT li.id,li.product_id AS "productId",COALESCE(p.code,'') AS "productCode",li.product_name AS "productName",COALESCE(p.unit,'') AS unit,li.quantity,li.unit_price::text AS "unitPrice",li.discount::text AS discount,li.is_gift AS "isGift" FROM quotation_lines li LEFT JOIN products p ON p.id=li.product_id WHERE li.quotation_id=${row.id}::uuid ORDER BY li.is_gift,li.product_name,li.id`,
        );
        return { data: row, actor };
      }
      const { offset, limit, search } = page(params),
        like = '%' + search.replace(/[\\%_]/g, '\\$&') + '%',
        status = params.get('status') ?? '';
      if (status && !(QUOTE_DISPLAY_STATUSES as readonly string[]).includes(status))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      const where = Prisma.sql`q.deleted_at IS NULL AND (q.code ILIKE ${like} OR c.name ILIKE ${like} OR c.code ILIKE ${like}) ${status ? Prisma.sql`AND ${displayStatus(today)}=${status}` : Prisma.empty} ${customerScope(actor, Prisma.sql`q.customer_id`)}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`q.code`,
          customerName: Prisma.sql`c.name`,
          territoryName: Prisma.sql`t.name`,
          validUntil: Prisma.sql`q.valid_until`,
          amount: Prisma.sql`q.amount`,
          status: displayStatus(today),
        },
        Prisma.sql`q.created_at DESC,q.id`,
        Prisma.sql`q.id`,
      );
      const rows = await query<QuoteRow>(
        tx,
        Prisma.sql`SELECT ${quoteSelect(today)} FROM ${quoteFrom} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${quoteFrom} WHERE ${where}`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
