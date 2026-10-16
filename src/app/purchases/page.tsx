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
import { PURCHASE_STATUSES } from '@/config/purchasing';
import type { PurchasePage } from '@/types/api/purchasing';
import { dateOnly, money } from '@/components/sales/document-ui';

const columns = ['code', 'orderDate', 'expectedOn', null, 'amount', 'status'];
const cellClass = 'px-4 py-3';
const ALL = '';

export default function Page() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(ALL);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<PurchasePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sort = useTableSort(() => setOffset(0));

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const url =
        '/api/purchases?' +
        new URLSearchParams({
          search,
          status,
          from,
          to,
          offset: String(offset),
          limit: String(pageSize),
        });
      Get<PurchasePage>(
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
  }, [search, status, from, to, offset, pageSize, refresh, sort.key, sort.direction]);

  function resetFilters() {
    setSearch('');
    setStatus(ALL);
    setFrom('');
    setTo('');
    setOffset(0);
  }
  const rows = result?.data ?? [];
  const open = (id: string) => router.push(`/purchases/${id}`);

  return (
    <section
      aria-label="ใบสั่งซื้อ"
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะใบสั่งซื้อ" className="flex flex-wrap gap-5">
          {[ALL, ...PURCHASE_STATUSES].map((value) => (
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
      <div className={filterGridClass(1)}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหาใบสั่งซื้อ
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOffset(0);
              }}
              placeholder="เลขที่ใบสั่งซื้อ ชื่อสินค้า หรือหมายเหตุ"
              className={`${filterClass} pl-10`}
            />
          </div>
        </label>
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
          className="w-full min-w-[1000px] border-collapse text-left text-sm poppins-regular text-[#344256]"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'เลขที่',
                'วันที่สั่งซื้อ',
                'คาดว่าจะได้รับ',
                'รับแล้ว / สั่ง',
                'ยอดรวม (รวม VAT)',
                'สถานะ',
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              !error &&
              rows.map((po) => (
                <tr
                  key={po.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`เปิดใบสั่งซื้อ ${po.code}`}
                  onClick={() => open(po.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') open(po.id);
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className={`${cellClass} whitespace-nowrap text-[#1a58a7]`}>{po.code}</td>
                  <td className={`${cellClass} whitespace-nowrap`}>{dateOnly(po.orderDate)}</td>
                  <td className={`${cellClass} whitespace-nowrap`}>{dateOnly(po.expectedOn)}</td>
                  <td className={`${cellClass} whitespace-nowrap text-right`}>
                    {po.received.toLocaleString('th-TH')} / {po.ordered.toLocaleString('th-TH')}
                  </td>
                  <td className={`${cellClass} whitespace-nowrap text-right`}>
                    {money(po.amount)}
                  </td>
                  <td className={cellClass}>
                    <StatusBadge value={po.status} />
                  </td>
                </tr>
              ))}
          </tbody>
        </SortableTable>
        <LoadingComponent
          isVisible={loading && !error}
          variant="content"
          label="กำลังโหลดใบสั่งซื้อ..."
        />
        {!loading && !error && !rows.length && (
          <NotFoundComponent
            title="ไม่พบใบสั่งซื้อ"
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
