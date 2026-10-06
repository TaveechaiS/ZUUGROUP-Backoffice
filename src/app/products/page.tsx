'use client';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Get } from '@/service/http';
import type { PageData, StockProductRow } from '@/types/api/operations';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import PaginationControls from '@/components/ui/pagination-controls';

type Result = PageData<StockProductRow> & {
  filters: { categories: { id: string; name: string }[] };
};
function ProductStockList({
  warehouseCode,
}: {
  warehouseCode?: 'MAIN' | 'MARKETING' | 'DISPOSAL';
}) {
  const router = useRouter();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expiry, setExpiry] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const metadata = useRef<{ retry: number; filters: Result['filters'] } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const query = new URLSearchParams({
        view: 'products',
        projection: 'summary',
        metadata: metadata.current?.retry === retry ? 'false' : 'true',
        search,
        categoryId: category,
        expiry,
        warehouseCode: warehouseCode ?? '',
        stock: tab,
        deleted: 'false',
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<Result>(
        withTableSort('/api/inventory?' + query, { key: sort.key, direction: sort.direction }),
        controller.signal,
      )
        .then((value) => {
          if (controller.signal.aborted) return;
          if (value.filters) metadata.current = { retry, filters: value.filters };
          setResult({
            ...value,
            filters: value.filters ?? metadata.current?.filters ?? { categories: [] },
          });
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
    warehouseCode,
    search,
    category,
    expiry,
    tab,
    page,
    pageSize,
    retry,
    sort.key,
    sort.direction,
  ]);
  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const tabs = [['', 'ทั้งหมด']];
  const control = 'mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm';
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="รายการสินค้า" className="flex flex-wrap gap-5">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`border-b-2 px-1 py-3 text-sm ${tab === key ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ListRequestState error={error} retry={() => setRetry((n) => n + 1)} />
      <div
        className={`grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3 ${warehouseCode ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}
      >
        <label className="text-xs text-[#53647c]">
          ค้นหา
          <input
            className={control}
            value={search}
            placeholder="ชื่อหรือรหัสสินค้า"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-xs text-[#53647c]">
          หมวดหมู่
          <select
            className={control}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">ทั้งหมด</option>
            {result?.filters.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {warehouseCode && (
          <label className="text-xs text-[#53647c]">
            อายุสินค้า
            <select
              className={control}
              value={expiry}
              onChange={(e) => {
                setExpiry(e.target.value);
                setPage(1);
              }}
            >
              <option value="">ทั้งหมด</option>
              <option value="near">ใกล้หมดอายุ</option>
              <option value="expired">หมดอายุ</option>
            </select>
          </label>
        )}
      </div>
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <LoadingComponent isVisible={loading && !error} variant="content" />
        <SortableTable
          sort={sort}
          columns={[
            'code',
            'name',
            'categoryName',
            'unit',
            'salePrice',
            'lotCount',
            'quantity',
            'status',
          ]}
          className="w-full min-w-[880px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'รหัสสินค้า',
                'ชื่อสินค้า',
                'หมวดหมู่',
                'หน่วย',
                'ราคาขาย',
                'จำนวนสต็อก',
                warehouseCode ? 'คงเหลือ' : 'คงเหลือรวม',
                'สถานะ',
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => {
              const href = '/products/' + encodeURIComponent(product.code);
              return (
                <tr
                  key={product.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`ดูรายละเอียด ${product.name}`}
                  onClick={() => router.push(href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(href);
                    }
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className="px-4 py-3 text-[#1a58a7]">{product.code}</td>
                  <td className="w-[28%] break-words px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.categoryName}</td>
                  <td className="px-4 py-3">{product.unit}</td>
                  <td className="px-4 py-3">{money(product.salePrice)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {product.lotCount.toLocaleString('th-TH')} ล็อต
                  </td>
                  <td className="px-4 py-3 tabular-nums">{product.quantity}</td>
                  <td className="px-4 py-3">
                    {product.deletedAt ? (
                      <StatusBadge value="ลบแล้ว" />
                    ) : product.mainQuantity >= 0 && product.mainQuantity <= 50 ? (
                      <StatusBadge
                        value={product.mainQuantity === 0 ? 'สินค้าหมด' : 'สินค้าใกล้หมด'}
                      />
                    ) : (
                      <span className="text-[#65758b]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && (
          <NotFoundComponent title="ไม่พบสินค้าตามเงื่อนไขนี้" />
        )}
        <div className="border-t border-[#edf0f4] p-3">
          <PaginationControls
            page={page}
            pages={Math.max(1, Math.ceil(total / 10))}
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

export default function Page() {
  return <ProductStockList />;
}

const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
