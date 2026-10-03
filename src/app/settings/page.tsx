'use client';
import type { RecordListResponse } from '@/types/api/records';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Get, Update } from '@/service/http';
import { SearchIcon } from '@/components/icons/status-icons';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import StatusBadge from '@/components/ui/status-badge';

import type { RecordConfig, RecordRow, RecordFilters } from '@/types/api/records';

const LOCAL_PAGE = {
  key: 'settings',
  model: 'SystemSetting',
  table: 'system_settings',
  page: '/settings',
  fields: [
    {
      key: 'code',
      label: 'รหัส / เลขอ้างอิง',
      type: 'text',
      required: true,
    },
    {
      key: 'name',
      label: 'ชื่อ / หัวข้อ',
      type: 'text',
      required: true,
    },
    {
      key: 'status',
      label: 'สถานะ',
      type: 'text',
      required: true,
    },
    {
      key: 'category',
      label: 'หมวดตั้งค่า',
      type: 'text',
      required: false,
    },
    {
      key: 'description',
      label: 'คำอธิบาย',
      type: 'textarea',
      required: false,
    },
    {
      key: 'owner',
      label: 'ผู้ดูแล / ผู้บันทึก',
      type: 'text',
      required: false,
    },
    {
      key: 'value',
      label: 'ค่า',
      type: 'text',
      required: false,
    },
    {
      key: 'notes',
      label: 'หมายเหตุ',
      type: 'textarea',
      required: false,
    },
  ],
  display: ['category', 'description', 'owner', 'value'],
  title: 'ตั้งค่าระบบ',
  action: 'เพิ่มรายการตั้งค่า',
  columns: ['การตั้งค่า', 'หมวด', 'ผู้แก้ไข', 'ค่าที่บันทึก'],
  tabs: ['ทั้งหมด'],
  filters: ['ทุกหมวด'],
  eyebrow: '',
  description: '',
};
export default function Page() {
  const href: string = '/settings';
  const apiPath = '/api/settings';
  const [config, setConfig] = useState<RecordConfig>({
    ...LOCAL_PAGE,
    canWrite: false,
    metrics: [],
  });

  const [rows, setRows] = useState<RecordRow[]>([]);
  const [selectedTab, setSelectedTab] = useState(config.tabs[0]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(config.filters[0]);
  const [typeFilter, setTypeFilter] = useState('ทั้งหมด');
  const [detailFilter, setDetailFilter] = useState('ทั้งหมด');
  const [ownerFilter, setOwnerFilter] = useState('ทุกผู้รับผิดชอบ');
  const [statusFilter, setStatusFilter] = useState('ทุกสถานะ');
  const [currentPage, setCurrentPage] = useState(1);
  const [notice, setNotice] = useState('');

  const [options, setOptions] = useState<RecordFilters>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const metadataRetry = useRef<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        offset: String((currentPage - 1) * 10),
        limit: '10',
        search,
        tab: selectedTab,
        filter,
      });
      params.set('deleted', String(selectedTab === 'ลบแล้ว'));
      if (typeFilter !== 'ทั้งหมด' && LOCAL_PAGE.display[0])
        params.set(LOCAL_PAGE.display[0], typeFilter);
      if (detailFilter !== 'ทั้งหมด' && LOCAL_PAGE.display[1])
        params.set(LOCAL_PAGE.display[1], detailFilter);
      if (ownerFilter !== 'ทุกผู้รับผิดชอบ' && LOCAL_PAGE.display[2])
        params.set(LOCAL_PAGE.display[2], ownerFilter);
      if (statusFilter !== 'ทุกสถานะ') params.set('status', statusFilter);
      if (metadataRetry.current !== retry) params.set('include', 'filters,config');
      Get<RecordListResponse>(apiPath + '?' + params, controller.signal)
        .then((r) => {
          if (controller.signal.aborted) return;
          if (r.filters) setOptions(r.filters);
          if (r.config)
            setConfig({ ...LOCAL_PAGE, canWrite: r.config.canWrite, metrics: r.config.metrics });
          if (r.filters && r.config) metadataRetry.current = retry;
          setRows(r.data);
          setTotal(r.pagination.total);
          const lastPage = Math.max(1, Math.ceil(r.pagination.total / 10));
          if (currentPage > lastPage) {
            setCurrentPage(lastPage);
            setRows([]);
            return;
          }
          setLoading(false);
        })
        .catch((e) => {
          if (!controller.signal.aborted) {
            setError(e.message);
            setRows([]);
            setLoading(false);
          }
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    apiPath,
    currentPage,
    search,
    selectedTab,
    filter,
    typeFilter,
    detailFilter,
    ownerFilter,
    statusFilter,
    retry,
  ]);
  const pageCount = Math.max(1, Math.ceil(total / 10));
  const pagedRows = loading ? [] : rows;
  const statuses = options.status ?? [];
  const types = options[LOCAL_PAGE.display[0] ?? ''] ?? [];
  const details = options[LOCAL_PAGE.display[1] ?? ''] ?? [];
  const owners = options[LOCAL_PAGE.display[2] ?? ''] ?? [];
  const isCustomerList = href === '/customers' || href === '/customers/list';
  const detailHref = selectedTab === 'ลบแล้ว' ? null : config.page;
  const [restoreBusy, setRestoreBusy] = useState('');
  const restoreLock = useRef(false);
  async function restore(row: RecordRow) {
    if (restoreLock.current || notice) return;
    restoreLock.current = true;
    setRestoreBusy(row.id);
    setError('');
    try {
      await Update('/api/' + config.key + '/' + row.id, { action: 'restore' });
      setNotice('กู้คืนรายการแล้ว');
      setCurrentPage(1);
      setRetry((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'กู้คืนไม่สำเร็จ');
    } finally {
      restoreLock.current = false;
      setRestoreBusy('');
    }
  }
  const tableHeaders = isCustomerList
    ? ['ชื่อลูกค้า/บริษัท', 'ประเภท', 'รหัสลูกค้า', 'จังหวัด', 'ผู้ดูแล', 'เงื่อนไข', 'สถานะ']
    : [
        config.columns[0],
        'ประเภท / หมวด',
        'เลขอ้างอิง',
        'รายละเอียด',
        config.columns[2],
        'ค่า / จำนวน',
        'สถานะ',
      ];

  return (
    <section className="flex flex-1 flex-col gap-0 p-6 pb-7" aria-label={config.title}>
      {error && (
        <div
          role="alert"
          className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
          <button type="button" onClick={() => setRetry((n) => n + 1)} className="ml-3 underline">
            ลองใหม่
          </button>
        </div>
      )}
      <SuccessAlertComponent
        title={notice}
        isOpen={Boolean(notice)}
        onClose={() => setNotice('')}
      />

      <div
        className="mb-4 flex flex-wrap items-center gap-x-4 border-b border-[#e4e9f0]"
        role="tablist"
        aria-label={`หมวด ${config.title}`}
      >
        {[...config.tabs, ...(config.canWrite ? ['ลบแล้ว'] : [])].map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab}
            onClick={() => {
              setSelectedTab(tab);
              setCurrentPage(1);
            }}
            className={`-mb-px min-h-10 border-b-2 px-1 pb-4 text-sm transition ${selectedTab === tab ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className={`grid grid-cols-2 items-end gap-5 rounded-xl border bg-white p-6 shadow-xs sm:grid-cols-3 xl:grid-cols-[repeat(6,minmax(0,1fr))_auto] ${isCustomerList ? 'border-[#e4e7ec]' : 'border-[#e4e9f0]'}`}
      >
        <label className="relative col-span-2 min-w-0 sm:col-span-1">
          <span className="mb-2 block text-xs leading-4 text-[#344256]">ค้นหา</span>
          <SearchIcon className="pointer-events-none absolute bottom-3 left-2 h-3 w-3 text-[#8b98a9]" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="ค้นหา..."
            className="h-10 w-full min-w-0 rounded-md border border-[#dfe5ee] bg-white pl-8 pr-3 text-sm text-[#344256] outline-none placeholder:text-[#9ba7b6] focus:border-[#1a58a7]"
          />
        </label>
        <RecordFilter
          label={isCustomerList ? 'กลุ่มลูกค้า' : 'หมวด'}
          value={filter}
          options={config.filters}
          onChange={(value) => {
            setFilter(value);
            setCurrentPage(1);
          }}
        />
        <RecordFilter
          label={isCustomerList ? 'ประเภท' : 'ชนิด'}
          value={typeFilter}
          options={['ทั้งหมด', ...types]}
          onChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}
        />
        <RecordFilter
          label={isCustomerList ? 'จังหวัด' : 'รายละเอียด'}
          value={detailFilter}
          options={['ทั้งหมด', ...details]}
          onChange={(value) => {
            setDetailFilter(value);
            setCurrentPage(1);
          }}
        />
        <RecordFilter
          label={isCustomerList ? 'ผู้ดูแล' : 'ผู้รับผิดชอบ'}
          value={ownerFilter}
          options={['ทุกผู้รับผิดชอบ', ...owners]}
          onChange={(value) => {
            setOwnerFilter(value);
            setCurrentPage(1);
          }}
        />
        <RecordFilter
          label="สถานะ"
          value={statusFilter}
          options={['ทุกสถานะ', ...statuses]}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        />
        {config.canWrite && (
          <Link
            href={`${config.page}/create`}
            className="col-span-2 inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-[#1a58a7] px-4 text-sm poppins-semibold text-white! transition hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7] sm:col-span-1"
          >
            <span className="text-sm leading-none" aria-hidden="true">
              +
            </span>
            {config.action}
          </Link>
        )}
      </div>

      <div className="relative mt-6 min-h-44 overflow-hidden rounded-xl border border-[#e3e9f0] bg-white" aria-busy={loading}>
        <LoadingComponent isVisible={loading && !error} variant="content" label="กำลังโหลดรายการ..." />
        {selectedTab === 'ลบแล้ว' && (
          <div className="divide-y divide-[#e3e9f0]">
            {pagedRows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="m-0 text-sm poppins-semibold">{row.name}</p>
                  <p className="m-0 text-xs text-[#718096]">{row.code}</p>
                  <div className="mt-2">
                    <StatusBadge value="ลบแล้ว" />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={Boolean(restoreBusy) || Boolean(notice)}
                  onClick={() => restore(row)}
                  className="rounded border border-[#d9e3ee] px-3 py-2 text-sm text-[#1a58a7]"
                >
                  {restoreBusy === row.id ? 'กำลังกู้คืน...' : 'กู้คืน'}
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={selectedTab === 'ลบแล้ว' ? 'hidden' : 'hidden overflow-x-auto md:block'}>
          <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
            <thead className="bg-[#f7f8fa] text-xs poppins-semibold text-[#2f3a4d]">
              <tr>
                {tableHeaders.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="whitespace-normal px-[14px] py-3 text-left [overflow-wrap:anywhere]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((item) => (
                <RecordTableRow key={item.code} row={item} detailHref={detailHref} />
              ))}
            </tbody>
          </table>
        </div>
        <div
          className={selectedTab === 'ลบแล้ว' ? 'hidden' : 'divide-y divide-[#e8ebef] md:hidden'}
        >
          {pagedRows.map((item) => (
            <RecordMobileRow key={item.code} row={item} detailHref={detailHref} />
          ))}
        </div>
        {!loading && !error && total === 0 && (
          <NotFoundComponent
            title="ไม่พบรายการ"
            description="ลองเปลี่ยนคำค้นหาหรือตัวกรอง แล้วกดลองอีกครั้ง"
            onRefresh={() => setRetry((n) => n + 1)}
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e3e9f0] px-6 py-5 text-sm text-[#758195]">
          <span>
            แสดง {pagedRows.length} จาก {total} รายการ
          </span>
          <nav className="flex items-center gap-1" aria-label="เปลี่ยนหน้ารายการ">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
              className="h-9 rounded border border-[#e3e9f0] px-3 disabled:cursor-default disabled:text-[#aab3bf]"
            >
              ‹ ก่อนหน้า
            </button>
            {Array.from(
              { length: Math.min(5, pageCount) },
              (_, index) => Math.max(1, Math.min(currentPage - 2, pageCount - 4)) + index,
            ).map((number) => (
              <button
                key={number}
                type="button"
                aria-current={currentPage === number ? 'page' : undefined}
                onClick={() => setCurrentPage(number)}
                className={`h-9 min-w-9 rounded border px-1 text-sm ${currentPage === number ? 'border-[#1a58a7] bg-[#1a58a7] poppins-semibold text-white' : 'border-[#e3e9f0] text-[#758195] hover:bg-[#f7f9fc]'}`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= pageCount}
              onClick={() => setCurrentPage((value) => Math.min(pageCount, value + 1))}
              className="h-9 rounded border border-[#e3e9f0] px-3 disabled:cursor-default disabled:text-[#aab3bf]"
            >
              ถัดไป ›
            </button>
          </nav>
        </div>
      </div>
    </section>
  );
}

function RecordTableRow({ row, detailHref }: { row: RecordRow; detailHref: string | null }) {
  const router = useRouter();
  const type = displayText(row, LOCAL_PAGE.display[0]);
  const detail = displayText(row, LOCAL_PAGE.display[1]);
  const cells = [
    row.name,
    type,
    row.code,
    detail || '-',
    displayText(row, LOCAL_PAGE.display[2]),
    displayAmount(row),
    row.status,
  ];
  const href = detailHref
    ? `${detailHref}/${encodeURIComponent(detailHref === '/products' ? row.code : row.id)}`
    : null;
  return (
    <tr
      role={href ? 'link' : undefined}
      tabIndex={href ? 0 : undefined}
      aria-label={href ? `ดูรายละเอียด ${row.name}` : undefined}
      onClick={href ? () => router.push(href) : undefined}
      onKeyDown={
        href
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push(href);
              }
            }
          : undefined
      }
      className={`border-t border-[#edf0f4] text-sm text-[#7b8795] ${href ? 'cursor-pointer hover:bg-[#fafbfc] focus-visible:bg-[#eff5fc] focus-visible:outline-2 focus-visible:outline-[#1a58a7]' : ''}`}
    >
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`whitespace-normal px-[14px] py-4 [overflow-wrap:anywhere] ${index === 0 ? 'poppins-semibold' : ''}`}
          title={cell}
        >
          {index === cells.length - 1 ? <StatusBadge value={row.status} /> : cell}
        </td>
      ))}
    </tr>
  );
}

