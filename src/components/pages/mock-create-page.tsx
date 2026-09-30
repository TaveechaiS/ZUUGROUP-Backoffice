'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addMockDraft } from '@/features/mock/mock-create-storage';

export function MockCreatePage({ href, title, action }: { href: string; title: string; action: string }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      addMockDraft(href, name.trim());
      router.push(href);
    } catch {
      setError('เพิ่มรายการตัวอย่างไม่สำเร็จ กรุณาตรวจว่าเบราว์เซอร์อนุญาตข้อมูลชั่วคราวในแท็บนี้');
    }
  }

  return <section className="flex flex-1 flex-col gap-5 p-6 pb-7" aria-label={action}>
    <div><Link href={href} className="text-sm text-[#1a58a7] hover:underline">← กลับไป{title}</Link><h2 className="mt-3 text-xl font-semibold text-[#26364b]">{action}</h2><p className="mt-1 text-sm text-[#718096]">แบบฟอร์มตัวอย่างสำหรับดูรูปแบบหน้า Create</p></div>
    <form onSubmit={submit} className="grid w-full max-w-2xl gap-5 rounded-xl border border-[#e3e9f0] bg-white p-6 shadow-sm">
      <label className="text-sm font-medium text-[#35465d]">ชื่อรายการตัวอย่าง<input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder={`ระบุ${title}`} className="mt-1.5 h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-sm outline-none focus:border-[#1a58a7]" /></label>
      <p className="text-xs leading-5 text-[#8492a6]">ข้อมูลนี้แสดงชั่วคราวในแท็บนี้ ไม่บันทึกลงฐานข้อมูลจริง</p>
      {error && <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-3 border-t pt-5"><Link href={href} className="rounded border px-4 py-2 text-sm text-[#344256]">ยกเลิก</Link><button className="rounded bg-[#1a58a7] px-4 py-2 text-sm text-white">เพิ่มในตัวอย่าง</button></div>
    </form>
  </section>;
}
