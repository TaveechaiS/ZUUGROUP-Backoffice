'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { moduleFor } from '@/features/records/types';
import { Get } from '@/service/http';
import LoadingComponent from '@/components/ui/loading-component';
import StatusBadge from '@/components/ui/status-badge';
import type { Dashboard, DashboardResponse } from '@/types/api/reports';
export default function Page() {
  const [data, setData] = useState<Dashboard | null>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Get<DashboardResponse>('/api/dashboard', controller.signal)
      .then((r) => {
        setData(r.data);
        setError('');
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [retry]);
  if (!data)
    return (
      <section className="p-6">
        {!error && <LoadingComponent isVisible />}
        {error && (
          <div role="alert">
            {error}
            <button onClick={() => setRetry((n) => n + 1)} className="ml-3 text-blue-700 underline">
              ลองใหม่
            </button>
          </div>
        )}
      </section>
    );
  const dates = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  });
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="m-0 text-xl font-semibold">ภาพรวมระบบ</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['ลูกค้า', data.counts.customers, '/customers'],
          ['สินค้า', data.counts.products, '/products'],
          ['คำสั่งซื้อ', data.counts.orders, '/orders'],
          ['ใบเสนอราคา', data.counts.quotes, '/quotes'],
        ].map(([label, count, href]) => (
          <Link
            key={label}
            href={String(href)}
            className="rounded-xl border border-[#d9e3ee] bg-white p-5"
          >
            <p className="m-0 text-sm text-[#718096]">{label}</p>
            <p className="mb-0 mt-3 text-3xl font-semibold text-[#1a58a7]">{count}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {data.unavailable.map((label) => (
          <div key={label} className="rounded-xl border border-[#d9e3ee] p-5">
            <h2 className="text-sm font-medium">{label}</h2>
            <p className="text-sm text-[#718096]">ยังไม่มีข้อมูล</p>
          </div>
        ))}
      </div>
      <section className="rounded-xl border border-[#d9e3ee] bg-white">
        <h2 className="m-0 border-b border-[#d9e3ee] p-5 text-base font-semibold">เอกสารล่าสุด</h2>
        <div className="divide-y divide-[#e3e9f0]">
          {data.activity.map((row) => (
            <Link
              key={row.module + row.id}
              href={moduleFor(row.module)!.page + '/' + row.id}
              className="flex flex-wrap items-center justify-between gap-3 p-5"
            >
              <div>
                <p className="m-0 text-sm font-medium">
                  {row.code} · {row.name}
                </p>
                <p className="mb-0 mt-1 text-xs text-[#718096]">
                  {dates.format(new Date(row.createdAt))}
                </p>
              </div>
              <StatusBadge value={row.status} />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
