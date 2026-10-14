'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post } from '@/service/http';
import type { OperationOptions } from '@/types/api/operations';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import FollowUpForm, { type FollowUpDraft } from '@/components/follow-ups/follow-up-form';

export default function Page() {
  const router = useRouter();
  const [options, setOptions] = useState<OperationOptions | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState<FollowUpDraft | null>(null);
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

  async function execute(draft: FollowUpDraft) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await Post<{ data: { id: string; code: string } }>(
        '/api/customer-follow-ups',
        draft,
      );
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
      aria-label="บันทึกการติดตาม"
      className="relative min-h-80 min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <h1 className="mb-6 text-xl poppins-semibold text-[#26364b]">บันทึกการติดตามลูกค้า</h1>
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
          <LoadingComponent isVisible variant="content" label="กำลังโหลดลูกค้า..." />
        )
      ) : (
        <FollowUpForm
          customers={options.customers}
          busy={busy || Boolean(saved)}
          error={error}
          submitLabel="บันทึกการติดตาม"
          onSubmit={setPending}
          onCancel={() => router.push('/customers/dashboard')}
        />
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title="ยืนยันบันทึกการติดตาม?"
        description="รายการจะอยู่สถานะ รอติดตาม จนกว่าจะปิดเป็น เสร็จแล้ว"
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
        title={saved ? `บันทึกการติดตาม ${saved.code} แล้ว` : ''}
        onClose={() => {
          if (saved) router.push(`/customers/dashboard/${saved.id}`);
        }}
      />
    </section>
  );
}
