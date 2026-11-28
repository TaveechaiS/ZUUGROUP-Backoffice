'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
  type TableHTMLAttributes,
} from 'react';

export type TableSort = {
  key: string;
  direction: 'asc' | 'desc';
  select: (key: string) => void;
  reset: () => void;
};
export function useTableSort(onChange?: () => void): TableSort {
  const [value, setValue] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: '',
    direction: 'asc',
  });
  return {
    ...value,
    reset: () => setValue({ key: '', direction: 'asc' }),
    select: (key) => {
      setValue((previous) =>
        previous.key === key
          ? previous.direction === 'asc'
            ? { key, direction: 'desc' }
            : { key: '', direction: 'asc' }
          : { key, direction: 'asc' },
      );
      onChange?.();
    },
  };
}
export function withTableSort(url: string, sort: Pick<TableSort, 'key' | 'direction'>) {
  return sort.key
    ? url +
        (url.includes('?') ? '&' : '?') +
        new URLSearchParams({ sortBy: sort.key, sortDirection: sort.direction })
    : url;
}
function content(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(content).join(' ');
  if (isValidElement<Record<string, unknown>>(node)) {
    if (node.props['data-sort-value'] !== undefined) return String(node.props['data-sort-value']);
    if (typeof node.props.value === 'string') return node.props.value;
    return content(node.props.children as ReactNode);
  }
  return '';
}
const months = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];
export function compareTableValues(left: string, right: string) {
  function value(text: string): string | number | null {
    const s = text.trim();
    if (!s || s === '—' || s === '-') return null;
    const numeric = s
      .replace(/,/g, '')
      .match(/^(-?\d+(?:\.\d+)?)\s*(?:บาท|ชิ้น|กล่อง|ล็อต|วัน|%|ลัง|เม็ด|หลอด)?$/);
    if (numeric) return Number(numeric[1]);
    const thaiDate = s.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (thaiDate && months.includes(thaiDate[2]))
      return Date.UTC(
        Number(thaiDate[3]) - 543,
        months.indexOf(thaiDate[2]),
        Number(thaiDate[1]),
        Number(thaiDate[4] ?? 0),
        Number(thaiDate[5] ?? 0),
      );
    if (/^\d{4}-\d{2}-\d{2}/.test(s) && Number.isFinite(Date.parse(s))) return Date.parse(s);
    return s;
  }
  const a = value(left),
    b = value(right);
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
  return typeof a === 'number' && typeof b === 'number'
    ? a - b
    : String(a).localeCompare(String(b), 'th', { numeric: true });
}
function cells(node: ReactNode): ReactNode[] {
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  if (node.type === 'tr') return Children.toArray(node.props.children as ReactNode);
  for (const child of Children.toArray(node.props.children as ReactNode)) {
    const found = cells(child);
    if (found.length) return found;
  }
  return [];
}
export default function SortableTable({
  sort: controlled,
  columns,
  children,
  ...props
}: TableHTMLAttributes<HTMLTableElement> & {
  sort?: TableSort;
  columns?: readonly (string | null)[];
}) {
  const local = useTableSort();
  const sort = controlled ?? local;
  let index = 0;
  function headers(node: ReactNode): ReactNode {
    if (!isValidElement<Record<string, unknown>>(node)) return node;
    if (node.type === 'th') {
      const column = index++;
      const label = content(node.props.children as ReactNode);
      const key = columns ? columns[column] : String(column);
      if (
        key == null ||
        !label ||
        /จัดการ|การดำเนินการ|เลือก|^แก้ไข$/.test(label) ||
        Number(node.props.colSpan ?? 1) > 1
      )
        return node;
      const active = sort.key === key;
      const color = '#65758b',
        inactive = active ? '#cbd5e1' : 'currentColor';
      return cloneElement(node, {
        scope: 'col',
        'aria-sort': active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none',
        children: (
          <button
            type="button"
            onClick={() => sort.select(key)}
            aria-label={
              'เรียง ' +
              label +
              (active
                ? sort.direction === 'asc'
                  ? ' จากมากไปน้อย'
                  : ' คืนลำดับเดิม'
                : ' จากน้อยไปมาก')
            }
            className="inline-flex items-center gap-1.5 text-left outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#1a58a7]"
          >
            <span>{node.props.children as ReactNode}</span>
            <svg
              width="12"
              height="11"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className={active ? 'shrink-0' : 'shrink-0 opacity-55'}
            >
              <path
                d="M5 1V17M9 13L5 17L1 13"
                stroke={active && sort.direction === 'asc' ? color : inactive}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 17V1M19 5L15 1L11 5"
                stroke={active && sort.direction === 'desc' ? color : inactive}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ),
      });
    }
    return cloneElement(node, {
      children: Children.map(node.props.children as ReactNode, headers),
    });
  }
  return (
    <table {...props}>
      {Children.map(children, (node) => {
        if (!isValidElement<Record<string, unknown>>(node)) return node;
        if (node.type === 'thead') return headers(node);
        if (node.type === 'tbody' && !controlled && sort.key) {
          const column = Number(sort.key);
          const rows = Children.toArray(node.props.children as ReactNode).map((row, position) => ({
            row,
            position,
            value: content(cells(row)[column]),
          }));
          rows.sort((a, b) => {
            const empty = (text: string) => ['', '—', '-'].includes(text.trim());
            if (empty(a.value) !== empty(b.value)) return empty(a.value) ? 1 : -1;
            return (
              compareTableValues(a.value, b.value) * (sort.direction === 'asc' ? 1 : -1) ||
              a.position - b.position
            );
          });
          return cloneElement(node as ReactElement<Record<string, unknown>>, {
            children: rows.map((row) => row.row),
          });
        }
        return node;
      })}
    </table>
  );
}
export function TableSortControls({
  sort,
  columns,
}: {
  sort: TableSort;
  columns: { key: string | null; label: string }[];
}) {
  const visible = columns.filter((column) => column.key && column.label);
  return (
    <div
      className="mb-3 overflow-x-auto rounded-md border border-[#d9e3ee] md:hidden"
      aria-label="เรียงข้อมูล"
    >
      <SortableTable
        sort={sort}
        columns={visible.map((column) => column.key)}
        className="w-full whitespace-nowrap text-xs"
      >
        <thead>
          <tr>
            {visible.map((column, index) => (
              <th key={index} scope="col" className="px-3 py-2 poppins-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
      </SortableTable>
    </div>
  );
}
