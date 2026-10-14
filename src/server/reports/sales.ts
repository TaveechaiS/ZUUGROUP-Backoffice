import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { customerScope } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { page, pageResult, query, type Actor } from '@/server/operations/service';
import { reportRange, likeOf } from './range';
import type { SalesReportSummary } from '@/types/api/reports';

export const SALES_REPORT_VIEWS = [
  'summary',
  'products',
  'customers',
  'sellers',
  'details',
] as const;
type View = (typeof SALES_REPORT_VIEWS)[number];

const sold = Prisma.sql`(
  SELECT o.id AS order_id,o.code AS order_code,o.customer_id,o.created_by_id,
    (SELECT (max(m.occurred_at) AT TIME ZONE 'Asia/Bangkok')::date FROM stock_movements m WHERE m.source_id=o.id AND m.kind='ขาย') AS sold_on,
    li.id AS line_id,li.product_id,li.product_name,li.quantity,li.unit_price,li.discount,
    round((li.quantity*li.unit_price-li.discount)-CASE WHEN g.gross>0 THEN o.bill_discount*(li.quantity*li.unit_price-li.discount)/g.gross ELSE 0 END,2) AS total
  FROM sales_orders o JOIN sales_order_lines li ON li.order_id=o.id AND NOT li.is_gift
  CROSS JOIN LATERAL (SELECT sum(x.quantity*x.unit_price-x.discount) AS gross FROM sales_order_lines x WHERE x.order_id=o.id AND NOT x.is_gift) g
  WHERE o.deleted_at IS NULL AND o.workflow_managed AND o.status='เสร็จสิ้น'
) s`;
const net = (value: Prisma.Sql) => Prisma.sql`round(${value}/1.07,2)`;

const views: Record<
  View,
  {
    select: Prisma.Sql;
    from: (base: Prisma.Sql) => Prisma.Sql;
    group?: Prisma.Sql;
    search: (like: string) => Prisma.Sql;
    sort: Record<string, Prisma.Sql>;
    fallback: Prisma.Sql;
    tie: Prisma.Sql;
  }
