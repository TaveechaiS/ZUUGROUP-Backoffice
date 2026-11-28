'use client';

import { useEffect, useState } from 'react';
import { Get } from '@/service/http';
import type { ProductHistoryEntry } from '@/types/api/product-full';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ChevronDown from '@/components/ui/chevron-down';

type Entries = { data: ProductHistoryEntry[] };
function dateTime(value: string) {
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
}

export default function ProductRecordHistory({
  productId,
  createdAt,
  revision,
}: {
  productId: string;
  createdAt: string;
  revision: number;
}) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState<{
    first?: ProductHistoryEntry;
    latest?: ProductHistoryEntry;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let alive = true;
    const base = `/api/products/${productId}/history?limit=1&offset=0&sortBy=occurredAt`;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [first, latest] = await Promise.all([
          Get<Entries>(`${base}&sortDirection=asc`, controller.signal),
          Get<Entries>(`${base}&sortDirection=desc`, controller.signal),
        ]);
        if (alive) setResponse({ first: first.data[0], latest: latest.data[0] });
      } catch (caught) {
        if (alive)
          setError(caught instanceof Error ? caught.message : 'โหลดประวัติข้อมูลสินค้าไม่สำเร็จ');
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [open, productId, revision, retry]);

  const creator = response?.first?.action === 'PRODUCT_CREATED_FULL' ? response.first : undefined;
  const editor = response?.latest?.action === 'PRODUCT_UPDATED_FULL' ? response.latest : undefined;
  return (
    <details
      className="group rounded-lg border border-[#d9e3ee] p-4 md:p-6"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base poppins-semibold text-[#1a58a7] [&::-webkit-details-marker]:hidden">
        ประวัติข้อมูลสินค้า
        <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      {open && (
        <div className="relative mt-4 min-h-40">
          {loading ? (
            <LoadingComponent isVisible variant="content" />
          ) : error ? (
            <div role="alert" className="text-sm poppins-regular text-red-600">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="mt-3 rounded-md border border-[#d9e3ee] px-3 py-2 text-[#344256]"
              >
                ลองใหม่
              </button>
            </div>
          ) : (
            <>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
                {[
                  ['ผู้สร้างข้อมูล', creator?.actorName ?? 'ไม่พบข้อมูลผู้สร้าง'],
                  ['วันและเวลาที่สร้าง', dateTime(createdAt)],
                  ['ผู้แก้ไขล่าสุด', editor?.actorName ?? 'ไม่พบประวัติการแก้ไข'],
                  ['วันและเวลาที่แก้ไขล่าสุด', editor ? dateTime(editor.occurredAt) : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="poppins-medium text-[#344256]">{label}</dt>
                    <dd className="mt-2 break-words poppins-regular text-[#65758b]">{value}</dd>
                  </div>
                ))}
              </dl>
              {!response?.first && !response?.latest && (
                <NotFoundComponent title="ยังไม่มีประวัติข้อมูลสินค้า" />
              )}
            </>
          )}
        </div>
      )}
    </details>
  );
}
