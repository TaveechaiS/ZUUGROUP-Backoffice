import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { allowRead } from '@/server/access/scope';
import { getPrismaClient } from '@/server/db/prisma';
import { RecordError } from '@/server/validation/records';
import { sqlTableOrder } from '@/server/validation/table-sort';
import { bangkokDay } from '@/server/operations/domain';
import { page, pageResult, query, type Actor } from '@/server/operations/service';
import { reportRange, likeOf } from './range';

export const FINANCE_REPORT_VIEWS = ['aging', 'payments', 'expenses'] as const;
type View = (typeof FINANCE_REPORT_VIEWS)[number];

export const paid = Prisma.sql`COALESCE((SELECT sum(p.amount) FROM invoice_payments p WHERE p.invoice_id=i.id AND p.voided_at IS NULL),0)`;
const bucket = (today: string, test: Prisma.Sql) =>
  Prisma.sql`COALESCE(sum(i.amount-${paid}) FILTER (WHERE ${test}),0)::numeric(14,2)::text`;

const specs: Record<
  View,
  {
    select: (today: string) => Prisma.Sql;
    from: Prisma.Sql;
    where: (like: string, range: { from: string; to: string }, today: string) => Prisma.Sql;
    group?: Prisma.Sql;
    total: Prisma.Sql;
    sort: Record<string, Prisma.Sql>;
    fallback: Prisma.Sql;
    tie: Prisma.Sql;
  }
> = {
  aging: {
    select: (today) =>
      Prisma.sql`c.id,c.code,c.name,count(*)::int AS invoices,${bucket(today, Prisma.sql`i.due_date>=${today}::date`)} AS current,${bucket(today, Prisma.sql`${today}::date-i.due_date BETWEEN 1 AND 30`)} AS "d30",${bucket(today, Prisma.sql`${today}::date-i.due_date BETWEEN 31 AND 60`)} AS "d60",${bucket(today, Prisma.sql`${today}::date-i.due_date BETWEEN 61 AND 90`)} AS "d90",${bucket(today, Prisma.sql`${today}::date-i.due_date>90`)} AS "over90",sum(i.amount-${paid})::numeric(14,2)::text AS outstanding`,
    from: Prisma.sql`invoices i JOIN customers c ON c.id=i.customer_id`,
    where: (like) =>
      Prisma.sql`i.deleted_at IS NULL AND i.status IN ('ค้างชำระ','ชำระบางส่วน') AND (c.name ILIKE ${like} OR c.code ILIKE ${like})`,
    group: Prisma.sql`c.id,c.code,c.name`,
    total: Prisma.sql`COALESCE(sum(i.amount-${paid}),0)::numeric(14,2)::text`,
    sort: {
      name: Prisma.sql`c.name`,
      invoices: Prisma.sql`count(*)`,
      outstanding: Prisma.sql`sum(i.amount-${paid})`,
    },
    fallback: Prisma.sql`sum(i.amount-${paid}) DESC`,
    tie: Prisma.sql`c.id`,
  },
  payments: {
    select: () =>
      Prisma.sql`p.id,p.paid_on::text AS "paidOn",i.id AS "invoiceId",i.code AS "invoiceCode",c.name AS "customerName",p.method,p.reference,p.amount::text AS amount,u.name AS "createdByName"`,
    from: Prisma.sql`invoice_payments p JOIN invoices i ON i.id=p.invoice_id JOIN customers c ON c.id=i.customer_id JOIN users u ON u.id=p.created_by_id`,
    where: (like, range) =>
      Prisma.sql`p.voided_at IS NULL AND p.paid_on BETWEEN ${range.from}::date AND ${range.to}::date AND (i.code ILIKE ${like} OR c.name ILIKE ${like} OR p.reference ILIKE ${like})`,
    total: Prisma.sql`COALESCE(sum(p.amount),0)::numeric(14,2)::text`,
    sort: {
      paidOn: Prisma.sql`p.paid_on`,
      invoiceCode: Prisma.sql`i.code`,
      customerName: Prisma.sql`c.name`,
      method: Prisma.sql`p.method`,
      amount: Prisma.sql`p.amount`,
    },
    fallback: Prisma.sql`p.paid_on DESC,p.created_at DESC`,
    tie: Prisma.sql`p.id`,
  },
  expenses: {
    select: () =>
      Prisma.sql`o.id,o.name,count(e.id)::int AS count,COALESCE(sum(e.amount),0)::numeric(14,2)::text AS amount`,
    from: Prisma.sql`expenses e JOIN customer_options o ON o.id=e.category_id`,
    where: (like, range) =>
      Prisma.sql`e.deleted_at IS NULL AND e.status='บันทึกแล้ว' AND e.expense_date BETWEEN ${range.from}::date AND ${range.to}::date AND o.name ILIKE ${like}`,
    group: Prisma.sql`o.id,o.name`,
    total: Prisma.sql`COALESCE(sum(e.amount),0)::numeric(14,2)::text`,
    sort: {
      name: Prisma.sql`o.name`,
      count: Prisma.sql`count(e.id)`,
      amount: Prisma.sql`sum(e.amount)`,
    },
    fallback: Prisma.sql`sum(e.amount) DESC`,
    tie: Prisma.sql`o.id`,
  },
};

export async function financeReport(actor: Actor, view: string, params: URLSearchParams) {
  allowRead(actor, ['ADMIN', 'ACCOUNTING_CFO', 'MANAGER']);
  if (!(FINANCE_REPORT_VIEWS as readonly string[]).includes(view))
    throw new RecordError(404, 'ไม่พบรายงาน');
  const spec = specs[view as View];
  const today = bangkokDay();
  const range = view === 'aging' ? { from: today, to: today } : reportRange(params);
  const { offset, limit, search } = page(params);
  const where = spec.where(likeOf(search), range, today);
  const groupBy = spec.group ? Prisma.sql`GROUP BY ${spec.group}` : Prisma.empty;
  const order = sqlTableOrder(params, spec.sort, spec.fallback, spec.tie);
  return getPrismaClient().$transaction(
    async (tx) => {
      const rows = await query<Record<string, unknown>>(
        tx,
        Prisma.sql`SELECT ${spec.select(today)} FROM ${spec.from} WHERE ${where} ${groupBy} ORDER BY ${order} OFFSET ${offset} LIMIT ${limit}`,
      );
      const count = await query<{ total: number }>(
        tx,
        spec.group
          ? Prisma.sql`SELECT count(*)::int AS total FROM (SELECT 1 FROM ${spec.from} WHERE ${where} ${groupBy}) g`
          : Prisma.sql`SELECT count(*)::int AS total FROM ${spec.from} WHERE ${where}`,
      );
      const sum = await query<{ amount: string }>(
        tx,
        Prisma.sql`SELECT ${spec.total} AS amount FROM ${spec.from} WHERE ${where}`,
      );
      return {
        ...pageResult(rows, count[0].total, offset, limit),
        totalAmount: sum[0].amount,
        range,
        actor,
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
