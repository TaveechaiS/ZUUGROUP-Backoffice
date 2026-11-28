'use client';
import DateRangeInput from '@/components/ui/date-range-input';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Get } from '@/service/http';
import type { PageData, LotRow } from '@/types/api/operations';

import PaginationControls from '@/components/ui/pagination-controls';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass } from '@/components/ui/form-classes';

export default function Page() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<PageData<LotRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Get<{ filters?: { categories: { id: string; name: string }[] } }>(
      '/api/inventory?view=products&projection=summary&metadata=true&limit=1&offset=0',
      controller.signal,
    )
      .then((value) => {
        if (!controller.signal.aborted) setCategories(value.filters?.categories ?? []);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      Get<PageData<LotRow>>(
        withTableSort(
          '/api/inventory?' +
            new URLSearchParams({
              view: 'receipt-items',
              search,
              categoryId,
              from,
              to,
              limit: String(pageSize),
              offset: String((page - 1) * pageSize),
            }),
          {
            key: sort.key,
            direction: sort.direction,
          },
        ),
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
            setError(caught instanceof Error ? caught.message : 'โหลดประวัติไม่สำเร็จ');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, categoryId, from, to, page, pageSize, retry, sort.key, sort.direction]);
  const rows = result?.data ?? [];
  return (
    <section
      aria-label="ประวัติการเติมสต็อก"
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
    >
      <ListRequestState error={error} retry={() => setRetry((value) => value + 1)} />
      <div className={filterGridClass(2)}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหา
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              className={`${filterClass} pl-10`}
              value={search}
              placeholder="สินค้า ID รับเข้า หรือเลขล็อต"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </label>
        <label className="min-w-0 text-xs text-[#53647c]">
          หมวดหมู่
          <select
            className={`mt-1.5 ${filterClass}`}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">ทั้งหมด</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <DateRangeInput
          from={from}
          to={to}
          onChange={(nextFrom, nextTo) => {
            setFrom(nextFrom);
            setTo(nextTo);
            setPage(1);
          }}
        />
      </div>
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <LoadingComponent isVisible={loading && !error} variant="content" />
        <SortableTable
          sort={sort}
          columns={[
            'receiptCode',
            'createdAt',
            'productName',
            'receivedQuantity',
            rows.some((lot) => lot.totalCost !== undefined) ? 'totalCost' : null,
          ]}
          className="w-full min-w-[760px] border-collapse whitespace-nowrap text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {['ID', 'วันและเวลา', 'สินค้า', 'จำนวนรับเข้า', 'ต้นทุนรวมล็อต'].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((lot) => {
              const href = '/products/stock/receipts/' + encodeURIComponent(lot.id);
              return (
                <tr
                  key={lot.id}
                  tabIndex={0}
                  aria-label={'ดูรายละเอียด ' + lot.receiptCode + ' ' + lot.productName}
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest('a, button')) return;
                    router.push(href);
                  }}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className="px-4 py-3">
                    <Link href={href} className="text-[#1a58a7] hover:underline">
                      {lot.receiptCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{dateTime(lot.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={'/products/' + encodeURIComponent(lot.productCode)}
                      className="text-[#1a58a7] hover:underline"
                    >
                      {lot.productCode} · {lot.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {lot.receivedQuantity.toLocaleString('th-TH')} {lot.unit}
                  </td>
                  <td className="px-4 py-3">
                    {lot.totalCost !== undefined ? money(lot.totalCost) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && (
          <NotFoundComponent title="ยังไม่มีประวัติการเติมสต็อก" />
        )}
        <div className="border-t border-[#edf0f4] p-3">
          <PaginationControls
            page={page}
            pages={Math.max(1, Math.ceil((result?.pagination.total ?? 0) / pageSize))}
            total={result?.pagination.total ?? 0}
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

const dateTime = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));

const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
