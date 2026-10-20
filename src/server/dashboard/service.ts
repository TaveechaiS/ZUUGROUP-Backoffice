import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { customerScope } from '@/server/access/scope';
import { readWithConnectionRetry } from '@/server/db/prisma';
import { addDays, addMonths, bangkokDay } from '@/server/operations/domain';
import type { Actor } from '@/server/operations/service';
import { paid } from '@/server/reports/finance';
import { EXPIRY_DAYS, LOW_STOCK, stockByProduct } from '@/server/reports/inventory';
import { sold } from '@/server/reports/sales';
import type { Dashboard, DashboardExpiringLot, DashboardTask } from '@/types/api/reports';
import { dashboardSections } from './sections';

const QUOTE_PENDING = 'รออนุมัติ';

export async function dashboardData(actor: Actor): Promise<Dashboard> {
  const today = bangkokDay();
  const monthStart = today.slice(0, 8) + '01';
  const prevStart = addMonths(monthStart, -1);
  const prevEnd = addMonths(today, -1);
  const trendStart = addMonths(monthStart, -11);
  const sections = dashboardSections(actor.roleId);
  const scope = customerScope(actor, Prisma.sql`s.customer_id`);
  return readWithConnectionRetry((db) =>
    db.$transaction(
      async (tx) => {
        const [month] = await tx.$queryRaw<
          { total: string; orders: number; prevTotal: string; prevOrders: number }[]
        >(
          Prisma.sql`SELECT COALESCE(sum(s.total) FILTER (WHERE s.sold_on>=${monthStart}::date),0)::numeric(14,2)::text AS total,count(DISTINCT s.order_id) FILTER (WHERE s.sold_on>=${monthStart}::date)::int AS orders,COALESCE(sum(s.total) FILTER (WHERE s.sold_on<${monthStart}::date),0)::numeric(14,2)::text AS "prevTotal",count(DISTINCT s.order_id) FILTER (WHERE s.sold_on<${monthStart}::date)::int AS "prevOrders" FROM ${sold} WHERE ((s.sold_on BETWEEN ${monthStart}::date AND ${today}::date) OR (s.sold_on BETWEEN ${prevStart}::date AND ${prevEnd}::date)) ${scope}`,
        );
        const trend = await tx.$queryRaw<{ month: string; total: string; orders: number }[]>(
          Prisma.sql`SELECT to_char(g.m,'YYYY-MM') AS month,COALESCE(sum(s.total),0)::numeric(14,2)::text AS total,count(DISTINCT s.order_id)::int AS orders FROM generate_series(${trendStart}::date,${monthStart}::date,interval '1 month') g(m) LEFT JOIN ${sold} ON date_trunc('month',s.sold_on)=g.m AND s.sold_on<=${today}::date ${scope} GROUP BY g.m ORDER BY g.m`,
        );
        const topProducts = await tx.$queryRaw<
          { id: string; name: string; unit: string; quantity: number; total: string }[]
        >(
          Prisma.sql`SELECT s.product_id AS id,max(s.product_name) AS name,COALESCE(max(p.unit),'') AS unit,sum(s.quantity)::int AS quantity,sum(s.total)::numeric(14,2)::text AS total FROM ${sold} LEFT JOIN products p ON p.id=s.product_id WHERE s.sold_on BETWEEN ${monthStart}::date AND ${today}::date ${scope} GROUP BY s.product_id ORDER BY sum(s.total) DESC,s.product_id LIMIT 5`,
        );
        const topCustomers = await tx.$queryRaw<
          { id: string; name: string; orders: number; total: string }[]
        >(
          Prisma.sql`SELECT s.customer_id AS id,COALESCE(max(c.name),'-') AS name,count(DISTINCT s.order_id)::int AS orders,sum(s.total)::numeric(14,2)::text AS total FROM ${sold} LEFT JOIN customers c ON c.id=s.customer_id WHERE s.sold_on BETWEEN ${monthStart}::date AND ${today}::date ${scope} GROUP BY s.customer_id ORDER BY sum(s.total) DESC,s.customer_id LIMIT 5`,
        );

        let finance: Dashboard['finance'] = null;
        if (sections.finance) {
          const [debt] = await tx.$queryRaw<
            {
              outstanding: string;
              overdue: string;
              overdueInvoices: number;
              current: string;
              d30: string;
              d60: string;
              d90: string;
              over90: string;
            }[]
          >(
            Prisma.sql`SELECT COALESCE(sum(i.amount-${paid}),0)::numeric(14,2)::text AS outstanding,COALESCE(sum(i.amount-${paid}) FILTER (WHERE i.due_date<${today}::date),0)::numeric(14,2)::text AS overdue,count(*) FILTER (WHERE i.due_date<${today}::date)::int AS "overdueInvoices",COALESCE(sum(i.amount-${paid}) FILTER (WHERE i.due_date>=${today}::date),0)::numeric(14,2)::text AS current,COALESCE(sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date BETWEEN 1 AND 30),0)::numeric(14,2)::text AS d30,COALESCE(sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date BETWEEN 31 AND 60),0)::numeric(14,2)::text AS d60,COALESCE(sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date BETWEEN 61 AND 90),0)::numeric(14,2)::text AS d90,COALESCE(sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date>90),0)::numeric(14,2)::text AS over90 FROM invoices i WHERE i.deleted_at IS NULL AND i.status IN ('ค้างชำระ','ชำระบางส่วน')`,
          );
          const [received] = await tx.$queryRaw<{ amount: string; count: number }[]>(
            Prisma.sql`SELECT COALESCE(sum(p.amount),0)::numeric(14,2)::text AS amount,count(*)::int AS count FROM invoice_payments p WHERE p.voided_at IS NULL AND p.paid_on BETWEEN ${monthStart}::date AND ${today}::date`,
          );
          const { current, d30, d60, d90, over90, ...totals } = debt;
          finance = {
            ...totals,
            receivedThisMonth: received.amount,
            paymentsThisMonth: received.count,
            aging: { current, d30, d60, d90, over90 },
          };
        }

        let inventory: Dashboard['inventory'] = null;
        if (sections.inventory) {
          const expiring = await tx.$queryRaw<DashboardExpiringLot[]>(
            Prisma.sql`SELECT l.id,p.name AS "productName",l.lot_number AS "lotNumber",l.expires_on::text AS "expiresOn",(l.expires_on-${today}::date)::int AS "daysLeft",sum(b.quantity)::int AS quantity FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id JOIN products p ON p.id=l.product_id WHERE b.quantity>0 AND l.expires_on<=${addDays(today, EXPIRY_DAYS)}::date GROUP BY l.id,p.name ORDER BY l.expires_on,p.name,l.id LIMIT 5`,
          );
          const lowStock = await tx.$queryRaw<
            { id: string; code: string; name: string; unit: string; main: number }[]
          >(
            Prisma.sql`SELECT p.id,p.code,p.name,p.unit,st.main FROM products p ${stockByProduct} WHERE p.deleted_at IS NULL AND p.status='ACTIVE' AND st.main<=${LOW_STOCK} ORDER BY st.main,p.code,p.id LIMIT 5`,
          );
          const [counts] = await tx.$queryRaw<{ expiring: number; lowStock: number }[]>(
            Prisma.sql`SELECT (SELECT count(DISTINCT b.lot_id)::int FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id WHERE b.quantity>0 AND l.expires_on<=${addDays(today, EXPIRY_DAYS)}::date) AS expiring,(SELECT count(*)::int FROM products p ${stockByProduct} WHERE p.deleted_at IS NULL AND p.status='ACTIVE' AND st.main<=${LOW_STOCK}) AS "lowStock"`,
          );
          inventory = {
            expiring,
            lowStock,
            expiringCount: counts.expiring,
            lowStockCount: counts.lowStock,
            expiryDays: EXPIRY_DAYS,
            lowStockLevel: LOW_STOCK,
          };
        }

        const [work] = await tx.$queryRaw<
          { quotes: number; followToday: number; followLate: number; requests: number }[]
        >(
          Prisma.sql`SELECT (SELECT count(*)::int FROM quotations q WHERE q.deleted_at IS NULL AND q.status=${QUOTE_PENDING} ${customerScope(actor, Prisma.sql`q.customer_id`)}) AS quotes,(SELECT count(*)::int FROM customer_follow_ups f WHERE f.deleted_at IS NULL AND f.status='รอติดตาม' AND f.next_on=${today}::date ${customerScope(actor, Prisma.sql`f.customer_id`)}) AS "followToday",(SELECT count(*)::int FROM customer_follow_ups f WHERE f.deleted_at IS NULL AND f.status='รอติดตาม' AND f.next_on<${today}::date ${customerScope(actor, Prisma.sql`f.customer_id`)}) AS "followLate",(SELECT count(*)::int FROM customer_create_requests r WHERE r.status='submitted') AS requests`,
        );
        const tasks: DashboardTask[] = [
          {
            key: 'quotes',
            label: 'ใบเสนอราคารออนุมัติ',
            count: work.quotes,
            href: '/quotes',
            tone: 'warning',
          },
          {
            key: 'followToday',
            label: 'ติดตามลูกค้าครบนัดวันนี้',
            count: work.followToday,
            href: '/customers/dashboard',
            tone: 'info',
          },
          {
            key: 'followLate',
            label: 'ติดตามลูกค้าเกินนัด',
            count: work.followLate,
            href: '/customers/dashboard',
            tone: 'danger',
          },
        ];
        if (sections.customerRequests)
          tasks.push({
            key: 'requests',
            label: 'คำขอเพิ่มลูกค้ารออนุมัติ',
            count: work.requests,
            href: '/customers/requests',
            tone: 'warning',
          });
        if (finance)
          tasks.push({
            key: 'overdue',
            label: 'ใบแจ้งหนี้เกินกำหนด',
            count: finance.overdueInvoices,
            href: '/billing',
            tone: 'danger',
          });

        const activity = await tx.$queryRaw<
          {
            id: string;
            code: string;
            name: string;
            status: string;
            module: string;
            createdAt: Date;
          }[]
        >(
          Prisma.sql`SELECT * FROM (SELECT q.id,q.code,q.name,q.status,'quotes'::text module,q.created_at AS "createdAt" FROM quotations q WHERE q.deleted_at IS NULL ${customerScope(actor, Prisma.sql`q.customer_id`)} ${sections.purchases ? Prisma.sql`UNION ALL SELECT id,code,name,status,'purchases'::text module,created_at AS "createdAt" FROM purchase_orders WHERE deleted_at IS NULL` : Prisma.empty} ${sections.finance ? Prisma.sql`UNION ALL SELECT id,code,name,status,'billing'::text module,created_at AS "createdAt" FROM invoices WHERE deleted_at IS NULL` : Prisma.empty}) events ORDER BY "createdAt" DESC,id ASC LIMIT 8`,
        );

        return {
          today,
          sales: {
            total: month.total,
            orders: month.orders,
            prevTotal: month.prevTotal,
            prevOrders: month.prevOrders,
            trend,
            topProducts,
            topCustomers,
          },
          finance,
          inventory,
          tasks,
          activity: activity.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
        };
      },
      { isolationLevel: 'RepeatableRead' },
    ),
  );
}
