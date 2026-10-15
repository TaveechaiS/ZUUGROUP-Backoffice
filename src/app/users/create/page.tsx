'use client';
import UserTerritoryPicker from '@/components/ui/user-territory-picker';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { roles, userPath } from '../user-ui';
import { Post } from '@/service/http';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import { inputClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/form-classes';
import { Section } from '@/components/sales/document-ui';

export default function Page() {
  const router = useRouter();
  const mutationLock = useRef(false);
  const [roleId, setRoleId] = useState<string>(roles[0][0]);
  const [territoryId, setTerritoryId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createdPath, setCreatedPath] = useState('');

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutationLock.current || createdPath) return;
    mutationLock.current = true;
    setBusy(true);
    setError('');
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      const result = await Post<{ employeeCode: string }>('/api/users', body);
      if (typeof result.employeeCode !== 'string')
        throw new Error('สร้างบัญชีแล้ว แต่ไม่ได้รับรหัสพนักงาน กรุณากลับไปตรวจรายชื่อ');
      setCreatedPath(userPath(result.employeeCode));
    } catch (caught) {
      mutationLock.current = false;
      setError(caught instanceof Error ? caught.message : 'เกิดข้อผิดพลาด');
      setBusy(false);
    }
  }

  return (
    <section className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8" aria-label="เพิ่มผู้ใช้งาน">
      <SuccessAlertComponent
        title="สร้างผู้ใช้งานแล้ว"
        isOpen={Boolean(createdPath)}
        onClose={() => {
          if (!createdPath) return;
          const path = createdPath;
          setCreatedPath('');
          router.push(path);
          router.refresh();
        }}
      />
      <div className="mb-6">
        <Link href="/users" className="text-sm text-[#1a58a7] hover:underline">
          ← กลับไปรายชื่อผู้ใช้งาน
        </Link>
        <h2 className="mt-3 text-lg poppins-semibold text-[#344256]">เพิ่มผู้ใช้งาน</h2>
        <p className="mt-1 text-sm text-[#718096]">กำหนดบัญชี บทบาท และรหัสผ่านครั้งแรก</p>
      </div>
      <form onSubmit={create}>
        <fieldset disabled={busy || Boolean(createdPath)} className="min-w-0 border-0 p-0">
          <Section title="ข้อมูลบัญชี" open>
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="ชื่อ - นามสกุล">
                  <input name="name" required maxLength={160} className={`${inputClass} mt-2`} />
                </Field>
                <Field label="อีเมล">
                  <input name="email" type="email" required className={`${inputClass} mt-2`} />
                </Field>
                <Field label="ทีม">
                  <input name="team" maxLength={120} className={`${inputClass} mt-2`} />
                </Field>
                <Field label="บทบาท">
                  <select
                    name="roleId"
                    required
                    className={`${inputClass} mt-2`}
                    value={roleId}
                    onChange={(event) => {
                      setRoleId(event.target.value);
                      setTerritoryId('');
                    }}
                  >
                    {roles.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {(roleId === 'SALES' || roleId === 'MANAGER') && (
                <UserTerritoryPicker value={territoryId} onChange={setTerritoryId} />
              )}
              <Field label="รหัสผ่านครั้งแรก (ขั้นต่ำ 8 ตัวอักษร)">
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClass} mt-2`}
                />
              </Field>
              <p className="text-xs leading-5 text-[#718096]">
                ระบบสร้างรหัสพนักงานให้อัตโนมัติและแก้ได้ภายหลัง ระบบไม่ส่งอีเมลหรือลิงก์
                แจ้งรหัสผ่านผ่านช่องทางส่วนตัวที่ยืนยันผู้รับแล้ว
              </p>
            </div>
          </Section>
        </fieldset>
        {error && (
          <p role="alert" className="mt-6 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
          <Link href="/users" className={secondaryButtonClass}>
            ยกเลิก
          </Link>
          <button disabled={busy} className={primaryButtonClass}>
            {busy ? 'กำลังสร้าง...' : 'สร้างบัญชี'}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="text-sm poppins-medium text-[#35465d]">
      {label}
      {children}
    </label>
  );
}
