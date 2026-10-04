'use client';
import type { ReactNode } from 'react';
export const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#26364b] outline-none focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50';
export const buttonClass =
  'rounded-lg bg-[#1a58a7] px-4 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryClass =
  'rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm poppins-medium text-[#26364b] hover:bg-blue-50 disabled:opacity-50';
export const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
export const dateOnly = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value.slice(0, 10) + 'T00:00:00+07:00'));
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm poppins-medium text-[#26364b]">
      {label}
      {children}
      {hint && <span className="text-xs poppins-regular text-gray-500">{hint}</span>}
    </label>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
      {message}
    </p>
  ) : null;
}
export function Paging({
  offset,
  total,
  limit = 10,
  onChange,
}: {
  offset: number;
  total: number;
  limit?: number;
  onChange: (offset: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
      <span>
        {total ? `${offset + 1}–${Math.min(offset + limit, total)} จาก ${total}` : 'ไม่มีรายการ'}
      </span>
      <div className="flex gap-2">
        <button
          className={secondaryClass}
          disabled={!offset}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          ก่อนหน้า
        </button>
        <button
          className={secondaryClass}
          disabled={offset + limit >= total}
          onClick={() => onChange(offset + limit)}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
