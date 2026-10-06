'use client';
import { useId } from 'react';

export const PAGE_SIZES = [10, 20, 50, 100] as const;
export function visiblePaginationPages(page: number, pages: number, maximum = 5) {
  const total = Math.max(1, Math.floor(pages) || 1);
  const current = Math.max(1, Math.min(total, Math.floor(page) || 1));
  const max = Math.max(3, Math.min(15, Math.floor(maximum) || 5));
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
  const middle = max - 2;
  const start = Math.max(2, Math.min(current - Math.floor(middle / 2), total - middle));
  const end = start + middle - 1;
  const result: (number | string)[] = [1];
  if (start > 2) result.push('before');
  for (let i = start; i <= end; i++) result.push(i);
  if (end < total - 1) result.push('after');
  result.push(total);
  return result;
}
export default function PaginationControls({
  page,
  pages,
  total,
  count,
  onChange,
  pageSize = 10,
  onPageSizeChange,
  maxVisiblePages = 5,
  disabled = false,
}: {
  page: number;
  pages: number;
  total: number;
  count: number;
  onChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  maxVisiblePages?: number;
  disabled?: boolean;
}) {
  const sizeId = useId();
  const last = Math.max(1, Math.floor(pages) || 1);
  const current = Math.max(1, Math.min(last, Math.floor(page) || 1));
  const buttonClass =
    'flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm poppins-regular text-gray-600 hover:bg-gray-100 disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A58A7]';
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-5 text-sm text-[#758195]">
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange ? (
          <label htmlFor={sizeId} className="flex items-center gap-2 text-gray-600">
            แสดง
            <select
              id={sizeId}
              aria-label="จำนวนรายการต่อหน้า"
              value={pageSize}
              disabled={disabled}
              onChange={(event) => {
                const size = Number(event.target.value);
                if (PAGE_SIZES.some((value) => value === size)) onPageSizeChange(size);
              }}
              className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm poppins-regular outline-none focus:border-[#1A58A7] disabled:opacity-40"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            จาก {total} รายการ
          </label>
        ) : (
          <span>
            แสดง {count} จาก {total} รายการ
          </span>
        )}
      </div>
      <nav className="flex flex-wrap items-center gap-2" aria-label="เปลี่ยนหน้ารายการ">
        <button
          type="button"
          disabled={disabled || current <= 1}
          onClick={() => onChange(current - 1)}
          className={buttonClass}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          ก่อนหน้า
        </button>
        <div className="flex items-center gap-1">
          {visiblePaginationPages(current, last, maxVisiblePages).map((number) =>
            typeof number === 'string' ? (
              <span key={number} aria-hidden="true" className="px-2 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={number}
                type="button"
                aria-current={current === number ? 'page' : undefined}
                aria-label={`หน้า ${number}`}
                disabled={disabled}
                onClick={() => onChange(number)}
                className={`size-9 min-w-9 shrink-0 rounded-lg border p-0 text-sm poppins-regular disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A58A7] ${current === number ? 'border-[#1A58A7] bg-[#1A58A7] text-white' : 'border-[#E4E7EC] bg-white text-gray-500 hover:bg-gray-100'}`}
              >
                {number}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          disabled={disabled || current >= last}
          onClick={() => onChange(current + 1)}
          className={buttonClass}
        >
          ถัดไป
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </nav>
    </div>
  );
}
