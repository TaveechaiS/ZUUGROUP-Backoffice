'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { MockModuleConfig, MockRow } from '@/features/mock/mock-config';
import { readMockDrafts } from '@/features/mock/mock-create-storage';

type FieldLabels = { subtitle: string; owner: string; value: string };

export function MockDetailPage({ href, refCode, config, labels }: {
  href: '/customers' | '/products';
  refCode: string;
  config: MockModuleConfig;
  labels: FieldLabels;
}) {
  const [drafts, setDrafts] = useState<MockRow[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDrafts(readMockDrafts(href));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [href]);

  const row = [...drafts, ...config.rows].find((item) => item.ref === refCode);
  return <main className="flex flex-1 flex-col gap-6 p-6 pb-10 text-[#26364b]">
    <nav aria-label="เส้นทางกลับ" className="flex flex-wrap items-center gap-2 text-sm text-[#718096]">
      <Link href={href} className="font-medium text-[#1a58a7] hover:underline">{config.title}</Link>
      <span aria-hidden="true">/</span>
      <span>รายละเอียดตัวอย่าง</span>
    </nav>

    {!ready ? <p role="status" className="text-sm text-[#718096]">กำลังเปิดข้อมูลตัวอย่าง...</p> : !row ? (
      <section className="max-w-2xl border-t border-[#d9e3ee] pt-6">
        <h1 className="m-0 text-xl font-semibold">ไม่พบรายการตัวอย่าง</h1>
        <p className="mt-2 text-sm text-[#718096]">รายการอาจอยู่ในข้อมูลชั่วคราวของแท็บอื่น หรือรหัสนี้ไม่มีในตัวอย่าง</p>
        <Link href={href} className="mt-5 inline-flex rounded-md bg-[#1a58a7] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#174a8b]">กลับไปรายการ</Link>
      </section>
    ) : <>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#d9e3ee] pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold tracking-wide text-[#1a58a7]">ข้อมูลจำลอง · สำหรับตรวจดีไซน์</p>
          <h1 className="m-0 text-2xl font-semibold leading-tight [overflow-wrap:anywhere]">{row.title}</h1>
          <p className="mb-0 mt-2 text-sm text-[#718096]">รหัส {row.ref}</p>
        </div>
        <span className="rounded-full bg-[#eff5fc] px-3 py-1.5 text-xs font-medium text-[#174a8b]">{row.status}</span>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <section aria-labelledby="mock-fields" className="min-w-0">
          <h2 id="mock-fields" className="mb-4 mt-0 text-base font-semibold">ข้อมูลรายการ</h2>
          <dl className="m-0 grid gap-x-8 border-y border-[#e3e9f0] sm:grid-cols-2">
            {[
              ['ชื่อรายการ', row.title],
              ['รหัส', row.ref],
              [labels.subtitle, row.subtitle],
              [labels.owner, row.owner],
              [labels.value, row.value],
              ['สถานะ', row.status],
            ].map(([label, value]) => <div key={label} className="min-w-0 border-b border-[#edf0f4] py-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
              <dt className="text-xs text-[#8492a6]">{label}</dt>
              <dd className="mb-0 mt-1 text-sm font-medium leading-6 text-[#35465d] [overflow-wrap:anywhere]">{value}</dd>
            </div>)}
          </dl>
        </section>

        <aside className="border-t border-[#d9e3ee] pt-4 lg:mt-0" aria-label="หมายเหตุของตัวอย่าง">
          <h2 className="mb-2 mt-0 text-sm font-semibold">เกี่ยวกับหน้าตัวอย่าง</h2>
          <p className="m-0 text-sm leading-6 text-[#718096]">หน้านี้แสดงเฉพาะข้อมูลจากรายการ Mock เพื่อทดลองลำดับข้อมูลและพื้นที่อ่าน รายละเอียดจริงจะกำหนดเมื่อได้รับข้อมูลของโมดูล</p>
          <Link href="/design-preview" className="mt-5 inline-flex text-sm font-medium text-[#1a58a7] hover:underline">ดูภาพรวมหน้าระบบ →</Link>
        </aside>
      </div>

      <div className="border-t border-[#e3e9f0] pt-5">
        <Link href={href} className="inline-flex rounded-md border border-[#d9e3ee] px-4 py-2.5 text-sm font-medium text-[#35465d] hover:bg-[#f7f9fc]">← กลับไปรายการ</Link>
      </div>
    </>}
  </main>;
}
