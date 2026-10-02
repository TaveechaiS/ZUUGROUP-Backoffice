'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { AuditListResponse } from '@/types/api/audit';
import { Get } from '@/service/http';
import ListRequestState from '@/components/ui/list-request-state';
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
  const { rows, total, page, pages, setPage, loading, error, reload, actions } = useAudit(
    '/api/audit-logs',
    filters,
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
        loading={loading}
        error={error}
        retry={() => {
          reload();
        }}
      />
      <header>
        <h1 className="m-0 text-2xl font-semibold">ประวัติการทำรายการ</h1>
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
        <button className="h-10 rounded-lg bg-[#1a58a7] px-4 text-sm font-semibold text-white">
          ค้นหา
        </button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-[#e3e9f0] bg-white">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
          <thead className="bg-[#f7f8fa] text-xs font-semibold text-[#2f3a4d]">
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
                  <span className="font-medium text-[#26364b]">{actionName(event.action)}</span>
                  <span className="mt-1 block text-xs text-[#8492a6]">{event.action}</span>
                </td>
                <td className="px-4 py-4">
                  {event.actor?.name ?? 'ระบบ'}
                  <span className="block text-xs text-[#8492a6]">
                    {event.actor?.employeeCode ? `${event.actor?.employeeCode} · ` : ''}
                    {event.actorRole ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {event.target?.name ?? '—'}
                  {event.target?.employeeCode && (
                    <span className="block text-xs text-[#8492a6]">
                      {event.target?.employeeCode}
                    </span>
                  )}
                </td>
                <td className="break-all px-4 py-4 font-mono text-xs">{event.requestId}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !error && rows.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-[#8492a6]">
            {q || action ? 'ไม่พบเหตุการณ์ที่ตรงกับเงื่อนไข' : 'ยังไม่มีประวัติการทำรายการ'}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm text-[#758195]">
          <span>
            แสดง {rows.length} จาก {total} รายการ
          </span>
          <div className="flex items-center gap-2">
            <span>
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded border px-3 py-1 hover:bg-[#f8f9fb] disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              className="rounded border px-3 py-1 hover:bg-[#f8f9fb] disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
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
      params.set('limit', '10');
      if (metadataRetry.current !== retry) params.set('include', 'filters');
      params.set('offset', String((page - 1) * 10));
      Get<AuditListResponse>(`${path}?${params}`, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          if (result.filters) {
            setActions(result.filters.actions);
            metadataRetry.current = retry;
          }
          const pages = Math.max(1, Math.ceil(result.pagination.total / 10));
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
  }, [path, filters, page, retry]);
  return {
    actions,
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

const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
function formatDate(value: string | null): string {
  return value ? dateTime.format(new Date(value)) : 'ยังไม่เคยเข้าใช้';
}
