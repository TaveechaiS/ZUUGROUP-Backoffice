'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import PaginationControls from '@/components/ui/pagination-controls';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass } from '@/components/ui/form-classes';
import { Get } from '@/service/http';
import { CUSTOMER_LIST_STATUSES, customerListStatus } from '@/config/customers';
import type { CustomerListResponse } from '@/types/api/customers';

const columns = [
  'code',
  'name',
  'contactName',
  'creditDays',
  'province',
  'territoryName',
  'status',
];
const money = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });
const cellClass = 'px-4 py-3';
const ALL = '';

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[]; search?: string | string[] }>;
}) {
  const router = useRouter();
  const query = use(searchParams);
  const [tab, setTab] = useState<'active' | 'deleted'>(
    query.tab === 'deleted' ? 'deleted' : 'active',
  );
  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState(typeof query.search === 'string' ? query.search : '');
  const [territoryId, setTerritoryId] = useState(ALL);
  const [province, setProvince] = useState(ALL);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<CustomerListResponse | null>(null);
  const [filters, setFilters] = useState<CustomerListResponse['filters']>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const sort = useTableSort(() => setOffset(0));

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        include: 'filters,config',
        limit: String(pageSize),
        offset: String(offset),
      });
      if (search.trim()) params.set('search', search.trim());
      if (territoryId) params.set('territoryId', territoryId);
      if (province) params.set('province', province);
      if (status) params.set('status', status);
      if (tab === 'deleted') params.set('deleted', 'true');
      Get<CustomerListResponse>(
        withTableSort('/api/customers?' + params, { key: sort.key, direction: sort.direction }),
        controller.signal,
      )
        .then((data) => {
          if (controller.signal.aborted) return;
          setResult(data);
          setFilters(data.filters);
          if (offset && !data.data.length) setOffset(0);
        })
        .catch((e: Error) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    search,
    territoryId,
    province,
    status,
    tab,
    offset,
    pageSize,
    refresh,
    sort.key,
    sort.direction,
  ]);

  function resetFilters() {
    setSearch('');
    setTerritoryId(ALL);
    setProvince(ALL);
    setStatus(ALL);
    setOffset(0);
  }
  const rows = result?.data ?? [];
  const canWrite = result?.config?.canWrite ?? false;
  const open = (id: string) =>
    router.push(`/customers/${id}${tab === 'deleted' ? '?deleted=true' : ''}`);

  return (
    <section
      aria-label="ลูกค้า"
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
    >
      {canWrite && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
          <div role="tablist" aria-label="มุมมองลูกค้า" className="flex flex-wrap gap-5">
            {(
              [
                ['active', 'ทั้งหมด'],
                ['deleted', 'ลบแล้ว'],
              ] as const
            ).map(([value, text]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => {
                  setTab(value);
                  setOffset(0);
                }}
                className={`border-b-2 px-1 py-3 text-sm ${tab === value ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={filterGridClass(3)}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหาลูกค้า
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOffset(0);
              }}
              placeholder="รหัส ชื่อ ผู้ติดต่อ เบอร์โทร จังหวัด หรือเขตขาย"
              className={`${filterClass} pl-10`}
            />
          </div>
        </label>
        <FilterSelect
          label="เขตขาย"
          value={territoryId}
          options={(filters?.territories ?? []).map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          onChange={(value) => {
            setTerritoryId(value);
            setOffset(0);
          }}
        />
        <FilterSelect
          label="จังหวัด"
          value={province}
          options={(filters?.provinces ?? []).map((item) => ({ value: item, label: item }))}
          onChange={(value) => {
            setProvince(value);
            setOffset(0);
          }}
        />
        <FilterSelect
          label="สถานะ"
          value={status}
          options={CUSTOMER_LIST_STATUSES.map((item) => ({ value: item, label: item }))}
          onChange={(value) => {
            setStatus(value);
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
          className="w-full min-w-[1180px] border-collapse text-left text-sm poppins-regular text-[#344256]"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'รหัสลูกค้า',
                'ชื่อสถานประกอบการ / บริษัท',
                'ผู้ติดต่อหลัก',
                'เครดิต / วงเงิน',
                'จังหวัด',
                'เขตขาย',
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
              rows.map((customer) => (
                <tr
                  key={customer.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`เปิดลูกค้า ${customer.code} ${customer.name}`}
                  onClick={() => open(customer.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') open(customer.id);
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className={`${cellClass} whitespace-nowrap text-[#1a58a7]`}>
                    {customer.code}
                  </td>
                  <td className={cellClass}>
                    <p>{customer.name}</p>
                  </td>
                  <td className={cellClass}>
                    <p>{customer.contactName}</p>
                    <p className="mt-1 whitespace-nowrap text-xs text-[#718096]">
                      {customer.phone}
                    </p>
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>
                    <p>
                      {customer.creditDays === null
                        ? '—'
                        : customer.creditTermName ||
                          (customer.creditDays ? `${customer.creditDays} วัน` : 'เงินสด')}
                    </p>
                    <p className="mt-1 text-xs text-[#718096]">
                      วงเงิน:{' '}
                      {customer.creditLimit === null
                        ? '—'
                        : `${money.format(Number(customer.creditLimit))} บาท`}
                    </p>
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>{customer.province || '—'}</td>
                  <td className={`${cellClass} whitespace-nowrap`}>
                    {customer.territoryName ?? '—'}
                  </td>
                  <td className={cellClass}>
                    <StatusBadge value={customerListStatus(customer)} />
                    {customer.deleteReason && (
                      <p className="mt-2 text-xs text-[#718096]">เหตุผล: {customer.deleteReason}</p>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </SortableTable>
        <LoadingComponent
          isVisible={loading && !error}
          variant="content"
          label="กำลังโหลดลูกค้า..."
        />
        {!loading && !error && !rows.length && (
          <NotFoundComponent
            title="ไม่พบลูกค้า"
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-0 text-xs text-[#53647c]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-1.5 ${filterClass}`}
      >
        <option value={ALL}>ทั้งหมด</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
