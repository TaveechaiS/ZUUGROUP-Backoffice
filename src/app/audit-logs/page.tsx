'use client';
import DateRangeInput from '@/components/ui/date-range-input';
import PaginationControls from '@/components/ui/pagination-controls';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { AuditListResponse } from '@/types/api/audit';
import { Get } from '@/service/http';
import ListRequestState from '@/components/ui/list-request-state';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import type { AuditRow, AuditFiltersResponse } from '@/types/api/audit';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass, primaryButtonClass } from '@/components/ui/form-classes';
import { actionName } from '@/config/audit';

export default function Page() {
  const sort = useTableSort();
  const searchParams = useSearchParams();
  const initialFilters = {
    q: searchParams.get('q') ?? '',
    action: searchParams.get('action') ?? '',
    page: searchParams.get('page') ?? '',
  };
  const [q, setQ] = useState(initialFilters.q ?? '');
  const [action, setAction] = useState(initialFilters.action ?? '');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filters, setFilters] = useState(
    new URLSearchParams({
      q: initialFilters.q ?? '',
      action: initialFilters.action ?? '',
      from: '',
      to: '',
    }).toString(),
  );
  const {
    pageSize,
    setPageSize,
    rows,
    total,
    page,
    pages,
    setPage,
    loading,
    error,
    reload,
    actions,
  } = useAudit(
    '/api/audit-logs',
    withTableSort('/api/audit-logs?' + filters, { key: sort.key, direction: sort.direction }).split(
      '?',
    )[1],
    'rows',
    Number(initialFilters.page),
  );

  function search(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setFilters(new URLSearchParams({ q, action, from, to }).toString());
    reload();
  }
  return (
    <section
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
      aria-label="ประวัติการทำรายการ"
    >
      <ListRequestState
        error={error}
        retry={() => {
          reload();
        }}
      />
      <form onSubmit={search} className={`${filterGridClass(3)} items-end`}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหา
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              name="q"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              maxLength={100}
              placeholder="เหตุการณ์ รหัสคำขอ หรือผู้ทำรายการ"
              className={`${filterClass} pl-10`}
            />
          </div>
        </label>
        <label className="min-w-0 text-xs text-[#53647c]">
          ประเภทการทำรายการ
          <select
            name="action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className={`mt-1.5 ${filterClass}`}
          >
            <option value="">ทุกประเภท</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {actionName(action)}
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
          }}
        />
        <button className={`${primaryButtonClass} h-10 w-full`}>ค้นหา</button>
      </form>
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <LoadingComponent
          isVisible={loading && !error}
          variant="content"
          label="กำลังโหลดรายการ..."
        />
        <SortableTable
          sort={{
            ...sort,
            select: (key) => {
              sort.select(key);
              setPage(1);
            },
          }}
          columns={['occurredAt', 'action', 'actor', 'target', 'requestId']}
          className="w-full min-w-[850px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'วันเวลา',
                'การทำรายการ',
                'ผู้ทำ / บทบาท',
                'ผู้ใช้งานที่เกี่ยวข้อง',
                'รหัสคำขอ',
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((event) => (
              <tr key={event.id} className="border-t border-[#edf0f4] hover:bg-[#fafbfc]">
                <td className="whitespace-nowrap px-4 py-3">{formatDate(event.occurredAt)}</td>
                <td className="px-4 py-3">
                  <span>{actionName(event.action)}</span>
                  <span className="mt-1 block text-xs text-[#8492a6]">{event.action}</span>
                </td>
                <td className="px-4 py-3">
                  {event.actor?.name ?? 'ระบบ'}
                  <span className="block text-xs text-[#8492a6]">
                    {event.actor?.employeeCode ? `${event.actor?.employeeCode} · ` : ''}
                    {event.actorRole ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {event.target?.name ?? '-'}
                  {event.target?.employeeCode && (
                    <span className="block text-xs text-[#8492a6]">
                      {event.target?.employeeCode}
                    </span>
                  )}
                </td>
                <td className="break-all px-4 py-3 text-xs">{event.requestId}</td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
        {!loading && !error && rows.length === 0 && (
          <NotFoundComponent
            title={
              q || action || from || to
                ? 'ไม่พบเหตุการณ์ที่ตรงกับเงื่อนไข'
                : 'ยังไม่มีประวัติการทำรายการ'
            }
          />
        )}
        <div className="border-t border-[#edf0f4] p-3">
          <PaginationControls
            page={page}
            pages={pages}
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

function useAudit(_path: string, filters: string, _key: string, initialPage = 1) {
  const path = '/api/audit-logs';
  const [page, setPage] = useState(
    Number.isSafeInteger(initialPage) && initialPage >= 1 && initialPage <= 10001 ? initialPage : 1,
  );
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [actions, setActions] = useState<AuditFiltersResponse['actions']>([]);
  const metadataRetry = useRef<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams(filters);
      params.set('limit', String(pageSize));
      if (metadataRetry.current !== retry) params.set('include', 'filters');
      params.set('offset', String((page - 1) * pageSize));
      Get<AuditListResponse>(`${path}?${params}`, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          if (result.filters) {
            setActions(result.filters.actions);
            metadataRetry.current = retry;
          }
          const pages = Math.max(1, Math.ceil(result.pagination.total / pageSize));
          setTotal(result.pagination.total);
          if (page > pages) {
            setPage(pages);
            setRows([]);
            return;
          }
          setRows(result.rows);
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
  }, [path, filters, page, pageSize, retry]);
  return {
    actions,
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    setPage,
    pageSize,
    setPageSize,
    loading,
    error,
    reload: () => setRetry((n) => n + 1),
  };
}

const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
function formatDate(value: string | null): string {
  return value ? dateTime.format(new Date(value)) : 'ยังไม่เคยเข้าใช้';
}
