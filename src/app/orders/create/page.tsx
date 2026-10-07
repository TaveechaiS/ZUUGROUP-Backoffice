'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post } from '@/service/http';
import type { OperationOptions } from '@/types/api/operations';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import DocumentForm, { type DocumentDraft } from '@/components/sales/document-form';

export default function Page() {
  const router = useRouter();
  const [options, setOptions] = useState<OperationOptions | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState<DocumentDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<{ id: string; code: string } | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: OperationOptions }>('/api/inventory?view=options', controller.signal)
      .then((response) => setOptions(response.data))
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [reload]);

  async function execute(draft: DocumentDraft) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await Post<{ data: { id: string; code: string } }>('/api/orders', draft);
      setPending(null);
      setSaved(response.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
      setPending(null);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const canCreate = ['SALES', 'ADMIN'].includes(options?.actor.roleId ?? '');

  return (
    <section
      aria-label="สร้างคำสั่งซื้อ"
      className="relative min-h-80 min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <h1 className="mb-6 text-xl poppins-semibold text-[#26364b]">สร้างคำสั่งซื้อ</h1>
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
          <LoadingComponent isVisible variant="content" label="กำลังโหลดลูกค้าและสินค้า..." />
        )
      ) : !canCreate ? (
        <p role="alert" className="text-sm poppins-regular text-red-600">
          บัญชีนี้ไม่มีสิทธิ์สร้างคำสั่งซื้อ
        </p>
      ) : (
        <DocumentForm
          kind="order"
          options={options}
          busy={busy || Boolean(saved)}
          error={error}
          submitLabel="บันทึกและจองสินค้า"
          onSubmit={setPending}
          onCancel={() => router.push('/orders')}
        />
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title="ยืนยันสร้างคำสั่งซื้อ?"
        description="ระบบจะบันทึกเอกสารและจองล็อตสินค้าทันที"
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
        title={saved ? `สร้างคำสั่งซื้อ ${saved.code} และจองสินค้าแล้ว` : ''}
        onClose={() => {
          if (saved) router.push(`/orders/${saved.id}`);
        }}
      />
    </section>
  );
}
