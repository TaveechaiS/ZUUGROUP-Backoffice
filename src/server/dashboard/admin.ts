import 'server-only';
import { Prisma } from '@/generated/prisma/client';
import { LICENSE_WARNING_DAYS } from '@/config/customers';
import { actionName } from '@/config/audit';
import { readWithConnectionRetry } from '@/server/db/prisma';
import { addDays, bangkokDay } from '@/server/operations/domain';
import type { Tx } from '@/server/operations/service';
import { paid } from '@/server/reports/finance';
import { EXPIRY_DAYS, LOW_STOCK, stockByProduct } from '@/server/reports/inventory';
import { reportRange } from '@/server/reports/range';
import { giftCost, sold } from '@/server/reports/sales';
import { RecordError } from '@/server/validation/records';
import type {
  AdminCount,
  AdminDetails,
  AdminSection,
  AdminSummary,
} from '@/types/api/admin-dashboard';

export const ADMIN_SECTIONS: AdminSection[] = [
  'sales',
  'finance',
  'stock',
  'customers',
  'products',
  'system',
];
const INACTIVE_DAYS = 30;
const PROMOTION_ENDING_DAYS = 14;
const DEAD_DAYS = 90;
const DSO_DAYS = 90;
const QUOTE_EXPIRY_DAYS = 7;
const CREDIT_NEAR = 0.8;
const OPEN_QUOTES = ['รออนุมัติ', 'ส่งกลับแก้ไข', 'อนุมัติ'];

const money = (value: Prisma.Sql) => Prisma.sql`COALESCE(${value},0)::numeric(14,2)::text`;
const open = Prisma.sql`i.deleted_at IS NULL AND i.status IN ('ค้างชำระ','ชำระบางส่วน')`;
export const uninvoiced = Prisma.sql`o.deleted_at IS NULL AND o.workflow_managed AND o.status='เสร็จสิ้น' AND NOT EXISTS (SELECT 1 FROM invoices x WHERE x.sales_order_id=o.id AND x.status<>'ยกเลิก' AND x.deleted_at IS NULL)`;
const openPurchase = Prisma.sql`po.deleted_at IS NULL AND po.status IN ('รอรับสินค้า','รับบางส่วน')`;
const completed = Prisma.sql`(SELECT o.id,(SELECT (max(m.occurred_at) AT TIME ZONE 'Asia/Bangkok')::date FROM stock_movements m WHERE m.source_id=o.id AND m.kind='ขาย') AS sold_on FROM sales_orders o WHERE o.deleted_at IS NULL AND o.workflow_managed AND o.status='เสร็จสิ้น') d`;
const owed = Prisma.sql`(SELECT i.customer_id,sum(i.amount-${paid}) AS amount FROM invoices i WHERE ${open} GROUP BY i.customer_id) w`;
const deadStock = (today: string) =>
  Prisma.sql`(SELECT p.id,p.code,p.name,p.unit,s.quantity,s.value,ls.last_sold AS "lastSoldOn" FROM (SELECT l.product_id,sum(b.quantity)::int AS quantity,COALESCE(sum(b.quantity*l.total_cost/NULLIF(l.received_quantity,0)),0) AS value,(min(l.created_at) AT TIME ZONE 'Asia/Bangkok')::date AS since FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id WHERE b.quantity>0 GROUP BY l.product_id) s JOIN products p ON p.id=s.product_id AND p.deleted_at IS NULL AND p.status='ACTIVE' LEFT JOIN (SELECT l.product_id,((max(m.occurred_at) AT TIME ZONE 'Asia/Bangkok')::date)::text AS last_sold,(max(m.occurred_at) AT TIME ZONE 'Asia/Bangkok')::date AS last_day FROM stock_movements m JOIN product_lots l ON l.id=m.lot_id WHERE m.kind='ขาย' GROUP BY l.product_id) ls ON ls.product_id=s.product_id WHERE s.since<=${addDays(today, -DEAD_DAYS)}::date AND (ls.last_day IS NULL OR ls.last_day<${addDays(today, -DEAD_DAYS)}::date)) dead`;
const pendingQuote = (today: string) =>
  Prisma.sql`q.deleted_at IS NULL AND q.status IN (${Prisma.join(OPEN_QUOTES)}) AND NOT EXISTS (SELECT 1 FROM sales_orders so WHERE so.quotation_id=q.id AND so.deleted_at IS NULL) AND (q.status='รออนุมัติ' OR q.valid_until BETWEEN ${today}::date AND ${addDays(today, QUOTE_EXPIRY_DAYS)}::date)`;
const listedCustomer = Prisma.sql`c.deleted_at IS NULL AND c.details IS NOT NULL`;
const customerStatus = (today: string) =>
  Prisma.sql`CASE WHEN c.status='ใช้งาน' AND c.license_expires_at<${today}::date THEN 'ใบอนุญาตหมดอายุ' WHEN c.status='ใช้งาน' AND c.license_expires_at BETWEEN ${today}::date AND ${today}::date+${LICENSE_WARNING_DAYS}::int THEN 'ใบอนุญาตใกล้หมดอายุ' ELSE c.status END`;
const accountStatus = Prisma.sql`CASE u.status::text WHEN 'ACTIVE' THEN 'ใช้งาน' ELSE 'ระงับการใช้งาน' END`;
const productStatus = Prisma.sql`CASE p.status::text WHEN 'ACTIVE' THEN 'ใช้งาน' ELSE 'ปิดใช้งาน' END`;

function dayCount(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}

