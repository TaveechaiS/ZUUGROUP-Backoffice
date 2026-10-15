'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import PaginationControls from '@/components/ui/pagination-controls';
import { Get } from '@/service/http';
import { INVOICE_STATUSES } from '@/config/billing';
import type { InvoicePage } from '@/types/api/billing';
import { DateInput, dateOnly, money } from '@/components/sales/document-ui';
import { filterClass } from '@/components/ui/form-classes';

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [territoryId, setTerritoryId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<InvoicePage | null>(null);
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
        status: tab,
        territoryId,
        sellerId,
        from,
        to,
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<InvoicePage>(
        withTableSort('/api/billing?' + query, { key: sort.key, direction: sort.direction }),
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
    search,
    tab,
    territoryId,
    sellerId,
    from,
    to,
    page,
    pageSize,
    retry,
    sort.key,
    sort.direction,
  ]);

  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const control = `mt-1.5 ${filterClass}`;

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะใบแจ้งหนี้" className="flex flex-wrap gap-5">
          {['', ...INVOICE_STATUSES].map((key) => (
            <button
              key={key || 'all'}
              role="tab"
              aria-selected={tab === key}
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`border-b-2 px-1 py-3 text-sm ${tab === key ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
            >
              {key || 'ทั้งหมด'}
            </button>
          ))}
        </div>
        <p className="pb-3 text-sm text-[#53647c]">
          ยอดค้างชำระ{' '}
          <span className="poppins-semibold text-[#1a58a7]">{money(result?.totalOutstanding)}</span>{' '}
          บาท
        </p>
      </div>
      <ListRequestState error={error} retry={() => setRetry((n) => n + 1)} />
      <div
        className={`grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3 md:grid-cols-2 ${result?.filters ? 'lg:grid-cols-5' : 'lg:grid-cols-3'}`}
      >
        <label className="text-xs text-[#53647c]">
          ค้นหา
          <input
            className={control}
            value={search}
            placeholder="เลขที่ใบแจ้งหนี้ เลขที่คำสั่งซื้อ หรือลูกค้า"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        {result?.filters && (
          <label className="text-xs text-[#53647c]">
            เขตขาย
            <select
              className={control}
              value={territoryId}
              onChange={(e) => {
                setTerritoryId(e.target.value);
                setPage(1);
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
          <label className="text-xs text-[#53647c]">
            ผู้ขาย
            <select
              className={control}
              value={sellerId}
              onChange={(e) => {
                setSellerId(e.target.value);
                setPage(1);
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
        <div className="text-xs text-[#53647c]">
          ตั้งแต่วันที่
          <DateInput
            label="ตั้งแต่วันที่"
            value={from}
            max={to || undefined}
            required={false}
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
            min={from || undefined}
            required={false}
            onChange={(value) => {
              setTo(value);
              setPage(1);
            }}
          />
        </div>
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
            'customerName',
            'issueDate',
            'dueDate',
            'amount',
            'outstanding',
            'status',
          ]}
          className="w-full min-w-[920px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'เลขที่',
                'ลูกค้า',
                'วันที่ออก',
                'ครบกำหนด',
                'ยอดเรียกเก็บ',
                'ค้างชำระ',
                'สถานะ',
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!error &&
              rows.map((row) => {
                const href = '/billing/' + encodeURIComponent(row.code);
                return (
                  <tr
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`ดูรายละเอียด ${row.code}`}
                    onClick={() => router.push(href)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                    className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[#1a58a7]">
                      <p>{row.code}</p>
                      <p className="mt-1 text-xs text-[#718096]">{row.salesOrderCode}</p>
                    </td>
                    <td className="w-[26%] break-words px-4 py-3">
                      <p>{row.customerName}</p>
                      <p className="mt-1 text-xs text-[#718096]">{row.customerCode}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.issueDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.dueDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {money(row.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {row.savedStatus === 'ยกเลิก' ? '—' : money(row.outstanding)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.status} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && <NotFoundComponent title="ไม่พบใบแจ้งหนี้" />}
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
