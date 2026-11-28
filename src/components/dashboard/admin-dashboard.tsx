'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Get } from '@/service/http';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import StatusBadge from '@/components/ui/status-badge';
import DateRangeInput from '@/components/ui/date-range-input';
import ChevronDown from '@/components/ui/chevron-down';
import { bangkokToday, dateOnly, dateTime, money } from '@/components/sales/document-ui';
import { AgingChart, StatCard, thaiDay } from '@/components/dashboard/dashboard-ui';
import type {
  AdminCount,
  AdminDetails,
  AdminDetailsResponse,
  AdminSection,
  AdminSummary,
  AdminSummaryResponse,
} from '@/types/api/admin-dashboard';

type Period = 'month' | 'quarter' | 'year' | 'custom';
const periods: [Period, string][] = [
  ['month', 'เดือนนี้'],
  ['quarter', 'ไตรมาสนี้'],
  ['year', 'ปีนี้'],
  ['custom', 'กำหนดเอง'],
];

function periodRange(period: Period, today: string) {
  const [y, m] = today.split('-').map(Number);
  if (period === 'year') return { from: `${y}-01-01`, to: today };
  if (period === 'quarter')
    return {
      from: `${y}-${String(Math.floor((m - 1) / 3) * 3 + 1).padStart(2, '0')}-01`,
      to: today,
    };
  return { from: today.slice(0, 8) + '01', to: today };
}

const num = (value: number) => value.toLocaleString('th-TH');
const days = (value: number | null) =>
  value === null ? '-' : `${value.toLocaleString('th-TH', { maximumFractionDigits: 1 })} วัน`;
const share = (part: number, whole: number) =>
  whole ? `${((part / whole) * 100).toFixed(1)}%` : '-';
const percentChange = (current: string, previous: string) => {
  const before = Number(previous);
  return before ? ((Number(current) - before) / before) * 100 : null;
};

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
const icons = {
  sales: 'M4 19V9m6 10V5m6 14v-7m4 7H2',
  debt: 'M3 7h18v12H3zM3 11h18M7 15h3',
  received: 'M12 3v12m0 0-4-4m4 4 4-4M4 21h16',
  expense: 'M12 21V9m0 0-4 4m4-4 4 4M4 3h16',
};

