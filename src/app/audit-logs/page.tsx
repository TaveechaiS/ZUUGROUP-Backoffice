'use client';
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

const actionNames: Record<string, string> = {
  ADMIN_RECOVERED: 'กู้คืนบัญชี Admin',
  PRODUCT_SAMPLE_SEEDED: 'เพิ่มสินค้าตัวอย่าง',
  PRODUCT_SEEDED: 'เพิ่มข้อมูลสินค้าเริ่มต้น',
  PRODUCT_CREATED: 'เพิ่มสินค้า',
  PRODUCT_UPDATED: 'แก้ไขสินค้า',
  PRODUCT_DELETED: 'ลบสินค้า',
  PRODUCT_RESTORED: 'กู้คืนสินค้า',
  PRODUCT_MASTER_CREATED: 'เพิ่มข้อมูลแม่สินค้า',
  USER_CREATED: 'เพิ่มผู้ใช้งาน',
  USER_PROFILE_CHANGED: 'แก้ไขผู้ใช้งาน',
  USER_ROLE_CHANGED: 'เปลี่ยนบทบาท',
  USER_STATUS_CHANGED: 'เปลี่ยนสถานะผู้ใช้งาน',
  USER_DELETED: 'ลบผู้ใช้งาน',
  USER_RESTORED: 'กู้คืนผู้ใช้งาน',
  USER_RESTORED_AFTER_GUARD_FAILURE: 'กู้คืนผู้ใช้งานหลังตรวจสิทธิ์',
  PASSWORD_RESET_REQUESTED: 'ขอตั้งรหัสผ่านใหม่',
  PASSWORD_RESET: 'ตั้งรหัสผ่านใหม่',
};

function actionName(action: string) {
  return actionNames[action] ?? action;
}

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
  const [filters, setFilters] = useState(
    new URLSearchParams({
      q: initialFilters.q ?? '',
      action: initialFilters.action ?? '',
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
    setFilters(new URLSearchParams({ q, action }).toString());
    reload();
  }
  return (
    <section
      className="flex flex-1 flex-col gap-5 p-6 pb-7 text-[#26364b]"
      aria-label="ประวัติการทำรายการ"
    >
      <ListRequestState
        error={error}
        retry={() => {
          reload();
        }}
      />
      <header>
        <h1 className="m-0 text-2xl poppins-semibold">ประวัติการทำรายการ</h1>
      </header>
      <form
        onSubmit={search}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-[#e4e9f0] bg-white p-5"
      >
        <label className="min-w-52 flex-1 text-xs text-[#344256]">
          ค้นหา
          <input
            name="q"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            maxLength={100}
            placeholder="เหตุการณ์ รหัสคำขอ หรือผู้ทำรายการ"
            className="mt-1.5 h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-sm outline-none focus:border-[#1a58a7]"
          />
        </label>
        <label className="min-w-48 text-xs text-[#344256]">
          ประเภทการทำรายการ
          <select
            name="action"
            value={action}
            onChange={(event) => setAction(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-sm outline-none focus:border-[#1a58a7]"
          >
            <option value="">ทุกประเภท</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {actionName(action)}
              </option>
            ))}
          </select>
        </label>
        <button className="h-10 rounded-lg bg-[#1a58a7] px-4 text-sm poppins-semibold text-white">
          ค้นหา
        </button>
      </form>
      <div
        className="relative min-h-44 overflow-x-auto rounded-xl border border-[#e3e9f0] bg-white"
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
          <thead className="bg-[#f7f8fa] text-xs poppins-semibold text-[#2f3a4d]">
            <tr>
              {[
                'วันเวลา',
                'การทำรายการ',
                'ผู้ทำ / บทบาท',
                'ผู้ใช้งานที่เกี่ยวข้อง',
                'รหัสคำขอ',
              ].map((label) => (
                <th key={label} className="px-4 py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((event) => (
              <tr key={event.id} className="border-t border-[#edf0f4] align-top text-[#526176]">
                <td className="whitespace-nowrap px-4 py-4">{formatDate(event.occurredAt)}</td>
                <td className="px-4 py-4">
                  <span className="poppins-medium text-[#26364b]">{actionName(event.action)}</span>
                  <span className="mt-1 block text-xs text-[#8492a6]">{event.action}</span>
                </td>
                <td className="px-4 py-4">
                  {event.actor?.name ?? 'ระบบ'}
                  <span className="block text-xs text-[#8492a6]">
                    {event.actor?.employeeCode ? `${event.actor?.employeeCode} · ` : ''}
                    {event.actorRole ?? '-'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {event.target?.name ?? '-'}
                  {event.target?.employeeCode && (
                    <span className="block text-xs text-[#8492a6]">
                      {event.target?.employeeCode}
                    </span>
                  )}
                </td>
                <td className="break-all px-4 py-4 poppins-regular text-xs">{event.requestId}</td>
              </tr>
            ))}
          </tbody>
        </SortableTable>
        {!loading && !error && rows.length === 0 && (
          <NotFoundComponent
            title={q || action ? 'ไม่พบเหตุการณ์ที่ตรงกับเงื่อนไข' : 'ยังไม่มีประวัติการทำรายการ'}
          />
        )}
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
