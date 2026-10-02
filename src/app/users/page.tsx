'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fieldClass, roles, userPath } from './user-ui';
import type { UserRow } from '@/types/api/users';
import StatusBadge from '@/components/ui/status-badge';
import type { UsersListResponse } from '@/types/api/users';
import { Get } from '@/service/http';
import ListRequestState from '@/components/ui/list-request-state';

export default function Page() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [view, setView] = useState<'CURRENT' | 'DELETED'>('CURRENT');
  const filters = new URLSearchParams({
    search: query,
    role: role === 'ALL' ? '' : role,
    status: status === 'ALL' ? '' : status,
    deleted: String(view === 'DELETED'),
  }).toString();
  const { rows, total, page, pages, setPage, loading, error, reload } = useUsers(
    '/api/users',
    filters,
    'users',
  );
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  async function exportCsv() {
    if (exporting) return;
    setExporting(true);
    setExportError('');
    try {
      const csv = await Get<string>('/api/users/export?' + filters);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zuugroup-users.csv';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) {
      setExportError(caught instanceof Error ? caught.message : 'ส่งออกไม่สำเร็จ');
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-5 p-6 pb-7" aria-label="จัดการผู้ใช้งาน">
      <ListRequestState loading={loading} error={error || exportError} retry={reload} />
      <div
        className="flex flex-wrap items-center gap-x-4 border-b border-[#e4e9f0]"
        role="tablist"
        aria-label="สถานะรายการผู้ใช้งาน"
      >
        {(
          [
            ['CURRENT', 'รายการปกติ'],
            ['DELETED', 'ลบแล้ว'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => {
              setView(id);
              setPage(1);
            }}
            className={`-mb-px min-h-10 border-b-2 px-1 pb-4 text-sm transition ${view === id ? 'border-[#1a58a7] font-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7]'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#e4e9f0] bg-white p-5">
        <label className="min-w-48 flex-1 text-xs text-[#344256]">
          ค้นหา
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="ชื่อ อีเมล หรือรหัสพนักงาน"
            className={fieldClass}
          />
        </label>
        <label className="min-w-40 text-xs text-[#344256]">
          บทบาท
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            className={fieldClass}
          >
            <option value="ALL">ทุกบทบาท</option>
            {roles.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-40 text-xs text-[#344256]">
          สถานะ
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className={fieldClass}
          >
            <option value="ALL">ทั้งหมด</option>
            <option value="ACTIVE">ใช้งานอยู่</option>
            <option value="SUSPENDED">ระงับการใช้งาน</option>
          </select>
        </label>
        <Link
          href="/users/create"
          className="flex h-10 items-center rounded-lg bg-[#1a58a7] px-4 text-sm font-semibold text-white!"
        >
          + เพิ่มผู้ใช้งาน
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[#e3e9f0] bg-white">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="bg-[#f7f8fa] text-xs font-semibold text-[#2f3a4d]">
            <tr>
              {[
                'ผู้ใช้งาน',
                'บทบาท',
                'ทีม / เขต',
                view === 'DELETED' ? 'ข้อมูลการลบ' : 'เข้าสู่ระบบล่าสุด',
                'สถานะ',
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => {
              const href = userPath(user.employeeCode);
              return (
                <tr
                  key={user.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`ดูรายละเอียด ${user.name}`}
                  onClick={() => router.push(href)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                  className="cursor-pointer border-t border-[#edf0f4] text-sm text-[#526176] hover:bg-[#fafbfc] focus-visible:bg-[#eff5fc] focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className="px-4 py-4">
                    <span className="block font-semibold text-[#1a58a7]">{user.name}</span>
                    <span className="block break-all text-xs">{user.email}</span>
                    <span className="text-xs">{user.employeeCode}</span>
                  </td>
                  <td className="px-4 py-4">{user.userRole?.role.name ?? 'ยังไม่มีบทบาท'}</td>
                  <td className="px-4 py-4">{user.team || '—'}</td>
                  <td className="px-4 py-4 text-xs">
                    {user.deletedAt ? (
                      <>
                        <span className="block">{formatDate(user.deletedAt)}</span>
                        <span className="block">
                          โดย{' '}
                          {user.deletedByUser
                            ? `${user.deletedByUser.name} (${user.deletedByUser.employeeCode})`
                            : 'ไม่ทราบผู้ลบ'}
                        </span>
                        <span className="block">เหตุผล: {user.deleteReason ?? '—'}</span>
                      </>
                    ) : (
                      formatDate(user.lastLoginAt)
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      value={
                        user.deletedAt
                          ? 'ลบแล้ว'
                          : user.status === 'ACTIVE'
                            ? 'ใช้งานอยู่'
                            : 'ระงับการใช้งาน'
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && !error && total === 0 && (
          <p className="py-12 text-center text-sm text-[#8492a6]">
            {view === 'DELETED' ? 'ไม่มีผู้ใช้งานที่ลบแล้ว' : 'ไม่พบผู้ใช้งาน'}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm text-[#758195]">
          <span>
            แสดง {rows.length} จาก {total} รายการ
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <span>
              {page} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        disabled={exporting}
        onClick={() => void exportCsv()}
        className="self-start rounded-lg bg-[#1a58a7] px-4 py-2.5 text-sm text-white"
      >
        ส่งออก CSV
      </button>
    </section>
  );
}

function useUsers(_path: string, filters: string, _key: string, initialPage = 1) {
  const path = '/api/users';
  const [page, setPage] = useState(
    Number.isSafeInteger(initialPage) && initialPage >= 1 && initialPage <= 10001 ? initialPage : 1,
  );
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams(filters);
      params.set('limit', '10');
      params.set('offset', String((page - 1) * 10));
      Get<UsersListResponse>(`${path}?${params}`, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          const pages = Math.max(1, Math.ceil(result.pagination.total / 10));
          setTotal(result.pagination.total);
          if (page > pages) {
            setPage(pages);
            setRows([]);
            return;
          }
          setRows(result.users);
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
