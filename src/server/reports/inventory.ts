import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { addDays, bangkokDay } from '@/server/operations/domain';
import { page, pageResult, query, seesCost, type Actor } from '@/server/operations/service';
import { reportRange, likeOf } from './range';

export const INVENTORY_REPORT_VIEWS = [
  'summary',
  'movements',
  'expiry',
  'low-stock',
  'counts',
] as const;
export const MOVEMENT_KINDS = [
  'รับเข้า',
  'แก้รับเข้า',
  'ขาย',
  'โอนออก',
  'โอนเข้า',
  'ปรับยอด',
  'ทำลายแล้ว',
] as const;
const EXPIRY_DAYS = 90;
const LOW_STOCK = 50;

const stockByProduct = Prisma.sql`LEFT JOIN LATERAL (
  SELECT
    COALESCE(sum(b.quantity) FILTER (WHERE w.code='MAIN'),0)::int AS main,
    COALESCE(sum(b.reserved) FILTER (WHERE w.code='MAIN'),0)::int AS reserved,
    COALESCE(sum(b.quantity) FILTER (WHERE w.code='MARKETING'),0)::int AS marketing,
    COALESCE(sum(b.quantity) FILTER (WHERE w.code='DISPOSAL'),0)::int AS disposal,
    COALESCE(sum(b.quantity),0)::int AS quantity,
    COALESCE(sum(b.quantity*l.total_cost/NULLIF(l.received_quantity,0)),0) AS value
  FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id JOIN warehouses w ON w.id=b.warehouse_id
  WHERE l.product_id=p.id
) st ON true`;

type Spec = {
  select: (cost: boolean) => Prisma.Sql;
  from: Prisma.Sql;
  where: (params: URLSearchParams, like: string, range: { from: string; to: string }) => Prisma.Sql;
  sort: Record<string, Prisma.Sql>;
  fallback: Prisma.Sql;
  tie: Prisma.Sql;
  ranged?: boolean;
};

function warehouseFilter(params: URLSearchParams, column: Prisma.Sql) {
  const code = params.get('warehouseCode') ?? '';
  if (!code) return Prisma.sql`true`;
  if (!['MAIN', 'MARKETING', 'DISPOSAL'].includes(code))
    throw new RecordError(400, 'คลังไม่ถูกต้อง');
  return Prisma.sql`${column}=${code}`;
}