export function adminRange(params: URLSearchParams) {
  const { from, to } = reportRange(params);
  const length = dayCount(from, to);
  const prevTo = addDays(from, -1);
  return {
    from,
    to,
    prevFrom: addDays(prevTo, -length),
    prevTo,
    unit: (length > 62 ? 'month' : 'day') as 'day' | 'month',
  };
}

export function adminSection(value: string | null): AdminSection | null {
  if (value === null) return null;
  if (!(ADMIN_SECTIONS as string[]).includes(value))
    throw new RecordError(400, 'หมวดข้อมูลไม่ถูกต้อง');
  return value as AdminSection;
}

const counts = (rows: { label: string; count: number; amount?: string }[]): AdminCount[] =>
  rows.map((row) => ({
    label: row.label,
    count: row.count,
    ...(row.amount !== undefined ? { amount: row.amount } : {}),
  }));

async function summary(tx: Tx, range: ReturnType<typeof adminRange>): Promise<AdminSummary> {
  const today = bangkokDay();
  const { from, to, prevFrom, unit } = range;
  const q = <T>(sql: Prisma.Sql) => tx.$queryRaw<T[]>(sql);
  const inRange = (column: Prisma.Sql, timestamp = false) =>
    timestamp
      ? Prisma.sql`(${column} AT TIME ZONE 'Asia/Bangkok')::date BETWEEN ${from}::date AND ${to}::date`
      : Prisma.sql`${column} BETWEEN ${from}::date AND ${to}::date`;

  const [sales] = await q<{
    total: string;
    orders: number;
    prevTotal: string;
    prevOrders: number;
  }>(
    Prisma.sql`SELECT ${money(Prisma.sql`sum(s.total) FILTER (WHERE s.sold_on>=${from}::date)`)} AS total,count(DISTINCT s.order_id) FILTER (WHERE s.sold_on>=${from}::date)::int AS orders,${money(Prisma.sql`sum(s.total) FILTER (WHERE s.sold_on<${from}::date)`)} AS "prevTotal",count(DISTINCT s.order_id) FILTER (WHERE s.sold_on<${from}::date)::int AS "prevOrders" FROM ${sold} WHERE s.sold_on BETWEEN ${prevFrom}::date AND ${to}::date`,
  );
  const step = unit === 'month' ? Prisma.sql`interval '1 month'` : Prisma.sql`interval '1 day'`;
  const trunc = unit === 'month' ? Prisma.sql`'month'` : Prisma.sql`'day'`;
  const label = unit === 'month' ? Prisma.sql`'YYYY-MM'` : Prisma.sql`'YYYY-MM-DD'`;
  const trend = await q<{ period: string; total: string; orders: number }>(
    Prisma.sql`SELECT to_char(g.p,${label}) AS period,${money(Prisma.sql`sum(s.total)`)} AS total,count(DISTINCT s.order_id)::int AS orders FROM generate_series(date_trunc(${trunc},${from}::date),${to}::date,${step}) g(p) LEFT JOIN ${sold} ON date_trunc(${trunc},s.sold_on)=g.p AND s.sold_on BETWEEN ${from}::date AND ${to}::date GROUP BY g.p ORDER BY g.p`,
  );
  const orderStatuses = await q<{ label: string; count: number; amount: string }>(
    Prisma.sql`SELECT o.status AS label,count(*)::int AS count,${money(Prisma.sql`sum(o.amount)`)} AS amount FROM sales_orders o WHERE o.deleted_at IS NULL AND ${inRange(Prisma.sql`o.created_at`, true)} GROUP BY o.status ORDER BY count(*) DESC,o.status`,
  );
  const quoteStatuses = await q<{ label: string; count: number; amount: string }>(
    Prisma.sql`SELECT q.status AS label,count(*)::int AS count,${money(Prisma.sql`sum(q.amount)`)} AS amount FROM quotations q WHERE q.deleted_at IS NULL AND ${inRange(Prisma.sql`q.created_at`, true)} GROUP BY q.status ORDER BY count(*) DESC,q.status`,
  );
  const [quotes] = await q<{ total: number; converted: number }>(
    Prisma.sql`SELECT count(*)::int AS total,count(*) FILTER (WHERE EXISTS (SELECT 1 FROM sales_orders so WHERE so.quotation_id=q.id AND so.deleted_at IS NULL))::int AS converted FROM quotations q WHERE q.deleted_at IS NULL AND ${inRange(Prisma.sql`q.created_at`, true)}`,
  );

  const [debt] = await q<{
    outstanding: string;
    overdue: string;
    overdueInvoices: number;
    current: string;
    d30: string;
    d60: string;
    d90: string;
    over90: string;
  }>(
    Prisma.sql`SELECT ${money(Prisma.sql`sum(i.amount-${paid})`)} AS outstanding,${money(Prisma.sql`sum(i.amount-${paid}) FILTER (WHERE i.due_date<${today}::date)`)} AS overdue,count(*) FILTER (WHERE i.due_date<${today}::date)::int AS "overdueInvoices",${money(Prisma.sql`sum(i.amount-${paid}) FILTER (WHERE i.due_date>=${today}::date)`)} AS current,${money(Prisma.sql`sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date BETWEEN 1 AND 30)`)} AS d30,${money(Prisma.sql`sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date BETWEEN 31 AND 60)`)} AS d60,${money(Prisma.sql`sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date BETWEEN 61 AND 90)`)} AS d90,${money(Prisma.sql`sum(i.amount-${paid}) FILTER (WHERE ${today}::date-i.due_date>90)`)} AS over90 FROM invoices i WHERE ${open}`,
  );
  const [money1] = await q<{
    issued: number;
    issuedAmount: string;
    received: string;
    payments: number;
    expenses: string;
    expenseCount: number;
    uninvoiced: number;
    uninvoicedAmount: string;
  }>(
    Prisma.sql`SELECT (SELECT count(*)::int FROM invoices i WHERE i.deleted_at IS NULL AND i.status<>'ยกเลิก' AND ${inRange(Prisma.sql`i.issue_date`)}) AS issued,(SELECT ${money(Prisma.sql`sum(i.amount)`)} FROM invoices i WHERE i.deleted_at IS NULL AND i.status<>'ยกเลิก' AND ${inRange(Prisma.sql`i.issue_date`)}) AS "issuedAmount",(SELECT ${money(Prisma.sql`sum(p.amount)`)} FROM invoice_payments p WHERE p.voided_at IS NULL AND ${inRange(Prisma.sql`p.paid_on`)}) AS received,(SELECT count(*)::int FROM invoice_payments p WHERE p.voided_at IS NULL AND ${inRange(Prisma.sql`p.paid_on`)}) AS payments,(SELECT ${money(Prisma.sql`sum(e.amount)`)} FROM expenses e WHERE e.deleted_at IS NULL AND e.status='บันทึกแล้ว' AND ${inRange(Prisma.sql`e.expense_date`)}) AS expenses,(SELECT count(*)::int FROM expenses e WHERE e.deleted_at IS NULL AND e.status='บันทึกแล้ว' AND ${inRange(Prisma.sql`e.expense_date`)}) AS "expenseCount",(SELECT count(*)::int FROM sales_orders o WHERE ${uninvoiced}) AS uninvoiced,(SELECT ${money(Prisma.sql`sum(o.amount)`)} FROM sales_orders o WHERE ${uninvoiced}) AS "uninvoicedAmount"`,
  );
  const expensesByCategory = await q<{ label: string; count: number; amount: string }>(
    Prisma.sql`SELECT COALESCE(o.name,'ไม่ระบุหมวด') AS label,count(*)::int AS count,${money(Prisma.sql`sum(e.amount)`)} AS amount FROM expenses e LEFT JOIN customer_options o ON o.id=e.category_id WHERE e.deleted_at IS NULL AND e.status='บันทึกแล้ว' AND ${inRange(Prisma.sql`e.expense_date`)} GROUP BY o.name ORDER BY sum(e.amount) DESC NULLS LAST,1`,
  );

  const purchaseStatuses = await q<{ label: string; count: number; amount: string }>(
    Prisma.sql`SELECT po.status AS label,count(*)::int AS count,${money(Prisma.sql`sum(po.amount)`)} AS amount FROM purchase_orders po WHERE po.deleted_at IS NULL GROUP BY po.status ORDER BY count(*) DESC,po.status`,
  );
  const expiry = addDays(today, EXPIRY_DAYS);
  const [stock] = await q<{
    late: number;
    inRange: number;
    inRangeAmount: string;
    value: string;
    expiring: number;
    expired: number;
    lowStock: number;
    outOfStock: number;
    countsOpen: number;
    countsClosed: number;
    diffLines: number;
  }>(
    Prisma.sql`SELECT (SELECT count(*)::int FROM purchase_orders po WHERE ${openPurchase} AND po.expected_on<${today}::date) AS late,(SELECT count(*)::int FROM purchase_orders po WHERE po.deleted_at IS NULL AND po.status<>'ยกเลิก' AND ${inRange(Prisma.sql`COALESCE(po.order_date,(po.created_at AT TIME ZONE 'Asia/Bangkok')::date)`)}) AS "inRange",(SELECT ${money(Prisma.sql`sum(po.amount)`)} FROM purchase_orders po WHERE po.deleted_at IS NULL AND po.status<>'ยกเลิก' AND ${inRange(Prisma.sql`COALESCE(po.order_date,(po.created_at AT TIME ZONE 'Asia/Bangkok')::date)`)}) AS "inRangeAmount",(SELECT ${money(Prisma.sql`round(sum(b.quantity*l.total_cost/NULLIF(l.received_quantity,0)),2)`)} FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id) AS value,(SELECT count(DISTINCT b.lot_id)::int FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id WHERE b.quantity>0 AND l.expires_on>${today}::date AND l.expires_on<=${expiry}::date) AS expiring,(SELECT count(DISTINCT b.lot_id)::int FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id WHERE b.quantity>0 AND l.expires_on<=${today}::date) AS expired,(SELECT count(*)::int FROM products p ${stockByProduct} WHERE p.deleted_at IS NULL AND p.status='ACTIVE' AND st.main BETWEEN 1 AND ${LOW_STOCK}) AS "lowStock",(SELECT count(*)::int FROM products p ${stockByProduct} WHERE p.deleted_at IS NULL AND p.status='ACTIVE' AND st.main=0) AS "outOfStock",(SELECT count(*)::int FROM stock_count_sessions s WHERE s.deleted_at IS NULL AND s.status='กำลังนับ') AS "countsOpen",(SELECT count(*)::int FROM stock_count_sessions s WHERE s.deleted_at IS NULL AND s.status='ปิดแล้ว' AND ${inRange(Prisma.sql`s.closed_at`, true)}) AS "countsClosed",(SELECT count(*)::int FROM stock_count_lines li JOIN stock_count_sessions s ON s.id=li.session_id WHERE s.deleted_at IS NULL AND s.status='ปิดแล้ว' AND ${inRange(Prisma.sql`s.closed_at`, true)} AND li.counted_quantity IS DISTINCT FROM li.system_quantity) AS "diffLines"`,
  );
  const warehouses = await q<{ code: string; name: string; quantity: number }>(
    Prisma.sql`SELECT w.code,w.name,COALESCE(sum(b.quantity),0)::int AS quantity FROM warehouses w LEFT JOIN stock_balances b ON b.warehouse_id=w.id GROUP BY w.id,w.code,w.name ORDER BY w.code`,
  );

  const [customer] = await q<{
    total: number;
    created: number;
    expired: number;
    expiring: number;
    requests: number;
    followToday: number;
    followLate: number;
    followInRange: number;
  }>(
    Prisma.sql`SELECT (SELECT count(*)::int FROM customers c WHERE ${listedCustomer}) AS total,(SELECT count(*)::int FROM customers c WHERE ${listedCustomer} AND ${inRange(Prisma.sql`c.created_at`, true)}) AS created,(SELECT count(*)::int FROM customers c WHERE ${listedCustomer} AND ${customerStatus(today)}='ใบอนุญาตหมดอายุ') AS expired,(SELECT count(*)::int FROM customers c WHERE ${listedCustomer} AND ${customerStatus(today)}='ใบอนุญาตใกล้หมดอายุ') AS expiring,(SELECT count(*)::int FROM customer_create_requests r WHERE r.status='submitted') AS requests,(SELECT count(*)::int FROM customer_follow_ups f WHERE f.deleted_at IS NULL AND f.status='รอติดตาม' AND f.next_on=${today}::date) AS "followToday",(SELECT count(*)::int FROM customer_follow_ups f WHERE f.deleted_at IS NULL AND f.status='รอติดตาม' AND f.next_on<${today}::date) AS "followLate",(SELECT count(*)::int FROM customer_follow_ups f WHERE f.deleted_at IS NULL AND ${inRange(Prisma.sql`f.contacted_on`)}) AS "followInRange"`,
  );
  const customerStatuses = await q<{ label: string; count: number }>(
    Prisma.sql`SELECT ${customerStatus(today)} AS label,count(*)::int AS count FROM customers c WHERE ${listedCustomer} GROUP BY 1 ORDER BY 2 DESC,1`,
  );
  const territories = await q<{ label: string; count: number }>(
    Prisma.sql`SELECT COALESCE(NULLIF(t.name,''),'ไม่ระบุเขต') AS label,count(*)::int AS count FROM customers c LEFT JOIN sales_territories t ON t.id=c.territory_id WHERE ${listedCustomer} GROUP BY 1 ORDER BY 2 DESC,1`,
  );
  const groups = await q<{ label: string; count: number }>(
    Prisma.sql`SELECT COALESCE(NULLIF(g.name,''),g.code,'ไม่ระบุกลุ่ม') AS label,count(*)::int AS count FROM customers c LEFT JOIN customer_groups g ON g.id=c.group_id WHERE ${listedCustomer} GROUP BY 1 ORDER BY 2 DESC,1`,
  );

  const productStatuses = await q<{ label: string; count: number }>(
    Prisma.sql`SELECT ${productStatus} AS label,count(*)::int AS count FROM products p WHERE p.deleted_at IS NULL GROUP BY 1 ORDER BY 2 DESC,1`,
  );
  const categories = await q<{ label: string; count: number }>(
    Prisma.sql`SELECT c.name AS label,count(*)::int AS count FROM products p JOIN product_categories c ON c.id=p.category_id WHERE p.deleted_at IS NULL GROUP BY c.name ORDER BY 2 DESC,1`,
  );
  const [promotion] = await q<{ active: number; ending: number; quotes: number; orders: number }>(
    Prisma.sql`SELECT (SELECT count(*)::int FROM promotions m WHERE m.deleted_at IS NULL AND m.status='ใช้งาน' AND (m.ends_on IS NULL OR m.ends_on>=${today}::date)) AS active,(SELECT count(*)::int FROM promotions m WHERE m.deleted_at IS NULL AND m.status='ใช้งาน' AND m.ends_on BETWEEN ${today}::date AND ${addDays(today, PROMOTION_ENDING_DAYS)}::date) AS ending,(SELECT count(*)::int FROM quotations q WHERE q.deleted_at IS NULL AND q.promotion_id IS NOT NULL AND ${inRange(Prisma.sql`q.created_at`, true)}) AS quotes,(SELECT count(*)::int FROM sales_orders o WHERE o.deleted_at IS NULL AND o.promotion_id IS NOT NULL AND ${inRange(Prisma.sql`o.created_at`, true)}) AS orders`,
  );

  const roles = await q<{ label: string; count: number }>(
    Prisma.sql`SELECT r.name AS label,count(*)::int AS count FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE u.deleted_at IS NULL GROUP BY r.name ORDER BY 2 DESC,1`,
  );
  const userStatuses = await q<{ label: string; count: number }>(
    Prisma.sql`SELECT ${accountStatus} AS label,count(*)::int AS count FROM users u WHERE u.deleted_at IS NULL GROUP BY 1 ORDER BY 2 DESC,1`,
  );
  const [system] = await q<{ users: number; today: number; inactive: number; audit: number }>(
    Prisma.sql`SELECT (SELECT count(*)::int FROM users u WHERE u.deleted_at IS NULL) AS users,(SELECT count(*)::int FROM users u WHERE u.deleted_at IS NULL AND (u.last_login_at AT TIME ZONE 'Asia/Bangkok')::date=${today}::date) AS today,(SELECT count(*)::int FROM users u WHERE u.deleted_at IS NULL AND u.status='ACTIVE' AND (u.last_login_at IS NULL OR (u.last_login_at AT TIME ZONE 'Asia/Bangkok')::date<${addDays(today, -INACTIVE_DAYS)}::date)) AS inactive,(SELECT count(*)::int FROM audit_events a WHERE ${inRange(Prisma.sql`a.occurred_at`, true)}) AS audit`,
  );

  const [margin] = await q<{ net: string; cost: string; giftCost: string }>(
    Prisma.sql`SELECT (SELECT ${money(Prisma.sql`round(sum(s.total)/1.07,2)`)} FROM ${sold} WHERE s.sold_on BETWEEN ${from}::date AND ${to}::date) AS net,(SELECT ${money(Prisma.sql`sum(s.cost)`)} FROM ${sold} WHERE s.sold_on BETWEEN ${from}::date AND ${to}::date) AS cost,(SELECT ${money(Prisma.sql`sum(${giftCost(Prisma.sql`d.id`)})`)} FROM ${completed} WHERE d.sold_on BETWEEN ${from}::date AND ${to}::date) AS "giftCost"`,
  );
  const [salesExtra] = await q<{ gross: string; lineDiscount: string; billDiscount: string }>(
    Prisma.sql`SELECT ${money(Prisma.sql`sum(s.quantity*s.unit_price)`)} AS gross,${money(Prisma.sql`sum(s.discount)`)} AS "lineDiscount",${money(Prisma.sql`sum(s.quantity*s.unit_price-s.discount)-sum(s.total)`)} AS "billDiscount" FROM ${sold} WHERE s.sold_on BETWEEN ${from}::date AND ${to}::date`,
  );
  const [gifts] = await q<{ giftQuantity: number; giftValue: string }>(
    Prisma.sql`SELECT COALESCE(sum(li.quantity),0)::int AS "giftQuantity",${money(Prisma.sql`sum(li.quantity*p.sale_price)`)} AS "giftValue" FROM ${completed} JOIN sales_order_lines li ON li.order_id=d.id AND li.is_gift JOIN products p ON p.id=li.product_id WHERE d.sold_on BETWEEN ${from}::date AND ${to}::date`,
  );
  const [buyers] = await q<{ buying: number; created: number }>(
    Prisma.sql`WITH firsts AS (SELECT s.customer_id,min(s.sold_on) AS first FROM ${sold} WHERE s.customer_id IS NOT NULL GROUP BY s.customer_id) SELECT count(*)::int AS buying,count(*) FILTER (WHERE f.first>=${from}::date)::int AS created FROM firsts f WHERE EXISTS (SELECT 1 FROM ${sold} WHERE s.customer_id=f.customer_id AND s.sold_on BETWEEN ${from}::date AND ${to}::date)`,
  );
  const [credit] = await q<{ over: number; near: number; issued: string }>(
    Prisma.sql`SELECT (SELECT count(*)::int FROM ${owed} JOIN customers c ON c.id=w.customer_id WHERE c.credit_limit>0 AND w.amount>c.credit_limit) AS over,(SELECT count(*)::int FROM ${owed} JOIN customers c ON c.id=w.customer_id WHERE c.credit_limit>0 AND w.amount<=c.credit_limit AND w.amount>=c.credit_limit*${CREDIT_NEAR}) AS near,(SELECT ${money(Prisma.sql`sum(i.amount)`)} FROM invoices i WHERE i.deleted_at IS NULL AND i.status<>'ยกเลิก' AND i.issue_date BETWEEN ${addDays(today, -(DSO_DAYS - 1))}::date AND ${today}::date) AS issued`,
  );
  const [payTime] = await q<{ paid: number; avg: number | null }>(
    Prisma.sql`SELECT count(*)::int AS paid,round(avg(x.last_paid-x.issue_date),1)::float8 AS avg FROM (SELECT i.issue_date,(SELECT max(p.paid_on) FROM invoice_payments p WHERE p.invoice_id=i.id AND p.voided_at IS NULL) AS last_paid FROM invoices i WHERE i.deleted_at IS NULL AND i.status='ชำระครบ' AND i.issue_date IS NOT NULL) x WHERE x.last_paid BETWEEN ${from}::date AND ${to}::date`,
  );
  const [dead] = await q<{ count: number; value: string }>(
    Prisma.sql`SELECT count(*)::int AS count,${money(Prisma.sql`round(sum(dead.value),2)`)} AS value FROM ${deadStock(today)}`,
  );
  const [receipts] = await q<{ received: number; late: number; avg: number | null }>(
    Prisma.sql`WITH firsts AS (SELECT li.purchase_order_id AS po,(min(r.created_at) AT TIME ZONE 'Asia/Bangkok')::date AS first FROM stock_receipts r JOIN purchase_order_lines li ON li.id=r.purchase_order_line_id GROUP BY li.purchase_order_id) SELECT count(*)::int AS received,count(*) FILTER (WHERE f.first>po.expected_on)::int AS late,round(avg(greatest(f.first-po.expected_on,0)),1)::float8 AS avg FROM firsts f JOIN purchase_orders po ON po.id=f.po WHERE po.deleted_at IS NULL AND po.expected_on IS NOT NULL AND f.first BETWEEN ${from}::date AND ${to}::date`,
  );
  const [quoteWork] = await q<{ pending: number; age: number | null; expiring: number }>(
    Prisma.sql`SELECT count(*) FILTER (WHERE q.status='รออนุมัติ')::int AS pending,round(avg(${today}::date-(q.created_at AT TIME ZONE 'Asia/Bangkok')::date) FILTER (WHERE q.status='รออนุมัติ'),1)::float8 AS age,count(*) FILTER (WHERE q.valid_until BETWEEN ${today}::date AND ${addDays(today, QUOTE_EXPIRY_DAYS)}::date)::int AS expiring FROM quotations q WHERE ${pendingQuote(today)}`,
  );
  const issued90 = Number(credit.issued);

  const { current, d30, d60, d90, over90, ...debtTotals } = debt;
  return {
    range,
    today,
    sales: {
      ...sales,
      orderStatuses: counts(orderStatuses),
      quoteStatuses: counts(quoteStatuses),
      quotes: quotes.total,
      converted: quotes.converted,
      trend,
      ...salesExtra,
      ...gifts,
      net: margin.net,
      cost: margin.cost,
      giftCost: margin.giftCost,
      profit: (Number(margin.net) - Number(margin.cost) - Number(margin.giftCost)).toFixed(2),
      customersBuying: buyers.buying,
      newCustomers: buyers.created,
      repeatCustomers: buyers.buying - buyers.created,
    },
    finance: {
      ...debtTotals,
      aging: { current, d30, d60, d90, over90 },
      ...money1,
      expensesByCategory: counts(expensesByCategory),
      creditOver: credit.over,
      creditNear: credit.near,
      dso: issued90 ? Math.round(Number(debt.outstanding) / (issued90 / DSO_DAYS)) : null,
      avgDaysToPay: payTime.avg,
      paidInvoices: payTime.paid,
    },
    stock: {
      purchaseStatuses: counts(purchaseStatuses),
      purchasesLate: stock.late,
      purchasesInRange: stock.inRange,
      purchasesAmount: stock.inRangeAmount,
      stockValue: stock.value,
      warehouses,
      expiringLots: stock.expiring,
      expiredLots: stock.expired,
      lowStock: stock.lowStock,
      outOfStock: stock.outOfStock,
      countsOpen: stock.countsOpen,
      countsClosed: stock.countsClosed,
      countDiffLines: stock.diffLines,
      expiryDays: EXPIRY_DAYS,
      lowStockLevel: LOW_STOCK,
      deadStock: dead.count,
      deadStockValue: dead.value,
      deadDays: DEAD_DAYS,
      receivedPurchases: receipts.received,
      lateReceipts: receipts.late,
      avgReceiptDelay: receipts.avg,
    },
    customers: {
      total: customer.total,
      statuses: counts(customerStatuses),
      territories: counts(territories),
      groups: counts(groups),
      created: customer.created,
      licenseExpired: customer.expired,
      licenseExpiring: customer.expiring,
      requestsPending: customer.requests,
      followToday: customer.followToday,
      followLate: customer.followLate,
      followInRange: customer.followInRange,
      licenseWarningDays: LICENSE_WARNING_DAYS,
      quotesPending: quoteWork.pending,
      quotesPendingAge: quoteWork.age,
      quotesExpiring: quoteWork.expiring,
      quoteExpiryDays: QUOTE_EXPIRY_DAYS,
    },
    products: {
      total: productStatuses.reduce((sum, row) => sum + row.count, 0),
      statuses: counts(productStatuses),
      categories: counts(categories),
      promotionsActive: promotion.active,
      promotionsEnding: promotion.ending,
      promotionQuotes: promotion.quotes,
      promotionOrders: promotion.orders,
    },
    system: {
      users: system.users,
      roles: counts(roles),
      statuses: counts(userStatuses),
      loggedInToday: system.today,
      inactive: system.inactive,
      auditEvents: system.audit,
      inactiveDays: INACTIVE_DAYS,
    },
  };
}

