'use client';
import DateRangeInput from '@/components/ui/date-range-input';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import PaginationControls from '@/components/ui/pagination-controls';
import { Get } from '@/service/http';
import type { ExpensePage } from '@/types/api/expenses';
import { bangkokToday, dateOnly, money } from '@/components/sales/document-ui';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass } from '@/components/ui/form-classes';

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState('');
  const [from, setFrom] = useState(bangkokToday().slice(0, 8) + '01');
  const [to, setTo] = useState(bangkokToday());
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<ExpensePage | null>(null);
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
        categoryId,
        from,
        to,
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<ExpensePage>(
        withTableSort('/api/expenses?' + query, { key: sort.key, direction: sort.direction }),
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
  }, [search, tab, categoryId, from, to, page, pageSize, retry, sort.key, sort.direction]);

  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const control = `mt-1.5 ${filterClass}`;

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะค่าใช้จ่าย" className="flex flex-wrap gap-5">
          {['', 'บันทึกแล้ว', 'ยกเลิก'].map((key) => (
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
          รวมที่บันทึกแล้ว{' '}
          <span className="poppins-semibold text-[#1a58a7]">{money(result?.totalAmount)}</span> บาท
        </p>
      </div>
      <ListRequestState error={error} retry={() => setRetry((n) => n + 1)} />
      <div className={filterGridClass(2)}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหา
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              className={`${filterClass} pl-10`}
              value={search}
              placeholder="เลขที่ รายการ หรือผู้รับเงิน"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </label>
        <label className="min-w-0 text-xs text-[#53647c]">
          หมวดค่าใช้จ่าย
          <select
            className={control}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">ทั้งหมด</option>
            {result?.categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <DateRangeInput
          from={from}
          to={to}
          clearable={false}
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
          columns={['code', 'expenseDate', 'name', 'categoryName', null, 'amount', 'status']}
          className="w-full min-w-[880px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {['เลขที่', 'วันที่', 'รายการ', 'หมวด', 'ผู้รับเงิน', 'จำนวนเงิน', 'สถานะ'].map(
                (label) => (
                  <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {!error &&
              rows.map((row) => {
                const href = '/expenses/' + encodeURIComponent(row.code);
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
                    <td className="whitespace-nowrap px-4 py-3 text-[#1a58a7]">{row.code}</td>
                    <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.expenseDate)}</td>
                    <td className="w-[28%] break-words px-4 py-3">
                      <p>{row.name}</p>
                      {row.fileCount > 0 && (
                        <p className="mt-1 text-xs text-[#718096]">ไฟล์แนบ {row.fileCount}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.categoryName}</td>
                    <td className="px-4 py-3">{row.payee || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {money(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.status} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && (
          <NotFoundComponent title="ไม่พบค่าใช้จ่ายในช่วงวันที่นี้" />
        )}
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
