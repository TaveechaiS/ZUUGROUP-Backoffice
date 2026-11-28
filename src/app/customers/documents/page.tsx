'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import PaginationControls from '@/components/ui/pagination-controls';
import { Get } from '@/service/http';
import type { CustomerDocumentPage } from '@/types/api/customer-documents';
import { dateOnly, dateTime } from '@/components/sales/document-ui';
import { SearchIcon } from '@/components/icons/status-icons';
import { filterGridClass, filterClass } from '@/components/ui/form-classes';

const size = (bytes: number) =>
  bytes >= 1048576
    ? `${(bytes / 1048576).toLocaleString('th-TH', { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('th-TH')} KB`;

export default function Page() {
  const [search, setSearch] = useState('');
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const [result, setResult] = useState<CustomerDocumentPage | null>(null);
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
        documentTypeId,
        limit: String(pageSize),
        offset: String((page - 1) * pageSize),
      });
      Get<CustomerDocumentPage>(
        withTableSort('/api/customer-documents?' + query, {
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
  }, [search, documentTypeId, page, pageSize, retry, sort.key, sort.direction]);

  const rows = result?.data ?? [];
  const total = result?.pagination.total ?? 0;
  const control = `mt-1.5 ${filterClass}`;

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6">
      <p className="text-sm text-[#718096]">
        รวมไฟล์แนบจากข้อมูลลูกค้า เพิ่มหรือลบไฟล์ได้จากหน้าแก้ไขลูกค้า
      </p>
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
              placeholder="ชื่อหรือรหัสลูกค้า หรือชื่อไฟล์"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </label>
        <label className="min-w-0 text-xs text-[#53647c]">
          ประเภทเอกสาร
          <select
            className={control}
            value={documentTypeId}
            onChange={(e) => {
              setDocumentTypeId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">ทั้งหมด</option>
            {result?.documentTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
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
          columns={[
            'customerName',
            'documentTypeName',
            'name',
            null,
            'licenseExpiresAt',
            'createdAt',
          ]}
          className="w-full min-w-[880px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {['ลูกค้า', 'ประเภทเอกสาร', 'ไฟล์', 'ขนาด', 'ใบอนุญาตหมดอายุ', 'แนบเมื่อ'].map(
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
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[#edf0f4] hover:bg-[#fafbfc]">
                  <td className="px-4 py-3">
                    <Link
                      href={'/customers/' + encodeURIComponent(row.customerCode)}
                      className="text-[#1a58a7] hover:underline"
                    >
                      {row.customerName}
                    </Link>
                    <p className="mt-1 text-xs text-[#718096]">{row.customerCode}</p>
                  </td>
                  <td className="px-4 py-3">{row.documentTypeName}</td>
                  <td className="w-[30%] break-all px-4 py-3">
                    <a
                      href={'/api/customers/files/' + row.id}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1a58a7] hover:underline"
                    >
                      {row.name}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{size(row.size)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{dateOnly(row.licenseExpiresAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3">{dateTime(row.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </SortableTable>
        {!loading && !error && !rows.length && <NotFoundComponent title="ไม่พบเอกสารลูกค้า" />}
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
