import 'server-only';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError, integer } from '@/server/validation/records';
import {
  object,
  str,
  id,
  qty,
  cost,
  day,
  bangkokDay,
  addMonths,
  stockStatus,
  requestedLines,
  orderStates as S,
} from './domain';
import type {
  OperationOptions,
  StockRow,
  StockProductRow,
  LotRow,
  OrderRow,
  OrderLine,
} from '@/types/api/operations';
export type Actor = { id: string; roleId: string; name: string };
type Tx = Prisma.TransactionClient;
type Policy = { saleMonths: number; donationMonths: number; warningDays: number };
export const seesCost = (actor: Actor) => ['ADMIN', 'ACCOUNTING_CFO'].includes(actor.roleId);
const query = <T>(tx: Tx, sql: Prisma.Sql) => tx.$queryRaw<T[]>(sql);
function receiptPrefix() {
  const year =
    Number(
      new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'Asia/Bangkok' }).format(
        new Date(),
      ),
    ) + 543;
  return 'GR-' + year + '-';
}
export function allow(actor: Actor, roles: string[]) {
  if (!roles.includes(actor.roleId)) throw new RecordError(403, 'ไม่มีสิทธิ์ทำรายการนี้');
}
async function policy(tx: Tx) {
  const rows = await query<Policy>(
    tx,
    Prisma.sql`SELECT sale_months AS "saleMonths",donation_months AS "donationMonths",warning_days AS "warningDays" FROM inventory_policy WHERE id=1`,
  );
  if (!rows[0]) throw new RecordError(503, 'ยังไม่ได้ตั้งค่านโยบายคลัง');
  return rows[0];
}
async function lockProducts(tx: Tx, ids: string[]) {
  for (const value of [...new Set(ids)].sort())
    await tx.$queryRaw(
      Prisma.sql`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${value},0))`,
    );
}
async function command(
  actor: Actor,
  body: Record<string, unknown>,
  kind: string,
  work: (tx: Tx) => Promise<unknown>,
) {
  const key = id(body.idempotencyKey, 'รหัสคำสั่ง');
  const fingerprint = createHash('sha256').update(JSON.stringify({ kind, body })).digest('hex');
  try {
    return await getPrismaClient().$transaction(
      async (tx) => {
        await tx.$queryRaw(
          Prisma.sql`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${key},1))`,
        );
        const existing = await query<{ actorId: string; fingerprint: string; result: unknown }>(
          tx,
          Prisma.sql`SELECT actor_user_id AS "actorId",fingerprint,result FROM operation_commands WHERE id=${key}::uuid`,
        );
        if (existing[0]) {
          if (existing[0].actorId !== actor.id || existing[0].fingerprint !== fingerprint)
            throw new RecordError(409, 'รหัสคำสั่งถูกใช้กับข้อมูลอื่นแล้ว');
          return existing[0].result;
        }
        const result = await work(tx);
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO operation_commands(id,actor_user_id,fingerprint,result) VALUES(${key}::uuid,${actor.id}::uuid,${fingerprint},${JSON.stringify(result)}::jsonb)`,
        );
        await tx.auditEvent.create({
          data: {
            actorUserId: actor.id,
            actorRole: actor.roleId,
            action: kind,
            requestId: key,
            after: JSON.parse(JSON.stringify(result)),
          },
        });
        return result;
      },
      { maxWait: 10000, timeout: 30000 },
    );
  } catch (e) {
    if (e instanceof RecordError) throw e;
    const error = e as { code?: string; meta?: { code?: string } };
    if (error.code === 'P2002' || error.meta?.code === '23505')
      throw new RecordError(409, 'เลขที่เอกสารหรือข้อมูลนี้มีอยู่แล้ว');
    if (error.code === 'P2003' || error.meta?.code === '23503')
      throw new RecordError(409, 'ข้อมูลต้นทางยังไม่พร้อม');
    throw e;
  }
}
async function movement(
  tx: Tx,
  actor: Actor,
  lotId: string,
  warehouseId: string,
  quantity: number,
  kind: string,
  sourceId: string,
  reason = '',
) {
  if (quantity === 0) return;
  await tx.$executeRaw(
    Prisma.sql`INSERT INTO stock_movements(lot_id,warehouse_id,quantity,kind,source_id,reason,actor_user_id) VALUES(${lotId}::uuid,${warehouseId}::uuid,${quantity},${kind},${sourceId}::uuid,${reason},${actor.id}::uuid)`,
  );
}
async function warehouse(tx: Tx, warehouseId: string) {
  const rows = await query<{ id: string; code: string }>(
    tx,
    Prisma.sql`SELECT id,code FROM warehouses WHERE id=${warehouseId}::uuid AND code IN ('MAIN','MARKETING','DISPOSAL')`,
  );
  if (!rows[0]) throw new RecordError(400, 'ไม่พบคลังสินค้าใน 3 คลังที่ใช้งาน');
  return rows[0];
}
const mainWarehouse = async (tx: Tx) => {
  const rows = await query<{ id: string }>(
    tx,
    Prisma.sql`SELECT id FROM warehouses WHERE code='MAIN'`,
  );
  if (!rows[0]) throw new RecordError(409, 'ไม่พบคลังหลัก MAIN');
  return rows[0].id;
};
type Lot = {
  id: string;
  productId: string;
  receiptId: string;
  receivedQuantity: number;
  totalCost: string;
  manufacturedOn: string;
  expiresOn: string;
  condition: string;
  createdAt: Date;
  lotNumber: string;
};
async function lot(tx: Tx, lotId: string) {
  const rows = await query<Lot>(
    tx,
    Prisma.sql`SELECT id,product_id AS "productId",receipt_id AS "receiptId",received_quantity AS "receivedQuantity",total_cost::text AS "totalCost",manufactured_on::text AS "manufacturedOn",expires_on::text AS "expiresOn",condition,created_at AS "createdAt",lot_number AS "lotNumber" FROM product_lots WHERE id=${lotId}::uuid`,
  );
  if (!rows[0]) throw new RecordError(404, 'ไม่พบล็อตสินค้า');
  return rows[0];
}
async function balance(tx: Tx, lotId: string, warehouseId: string) {
  const rows = await query<{ quantity: number; reserved: number }>(
    tx,
    Prisma.sql`SELECT quantity,reserved FROM stock_balances WHERE lot_id=${lotId}::uuid AND warehouse_id=${warehouseId}::uuid FOR UPDATE`,
  );
  if (!rows[0]) throw new RecordError(404, 'ล็อตนี้ไม่มีในคลังที่เลือก');
  return rows[0];
}
export async function inventoryWrite(actor: Actor, raw: unknown) {
  allow(actor, ['ADMIN']);
  const body = object(raw);
  const action = str(body.action, 'คำสั่ง');
  return command(actor, body, `inventory.${action}`, async (tx) => {
    if (action === 'policy') {
      const saleMonths = qty(body.saleMonths, true),
        donationMonths = qty(body.donationMonths),
        warningDays = qty(body.warningDays);
      if (saleMonths > 24 || donationMonths < 6 || donationMonths > 36 || warningDays > 730)
        throw new RecordError(400, 'เกณฑ์อายุอยู่นอกช่วงที่รองรับ');
      await tx.$executeRaw(
        Prisma.sql`UPDATE inventory_policy SET sale_months=${saleMonths},donation_months=${donationMonths},warning_days=${warningDays} WHERE id=1`,
      );
      return { data: { id: 1, action } };
    }
    if (action === 'receive') {
      if (!Array.isArray(body.lots) || body.lots.length !== 1)
        throw new RecordError(400, 'การรับเข้าแต่ละครั้งต้องมี 1 ล็อต');
      const code = str(body.code, 'ID รับเข้า', true, 100);
      const prefix = receiptPrefix();
      if (
        !code.startsWith(prefix) ||
        !/^\d{5}$/.test(code.slice(prefix.length)) ||
        Number(code.slice(prefix.length)) < 1
      )
        throw new RecordError(400, 'ID ต้องใช้ตัวอักษร GR ปีปัจจุบัน และเลขลำดับ 00001–99999');
      const inputs = body.lots.map((v) => {
        const b = object(v);
        const manufacturedOn = day(b.manufacturedOn),
          expiresOn = day(b.expiresOn);
        if (manufacturedOn > bangkokDay() || expiresOn <= manufacturedOn)
          throw new RecordError(400, 'วันผลิต/วันหมดอายุไม่ถูกต้อง');
        return {
          productId: id(b.productId, 'สินค้า'),
          warehouseId: id(b.warehouseId, 'คลัง'),
          lotNumber: code,
          quantity: qty(b.quantity),
          totalCost: cost(b.totalCost),
          manufacturedOn,
          expiresOn,
        };
      });
      await lockProducts(
        tx,
        inputs.map((l) => l.productId),
      );
      const receiptId = randomUUID();
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO stock_receipts(id,code,source,notes,actor_user_id) VALUES(${receiptId}::uuid,${code},${str(body.source, 'แหล่งที่มา', false)},${str(body.notes, 'หมายเหตุ', false)},${actor.id}::uuid)`,
      );
      const lotIds: string[] = [];
      for (const input of inputs) {
        await warehouse(tx, input.warehouseId);
        const products = await query<{ id: string }>(
          tx,
          Prisma.sql`SELECT id FROM products WHERE id=${input.productId}::uuid AND deleted_at IS NULL AND status='ACTIVE' FOR KEY SHARE`,
        );
        if (!products[0]) throw new RecordError(400, 'สินค้ายังไม่พร้อมรับเข้า');
        const lotId = randomUUID();
        lotIds.push(lotId);
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO product_lots(id,receipt_id,product_id,lot_number,received_quantity,total_cost,manufactured_on,expires_on) VALUES(${lotId}::uuid,${receiptId}::uuid,${input.productId}::uuid,${input.lotNumber},${input.quantity},${input.totalCost}::numeric,${input.manufacturedOn}::date,${input.expiresOn}::date)`,
        );
        await tx.$executeRaw(
          Prisma.sql`INSERT INTO stock_balances(lot_id,warehouse_id,quantity) VALUES(${lotId}::uuid,${input.warehouseId}::uuid,${input.quantity})`,
        );
        await movement(tx, actor, lotId, input.warehouseId, input.quantity, 'รับเข้า', receiptId);
      }
      return { data: { id: receiptId, code, lotIds } };
    }
    const lotId = id(body.lotId, 'ล็อต');
    let l = await lot(tx, lotId);
    await lockProducts(tx, [l.productId]);
    l = await lot(tx, lotId);
    const reason = str(body.reason, 'เหตุผล');
    if (action === 'correct') {
      const original = (
        await query<{ createdAt: Date }>(
          tx,
          Prisma.sql`SELECT created_at AS "createdAt" FROM stock_receipts WHERE id=${l.receiptId}::uuid`,
        )
      )[0];
      if (Date.now() - original.createdAt.getTime() > 7 * 86400000)
        throw new RecordError(409, 'เกิน 7 วันจากเวลาบันทึกรับเข้า ไม่สามารถแก้รายการนี้');
      const newQuantity = qty(body.quantity),
        newCost = cost(body.totalCost),
        manufacturedOn = day(body.manufacturedOn),
        expiresOn = day(body.expiresOn);
      if (expiresOn <= manufacturedOn || manufacturedOn > bangkokDay())
        throw new RecordError(400, 'วันผลิต/วันหมดอายุไม่ถูกต้อง');
      const warehouseId = id(body.warehouseId, 'คลังที่ปรับผลต่าง');
      const b = await balance(tx, lotId, warehouseId);
      const delta = newQuantity - l.receivedQuantity;
      if (b.quantity + delta < b.reserved)
        throw new RecordError(
          409,
          'จำนวนแก้ไขต่ำกว่าที่ใช้หรือจองแล้ว กรุณาตรวจของจริงและรายการที่เกี่ยวข้อง',
        );
      const p = await policy(tx);
      if (
        b.reserved > 0 &&
        (expiresOn < addMonths(bangkokDay(), p.saleMonths) || l.condition !== 'ปกติ')
      )
        throw new RecordError(409, 'ล็อตมี Order จองอยู่ วันที่ใหม่ไม่ผ่านเกณฑ์ขาย');
      const revisionId = randomUUID();
      const after = {
        receivedQuantity: newQuantity,
        totalCost: newCost,
        manufacturedOn,
        expiresOn,
      };
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO receipt_revisions(id,lot_id,actor_user_id,reason,before_data,after_data) VALUES(${revisionId}::uuid,${lotId}::uuid,${actor.id}::uuid,${reason},${JSON.stringify(l)}::jsonb,${JSON.stringify(after)}::jsonb)`,
      );
      await tx.$executeRaw(
        Prisma.sql`UPDATE product_lots SET received_quantity=${newQuantity},total_cost=${newCost}::numeric,manufactured_on=${manufacturedOn}::date,expires_on=${expiresOn}::date WHERE id=${lotId}::uuid`,
      );
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_balances SET quantity=quantity+${delta} WHERE lot_id=${lotId}::uuid AND warehouse_id=${warehouseId}::uuid`,
      );
      await movement(tx, actor, lotId, warehouseId, delta, 'แก้รับเข้า', revisionId, reason);
      return { data: { id: revisionId, lotId, action } };
    }
    const warehouseId = id(body.warehouseId, 'คลัง');
    const b = await balance(tx, lotId, warehouseId);
    if (action === 'destroy') {
      const wh = await warehouse(tx, warehouseId);
      if (wh.code !== 'DISPOSAL') throw new RecordError(400, 'ทำลายได้เฉพาะคลังรอทำลาย');
      const previous = await query<{ destroyed: boolean }>(
        tx,
        Prisma.sql`SELECT EXISTS(SELECT 1 FROM stock_movements WHERE lot_id=${lotId}::uuid AND warehouse_id=${warehouseId}::uuid AND kind='ทำลายแล้ว') AS destroyed`,
      );
      if (previous[0]?.destroyed)
        throw new RecordError(409, 'ล็อตนี้บันทึกทำลายแล้ว ไม่สามารถทำซ้ำ');
      if (b.reserved > 0) throw new RecordError(409, 'ล็อตมีจำนวนจองอยู่ ไม่สามารถทำลาย');
      if (b.quantity <= 0 || b.quantity !== qty(body.expectedQuantity) || body.confirmed !== true)
        throw new RecordError(409, 'ยอดคงเหลือเปลี่ยนหรือยังไม่ยืนยัน กรุณาโหลดข้อมูลใหม่');
      const sourceId = randomUUID();
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_balances SET quantity=0 WHERE lot_id=${lotId}::uuid AND warehouse_id=${warehouseId}::uuid`,
      );
      await movement(tx, actor, lotId, warehouseId, -b.quantity, 'ทำลายแล้ว', sourceId, reason);
      return { data: { id: sourceId, lotId, warehouseId, action, destroyedQuantity: b.quantity } };
    }
    if (action === 'adjust') {
      const target = qty(body.quantity, true);
      if (target < b.reserved)
        throw new RecordError(409, 'ยอดจริงต่ำกว่าจำนวนที่จอง กรุณาแก้ Order ที่เกี่ยวข้องก่อน');
      const delta = target - b.quantity;
      if (!delta) throw new RecordError(400, 'ยอดไม่เปลี่ยนแปลง');
      const sourceId = randomUUID();
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_balances SET quantity=${target} WHERE lot_id=${lotId}::uuid AND warehouse_id=${warehouseId}::uuid`,
      );
      await movement(tx, actor, lotId, warehouseId, delta, 'ปรับยอด', sourceId, reason);
      return { data: { id: sourceId, lotId, action } };
    }
    if (action === 'condition') {
      const condition = str(body.condition, 'สภาพสินค้า');
      if (!['ปกติ', 'เสื่อมสภาพ'].includes(condition))
        throw new RecordError(400, 'สภาพสินค้าไม่ถูกต้อง');
      await tx.$executeRaw(
        Prisma.sql`UPDATE product_lots SET condition=${condition} WHERE id=${lotId}::uuid`,
      );
      return { data: { id: lotId, action, condition, reason } };
    }
    const quantity = qty(body.quantity);
    if (quantity > b.quantity - b.reserved)
      throw new RecordError(409, 'จำนวนพร้อมใช้ไม่พอ หรือถูก Order จองไว้');
    const sourceId = randomUUID();
    if (action === 'transfer') {
      const targetId = id(body.targetWarehouseId, 'คลังปลายทาง');
      if (targetId === warehouseId) throw new RecordError(400, 'คลังปลายทางต้องต่างจากต้นทาง');
      const dest = await warehouse(tx, targetId);
      if ((l.expiresOn <= bangkokDay() || l.condition !== 'ปกติ') && dest.code !== 'DISPOSAL')
        throw new RecordError(409, 'ของหมดอายุหรือเสื่อมสภาพย้ายได้เฉพาะคลังรอทำลาย');
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_balances SET quantity=quantity-${quantity} WHERE lot_id=${lotId}::uuid AND warehouse_id=${warehouseId}::uuid`,
      );
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO stock_balances(lot_id,warehouse_id,quantity) VALUES(${lotId}::uuid,${targetId}::uuid,${quantity}) ON CONFLICT(lot_id,warehouse_id) DO UPDATE SET quantity=stock_balances.quantity+EXCLUDED.quantity`,
      );
      await movement(tx, actor, lotId, warehouseId, -quantity, 'โอนออก', sourceId, reason);
      await movement(tx, actor, lotId, targetId, quantity, 'โอนเข้า', sourceId, reason);
      return { data: { id: sourceId, lotId, action } };
    }
    if (action === 'give') {
      const wh = await warehouse(tx, warehouseId);
      if (wh.code !== 'MARKETING') throw new RecordError(400, 'แจก/บริจาคใช้คลังการตลาดเท่านั้น');
      if (l.condition !== 'ปกติ' || l.expiresOn <= bangkokDay())
        throw new RecordError(409, 'ล็อตหมดอายุหรือเสื่อมสภาพ ไม่สามารถแจกได้');
      const recipient = str(body.recipient, 'ผู้รับ');
      const type = str(body.giveType, 'ประเภทการแจก');
      if (!['แจก', 'บริจาค'].includes(type)) throw new RecordError(400, 'ประเภทการแจกไม่ถูกต้อง');
      if (type === 'บริจาค') {
        const arrival = day(body.arrivalOn),
          p = await policy(tx);
        if (
          arrival < bangkokDay() ||
          l.expiresOn < addMonths(arrival, p.donationMonths) ||
          body.recipientConfirmed !== true
        )
          throw new RecordError(409, 'อายุยาไม่ผ่านเกณฑ์บริจาค หรือยังไม่ยืนยันเงื่อนไขผู้รับ');
      }
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_balances SET quantity=quantity-${quantity} WHERE lot_id=${lotId}::uuid AND warehouse_id=${warehouseId}::uuid`,
      );
      await movement(
        tx,
        actor,
        lotId,
        warehouseId,
        -quantity,
        type,
        sourceId,
        `${recipient} · ${reason}`,
      );
      return { data: { id: sourceId, lotId, action } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}
