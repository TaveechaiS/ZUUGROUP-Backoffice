'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  PRESENTATION_USERS,
  ROLES,
  TABS,
  type Role,
  type StatusTab,
  type UserRow,
  type UserStatus,
} from './data';

export function UsersPageContent() {
  const [users, setUsers] = useState(PRESENTATION_USERS);
  const [activeTab, setActiveTab] = useState<StatusTab>('ทั้งหมด');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ทุกบทบาท');
  const [teamFilter, setTeamFilter] = useState('ทุกทีม / เขต');
  const [lastActiveFilter, setLastActiveFilter] = useState('ทั้งหมด');
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('th');
    return users.filter((user) => {
      const matchesTab = activeTab === 'ทั้งหมด' || user.status === activeTab;
      const matchesRole = roleFilter === 'ทุกบทบาท' || user.role === roleFilter;
      const matchesTeam = teamFilter === 'ทุกทีม / เขต' || user.team === teamFilter;
      const matchesLastActive = lastActiveFilter === 'ทั้งหมด' || user.lastActive === lastActiveFilter;
      const matchesQuery =
        !normalizedQuery ||
        `${user.name} ${user.email} ${user.id}`.toLocaleLowerCase('th').includes(normalizedQuery);
      return matchesTab && matchesRole && matchesTeam && matchesLastActive && matchesQuery;
    });
  }, [activeTab, lastActiveFilter, query, roleFilter, teamFilter, users]);

  function closeForm() {
    setFormOpen(false);
    setName('');
    setEmail('');
    setRole('');
    setEmployeeCode('');
    setInitialPassword('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!role) return;

    const newUser: UserRow = {
      id: employeeCode.trim() || `USR-${String(users.length + 1).padStart(3, '0')}`,
      name: name.trim(),
      email: email.trim(),
      role,
      team: 'ยังไม่ระบุทีม',
      status: 'ใช้งานอยู่',
      lastActive: 'ยังไม่เคยเข้าใช้',
    };
    setUsers((current) => [newUser, ...current]);
    setActiveTab('ทั้งหมด');
    setRoleFilter('ทุกบทบาท');
    setQuery('');
    setTeamFilter('ทุกทีม / เขต');
    setLastActiveFilter('ทั้งหมด');
    setCurrentPage(1);
    setNotice(`เพิ่ม ${newUser.name} ในตัวอย่างแล้ว ข้อมูลนี้จะหายเมื่อรีเฟรชหน้า`);
    closeForm();
  }

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(visibleUsers.length / pageSize));
  const pagedUsers = visibleUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="flex flex-1 flex-col gap-0 p-6 pb-7" aria-label="จัดการผู้ใช้งาน ข้อมูลจำลอง">
      {notice && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#b6d5f0] bg-[#eff5fc] px-4 py-3 text-sm text-[#174a8b]">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="font-semibold underline underline-offset-2">ปิด</button>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-x-4 border-b border-[#e4e9f0]" role="tablist" aria-label="กรองสถานะผู้ใช้งาน">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`-mb-px min-h-10 border-b-2 px-1 pb-4 text-sm transition ${activeTab === tab ? 'border-[#1a58a7] font-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 items-end gap-5 rounded-xl border border-[#e4e9f0] bg-[#f8f9fb] p-6 shadow-xs sm:grid-cols-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]">
        <label className="relative col-span-2 min-w-0 xl:col-span-1">
          <span className="mb-2 block text-xs leading-4 text-[#344256]">ค้นหา</span>
          <svg className="pointer-events-none absolute bottom-3 left-2 h-3 w-3 fill-none stroke-[#8b98a9] stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.4 4.4" />
          </svg>
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }}
            placeholder="ค้นหา..."
            className="h-10 w-full min-w-0 rounded-md border border-[#dfe5ee] bg-white pl-8 pr-3 text-sm text-[#344256] outline-none placeholder:text-[#9ba7b6] focus:border-[#1a58a7]"
          />
        </label>
        <label className="min-w-0 text-xs text-[#344256]">บทบาท
          <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setCurrentPage(1); }} className="mt-2 h-10 w-full rounded-md border border-[#dfe5ee] bg-white px-3 text-sm text-[#6f7a8b] outline-none focus:border-[#1a58a7]">
            <option>ทุกบทบาท</option>
            {ROLES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs text-[#344256]">ทีม / เขต
          <select value={teamFilter} onChange={(event) => { setTeamFilter(event.target.value); setCurrentPage(1); }} className="mt-2 h-10 w-full rounded-md border border-[#dfe5ee] bg-white px-3 text-sm text-[#6f7a8b] outline-none focus:border-[#1a58a7]">
            <option>ทุกทีม / เขต</option>
            {[...new Set(users.map((user) => user.team))].map((team) => <option key={team}>{team}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs text-[#344256]">เข้าระบบล่าสุด
          <select value={lastActiveFilter} onChange={(event) => { setLastActiveFilter(event.target.value); setCurrentPage(1); }} className="mt-2 h-10 w-full rounded-md border border-[#dfe5ee] bg-white px-3 text-sm text-[#6f7a8b] outline-none focus:border-[#1a58a7]">
            <option>ทั้งหมด</option>
            {[...new Set(users.map((user) => user.lastActive))].map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-xs text-[#344256]">สถานะ
          <select value={activeTab} onChange={(event) => { setActiveTab(event.target.value as StatusTab); setCurrentPage(1); }} className="mt-2 h-10 w-full rounded-md border border-[#dfe5ee] bg-white px-3 text-sm text-[#6f7a8b] outline-none focus:border-[#1a58a7]">
            {TABS.map((tab) => <option key={tab}>{tab}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => { setNotice(''); setFormOpen(true); }} className="col-span-2 inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-md bg-[#1a58a7] px-4 text-sm font-semibold text-white transition hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7] sm:col-span-1">
          <span className="text-sm leading-none" aria-hidden="true">+</span>เพิ่มผู้ใช้งาน
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e3e9f0] bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
            <thead className="bg-[#f7f8fa] text-xs font-semibold text-[#2f3a4d]">
              <tr>
                {['ชื่อผู้ใช้งาน', 'อีเมล', 'บทบาท', 'ทีม / เขต', 'เข้าสู่ระบบล่าสุด', 'สถานะ', 'รหัสผู้ใช้'].map((label) => <th key={label} className="whitespace-normal px-[14px] py-3 [overflow-wrap:anywhere]">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => <UserTableRow key={user.id} user={user} />)}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-[#e8ebef] md:hidden">
          {pagedUsers.map((user) => <UserMobileCard key={user.id} user={user} />)}
        </div>

        {visibleUsers.length === 0 && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#eff5fc] text-lg text-[#357ece]" aria-hidden="true">⌕</div>
            <p className="mb-1 mt-3 text-sm font-semibold text-[#26364b]">ไม่พบผู้ใช้งาน</p>
            <p className="m-0 text-xs text-[#8492a6]">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e3e9f0] px-6 py-5 text-sm text-[#758195]">
          <span>แสดง {pagedUsers.length} จาก {visibleUsers.length} รายการ</span>
          <nav className="flex items-center gap-1" aria-label="เปลี่ยนหน้ารายชื่อผู้ใช้งาน">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))} className="h-9 rounded border border-[#e3e9f0] px-3 disabled:cursor-default disabled:text-[#aab3bf]">‹ ก่อนหน้า</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-current={currentPage === number ? 'page' : undefined} onClick={() => setCurrentPage(number)} className={`h-9 min-w-9 rounded border px-1 text-sm ${currentPage === number ? 'border-[#1a58a7] bg-[#1a58a7] font-semibold text-white' : 'border-[#e3e9f0] text-[#758195] hover:bg-[#f7f9fc]'}`}>{number}</button>)}
            <button type="button" disabled={currentPage >= pageCount} onClick={() => setCurrentPage((value) => Math.min(pageCount, value + 1))} className="h-9 rounded border border-[#e3e9f0] px-3 disabled:cursor-default disabled:text-[#aab3bf]">ถัดไป ›</button>
          </nav>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 pl-1"><button type="button" onClick={() => setNotice('Export เป็นตัวอย่างสำหรับการนำเสนอเท่านั้น')} className="inline-flex h-10 items-center gap-1 rounded-md bg-[#1a58a7] px-4 text-sm font-medium text-white hover:bg-[#174a8b]"><span aria-hidden="true">⇧</span>Export</button><span className="text-xs text-[#9aa4b1]">ข้อมูลจำลอง</span></div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#10243a]/35" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="flex h-full w-full max-w-[520px] flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#e5ebf2] px-5 py-5 md:px-7">
              <div>
                <span className="text-[11px] font-semibold tracking-wide text-[#357ece]">แบบฟอร์มสาธิต</span>
                <h3 id="user-form-title" className="mb-0 mt-1 text-lg font-semibold text-[#14243a]">เพิ่มผู้ใช้งาน</h3>
                <p className="mb-0 mt-1 text-xs leading-5 text-[#718096]">ข้อมูลจะอยู่ในหน้านี้ชั่วคราวเท่านั้น</p>
              </div>
              <button type="button" onClick={closeForm} aria-label="ปิดแบบฟอร์ม" className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-[#718096] hover:bg-[#f1f4f8]">×</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              <div className="flex-1 space-y-4 px-5 py-5 md:px-7 md:py-6">
                <MockField label="รหัสพนักงาน" hint="ตัวอย่าง: USR-009">
                  <input value={employeeCode} onChange={(event) => setEmployeeCode(event.target.value)} placeholder="เว้นว่างเพื่อสร้างรหัสตัวอย่าง" className={inputClass} />
                </MockField>
                <MockField label="ชื่อ - นามสกุล">
                  <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="ระบุชื่อผู้ใช้งาน" className={inputClass} />
                </MockField>
                <MockField label="อีเมล">
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.test" className={inputClass} />
                </MockField>
                <MockField label="ตำแหน่ง / Role" hint="ผู้ใช้งานหนึ่งคนเลือกได้หนึ่งบทบาท">
                  <select required value={role} onChange={(event) => setRole(event.target.value as Role | '')} className={inputClass}>
                    <option value="" disabled>เลือกบทบาท</option>
                    {ROLES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </MockField>
                <MockField label="รหัสผ่านครั้งแรก" hint="ตัวอย่างเพื่อสาธิตเท่านั้น ระบบจะไม่บันทึกค่านี้">
                  <input required type="password" autoComplete="new-password" value={initialPassword} onChange={(event) => setInitialPassword(event.target.value)} placeholder="กำหนดโดย Admin" className={inputClass} />
                </MockField>
                <div className="rounded-lg border border-[#e6edf5] bg-[#f8fafc] px-3.5 py-3 text-xs leading-5 text-[#64748b]">
                  หน้าจอนี้จำลองการเพิ่มบัญชีเพื่อประกอบการนำเสนอเท่านั้น เมื่อรีเฟรชหน้า ข้อมูลตัวอย่างที่เพิ่มจะหายไป
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-[#e5ebf2] bg-[#fbfcfe] px-5 py-4 sm:flex-row sm:justify-end md:px-7">
                <button type="button" onClick={closeForm} className="min-h-10 rounded-lg border border-[#dce4ed] bg-white px-4 text-sm font-medium text-[#526176] hover:bg-[#f7f9fc]">ยกเลิก</button>
                <button type="submit" className="min-h-10 rounded-lg bg-[#1a58a7] px-4 text-sm font-semibold text-white hover:bg-[#174a8b]">เพิ่มในตัวอย่าง</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

const inputClass = 'h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-sm text-[#26364b] outline-none placeholder:text-[#a0acba] focus:border-[#5b9ddb] focus:ring-3 focus:ring-[#1a58a7]/10';

function MockField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-[#35465d]">{label}</span>
      {children}
      {hint && <span className="block text-xs leading-5 text-[#8492a6]">{hint}</span>}
    </label>
  );
}

function UserTableRow({ user }: { user: UserRow }) {
  const cells = [user.name, user.email, user.role, user.team, user.lastActive, user.status, user.id];
  return <tr className="border-t border-[#edf0f4] text-sm text-[#7b8795] hover:bg-[#fafbfc]">{cells.map((cell, index) => <td key={index} className={`whitespace-normal px-[14px] py-4 [overflow-wrap:anywhere] ${index === 0 ? 'font-semibold' : ''}`} title={cell}>{cell}</td>)}</tr>;
}

function UserMobileCard({ user }: { user: UserRow }) {
  return (
    <article className="px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar name={user.name} />
          <div className="min-w-0">
            <p className="m-0 whitespace-normal text-sm font-semibold text-[#26364b] [overflow-wrap:anywhere]">{user.name}</p>
            <p className="mb-0 mt-0.5 break-all text-xs text-[#8492a6]">{user.email}</p>
          </div>
        </div>
        <StatusTag status={user.status} />
      </div>
      <div className="ml-[52px] mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <RoleTag role={user.role} />
        <span className="text-xs text-[#718096] [overflow-wrap:anywhere]">{user.team}</span>
        <span className="w-full text-[11px] text-[#9aa7b8] [overflow-wrap:anywhere]">{user.id} · เข้าใช้ล่าสุด {user.lastActive}</span>
      </div>
    </article>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('');
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2fb] text-xs font-semibold text-[#2465b4]">{initials}</span>;
}

function RoleTag({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    Admin: 'bg-[#eff5fc] text-[#174a8b]',
    Sales: 'bg-[#eef8f6] text-[#25735f]',
    Manager: 'bg-[#f4f0fb] text-[#7153a5]',
    'Accounting & CFO': 'bg-[#fff6e9] text-[#936622]',
  };
  return <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium ${styles[role]}`}>{role}</span>;
}

function StatusTag({ status }: { status: UserStatus }) {
  const active = status === 'ใช้งานอยู่';
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${active ? 'bg-[#edf7f1] text-[#347555]' : 'bg-[#f1f3f6] text-[#687589]'}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#52a776]' : 'bg-[#97a2b1]'}`} />{status}
  </span>;
}
