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
import { PROMOTION_REWARD_TYPES, PROMOTION_STATUSES } from '@/config/promotions';
import type { PromotionPage } from '@/types/api/promotions';
import { dateOnly } from '@/components/sales/document-ui';
import { conditionText, rewardText } from '@/components/promotions/promotion-form';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass } from '@/components/ui/form-classes';

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [rewardType, setRewardType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<PromotionPage | null>(null);
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
        rewardType,
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<PromotionPage>(
        withTableSort('/api/promotions?' + query, { key: sort.key, direction: sort.direction }),
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
  }, [search, tab, rewardType, page, pageSize, retry, sort.key, sort.direction]);

  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const control = `mt-1.5 ${filterClass}`;

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะโปรโมชัน" className="flex flex-wrap gap-5">
          {['', ...PROMOTION_STATUSES].map((key) => (
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
      <div className={filterGridClass(1)}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหา
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              className={`${filterClass} pl-10`}
              value={search}
              placeholder="รหัส ชื่อโปรโมชัน หรือสินค้าที่ร่วม"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </label>
        <label className="min-w-0 text-xs text-[#53647c]">
          ประเภทรางวัล
          <select
            className={control}
            value={rewardType}
            onChange={(e) => {
              setRewardType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">ทั้งหมด</option>
            {PROMOTION_REWARD_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <LoadingComponent isVisible={loading && !error} variant="content" />
        <SortableTable
          sort={sort}
          columns={['code', 'name', 'startsOn', 'endsOn', null, 'rewardType', 'status']}
          className="w-full min-w-[920px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'รหัส',
                'ชื่อโปรโมชัน',
                'วันเริ่ม',
                'วันสิ้นสุด',
                'เงื่อนไข',
                'ของแถม / ส่วนลด',
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
                const href = '/promotions/' + encodeURIComponent(row.code);
                return (
                  <tr
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`ดูรายละเอียด ${row.name}`}
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
                    <td className="w-[26%] break-words px-4 py-3">
                      <p>{row.name}</p>
                      <p className="mt-1 text-xs text-[#718096]">
                        สินค้าที่ร่วม {row.productCount.toLocaleString('th-TH')} รายการ
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.startsOn)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.endsOn)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{conditionText(row)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{rewardText(row)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.status} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && (
          <NotFoundComponent title="ไม่พบโปรโมชันตามเงื่อนไขนี้" />
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
