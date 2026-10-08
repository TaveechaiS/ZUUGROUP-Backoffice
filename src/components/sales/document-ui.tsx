// Shared layout pieces for sales documents (orders TASK-274, quotations TASK-275), matching the
// customer/product pages.
import type { ReactNode } from 'react';
import ChevronDown from '@/components/ui/chevron-down';

export const ORDER_STATUSES = ['รอตรวจ', 'อนุมัติ', 'ส่งกลับแก้ไข', 'เสร็จสิ้น', 'ยกเลิก'] as const;
export const VAT_RATE = 7;

export const inputClass =
  'mt-2 block w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none placeholder:text-[#8994a5] focus:border-[#1a58a7] disabled:bg-[#f7f9fc] disabled:text-[#8994a5]';
export const primaryButton =
  'rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryButton =
  'rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-sm poppins-medium text-[#344256] hover:bg-gray-50 disabled:opacity-50';

export const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const dateTimeFormat = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
export const dateTime = (value: string) => dateTimeFormat.format(new Date(value));

export function Section({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group rounded-lg border border-[#d9e3ee] p-4 md:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a58a7] [&::-webkit-details-marker]:hidden">
        <h2 className="text-base poppins-semibold text-[#1a58a7]">{title}</h2>
        <ChevronDown className="shrink-0 text-[#1A58A7] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <span className="block text-sm poppins-medium text-[#344256]">
      {text}
      {required && (
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      )}
    </span>
  );
}

export function Item({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="text-xs poppins-medium text-[#65758b]">{label}</dt>
      <dd className="m-0 mt-1 whitespace-pre-line break-words text-sm poppins-regular text-[#344256]">
        {value || '—'}
      </dd>
    </div>
  );
}

const dateFormat = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeZone: 'Asia/Bangkok',
});
// value is YYYY-MM-DD (a calendar day in Bangkok).
export const dateOnly = (value: string | null) =>
  value ? dateFormat.format(new Date(`${value}T12:00:00+07:00`)) : '—';

export function bangkokToday(offsetDays = 0) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  const value = new Date(`${today}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offsetDays);
  return value.toISOString().slice(0, 10);
}

// Same look as the customer date fields: native calendar, Buddhist-era text on top.
export function DateInput({
  label,
  value,
  min,
  max,
  required = true,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  max?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative mt-2">
      <input
        type="date"
        required={required}
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="block h-11 w-full min-w-0 rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-transparent outline-none focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-3 right-10 flex items-center text-sm poppins-regular ${value ? 'text-[#344256]' : 'text-[#8994a5]'}`}
      >
        {value ? dateOnly(value) : 'วว / ดด / พ.ศ.'}
      </span>
    </div>
  );
}

type PricedLine = { quantity: number; unitPrice: unknown; discount: unknown };
const round = (value: number) => Math.round(value * 100) / 100;
export const lineTotal = (line: PricedLine) =>
  round(Math.max(0, line.quantity * Number(line.unitPrice ?? 0) - Number(line.discount ?? 0)));

// Prices include VAT, so VAT is extracted from the total rather than added on top.
export function Totals({ lines }: { lines: PricedLine[] }) {
  const gross = round(
    lines.reduce((sum, line) => sum + line.quantity * Number(line.unitPrice ?? 0), 0),
  );
  const discount = round(lines.reduce((sum, line) => sum + Number(line.discount ?? 0), 0));
  const total = round(lines.reduce((sum, line) => sum + lineTotal(line), 0));
  const beforeVat = round((total * 100) / (100 + VAT_RATE));
  const rows: [string, number, boolean?][] = [
    ['ราคารวมก่อนส่วนลด', gross],
    ['ส่วนลดรวม', -discount],
    ['มูลค่าก่อน VAT', beforeVat],
    [`VAT ${VAT_RATE}%`, round(total - beforeVat)],
    ['ยอดรวมทั้งสิ้น (รวม VAT)', total, true],
  ];
  return (
    <dl className="m-0 ml-auto mt-4 grid max-w-sm grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
      {rows.map(([label, value, strong]) => (
        <div key={label} className="contents">
          <dt className={strong ? 'poppins-semibold text-[#26364b]' : 'text-[#65758b]'}>{label}</dt>
          <dd
            className={`m-0 text-right ${strong ? 'poppins-semibold text-[#1a58a7]' : 'text-[#344256]'}`}
          >
            {money(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
