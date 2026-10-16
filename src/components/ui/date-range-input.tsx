'use client';

import type { MouseEvent } from 'react';
import { CalendarIcon, CloseIcon } from '@/components/icons/status-icons';

const shortDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${String(Number(year) + 543).slice(-2)}`;
};

const openPicker = (event: MouseEvent<HTMLInputElement>) => event.currentTarget.showPicker?.();

export default function DateRangeInput({
  label = 'ช่วงวันที่',
  from,
  to,
  clearable = true,
  onChange,
}: {
  label?: string;
  from: string;
  to: string;
  clearable?: boolean;
  onChange: (from: string, to: string) => void;
}) {
  const part = (value: string, placeholder: string) => (
    <span className={value ? 'text-[#26364b]' : 'text-[#8994a5]'}>
      {value ? shortDate(value) : placeholder}
    </span>
  );
  const input =
    'absolute inset-0 h-full w-full cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full';
  return (
    <div role="group" aria-label={label} className="min-w-0 text-xs text-[#53647c]">
      {label}
      <div className="mt-1.5 flex h-10 w-full items-center gap-2 rounded-md border border-[#d9e3ee] bg-white px-3 text-sm focus-within:border-[#1a58a7]">
        <CalendarIcon className="h-4 w-4 shrink-0 text-[#8994a5]" />
        <span className="relative min-w-0 flex-1 truncate whitespace-nowrap">
          {part(from, 'วว/ดด/ปป')}
          <input
            type="date"
            aria-label="ตั้งแต่วันที่"
            value={from}
            max={to || undefined}
            onClick={openPicker}
            onChange={(event) => onChange(event.target.value, to)}
            className={input}
          />
        </span>
        <span aria-hidden="true" className="text-[#8994a5]">
          –
        </span>
        <span className="relative min-w-0 flex-1 truncate whitespace-nowrap">
          {part(to, 'วว/ดด/ปป')}
          <input
            type="date"
            aria-label="ถึงวันที่"
            value={to}
            min={from || undefined}
            onClick={openPicker}
            onChange={(event) => onChange(from, event.target.value)}
            className={input}
          />
        </span>
        {clearable && (from || to) && (
          <button
            type="button"
            aria-label="ล้างช่วงวันที่"
            onClick={() => onChange('', '')}
            className="shrink-0 text-[#8994a5] hover:text-[#26364b]"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
