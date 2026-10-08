'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import PaginationControls from '@/components/ui/pagination-controls';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { SearchIcon } from '@/components/icons/status-icons';
import { Get } from '@/service/http';
import { PURCHASE_STATUSES } from '@/config/purchasing';
import type { PurchasePage } from '@/types/api/purchasing';
import { dateOnly, money } from '@/components/sales/document-ui';

const columns = ['code', 'supplierName', 'orderDate', 'expectedOn', null, 'amount', 'status'];
const cellClass = 'px-5 py-4 align-top';
const ALL = '';

export default function Page() {
  const router = useRouter();
  const supplierId = useSearchParams().get('supplierId') ?? '';
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(ALL);
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
          supplierId,
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
  }, [search, status, supplierId, offset, pageSize, refresh, sort.key, sort.direction]);

  function resetFilters() {
    setSearch('');
    setStatus(ALL);
    setOffset(0);
    if (supplierId) router.push('/purchases');
  }
  const rows = result?.data ?? [];
  const open = (id: string) => router.push(`/purchases/${id}`);

  return (
    <section aria-label="ใบสั่งซื้อ" className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl poppins-semibold text-[#26364b]">ใบสั่งซื้อ</h1>
        {supplierId && (
          <p className="mt-2 text-sm text-[#718096]">
            เฉพาะผู้ขาย {rows[0]?.supplierName ?? ''} ·{' '}
            <Link href="/purchases" className="text-[#1a58a7] hover:underline">
              แสดงทุกผู้ขาย
            </Link>
          </p>
        )}
      </div>
      <div
        role="tablist"
        aria-label="สถานะใบสั่งซื้อ"
        className="mb-4 flex flex-wrap gap-x-4 border-b border-[#e4e9f0]"
      >
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
            className={`-mb-px min-h-10 border-b-2 px-1 pb-3 text-sm transition ${status === value ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7]'}`}
          >
            {value || 'ทั้งหมด'}
          </button>
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 items-end gap-5 rounded-xl border border-[#e4e7ec] bg-white p-6 shadow-xs">
        <label className="min-w-0">
          <span className="mb-2 block text-xs text-[#344256]">ค้นหาใบสั่งซื้อ</span>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOffset(0);
              }}
              placeholder="เลขที่ใบสั่งซื้อ รหัสหรือชื่อผู้ขาย"
              className="h-10 w-full min-w-0 rounded-md border border-[#dfe5ee] bg-white pl-10 pr-3 text-sm poppins-regular text-[#344256] outline-none placeholder:text-[#9ba7b6] focus:border-[#1a58a7]"
            />
          </div>
        </label>
      </div>
      {error && (
        <div role="alert" className="mb-4 flex gap-3 text-sm poppins-regular text-red-600">
          {error}
          <button type="button" onClick={() => setRefresh((v) => v + 1)} className="text-[#1a58a7]">
            ลองใหม่
          </button>
        </div>
      )}
      <div
        className="relative min-h-80 overflow-hidden rounded-lg border border-[#d9e3ee] bg-white"
        aria-busy={loading}
      >
        <div className="overflow-x-auto">
          <SortableTable
            sort={sort}
            columns={columns}
            className="w-full min-w-[1000px] border-collapse text-left text-sm poppins-regular text-[#344256]"
          >
            <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
              <tr>
                {[
                  'เลขที่',
                  'ผู้ขาย',
                  'วันที่สั่งซื้อ',
                  'คาดว่าจะได้รับ',
                  'รับแล้ว / สั่ง',
                  'ยอดรวม (รวม VAT)',
                  'สถานะ',
                ].map((label) => (
                  <th key={label} scope="col" className="px-5 py-3 poppins-medium">
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
                    className="cursor-pointer border-b border-[#edf1f5] last:border-b-0 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1a58a7]"
                  >
                    <td className={`${cellClass} whitespace-nowrap poppins-medium text-[#1a58a7]`}>
                      {po.code}
                    </td>
                    <td className={cellClass}>
                      <p className="poppins-medium">{po.supplierName}</p>
                      <p className="mt-1 text-xs text-[#718096]">{po.supplierCode}</p>
                    </td>
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
        </div>
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
    </section>
  );
}
