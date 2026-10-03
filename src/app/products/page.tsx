'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { money } from './product-ui';
import type { ProductView, ProductFiltersResponse } from '@/types/api/products';
import { useRouteData } from '@/components/ui/route-data';
import StatusBadge from '@/components/ui/status-badge';
import type { ProductsListResponse } from '@/types/api/products';
import { Get } from '@/service/http';
import ListRequestState from '@/components/ui/list-request-state';
import LoadingComponent from '@/components/ui/loading-component';
import PaginationControls from '@/components/ui/pagination-controls';

export default function Page() {
  const { isAdmin } = useRouteData();
  const router = useRouter();
  const [tab, setTab] = useState<'current' | 'deleted'>('current');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const filters = new URLSearchParams({
    search: query,
    categoryId: category,
    status,
    deleted: String(tab === 'deleted'),
  }).toString();
  const {
    rows: filtered,
    categories,
    total,
    page,
    pages,
    setPage,
    loading,
    error,
    reload,
  } = useProducts('/api/products', filters, 'products');

  return (
    <main className="flex flex-1 flex-col gap-5 p-6 pb-10 text-[#26364b]">
      <ListRequestState
        error={error}
        retry={() => {
          reload();
        }}
      />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="m-0 text-2xl poppins-semibold">สินค้า</h1>
        {isAdmin && (
          <Link
            className="rounded-md bg-[#1a58a7] px-4 py-2.5 text-sm poppins-semibold text-white! hover:bg-[#174a8b]"
            href="/products/create"
          >
            + เพิ่มสินค้า
          </Link>
        )}
      </header>
      <div
        role="tablist"
        aria-label="สถานะรายการสินค้า"
        className="flex gap-5 border-b border-[#d9e3ee]"
      >
        {(
          [
            ['current', 'รายการปกติ'],
            ['deleted', 'ลบแล้ว'],
          ] as const
        )
          .filter(([key]) => isAdmin || key === 'current')
          .map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`border-b-2 px-1 pb-3 text-sm ${tab === key ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
            >
              {label}
            </button>
          ))}
      </div>
      <div className="grid gap-3 rounded-lg border border-[#e3e9f0] bg-white p-4 md:grid-cols-3">
        <label className="text-xs text-[#53647c]">
          ค้นหาชื่อ / รหัส / ตัวยา
          <input
            className="mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาสินค้า"
          />
        </label>
        <label className="text-xs text-[#53647c]">
          หมวดหมู่
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="">ทุกหมวด</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#53647c]">
          สถานะ
          <select
            className="mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">ทุกสถานะ</option>
            <option value="ACTIVE">ใช้งาน</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
        </label>
      </div>
      <p className="m-0 text-sm text-[#718096]">พบ {total} รายการ</p>
      <div className="relative min-h-44 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white" aria-busy={loading}>
        <LoadingComponent isVisible={loading && !error} variant="content" label="กำลังโหลดรายการ..." />
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'รหัส / สินค้า',
                'หมวด / รูปแบบ',
                'ตัวยา / หน่วย',
                'ราคาขาย',
                'คลังที่เกี่ยวข้อง',
                'สถานะ',
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const href = `/products/${encodeURIComponent(product.code)}`;
              return (
                <tr
                  key={product.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`ดูรายละเอียด ${product.name}`}
                  onClick={() => router.push(href)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] align-top hover:bg-[#fafbfc] focus-visible:bg-[#eff5fc] focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className="px-4 py-4">
                    <span className="poppins-semibold text-[#1a58a7]">{product.code}</span>
                    <div className="mt-1">{product.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    {product.category.name}
                    <div className="text-xs text-[#718096]">{product.dosageForm.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    {product.drug.name}
                    <div className="text-xs text-[#718096]">{product.unit}</div>
                  </td>
                  <td className="px-4 py-4">{money(product.salePrice)} บาท</td>
                  <td className="px-4 py-4">{product.defaultWarehouse.name}</td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      value={
                        product.deletedAt
                          ? 'ลบแล้ว'
                          : product.status === 'ACTIVE'
                            ? 'ใช้งาน'
                            : 'ไม่ใช้งาน'
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && !error && !filtered.length && (
          <p className="p-8 text-center text-sm text-[#718096]">ไม่พบสินค้าตามเงื่อนไขนี้</p>
        )}
      </div>
      <PaginationControls
        page={page}
        pages={pages}
        total={total}
        count={filtered.length}
        onChange={setPage}
      />
    </main>
  );
}

function useProducts(_path: string, filters: string, _key: string, initialPage = 1) {
  const path = '/api/products';
  const [page, setPage] = useState(
    Number.isSafeInteger(initialPage) && initialPage >= 1 && initialPage <= 10001 ? initialPage : 1,
  );
  const [rows, setRows] = useState<ProductView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [categories, setCategories] = useState<ProductFiltersResponse['categories']>([]);
  const metadataRetry = useRef<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams(filters);
      params.set('limit', '10');
      if (metadataRetry.current !== retry) params.set('include', 'filters');
      params.set('offset', String((page - 1) * 10));
      Get<ProductsListResponse>(`${path}?${params}`, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          if (result.filters) {
            setCategories(result.filters.categories);
            metadataRetry.current = retry;
          }
          const pages = Math.max(1, Math.ceil(result.pagination.total / 10));
          setTotal(result.pagination.total);
          if (page > pages) {
            setPage(pages);
            setRows([]);
            return;
          }
          setRows(result.products);
        })
        .catch((caught) => {
          if (!controller.signal.aborted) {
            setRows([]);
            setError(caught instanceof Error ? caught.message : 'โหลดข้อมูลไม่สำเร็จ');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [path, filters, page, retry]);
  return {
    categories,
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / 10)),
    setPage,
    loading,
    error,
    reload: () => setRetry((n) => n + 1),
  };
}
