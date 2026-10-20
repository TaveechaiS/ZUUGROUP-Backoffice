import type { ReactNode } from 'react';
import Link from 'next/link';
import NotFoundComponent from '@/components/ui/not-found-component';
import { money } from '@/components/sales/document-ui';
import type { Dashboard, DashboardTask } from '@/types/api/reports';

const compact = (value: number) =>
  value.toLocaleString('th-TH', { notation: 'compact', maximumFractionDigits: 1 });

const monthFormat = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  month: 'short',
  year: '2-digit',
  timeZone: 'Asia/Bangkok',
});
const monthLabel = (month: string) => monthFormat.format(new Date(month + '-01T00:00:00+07:00'));

const dayFormat = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeZone: 'Asia/Bangkok',
});
export const thaiDay = (day: string) => dayFormat.format(new Date(day + 'T00:00:00+07:00'));

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-[#d9e3ee] bg-white shadow-sm ${className}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-[#e3e9f0] px-5 py-4">
        <h2 className="m-0 text-base poppins-semibold text-[#26364b]">{title}</h2>
        {action}
      </header>
      <div className="flex-1 p-5">{children}</div>
    </section>
  );
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm poppins-medium text-[#1a58a7] hover:underline">
      {children}
    </Link>
  );
}

const statTones = {
  blue: 'bg-blue-50 text-blue-700',
  emerald: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
};

