'use client';
import DateRangeInput from '@/components/ui/date-range-input';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import PaginationControls from '@/components/ui/pagination-controls';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass } from '@/components/ui/form-classes';
import { Get } from '@/service/http';
import type { OrderRow, PageData, SalesFilterOptions } from '@/types/api/operations';
import { ORDER_STATUSES, dateTime, money } from '@/components/sales/document-ui';

const columns = ['code', 'customerName', 'territoryName', 'createdAt', 'amount', 'status'];
const cellClass = 'px-4 py-3';
const ALL = '';
type OrderPage = PageData<OrderRow> & {
  actor?: { id: string; roleId: string };
  filters?: SalesFilterOptions;
};

export default function Page() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(ALL);
  const [territoryId, setTerritoryId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sort = useTableSort(() => setOffset(0));

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const url =
        '/api/orders?' +
        new URLSearchParams({
          search,
          status,
          territoryId,
          sellerId,
          from,
          to,
          offset: String(offset),
          limit: String(pageSize),
        });
      Get<OrderPage>(
        withTableSort(url, { key: sort.key, direction: sort.direction }),
        controller.signal,
      )
        .then((response) => {
          if (controller.signal.aborted) return;
          const total = response.pagination.total;
          if (offset && offset >= total)
            setOffset(Math.max(0, Math.ceil(total / pageSize) - 1) * pageSize);
          setResult(response);
          setLoading(false);
        })
        .catch((e) => {
          if (controller.signal.aborted) return;
          setError(e.message);
          setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    search,
    status,
    territoryId,
    sellerId,
    from,
    to,
    offset,
    pageSize,
    refresh,
    sort.key,
    sort.direction,
  ]);

  function resetFilters() {
    setSearch('');
    setStatus(ALL);
    setTerritoryId('');
    setSellerId('');
    setFrom('');
    setTo('');
    setOffset(0);
  }
  const rows = result?.data ?? [];
  const open = (id: string) => router.push(`/orders/${id}`);

  return (
    <section
      aria-label="คำสั่งซื้อ"
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะคำสั่งซื้อ" className="flex flex-wrap gap-5">
          {[ALL, ...ORDER_STATUSES].map((value) => (
            <button
              key={value || 'all'}
              type="button"
              role="tab"
              aria-selected={status === value}
              onClick={() => {
                setStatus(value);
                setOffset(0);
              }}
              className={`border-b-2 px-1 py-3 text-sm ${status === value ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
            >
              {value || 'ทั้งหมด'}
            </button>
          ))}
        </div>
      </div>
      <div className={filterGridClass(result?.filters ? 3 : 1)}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหาคำสั่งซื้อ
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOffset(0);
              }}
              placeholder="เลขที่คำสั่งซื้อ หรือชื่อลูกค้า"
              className={`${filterClass} pl-10`}
            />
          </div>
        </label>
        {result?.filters && (
          <label className="min-w-0 text-xs text-[#53647c]">
            เขตขาย
            <select
              className={`mt-1.5 ${filterClass}`}
              value={territoryId}
              onChange={(event) => {
                setTerritoryId(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">ทั้งหมด</option>
              {result.filters.territories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {result?.filters && (
          <label className="min-w-0 text-xs text-[#53647c]">
            ผู้ขาย
            <select
              className={`mt-1.5 ${filterClass}`}
              value={sellerId}
              onChange={(event) => {
                setSellerId(event.target.value);
                setOffset(0);
              }}
            >
              <option value="">ทั้งหมด</option>
              {result.filters.sellers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <DateRangeInput
          from={from}
          to={to}
          onChange={(nextFrom, nextTo) => {
            setFrom(nextFrom);
            setTo(nextTo);
            setOffset(0);
          }}
        />
      </div>
      {error && (
        <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
          {error}
          <button type="button" onClick={() => setRefresh((v) => v + 1)} className="text-[#1a58a7]">
            ลองใหม่
          </button>
        </div>
      )}
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <SortableTable
          sort={sort}
          columns={columns}
          className="w-full min-w-[960px] border-collapse text-left text-sm poppins-regular text-[#344256]"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {['เลขที่', 'ลูกค้า', 'เขต / ผู้สร้าง', 'วันที่สร้าง', 'ยอดขาย (บาท)', 'สถานะ'].map(
                (label) => (
                  <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              !error &&
              rows.map((order) => (
                <tr
                  key={order.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`เปิดคำสั่งซื้อ ${order.code}`}
                  onClick={() => open(order.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') open(order.id);
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className={`${cellClass} whitespace-nowrap text-[#1a58a7]`}>{order.code}</td>
                  <td className={cellClass}>
                    <p>{order.customerName || '—'}</p>
                  </td>
                  <td className={cellClass}>
                    <p>{order.territoryName || '—'}</p>
                    <p className="mt-1 text-xs text-[#718096]">{order.createdByName || '—'}</p>
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>{dateTime(order.createdAt)}</td>
                  <td className={`${cellClass} whitespace-nowrap text-right`}>
                    {money(order.amount)}
                  </td>
                  <td className={cellClass}>
                    <StatusBadge value={order.status} />
                    {!order.workflowManaged && (
                      <p className="mt-2 text-xs text-[#718096]">เอกสารเดิม</p>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </SortableTable>
        <LoadingComponent
          isVisible={loading && !error}
          variant="content"
          label="กำลังโหลดคำสั่งซื้อ..."
        />
        {!loading && !error && !rows.length && (
          <NotFoundComponent
            title="ไม่พบคำสั่งซื้อ"
            onRefresh={() => setRefresh((value) => value + 1)}
            onBack={resetFilters}
            backLabel="แสดงทั้งหมด"
          />
        )}
        <div className="border-t border-[#edf0f4] p-3">
          <PaginationControls
            page={Math.floor(offset / pageSize) + 1}
            pages={Math.max(1, Math.ceil((result?.pagination.total ?? 0) / pageSize))}
            total={result?.pagination.total ?? 0}
            count={rows.length}
            pageSize={pageSize}
            onChange={(page) => setOffset((page - 1) * pageSize)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setOffset(0);
            }}
            disabled={loading}
          />
        </div>
      </div>
    </section>
  );
}
