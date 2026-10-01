'use client';

import { EmptyStateIcon } from '@/components/icons/status-icons';

interface NotFoundProps {
  title?: string;
  description?: string;
  onRefresh?: () => void;
  onBack?: () => void;
  refreshLabel?: string;
  backLabel?: string;
}

export default function NotFoundComponent({
  title = 'ไม่พบข้อมูล',
  description = 'ยังไม่มีข้อมูลที่จะแสดง ลองเปลี่ยนคำค้นหาหรือตัวกรองแล้วค้นหาอีกครั้ง',
  onRefresh,
  onBack,
  refreshLabel = 'ลองอีกครั้ง',
  backLabel = 'ย้อนกลับ',
}: NotFoundProps) {
  return (
    <div className="flex min-h-80 w-full flex-col items-center justify-center gap-5 px-6 py-10 text-center">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-3xl"
          aria-hidden="true"
        />
        <EmptyStateIcon className="relative h-24 w-24 text-[#aab7c9]" />
      </div>
      <div className="space-y-2">
        <h2 className="m-0 text-xl font-semibold text-[#26364b]">{title}</h2>
        <p className="m-0 max-w-md text-sm leading-6 text-[#718096]">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRefresh ?? (() => window.location.reload())}
          className="rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
        >
          {refreshLabel}
        </button>
        <button
          type="button"
          onClick={onBack ?? (() => window.history.back())}
          className="rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-sm font-semibold text-[#344256] transition hover:bg-[#f7f9fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