async function details<S extends AdminSection>(
  tx: Tx,
  section: S,
  range: ReturnType<typeof adminRange>,
): Promise<AdminDetails[S]> {
  const today = bangkokDay();
  const { from, to } = range;
  const q = <T>(sql: Prisma.Sql) => tx.$queryRaw<T[]>(sql);
  const soldInRange = Prisma.sql`s.sold_on BETWEEN ${from}::date AND ${to}::date`;
  const ranked = (select: Prisma.Sql, join: Prisma.Sql, group: Prisma.Sql) =>
    q<AdminDetails['sales']['products'][number]>(
      Prisma.sql`SELECT ${select},count(DISTINCT s.order_id)::int AS count,${money(Prisma.sql`sum(s.total)`)} AS total FROM ${sold} ${join} WHERE ${soldInRange} GROUP BY ${group} ORDER BY sum(s.total) DESC,1 LIMIT 10`,
    );
  let result: unknown;
  if (section === 'sales') {
    result = {
      products: await ranked(
        Prisma.sql`s.product_id AS id,max(s.product_name) AS name`,
        Prisma.empty,
        Prisma.sql`s.product_id`,
      ),
      customers: await ranked(
        Prisma.sql`s.customer_id AS id,COALESCE(max(c.name),'-') AS name`,
        Prisma.sql`LEFT JOIN customers c ON c.id=s.customer_id`,
        Prisma.sql`s.customer_id`,
      ),
      sellers: await ranked(
        Prisma.sql`s.created_by_id AS id,COALESCE(max(u.name),'-') AS name`,
        Prisma.sql`LEFT JOIN users u ON u.id=s.created_by_id`,
        Prisma.sql`s.created_by_id`,
      ),
      territories: await ranked(
        Prisma.sql`c.territory_id AS id,COALESCE(NULLIF(max(t.name),''),'ไม่ระบุเขต') AS name`,
        Prisma.sql`LEFT JOIN customers c ON c.id=s.customer_id LEFT JOIN sales_territories t ON t.id=c.territory_id`,
        Prisma.sql`c.territory_id`,
      ),
      orders: (
        await q<{
          id: string;
          code: string;
          customerName: string;
          status: string;
          amount: string;
          createdAt: Date;
        }>(
          Prisma.sql`SELECT o.id,o.code,COALESCE(c.name,o.name,'-') AS "customerName",o.status,${money(Prisma.sql`o.amount`)} AS amount,o.created_at AS "createdAt" FROM sales_orders o LEFT JOIN customers c ON c.id=o.customer_id WHERE o.deleted_at IS NULL AND (o.created_at AT TIME ZONE 'Asia/Bangkok')::date BETWEEN ${from}::date AND ${to}::date ORDER BY o.created_at DESC,o.id LIMIT 10`,
        )
      ).map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    };
  } else if (section === 'finance') {
    result = {
      debtors: await q(
        Prisma.sql`SELECT c.id,c.name,${money(Prisma.sql`sum(i.amount-${paid})`)} AS outstanding,${money(Prisma.sql`sum(i.amount-${paid}) FILTER (WHERE i.due_date<${today}::date)`)} AS overdue,count(*)::int AS invoices FROM invoices i JOIN customers c ON c.id=i.customer_id WHERE ${open} GROUP BY c.id,c.name ORDER BY sum(i.amount-${paid}) DESC,c.id LIMIT 10`,
      ),
      overdue: await q(
        Prisma.sql`SELECT i.id,i.code,c.name AS "customerName",i.due_date::text AS "dueDate",(${today}::date-i.due_date)::int AS "daysLate",${money(Prisma.sql`i.amount-${paid}`)} AS outstanding FROM invoices i JOIN customers c ON c.id=i.customer_id WHERE ${open} AND i.due_date<${today}::date ORDER BY i.due_date,i.code LIMIT 10`,
      ),
      payments: await q(
        Prisma.sql`SELECT p.id,i.id AS "invoiceId",i.code AS "invoiceCode",c.name AS "customerName",p.paid_on::text AS "paidOn",p.method,${money(Prisma.sql`p.amount`)} AS amount FROM invoice_payments p JOIN invoices i ON i.id=p.invoice_id JOIN customers c ON c.id=i.customer_id WHERE p.voided_at IS NULL AND p.paid_on BETWEEN ${from}::date AND ${to}::date ORDER BY p.paid_on DESC,p.created_at DESC LIMIT 10`,
      ),
      expenses: await q(
        Prisma.sql`SELECT e.id,e.code,e.expense_date::text AS "expenseDate",COALESCE(o.name,'ไม่ระบุหมวด') AS "categoryName",e.payee,${money(Prisma.sql`e.amount`)} AS amount FROM expenses e LEFT JOIN customer_options o ON o.id=e.category_id WHERE e.deleted_at IS NULL AND e.status='บันทึกแล้ว' AND e.expense_date BETWEEN ${from}::date AND ${to}::date ORDER BY e.expense_date DESC,e.created_at DESC LIMIT 10`,
      ),
      uninvoiced: await q(
        Prisma.sql`SELECT o.id,o.code,COALESCE(c.name,'-') AS "customerName",${money(Prisma.sql`o.amount`)} AS amount FROM sales_orders o LEFT JOIN customers c ON c.id=o.customer_id WHERE ${uninvoiced} ORDER BY o.code DESC LIMIT 10`,
      ),
      credit: await q(
        Prisma.sql`SELECT c.id,c.name,${money(Prisma.sql`c.credit_limit`)} AS "creditLimit",${money(Prisma.sql`w.amount`)} AS outstanding,round(w.amount/c.credit_limit*100,1)::float8 AS usage FROM ${owed} JOIN customers c ON c.id=w.customer_id WHERE c.credit_limit>0 AND w.amount>0 ORDER BY w.amount/c.credit_limit DESC,c.id LIMIT 10`,
      ),
    };
  } else if (section === 'stock') {
    result = {
      purchases: await q(
        Prisma.sql`SELECT po.id,po.code,po.name,po.status,po.expected_on::text AS "expectedOn",${money(Prisma.sql`po.amount`)} AS amount,COALESCE(po.expected_on<${today}::date,false) AS late FROM purchase_orders po WHERE ${openPurchase} ORDER BY po.expected_on NULLS LAST,po.code LIMIT 10`,
      ),
      expiring: await q(
        Prisma.sql`SELECT l.id||':'||w.id AS id,p.name AS "productName",l.lot_number AS "lotNumber",w.name AS "warehouseName",l.expires_on::text AS "expiresOn",(l.expires_on-${today}::date)::int AS "daysLeft",b.quantity FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id JOIN products p ON p.id=l.product_id JOIN warehouses w ON w.id=b.warehouse_id WHERE b.quantity>0 AND l.expires_on<=${addDays(today, EXPIRY_DAYS)}::date ORDER BY l.expires_on,p.name,l.id,w.id LIMIT 10`,
      ),
      lowStock: await q(
        Prisma.sql`SELECT p.id,p.code,p.name,p.unit,st.main FROM products p ${stockByProduct} WHERE p.deleted_at IS NULL AND p.status='ACTIVE' AND st.main<=${LOW_STOCK} ORDER BY st.main,p.code,p.id LIMIT 10`,
      ),
      counts: (
        await q<{
          id: string;
          code: string;
          warehouseName: string;
          status: string;
          lines: number;
          counted: number;
          diffLines: number;
          createdAt: Date;
        }>(
          Prisma.sql`SELECT s.id,s.code,COALESCE(w.name,'-') AS "warehouseName",s.status,count(li.id)::int AS lines,count(li.counted_quantity)::int AS counted,count(li.id) FILTER (WHERE li.counted_quantity IS NOT NULL AND li.counted_quantity<>li.system_quantity)::int AS "diffLines",s.created_at AS "createdAt" FROM stock_count_sessions s LEFT JOIN warehouses w ON w.id=s.warehouse_id LEFT JOIN stock_count_lines li ON li.session_id=s.id WHERE s.deleted_at IS NULL GROUP BY s.id,w.name ORDER BY s.created_at DESC,s.id LIMIT 10`,
        )
      ).map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      dead: await q(
        Prisma.sql`SELECT dead.id,dead.code,dead.name,dead.unit,dead.quantity,${money(Prisma.sql`round(dead.value,2)`)} AS value,dead."lastSoldOn" FROM ${deadStock(today)} ORDER BY dead.value DESC,dead.code LIMIT 10`,
      ),
    };
  } else if (section === 'customers') {
    result = {
      licenses: await q(
        Prisma.sql`SELECT c.id,c.code,c.name,c.license_expires_at::date::text AS "licenseExpiresAt",(c.license_expires_at::date-${today}::date)::int AS "daysLeft" FROM customers c WHERE ${listedCustomer} AND c.status='ใช้งาน' AND c.license_expires_at<=${today}::date+${LICENSE_WARNING_DAYS}::int ORDER BY c.license_expires_at,c.code LIMIT 10`,
      ),
      requests: (
        await q<{ id: string; name: string; submittedBy: string; submittedAt: Date }>(
          Prisma.sql`SELECT r.id,COALESCE(NULLIF(r.payload->'fields'->>'name',''),'-') AS name,COALESCE(a.name,'-') AS "submittedBy",r.submitted_at AS "submittedAt" FROM customer_create_requests r LEFT JOIN users a ON a.id=r.actor_id WHERE r.status='submitted' ORDER BY r.submitted_at,r.id LIMIT 10`,
        )
      ).map((row) => ({ ...row, submittedAt: row.submittedAt.toISOString() })),
      followUps: await q(
        Prisma.sql`SELECT f.id,f.code,COALESCE(c.name,f.name,'-') AS "customerName",f.next_on::text AS "nextOn",(${today}::date-f.next_on)::int AS "daysLate" FROM customer_follow_ups f LEFT JOIN customers c ON c.id=f.customer_id WHERE f.deleted_at IS NULL AND f.status='รอติดตาม' AND f.next_on<=${today}::date ORDER BY f.next_on,f.code LIMIT 10`,
      ),
      quotes: await q(
        Prisma.sql`SELECT q.id,q.code,COALESCE(c.name,q.name,'-') AS "customerName",q.status,q.valid_until::text AS "validUntil",(q.valid_until-${today}::date)::int AS "daysLeft",(${today}::date-(q.created_at AT TIME ZONE 'Asia/Bangkok')::date)::int AS "ageDays",${money(Prisma.sql`q.amount`)} AS amount FROM quotations q LEFT JOIN customers c ON c.id=q.customer_id WHERE ${pendingQuote(today)} ORDER BY q.valid_until NULLS LAST,q.created_at,q.id LIMIT 10`,
      ),
    };
  } else if (section === 'products') {
    result = {
      promotions: await q(
        Prisma.sql`SELECT m.id,m.code,m.name,m.status,m.starts_on::text AS "startsOn",m.ends_on::text AS "endsOn",(SELECT count(*)::int FROM quotations q WHERE q.promotion_id=m.id AND q.deleted_at IS NULL AND (q.created_at AT TIME ZONE 'Asia/Bangkok')::date BETWEEN ${from}::date AND ${to}::date) AS quotes,(SELECT count(*)::int FROM sales_orders o WHERE o.promotion_id=m.id AND o.deleted_at IS NULL AND (o.created_at AT TIME ZONE 'Asia/Bangkok')::date BETWEEN ${from}::date AND ${to}::date) AS orders FROM promotions m WHERE m.deleted_at IS NULL AND m.status='ใช้งาน' AND (m.ends_on IS NULL OR m.ends_on>=${today}::date) ORDER BY m.ends_on NULLS LAST,m.code LIMIT 10`,
      ),
    };
  } else {
    result = {
      audit: (
        await q<{ id: string; occurredAt: Date; actorName: string; action: string }>(
          Prisma.sql`SELECT a.id,a.occurred_at AS "occurredAt",COALESCE(u.name,'ระบบ') AS "actorName",a.action FROM audit_events a LEFT JOIN users u ON u.id=a.actor_user_id ORDER BY a.occurred_at DESC,a.id LIMIT 20`,
        )
      ).map((row) => ({
        ...row,
        occurredAt: row.occurredAt.toISOString(),
        action: actionName(row.action),
      })),
      inactive: (
        await q<{
          id: string;
          employeeCode: string;
          name: string;
          roleName: string;
          lastLoginAt: Date | null;
        }>(
          Prisma.sql`SELECT u.id,u.employee_code AS "employeeCode",u.name,COALESCE(r.name,'-') AS "roleName",u.last_login_at AS "lastLoginAt" FROM users u LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id WHERE u.deleted_at IS NULL AND u.status='ACTIVE' AND (u.last_login_at IS NULL OR (u.last_login_at AT TIME ZONE 'Asia/Bangkok')::date<${addDays(today, -INACTIVE_DAYS)}::date) ORDER BY u.last_login_at NULLS FIRST,u.name,u.id LIMIT 10`,
        )
      ).map((row) => ({ ...row, lastLoginAt: row.lastLoginAt?.toISOString() ?? null })),
    };
  }
  return result as AdminDetails[S];
}

export async function adminDashboard(params: URLSearchParams) {
  const range = adminRange(params);
  const section = adminSection(params.get('section'));
  return readWithConnectionRetry((db) =>
    db.$transaction(
      async (tx) =>
        section
          ? { data: await details(tx, section, range), section }
          : { data: await summary(tx, range) },
      { isolationLevel: 'RepeatableRead' },
    ),
  );
}