function Mini({
  label,
  value,
  hint,
  href,
  tone = 'text-[#26364b]',
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: string;
}) {
  const body = (
    <>
      <p className="m-0 text-xs text-[#718096]">{label}</p>
      <p className={`m-0 mt-1 text-lg poppins-semibold ${tone}`}>{value}</p>
      {hint && <p className="m-0 mt-0.5 text-xs text-[#8994a5]">{hint}</p>}
    </>
  );
  const className = 'block rounded-lg border border-[#e3e9f0] bg-[#fbfcfe] px-4 py-3';
  return href ? (
    <Link href={href} className={`${className} transition hover:border-[#1a58a7]`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function Breakdown({
  title,
  rows,
  badge = false,
  showAmount = false,
}: {
  title: string;
  rows: AdminCount[];
  badge?: boolean;
  showAmount?: boolean;
}) {
  const max = Math.max(...rows.map((row) => row.count), 0);
  return (
    <div className="min-w-0">
      <h4 className="m-0 mb-3 text-sm poppins-semibold text-[#344256]">{title}</h4>
      {rows.length ? (
        <ul className="m-0 grid list-none gap-2.5 p-0">
          {rows.map((row) => (
            <li key={row.label} className="grid gap-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                {badge ? (
                  <StatusBadge value={row.label} />
                ) : (
                  <span className="truncate text-[#344256]" title={row.label}>
                    {row.label}
                  </span>
                )}
                <span className="shrink-0 text-right">
                  <span className="poppins-semibold text-[#26364b]">{num(row.count)}</span>
                  {showAmount && row.amount !== undefined && (
                    <span className="ml-2 text-xs text-[#8994a5]">{money(row.amount)} บาท</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#eef2f7]">
                <div
                  className="h-full rounded-full bg-blue-400"
                  style={{ width: max ? `${(row.count / max) * 100}%` : '0%' }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-[#8994a5]">ไม่มีรายการในช่วงนี้</p>
      )}
    </div>
  );
}

const monthFormat = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  month: 'short',
  year: '2-digit',
  timeZone: 'Asia/Bangkok',
});
const dayFormat = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Bangkok',
});
const periodLabel = (period: string) =>
  period.length === 7
    ? monthFormat.format(new Date(period + '-01T12:00:00+07:00'))
    : dayFormat.format(new Date(period + 'T12:00:00+07:00'));

function Trend({ rows }: { rows: AdminSummary['sales']['trend'] }) {
  const max = Math.max(...rows.map((row) => Number(row.total)), 0);
  const every = Math.ceil(rows.length / 12);
  return (
    <div className="overflow-x-auto">
      <ol
        className="m-0 flex h-52 list-none items-end gap-1 p-0"
        style={{ minWidth: rows.length * 14 }}
      >
        {rows.map((row, index) => {
          const value = Number(row.total);
          const label = `${periodLabel(row.period)} ${money(value)} บาท ${row.orders} รายการ`;
          return (
            <li
              key={row.period}
              className="group relative flex h-full min-w-2.5 flex-1 flex-col items-center justify-end"
            >
              <span className="pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded-md bg-[#26364b] px-2 py-1 text-[11px] text-white shadow group-hover:block">
                {label}
              </span>
              <div
                role="img"
                aria-label={label}
                className="w-full max-w-9 rounded-t-md bg-blue-300 transition group-hover:bg-[#1a58a7]"
                style={{
                  height: max ? `${Math.max((value / max) * 100, value ? 2 : 0)}%` : '0%',
                }}
              />
              <span className="mt-2 h-4 whitespace-nowrap text-[10px] text-[#8994a5]">
                {index % every === 0 ? periodLabel(row.period) : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type Column<T> = {
  label: string;
  render: (row: T) => ReactNode;
  align?: 'right';
  status?: boolean;
};

function DetailTable<T extends { id: string | null }>({
  title,
  rows,
  columns,
  empty,
  href,
}: {
  title: string;
  rows: T[];
  columns: Column<T>[];
  empty: string;
  href?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[#e3e9f0] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#e3e9f0] px-4 py-3">
        <h4 className="m-0 text-sm poppins-semibold text-[#26364b]">{title}</h4>
        {href && (
          <Link href={href} className="text-xs poppins-medium text-[#1a58a7] hover:underline">
            ดูทั้งหมด
          </Link>
        )}
      </div>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.label}
                    scope="col"
                    className={`px-4 py-2.5 poppins-semibold ${column.align === 'right' ? 'text-right' : ''}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? index} className="border-t border-[#edf0f4]">
                  {columns.map((column) => (
                    <td
                      key={column.label}
                      className={`px-4 py-2.5 align-top ${column.align === 'right' ? 'whitespace-nowrap text-right tabular-nums' : ''}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <NotFoundComponent title={empty} description="ไม่มีรายการในช่วงเวลานี้" />
      )}
    </div>
  );
}

const linkTo = (href: string, label: string) => (
  <Link href={href} className="text-[#1a58a7] hover:underline">
    {label}
  </Link>
);

function useDetails<S extends AdminSection>(section: S, open: boolean, query: string) {
  const [data, setData] = useState<{ query: string; value: AdminDetails[S] } | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    Get<AdminDetailsResponse<S>>(
      `/api/dashboard/admin?${query}&section=${section}`,
      controller.signal,
    )
      .then((r) => {
        setData({ query, value: r.data });
        setError('');
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [section, open, query, retry]);
  return {
    data: data?.query === query ? data.value : null,
    error,
    retry: () => {
      setError('');
      setRetry((n) => n + 1);
    },
  };
}

function Section<S extends AdminSection>({
  section,
  title,
  description,
  query,
  defaultOpen = false,
  summary,
  details,
}: {
  section: S;
  title: string;
  description: string;
  query: string;
  defaultOpen?: boolean;
  summary: ReactNode;
  details: (data: AdminDetails[S]) => ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const state = useDetails(section, open, query);
  const panel = `admin-${section}-details`;
  return (
    <section className="rounded-xl border border-[#d9e3ee] bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3e9f0] px-5 py-4">
        <div>
          <h2 className="m-0 text-base poppins-semibold text-[#26364b]">{title}</h2>
          <p className="m-0 mt-0.5 text-xs text-[#718096]">{description}</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panel}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#d9e3ee] px-3 py-1.5 text-sm poppins-medium text-[#1a58a7] hover:bg-blue-50"
        >
          {open ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
          <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </header>
      <div className="p-5">{summary}</div>
      {open && (
        <div id={panel} className="relative min-h-40 border-t border-[#e3e9f0] bg-[#f7f9fc] p-5">
          {state.error ? (
            <div role="alert" className="text-sm text-red-600">
              {state.error}
              <button onClick={state.retry} className="ml-3 text-blue-700 underline">
                ลองใหม่
              </button>
            </div>
          ) : state.data ? (
            details(state.data)
          ) : (
            <LoadingComponent isVisible variant="content" />
          )}
        </div>
      )}
    </section>
  );
}

const named = (unit: string) => [
  { label: 'ชื่อ', render: (r: AdminDetails['sales']['products'][number]) => r.name },
  {
    label: unit,
    align: 'right' as const,
    render: (r: AdminDetails['sales']['products'][number]) => num(r.count),
  },
  {
    label: 'ยอด (บาท)',
    align: 'right' as const,
    render: (r: AdminDetails['sales']['products'][number]) => money(r.total),
  },
];

export default function AdminDashboard() {
  const today = bangkokToday();
  const [period, setPeriod] = useState<Period>('month');
  const [custom, setCustom] = useState(periodRange('month', today));
  const range = period === 'custom' ? custom : periodRange(period, today);
  const query = new URLSearchParams(range).toString();
  const [result, setResult] = useState<{ query: string; data: AdminSummary } | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const reload = () => {
    setError('');
    setRetry((value) => value + 1);
  };
  useEffect(() => {
    const controller = new AbortController();
    Get<AdminSummaryResponse>('/api/dashboard/admin?' + query, controller.signal)
      .then((r) => {
        setResult({ query, data: r.data });
        setError('');
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [query, retry]);
  const data = result?.data;
  const stale = result?.query !== query;

  return (
    <section className="flex flex-1 flex-col gap-6 bg-[#f7f9fc] p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-xl poppins-semibold text-[#26364b]">ภาพรวมทั้งระบบ</h2>
          <p className="m-0 mt-1 text-sm text-[#718096]">
            {thaiDay(range.from)} – {thaiDay(range.to)} · ข้อมูล ณ วันที่ {thaiDay(today)}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div
            role="radiogroup"
            aria-label="ช่วงเวลา"
            className="flex rounded-lg border border-[#d9e3ee] bg-white p-1"
          >
            {periods.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={period === key}
                onClick={() => setPeriod(key)}
                className={`rounded-md px-3 py-1.5 text-sm transition ${period === key ? 'bg-[#1a58a7] poppins-semibold text-white' : 'text-[#53647c] hover:bg-blue-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="w-64">
              <DateRangeInput
                from={custom.from}
                to={custom.to}
                clearable={false}
                onChange={(from, to) => setCustom({ from, to })}
              />
            </div>
          )}
          <button
            type="button"
            onClick={reload}
            className="rounded-lg border border-[#d9e3ee] bg-white px-4 py-2 text-sm poppins-medium text-[#344256] hover:bg-gray-50"
          >
            รีเฟรช
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button onClick={reload} className="ml-3 text-blue-700 underline">
            ลองใหม่
          </button>
        </div>
      )}
      {!data && !error && <LoadingComponent isVisible />}

      {data && (
        <div
          className={`flex flex-col gap-6 transition ${stale ? 'opacity-60' : ''}`}
          aria-busy={stale}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="ยอดคำสั่งซื้อเสร็จสิ้น"
              value={money(data.sales.total)}
              unit="บาท"
              hint={`${num(data.sales.orders)} รายการ · เทียบช่วงก่อนหน้า`}
              change={percentChange(data.sales.total, data.sales.prevTotal)}
              tone="blue"
              icon={<Icon d={icons.sales} />}
              href="/reports/sales"
            />
            <StatCard
              label="ลูกหนี้คงค้าง"
              value={money(data.finance.outstanding)}
              unit="บาท"
              hint={`เกินกำหนด ${money(data.finance.overdue)} บาท`}
              tone={Number(data.finance.overdue) > 0 ? 'red' : 'orange'}
              icon={<Icon d={icons.debt} />}
              href="/reports/finance"
            />
            <StatCard
              label="รับชำระ"
              value={money(data.finance.received)}
              unit="บาท"
              hint={`${num(data.finance.payments)} รายการในช่วงนี้`}
              tone="emerald"
              icon={<Icon d={icons.received} />}
              href="/billing"
            />
            <StatCard
              label="ค่าใช้จ่าย"
              value={money(data.finance.expenses)}
              unit="บาท"
              hint={`${num(data.finance.expenseCount)} รายการในช่วงนี้`}
              tone="orange"
              icon={<Icon d={icons.expense} />}
              href="/expenses"
            />
          </div>

          <Section
            section="sales"
            title="ยอดขาย"
            description="คำสั่งซื้อเสร็จสิ้นตามวันขาย ใบเสนอราคาและคำสั่งซื้อตามวันที่สร้าง"
            query={query}
            defaultOpen
            summary={
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <Mini
                      label="ช่วงก่อนหน้า"
                      value={money(data.sales.prevTotal)}
                      hint={`${dateOnly(data.range.prevFrom)} – ${dateOnly(data.range.prevTo)}`}
                    />
                    <Mini
                      label="คำสั่งซื้อเสร็จสิ้น"
                      value={num(data.sales.orders)}
                      hint={`ช่วงก่อน ${num(data.sales.prevOrders)}`}
                      href="/orders"
                    />
                    <Mini label="ใบเสนอราคา" value={num(data.sales.quotes)} href="/quotes" />
                    <Mini
                      label="แปลงเป็นคำสั่งซื้อ"
                      value={
                        data.sales.quotes
                          ? `${((data.sales.converted / data.sales.quotes) * 100).toFixed(0)}%`
                          : '-'
                      }
                      hint={`${num(data.sales.converted)} จาก ${num(data.sales.quotes)} ใบ`}
                    />
                    <Mini
                      label="กำไรขั้นต้น"
                      value={money(data.sales.profit)}
                      hint={`${share(Number(data.sales.profit), Number(data.sales.net))} ของยอดก่อน VAT · ต้นทุนขาย ${money(data.sales.cost)} · ของแถม ${money(data.sales.giftCost)}`}
                      tone={Number(data.sales.profit) < 0 ? 'text-red-600' : 'text-emerald-600'}
                      href="/reports/sales/products"
                    />
                    <Mini
                      label="ยอดเฉลี่ยต่อบิล"
                      value={
                        data.sales.orders
                          ? money(Number(data.sales.total) / data.sales.orders)
                          : '-'
                      }
                      hint="บาท ต่อคำสั่งซื้อเสร็จสิ้น"
                    />
                    <Mini
                      label="ลูกค้าที่ซื้อ"
                      value={num(data.sales.customersBuying)}
                      hint={`ใหม่ ${num(data.sales.newCustomers)} · ซื้อซ้ำ ${num(data.sales.repeatCustomers)}`}
                    />
                    <Mini
                      label="ส่วนลดรวม"
                      value={money(
                        Number(data.sales.lineDiscount) + Number(data.sales.billDiscount),
                      )}
                      hint={`${share(
                        Number(data.sales.lineDiscount) + Number(data.sales.billDiscount),
                        Number(data.sales.gross),
                      )} ของยอดก่อนลด · ท้ายบิล ${money(data.sales.billDiscount)}`}
                    />
                    <Mini
                      label="ของแถมที่ให้"
                      value={num(data.sales.giftQuantity)}
                      hint={`มูลค่าตามราคาขาย ${money(data.sales.giftValue)} บาท`}
                      href="/promotions"
                    />
                  </div>
                  <Trend rows={data.sales.trend} />
                </div>
                <div className="grid content-start gap-6">
                  <Breakdown
                    title="คำสั่งซื้อตามสถานะ"
                    rows={data.sales.orderStatuses}
                    badge
                    showAmount
                  />
                  <Breakdown
                    title="ใบเสนอราคาตามสถานะ"
                    rows={data.sales.quoteStatuses}
                    badge
                    showAmount
                  />
                </div>
              </div>
            }
            details={(d) => (
              <div className="grid gap-4 xl:grid-cols-2">
                <DetailTable
                  title="สินค้าขายดี 10 อันดับ"
                  rows={d.products}
                  columns={named('คำสั่งซื้อ')}
                  empty="ยังไม่มีสินค้าขาย"
                  href="/reports/sales/products"
                />
                <DetailTable
                  title="ลูกค้ายอดสูง 10 อันดับ"
                  rows={d.customers}
                  columns={named('คำสั่งซื้อ')}
                  empty="ยังไม่มีลูกค้าซื้อ"
                  href="/reports/sales/customers"
                />
                <DetailTable
                  title="ผู้ขายยอดสูง 10 อันดับ"
                  rows={d.sellers}
                  columns={named('คำสั่งซื้อ')}
                  empty="ยังไม่มียอดผู้ขาย"
                  href="/reports/sales/sellers"
                />
                <DetailTable
                  title="ยอดตามเขตขาย"
                  rows={d.territories}
                  columns={named('คำสั่งซื้อ')}
                  empty="ยังไม่มียอดตามเขต"
                />
                <div className="xl:col-span-2">
                  <DetailTable
                    title="คำสั่งซื้อล่าสุด"
                    rows={d.orders}
                    empty="ไม่มีคำสั่งซื้อในช่วงนี้"
                    href="/orders"
                    columns={[
                      { label: 'เลขที่', render: (r) => linkTo('/orders/' + r.id, r.code) },
                      { label: 'ลูกค้า', render: (r) => r.customerName },
                      { label: 'วันที่สร้าง', render: (r) => dateTime(r.createdAt) },
                      { label: 'สถานะ', render: (r) => <StatusBadge value={r.status} /> },
                      { label: 'ยอด (บาท)', align: 'right', render: (r) => money(r.amount) },
                    ]}
                  />
                </div>
              </div>
            )}
          />

          <Section
            section="finance"
            title="การเงิน"
            description="ลูกหนี้ ณ วันนี้ ใบแจ้งหนี้ รับชำระ และค่าใช้จ่ายตามช่วงเวลา"
            query={query}
            defaultOpen
            summary={
              <div className="grid gap-6 lg:grid-cols-3">
                <AgingChart finance={data.finance} />
                <div className="grid content-start grid-cols-2 gap-3">
                  <Mini
                    label="ใบแจ้งหนี้ที่ออก"
                    value={num(data.finance.issued)}
                    hint={`${money(data.finance.issuedAmount)} บาท`}
                    href="/billing"
                  />
                  <Mini
                    label="ใบแจ้งหนี้เกินกำหนด"
                    value={num(data.finance.overdueInvoices)}
                    tone={data.finance.overdueInvoices ? 'text-red-600' : 'text-[#26364b]'}
                    href="/billing"
                  />
                  <Mini
                    label="ยังไม่วางบิล"
                    value={num(data.finance.uninvoiced)}
                    hint={`${money(data.finance.uninvoicedAmount)} บาท`}
                    tone={data.finance.uninvoiced ? 'text-orange-600' : 'text-[#26364b]'}
                    href="/billing/create"
                  />
                  <Mini
                    label="รับชำระ"
                    value={num(data.finance.payments)}
                    hint={`${money(data.finance.received)} บาท`}
                    href="/reports/finance/payments"
                  />
                  <Mini
                    label="ระยะเวลาเก็บเงิน (DSO)"
                    value={days(data.finance.dso)}
                    hint="ลูกหนี้คงค้าง ÷ ยอดออกบิลเฉลี่ยต่อวัน 90 วัน"
                  />
                  <Mini
                    label="ได้รับเงินเฉลี่ยหลังออกบิล"
                    value={days(data.finance.avgDaysToPay)}
                    hint={`จาก ${num(data.finance.paidInvoices)} ใบที่ชำระครบในช่วงนี้`}
                  />
                  <Mini
                    label="ลูกค้าเกินวงเงินเครดิต"
                    value={num(data.finance.creditOver)}
                    hint={`ใช้วงเงิน ≥80% อีก ${num(data.finance.creditNear)} ราย`}
                    tone={data.finance.creditOver ? 'text-red-600' : 'text-[#26364b]'}
                  />
                </div>
                <Breakdown
                  title="ค่าใช้จ่ายตามหมวด"
                  rows={data.finance.expensesByCategory}
                  showAmount
                />
              </div>
            }
            details={(d) => (
              <div className="grid gap-4 xl:grid-cols-2">
                <DetailTable
                  title="ลูกค้าค้างชำระสูงสุด"
                  rows={d.debtors}
                  empty="ไม่มีลูกหนี้คงค้าง"
                  href="/reports/finance"
                  columns={[
                    { label: 'ลูกค้า', render: (r) => r.name },
                    { label: 'ใบแจ้งหนี้', align: 'right', render: (r) => num(r.invoices) },
                    { label: 'เกินกำหนด', align: 'right', render: (r) => money(r.overdue) },
                    { label: 'คงค้าง (บาท)', align: 'right', render: (r) => money(r.outstanding) },
                  ]}
                />
                <DetailTable
                  title="ใบแจ้งหนี้เกินกำหนด"
                  rows={d.overdue}
                  empty="ไม่มีใบแจ้งหนี้เกินกำหนด"
                  href="/billing"
                  columns={[
                    { label: 'เลขที่', render: (r) => linkTo('/billing/' + r.id, r.code) },
                    { label: 'ลูกค้า', render: (r) => r.customerName },
                    { label: 'ครบกำหนด', render: (r) => dateOnly(r.dueDate) },
                    {
                      label: 'สถานะ',
                      render: (r) => <StatusBadge value={`เกินกำหนด ${r.daysLate} วัน`} />,
                    },
                    { label: 'คงค้าง (บาท)', align: 'right', render: (r) => money(r.outstanding) },
                  ]}
                />
                <DetailTable
                  title="รับชำระล่าสุด"
                  rows={d.payments}
                  empty="ไม่มีการรับชำระในช่วงนี้"
                  href="/reports/finance/payments"
                  columns={[
                    { label: 'วันที่', render: (r) => dateOnly(r.paidOn) },
                    {
                      label: 'ใบแจ้งหนี้',
                      render: (r) => linkTo('/billing/' + r.invoiceId, r.invoiceCode),
                    },
                    { label: 'ลูกค้า', render: (r) => r.customerName },
                    { label: 'วิธี', render: (r) => r.method },
                    { label: 'ยอด (บาท)', align: 'right', render: (r) => money(r.amount) },
                  ]}
                />
                <DetailTable
                  title="ค่าใช้จ่ายล่าสุด"
                  rows={d.expenses}
                  empty="ไม่มีค่าใช้จ่ายในช่วงนี้"
                  href="/expenses"
                  columns={[
                    { label: 'เลขที่', render: (r) => linkTo('/expenses/' + r.id, r.code) },
                    { label: 'วันที่', render: (r) => dateOnly(r.expenseDate) },
                    { label: 'หมวด', render: (r) => r.categoryName },
                    { label: 'ผู้รับเงิน', render: (r) => r.payee || '-' },
                    { label: 'ยอด (บาท)', align: 'right', render: (r) => money(r.amount) },
                  ]}
                />
                <DetailTable
                  title="การใช้วงเงินเครดิต"
                  rows={d.credit}
                  empty="ไม่มีลูกค้าที่ใช้วงเงิน"
                  href="/customers"
                  columns={[
                    { label: 'ลูกค้า', render: (r) => linkTo('/customers/' + r.id, r.name) },
                    { label: 'วงเงิน', align: 'right', render: (r) => money(r.creditLimit) },
                    { label: 'คงค้าง', align: 'right', render: (r) => money(r.outstanding) },
                    {
                      label: 'สถานะ',
                      render: (r) => (
                        <StatusBadge
                          value={
                            r.usage > 100 ? 'เกินวงเงิน' : r.usage >= 80 ? 'ใกล้เต็มวงเงิน' : 'ปกติ'
                          }
                        />
                      ),
                    },
                    { label: 'ใช้ไป', align: 'right', render: (r) => `${r.usage}%` },
                  ]}
                />
                <div>
                  <DetailTable
                    title="คำสั่งซื้อเสร็จสิ้นที่ยังไม่วางบิล"
                    rows={d.uninvoiced}
                    empty="วางบิลครบทุกคำสั่งซื้อแล้ว"
                    href="/billing/create"
                    columns={[
                      { label: 'คำสั่งซื้อ', render: (r) => linkTo('/orders/' + r.id, r.code) },
                      { label: 'ลูกค้า', render: (r) => r.customerName },
                      { label: 'ยอด (บาท)', align: 'right', render: (r) => money(r.amount) },
                    ]}
                  />
                </div>
              </div>
            )}
          />

          <Section
            section="stock"
            title="จัดซื้อและคลัง"
            description="ใบสั่งซื้อ คงเหลือ อายุล็อต และการตรวจนับ"
            query={query}
            summary={
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="grid content-start grid-cols-2 gap-3">
                  <Mini
                    label="มูลค่าคงคลัง (ต้นทุน)"
                    value={money(data.stock.stockValue)}
                    hint="บาท ทุกคลัง"
                    href="/reports/inventory"
                  />
                  <Mini
                    label="ใบสั่งซื้อในช่วงนี้"
                    value={num(data.stock.purchasesInRange)}
                    hint={`${money(data.stock.purchasesAmount)} บาท`}
                    href="/purchases"
                  />
                  <Mini
                    label="ใบสั่งซื้อเลยวันนัดรับ"
                    value={num(data.stock.purchasesLate)}
                    tone={data.stock.purchasesLate ? 'text-red-600' : 'text-[#26364b]'}
                    href="/purchases"
                  />
                  <Mini
                    label="รอบตรวจนับ"
                    value={num(data.stock.countsOpen)}
                    hint={`กำลังนับ · ปิดในช่วงนี้ ${num(data.stock.countsClosed)} รอบ มีส่วนต่าง ${num(data.stock.countDiffLines)} รายการ`}
                    href="/stock-counts"
                  />
                </div>
                <div className="grid content-start grid-cols-2 gap-3">
                  {data.stock.warehouses.map((w) => (
                    <Mini
                      key={w.code}
                      label={w.name}
                      value={num(w.quantity)}
                      hint="หน่วยคงเหลือ"
                      href="/products/stock"
                    />
                  ))}
                  <Mini
                    label={`ล็อตใกล้หมดอายุ ≤${data.stock.expiryDays} วัน`}
                    value={num(data.stock.expiringLots)}
                    hint={`หมดอายุแล้ว ${num(data.stock.expiredLots)} ล็อต`}
                    tone={data.stock.expiredLots ? 'text-red-600' : 'text-orange-600'}
                    href="/reports/inventory/expiry"
                  />
                  <Mini
                    label={`สินค้าใกล้หมด ≤${data.stock.lowStockLevel}`}
                    value={num(data.stock.lowStock)}
                    hint={`หมดแล้ว ${num(data.stock.outOfStock)} รายการ`}
                    tone={data.stock.outOfStock ? 'text-red-600' : 'text-orange-600'}
                    href="/reports/inventory/low-stock"
                  />
                  <Mini
                    label={`สินค้าไม่เคลื่อนไหว >${data.stock.deadDays} วัน`}
                    value={num(data.stock.deadStock)}
                    hint={`มูลค่าที่จม ${money(data.stock.deadStockValue)} บาท`}
                    tone={data.stock.deadStock ? 'text-orange-600' : 'text-[#26364b]'}
                  />
                  <Mini
                    label="รับของช้ากว่านัดเฉลี่ย"
                    value={days(data.stock.avgReceiptDelay)}
                    hint={`ช้า ${num(data.stock.lateReceipts)} จาก ${num(data.stock.receivedPurchases)} ใบที่รับในช่วงนี้`}
                  />
                </div>
                <Breakdown
                  title="ใบสั่งซื้อตามสถานะ (ทั้งหมด)"
                  rows={data.stock.purchaseStatuses}
                  badge
                  showAmount
                />
              </div>
            }
            details={(d) => (
              <div className="grid gap-4 xl:grid-cols-2">
                <DetailTable
                  title="ใบสั่งซื้อรอรับสินค้า"
                  rows={d.purchases}
                  empty="ไม่มีใบสั่งซื้อค้างรับ"
                  href="/purchases"
                  columns={[
                    { label: 'เลขที่', render: (r) => linkTo('/purchases/' + r.id, r.code) },
                    { label: 'ชื่อ', render: (r) => r.name || '-' },
                    {
                      label: 'นัดรับ',
                      render: (r) => (
                        <span className={r.late ? 'text-red-600' : ''}>
                          {dateOnly(r.expectedOn)}
                        </span>
                      ),
                    },
                    { label: 'สถานะ', render: (r) => <StatusBadge value={r.status} /> },
                    { label: 'ยอด (บาท)', align: 'right', render: (r) => money(r.amount) },
                  ]}
                />
                <DetailTable
                  title="ล็อตใกล้หมดอายุ"
                  rows={d.expiring}
                  empty="ไม่มีล็อตใกล้หมดอายุ"
                  href="/reports/inventory/expiry"
                  columns={[
                    { label: 'สินค้า', render: (r) => r.productName },
                    { label: 'ล็อต', render: (r) => r.lotNumber },
                    { label: 'คลัง', render: (r) => r.warehouseName },
                    {
                      label: 'สถานะ',
                      render: (r) => (
                        <StatusBadge
                          value={
                            r.daysLeft > 0
                              ? `เหลือ ${r.daysLeft} วัน`
                              : r.daysLeft === 0
                                ? 'หมดอายุวันนี้'
                                : `หมดอายุแล้ว ${-r.daysLeft} วัน`
                          }
                        />
                      ),
                    },
                    { label: 'คงเหลือ', align: 'right', render: (r) => num(r.quantity) },
                  ]}
                />
                <DetailTable
                  title="สินค้าใกล้หมด"
                  rows={d.lowStock}
                  empty="ไม่มีสินค้าใกล้หมด"
                  href="/reports/inventory/low-stock"
                  columns={[
                    {
                      label: 'สินค้า',
                      render: (r) => linkTo('/products/' + encodeURIComponent(r.code), r.name),
                    },
                    {
                      label: 'สถานะ',
                      render: (r) => (
                        <StatusBadge value={r.main === 0 ? 'สินค้าหมด' : 'สินค้าใกล้หมด'} />
                      ),
                    },
                    {
                      label: 'คลังหลัก',
                      align: 'right',
                      render: (r) => `${num(r.main)} ${r.unit}`,
                    },
                  ]}
                />
                <DetailTable
                  title="รอบตรวจนับล่าสุด"
                  rows={d.counts}
                  empty="ยังไม่มีรอบตรวจนับ"
                  href="/stock-counts"
                  columns={[
                    { label: 'เลขที่', render: (r) => linkTo('/stock-counts/' + r.id, r.code) },
                    { label: 'คลัง', render: (r) => r.warehouseName },
                    { label: 'สถานะ', render: (r) => <StatusBadge value={r.status} /> },
                    {
                      label: 'นับแล้ว',
                      align: 'right',
                      render: (r) => `${num(r.counted)}/${num(r.lines)}`,
                    },
                    { label: 'มีส่วนต่าง', align: 'right', render: (r) => num(r.diffLines) },
                  ]}
                />
                <div className="xl:col-span-2">
                  <DetailTable
                    title={`สินค้าไม่เคลื่อนไหวเกิน ${data.stock.deadDays} วัน`}
                    rows={d.dead}
                    empty="ไม่มีสินค้าค้างนาน"
                    href="/reports/inventory/summary"
                    columns={[
                      {
                        label: 'สินค้า',
                        render: (r) => linkTo('/products/' + encodeURIComponent(r.code), r.name),
                      },
                      {
                        label: 'ขายล่าสุด',
                        render: (r) => (r.lastSoldOn ? dateOnly(r.lastSoldOn) : 'ยังไม่เคยขาย'),
                      },
                      {
                        label: 'คงเหลือ',
                        align: 'right',
                        render: (r) => `${num(r.quantity)} ${r.unit}`,
                      },
                      { label: 'มูลค่า (บาท)', align: 'right', render: (r) => money(r.value) },
                    ]}
                  />
                </div>
              </div>
            )}
          />

          <Section
            section="customers"
            title="ลูกค้า"
            description="สถานะ เขต กลุ่ม ใบอนุญาต คำขอ และงานติดตาม"
            query={query}
            summary={
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="grid content-start grid-cols-2 gap-3">
                  <Mini label="ลูกค้าทั้งหมด" value={num(data.customers.total)} href="/customers" />
                  <Mini label="ลูกค้าใหม่ในช่วงนี้" value={num(data.customers.created)} />
                  <Mini
                    label="ใบอนุญาตหมดอายุ"
                    value={num(data.customers.licenseExpired)}
                    hint={`ใกล้หมด ≤${data.customers.licenseWarningDays} วัน ${num(data.customers.licenseExpiring)}`}
                    tone={data.customers.licenseExpired ? 'text-red-600' : 'text-[#26364b]'}
                    href="/customers"
                  />
                  <Mini
                    label="คำขอรออนุมัติ"
                    value={num(data.customers.requestsPending)}
                    tone={data.customers.requestsPending ? 'text-orange-600' : 'text-[#26364b]'}
                    href="/customers/requests"
                  />
                  <Mini
                    label="ติดตามเกินนัด"
                    value={num(data.customers.followLate)}
                    hint={`ครบนัดวันนี้ ${num(data.customers.followToday)}`}
                    tone={data.customers.followLate ? 'text-red-600' : 'text-[#26364b]'}
                    href="/customers/dashboard"
                  />
                  <Mini
                    label="ใบเสนอราคารออนุมัติ"
                    value={num(data.customers.quotesPending)}
                    hint={`อายุเฉลี่ย ${days(data.customers.quotesPendingAge)}`}
                    tone={data.customers.quotesPending ? 'text-orange-600' : 'text-[#26364b]'}
                    href="/quotes"
                  />
                  <Mini
                    label={`ใบเสนอราคาใกล้หมดอายุ ≤${data.customers.quoteExpiryDays} วัน`}
                    value={num(data.customers.quotesExpiring)}
                    tone={data.customers.quotesExpiring ? 'text-orange-600' : 'text-[#26364b]'}
                    href="/quotes"
                  />
                  <Mini
                    label="บันทึกติดตามในช่วงนี้"
                    value={num(data.customers.followInRange)}
                    href="/customers/dashboard"
                  />
                </div>
                <Breakdown title="ตามสถานะ" rows={data.customers.statuses} badge />
                <Breakdown title="ตามเขตขาย" rows={data.customers.territories} />
                <Breakdown title="ตามกลุ่มลูกค้า" rows={data.customers.groups} />
              </div>
            }
            details={(d) => (
              <div className="grid gap-4 xl:grid-cols-2">
                <DetailTable
                  title="ใบอนุญาตหมดอายุ / ใกล้หมด"
                  rows={d.licenses}
                  empty="ไม่มีใบอนุญาตใกล้หมดอายุ"
                  href="/customers"
                  columns={[
                    { label: 'ลูกค้า', render: (r) => linkTo('/customers/' + r.id, r.name) },
                    { label: 'หมดอายุ', render: (r) => dateOnly(r.licenseExpiresAt) },
                    {
                      label: 'สถานะ',
                      render: (r) => (
                        <StatusBadge
                          value={r.daysLeft < 0 ? 'ใบอนุญาตหมดอายุ' : 'ใบอนุญาตใกล้หมดอายุ'}
                        />
                      ),
                    },
                  ]}
                />
                <DetailTable
                  title="คำขอเพิ่มลูกค้ารออนุมัติ"
                  rows={d.requests}
                  empty="ไม่มีคำขอรออนุมัติ"
                  href="/customers/requests"
                  columns={[
                    {
                      label: 'ชื่อลูกค้า',
                      render: (r) => linkTo('/customers/requests/' + r.id, r.name),
                    },
                    { label: 'ผู้ส่ง', render: (r) => r.submittedBy },
                    { label: 'ส่งเมื่อ', render: (r) => dateTime(r.submittedAt) },
                  ]}
                />
                <DetailTable
                  title="ใบเสนอราคาค้าง / ใกล้หมดอายุ"
                  rows={d.quotes}
                  empty="ไม่มีใบเสนอราคาค้าง"
                  href="/quotes"
                  columns={[
                    { label: 'เลขที่', render: (r) => linkTo('/quotes/' + r.id, r.code) },
                    { label: 'ลูกค้า', render: (r) => r.customerName },
                    { label: 'สถานะ', render: (r) => <StatusBadge value={r.status} /> },
                    {
                      label: 'ใช้ได้ถึง',
                      render: (r) =>
                        r.validUntil
                          ? `${dateOnly(r.validUntil)} (${r.daysLeft} วัน)`
                          : `ค้าง ${r.ageDays} วัน`,
                    },
                    { label: 'ยอด (บาท)', align: 'right', render: (r) => money(r.amount) },
                  ]}
                />
                <DetailTable
                  title="งานติดตามครบนัด / เกินนัด"
                  rows={d.followUps}
                  empty="ไม่มีงานติดตามค้าง"
                  href="/customers/dashboard"
                  columns={[
                    {
                      label: 'เลขที่',
                      render: (r) => linkTo('/customers/dashboard/' + r.id, r.code),
                    },
                    { label: 'ลูกค้า', render: (r) => r.customerName },
                    {
                      label: 'สถานะ',
                      render: (r) => (
                        <StatusBadge value={r.daysLate > 0 ? 'เกินนัด' : 'ครบนัดวันนี้'} />
                      ),
                    },
                  ]}
                />
              </div>
            )}
          />

          <Section
            section="products"
            title="สินค้าและโปรโมชัน"
            description="สินค้าแยกสถานะ/หมวด และโปรโมชันที่ใช้งาน"
            query={query}
            summary={
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="grid content-start grid-cols-2 gap-3">
                  <Mini label="สินค้าทั้งหมด" value={num(data.products.total)} href="/products" />
                  <Mini
                    label="โปรโมชันใช้งาน"
                    value={num(data.products.promotionsActive)}
                    hint={`ใกล้หมดเขต ${num(data.products.promotionsEnding)}`}
                    href="/promotions"
                  />
                  <Mini
                    label="ใบเสนอราคาที่ใช้โปร"
                    value={num(data.products.promotionQuotes)}
                    hint="ในช่วงนี้"
                  />
                  <Mini
                    label="คำสั่งซื้อที่ใช้โปร"
                    value={num(data.products.promotionOrders)}
                    hint="ในช่วงนี้"
                  />
                </div>
                <Breakdown title="ตามสถานะ" rows={data.products.statuses} badge />
                <Breakdown title="ตามหมวดหมู่" rows={data.products.categories} />
              </div>
            }
            details={(d) => (
              <DetailTable
                title="โปรโมชันที่ใช้งาน"
                rows={d.promotions}
                empty="ไม่มีโปรโมชันที่ใช้งาน"
                href="/promotions"
                columns={[
                  { label: 'เลขที่', render: (r) => linkTo('/promotions/' + r.id, r.code) },
                  { label: 'ชื่อ', render: (r) => r.name },
                  {
                    label: 'ช่วงเวลา',
                    render: (r) => `${dateOnly(r.startsOn)} – ${dateOnly(r.endsOn)}`,
                  },
                  { label: 'สถานะ', render: (r) => <StatusBadge value={r.status} /> },
                  { label: 'ใช้ในใบเสนอราคา', align: 'right', render: (r) => num(r.quotes) },
                  { label: 'ใช้ในคำสั่งซื้อ', align: 'right', render: (r) => num(r.orders) },
                ]}
              />
            )}
          />

          <Section
            section="system"
            title="ระบบและผู้ใช้งาน"
            description="ผู้ใช้งาน การเข้าระบบ และกิจกรรมล่าสุด"
            query={query}
            summary={
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="grid content-start grid-cols-2 gap-3">
                  <Mini label="ผู้ใช้งานทั้งหมด" value={num(data.system.users)} href="/users" />
                  <Mini label="เข้าระบบวันนี้" value={num(data.system.loggedInToday)} />
                  <Mini
                    label={`ไม่ได้เข้าระบบเกิน ${data.system.inactiveDays} วัน`}
                    value={num(data.system.inactive)}
                    tone={data.system.inactive ? 'text-orange-600' : 'text-[#26364b]'}
                  />
                  <Mini
                    label="กิจกรรมในช่วงนี้"
                    value={num(data.system.auditEvents)}
                    href="/audit-logs"
                  />
                </div>
                <Breakdown title="ตามบทบาท" rows={data.system.roles} />
                <Breakdown title="ตามสถานะ" rows={data.system.statuses} badge />
              </div>
            }
            details={(d) => (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <DetailTable
                  title="กิจกรรมล่าสุด 20 รายการ"
                  rows={d.audit}
                  empty="ยังไม่มีกิจกรรม"
                  href="/audit-logs"
                  columns={[
                    { label: 'เวลา', render: (r) => dateTime(r.occurredAt) },
                    { label: 'ผู้ทำ', render: (r) => r.actorName },
                    { label: 'การกระทำ', render: (r) => r.action },
                  ]}
                />
                <DetailTable
                  title={`ไม่ได้เข้าระบบเกิน ${data.system.inactiveDays} วัน`}
                  rows={d.inactive}
                  empty="ทุกคนเข้าระบบสม่ำเสมอ"
                  href="/users"
                  columns={[
                    {
                      label: 'ผู้ใช้',
                      render: (r) => linkTo('/users/' + encodeURIComponent(r.employeeCode), r.name),
                    },
                    { label: 'บทบาท', render: (r) => r.roleName },
                    {
                      label: 'เข้าล่าสุด',
                      render: (r) => (r.lastLoginAt ? dateTime(r.lastLoginAt) : 'ยังไม่เคยเข้าใช้'),
                    },
                  ]}
                />
              </div>
            )}
          />
        </div>
      )}
    </section>
  );
}
