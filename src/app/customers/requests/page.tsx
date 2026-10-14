'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import PaginationControls from '@/components/ui/pagination-controls';
import { Get } from '@/service/http';
import type { CustomerRequestPage } from '@/types/api/customer-requests';
import { dateTime } from '@/components/sales/document-ui';

const tabs = ['รอตรวจสอบ', 'ส่งกลับแก้ไข', 'อนุมัติแล้ว', 'ไม่อนุมัติ', 'ยกเลิก', ''];

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState('รอตรวจสอบ');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [result, setResult] = useState<CustomerRequestPage | null>(null);
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
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<CustomerRequestPage>('/api/customer-requests?' + query, controller.signal)
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
  }, [search, tab, page, pageSize, retry]);

  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const admin = result?.actor.roleId === 'ADMIN';
  const control = 'mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm';

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <h1 className="text-xl poppins-semibold text-[#26364b]">
        {result && !admin ? 'คำขอของฉัน' : 'คำขอเพิ่มลูกค้า'}
      </h1>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        <div role="tablist" aria-label="สถานะคำขอ" className="flex flex-wrap gap-5">
          {tabs.map((key) => (
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
      <div className="grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3">
        <label className="text-xs text-[#53647c]">
          ค้นหา
          <input
            className={control}
            value={search}
            placeholder="ชื่อลูกค้าหรือชื่อผู้ขอ"
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <LoadingComponent isVisible={loading && !error} variant="content" />
        <table className="w-full min-w-[880px] border-collapse text-left text-sm">
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {['ชื่อลูกค้า', 'ประเภทลูกค้า', 'เขตขาย', 'ผู้ขอ', 'ส่งเมื่อ', 'สถานะ'].map(
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
                const href = '/customers/requests/' + row.id;
                return (
                  <tr
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`ดูคำขอ ${row.name}`}
                    onClick={() => router.push(href)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                    className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
                  >
                    <td className="w-[28%] break-words px-4 py-3 text-[#1a58a7]">
                      <p>{row.name}</p>
                      {row.customerCode && (
                        <p className="mt-1 text-xs text-[#718096]">{row.customerCode}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.codeGroupName}</td>
                    <td className="px-4 py-3">{row.territoryName}</td>
                    <td className="px-4 py-3">{row.requesterName}</td>
                    <td className="whitespace-nowrap px-4 py-3">{dateTime(row.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={row.status} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {!loading && !error && !rows.length && <NotFoundComponent title="ไม่พบคำขอ" />}
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