function RecordMobileRow({ row, detailHref }: { row: RecordRow; detailHref: string | null }) {
  const router = useRouter();
  const href = detailHref
    ? `${detailHref}/${encodeURIComponent(detailHref === '/products' ? row.code : row.id)}`
    : null;
  return (
    <article
      role={href ? 'link' : undefined}
      tabIndex={href ? 0 : undefined}
      aria-label={href ? `ดูรายละเอียด ${row.name}` : undefined}
      onClick={href ? () => router.push(href) : undefined}
      onKeyDown={
        href
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                router.push(href);
              }
            }
          : undefined
      }
      className={`px-4 py-3.5 ${href ? 'cursor-pointer hover:bg-[#fafbfc] focus-visible:bg-[#eff5fc] focus-visible:outline-2 focus-visible:outline-[#1a58a7]' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm poppins-semibold text-[#26364b] [overflow-wrap:anywhere]">
            {row.name}
          </p>
          <p className="mb-0 mt-1 text-xs text-[#8492a6] [overflow-wrap:anywhere]">
            {row.code} ·{' '}
            {[displayText(row, LOCAL_PAGE.display[0]), displayText(row, LOCAL_PAGE.display[1])]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-xs text-[#718096]">สถานะ</span>
          <StatusBadge value={row.status} />
        </div>
      </div>
      <div className="mt-3 flex justify-between gap-3 text-xs">
        <span className="min-w-0 whitespace-normal text-[#718096] [overflow-wrap:anywhere]">
          {displayText(row, LOCAL_PAGE.display[2])}
        </span>
        <span className="min-w-0 text-right poppins-medium text-[#35465d] [overflow-wrap:anywhere]">
          {displayAmount(row)}
        </span>
      </div>
    </article>
  );
}

function RecordFilter({
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
        className="mt-2 h-10 w-full min-w-0 rounded-md border border-[#dfe5ee] bg-white px-3 text-sm text-[#6f7a8b] outline-none focus:border-[#1a58a7]"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function displayText(row: RecordRow, key: string | null | undefined): string {
  if (!key) return '';
  const result = key
    .split('.')
    .reduce<unknown>(
      (value, part) =>
        value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined,
      row,
    );
  return result == null ? '' : String(result);
}
function displayAmount(row: RecordRow): string {
  if (row.memberCount !== undefined) return row.memberCount + ' ราย';
  const key = LOCAL_PAGE.display[3];
  const value = displayText(row, key);
  return key === 'amount'
    ? value === ''
      ? '-'
      : new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value))
    : value;
}

export function ActivityRow({ item }: { item: RecordRow }) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eff5fc] text-xs poppins-semibold text-[#2465b4]">
          {item.code.split('-')[0]}
        </span>
        <div className="min-w-0">
          <p className="m-0 text-sm poppins-medium text-[#35465d]">{item.name}</p>
          <p className="mb-0 mt-0.5 truncate text-sm text-[#8492a6]">
            {[displayText(item, LOCAL_PAGE.display[0]), displayText(item, LOCAL_PAGE.display[1])]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>
      <div className="ml-12 flex items-center gap-3 md:ml-0">
        <span className="text-sm text-[#718096]">{displayText(item, LOCAL_PAGE.display[2])}</span>
        <StatusBadge value={item.status} />
      </div>
    </article>
  );
}