> = {
  summary: {
    select: Prisma.sql`s.sold_on::text AS "soldOn",count(DISTINCT s.order_id)::int AS orders,sum(s.quantity)::int AS quantity,sum(s.total)::numeric(14,2)::text AS total,${net(Prisma.sql`sum(s.total)`)}::text AS net`,
    from: (base) => base,
    group: Prisma.sql`s.sold_on`,
    search: () => Prisma.sql`true`,
    sort: {
      soldOn: Prisma.sql`s.sold_on`,
      orders: Prisma.sql`count(DISTINCT s.order_id)`,
      quantity: Prisma.sql`sum(s.quantity)`,
      total: Prisma.sql`sum(s.total)`,
    },
    fallback: Prisma.sql`s.sold_on DESC`,
    tie: Prisma.sql`s.sold_on`,
  },
  products: {
    select: Prisma.sql`s.product_id AS id,COALESCE(p.code,'') AS code,max(s.product_name) AS name,COALESCE(p.unit,'') AS unit,count(DISTINCT s.order_id)::int AS orders,sum(s.quantity)::int AS quantity,sum(s.total)::numeric(14,2)::text AS total,${net(Prisma.sql`sum(s.total)`)}::text AS net`,
    from: (base) => Prisma.sql`${base} LEFT JOIN products p ON p.id=s.product_id`,
    group: Prisma.sql`s.product_id,p.code,p.unit`,
    search: (like) => Prisma.sql`(s.product_name ILIKE ${like} OR p.code ILIKE ${like})`,
    sort: {
      code: Prisma.sql`p.code`,
      name: Prisma.sql`max(s.product_name)`,
      orders: Prisma.sql`count(DISTINCT s.order_id)`,
      quantity: Prisma.sql`sum(s.quantity)`,
      total: Prisma.sql`sum(s.total)`,
    },
    fallback: Prisma.sql`sum(s.total) DESC`,
    tie: Prisma.sql`s.product_id`,
  },
  customers: {
    select: Prisma.sql`s.customer_id AS id,COALESCE(c.code,'') AS code,COALESCE(c.name,'-') AS name,COALESCE(t.name,'-') AS "territoryName",count(DISTINCT s.order_id)::int AS orders,sum(s.quantity)::int AS quantity,sum(s.total)::numeric(14,2)::text AS total,${net(Prisma.sql`sum(s.total)`)}::text AS net`,
    from: (base) =>
      Prisma.sql`${base} LEFT JOIN customers c ON c.id=s.customer_id LEFT JOIN sales_territories t ON t.id=c.territory_id`,
    group: Prisma.sql`s.customer_id,c.code,c.name,t.name`,
    search: (like) => Prisma.sql`(c.name ILIKE ${like} OR c.code ILIKE ${like})`,
    sort: {
      code: Prisma.sql`c.code`,
      name: Prisma.sql`c.name`,
      territoryName: Prisma.sql`t.name`,
      orders: Prisma.sql`count(DISTINCT s.order_id)`,
      total: Prisma.sql`sum(s.total)`,
    },
    fallback: Prisma.sql`sum(s.total) DESC`,
    tie: Prisma.sql`s.customer_id`,
  },
  sellers: {
    select: Prisma.sql`s.created_by_id AS id,COALESCE(u.employee_code,'') AS code,COALESCE(u.name,'-') AS name,count(DISTINCT s.order_id)::int AS orders,count(DISTINCT s.customer_id)::int AS customers,sum(s.total)::numeric(14,2)::text AS total,${net(Prisma.sql`sum(s.total)`)}::text AS net`,
    from: (base) => Prisma.sql`${base} LEFT JOIN users u ON u.id=s.created_by_id`,
    group: Prisma.sql`s.created_by_id,u.employee_code,u.name`,
    search: (like) => Prisma.sql`(u.name ILIKE ${like} OR u.employee_code ILIKE ${like})`,
    sort: {
      code: Prisma.sql`u.employee_code`,
      name: Prisma.sql`u.name`,
      orders: Prisma.sql`count(DISTINCT s.order_id)`,
      customers: Prisma.sql`count(DISTINCT s.customer_id)`,
      total: Prisma.sql`sum(s.total)`,
    },
    fallback: Prisma.sql`sum(s.total) DESC`,
    tie: Prisma.sql`s.created_by_id`,
  },
  details: {
    select: Prisma.sql`s.line_id AS id,s.sold_on::text AS "soldOn",s.order_id AS "orderId",s.order_code AS "orderCode",COALESCE(c.name,'-') AS "customerName",COALESCE(p.code,'') AS "productCode",s.product_name AS "productName",COALESCE(p.unit,'') AS unit,s.quantity,s.unit_price::text AS "unitPrice",s.discount::text AS discount,s.total::text AS total`,
    from: (base) =>
      Prisma.sql`${base} LEFT JOIN customers c ON c.id=s.customer_id LEFT JOIN products p ON p.id=s.product_id`,
    search: (like) =>
      Prisma.sql`(s.order_code ILIKE ${like} OR c.name ILIKE ${like} OR s.product_name ILIKE ${like} OR p.code ILIKE ${like})`,
    sort: {
      soldOn: Prisma.sql`s.sold_on`,
      orderCode: Prisma.sql`s.order_code`,
      customerName: Prisma.sql`c.name`,
      productName: Prisma.sql`s.product_name`,
      quantity: Prisma.sql`s.quantity`,
      total: Prisma.sql`s.total`,
    },
    fallback: Prisma.sql`s.sold_on DESC,s.order_code DESC`,
    tie: Prisma.sql`s.line_id`,
  },
};

export async function salesReport(actor: Actor, view: string, params: URLSearchParams) {
  if (!(SALES_REPORT_VIEWS as readonly string[]).includes(view))
    throw new RecordError(404, 'ไม่พบรายงาน');
  const v = views[view as View];
  const { from, to } = reportRange(params);
  const { offset, limit, search } = page(params);
  const base = v.from(sold);
  const where = Prisma.sql`s.sold_on BETWEEN ${from}::date AND ${to}::date AND ${search ? v.search(likeOf(search)) : Prisma.sql`true`} ${customerScope(actor, Prisma.sql`s.customer_id`)}`;
  const groupBy = v.group ? Prisma.sql`GROUP BY ${v.group}` : Prisma.empty;
  const order = sqlTableOrder(params, v.sort, v.fallback, v.tie);
  return getPrismaClient().$transaction(
    async (tx) => {
      const rows = await query<Record<string, unknown>>(
        tx,
        Prisma.sql`SELECT ${v.select} FROM ${base} WHERE ${where} ${groupBy} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        v.group
          ? Prisma.sql`SELECT count(*)::int AS total FROM (SELECT 1 FROM ${base} WHERE ${where} ${groupBy}) g`
          : Prisma.sql`SELECT count(*)::int AS total FROM ${base} WHERE ${where}`,
      );
      const summary = (
        await query<SalesReportSummary>(
          tx,
          Prisma.sql`SELECT count(DISTINCT s.order_id)::int AS orders,COALESCE(sum(s.quantity),0)::int AS quantity,COALESCE(sum(s.total),0)::numeric(14,2)::text AS total,${net(Prisma.sql`COALESCE(sum(s.total),0)`)}::text AS net FROM ${base} WHERE ${where}`,
        )
      )[0];
      return {
        ...pageResult(rows, count[0].total, offset, limit),
        summary,
        range: { from, to },
        actor,
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