const specs: Record<(typeof INVENTORY_REPORT_VIEWS)[number], Spec> = {
  summary: {
    select: (cost) =>
      Prisma.sql`p.id,p.code,p.name,p.unit,st.main,st.reserved,(st.main-st.reserved) AS available,st.marketing,st.disposal,st.quantity,${cost ? Prisma.sql`round(st.value,2)::text` : Prisma.sql`NULL`} AS value`,
    from: Prisma.sql`products p ${stockByProduct}`,
    where: (_, like) =>
      Prisma.sql`p.deleted_at IS NULL AND (p.name ILIKE ${like} OR p.code ILIKE ${like})`,
    sort: {
      code: Prisma.sql`p.code`,
      name: Prisma.sql`p.name`,
      main: Prisma.sql`st.main`,
      available: Prisma.sql`st.main-st.reserved`,
      marketing: Prisma.sql`st.marketing`,
      disposal: Prisma.sql`st.disposal`,
      quantity: Prisma.sql`st.quantity`,
    },
    fallback: Prisma.sql`p.code`,
    tie: Prisma.sql`p.id`,
  },
  movements: {
    select: () =>
      Prisma.sql`m.id,m.occurred_at AS "occurredAt",m.kind,m.quantity,m.reason,p.code AS "productCode",p.name AS "productName",p.unit,l.lot_number AS "lotNumber",r.code AS "receiptCode",l.id AS "lotId",w.name AS "warehouseName",COALESCE((SELECT x.code FROM stock_receipts x WHERE x.id=m.source_id),(SELECT o.code FROM sales_orders o WHERE o.id=m.source_id),'') AS reference,(SELECT o.id FROM sales_orders o WHERE o.id=m.source_id) AS "orderId",u.name AS "actorName"`,
    from: Prisma.sql`stock_movements m JOIN product_lots l ON l.id=m.lot_id JOIN products p ON p.id=l.product_id JOIN stock_receipts r ON r.id=l.receipt_id JOIN warehouses w ON w.id=m.warehouse_id JOIN users u ON u.id=m.actor_user_id`,
    where: (params, like, range) => {
      const kind = params.get('kind') ?? '';
      if (kind && !(MOVEMENT_KINDS as readonly string[]).includes(kind))
        throw new RecordError(400, 'ประเภทความเคลื่อนไหวไม่ถูกต้อง');
      return Prisma.sql`(m.occurred_at AT TIME ZONE 'Asia/Bangkok')::date BETWEEN ${range.from}::date AND ${range.to}::date AND ${warehouseFilter(params, Prisma.sql`w.code`)} ${kind ? Prisma.sql`AND m.kind=${kind}` : Prisma.empty} AND (p.name ILIKE ${like} OR p.code ILIKE ${like} OR l.lot_number ILIKE ${like} OR r.code ILIKE ${like})`;
    },
    sort: {
      occurredAt: Prisma.sql`m.occurred_at`,
      kind: Prisma.sql`m.kind`,
      productName: Prisma.sql`p.name`,
      warehouseName: Prisma.sql`w.name`,
      quantity: Prisma.sql`m.quantity`,
    },
    fallback: Prisma.sql`m.occurred_at DESC`,
    tie: Prisma.sql`m.id`,
    ranged: true,
  },
  expiry: {
    select: () =>
      Prisma.sql`l.id||':'||w.id AS id,l.id AS "lotId",p.code AS "productCode",p.name AS "productName",p.unit,l.lot_number AS "lotNumber",r.code AS "receiptCode",l.expires_on::text AS "expiresOn",(l.expires_on-${bangkokDay()}::date)::int AS "daysLeft",w.name AS "warehouseName",b.quantity`,
    from: Prisma.sql`stock_balances b JOIN product_lots l ON l.id=b.lot_id JOIN products p ON p.id=l.product_id JOIN stock_receipts r ON r.id=l.receipt_id JOIN warehouses w ON w.id=b.warehouse_id`,
    where: (params, like) =>
      Prisma.sql`b.quantity>0 AND l.expires_on<=${addDays(bangkokDay(), EXPIRY_DAYS)}::date AND ${warehouseFilter(params, Prisma.sql`w.code`)} AND (p.name ILIKE ${like} OR p.code ILIKE ${like} OR l.lot_number ILIKE ${like} OR r.code ILIKE ${like})`,
    sort: {
      productName: Prisma.sql`p.name`,
      expiresOn: Prisma.sql`l.expires_on`,
      warehouseName: Prisma.sql`w.name`,
      quantity: Prisma.sql`b.quantity`,
    },
    fallback: Prisma.sql`l.expires_on,p.name`,
    tie: Prisma.sql`l.id,w.id`,
  },
  'low-stock': {
    select: () =>
      Prisma.sql`p.id,p.code,p.name,p.unit,st.main,st.reserved,(st.main-st.reserved) AS available,st.marketing,st.quantity,CASE WHEN st.main=0 THEN 'สินค้าหมด' ELSE 'สินค้าใกล้หมด' END AS status`,
    from: Prisma.sql`products p ${stockByProduct}`,
    where: (params, like) => {
      const status = params.get('status') ?? '';
      if (status && !['สินค้าหมด', 'สินค้าใกล้หมด'].includes(status))
        throw new RecordError(400, 'สถานะไม่ถูกต้อง');
      return Prisma.sql`p.deleted_at IS NULL AND p.status='ACTIVE' AND st.main<=${LOW_STOCK} ${status === 'สินค้าหมด' ? Prisma.sql`AND st.main=0` : status ? Prisma.sql`AND st.main>0` : Prisma.empty} AND (p.name ILIKE ${like} OR p.code ILIKE ${like})`;
    },
    sort: {
      code: Prisma.sql`p.code`,
      name: Prisma.sql`p.name`,
      main: Prisma.sql`st.main`,
      available: Prisma.sql`st.main-st.reserved`,
      quantity: Prisma.sql`st.quantity`,
    },
    fallback: Prisma.sql`st.main,p.code`,
    tie: Prisma.sql`p.id`,
  },
  counts: {
    select: () =>
      Prisma.sql`s.id,s.code,s.name,s.status,COALESCE(w.name,'-') AS "warehouseName",s.result_text AS "resultText",s.notes,COALESCE(NULLIF(s.owner,''),'-') AS owner,s.created_at AS "createdAt"`,
    from: Prisma.sql`stock_count_sessions s LEFT JOIN warehouses w ON w.id=s.warehouse_id`,
    where: (params, like, range) =>
      Prisma.sql`s.deleted_at IS NULL AND (s.created_at AT TIME ZONE 'Asia/Bangkok')::date BETWEEN ${range.from}::date AND ${range.to}::date AND ${warehouseFilter(params, Prisma.sql`w.code`)} AND (s.code ILIKE ${like} OR s.name ILIKE ${like} OR s.result_text ILIKE ${like})`,
    sort: {
      code: Prisma.sql`s.code`,
      createdAt: Prisma.sql`s.created_at`,
      warehouseName: Prisma.sql`w.name`,
      status: Prisma.sql`s.status`,
    },
    fallback: Prisma.sql`s.created_at DESC`,
    tie: Prisma.sql`s.id`,
    ranged: true,
  },
};

export async function inventoryReport(actor: Actor, view: string, params: URLSearchParams) {
  if (!(INVENTORY_REPORT_VIEWS as readonly string[]).includes(view))
    throw new RecordError(404, 'ไม่พบรายงาน');
  const spec = specs[view as (typeof INVENTORY_REPORT_VIEWS)[number]];
  const cost = seesCost(actor);
  const range = spec.ranged ? reportRange(params) : undefined;
  const { offset, limit, search } = page(params);
  const where = spec.where(params, likeOf(search), range ?? { from: '', to: '' });
  const sort = cost ? { ...spec.sort, value: Prisma.sql`st.value` } : spec.sort;
  const order = sqlTableOrder(
    params,
    view === 'summary' ? sort : spec.sort,
    spec.fallback,
    spec.tie,
  );
  return getPrismaClient().$transaction(
    async (tx) => {
      const rows = await query<Record<string, unknown>>(
        tx,
        Prisma.sql`SELECT ${spec.select(cost)} FROM ${spec.from} WHERE ${where} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        Prisma.sql`SELECT count(*)::int AS total FROM ${spec.from} WHERE ${where}`,
      );
      return {
        ...pageResult(rows, count[0].total, offset, limit),
        ...(range ? { range } : {}),
        seesCost: cost,
        actor,
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
