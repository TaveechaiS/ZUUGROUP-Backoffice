'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SortableTable, { useTableSort } from '@/components/ui/sortable-table';
import PaginationControls from '@/components/ui/pagination-controls';
import StatusBadge from '@/components/ui/status-badge';
import NotFoundComponent from '@/components/ui/not-found-component';
import { SearchIcon } from '@/components/icons/status-icons';
import { SAMPLE_REQUESTS, type CustomerRequest } from './request-data';

const tabs = [
  { key: 'pending', label: 'รอตรวจสอบ', statuses: ['รอตรวจสอบ'] },
  { key: 'returned', label: 'ส่งกลับแก้ไข', statuses: ['ส่งกลับแก้ไข'] },
  { key: 'approved', label: 'อนุมัติแล้ว', statuses: ['อนุมัติแล้ว'] },
  { key: 'closed', label: 'ไม่อนุมัติ / ยกเลิก', statuses: ['ไม่อนุมัติ', 'ยกเลิก'] },
] as const;
const columns = ['code', 'name', 'requester', 'territory', 'submittedAt', 'status'] as const;
const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
const cellClass = 'px-5 py-4 align-top';
const ALL = '';
const sortValue = (request: CustomerRequest, key: (typeof columns)[number]) =>
  key === 'name'
    ? request.fields.name
    : key === 'requester'
      ? request.requester.name
      : request[key];

export default function Page() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('pending');
  const [search, setSearch] = useState('');
  const [territory, setTerritory] = useState(ALL);
  const [requester, setRequester] = useState(ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setPage(1));
  const statuses: readonly string[] = tabs.find((item) => item.key === tab)!.statuses;
  const query = search.trim().toLocaleLowerCase('th');
  const filtered = SAMPLE_REQUESTS.filter(
    (request) =>
      statuses.includes(request.status) &&
      (!territory || request.territory === territory) &&
      (!requester || request.requester.name === requester) &&
      [request.code, request.fields.name, request.requester.name, request.territory].some((value) =>
        value.toLocaleLowerCase('th').includes(query),
      ),
  );
  const sortKey = columns.find((column) => column === sort.key);
  // Newest first unless the user picks a column.
  filtered.sort((left, right) => {
    const result = sortKey
      ? String(sortValue(left, sortKey)).localeCompare(String(sortValue(right, sortKey)), 'th', {
          numeric: true,
        })
      : right.submittedAt.localeCompare(left.submittedAt);
    return sortKey && sort.direction === 'desc' ? -result : result;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const unique = (values: string[]) =>
    [...new Set(values)].sort((a, b) => a.localeCompare(b, 'th'));
  function resetFilters() {
    setSearch('');
    setTerritory(ALL);
    setRequester(ALL);
    setPage(1);
  }

  return (
    <section aria-label="คำขอเพิ่มลูกค้า" className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-xl poppins-semibold text-[#26364b]">คำขอเพิ่มลูกค้า</h1>
        <p className="mt-2 text-sm poppins-regular text-[#718096]">
          ตัวอย่างหน้าจอ — ข้อมูลสมมุติ จะเชื่อมคำขอจริงเมื่อทำส่วนของ Sales / Manager
        </p>
      </div>
      <div
        role="tablist"
        aria-label="สถานะคำขอ"
        className="mb-4 flex flex-wrap gap-x-4 border-b border-[#e4e9f0]"
      >
        {tabs.map((item) => {
          const count = SAMPLE_REQUESTS.filter((request) =>
            (item.statuses as readonly string[]).includes(request.status),
          ).length;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => {
                setTab(item.key);
                setPage(1);
              }}
              className={`-mb-px min-h-10 border-b-2 px-1 pb-3 text-sm transition ${tab === item.key ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7]'}`}
            >
              {item.label}
              {item.key === 'pending' && count > 0 && (
                <span className="ml-2 rounded-full bg-orange-50 px-2 py-0.5 text-xs poppins-semibold text-orange-600">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mb-6 grid grid-cols-1 items-end gap-5 rounded-xl border border-[#e4e7ec] bg-white p-6 shadow-xs sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <label className="min-w-0">
          <span className="mb-2 block text-xs text-[#344256]">ค้นหาคำขอ</span>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8994a5]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="เลขที่คำขอ ชื่อสถานประกอบการ ผู้ขอ หรือเขต"
              className="h-10 w-full min-w-0 rounded-md border border-[#dfe5ee] bg-white pl-10 pr-3 text-sm poppins-regular text-[#344256] outline-none placeholder:text-[#9ba7b6] focus:border-[#1a58a7]"
            />
          </div>
        </label>
        <FilterSelect
          label="เขตขาย"
          value={territory}
          options={unique(SAMPLE_REQUESTS.map((request) => request.territory))}
          onChange={(value) => {
            setTerritory(value);
            setPage(1);
          }}
        />
        <FilterSelect
          label="ผู้ขอ"
          value={requester}
          options={unique(SAMPLE_REQUESTS.map((request) => request.requester.name))}
          onChange={(value) => {
            setRequester(value);
            setPage(1);
          }}
        />
      </div>
      <div className="relative overflow-hidden rounded-lg border border-[#d9e3ee] bg-white">
        <div className="overflow-x-auto">
          <SortableTable
            sort={sort}
            columns={[...columns]}
            className="w-full min-w-[960px] border-collapse text-left text-sm poppins-regular text-[#344256]"
          >
            <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
              <tr>
                {[
                  'เลขที่คำขอ',
                  'ชื่อสถานประกอบการ / บริษัท',
                  'ผู้ขอ',
                  'เขตขาย',
                  'วันที่ขอ',
                  'สถานะ',
                ].map((label) => (
                  <th key={label} scope="col" className="px-5 py-3 poppins-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((request) => (
                <tr
                  key={request.code}
                  role="link"
                  tabIndex={0}
                  aria-label={`เปิดคำขอ ${request.code}`}
                  onClick={() => router.push(`/customers/requests/${request.code}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') router.push(`/customers/requests/${request.code}`);
                  }}
                  className="cursor-pointer border-b border-[#edf1f5] last:border-b-0 hover:bg-blue-50/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1a58a7]"
                >
                  <td className={`${cellClass} whitespace-nowrap poppins-medium text-[#1a58a7]`}>
                    {request.code}
                  </td>
                  <td className={cellClass}>
                    <p className="poppins-medium">{request.fields.name}</p>
                    <p className="mt-1 text-xs text-[#718096]">{request.codeGroup}</p>
                  </td>
                  <td className={cellClass}>
                    <p>{request.requester.name}</p>
                    <p className="mt-1 text-xs text-[#718096]">{request.requester.role}</p>
                  </td>
                  <td className={`${cellClass} whitespace-nowrap`}>{request.territory}</td>
                  <td className={`${cellClass} whitespace-nowrap`}>
                    {dateTime.format(new Date(request.submittedAt))}
                  </td>
                  <td className={cellClass}>
                    <StatusBadge value={request.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </SortableTable>
        </div>
        {!rows.length && (
          <NotFoundComponent
            title="ไม่พบคำขอ"
            onRefresh={resetFilters}
            onBack={resetFilters}
            backLabel="แสดงทั้งหมด"
          />
        )}
        <PaginationControls
          page={currentPage}
          pages={pages}
          total={filtered.length}
          count={rows.length}
          pageSize={pageSize}
          onChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-0 text-xs text-[#344256]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full min-w-0 rounded-md border border-[#dfe5ee] bg-white px-3 text-sm poppins-regular text-[#6f7a8b] outline-none focus:border-[#1a58a7]"
      >
        <option value={ALL}>ทั้งหมด</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
