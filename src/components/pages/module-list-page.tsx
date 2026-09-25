'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { MockModuleConfig, MockRow } from '@/features/mock/mock-config';

export function ModuleListPage({ href, config }: { href: string; config: MockModuleConfig }) {
  return <ModuleListContent key={href} href={href} config={config} />;
}

function ModuleListContent({ href, config }: { href: string; config: MockModuleConfig }) {
  const [rows, setRows] = useState(config.rows);
  const [selectedTab, setSelectedTab] = useState(config.tabs[0]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(config.filters[0]);
  const [typeFilter, setTypeFilter] = useState('ทั้งหมด');
  const [detailFilter, setDetailFilter] = useState('ทั้งหมด');
  const [ownerFilter, setOwnerFilter] = useState('ทุกผู้รับผิดชอบ');
  const [statusFilter, setStatusFilter] = useState('ทุกสถานะ');
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [notice, setNotice] = useState('');

  const filteredRows = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('th');
    return rows.filter((item) => {
      const [type, detail] = splitSubtitle(item.subtitle);
      const matchesSearch =
        !query ||
        `${item.ref} ${item.title} ${item.subtitle} ${item.owner}`
          .toLocaleLowerCase('th')
          .includes(query);
      const matchesFilter =
        filter === config.filters[0] ||
        `${item.title} ${item.subtitle} ${item.status}`.includes(filter.replace(/^ทุก/, ''));
      const matchesType = typeFilter === 'ทั้งหมด' || type === typeFilter;
      const matchesDetail = detailFilter === 'ทั้งหมด' || detail === detailFilter;
      const matchesOwner = ownerFilter === 'ทุกผู้รับผิดชอบ' || item.owner === ownerFilter;
      const matchesStatus = statusFilter === 'ทุกสถานะ' || item.status === statusFilter;
      const isAllTab =
        selectedTab === config.tabs[0] ||
        [
          'ทั้งหมด',
          'ภาพรวม',
          'สินค้าทั้งหมด',
          'คงเหลือ',
          'วันนี้',
          'สัปดาห์นี้',
          'เดือนนี้',
          'ปีนี้',
        ].includes(selectedTab);
      const matchesTab =
        isAllTab ||
        `${item.status} ${item.title} ${item.subtitle}`.includes(
          selectedTab.replace('ทั้งหมด', ''),
        ) ||
        (selectedTab === 'เสร็จสิ้น' &&
          /สำเร็จ|ครบ|บันทึกแล้ว|กำหนดแล้ว|ตรวจแล้ว/.test(item.status)) ||
        (selectedTab === 'รอดำเนินการ' && /รอ|กำลัง|ติดตาม/.test(item.status));
      return (
        matchesSearch &&
        matchesFilter &&
        matchesType &&
        matchesDetail &&
        matchesOwner &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [
    config.filters,
    config.tabs,
    detailFilter,
    filter,
    ownerFilter,
    rows,
    search,
    selectedTab,
    statusFilter,
    typeFilter,
  ]);

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const owners = [...new Set(rows.map((item) => item.owner))];
  const statuses = [...new Set(rows.map((item) => item.status))];
  const types = [...new Set(rows.map((item) => splitSubtitle(item.subtitle)[0]))];
  const details = [...new Set(rows.map((item) => splitSubtitle(item.subtitle)[1]).filter(Boolean))];
  const isCustomerList = href === '/customers' || href === '/customers/list';
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    const newRow = {
      ref: `DEMO-${String(rows.length + 1).padStart(3, '0')}`,
      title: newTitle.trim(),
      subtitle: 'รายการสาธิต · ข้อมูลชั่วคราว',
      owner: 'ผู้ใช้ตัวอย่าง',
      value: 'ตัวอย่าง',
      status: 'เพิ่มใน Mock',
    };
    setRows((current) => [newRow, ...current]);
    setSelectedTab(config.tabs[0]);
    setSearch('');
    setFilter(config.filters[0]);
    setTypeFilter('ทั้งหมด');
    setDetailFilter('ทั้งหมด');
    setOwnerFilter('ทุกผู้รับผิดชอบ');
    setStatusFilter('ทุกสถานะ');
    setCurrentPage(1);
    setNotice(`เพิ่ม “${newTitle.trim()}” ในตัวอย่างแล้ว ข้อมูลนี้จะหายเมื่อรีเฟรชหน้า`);
    setNewTitle('');
    setFormOpen(false);
  }

  return (
    <section
      className="flex flex-1 flex-col gap-0 p-6 pb-7"
      aria-label={`${config.title} ข้อมูลจำลอง`}
    >
      {notice && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#b6d5f0] bg-[#eff5fc] px-4 py-3 text-sm text-[#174a8b]"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="font-semibold underline underline-offset-2"
          >
            ปิด
          </button>
        </div>
      )}

      <div
        className="mb-4 flex flex-wrap items-center gap-x-4 border-b border-[#e4e9f0]"
        role="tablist"
        aria-label={`หมวด ${config.title}`}
      >
        {config.tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selectedTab === tab}
            onClick={() => {
              setSelectedTab(tab);
              setCurrentPage(1);
            }}
            className={`-mb-px min-h-10 border-b-2 px-1 pb-4 text-sm transition ${selectedTab === tab ? 'border-[#1a58a7] font-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className={`grid grid-cols-2 items-end gap-5 rounded-xl border p-6 shadow-xs sm:grid-cols-3 xl:grid-cols-[repeat(6,minmax(0,1fr))_auto] ${isCustomerList ? 'border-[#e4e7ec] bg-white' : 'border-[#e4e9f0] bg-[#f8f9fb]'}`}
      >
        <label
          className="relative col-span-2 min-w-0 sm:col-span-1"
        >
          <span
            className="mb-2 block text-xs leading-4 text-[#344256]"
          >
            ค้นหา
          </span>
          <svg
            className="pointer-events-none absolute bottom-3 left-2 h-3 w-3 fill-none stroke-[#8b98a9] stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.4 4.4" />
          </svg>
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
        <MockFilter
          label={isCustomerList ? 'กลุ่มลูกค้า' : 'หมวด'}
          value={filter}
          options={config.filters}
          onChange={(value) => {
            setFilter(value);
            setCurrentPage(1);
          }}
        />
        <MockFilter
          label={isCustomerList ? 'ประเภท' : 'ชนิด'}
          value={typeFilter}
          options={['ทั้งหมด', ...types]}
          onChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}
        />
        <MockFilter
          label={isCustomerList ? 'จังหวัด' : 'รายละเอียด'}
          value={detailFilter}
          options={['ทั้งหมด', ...details]}
          onChange={(value) => {
            setDetailFilter(value);
            setCurrentPage(1);
          }}
        />
        <MockFilter
          label={isCustomerList ? 'ผู้ดูแล' : 'ผู้รับผิดชอบ'}
          value={ownerFilter}
          options={['ทุกผู้รับผิดชอบ', ...owners]}
          onChange={(value) => {
            setOwnerFilter(value);
            setCurrentPage(1);
          }}
        />
        <MockFilter
          label="สถานะ"
          value={statusFilter}
          options={['ทุกสถานะ', ...statuses]}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        />
        <button
          type="button"
          onClick={() => {
            setNotice('');
            setFormOpen(true);
          }}
          className="col-span-2 inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-[#1a58a7] px-4 text-sm font-semibold text-white transition hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7] sm:col-span-1"
        >
          <span className="text-sm leading-none" aria-hidden="true">
            +
          </span>
          {config.action}
        </button>
      </div>

      <div
        className="mt-6 overflow-hidden rounded-xl border border-[#e3e9f0] bg-white"
      >
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
            <thead
              className="bg-[#f7f8fa] text-xs font-semibold text-[#2f3a4d]"
            >
              <tr>
                {tableHeaders.map((column) => (
                  <th
                    key={column}
                    className="whitespace-normal px-[14px] py-3 text-left [overflow-wrap:anywhere]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((item) => (
                <MockTableRow key={item.ref} row={item} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-[#e8ebef] md:hidden">
          {pagedRows.map((item) => (
            <MockMobileRow key={item.ref} row={item} />
          ))}
        </div>
        {filteredRows.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="m-0 text-sm font-semibold text-[#26364b]">ไม่พบรายการ</p>
            <p className="mb-0 mt-1 text-xs text-[#8492a6]">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e3e9f0] px-6 py-5 text-sm text-[#758195]"
        >
          <span>
            แสดง {pagedRows.length} จาก {filteredRows.length} รายการ
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
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                aria-current={currentPage === number ? 'page' : undefined}
                onClick={() => setCurrentPage(number)}
                className={`h-9 min-w-9 rounded border px-1 text-sm ${currentPage === number ? 'border-[#1a58a7] bg-[#1a58a7] font-semibold text-white' : 'border-[#e3e9f0] text-[#758195] hover:bg-[#f7f9fc]'}`}
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

      <div className="mt-3 flex items-center gap-2 pl-1">
        <button
          type="button"
          onClick={() => setNotice('Export เป็นตัวอย่างเพื่อการนำเสนอ ยังไม่เชื่อมข้อมูลจริง')}
          className="inline-flex h-10 items-center gap-1 rounded-md bg-[#1a58a7] px-4 text-sm font-medium text-white hover:bg-[#174a8b]"
        >
          <span aria-hidden="true">⇧</span>Export
        </button>
        <span className="text-xs text-[#9aa4b1]">ข้อมูลจำลอง</span>
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#10243a]/35"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFormOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mock-form-title"
            className="flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#e5ebf2] px-5 py-5">
              <div>
                <span className="text-[11px] font-semibold text-[#357ece]">แบบฟอร์มสาธิต</span>
                <h3 id="mock-form-title" className="mb-0 mt-1 text-lg font-semibold text-[#14243a]">
                  {config.action}
                </h3>
                <p className="mb-0 mt-1 text-xs text-[#718096]">
                  ข้อมูลนี้จะอยู่ในหน้าจอชั่วคราวเท่านั้น
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="ปิด"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#718096] hover:bg-[#f1f4f8]"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              <div className="flex-1 space-y-2 px-5 py-5">
                <label
                  htmlFor="mock-row-title"
                  className="block text-sm font-medium text-[#35465d]"
                >
                  ชื่อรายการตัวอย่าง
                </label>
                <input
                  id="mock-row-title"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder={`ระบุ${config.title}`}
                  className="h-10 w-full rounded-lg border border-[#dce4ed] px-3 text-sm outline-none focus:border-[#5b9ddb] focus:ring-3 focus:ring-[#1a58a7]/10"
                />
                <p className="m-0 text-xs leading-5 text-[#8492a6]">
                  ไม่มีการเชื่อมต่อฐานข้อมูลหรือบันทึกถาวร
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-[#e5ebf2] bg-[#fbfcfe] px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="min-h-10 rounded-lg border border-[#dce4ed] px-4 text-sm text-[#526176] hover:bg-[#f7f9fc]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="min-h-10 rounded-lg bg-[#1a58a7] px-4 text-sm font-semibold text-white hover:bg-[#174a8b]"
                >
                  เพิ่มในตัวอย่าง
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

function MockTableRow({ row }: { row: MockRow }) {
  const [type, detail] = splitSubtitle(row.subtitle);
  const cells = [row.title, type, row.ref, detail || '—', row.owner, row.value, row.status];
  return (
    <tr
      className="border-t border-[#edf0f4] text-sm text-[#7b8795] hover:bg-[#fafbfc]"
    >
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`whitespace-normal px-[14px] py-4 [overflow-wrap:anywhere] ${index === 0 ? 'font-semibold' : ''}`}
          title={cell}
        >
          {cell}
        </td>
      ))}
    </tr>
  );
}

function MockMobileRow({ row }: { row: MockRow }) {
  return (
    <article className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-[#26364b] [overflow-wrap:anywhere]">{row.title}</p>
          <p className="mb-0 mt-1 text-xs text-[#8492a6] [overflow-wrap:anywhere]">
            {row.ref} · {row.subtitle}
          </p>
        </div>
        <StatusPill value={row.status} />
      </div>
      <div className="mt-3 flex justify-between gap-3 text-xs">
        <span className="min-w-0 whitespace-normal text-[#718096] [overflow-wrap:anywhere]">{row.owner}</span>
        <span className="min-w-0 text-right font-medium text-[#35465d] [overflow-wrap:anywhere]">{row.value}</span>
      </div>
    </article>
  );
}

function StatusPill({ value }: { value: string }) {
  const positive =
    /ใช้งานอยู่|พร้อมขาย|อนุมัติแล้ว|จัดส่งครบ|รับครบ|ตรวจแล้ว|สำเร็จ|ปกติ|บันทึกแล้ว|กำหนดแล้ว/.test(
      value,
    );
  const waiting = /รอ|ใกล้หมดอายุ|ติดตาม|กำลัง/.test(value);
  const style = positive
    ? 'bg-[#edf7f1] text-[#347555]'
    : waiting
      ? 'bg-[#fff6e9] text-[#936622]'
      : 'bg-[#f1f4f8] text-[#687589]';
  return (
    <span
      className={`inline-flex max-w-full items-center whitespace-normal rounded-full px-2.5 py-1 text-[10px] font-medium [overflow-wrap:anywhere] ${style}`}
    >
      {value}
    </span>
  );
}

function MockFilter({
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

function splitSubtitle(subtitle: string): [string, string] {
  const [first = '', ...rest] = subtitle.split('·');
  return [first.trim(), rest.join('·').trim()];
}

export function ActivityRow({ item }: { item: MockRow }) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eff5fc] text-xs font-semibold text-[#2465b4]">
          {item.ref.split('-')[0]}
        </span>
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-[#35465d]">{item.title}</p>
          <p className="mb-0 mt-0.5 truncate text-sm text-[#8492a6]">{item.subtitle}</p>
        </div>
      </div>
      <div className="ml-12 flex items-center gap-3 md:ml-0">
        <span className="text-sm text-[#718096]">{item.owner}</span>
        <StatusPill value={item.status} />
      </div>
    </article>
  );
}
