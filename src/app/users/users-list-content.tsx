'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { fieldClass, roles, userPath, type UserRow } from './user-ui';

export function UsersListContent({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [view, setView] = useState<'CURRENT' | 'DELETED'>('CURRENT');
  const [page, setPage] = useState(1);
  const visible = useMemo(() => users.filter((user) =>
    (view === 'DELETED' ? !!user.deletedAt : !user.deletedAt) &&
    (role === 'ALL' || user.roleId === role) && (status === 'ALL' || user.status === status) &&
    `${user.name} ${user.email} ${user.employeeCode}`.toLocaleLowerCase('th').includes(query.trim().toLocaleLowerCase('th')),
  ), [users, role, status, view, query]);
  const pages = Math.max(1, Math.ceil(visible.length / 10));
  const rows = visible.slice((page - 1) * 10, page * 10);

  function exportCsv() {
    const safe = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value).replaceAll('"', '""')}"`;
    const lines = [['รหัสพนักงาน', 'ชื่อ', 'อีเมล', 'บทบาท', 'ทีม / เขต', 'สถานะ', 'ลบเมื่อ', 'ลบโดย', 'เหตุผลการลบ'],
      ...visible.map((user) => [user.employeeCode, user.name, user.email, user.role, user.team,
        user.deletedAt ? 'ลบแล้ว' : user.status === 'ACTIVE' ? 'ใช้งานอยู่' : 'ระงับการใช้งาน',
        user.deletedAt ?? '', user.deletedBy ?? '', user.deleteReason ?? ''])];
    const blob = new Blob(['\uFEFF', lines.map((line) => line.map(safe).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'zuugroup-users.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return <section className="flex flex-1 flex-col gap-5 p-6 pb-7" aria-label="จัดการผู้ใช้งาน">
    <div className="flex flex-wrap items-center gap-x-4 border-b border-[#e4e9f0]" role="tablist" aria-label="สถานะรายการผู้ใช้งาน">
      {([['CURRENT', 'รายการปกติ'], ['DELETED', 'ลบแล้ว']] as const).map(([id, label]) => <button
        key={id}
        type="button"
        role="tab"
        aria-selected={view === id}
        onClick={() => { setView(id); setPage(1); }}
        className={`-mb-px min-h-10 border-b-2 px-1 pb-4 text-sm transition ${view === id ? 'border-[#1a58a7] font-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7]'}`}
      >{label}</button>)}
    </div>
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#e4e9f0] bg-[#f8f9fb] p-5">
      <label className="min-w-48 flex-1 text-xs text-[#344256]">ค้นหา<input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="ชื่อ อีเมล หรือรหัสพนักงาน" className={fieldClass} /></label>
      <label className="min-w-40 text-xs text-[#344256]">บทบาท<select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className={fieldClass}><option value="ALL">ทุกบทบาท</option>{roles.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
      <label className="min-w-40 text-xs text-[#344256]">สถานะ<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className={fieldClass}><option value="ALL">ทั้งหมด</option><option value="ACTIVE">ใช้งานอยู่</option><option value="SUSPENDED">ระงับการใช้งาน</option></select></label>
      <Link href="/users/create" className="flex h-10 items-center rounded-lg bg-[#1a58a7] px-4 text-sm font-semibold text-white">+ เพิ่มผู้ใช้งาน</Link>
    </div>
    <div className="overflow-x-auto rounded-xl border border-[#e3e9f0] bg-white"><table className="w-full min-w-[900px] border-collapse text-left">
      <thead className="bg-[#f7f8fa] text-xs font-semibold text-[#2f3a4d]"><tr>{['ผู้ใช้งาน', 'บทบาท', 'ทีม / เขต', view === 'DELETED' ? 'ข้อมูลการลบ' : 'เข้าสู่ระบบล่าสุด', 'สถานะ', 'จัดการ'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead>
      <tbody>{rows.map((user) => <tr key={user.id} className="border-t border-[#edf0f4] text-sm text-[#526176]">
        <td className="px-4 py-4"><Link href={userPath(user.employeeCode)} className="block font-semibold text-[#1a58a7] hover:underline">{user.name}</Link><span className="block break-all text-xs">{user.email}</span><span className="text-xs">{user.employeeCode}</span></td>
        <td className="px-4 py-4">{user.role}</td>
        <td className="px-4 py-4">{user.team || '—'}</td>
        <td className="px-4 py-4 text-xs">{user.deletedAt ? <><span className="block">{user.deletedAt}</span><span className="block">โดย {user.deletedBy ?? 'ไม่ทราบผู้ลบ'}</span><span className="block">เหตุผล: {user.deleteReason ?? '—'}</span></> : user.lastActive}</td>
        <td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${user.deletedAt ? 'bg-[#fff2f0] text-[#aa4537]' : user.status === 'ACTIVE' ? 'bg-[#edf7f1] text-[#347555]' : 'bg-[#f1f3f6] text-[#687589]'}`}>{user.deletedAt ? 'ลบแล้ว' : user.status === 'ACTIVE' ? 'ใช้งานอยู่' : 'ระงับการใช้งาน'}</span></td>
        <td className="px-4 py-4"><Link href={userPath(user.employeeCode)} className="rounded border px-3 py-1.5 text-xs text-[#1a58a7] hover:bg-[#eff5fc]">{user.deletedAt ? 'ดู / กู้คืน' : 'ดู / จัดการ'}</Link></td>
      </tr>)}</tbody>
    </table>{visible.length === 0 && <p className="py-12 text-center text-sm text-[#8492a6]">{view === 'DELETED' ? 'ไม่มีผู้ใช้งานที่ลบแล้ว' : 'ไม่พบผู้ใช้งาน'}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-sm text-[#758195]"><span>แสดง {rows.length} จาก {visible.length} รายการ</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">ก่อนหน้า</button><span>{page} / {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">ถัดไป</button></div></div>
    </div>
    <button type="button" onClick={exportCsv} className="self-start rounded-lg bg-[#1a58a7] px-4 py-2.5 text-sm text-white">ส่งออก CSV</button>
  </section>;
}
