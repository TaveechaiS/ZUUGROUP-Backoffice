import 'server-only';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { object, str, id, qty, day, bangkokDay } from '@/server/operations/domain';
import {
  allow,
  command,
  lockProducts,
  nextDocumentCode,
  page,
  pageResult,
  query,
  type Actor,
  type Tx,
} from '@/server/operations/service';
import {
  PROMOTION_MIN_TYPES,
  PROMOTION_REWARD_TYPES,
  PROMOTION_SAVE_STATUSES,
  PROMOTION_STATUSES,
} from '@/config/promotions';
import type { PromotionGiftRow, PromotionProductRow, PromotionRow } from '@/types/api/promotions';

function oneOf<T extends readonly string[]>(value: unknown, list: T, label: string): T[number] {
  const v = str(value, label);
  if (!(list as readonly string[]).includes(v)) throw new RecordError(400, `${label}ไม่ถูกต้อง`);
  return v;
}
function amount(value: unknown, label: string) {
  const v = String(value ?? '');
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(v) || Number(v) <= 0)
    throw new RecordError(400, `${label}ต้องมากกว่า 0 และทศนิยมไม่เกิน 2 หลัก`);
  return v;
}
const uuidOrCode = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? Prisma.sql`(pr.id=${value}::uuid OR pr.code=${value})`
    : Prisma.sql`pr.code=${value}`;
const likeOf = (search: string) => '%' + search.replace(/[\\%_]/g, '\\$&') + '%';

function fields(b: Record<string, unknown>) {
  const startsOn = day(b.startsOn),
    endsOn = day(b.endsOn);
  if (endsOn < startsOn) throw new RecordError(400, 'วันสิ้นสุดต้องไม่ก่อนวันเริ่ม');
  const minType = oneOf(b.minType, PROMOTION_MIN_TYPES, 'ประเภทขั้นต่ำ');
  const minValue = minType === 'จำนวน' ? String(qty(b.minValue)) : amount(b.minValue, 'ยอดขั้นต่ำ');
  const rewardType = oneOf(b.rewardType, PROMOTION_REWARD_TYPES, 'ประเภทรางวัล');
  const discountValue = rewardType === 'ของแถม' ? '0' : amount(b.discountValue, 'ส่วนลด');
  if (rewardType === 'ส่วนลด%' && Number(discountValue) > 100)
    throw new RecordError(400, 'ส่วนลดเปอร์เซ็นต์ต้องไม่เกิน 100');
  if (!Array.isArray(b.productIds) || !b.productIds.length || b.productIds.length > 100)
    throw new RecordError(400, 'กรุณาเลือกสินค้าที่ร่วมรายการ 1–100 รายการ');
  const productIds = b.productIds.map((value) => id(value, 'สินค้าที่ร่วมรายการ'));
  if (new Set(productIds).size !== productIds.length)
    throw new RecordError(400, 'สินค้าที่ร่วมรายการต้องไม่ซ้ำกัน');
  const rawGifts = rewardType === 'ของแถม' ? b.gifts : [];
  if (
    !Array.isArray(rawGifts) ||
    (rewardType === 'ของแถม' && !rawGifts.length) ||
    rawGifts.length > 20
  )
    throw new RecordError(400, 'กรุณาเพิ่มของแถม 1–20 รายการ');
  const gifts = rawGifts.map((value) => {
    const g = object(value);
    return {
      productId: id(g.productId, 'ของแถม'),
      quantity: qty(g.quantity),
      warehouseId: id(g.warehouseId, 'คลังของแถม'),
    };
  });
  if (new Set(gifts.map((g) => g.productId)).size !== gifts.length)
    throw new RecordError(400, 'ของแถมต้องไม่ซ้ำกัน');
  return {
    name: str(b.name, 'ชื่อโปรโมชัน', true, 200),
    status: oneOf(b.status ?? 'ใช้งาน', PROMOTION_SAVE_STATUSES, 'สถานะ'),
    startsOn,
    endsOn,
    minType,
    minValue,
    rewardType,
    discountValue,
    description: str(b.description, 'รายละเอียด', false),
    notes: str(b.notes, 'หมายเหตุ', false),
    productIds,
    gifts,
  };
}

