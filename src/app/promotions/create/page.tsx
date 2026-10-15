'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post } from '@/service/http';
import type { ReceiveOptions } from '@/types/api/operations';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import PromotionForm, { type PromotionDraft } from '@/components/promotions/promotion-form';

export default function Page() {
  const router = useRouter();
  const [options, setOptions] = useState<ReceiveOptions | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState<PromotionDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<{ id: string; code: string } | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: ReceiveOptions }>('/api/inventory?view=options&scope=receive', controller.signal)
      .then((response) => setOptions(response.data))
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [reload]);

  async function execute(draft: PromotionDraft) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await Post<{ data: { id: string; code: string } }>('/api/promotions', draft);
      setSaved(response.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setPending(null);
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="เพิ่มโปรโมชัน"
      className="relative min-h-80 min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <h2 className="mb-6 text-lg poppins-semibold text-[#344256]">เพิ่มโปรโมชัน</h2>
      {!options ? (
        loadError ? (
          <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
            {loadError}
            <button
              type="button"
              onClick={() => {
                setLoadError('');
                setReload((value) => value + 1);
              }}
              className="text-[#1a58a7]"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <LoadingComponent isVisible variant="content" label="กำลังโหลดสินค้า..." />
        )
      ) : (
        <PromotionForm
          options={options}
          busy={busy || Boolean(saved)}
          error={error}
          submitLabel="บันทึกโปรโมชัน"
          onSubmit={setPending}
          onCancel={() => router.push('/promotions')}
        />
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title="ยืนยันบันทึกโปรโมชัน?"
        description="สถานะใช้งานมีผลทันทีตามช่วงวันที่ สถานะร่างยังไม่ใช้งาน"
        variant="primary"
        confirmLabel="ยืนยัน"
        busyLabel="กำลังบันทึก..."
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) void execute(pending);
        }}
      />
      <SuccessAlertComponent
        isOpen={Boolean(saved)}
        title={saved ? `บันทึกโปรโมชัน ${saved.code} แล้ว` : ''}
        onClose={() => {
          if (saved) router.push(`/promotions/${saved.id}`);
        }}
      />
    </section>
  );
}
