'use client';
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

export default function Page() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<PageData<LotRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      Get<PageData<LotRow>>(
        withTableSort(
          '/api/inventory?view=receipt-items&limit=' +
            pageSize +
            '&offset=' +
            (page - 1) * pageSize,
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
  }, [page, pageSize, retry, sort.key, sort.direction]);
  const rows = result?.data ?? [];
  return (
    <section className="min-w-0 space-y-6 px-4 py-6 text-[#344256] md:px-6 md:py-8">
      <h2 className="text-lg poppins-semibold text-[#1a58a7]">ประวัติการเติมสต็อก</h2>
      <ListRequestState error={error} retry={() => setRetry((value) => value + 1)} />
      {loading ? (
        <LoadingComponent isVisible />
      ) : (
        !error && (
          <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
            <SortableTable
              sort={sort}
              columns={[
                'receiptCode',
                'createdAt',
                'productName',
                'receivedQuantity',
                rows.some((lot) => lot.totalCost !== undefined) ? 'totalCost' : null,
              ]}
              className="w-full whitespace-nowrap text-left text-sm"
            >
              <thead className="bg-[#f7f9fc] text-[#65758b]">
                <tr>
                  {['ID', 'วันและเวลา', 'สินค้า', 'จำนวนรับเข้า', 'ต้นทุนรวมล็อต'].map((label) => (
                    <th key={label} scope="col" className="px-4 py-4 poppins-semibold">
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
                      className="cursor-pointer border-t border-[#d9e3ee] align-top hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                    >
                      <td className="px-4 py-4 poppins-medium">
                        <Link href={href} className="text-[#1a58a7] hover:underline">
                          {lot.receiptCode}
                        </Link>
                      </td>
                      <td className="px-4 py-4">{dateTime(lot.createdAt)}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={'/products/' + encodeURIComponent(lot.productCode)}
                          className="text-[#1a58a7] hover:underline"
                        >
                          {lot.productCode} · {lot.productName}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        {lot.receivedQuantity.toLocaleString('th-TH')} {lot.unit}
                      </td>
                      <td className="px-4 py-4">
                        {lot.totalCost !== undefined ? money(lot.totalCost) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </SortableTable>
            {!rows.length && <NotFoundComponent title="ยังไม่มีประวัติการเติมสต็อก" />}
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
        )
      )}
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
