'use client';
import DateRangeInput from '@/components/ui/date-range-input';

import { useEffect, useState, type ReactNode } from 'react';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import PaginationControls from '@/components/ui/pagination-controls';
import { bangkokToday, money } from '@/components/sales/document-ui';
import { Get } from '@/service/http';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass, secondaryButtonClass } from '@/components/ui/form-classes';
import { downloadCsv } from '@/components/reports/csv';

type Row = Record<string, unknown> & { id?: string };
type Result = {
  data: Row[];
  pagination: { total: number };
  summary?: {
    orders: number;
    quantity: number;
    total: string;
    net: string;
    cost?: string;
    profit?: string;
  };
  seesCost?: boolean;
  totalAmount?: string;
  filters?: Record<string, { id: string; name: string }[]>;
};
export type ReportColumn = {
  key: string | null;
  label: string;
  render: (row: Row) => ReactNode;
  align?: 'right';
  costOnly?: boolean;
};
export type ReportFilter = {
  key: string;
  label: string;
  options: readonly string[] | [string, string][];
};
export type ReportRemoteFilter = { key: string; label: string; source: string };

const CSV_LIMIT = 10000;

export const count = (value: unknown) => Number(value ?? 0).toLocaleString('th-TH');

export default function ReportTable({
  endpoint,
  title,
  columns,
  searchPlaceholder,
  ranged = false,
  filters = [],
  remoteFilters = [],
  summary = false,
  totalLabel,
  emptyTitle,
}: {
  endpoint: string;
  title: string;
  columns: ReportColumn[];
  searchPlaceholder?: string;
  ranged?: boolean;
  filters?: ReportFilter[];
  remoteFilters?: ReportRemoteFilter[];
  summary?: boolean;
  totalLabel?: string;
  emptyTitle: string;
}) {
  const [from, setFrom] = useState(bangkokToday().slice(0, 8) + '01');
  const [to, setTo] = useState(bangkokToday());
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const query = new URLSearchParams({
        search,
        ...selected,
        ...(ranged ? { from, to } : {}),
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<Result>(
        withTableSort(endpoint + '?' + query, { key: sort.key, direction: sort.direction }),
        controller.signal,
      )
        .then((value) => {
          if (controller.signal.aborted) return;
          setResult(value);
          const last = Math.max(1, Math.ceil(value.pagination.total / pageSize));
          if (page > last) setPage(last);
        })
        .catch((caught) => {
          if (!controller.signal.aborted)
            setError(caught instanceof Error ? caught.message : 'โหลดข้อมูลไม่สำเร็จ');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    endpoint,
    ranged,
    from,
    to,
    search,
    selected,
    page,
    pageSize,
    retry,
    sort.key,
    sort.direction,
  ]);

  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const shown = columns.filter((column) => !column.costOnly || result?.seesCost);
  const control = `mt-1.5 ${filterClass}`;
  const [remoteOptions, setRemoteOptions] = useState<Result['filters']>();
  if (result?.filters && result.filters !== remoteOptions) setRemoteOptions(result.filters);
  const allFilters: ReportFilter[] = [
    ...filters,
    ...remoteFilters
      .filter((filter) => remoteOptions?.[filter.source])
      .map((filter) => ({
        key: filter.key,
        label: filter.label,
        options: remoteOptions![filter.source].map(
          (option) => [option.id, option.name] as [string, string],
        ),
      })),
  ];
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState('');
  async function exportCsv() {
    setExporting(true);
    setError('');
    setExportNote('');
    try {
      const rows: Row[] = [];
      let available = 0;
      for (let offset = 0; offset < CSV_LIMIT; offset += 100) {
        const query = new URLSearchParams({
          search,
          ...selected,
          ...(ranged ? { from, to } : {}),
          limit: '100',
          offset: String(offset),
        });
        const value = await Get<Result>(
          withTableSort(endpoint + '?' + query, { key: sort.key, direction: sort.direction }),
        );
        available = value.pagination.total;
        rows.push(...value.data);
        if (rows.length >= available || !value.data.length) break;
      }
      downloadCsv(title, shown, rows.slice(0, CSV_LIMIT));
      if (available > CSV_LIMIT)
        setExportNote(
          `ส่งออก ${count(CSV_LIMIT)} จาก ${count(available)} รายการ (สูงสุด ${count(CSV_LIMIT)} รายการต่อไฟล์) กรุณาแบ่งช่วงวันที่หรือใช้ตัวกรองเพื่อส่งออกส่วนที่เหลือ`,
        );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ส่งออกไม่สำเร็จ');
    } finally {
      setExporting(false);
    }
  }

  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
    >
      {totalLabel && result?.totalAmount !== undefined && (
        <div className="flex justify-end">
          <p className="text-sm text-[#53647c]">
            {totalLabel}{' '}
            <span className="poppins-semibold text-[#1a58a7]">{money(result.totalAmount)}</span> บาท
          </p>
        </div>
      )}
      <ListRequestState error={error} retry={() => setRetry((n) => n + 1)} />
      <div className={filterGridClass(allFilters.length + (ranged ? 1 : 0))}>
        {searchPlaceholder && (
          <label className="min-w-0 text-xs text-[#53647c]">
            ค้นหา
            <div className="relative mt-1.5">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
              <input
                type="search"
                className={`${filterClass} pl-10`}
                value={search}
                placeholder={searchPlaceholder}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </label>
        )}
        {allFilters.map((filter) => (
          <label key={filter.key} className="text-xs text-[#53647c]">
            {filter.label}
            <select
              className={control}
              value={selected[filter.key] ?? ''}
              onChange={(e) => {
                setSelected((current) => ({ ...current, [filter.key]: e.target.value }));
                setPage(1);
              }}
            >
              <option value="">ทั้งหมด</option>
              {filter.options.map((option) => {
                const [value, label] = Array.isArray(option) ? option : [option, option];
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>
        ))}
        {ranged && (
          <>
            <DateRangeInput
              from={from}
              to={to}
              clearable={false}
              onChange={(nextFrom, nextTo) => {
                setFrom(nextFrom);
                setTo(nextTo);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
      {summary && result?.summary && (
        <dl
          className={`m-0 grid grid-cols-2 gap-3 ${result.summary.cost !== undefined ? 'lg:grid-cols-3 2xl:grid-cols-6' : 'lg:grid-cols-4'}`}
        >
          {[
            ['คำสั่งซื้อ', count(result.summary.orders) + ' ใบ'],
            ['จำนวนสินค้า', count(result.summary.quantity) + ' ชิ้น'],
            ['ยอดขาย (รวม VAT)', money(result.summary.total) + ' บาท'],
            ['ยอดก่อน VAT', money(result.summary.net) + ' บาท'],
            ...(result.summary.cost !== undefined && result.summary.profit !== undefined
              ? [
                  ['ต้นทุนขาย', money(result.summary.cost) + ' บาท'],
                  [
                    'กำไรขั้นต้น',
                    `${money(result.summary.profit)} บาท (${
                      Number(result.summary.net)
                        ? (
                            (Number(result.summary.profit) / Number(result.summary.net)) *
                            100
                          ).toFixed(1)
                        : '0.0'
                    }%)`,
                  ],
                ]
              : []),
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#e3e9f0] bg-white p-4">
              <dt className="text-xs text-[#65758b]">{label}</dt>
              <dd className="m-0 mt-1 text-lg poppins-semibold text-[#1a58a7]">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <LoadingComponent isVisible={loading && !error} variant="content" />
        <SortableTable
          sort={sort}
          columns={shown.map((column) => column.key)}
          className="w-full min-w-[880px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {shown.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={`px-4 py-3 poppins-semibold ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!error &&
              rows.map((row, index) => (
                <tr key={String(row.id ?? index)} className="border-t border-[#edf0f4]">
                  {shown.map((column) => (
                    <td
                      key={column.label}
                      className={`px-4 py-3 align-top ${column.align === 'right' ? 'whitespace-nowrap text-right tabular-nums' : ''}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && <NotFoundComponent title={emptyTitle} />}
        <div className="border-t border-[#edf0f4] p-3">
          <PaginationControls
            page={page}
            pages={Math.max(1, Math.ceil(total / pageSize))}
            total={total}
            count={rows.length}
            onChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            disabled={loading}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={exporting || loading || !total}
          onClick={() => void exportCsv()}
          className={secondaryButtonClass}
        >
          {exporting ? 'กำลังส่งออก...' : 'ส่งออก CSV'}
        </button>
        {exportNote && (
          <p role="status" className="m-0 text-sm text-orange-600">
            {exportNote}
          </p>
        )}
      </div>
    </section>
  );
}
