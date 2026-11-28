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
import { FOLLOW_UP_CHANNELS, FOLLOW_UP_FILTERS } from '@/config/follow-ups';
import type { FollowUpPage } from '@/types/api/follow-ups';
import { dateOnly } from '@/components/sales/document-ui';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass } from '@/components/ui/form-classes';

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState('รอติดตาม');
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<FollowUpPage | null>(null);
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
        channel,
        from,
        to,
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<FollowUpPage>(
        withTableSort('/api/customer-follow-ups?' + query, {
          key: sort.key,
          direction: sort.direction,
        }),
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
  }, [search, tab, channel, from, to, page, pageSize, retry, sort.key, sort.direction]);

  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const control = `mt-1.5 ${filterClass}`;

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะการติดตาม" className="flex flex-wrap gap-5">
          {[...FOLLOW_UP_FILTERS, ''].map((key) => (
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
              placeholder="เลขที่ หัวข้อ หรือชื่อลูกค้า"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </label>
        <label className="min-w-0 text-xs text-[#53647c]">
          ช่องทาง
          <select
            className={control}
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
          >
            <option value="">ทั้งหมด</option>
            {FOLLOW_UP_CHANNELS.map((item) => (
              <option key={item} value={item}>
                {item}
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
          columns={['code', 'customerName', null, 'contactedOn', 'nextOn', null, 'status']}
          className="w-full min-w-[920px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'เลขที่',
                'ลูกค้า',
                'หัวข้อ',
                'วันที่ติดต่อ',
                'นัดครั้งถัดไป',
                'ผู้บันทึก',
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
                const href = '/customers/dashboard/' + encodeURIComponent(row.code);
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
                    <td className="px-4 py-3">
                      <p>{row.customerName}</p>
                      <p className="mt-1 text-xs text-[#718096]">{row.customerCode}</p>
                    </td>
                    <td className="w-[24%] break-words px-4 py-3">
                      <p>{row.name}</p>
                      <p className="mt-1 text-xs text-[#718096]">{row.channel}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.contactedOn)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.nextOn)}</td>
                    <td className="px-4 py-3">{row.createdByName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.status} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && (
          <NotFoundComponent title="ไม่พบรายการติดตามตามเงื่อนไขนี้" />
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
