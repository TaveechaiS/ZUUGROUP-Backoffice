'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fieldClass, roles, userPath, type UserRow } from '../user-ui';
import { Update } from '@/service/http';
import SuccessAlertComponent from '@/components/ui/success-alert-component';

export function UserDetailContent({ initialUser, actorId }: { initialUser: UserRow; actorId: string }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [nextPath, setNextPath] = useState('');
  const isSelf = user.id === actorId;

  async function submit(body: Record<string, unknown>, success: string) {
    setBusy(true); setError(''); setMessage(''); setNextPath('');
    try {
      await Update(`/api/users/${user.id}`, body);
      setMessage(success);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'เกิดข้อผิดพลาด');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function editProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const employeeCode = String(data.employeeCode).trim();
    const ok = await submit({ action: 'profile', ...data }, 'แก้ข้อมูลบัญชีแล้ว');
    if (!ok) return;
    if (employeeCode !== user.employeeCode) setNextPath(userPath(employeeCode));
    setUser((current) => ({ ...current, employeeCode, name: String(data.name).trim(), email: String(data.email).trim().toLowerCase(), team: String(data.team).trim() }));
  }

  async function changeRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const roleId = String(new FormData(event.currentTarget).get('roleId'));
    if (await submit({ action: 'role', roleId }, 'เปลี่ยนบทบาทแล้ว')) {
      setUser((current) => ({ ...current, roleId, role: roles.find(([id]) => id === roleId)?.[1] ?? current.role }));
    }
  }

  async function changeStatus() {
    const status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (await submit({ action: 'status', status }, 'เปลี่ยนสถานะแล้ว')) {
      setUser((current) => ({ ...current, status }));
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password') ?? '');
    if (await submit({ action: 'password', password }, 'ตั้งรหัสผ่านใหม่แล้ว')) form.reset();
  }

  async function changeDeletion(event: FormEvent<HTMLFormElement>, action: 'delete' | 'restore') {
    event.preventDefault();
    const reason = String(new FormData(event.currentTarget).get('reason') ?? '').trim();
    if (!reason) { setError('กรุณาระบุเหตุผล'); return; }
    if (action === 'delete' && !window.confirm(`ยืนยันลบผู้ใช้งาน ${user.name} แบบกู้คืนได้?`)) return;
    if (await submit({ action, reason }, action === 'delete' ? 'ลบผู้ใช้งานแล้ว' : 'กู้คืนผู้ใช้งานแล้ว')) {
      setNextPath('/users');
    }
  }

  return <section className="flex flex-1 flex-col gap-5 p-6 pb-7" aria-label={`จัดการผู้ใช้งาน ${user.name}`}>
    <SuccessAlertComponent title={message} isOpen={Boolean(message)} onClose={() => {
      setMessage('');
      if (nextPath) {
        const path = nextPath;
        setNextPath('');
        router.replace(path);
      }
      router.refresh();
    }} />
    <div><Link href="/users" className="text-sm text-[#1a58a7] hover:underline">← กลับไปรายชื่อผู้ใช้งาน</Link><div className="mt-3 flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold text-[#26364b]">{user.name}</h2><span className={`rounded-full px-2.5 py-1 text-xs ${user.deletedAt ? 'bg-[#fff2f0] text-[#aa4537]' : user.status === 'ACTIVE' ? 'bg-[#edf7f1] text-[#347555]' : 'bg-[#f1f3f6] text-[#687589]'}`}>{user.deletedAt ? 'ลบแล้ว' : user.status === 'ACTIVE' ? 'ใช้งานอยู่' : 'ระงับการใช้งาน'}</span></div><p className="mt-1 text-sm text-[#718096]">{user.email} · {user.employeeCode} · เข้าสู่ระบบล่าสุด: {user.lastActive}</p></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {isSelf && !user.deletedAt && <p className="rounded-lg bg-[#eff5fc] p-3 text-sm text-[#174a8b]">บัญชีที่กำลังใช้งานไม่สามารถระงับ ลบ หรือเปลี่ยนบทบาทของตัวเองได้ ให้ Admin อีกบัญชีดำเนินการ</p>}
    {user.deletedAt ? <div className="grid max-w-3xl gap-5">
      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-[#26364b]">ข้อมูลการลบ</h3><dl className="mt-4 grid gap-3 text-sm text-[#526176]"><div><dt className="font-medium">ลบเมื่อ</dt><dd>{user.deletedAt}</dd></div><div><dt className="font-medium">ลบโดย</dt><dd>{user.deletedBy ?? 'ไม่ทราบผู้ลบ'}</dd></div><div><dt className="font-medium">เหตุผล</dt><dd className="whitespace-pre-wrap">{user.deleteReason ?? '—'}</dd></div></dl></div>
      <form onSubmit={(event) => void changeDeletion(event, 'restore')} className="grid gap-4 rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm"><div><h3 className="text-base font-semibold text-[#26364b]">กู้คืนผู้ใช้งาน</h3><p className="mt-1 text-sm text-[#718096]">กู้คืนแล้วบัญชีจะกลับไปใช้สถานะเดิม</p></div><Field label="เหตุผลการกู้คืน"><textarea name="reason" required maxLength={500} rows={3} className="mt-1.5 w-full rounded-lg border border-[#dce4ed] p-3 text-sm text-[#26364b]" /></Field><button disabled={busy} className="justify-self-end rounded bg-[#1a58a7] px-4 py-2 text-sm text-white disabled:opacity-50">กู้คืนผู้ใช้งาน</button></form>
    </div> : <><div className="grid max-w-5xl gap-5 lg:grid-cols-2">
      <form onSubmit={editProfile} className="grid gap-4 rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm">
        <div><h3 className="text-base font-semibold text-[#26364b]">ข้อมูลบัญชี</h3><p className="mt-1 text-xs text-[#718096]">แก้รหัสพนักงานแล้ว URL ของหน้านี้จะเปลี่ยนตาม</p></div>
        <Field label="รหัสพนักงาน"><input key={user.id + user.employeeCode} name="employeeCode" required maxLength={40} defaultValue={user.employeeCode} className={fieldClass} /></Field>
        <Field label="ชื่อ - นามสกุล"><input name="name" required maxLength={160} defaultValue={user.name} className={fieldClass} /></Field>
        <Field label="อีเมล"><input name="email" type="email" required defaultValue={user.email} className={fieldClass} /></Field>
        <Field label="ทีม / เขต"><input name="team" defaultValue={user.team} className={fieldClass} /></Field>
        <button disabled={busy} className="justify-self-end rounded bg-[#1a58a7] px-4 py-2 text-sm text-white disabled:opacity-50">บันทึกข้อมูล</button>
      </form>
      <div className="grid content-start gap-5">
        <form onSubmit={changeRole} className="grid gap-4 rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-[#26364b]">บทบาทและสิทธิ์</h3><Field label="บทบาท"><select key={user.roleId} name="roleId" defaultValue={user.roleId ?? ''} required disabled={isSelf} className={`${fieldClass} disabled:opacity-50`}>{roles.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field><button disabled={busy || isSelf} className="justify-self-end rounded bg-[#1a58a7] px-4 py-2 text-sm text-white disabled:opacity-50">บันทึกบทบาท</button></form>
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-[#26364b]">สถานะบัญชี</h3><p className="mt-2 text-sm text-[#718096]">{user.status === 'ACTIVE' ? 'ผู้ใช้นี้เข้าสู่ระบบได้' : 'ผู้ใช้นี้ถูกระงับการเข้าถึง'}</p><button type="button" disabled={busy || isSelf} onClick={() => void changeStatus()} className="mt-4 rounded border border-[#dce4ed] px-4 py-2 text-sm text-[#344256] disabled:opacity-50">{user.status === 'ACTIVE' ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}</button></div>
        <form onSubmit={resetPassword} className="grid gap-4 rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-[#26364b]">ตั้งรหัสผ่านใหม่</h3><Field label="รหัสผ่านใหม่ (ขั้นต่ำ 8 ตัวอักษร)"><input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldClass} /></Field><p className="text-xs text-[#718096]">ระบบไม่ส่งอีเมลหรือลิงก์ แจ้งรหัสผ่านผ่านช่องทางส่วนตัวที่ยืนยันผู้รับแล้ว</p><button disabled={busy} className="justify-self-end rounded bg-[#1a58a7] px-4 py-2 text-sm text-white disabled:opacity-50">ตั้งรหัสใหม่</button></form>
      </div>
    </div>
    <form onSubmit={(event) => void changeDeletion(event, 'delete')} className="grid max-w-5xl gap-4 rounded-xl border border-[#f2d5d1] bg-white p-6 shadow-sm"><div><h3 className="text-base font-semibold text-[#a33c32]">ลบผู้ใช้งาน</h3><p className="mt-1 text-sm text-[#718096]">ซ่อนจากรายชื่อปกติและปิดการเข้าถึง บัญชียังกู้คืนได้โดย Admin</p></div><Field label="เหตุผลการลบ"><textarea name="reason" required maxLength={500} rows={3} disabled={isSelf} className="mt-1.5 w-full rounded-lg border border-[#dce4ed] p-3 text-sm text-[#26364b] disabled:opacity-50" /></Field><button disabled={busy || isSelf} className="justify-self-end rounded border border-[#d48b84] px-4 py-2 text-sm font-medium text-[#a33c32] disabled:opacity-50">ลบผู้ใช้งาน</button></form></>}
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-medium text-[#35465d]">{label}{children}</label>;
}
