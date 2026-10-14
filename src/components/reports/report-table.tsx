'use client';

import { useEffect, useState, type ReactNode } from 'react';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import PaginationControls from '@/components/ui/pagination-controls';
import { DateInput, bangkokToday, money } from '@/components/sales/document-ui';
import { Get } from '@/service/http';
import { downloadCsv } from '@/components/reports/csv';

type Row = Record<string, unknown> & { id?: string };
type Result = {
  data: Row[];
  pagination: { total: number };
  summary?: { orders: number; quantity: number; total: string; net: string };
  seesCost?: boolean;
  totalAmount?: string;
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

export const count = (value: unknown) => Number(value ?? 0).toLocaleString('th-TH');

export default function ReportTable({
  endpoint,
  title,
  columns,
  searchPlaceholder,
  ranged = false,
  filters = [],
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
  const [exporting, setExporting] = useState(false);
  async function exportCsv() {
    setExporting(true);
    setError('');
    try {
      const rows: Row[] = [];
      for (let offset = 0; offset < 10000; offset += 100) {
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
        rows.push(...value.data);
        if (rows.length >= value.pagination.total || !value.data.length) break;
      }
      downloadCsv(title, shown, rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ส่งออกไม่สำเร็จ');
    } finally {
      setExporting(false);
    }
  }
  const control = 'mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm';
  const filterCount = (searchPlaceholder ? 1 : 0) + filters.length + (ranged ? 2 : 0);

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl poppins-semibold text-[#26364b]">{title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          {totalLabel && result?.totalAmount !== undefined && (
            <p className="text-sm text-[#53647c]">
              {totalLabel}{' '}
              <span className="poppins-semibold text-[#1a58a7]">{money(result.totalAmount)}</span>{' '}
              บาท
            </p>
          )}
          <button
            type="button"
            disabled={exporting || loading || !result?.pagination.total}
            onClick={() => void exportCsv()}
            className="rounded-lg border border-[#d9e3ee] bg-white px-4 py-2 text-sm poppins-medium text-[#1a58a7] hover:bg-blue-50 disabled:opacity-50"
          >
            {exporting ? 'กำลังส่งออก...' : 'ส่งออก CSV'}
          </button>
        </div>
      </div>
      <ListRequestState error={error} retry={() => setRetry((n) => n + 1)} />
      <div
        className={`grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3 md:grid-cols-2 ${filterCount > 2 ? 'lg:grid-cols-4' : ''}`}
      >
        {ranged && (
          <>
            <div className="text-xs text-[#53647c]">
              ตั้งแต่วันที่
              <DateInput
                label="ตั้งแต่วันที่"
                value={from}
                max={to}
                onChange={(value) => {
                  setFrom(value);
                  setPage(1);
                }}
              />
            </div>
            <div className="text-xs text-[#53647c]">
              ถึงวันที่
              <DateInput
                label="ถึงวันที่"
                value={to}
                min={from}
                onChange={(value) => {
                  setTo(value);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
        {searchPlaceholder && (
          <label className="text-xs text-[#53647c]">
            ค้นหา
            <input
              className={control}
              value={search}
              placeholder={searchPlaceholder}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
        )}
        {filters.map((filter) => (
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
      </div>
      {summary && result?.summary && (
        <dl className="m-0 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['คำสั่งซื้อ', count(result.summary.orders) + ' ใบ'],
            ['จำนวนสินค้า', count(result.summary.quantity) + ' ชิ้น'],
            ['ยอดขาย (รวม VAT)', money(result.summary.total) + ' บาท'],
            ['ยอดก่อน VAT', money(result.summary.net) + ' บาท'],
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
    </section>
  );
}
