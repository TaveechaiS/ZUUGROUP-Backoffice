'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post } from '@/service/http';
import type { ReceiveOptions } from '@/types/api/operations';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import PurchaseForm, { type PurchaseDraft } from '@/components/purchasing/purchase-form';

export default function Page() {
  const router = useRouter();
  const [options, setOptions] = useState<ReceiveOptions | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState<PurchaseDraft | null>(null);
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

  async function execute(draft: PurchaseDraft) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await Post<{ data: { id: string; code: string } }>('/api/purchases', draft);
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
      aria-label="สร้างใบสั่งซื้อ"
      className="relative min-h-80 min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <h1 className="mb-6 text-xl poppins-semibold text-[#26364b]">สร้างใบสั่งซื้อ</h1>
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
        <PurchaseForm
          options={options}
          busy={busy || Boolean(saved)}
          error={error}
          submitLabel="บันทึกใบสั่งซื้อ"
          onSubmit={setPending}
          onCancel={() => router.push('/purchases')}
        />
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title="ยืนยันสร้างใบสั่งซื้อ?"
        description="ใบสั่งซื้อมีผลทันทีและรอรับสินค้า ยอดสต็อกเพิ่มเมื่อบันทึกรับเข้า"
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
        title={saved ? `บันทึกใบสั่งซื้อ ${saved.code} แล้ว` : ''}
        onClose={() => {
          if (saved) router.push(`/purchases/${saved.id}`);
        }}
      />
    </section>
  );
}
