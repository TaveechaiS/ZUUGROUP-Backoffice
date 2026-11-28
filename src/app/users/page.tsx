'use client';
import PaginationControls from '@/components/ui/pagination-controls';
import SortableTable, { useTableSort } from '@/components/ui/sortable-table';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { roles, userPath } from './user-ui';
import type { UserRow } from '@/types/api/users';
import StatusBadge from '@/components/ui/status-badge';
import type { UsersListResponse } from '@/types/api/users';
import { Get } from '@/service/http';
import ListRequestState from '@/components/ui/list-request-state';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass, secondaryButtonClass } from '@/components/ui/form-classes';

export default function Page() {
  const sort = useTableSort();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('ALL');
  const [view, setView] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED'>('ALL');
  const filters = new URLSearchParams({
    ...(sort.key ? { sortBy: sort.key, sortDirection: sort.direction } : {}),
    search: query,
    role: role === 'ALL' ? '' : role,
    status: view === 'ACTIVE' || view === 'SUSPENDED' ? view : '',
    deleted: String(view === 'DELETED'),
  }).toString();
  const { pageSize, setPageSize, rows, total, page, pages, setPage, loading, error, reload } =
    useUsers('/api/users', filters, 'users');
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
    <section
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
      aria-label="จัดการผู้ใช้งาน"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะรายการผู้ใช้งาน" className="flex flex-wrap gap-5">
          {(
            [
              ['ALL', 'ทั้งหมด'],
              ['ACTIVE', 'ใช้งานอยู่'],
              ['SUSPENDED', 'ระงับการใช้งาน'],
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
              className={`border-b-2 px-1 py-3 text-sm ${view === id ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ListRequestState
        error={error || exportError}
        retry={() => {
          setExportError('');
          reload();
        }}
      />
      <div className={filterGridClass(1)}>
        <label className="min-w-0 text-xs text-[#53647c]">
          ค้นหา
          <div className="relative mt-1.5">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="ชื่อ อีเมล หรือรหัสพนักงาน"
              className={`${filterClass} pl-10`}
            />
          </div>
        </label>
        <label className="min-w-0 text-xs text-[#53647c]">
          บทบาท
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
            className={`mt-1.5 ${filterClass}`}
          >
            <option value="ALL">ทุกบทบาท</option>
            {roles.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
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
          columns={[
            'name',
            'role',
            'team',
            view === 'DELETED' ? 'deletedAt' : 'lastLoginAt',
            'status',
          ]}
          className="w-full min-w-[900px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {[
                'ผู้ใช้งาน',
                'บทบาท',
                'ทีม / เขต',
                view === 'DELETED' ? 'ข้อมูลการลบ' : 'เข้าสู่ระบบล่าสุด',
                'สถานะ',
              ].map((label) => (
                <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
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
                  className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className="px-4 py-3">
                    <span className="block poppins-semibold text-[#1a58a7]">{user.name}</span>
                    <span className="block break-all text-xs">{user.email}</span>
                    <span className="text-xs">{user.employeeCode}</span>
                  </td>
                  <td className="px-4 py-3">{user.userRole?.role.name ?? 'ยังไม่มีบทบาท'}</td>
                  <td className="px-4 py-3">{user.team || '-'}</td>
                  <td className="px-4 py-3 text-xs">
                    {user.deletedAt ? (
                      <>
                        <span className="block">{formatDate(user.deletedAt)}</span>
                        <span className="block">
                          โดย{' '}
                          {user.deletedByUser
                            ? `${user.deletedByUser.name} (${user.deletedByUser.employeeCode})`
                            : 'ไม่ทราบผู้ลบ'}
                        </span>
                        <span className="block">เหตุผล: {user.deleteReason ?? '-'}</span>
                      </>
                    ) : (
                      formatDate(user.lastLoginAt)
                    )}
                  </td>
                  <td className="px-4 py-3">
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
        </SortableTable>
        {!loading && !error && total === 0 && (
          <NotFoundComponent
            title={view === 'DELETED' ? 'ไม่มีผู้ใช้งานที่ลบแล้ว' : 'ไม่พบผู้ใช้งาน'}
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
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={exporting || loading || !total}
          onClick={() => void exportCsv()}
          className={secondaryButtonClass}
        >
          {exporting ? 'กำลังส่งออก...' : 'ส่งออก CSV'}
        </button>
      </div>
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
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams(filters);
      params.set('limit', String(pageSize));
      params.set('offset', String((page - 1) * pageSize));
      Get<UsersListResponse>(`${path}?${params}`, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          const pages = Math.max(1, Math.ceil(result.pagination.total / pageSize));
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
  }, [path, filters, page, pageSize, retry]);
  return {
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
