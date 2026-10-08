'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import PaginationControls from '@/components/ui/pagination-controls';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { SearchIcon } from '@/components/icons/status-icons';
import { Get } from '@/service/http';
import { SUPPLIER_FILTERS } from '@/config/purchasing';
import type { SupplierPage } from '@/types/api/purchasing';

const columns = ['code', 'name', 'contact', 'paymentTerms', null, 'status'];
const cellClass = 'px-5 py-4 align-top';
const ALL = '';

export default function Page() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(ALL);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<SupplierPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sort = useTableSort(() => setOffset(0));

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const url =
        '/api/suppliers?' +
        new URLSearchParams({ search, status, offset: String(offset), limit: String(pageSize) });
      Get<SupplierPage>(
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
  }, [search, status, offset, pageSize, refresh, sort.key, sort.direction]);

  function resetFilters() {
    setSearch('');
    setStatus(ALL);
    setOffset(0);
  }
  const rows = result?.data ?? [];
  const tabs = SUPPLIER_FILTERS.filter(
    (value) => value !== 'ลบแล้ว' || result?.actor.roleId === 'ADMIN',
  );
  const open = (id: string) => router.push(`/suppliers/${id}`);

  return (
    <section aria-label="ผู้ขาย" className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl poppins-semibold text-[#26364b]">ผู้ขาย</h1>
      </div>
      <div
        role="tablist"
        aria-label="สถานะผู้ขาย"
        className="mb-4 flex flex-wrap gap-x-4 border-b border-[#e4e9f0]"
      >
        {[ALL, ...tabs].map((value) => (
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
          <span className="mb-2 block text-xs text-[#344256]">ค้นหาผู้ขาย</span>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOffset(0);
              }}
              placeholder="รหัส ชื่อ เลขผู้เสียภาษี ผู้ติดต่อ หรือเบอร์โทร"
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
            className="w-full min-w-[900px] border-collapse text-left text-sm poppins-regular text-[#344256]"
          >
            <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
              <tr>
                {[
                  'รหัส',
                  'ชื่อผู้ขาย',
                  'ผู้ติดต่อ',
                  'เงื่อนไขชำระเงิน',
                  'ใบสั่งซื้อค้างรับ',
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
                rows.map((supplier) => (
                  <tr
                    key={supplier.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`เปิดผู้ขาย ${supplier.code}`}
                    onClick={() => open(supplier.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') open(supplier.id);
                    }}
                    className="cursor-pointer border-b border-[#edf1f5] last:border-b-0 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1a58a7]"
                  >
                    <td className={`${cellClass} whitespace-nowrap poppins-medium text-[#1a58a7]`}>
                      {supplier.code}
                    </td>
                    <td className={cellClass}>
                      <p className="poppins-medium">{supplier.name}</p>
                      {supplier.taxId && (
                        <p className="mt-1 text-xs text-[#718096]">เลขภาษี {supplier.taxId}</p>
                      )}
                    </td>
                    <td className={cellClass}>
                      <p>{supplier.contact || '—'}</p>
                      {supplier.phone && (
                        <p className="mt-1 text-xs text-[#718096]">{supplier.phone}</p>
                      )}
                    </td>
                    <td className={`${cellClass} whitespace-nowrap`}>{supplier.paymentTerms}</td>
                    <td className={`${cellClass} whitespace-nowrap text-right`}>
                      {supplier.openPurchaseCount.toLocaleString('th-TH')} ใบ
                    </td>
                    <td className={cellClass}>
                      <StatusBadge value={supplier.deletedAt ? 'ลบแล้ว' : supplier.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </SortableTable>
        </div>
        <LoadingComponent
          isVisible={loading && !error}
          variant="content"
          label="กำลังโหลดผู้ขาย..."
        />
        {!loading && !error && !rows.length && (
          <NotFoundComponent
            title="ไม่พบผู้ขาย"
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