async function writeItems(tx: Tx, promotionId: string, f: ReturnType<typeof fields>) {
  await lockProducts(tx, [...f.productIds, ...f.gifts.map((g) => g.productId)]);
  for (const productId of f.productIds) {
    const product = (
      await query<{ id: string }>(
        tx,
        Prisma.sql`SELECT id FROM products WHERE id=${productId}::uuid AND deleted_at IS NULL AND status='ACTIVE' FOR KEY SHARE`,
      )
    )[0];
    if (!product) throw new RecordError(400, 'สินค้าที่ร่วมรายการไม่พร้อมใช้งาน');
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO promotion_products(promotion_id,product_id) VALUES(${promotionId}::uuid,${productId}::uuid)`,
    );
  }
  for (const gift of f.gifts) {
    const product = (
      await query<{ name: string }>(
        tx,
        Prisma.sql`SELECT name FROM products WHERE id=${gift.productId}::uuid AND deleted_at IS NULL AND status='ACTIVE' FOR KEY SHARE`,
      )
    )[0];
    if (!product) throw new RecordError(400, 'ของแถมไม่พร้อมใช้งาน');
    const warehouse = await query<{ id: string }>(
      tx,
      Prisma.sql`SELECT id FROM warehouses WHERE id=${gift.warehouseId}::uuid AND code IN ('MAIN','MARKETING')`,
    );
    if (!warehouse[0]) throw new RecordError(400, 'คลังของแถมต้องเป็นคลังหลักหรือคลังการตลาด');
    await tx.$executeRaw(
      Prisma.sql`INSERT INTO promotion_gifts(id,promotion_id,product_id,product_name,quantity,warehouse_id) VALUES(${randomUUID()}::uuid,${promotionId}::uuid,${gift.productId}::uuid,${product.name},${gift.quantity},${gift.warehouseId}::uuid)`,
    );
  }
}

export async function promotionWrite(actor: Actor, raw: unknown, promotionId?: string) {
  const b = object(raw),
    action = promotionId ? str(b.action, 'คำสั่ง') : 'create';
  allow(actor, ['ADMIN']);
  return command(actor, b, `promotions.${action}`, async (tx) => {
    if (action === 'create') {
      const f = fields(b),
        newId = randomUUID(),
        code = await nextDocumentCode(tx, 'PR');
      await tx.$executeRaw(
        Prisma.sql`INSERT INTO promotions(id,code,name,status,starts_on,ends_on,min_type,min_value,reward_type,discount_value,description,notes,owner,created_by_id) VALUES(${newId}::uuid,${code},${f.name},${f.status},${f.startsOn}::date,${f.endsOn}::date,${f.minType},${f.minValue}::numeric,${f.rewardType},${f.discountValue}::numeric,${f.description},${f.notes},${actor.name},${actor.id}::uuid)`,
      );
      await writeItems(tx, newId, f);
      return { data: { id: newId, code } };
    }
    const pid = id(promotionId);
    const before = (
      await query<{ status: string; updatedAt: Date }>(
        tx,
        Prisma.sql`SELECT status,updated_at AS "updatedAt" FROM promotions WHERE id=${pid}::uuid AND deleted_at IS NULL FOR UPDATE`,
      )
    )[0];
    if (!before) throw new RecordError(404, 'ไม่พบโปรโมชัน');
    if (
      b.expectedUpdatedAt !== undefined &&
      String(b.expectedUpdatedAt) !== before.updatedAt.toISOString()
    )
      throw new RecordError(409, 'ข้อมูลถูกเปลี่ยนแล้ว กรุณาโหลดใหม่');
    if (before.status === 'ยกเลิก') throw new RecordError(409, 'โปรโมชันถูกยกเลิกแล้ว');
    if (action === 'edit') {
      const f = fields(b);
      await tx.$executeRaw(
        Prisma.sql`DELETE FROM promotion_products WHERE promotion_id=${pid}::uuid`,
      );
      await tx.$executeRaw(Prisma.sql`DELETE FROM promotion_gifts WHERE promotion_id=${pid}::uuid`);
      await tx.$executeRaw(
        Prisma.sql`UPDATE promotions SET name=${f.name},status=${f.status},starts_on=${f.startsOn}::date,ends_on=${f.endsOn}::date,min_type=${f.minType},min_value=${f.minValue}::numeric,reward_type=${f.rewardType},discount_value=${f.discountValue}::numeric,description=${f.description},notes=${f.notes},updated_at=clock_timestamp() WHERE id=${pid}::uuid`,
      );
      await writeItems(tx, pid, f);
      return { data: { id: pid } };
    }
    if (action === 'cancel') {
      const reason = str(b.reason, 'เหตุผล');
      await tx.$executeRaw(
        Prisma.sql`UPDATE promotions SET status='ยกเลิก',cancel_reason=${reason},updated_at=clock_timestamp() WHERE id=${pid}::uuid`,
      );
      return { data: { id: pid, status: 'ยกเลิก', reason } };
    }
    throw new RecordError(400, 'คำสั่งไม่ถูกต้อง');
  });
}

const status = (today: string) =>
  Prisma.sql`CASE WHEN pr.status='ใช้งาน' AND pr.ends_on<${today}::date THEN 'หมดอายุ' ELSE pr.status END`;
const promotionFrom = Prisma.sql`promotions pr LEFT JOIN users u ON u.id=pr.created_by_id`;
const promotionSelect = (today: string) =>
  Prisma.sql`pr.id,pr.code,pr.name,${status(today)} AS status,pr.status AS "savedStatus",pr.starts_on::text AS "startsOn",pr.ends_on::text AS "endsOn",pr.min_type AS "minType",pr.min_value::text AS "minValue",pr.reward_type AS "rewardType",pr.discount_value::text AS "discountValue",pr.description,pr.notes,pr.cancel_reason AS "cancelReason",(SELECT count(*)::int FROM promotion_products pp WHERE pp.promotion_id=pr.id) AS "productCount",(SELECT count(*)::int FROM promotion_gifts pg WHERE pg.promotion_id=pr.id) AS "giftCount",COALESCE(u.name,pr.owner) AS "createdByName",pr.created_at AS "createdAt",pr.updated_at AS "updatedAt"`;

export async function promotionRead(actor: Actor, params: URLSearchParams, promotionId?: string) {
  const today = bangkokDay();
  return getPrismaClient().$transaction(
    async (tx) => {
      if (promotionId) {
        const row = (
          await query<PromotionRow>(
            tx,
            Prisma.sql`SELECT ${promotionSelect(today)} FROM ${promotionFrom} WHERE ${uuidOrCode(promotionId)} AND pr.deleted_at IS NULL`,
          )
        )[0];
        if (!row) throw new RecordError(404, 'ไม่พบโปรโมชัน');
        row.products = await query<PromotionProductRow>(
          tx,
          Prisma.sql`SELECT p.id AS "productId",p.code AS "productCode",p.name AS "productName" FROM promotion_products pp JOIN products p ON p.id=pp.product_id WHERE pp.promotion_id=${row.id}::uuid ORDER BY p.name,p.id`,
        );
        row.gifts = await query<PromotionGiftRow>(
          tx,
          Prisma.sql`SELECT g.id,g.product_id AS "productId",COALESCE(p.code,'') AS "productCode",g.product_name AS "productName",COALESCE(p.unit,'') AS unit,g.quantity,g.warehouse_id AS "warehouseId",w.name AS "warehouseName" FROM promotion_gifts g LEFT JOIN products p ON p.id=g.product_id JOIN warehouses w ON w.id=g.warehouse_id WHERE g.promotion_id=${row.id}::uuid ORDER BY g.product_name,g.id`,
        );
        return { data: row, actor };
      }
      const { offset, limit, search } = page(params),
        like = likeOf(search),
        filter = params.get('status') ?? '',
        rewardType = params.get('rewardType') ?? '';
      if (filter && !(PROMOTION_STATUSES as readonly string[]).includes(filter))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      if (rewardType && !(PROMOTION_REWARD_TYPES as readonly string[]).includes(rewardType))
        throw new RecordError(400, 'ประเภทรางวัลไม่ถูกต้อง');
      const where = Prisma.sql`pr.deleted_at IS NULL AND (pr.code ILIKE ${like} OR pr.name ILIKE ${like} OR EXISTS (SELECT 1 FROM promotion_products sp JOIN products s ON s.id=sp.product_id WHERE sp.promotion_id=pr.id AND (s.name ILIKE ${like} OR s.code ILIKE ${like}))) ${filter ? Prisma.sql`AND ${status(today)}=${filter}` : Prisma.empty} ${rewardType ? Prisma.sql`AND pr.reward_type=${rewardType}` : Prisma.empty}`;
      const order = sqlTableOrder(
        params,
        {
          code: Prisma.sql`pr.code`,
          name: Prisma.sql`pr.name`,
          startsOn: Prisma.sql`pr.starts_on`,
          endsOn: Prisma.sql`pr.ends_on`,
          rewardType: Prisma.sql`pr.reward_type`,
          status: status(today),
        },
        Prisma.sql`pr.created_at DESC,pr.id`,
        Prisma.sql`pr.id`,
      );
      const rows = await query<PromotionRow>(
        tx,
        Prisma.sql`SELECT ${promotionSelect(today)} FROM ${promotionFrom} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${promotionFrom} WHERE ${where}`,
      );
      return { ...pageResult(rows, count[0].total, offset, limit), actor };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