export function StatCard({
  label,
  value,
  unit,
  hint,
  tone,
  icon,
  href,
  change,
}: {
  label: string;
  value: string;
  unit?: string;
  hint: string;
  tone: keyof typeof statTones;
  icon: ReactNode;
  href: string;
  change?: number | null;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-xl border border-[#d9e3ee] bg-white p-5 shadow-sm transition hover:border-[#1a58a7] hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-sm poppins-medium text-[#718096]">{label}</p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${statTones[tone]}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <p className="m-0 text-2xl poppins-semibold text-[#26364b] md:text-[28px]">
        {value}
        {unit && <span className="ml-1.5 text-sm poppins-regular text-[#718096]">{unit}</span>}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#718096]">
        {change !== undefined && change !== null && (
          <span
            className={`rounded-full px-2 py-0.5 poppins-semibold ${change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
          >
            {change >= 0 ? '▲' : '▼'}{' '}
            {Math.abs(change).toLocaleString('th-TH', { maximumFractionDigits: 1 })}%
          </span>
        )}
        <span>{hint}</span>
      </div>
    </Link>
  );
}

export function TrendChart({ trend }: { trend: Dashboard['sales']['trend'] }) {
  const values = trend.map((row) => Number(row.total));
  const max = Math.max(...values, 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  const ticks = [1, 0.5, 0];
  return (
    <div>
      <p className="m-0 text-sm text-[#718096]">
        รวม 12 เดือน <span className="poppins-semibold text-[#26364b]">{money(total)} บาท</span>
      </p>
      <div className="mt-5 flex gap-3">
        <div className="flex h-56 flex-col justify-between pb-6 text-right text-[11px] text-[#8994a5]">
          {ticks.map((tick) => (
            <span key={tick}>{compact(max * tick)}</span>
          ))}
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-dashed border-[#e3e9f0]" />
            ))}
          </div>
          <ol className="relative m-0 grid h-56 list-none grid-cols-12 items-end gap-1.5 p-0 sm:gap-3">
            {trend.map((row, index) => {
              const value = Number(row.total);
              const current = index === trend.length - 1;
              return (
                <li key={row.month} className="group flex h-full flex-col items-center justify-end">
                  <div className="relative flex w-full flex-1 items-end justify-center pb-0">
                    <span className="pointer-events-none absolute -top-1 z-10 hidden -translate-y-full whitespace-nowrap rounded-md bg-[#26364b] px-2 py-1 text-[11px] text-white shadow group-hover:block">
                      {monthLabel(row.month)} · {money(value)} บาท · {row.orders} รายการ
                    </span>
                    <div
                      className={`w-full max-w-9 rounded-t-md transition ${current ? 'bg-[#1a58a7]' : 'bg-blue-200 group-hover:bg-blue-400'}`}
                      style={{
                        height: max ? `${Math.max((value / max) * 100, value ? 2 : 0)}%` : '0%',
                      }}
                      role="img"
                      aria-label={`${monthLabel(row.month)} ${money(value)} บาท ${row.orders} รายการ`}
                    />
                  </div>
                  <span
                    className={`mt-2 h-4 text-[10px] sm:text-[11px] ${current ? 'poppins-semibold text-[#1a58a7]' : 'text-[#8994a5]'}`}
                  >
                    {monthLabel(row.month).split(' ')[0]}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

const agingRows = [
  { key: 'current', label: 'ยังไม่ถึงกำหนด', color: 'bg-emerald-500' },
  { key: 'd30', label: 'เกิน 1–30 วัน', color: 'bg-amber-400' },
  { key: 'd60', label: 'เกิน 31–60 วัน', color: 'bg-orange-500' },
  { key: 'd90', label: 'เกิน 61–90 วัน', color: 'bg-red-500' },
  { key: 'over90', label: 'เกิน 90 วัน', color: 'bg-red-700' },
] as const;

export function AgingChart({
  finance,
}: {
  finance: Pick<NonNullable<Dashboard['finance']>, 'outstanding' | 'aging'>;
}) {
  const total = Number(finance.outstanding);
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="m-0 text-sm text-[#718096]">ยอดค้างรวม</p>
        <p className="m-0 mt-1 text-xl poppins-semibold text-[#26364b]">{money(total)} บาท</p>
      </div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-[#eef2f7]"
        role="img"
        aria-label={agingRows
          .map((row) => `${row.label} ${money(finance.aging[row.key])} บาท`)
          .join(', ')}
      >
        {agingRows.map((row) => {
          const value = Number(finance.aging[row.key]);
          return total > 0 && value > 0 ? (
            <div
              key={row.key}
              className={row.color}
              style={{ width: `${(value / total) * 100}%` }}
            />
          ) : null;
        })}
      </div>
      <ul className="m-0 grid list-none gap-3 p-0">
        {agingRows.map((row) => {
          const value = Number(finance.aging[row.key]);
          return (
            <li key={row.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-[#344256]">
                <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} aria-hidden="true" />
                {row.label}
              </span>
              <span className="text-right">
                <span className="poppins-medium text-[#26364b]">{money(value)}</span>
                <span className="ml-2 inline-block w-12 text-xs text-[#8994a5]">
                  {total > 0 ? ((value / total) * 100).toFixed(0) : 0}%
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const taskTones: Record<DashboardTask['tone'], string> = {
  info: 'bg-blue-50 text-blue-600',
  warning: 'bg-orange-50 text-orange-600',
  danger: 'bg-red-50 text-red-600',
};

export function TaskList({ tasks }: { tasks: DashboardTask[] }) {
  return (
    <ul className="m-0 grid list-none gap-2 p-0">
      {tasks.map((task) => (
        <li key={task.key}>
          <Link
            href={task.href}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#e3e9f0] px-4 py-3 transition hover:border-[#1a58a7] hover:bg-[#f7f9fc]"
          >
            <span className="text-sm text-[#344256]">{task.label}</span>
            <span
              className={`min-w-9 rounded-full px-2.5 py-0.5 text-center text-sm poppins-semibold ${task.count ? taskTones[task.tone] : 'bg-slate-50 text-slate-500'}`}
            >
              {task.count.toLocaleString('th-TH')}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function RankList({
  rows,
  empty,
  onRefresh,
}: {
  rows: { id: string; name: string; detail: string; total: string }[];
  empty: string;
  onRefresh: () => void;
}) {
  if (!rows.length)
    return (
      <NotFoundComponent
        title={empty}
        description="ยังไม่มีคำสั่งซื้อเสร็จสิ้นในเดือนนี้"
        onRefresh={onRefresh}
      />
    );
  const max = Math.max(...rows.map((row) => Number(row.total)), 0);
  return (
    <ol className="m-0 grid list-none gap-4 p-0">
      {rows.map((row, index) => (
        <li key={row.id ?? index} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-4 shrink-0 poppins-semibold text-[#8994a5]">{index + 1}</span>
              <span className="truncate poppins-medium text-[#26364b]" title={row.name}>
                {row.name}
              </span>
            </span>
            <span className="shrink-0 poppins-medium text-[#26364b]">{money(row.total)}</span>
          </div>
          <div className="ml-6 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eef2f7]">
              <div
                className="h-full rounded-full bg-[#1a58a7]"
                style={{ width: max ? `${(Number(row.total) / max) * 100}%` : '0%' }}
              />
            </div>
            <span className="shrink-0 text-xs text-[#8994a5]">{row.detail}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