export async function operationOptions(actor: Actor, scope?: 'receive') {
  return getPrismaClient().$transaction(async (tx) => {
    const p = scope ? undefined : await policy(tx);
    const minimum = p ? addMonths(bangkokDay(), p.saleMonths) : '';
    const products = scope
      ? await query<OperationOptions['products'][number]>(
          tx,
          Prisma.sql`SELECT id,code,name,unit FROM products WHERE deleted_at IS NULL AND status='ACTIVE' ORDER BY name,id`,
        )
      : await query<OperationOptions['products'][number]>(
          tx,
          Prisma.sql`SELECT p.id,p.code,p.name,p.sale_price::text AS "salePrice",p.unit,COALESCE((SELECT sum(b.quantity-b.reserved)::int FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id WHERE l.product_id=p.id AND w.code='MAIN' AND l.condition='ปกติ' AND l.expires_on>${bangkokDay()}::date AND l.expires_on>=${minimum}::date),0) AS available FROM products p WHERE p.deleted_at IS NULL AND p.status='ACTIVE' ORDER BY p.name,p.id`,
        );
    const customers = scope
      ? []
      : await query<OperationOptions['customers'][number]>(
          tx,
          Prisma.sql`SELECT c.id,c.code,c.name,COALESCE(t.name,'') AS "territoryName" FROM customers c LEFT JOIN sales_territories t ON t.id=c.territory_id WHERE c.deleted_at IS NULL ORDER BY c.name,c.id`,
        );
    const warehouses = await query<OperationOptions['warehouses'][number]>(
      tx,
      Prisma.sql`SELECT id,code,name FROM warehouses WHERE code IN ('MAIN','MARKETING','DISPOSAL') ORDER BY code`,
    );
    const users =
      !scope && actor.roleId === 'ADMIN'
        ? await query<OperationOptions['users'][number]>(
            tx,
            Prisma.sql`SELECT u.id,u.employee_code AS code,u.name,r.role_id AS "roleId" FROM users u JOIN user_roles r ON r.user_id=u.id WHERE u.deleted_at IS NULL AND u.status='ACTIVE' ORDER BY u.name`,
          )
        : [];
    const prefix = receiptPrefix();
    const receiptNumbers =
      actor.roleId === 'ADMIN'
        ? await query<{ value: string }>(
            tx,
            Prisma.sql`SELECT (COALESCE(MAX(substring(code FROM ${prefix.length + 1})::int),0)+1)::text AS value FROM stock_receipts WHERE code ~ ${'^' + prefix + '[0-9]{5}$'}`,
          )
        : [];
    if (receiptNumbers[0] && Number(receiptNumbers[0].value) > 99999)
      throw new RecordError(409, 'เลขลำดับ ID ของปีนี้ครบ 99999 แล้ว');
    const nextReceiptCode = receiptNumbers[0]
      ? prefix + receiptNumbers[0].value.padStart(5, '0')
      : undefined;
    return scope
      ? { data: { products, warehouses, actor, nextReceiptCode } }
      : { data: { products, customers, warehouses, users, actor, policy: p!, nextReceiptCode } };
  });
}
function page(params: URLSearchParams) {
  return {
    offset: integer(params, 'offset', 0, 0, 100000),
    limit: integer(params, 'limit', 10, 1, 100),
    search: str(params.get('search') ?? '', 'ค้นหา', false, 200),
  };
}
const pageResult = <T>(data: T[], total: number, offset: number, limit: number) => ({
  data,
  pagination: { offset, limit, total, hasMore: offset + data.length < total },
});
function safeLot(row: StockRow, actor: Actor, p: Policy) {
  const result = {
    ...row,
    status: stockStatus(row.expiresOn, row.condition, p.saleMonths, p.warningDays),
  };
  if (!seesCost(actor)) {
    delete result.totalCost;
    delete result.unitCost;
  }
  return result;
}
const stockSelect = Prisma.sql`l.id AS "lotId",(l.id::text||':'||w.id::text) AS id,l.product_id AS "productId",p.name AS "productName",p.code AS "productCode",p.unit,l.lot_number AS "lotNumber",l.receipt_id AS "receiptId",r.code AS "receiptCode",r.source,w.id AS "warehouseId",w.name AS "warehouseName",w.code AS "warehouseCode",b.quantity,b.reserved,(b.quantity-b.reserved) AS available,l.received_quantity AS "receivedQuantity",l.total_cost::text AS "totalCost",(l.total_cost/l.received_quantity)::text AS "unitCost",l.manufactured_on::text AS "manufacturedOn",l.expires_on::text AS "expiresOn",l.created_at::text AS "createdAt",l.condition,EXISTS(SELECT 1 FROM stock_movements sm WHERE sm.lot_id=l.id AND sm.warehouse_id=w.id AND sm.kind='ทำลายแล้ว') AS "disposalDestroyed"`;
const stockFrom = Prisma.sql`product_lots l JOIN products p ON p.id=l.product_id JOIN stock_receipts r ON r.id=l.receipt_id JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id`;
export async function inventoryRead(actor: Actor, params: URLSearchParams) {
  for (const [key, allowed] of [
    ['scope', ['receive']],
    ['projection', ['summary']],
    ['metadata', ['true', 'false']],
  ] as const) {
    if (
      params.getAll(key).length > 1 ||
      (params.has(key) && !allowed.some((value) => value === params.get(key)))
    )
      throw new RecordError(400, 'ขอบเขตหรือรูปแบบข้อมูลไม่ถูกต้อง');
  }
  const view = params.get('view') ?? 'stock';
  if (view === 'options') {
    const scope = params.get('scope');
    if (scope !== null && scope !== 'receive') throw new RecordError(400, 'ขอบเขตข้อมูลไม่ถูกต้อง');
    return operationOptions(actor, scope === 'receive' ? 'receive' : undefined);
  }
  const { offset, limit, search } = page(params);
  const like = '%' + search.replace(/[\\%_]/g, '\\$&') + '%';
  return getPrismaClient().$transaction(
    async (tx) => {
      const p = await policy(tx);
      if (view === 'products' || view === 'lots' || view === 'receipt-items') {
        const categoryId = params.get('categoryId');
        const category = categoryId
          ? Prisma.sql`AND p.category_id=${id(categoryId)}::uuid`
          : Prisma.empty;
        const warehouseCode = params.get('warehouseCode') ?? '';
        if (warehouseCode && !['MAIN', 'MARKETING', 'DISPOSAL'].includes(warehouseCode))
          throw new RecordError(400, 'คลังสินค้าไม่ถูกต้อง');
        const expiry = params.get('expiry') ?? '';
        if (!['', 'near', 'expired'].includes(expiry))
          throw new RecordError(400, 'ตัวกรองอายุไม่ถูกต้อง');
        const today = bangkokDay();
        const expiryFilter =
          expiry === 'near'
            ? Prisma.sql`AND l.expires_on>${today}::date AND l.expires_on<=${today}::date+${p.warningDays}::int`
            : expiry === 'expired'
              ? Prisma.sql`AND l.expires_on<=${today}::date`
              : Prisma.empty;
        if (view === 'products') {
          const deleted = params.get('deleted') ?? 'false';
          if (!['true', 'false'].includes(deleted))
            throw new RecordError(400, 'ตัวกรองการลบไม่ถูกต้อง');
          if (deleted === 'true') allow(actor, ['ADMIN']);
          const status = params.get('status') ?? '';
          if (!['', 'ACTIVE', 'INACTIVE'].includes(status))
            throw new RecordError(400, 'สถานะสินค้าไม่ถูกต้อง');
          const stock = params.get('stock') ?? '';
          if (!['', 'low', 'empty'].includes(stock))
            throw new RecordError(400, 'ตัวกรองจำนวนไม่ถูกต้อง');
          const scoped = warehouseCode ? Prisma.sql`WHERE w.code=${warehouseCode}` : Prisma.empty;
          const scopeExists =
            warehouseCode && warehouseCode !== 'MAIN'
              ? Prisma.sql`AND EXISTS(SELECT 1 FROM product_lots x JOIN stock_balances sb ON sb.lot_id=x.id JOIN warehouses wh ON wh.id=sb.warehouse_id WHERE x.product_id=p.id AND wh.code=${warehouseCode} AND sb.quantity>0)`
              : Prisma.empty;
          const ageExists = expiry
            ? Prisma.sql`AND EXISTS(SELECT 1 FROM product_lots l JOIN stock_balances sb ON sb.lot_id=l.id JOIN warehouses wh ON wh.id=sb.warehouse_id WHERE l.product_id=p.id AND sb.quantity>0 ${warehouseCode ? Prisma.sql`AND wh.code=${warehouseCode}` : Prisma.empty} ${expiryFilter})`
            : Prisma.empty;
          const cte = Prisma.sql`WITH totals AS (
            SELECT l.product_id, sum(b.quantity)::int AS quantity,sum(b.reserved)::int AS reserved,count(DISTINCT l.id) FILTER (WHERE b.quantity>0)::int AS "lotCount"
            FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id ${scoped} GROUP BY l.product_id
          ), main_totals AS (
            SELECT l.product_id,sum(b.quantity)::int AS quantity
            FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id
            WHERE w.code='MAIN' GROUP BY l.product_id
          ), sale AS (
            SELECT l.product_id,sum(b.quantity-b.reserved)::int AS available
            FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id
            WHERE w.code='MAIN' AND l.condition='ปกติ' AND l.expires_on>${today}::date AND l.expires_on>=${addMonths(today, p.saleMonths)}::date GROUP BY l.product_id
          ), items AS (
            SELECT p.id,p.code,p.name,p.category_id AS "categoryId",c.name AS "categoryName",p.unit,p.sale_price::text AS "salePrice",p.status::text,p.deleted_at::text AS "deletedAt",
            COALESCE(t.quantity,0) AS quantity,COALESCE(t.reserved,0) AS reserved,COALESCE(t.quantity,0)-COALESCE(t.reserved,0) AS available,COALESCE(s.available,0) AS "mainAvailable",COALESCE(m.quantity,0) AS "mainQuantity",COALESCE(t."lotCount",0) AS "lotCount"
            FROM products p JOIN product_categories c ON c.id=p.category_id LEFT JOIN totals t ON t.product_id=p.id LEFT JOIN sale s ON s.product_id=p.id LEFT JOIN main_totals m ON m.product_id=p.id
            WHERE ${deleted === 'true' ? Prisma.sql`p.deleted_at IS NOT NULL` : Prisma.sql`p.deleted_at IS NULL`} AND (p.name ILIKE ${like} OR p.code ILIKE ${like}) ${category} ${scopeExists} ${ageExists} ${status ? Prisma.sql`AND p.status::text=${status}` : Prisma.empty}
          )`;
          const where =
            stock === 'low'
              ? Prisma.sql`WHERE "mainQuantity" BETWEEN 1 AND 50`
              : stock === 'empty'
                ? Prisma.sql`WHERE "mainQuantity"=0`
                : Prisma.empty;
          const order = sqlTableOrder(
            params,
            {
              code: Prisma.sql`code`,
              name: Prisma.sql`name`,
              categoryName: Prisma.sql`"categoryName"`,
              unit: Prisma.sql`unit`,
              salePrice: Prisma.sql`"salePrice"::numeric`,
              quantity: Prisma.sql`quantity`,
              lotCount: Prisma.sql`"lotCount"`,
              status: Prisma.sql`CASE WHEN "mainQuantity"=0 THEN 0 WHEN "mainQuantity" BETWEEN 1 AND 50 THEN 1 ELSE 2 END`,
              marketingDays: Prisma.sql`(SELECT min(ml.expires_on) FROM product_lots ml JOIN stock_balances mb ON mb.lot_id=ml.id JOIN warehouses mw ON mw.id=mb.warehouse_id WHERE ml.product_id=items.id AND mw.code='MARKETING' AND mb.quantity>0)`,
            },
            Prisma.sql`code,id`,
            Prisma.sql`id`,
          );
          const data = await query<StockProductRow>(
            tx,
            Prisma.sql`${cte} SELECT * FROM items ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
          );
          const count = await query<{ total: number }>(
            tx,
            Prisma.sql`${cte} SELECT count(*)::int AS total FROM items ${where}`,
          );
          if (warehouseCode === 'MARKETING' && data.length) {
            if (params.get('projection') === 'summary') {
              const days = await query<{ productId: string; days: number }>(
                tx,
                Prisma.sql`SELECT l.product_id AS "productId",(min(l.expires_on)-${today}::date)::int AS days FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id WHERE w.code='MARKETING' AND b.quantity>0 AND l.product_id IN (${Prisma.join(data.map((row) => Prisma.sql`${row.id}::uuid`))}) GROUP BY l.product_id`,
              );
              for (const row of data)
                row.marketingDays = days.find((item) => item.productId === row.id)?.days ?? null;
            } else {
              const lots = await query<{
                productId: string;
                id: string;
                receiptCode: string;
                quantity: number;
                expiresOn: string;
                daysUntilExpiry: number;
              }>(
                tx,
                Prisma.sql`SELECT l.product_id AS "productId",l.id,r.code AS "receiptCode",b.quantity,l.expires_on::text AS "expiresOn",(l.expires_on-${today}::date)::int AS "daysUntilExpiry" FROM product_lots l JOIN stock_receipts r ON r.id=l.receipt_id JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id WHERE w.code='MARKETING' AND b.quantity>0 AND l.product_id IN (${Prisma.join(data.map((row) => Prisma.sql`${row.id}::uuid`))}) ORDER BY l.expires_on,l.id`,
              );
              for (const row of data)
                row.marketingLots = lots
                  .filter((lot) => lot.productId === row.id)
                  .map((lot) => ({
                    id: lot.id,
                    receiptCode: lot.receiptCode,
                    quantity: lot.quantity,
                    expiresOn: lot.expiresOn,
                    daysUntilExpiry: lot.daysUntilExpiry,
                  }));
            }
          }
          if (params.get('metadata') === 'false')
            return pageResult(data, count[0].total, offset, limit);
          const categories = await query<{ id: string; name: string }>(
            tx,
            Prisma.sql`SELECT id,name FROM product_categories ORDER BY name,id`,
          );
          return { ...pageResult(data, count[0].total, offset, limit), filters: { categories } };
        }
        const warehouseId = params.get('warehouseId');
        const warehouse = warehouseId
          ? Prisma.sql`AND EXISTS(SELECT 1 FROM stock_balances sb WHERE sb.lot_id=l.id AND sb.warehouse_id=${id(warehouseId)}::uuid AND sb.quantity>0)`
          : Prisma.empty;
        const productId = params.get('productId');
        const product = productId
          ? Prisma.sql`AND l.product_id=${id(productId)}::uuid`
          : Prisma.empty;
        const lotId = params.get('lotId');
        const selectedLot = lotId
          ? Prisma.sql`AND l.id=${id(lotId, 'ล็อตสินค้า')}::uuid`
          : Prisma.empty;
        const expiryBefore = params.get('expiryBefore');
        const dateFilter = expiryBefore
          ? Prisma.sql`AND l.expires_on<=${day(expiryBefore)}::date`
          : Prisma.empty;
        const remaining = params.get('remaining') ?? 'false';
        if (!['true', 'false'].includes(remaining))
          throw new RecordError(400, 'ตัวกรองล็อตคงเหลือไม่ถูกต้อง');
        const activeScope =
          remaining === 'true' || warehouseCode
            ? Prisma.sql`AND (EXISTS(SELECT 1 FROM stock_balances sb JOIN warehouses wh ON wh.id=sb.warehouse_id WHERE sb.lot_id=l.id AND sb.quantity>0 ${warehouseCode ? Prisma.sql`AND wh.code=${warehouseCode}` : Prisma.empty}) ${remaining === 'true' && (!warehouseCode || warehouseCode === 'DISPOSAL') ? Prisma.sql`OR EXISTS(SELECT 1 FROM stock_movements sm JOIN warehouses dw ON dw.id=sm.warehouse_id WHERE sm.lot_id=l.id AND dw.code='DISPOSAL' AND sm.kind='ทำลายแล้ว')` : Prisma.empty})`
            : Prisma.empty;
        const where = Prisma.sql`(p.name ILIKE ${like} OR p.code ILIKE ${like} OR l.lot_number ILIKE ${like}) ${category} ${warehouse} ${product} ${selectedLot} ${expiryFilter} ${dateFilter} ${activeScope}`;
        const sortColumns: Record<string, Prisma.Sql> = {
          receiptCode: Prisma.sql`(SELECT code FROM stock_receipts WHERE id=l.receipt_id)`,
          lotNumber: Prisma.sql`l.lot_number`,
          productName: Prisma.sql`p.name`,
          productCode: Prisma.sql`p.code`,
          createdAt: Prisma.sql`l.created_at`,
          manufacturedOn: Prisma.sql`l.manufactured_on`,
          expiresOn: Prisma.sql`l.expires_on`,
          receivedQuantity: Prisma.sql`l.received_quantity`,
          condition: Prisma.sql`l.condition`,
          quantity: Prisma.sql`(SELECT COALESCE(sum(sb.quantity),0) FROM stock_balances sb JOIN warehouses wh ON wh.id=sb.warehouse_id WHERE sb.lot_id=l.id ${warehouseCode ? Prisma.sql`AND wh.code=${warehouseCode}` : Prisma.empty})`,
          reserved: Prisma.sql`(SELECT COALESCE(sum(sb.reserved),0) FROM stock_balances sb WHERE sb.lot_id=l.id)`,
          available: Prisma.sql`(SELECT COALESCE(sum(sb.quantity-sb.reserved),0) FROM stock_balances sb WHERE sb.lot_id=l.id)`,
          warehouseName: Prisma.sql`(SELECT min(wh.name) FROM stock_balances sb JOIN warehouses wh ON wh.id=sb.warehouse_id WHERE sb.lot_id=l.id AND sb.quantity>0)`,
          disposalDestroyed: Prisma.sql`EXISTS(SELECT 1 FROM stock_movements sm WHERE sm.lot_id=l.id AND sm.kind='ทำลายแล้ว')`,
        };
        if (seesCost(actor)) {
          sortColumns.totalCost = Prisma.sql`l.total_cost`;
          sortColumns.unitCost = Prisma.sql`l.total_cost/l.received_quantity`;
        }
        const order = sqlTableOrder(
          params,
          sortColumns,
          view === 'receipt-items'
            ? Prisma.sql`l.created_at DESC,l.id DESC`
            : Prisma.sql`l.expires_on,l.id`,
          Prisma.sql`l.id`,
        );
        const ids = await query<{ id: string }>(
          tx,
          Prisma.sql`SELECT l.id FROM product_lots l JOIN products p ON p.id=l.product_id WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
        );
        const counts = await query<{ total: number }>(
          tx,
          Prisma.sql`SELECT count(*)::int AS total FROM product_lots l JOIN products p ON p.id=l.product_id WHERE ${where}`,
        );
        const balances = ids.length
          ? await query<StockRow>(
              tx,
              Prisma.sql`SELECT ${stockSelect} FROM ${stockFrom} WHERE l.id IN (${Prisma.join(ids.map((x) => Prisma.sql`${x.id}::uuid`))}) ORDER BY l.expires_on,l.id,w.code`,
            )
          : [];
        const data: LotRow[] = ids.map(({ id: lotId }) => {
          const rows = balances.filter((r) => r.lotId === lotId).map((r) => safeLot(r, actor, p));
          const quantity = rows.reduce((n, r) => n + r.quantity, 0),
            reserved = rows.reduce((n, r) => n + r.reserved, 0);
          return {
            ...rows[0],
            id: lotId,
            quantity,
            reserved,
            available: quantity - reserved,
            balances: rows,
          };
        });
        return {
          ...pageResult(data, counts[0].total, offset, limit),
          ...(view === 'receipt-items' && params.has('lotId')
            ? { capabilities: { canCorrectReceipt: actor.roleId === 'ADMIN' } }
            : {}),
        };
      }
      if (view === 'stock') {
        const warehouseFilter = params.get('warehouseId');
        const w = warehouseFilter
          ? Prisma.sql`AND w.id=${id(warehouseFilter)}::uuid`
          : Prisma.empty;
        const where = Prisma.sql`(p.name ILIKE ${like} OR p.code ILIKE ${like} OR l.lot_number ILIKE ${like}) ${w}`;
        const data = await query<StockRow>(
          tx,
          Prisma.sql`SELECT ${stockSelect} FROM ${stockFrom} WHERE ${where} ORDER BY l.expires_on,l.id,w.id OFFSET ${offset} LIMIT ${limit}`,
        );
        const counts = await query<{ total: number }>(
          tx,
          Prisma.sql`SELECT count(*)::int AS total FROM ${stockFrom} WHERE ${where}`,
        );
        return pageResult(
          data.map((r) => safeLot(r, actor, p)),
          counts[0].total,
          offset,
          limit,
        );
      }
      if (view === 'receipts') {
        const receiptId = params.get('receiptId');
        const receiptFilter = receiptId
          ? Prisma.sql`AND r.id=${id(receiptId, 'รายการรับเข้า')}::uuid`
          : Prisma.empty;
        const rows = await query<{
          id: string;
          code: string;
          source: string;
          notes: string;
          createdAt: string;
          actorName: string;
        }>(
          tx,
          Prisma.sql`SELECT r.id,r.code,r.source,r.notes,r.created_at::text AS "createdAt",u.name AS "actorName" FROM stock_receipts r JOIN users u ON u.id=r.actor_user_id WHERE (r.code ILIKE ${like} OR r.source ILIKE ${like}) ${receiptFilter} ORDER BY r.created_at DESC,r.id OFFSET ${offset} LIMIT ${limit}`,
        );
        const data = [];
        for (const r of rows) {
          const lots = await query<StockRow>(
            tx,
            Prisma.sql`SELECT ${stockSelect} FROM ${stockFrom} WHERE r.id=${r.id}::uuid ORDER BY l.id,w.id`,
          );
          const revisions = await query<{
            id: string;
            lotId: string;
            reason: string;
            createdAt: string;
            actorName: string;
            beforeData?: unknown;
            afterData?: unknown;
          }>(
            tx,
            seesCost(actor)
              ? Prisma.sql`SELECT v.id,v.lot_id AS "lotId",v.reason,v.created_at::text AS "createdAt",u.name AS "actorName",v.before_data AS "beforeData",v.after_data AS "afterData" FROM receipt_revisions v JOIN users u ON u.id=v.actor_user_id JOIN product_lots l ON l.id=v.lot_id WHERE l.receipt_id=${r.id}::uuid ORDER BY v.created_at`
              : Prisma.sql`SELECT v.id,v.lot_id AS "lotId",v.reason,v.created_at::text AS "createdAt",u.name AS "actorName" FROM receipt_revisions v JOIN users u ON u.id=v.actor_user_id JOIN product_lots l ON l.id=v.lot_id WHERE l.receipt_id=${r.id}::uuid ORDER BY v.created_at`,
          );
          data.push({ ...r, lots: lots.map((l) => safeLot(l, actor, p)), revisions });
        }
        const count = await query<{ total: number }>(
          tx,
          Prisma.sql`SELECT count(*)::int AS total FROM stock_receipts r WHERE (r.code ILIKE ${like} OR r.source ILIKE ${like}) ${receiptFilter}`,
        );
        return pageResult(data, count[0].total, offset, limit);
      }
      if (view === 'movements') {
        const order = sqlTableOrder(
          params,
          {
            occurredAt: Prisma.sql`m.occurred_at`,
            productName: Prisma.sql`p.name`,
            lotNumber: Prisma.sql`l.lot_number`,
            warehouseName: Prisma.sql`w.name`,
            quantity: Prisma.sql`m.quantity`,
            kind: Prisma.sql`m.kind`,
            actorName: Prisma.sql`u.name`,
          },
          Prisma.sql`m.occurred_at DESC,m.id`,
          Prisma.sql`m.id`,
        );
        const rows = await query(
          tx,
          Prisma.sql`SELECT m.id,m.lot_id AS "lotId",l.lot_number AS "lotNumber",p.name AS "productName",w.name AS "warehouseName",m.quantity,m.kind,m.source_id AS "sourceId",m.reason,u.name AS "actorName",m.occurred_at::text AS "occurredAt" FROM stock_movements m JOIN product_lots l ON l.id=m.lot_id JOIN products p ON p.id=l.product_id JOIN warehouses w ON w.id=m.warehouse_id JOIN users u ON u.id=m.actor_user_id WHERE p.name ILIKE ${like} OR l.lot_number ILIKE ${like} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
        );
        const count = await query<{ total: number }>(
          tx,
          Prisma.sql`SELECT count(*)::int AS total FROM stock_movements m JOIN product_lots l ON l.id=m.lot_id JOIN products p ON p.id=l.product_id WHERE p.name ILIKE ${like} OR l.lot_number ILIKE ${like}`,
        );
        return pageResult(rows, count[0].total, offset, limit);
      }
      throw new RecordError(400, 'view ไม่ถูกต้อง');
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

async function allocate(tx: Tx, orderId: string, lines: { productId: string; quantity: number }[]) {
  const warehouseId = await mainWarehouse(tx),
    p = await policy(tx),
    minimum = addMonths(bangkokDay(), p.saleMonths);
  let total = new Prisma.Decimal(0);
  for (const input of lines) {
    const products = await query<{ id: string; name: string; price: string }>(
      tx,
      Prisma.sql`SELECT id,name,sale_price::text AS price FROM products WHERE id=${input.productId}::uuid AND deleted_at IS NULL AND status='ACTIVE' FOR KEY SHARE`,
    );
    if (!products[0]) throw new RecordError(400, 'สินค้าไม่พร้อมขาย');
    const product = products[0];
    const lineId = randomUUID();
    const balances = await query<{ lotId: string; quantity: number; reserved: number }>(
      tx,
      Prisma.sql`SELECT b.lot_id AS "lotId",b.quantity,b.reserved FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id WHERE l.product_id=${input.productId}::uuid AND b.warehouse_id=${warehouseId}::uuid AND l.condition='ปกติ' AND l.expires_on>${bangkokDay()}::date AND l.expires_on>=${minimum}::date AND b.quantity>b.reserved ORDER BY l.expires_on,l.created_at,l.id FOR UPDATE OF b`,
    );
    if (balances.reduce((n, b) => n + b.quantity - b.reserved, 0) < input.quantity)
      throw new RecordError(
        409,
        `${product.name} มีจำนวนพร้อมขายไม่พอ ไม่สามารถสร้าง/แก้ Order ได้`,
      );
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO sales_order_lines(id,order_id,product_id,quantity,unit_price,product_name) VALUES(${lineId}::uuid,${orderId}::uuid,${product.id}::uuid,${input.quantity},${product.price}::numeric,${product.name})`,
    );
    total = total.add(new Prisma.Decimal(product.price).mul(input.quantity));
    let remaining = input.quantity;
    for (const b of balances) {
      const n = Math.min(remaining, b.quantity - b.reserved);
      if (n <= 0) continue;
      await tx.$executeRaw(
        Prisma.sql`UPDATE stock_balances SET reserved=reserved+${n} WHERE lot_id=${b.lotId}::uuid AND warehouse_id=${warehouseId}::uuid`,
      );
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO stock_reservations(order_line_id,lot_id,warehouse_id,quantity) VALUES(${lineId}::uuid,${b.lotId}::uuid,${warehouseId}::uuid,${n})`,
      );
      remaining -= n;
      if (!remaining) break;
    }
  }
  return total.toFixed(2);
}
async function release(tx: Tx, orderId: string) {
  const rows = await query<{ id: string; lotId: string; warehouseId: string; quantity: number }>(
    tx,
    Prisma.sql`SELECT r.id,r.lot_id AS "lotId",r.warehouse_id AS "warehouseId",r.quantity FROM stock_reservations r JOIN sales_order_lines li ON li.id=r.order_line_id WHERE li.order_id=${orderId}::uuid AND r.status='จอง' ORDER BY r.lot_id,r.warehouse_id`,
  );
  for (const r of rows)
    await tx.$executeRaw(
      Prisma.sql`UPDATE stock_balances SET reserved=reserved-${r.quantity} WHERE lot_id=${r.lotId}::uuid AND warehouse_id=${r.warehouseId}::uuid`,
    );
  await tx.$executeRaw(
    Prisma.sql`UPDATE stock_reservations SET status='คืนจอง' WHERE id IN (SELECT r.id FROM stock_reservations r JOIN sales_order_lines li ON li.id=r.order_line_id WHERE li.order_id=${orderId}::uuid AND r.status='จอง')`,
  );
}
export async function orderWrite(actor: Actor, raw: unknown, orderId?: string) {
  const b = object(raw),
    action = orderId ? str(b.action, 'คำสั่ง') : 'create';
  const roles: Record<string, string[]> = {
    create: ['SALES', 'ADMIN'],
    edit: ['SALES', 'MANAGER', 'ADMIN'],
    approve: ['MANAGER'],
    return: ['MANAGER', 'ADMIN'],
    complete: ['ADMIN'],
    cancel: ['SALES', 'MANAGER', 'ADMIN'],
  };
  allow(actor, roles[action] ?? []);
  return command(actor, b, `orders.${action}`, async (tx) => {
    if (action === 'create') {
      const lines = requestedLines(b.lines);
      await lockProducts(
        tx,
        lines.map((l) => l.productId),
      );
      const customerId = id(b.customerId, 'ลูกค้า');
      const customer = (
        await query<{ id: string; territoryId: string | null; name: string }>(
          tx,
          Prisma.sql`SELECT id,territory_id AS "territoryId",name FROM customers WHERE id=${customerId}::uuid AND deleted_at IS NULL FOR KEY SHARE`,
        )
      )[0];
      if (!customer) throw new RecordError(400, 'ไม่พบลูกค้า');
      const newId = randomUUID(),
        code = str(b.code, 'เลขที่ Order', true, 100);
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO sales_orders(id,code,name,status,customer_id,territory_id,owner,notes,workflow_managed,created_by_id) VALUES(${newId}::uuid,${code},${customer.name},${S.pending},${customerId}::uuid,${customer.territoryId}::uuid,${actor.name},${str(b.notes, 'หมายเหตุ', false)},true,${actor.id}::uuid)`,
      );
      const amount = await allocate(tx, newId, lines);
      await tx.$executeRaw(
        Prisma.sql`UPDATE sales_orders SET amount=${amount}::numeric WHERE id=${newId}::uuid`,
      );
      return { data: { id: newId, code, status: S.pending } };
    }
    const oid = id(orderId);
    const before = (
      await query<{
        id: string;
        status: string;
        workflowManaged: boolean;
        updatedAt: Date;
        createdById: string | null;
      }>(
        tx,
        Prisma.sql`SELECT id,status,workflow_managed AS "workflowManaged",updated_at AS "updatedAt",created_by_id AS "createdById" FROM sales_orders WHERE id=${oid}::uuid AND deleted_at IS NULL FOR UPDATE`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบ Order');
    if (!before.workflowManaged)
      throw new RecordError(409, 'เอกสารเดิมไม่มีรายการจองล็อต ไม่สามารถใช้ขั้นตอนตัดคลังใหม่');
    if (
      b.expectedUpdatedAt !== undefined &&
      String(b.expectedUpdatedAt) !== before.updatedAt.toISOString()
    )
      throw new RecordError(409, 'เอกสารถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    if ([S.completed, S.cancelled].includes(before.status as typeof S.completed))
      throw new RecordError(409, 'เอกสารเสร็จสิ้นหรือยกเลิกแล้ว');
    if (actor.roleId === 'SALES' && before.createdById !== actor.id)
      throw new RecordError(403, 'Sales แก้ได้เฉพาะเอกสารที่สร้างเอง');
    const oldLines = await query<{ productId: string }>(
      tx,
      Prisma.sql`SELECT product_id AS "productId" FROM sales_order_lines WHERE order_id=${oid}::uuid`,
    );
    const newLines = action === 'edit' ? requestedLines(b.lines) : [];
    await lockProducts(
      tx,
      [...oldLines, ...newLines].map((l) => l.productId),
    );
    if (action === 'edit') {
      if (
        actor.roleId === 'SALES' &&
        ![S.pending, S.returned].includes(before.status as typeof S.pending)
      )
        throw new RecordError(409, 'เอกสารอนุมัติแล้ว ต้องส่งกลับก่อนแก้');
      await release(tx, oid);
      // Old line/reservation rows remain available in audit before snapshot; no downstream movement exists before completion.
      await tx.auditEvent.create({
        data: {
          actorUserId: actor.id,
          actorRole: actor.roleId,
          action: 'orders.lines_replaced',
          requestId: randomUUID(),
          before: {
            orderId: oid,
            lines: JSON.parse(
              JSON.stringify(
                await query(
                  tx,
                  Prisma.sql`SELECT li.id,li.product_id,li.quantity,li.unit_price::text,(SELECT jsonb_agg(jsonb_build_object('id',r.id,'lotId',r.lot_id,'warehouseId',r.warehouse_id,'quantity',r.quantity,'status',r.status)) FROM stock_reservations r WHERE r.order_line_id=li.id) AS allocations FROM sales_order_lines li WHERE li.order_id=${oid}::uuid`,
                ),
              ),
            ),
          },
        },
      });
      await tx.$executeRaw(
        Prisma.sql`DELETE FROM stock_reservations WHERE order_line_id IN (SELECT id FROM sales_order_lines WHERE order_id=${oid}::uuid)`,
      );
      await tx.$executeRaw(Prisma.sql`DELETE FROM sales_order_lines WHERE order_id=${oid}::uuid`);
      const amount = await allocate(tx, oid, newLines);
      await tx.$executeRaw(
        Prisma.sql`UPDATE sales_orders SET status=${S.pending},approved_by_id=NULL,amount=${amount}::numeric,notes=${str(b.notes, 'หมายเหตุ', false)},updated_at=clock_timestamp() WHERE id=${oid}::uuid`,
      );
      return { data: { id: oid, status: S.pending } };
    }
    if (action === 'approve') {
      if (![S.pending, S.returned].includes(before.status as typeof S.pending))
        throw new RecordError(409, 'สถานะนี้อนุมัติไม่ได้');
      await tx.$executeRaw(
        Prisma.sql`UPDATE sales_orders SET status=${S.approved},approved_by_id=${actor.id}::uuid,return_reason='',updated_at=clock_timestamp() WHERE id=${oid}::uuid`,
      );
      return { data: { id: oid, status: S.approved } };
    }
    if (action === 'return') {
      const reason = str(b.reason, 'เหตุผลส่งกลับ');
      await tx.$executeRaw(
        Prisma.sql`UPDATE sales_orders SET status=${S.returned},approved_by_id=NULL,return_reason=${reason},updated_at=clock_timestamp() WHERE id=${oid}::uuid`,
      );
      return { data: { id: oid, status: S.returned, reason } };
    }
    if (action === 'cancel') {
      const reason = str(b.reason, 'เหตุผลยกเลิก');
      await release(tx, oid);
      await tx.$executeRaw(
        Prisma.sql`UPDATE sales_orders SET status=${S.cancelled},return_reason=${reason},updated_at=clock_timestamp() WHERE id=${oid}::uuid`,
      );
      return { data: { id: oid, status: S.cancelled, reason } };
    }
    if (action === 'complete') {
      if (before.status !== S.approved) throw new RecordError(409, 'ต้องผ่าน Manager อนุมัติก่อน');
      const p = await policy(tx),
        minimum = addMonths(bangkokDay(), p.saleMonths);
      const allocations = await query<{
        id: string;
        lotId: string;
        warehouseId: string;
        quantity: number;
        condition: string;
        expiresOn: string;
        totalCost: string;
        receivedQuantity: number;
      }>(
        tx,
        Prisma.sql`SELECT r.id,r.lot_id AS "lotId",r.warehouse_id AS "warehouseId",r.quantity,l.condition,l.expires_on::text AS "expiresOn",l.total_cost::text AS "totalCost",l.received_quantity AS "receivedQuantity" FROM stock_reservations r JOIN sales_order_lines li ON li.id=r.order_line_id JOIN product_lots l ON l.id=r.lot_id WHERE li.order_id=${oid}::uuid AND r.status='จอง' ORDER BY l.id,r.id`,
      );
      if (!allocations.length) throw new RecordError(409, 'ไม่พบรายการจอง');
      for (const r of allocations) {
        if (r.condition !== 'ปกติ' || r.expiresOn <= bangkokDay() || r.expiresOn < minimum)
          throw new RecordError(409, 'ล็อตที่จองไม่ผ่านเกณฑ์ขายแล้ว กรุณาส่งกลับเพื่อจัดล็อตใหม่');
        const balanceRow = await balance(tx, r.lotId, r.warehouseId);
        if (balanceRow.reserved < r.quantity || balanceRow.quantity < r.quantity)
          throw new RecordError(409, 'ยอดล็อตไม่พอ กรุณาตรวจคลัง');
        const unitCost = new Prisma.Decimal(r.totalCost).div(r.receivedQuantity).toFixed(8);
        await tx.$executeRaw(
          Prisma.sql`UPDATE stock_balances SET quantity=quantity-${r.quantity},reserved=reserved-${r.quantity} WHERE lot_id=${r.lotId}::uuid AND warehouse_id=${r.warehouseId}::uuid`,
        );
        await tx.$executeRaw(
          Prisma.sql`UPDATE stock_reservations SET status='จ่ายแล้ว',unit_cost=${unitCost}::numeric WHERE id=${r.id}::uuid`,
        );
        await movement(tx, actor, r.lotId, r.warehouseId, -r.quantity, 'ขาย', oid);
      }
      await tx.$executeRaw(
        Prisma.sql`UPDATE sales_orders SET status=${S.completed},completed_by_id=${actor.id}::uuid,updated_at=clock_timestamp() WHERE id=${oid}::uuid`,
      );
      return { data: { id: oid, status: S.completed } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}
const orderSelect = Prisma.sql`o.id,o.code,o.name,o.status,o.customer_id AS "customerId",COALESCE(c.name,'-') AS "customerName",COALESCE(t.name,'-') AS "territoryName",COALESCE(m.name,'-') AS "managerName",COALESCE(s.name,'-') AS "salesName",COALESCE(creator.name,o.owner) AS "createdByName",o.created_by_id AS "createdById",COALESCE(approver.name,'-') AS "approvedByName",COALESCE(finisher.name,'-') AS "completedByName",o.return_reason AS "returnReason",o.notes,COALESCE(o.amount,0)::text AS amount,o.created_at AS "createdAt",o.updated_at AS "updatedAt",o.workflow_managed AS "workflowManaged"`;
const orderFrom = Prisma.sql`sales_orders o LEFT JOIN customers c ON c.id=o.customer_id LEFT JOIN sales_territories t ON t.id=o.territory_id LEFT JOIN users m ON m.id=t.manager_id LEFT JOIN users s ON s.id=t.sales_id LEFT JOIN users creator ON creator.id=o.created_by_id LEFT JOIN users approver ON approver.id=o.approved_by_id LEFT JOIN users finisher ON finisher.id=o.completed_by_id`;
export async function orderRead(actor: Actor, params: URLSearchParams, orderId?: string) {
  return getPrismaClient().$transaction(
    async (tx) => {
      if (orderId) {
        const match = /^[0-9a-f-]{36}$/i.test(orderId)
          ? Prisma.sql`o.id=${orderId}::uuid OR o.code=${orderId}`
          : Prisma.sql`o.code=${orderId}`;
        const row = (
          await query<OrderRow>(
            tx,
            Prisma.sql`SELECT ${orderSelect} FROM ${orderFrom} WHERE (${match}) AND o.deleted_at IS NULL`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบ Order');
        const lines = await query<OrderLine>(
          tx,
          Prisma.sql`SELECT id,product_id AS "productId",product_name AS "productName",quantity,unit_price::text AS "unitPrice" FROM sales_order_lines WHERE order_id=${row.id}::uuid ORDER BY id`,
        );
        for (const line of lines) {
          line.allocations = await query(
            tx,
            seesCost(actor)
              ? Prisma.sql`SELECT r.id,r.lot_id AS "lotId",l.lot_number AS "lotNumber",r.quantity,r.status,r.unit_cost::text AS "unitCost" FROM stock_reservations r JOIN product_lots l ON l.id=r.lot_id WHERE r.order_line_id=${line.id}::uuid ORDER BY l.expires_on,l.id`
              : Prisma.sql`SELECT r.id,r.lot_id AS "lotId",l.lot_number AS "lotNumber",r.quantity,r.status FROM stock_reservations r JOIN product_lots l ON l.id=r.lot_id WHERE r.order_line_id=${line.id}::uuid ORDER BY l.expires_on,l.id`,
          );
        }
        row.lines = lines;
        if (seesCost(actor) && row.status === S.completed) {
          const sum = lines
            .flatMap((l) => l.allocations)
            .reduce(
              (n, a) => n.add(new Prisma.Decimal(a.unitCost ?? '0').mul(a.quantity)),
              new Prisma.Decimal(0),
            );
          row.costAmount = sum.toFixed(2);
          row.grossProfit = new Prisma.Decimal(row.amount).sub(sum).toFixed(2);
        }
        return { data: row };
      }
      const { offset, limit, search } = page(params),
        like = '%' + search.replace(/[\\%_]/g, '\\$&') + '%',
        status = params.get('status') ?? '';
      const where = Prisma.sql`o.deleted_at IS NULL AND (o.code ILIKE ${like} OR o.name ILIKE ${like} OR c.name ILIKE ${like}) ${status ? Prisma.sql`AND o.status=${status}` : Prisma.empty}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`o.code`,
          customerName: Prisma.sql`c.name`,
          territoryName: Prisma.sql`t.name`,
          createdAt: Prisma.sql`o.created_at`,
          amount: Prisma.sql`o.amount`,
          status: Prisma.sql`o.status`,
        },
        Prisma.sql`o.created_at DESC,o.id`,
        Prisma.sql`o.id`,
      );
      const rows = await query<OrderRow>(
        tx,
        Prisma.sql`SELECT ${orderSelect} FROM ${orderFrom} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${orderFrom} WHERE ${where}`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
