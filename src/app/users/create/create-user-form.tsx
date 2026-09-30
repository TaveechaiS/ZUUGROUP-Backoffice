'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fieldClass, roles, userPath } from '../user-ui';

export function CreateUserForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await fetch('/api/users', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'สร้างบัญชีไม่สำเร็จ');
      if (typeof result.employeeCode !== 'string') throw new Error('สร้างบัญชีแล้ว แต่ไม่ได้รับรหัสพนักงาน กรุณากลับไปตรวจรายชื่อ');
      router.push(userPath(result.employeeCode));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'เกิดข้อผิดพลาด');
      setBusy(false);
    }
  }

  return <section className="flex flex-1 flex-col gap-5 p-6 pb-7" aria-label="เพิ่มผู้ใช้งาน">
    <div><Link href="/users" className="text-sm text-[#1a58a7] hover:underline">← กลับไปรายชื่อผู้ใช้งาน</Link><h2 className="mt-3 text-xl font-semibold text-[#26364b]">เพิ่มผู้ใช้งาน</h2><p className="mt-1 text-sm text-[#718096]">กำหนดบัญชี บทบาท และรหัสผ่านครั้งแรก</p></div>
    <form onSubmit={create} className="grid w-full max-w-2xl gap-5 rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="ชื่อ - นามสกุล"><input name="name" required maxLength={160} className={fieldClass} /></Field>
        <Field label="อีเมล"><input name="email" type="email" required className={fieldClass} /></Field>
        <Field label="ทีม / เขต"><input name="team" maxLength={120} className={fieldClass} /></Field>
        <Field label="บทบาท"><select name="roleId" required className={fieldClass}>{roles.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field>
      </div>
      <Field label="รหัสผ่านครั้งแรก (ขั้นต่ำ 8 ตัวอักษร)"><input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldClass} /></Field>
      <p className="text-xs leading-5 text-[#718096]">ระบบสร้างรหัสพนักงานให้อัตโนมัติและแก้ได้ภายหลัง ระบบไม่ส่งอีเมลหรือลิงก์ แจ้งรหัสผ่านผ่านช่องทางส่วนตัวที่ยืนยันผู้รับแล้ว</p>
      {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3 border-t pt-5"><Link href="/users" className="rounded border px-4 py-2 text-sm text-[#344256]">ยกเลิก</Link><button disabled={busy} className="rounded bg-[#1a58a7] px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'กำลังสร้าง...' : 'สร้างบัญชี'}</button></div>
    </form>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm font-medium text-[#35465d]">{label}{children}</label>;
}
