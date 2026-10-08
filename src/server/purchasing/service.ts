import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { object, str, id, qty, cost, discount, day, bangkokDay } from '@/server/operations/domain';
import {
  allow,
  command,
  lockProducts,
  nextDocumentCode,
  openPurchaseLineFrom,
  openPurchaseLineSelect,
  page,
  pageResult,
  query,
  receivedOnLine,
  type Actor,
  type Tx,
} from '@/server/operations/service';
import {
  PAYMENT_TERMS,
  PURCHASE_STATUSES,
  SUPPLIER_FILTERS,
  SUPPLIER_STATUSES,
} from '@/config/purchasing';
import type {
  OpenPurchaseLine,
  PurchaseLine,
  PurchaseReceipt,
  PurchaseRow,
  SupplierOption,
  SupplierRow,
} from '@/types/api/purchasing';

const P = {
  waiting: 'รอรับสินค้า',
  partial: 'รับบางส่วน',
  closed: 'ปิดแล้ว',
  cancelled: 'ยกเลิก',
} as const;

function optional(value: unknown, label: string, max = 1000) {
  return str(value, label, false, max);
}
function oneOf<T extends readonly string[]>(value: unknown, list: T, label: string): T[number] {
  const v = str(value, label);
  if (!(list as readonly string[]).includes(v)) throw new RecordError(400, `${label}ไม่ถูกต้อง`);
  return v;
}
function stale(body: Record<string, unknown>, updatedAt: Date) {
  if (
    body.expectedUpdatedAt !== undefined &&
    String(body.expectedUpdatedAt) !== updatedAt.toISOString()
  )
    throw new RecordError(409, 'ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
}
const uuidOrCode = (alias: Prisma.Sql, value: string) =>
  /^[0-9a-f-]{36}$/i.test(value)
    ? Prisma.sql`(${alias}.id=${value}::uuid OR ${alias}.code=${value})`
    : Prisma.sql`${alias}.code=${value}`;
const likeOf = (search: string) => '%' + search.replace(/[\\%_]/g, '\\$&') + '%';

function supplierFields(b: Record<string, unknown>) {
  const taxId = optional(b.taxId, 'เลขประจำตัวผู้เสียภาษี', 13);
  if (taxId && !/^\d{13}$/.test(taxId))
    throw new RecordError(400, 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');
  const email = optional(b.email, 'อีเมล', 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new RecordError(400, 'อีเมลไม่ถูกต้อง');
  return {
    name: str(b.name, 'ชื่อผู้ขาย', true, 200),
    taxId,
    address: optional(b.address, 'ที่อยู่'),
    contact: optional(b.contact, 'ผู้ติดต่อ', 200),
    phone: optional(b.phone, 'เบอร์โทร', 50),
    email,
    paymentTerms: oneOf(b.paymentTerms ?? 'เงินสด', PAYMENT_TERMS, 'เงื่อนไขชำระเงิน'),
    status: oneOf(b.status ?? 'ใช้งาน', SUPPLIER_STATUSES, 'สถานะ'),
    notes: optional(b.notes, 'หมายเหตุ'),
  };
}

async function nextSupplierCode(tx: Tx) {
  await tx.$queryRaw(Prisma.sql`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended('SUP-',2))`);
  const rows = await query<{ value: number }>(
    tx,
    Prisma.sql`SELECT COALESCE(MAX(substring(code FROM 5::int)::int),0)+1 AS value FROM suppliers WHERE code ~ '^SUP-[0-9]{4,6}$'`,
  );
  if (rows[0].value > 999999) throw new RecordError(409, 'รหัสผู้ขายครบจำนวนแล้ว');
  return 'SUP-' + String(rows[0].value).padStart(4, '0');
}

export async function supplierWrite(actor: Actor, raw: unknown, supplierId?: string) {
  const b = object(raw),
    action = supplierId ? str(b.action, 'คำสั่ง') : 'create';
  allow(actor, ['ADMIN']);
  return command(actor, b, `suppliers.${action}`, async (tx) => {
    if (action === 'create') {
      const f = supplierFields(b),
        newId = randomUUID(),
        code = await nextSupplierCode(tx);
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO suppliers(id,code,name,status,tax_id,address,contact,phone,email,payment_terms,notes,created_by_id) VALUES(${newId}::uuid,${code},${f.name},${f.status},${f.taxId},${f.address},${f.contact},${f.phone},${f.email},${f.paymentTerms},${f.notes},${actor.id}::uuid)`,
      );
      return { data: { id: newId, code } };
    }
    const sid = id(supplierId);
    const before = (
      await query<{ updatedAt: Date; deletedAt: Date | null }>(
        tx,
        Prisma.sql`SELECT updated_at AS "updatedAt",deleted_at AS "deletedAt" FROM suppliers WHERE id=${sid}::uuid FOR UPDATE`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบผู้ขาย');
    stale(b, before.updatedAt);
    if (action === 'edit') {
      if (before.deletedAt) throw new RecordError(409, 'ผู้ขายถูกลบแล้ว กู้คืนก่อนแก้ไข');
      const f = supplierFields(b);
      await tx.$executeRaw(
        Prisma.sql`UPDATE suppliers SET name=${f.name},status=${f.status},tax_id=${f.taxId},address=${f.address},contact=${f.contact},phone=${f.phone},email=${f.email},payment_terms=${f.paymentTerms},notes=${f.notes},updated_at=clock_timestamp() WHERE id=${sid}::uuid`,
      );
      return { data: { id: sid } };
    }
    if (action === 'delete') {
      if (before.deletedAt) throw new RecordError(409, 'ผู้ขายถูกลบอยู่แล้ว');
      const reason = str(b.reason, 'เหตุผล');
      await tx.$executeRaw(
        Prisma.sql`UPDATE suppliers SET deleted_at=clock_timestamp(),deleted_by_id=${actor.id}::uuid,delete_reason=${reason},updated_at=clock_timestamp() WHERE id=${sid}::uuid`,
      );
      return { data: { id: sid, reason } };
    }
    if (action === 'restore') {
      if (!before.deletedAt) throw new RecordError(409, 'ผู้ขายยังไม่ถูกลบ');
      await tx.$executeRaw(
        Prisma.sql`UPDATE suppliers SET deleted_at=NULL,deleted_by_id=NULL,delete_reason=NULL,updated_at=clock_timestamp() WHERE id=${sid}::uuid`,
      );
      return { data: { id: sid } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

const supplierSelect = Prisma.sql`s.id,s.code,s.name,s.status,s.tax_id AS "taxId",s.address,s.contact,s.phone,s.email,s.payment_terms AS "paymentTerms",s.notes,COALESCE(u.name,'-') AS "createdByName",s.created_at AS "createdAt",s.updated_at AS "updatedAt",s.deleted_at AS "deletedAt",s.delete_reason AS "deleteReason",(SELECT count(*)::int FROM purchase_orders po WHERE po.supplier_id=s.id AND po.deleted_at IS NULL) AS "purchaseCount",(SELECT count(*)::int FROM purchase_orders po WHERE po.supplier_id=s.id AND po.deleted_at IS NULL AND po.status IN ('รอรับสินค้า','รับบางส่วน')) AS "openPurchaseCount"`;
const supplierFrom = Prisma.sql`suppliers s LEFT JOIN users u ON u.id=s.created_by_id`;

export async function supplierRead(actor: Actor, params: URLSearchParams, supplierId?: string) {
  return getPrismaClient().$transaction(
    async (tx) => {
      if (supplierId) {
        const row = (
          await query<SupplierRow>(
            tx,
            Prisma.sql`SELECT ${supplierSelect} FROM ${supplierFrom} WHERE ${uuidOrCode(Prisma.sql`s`, supplierId)}`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบผู้ขาย');
        return { data: row, actor };
      }
      if (params.get('view') === 'options') {
        const data = await query<SupplierOption>(
          tx,
          Prisma.sql`SELECT id,code,name,payment_terms AS "paymentTerms" FROM suppliers WHERE deleted_at IS NULL AND status='ใช้งาน' ORDER BY name,id`,
        );
        return { data, actor };
      }
      const { offset, limit, search } = page(params),
        like = likeOf(search),
        status = params.get('status') ?? '';
      if (status && !(SUPPLIER_FILTERS as readonly string[]).includes(status))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      const state =
        status === 'ลบแล้ว'
          ? Prisma.sql`s.deleted_at IS NOT NULL`
          : status
            ? Prisma.sql`s.deleted_at IS NULL AND s.status=${status}`
            : Prisma.sql`s.deleted_at IS NULL`;
      const where = Prisma.sql`${state} AND (s.code ILIKE ${like} OR s.name ILIKE ${like} OR s.tax_id ILIKE ${like} OR s.contact ILIKE ${like} OR s.phone ILIKE ${like})`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`s.code`,
          name: Prisma.sql`s.name`,
          contact: Prisma.sql`s.contact`,
          paymentTerms: Prisma.sql`s.payment_terms`,
          status: Prisma.sql`s.status`,
        },
        Prisma.sql`s.code DESC,s.id`,
        Prisma.sql`s.id`,
      );
      const rows = await query<SupplierRow>(
        tx,
        Prisma.sql`SELECT ${supplierSelect} FROM ${supplierFrom} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${supplierFrom} WHERE ${where}`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

function purchaseLines(value: unknown) {
  if (!Array.isArray(value) || !value.length || value.length > 50)
    throw new RecordError(400, 'กรุณาเพิ่มสินค้า 1–50 รายการ');
  const lines = value.map((v) => {
    const b = object(v);
    return {
      productId: id(b.productId, 'สินค้า'),
      quantity: qty(b.quantity),
      unitCost: cost(b.unitCost),
      discount: discount(b.discount),
    };
  });
  if (new Set(lines.map((l) => l.productId)).size !== lines.length)
    throw new RecordError(400, 'สินค้าในเอกสารต้องไม่ซ้ำกัน');
  return lines;
}

async function activeSupplier(tx: Tx, supplierId: string) {
  const supplier = (
    await query<{ name: string }>(
      tx,
      Prisma.sql`SELECT name FROM suppliers WHERE id=${supplierId}::uuid AND deleted_at IS NULL AND status='ใช้งาน' FOR KEY SHARE`,
    )
  )[0];
  if (!supplier) throw new RecordError(400, 'ผู้ขายไม่พร้อมใช้งาน');
  return supplier;
}

function dates(b: Record<string, unknown>, fallbackOrderDate?: string) {
  const orderDate =
    b.orderDate === undefined || b.orderDate === ''
      ? (fallbackOrderDate ?? bangkokDay())
      : day(b.orderDate);
  if (orderDate > bangkokDay()) throw new RecordError(400, 'วันที่สั่งซื้อต้องไม่เกินวันนี้');
  const expectedOn =
    b.expectedOn === undefined || b.expectedOn === null || b.expectedOn === ''
      ? null
      : day(b.expectedOn);
  if (expectedOn && expectedOn < orderDate)
    throw new RecordError(400, 'วันที่คาดว่าจะได้รับต้องไม่ก่อนวันที่สั่งซื้อ');
  return { orderDate, expectedOn };
}

async function writeLines(tx: Tx, orderId: string, lines: ReturnType<typeof purchaseLines>) {
  let total = new Prisma.Decimal(0);
  for (const line of lines) {
    const product = (
      await query<{ id: string; name: string }>(
        tx,
        Prisma.sql`SELECT id,name FROM products WHERE id=${line.productId}::uuid AND deleted_at IS NULL AND status='ACTIVE' FOR KEY SHARE`,
      )
    )[0];
    if (!product) throw new RecordError(400, 'สินค้าไม่พร้อมสั่งซื้อ');
    const unitCost = new Prisma.Decimal(line.unitCost),
      lineDiscount = new Prisma.Decimal(line.discount);
    if (lineDiscount.gt(unitCost.mul(line.quantity)))
      throw new RecordError(400, `ส่วนลด ${product.name} เกินต้นทุนรวมของรายการ`);
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO purchase_order_lines(id,purchase_order_id,product_id,product_name,quantity,unit_cost,discount) VALUES(${randomUUID()}::uuid,${orderId}::uuid,${product.id}::uuid,${product.name},${line.quantity},${unitCost.toFixed(2)}::numeric,${lineDiscount.toFixed(2)}::numeric)`,
    );
    total = total.add(unitCost.mul(line.quantity)).sub(lineDiscount);
  }
  return total.toFixed(2);
}

export async function purchaseWrite(actor: Actor, raw: unknown, orderId?: string) {
  const b = object(raw),
    action = orderId ? str(b.action, 'คำสั่ง') : 'create';
  allow(actor, ['ADMIN']);
  return command(actor, b, `purchases.${action}`, async (tx) => {
    if (action === 'create') {
      const lines = purchaseLines(b.lines),
        supplierId = id(b.supplierId, 'ผู้ขาย'),
        supplier = await activeSupplier(tx, supplierId),
        { orderDate, expectedOn } = dates(b);
      await lockProducts(
        tx,
        lines.map((line) => line.productId),
      );
      const newId = randomUUID(),
        code = await nextDocumentCode(tx, 'PO');
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO purchase_orders(id,code,name,status,supplier_id,owner,notes,order_date,expected_on,created_by_id) VALUES(${newId}::uuid,${code},${supplier.name},${P.waiting},${supplierId}::uuid,${actor.name},${optional(b.notes, 'หมายเหตุ')},${orderDate}::date,${expectedOn}::date,${actor.id}::uuid)`,
      );
      const amount = await writeLines(tx, newId, lines);
      await tx.$executeRaw(
        Prisma.sql`UPDATE purchase_orders SET amount=${amount}::numeric WHERE id=${newId}::uuid`,
      );
      return { data: { id: newId, code, status: P.waiting } };
    }
    const pid = id(orderId);
    const before = (
      await query<{ status: string; updatedAt: Date; orderDate: string; received: number }>(
        tx,
        Prisma.sql`SELECT po.status,po.updated_at AS "updatedAt",po.order_date::text AS "orderDate",(SELECT count(*)::int FROM purchase_order_lines li JOIN stock_receipts r ON r.purchase_order_line_id=li.id WHERE li.purchase_order_id=po.id) AS received FROM purchase_orders po WHERE po.id=${pid}::uuid AND po.deleted_at IS NULL FOR UPDATE OF po`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบใบสั่งซื้อ');
    stale(b, before.updatedAt);
    if (![P.waiting, P.partial].includes(before.status as typeof P.waiting))
      throw new RecordError(409, 'ใบสั่งซื้อรับครบ ปิด หรือยกเลิกแล้ว');
    if (action === 'edit') {
      if (before.received)
        throw new RecordError(409, 'รับสินค้าแล้ว แก้ใบสั่งซื้อไม่ได้ ใช้ปิดใบแทน');
      const lines = purchaseLines(b.lines),
        supplierId = id(b.supplierId, 'ผู้ขาย'),
        supplier = await activeSupplier(tx, supplierId),
        { orderDate, expectedOn } = dates(b, before.orderDate);
      const oldLines = await query<{ productId: string }>(
        tx,
        Prisma.sql`SELECT product_id AS "productId" FROM purchase_order_lines WHERE purchase_order_id=${pid}::uuid`,
      );
      await lockProducts(
        tx,
        [...oldLines, ...lines].map((line) => line.productId),
      );
      await tx.$executeRaw(
        Prisma.sql`DELETE FROM purchase_order_lines WHERE purchase_order_id=${pid}::uuid`,
      );
      const amount = await writeLines(tx, pid, lines);
      await tx.$executeRaw(
        Prisma.sql`UPDATE purchase_orders SET supplier_id=${supplierId}::uuid,name=${supplier.name},order_date=${orderDate}::date,expected_on=${expectedOn}::date,notes=${optional(b.notes, 'หมายเหตุ')},amount=${amount}::numeric,updated_at=clock_timestamp() WHERE id=${pid}::uuid`,
      );
      return { data: { id: pid } };
    }
    if (action === 'close' || action === 'cancel') {
      const reason = str(b.reason, 'เหตุผล');
      if (action === 'cancel' && before.received)
        throw new RecordError(409, 'รับสินค้าแล้ว ยกเลิกไม่ได้ ใช้ปิดใบแทน');
      if (action === 'close' && !before.received)
        throw new RecordError(409, 'ยังไม่รับสินค้า ใช้ยกเลิกใบแทน');
      const status = action === 'cancel' ? P.cancelled : P.closed;
      await tx.$executeRaw(
        Prisma.sql`UPDATE purchase_orders SET status=${status},close_reason=${reason},updated_at=clock_timestamp() WHERE id=${pid}::uuid`,
      );
      return { data: { id: pid, status, reason } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

const totals = Prisma.sql`LEFT JOIN LATERAL (SELECT COALESCE(sum(li.quantity),0)::int AS ordered,COALESCE(sum(${receivedOnLine(Prisma.sql`li.id`)}),0)::int AS received FROM purchase_order_lines li WHERE li.purchase_order_id=po.id) t ON true`;
const purchaseFrom = Prisma.sql`purchase_orders po JOIN suppliers s ON s.id=po.supplier_id LEFT JOIN users u ON u.id=po.created_by_id ${totals}`;
const purchaseSelect = Prisma.sql`po.id,po.code,po.status,po.supplier_id AS "supplierId",s.code AS "supplierCode",s.name AS "supplierName",s.payment_terms AS "paymentTerms",po.order_date::text AS "orderDate",po.expected_on::text AS "expectedOn",COALESCE(po.amount,0)::text AS amount,t.ordered,t.received,po.notes,po.close_reason AS "closeReason",COALESCE(u.name,po.owner) AS "createdByName",po.created_at AS "createdAt",po.updated_at AS "updatedAt"`;

export async function purchaseRead(actor: Actor, params: URLSearchParams, orderId?: string) {
  return getPrismaClient().$transaction(
    async (tx) => {
      if (orderId) {
        const row = (
          await query<PurchaseRow>(
            tx,
            Prisma.sql`SELECT ${purchaseSelect} FROM ${purchaseFrom} WHERE ${uuidOrCode(Prisma.sql`po`, orderId)} AND po.deleted_at IS NULL`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบใบสั่งซื้อ');
        row.lines = await query<PurchaseLine>(
          tx,
          Prisma.sql`SELECT li.id,li.product_id AS "productId",COALESCE(p.code,'') AS "productCode",li.product_name AS "productName",COALESCE(p.unit,'') AS unit,li.quantity,li.unit_cost::text AS "unitCost",li.discount::text AS discount,${receivedOnLine(Prisma.sql`li.id`)} AS received,(li.quantity-${receivedOnLine(Prisma.sql`li.id`)}) AS remaining FROM purchase_order_lines li LEFT JOIN products p ON p.id=li.product_id WHERE li.purchase_order_id=${row.id}::uuid ORDER BY li.product_name,li.id`,
        );
        row.receipts = await query<PurchaseReceipt>(
          tx,
          Prisma.sql`SELECT r.id,r.code,l.id AS "lotId",li.id AS "lineId",li.product_name AS "productName",COALESCE(p.unit,'') AS unit,l.received_quantity AS quantity,l.total_cost::text AS "totalCost",COALESCE((SELECT w.name FROM stock_movements m JOIN warehouses w ON w.id=m.warehouse_id WHERE m.source_id=r.id AND m.kind='รับเข้า' ORDER BY m.occurred_at LIMIT 1),'-') AS "warehouseName",ac.name AS "actorName",r.created_at AS "createdAt" FROM stock_receipts r JOIN purchase_order_lines li ON li.id=r.purchase_order_line_id JOIN product_lots l ON l.receipt_id=r.id LEFT JOIN products p ON p.id=li.product_id JOIN users ac ON ac.id=r.actor_user_id WHERE li.purchase_order_id=${row.id}::uuid ORDER BY r.created_at,r.code`,
        );
        return { data: row, actor };
      }
      if (params.get('view') === 'open-lines') {
        const data = await query<OpenPurchaseLine>(
          tx,
          Prisma.sql`SELECT * FROM (SELECT ${openPurchaseLineSelect} FROM ${openPurchaseLineFrom} WHERE po.deleted_at IS NULL AND po.status IN ('รอรับสินค้า','รับบางส่วน')) x WHERE x.remaining>0 ORDER BY x."purchaseOrderCode",x."productName",x.id`,
        );
        return { data, actor };
      }
      const { offset, limit, search } = page(params),
        like = likeOf(search),
        status = params.get('status') ?? '',
        supplierId = params.get('supplierId') ?? '';
      if (status && !(PURCHASE_STATUSES as readonly string[]).includes(status))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      const where = Prisma.sql`po.deleted_at IS NULL AND (po.code ILIKE ${like} OR s.name ILIKE ${like} OR s.code ILIKE ${like}) ${status ? Prisma.sql`AND po.status=${status}` : Prisma.empty} ${supplierId ? Prisma.sql`AND po.supplier_id=${id(supplierId, 'ผู้ขาย')}::uuid` : Prisma.empty}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`po.code`,
          supplierName: Prisma.sql`s.name`,
          orderDate: Prisma.sql`po.order_date`,
          expectedOn: Prisma.sql`po.expected_on`,
          amount: Prisma.sql`po.amount`,
          status: Prisma.sql`po.status`,
        },
        Prisma.sql`po.created_at DESC,po.id`,
        Prisma.sql`po.id`,
      );
      const rows = await query<PurchaseRow>(
        tx,
        Prisma.sql`SELECT ${purchaseSelect} FROM ${purchaseFrom} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${purchaseFrom} WHERE ${where}`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
