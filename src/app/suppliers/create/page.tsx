'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/service/http';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import SupplierForm, { type SupplierDraft } from '@/components/purchasing/supplier-form';

export default function Page() {
  const router = useRouter();
  const [pending, setPending] = useState<SupplierDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<{ id: string; code: string } | null>(null);
  const lock = useRef(false);

  async function execute(draft: SupplierDraft) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await Post<{ data: { id: string; code: string } }>('/api/suppliers', draft);
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
    <section aria-label="เพิ่มผู้ขาย" className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-6 text-xl poppins-semibold text-[#26364b]">เพิ่มผู้ขาย</h1>
      <SupplierForm
        busy={busy || Boolean(saved)}
        error={error}
        submitLabel="บันทึกผู้ขาย"
        onSubmit={setPending}
        onCancel={() => router.push('/suppliers')}
      />
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title="ยืนยันเพิ่มผู้ขาย?"
        description={pending ? `เพิ่ม ${pending.name} ระบบจะออกรหัสผู้ขายให้` : ''}
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
        title={saved ? `เพิ่มผู้ขาย ${saved.code} แล้ว` : ''}
        onClose={() => {
          if (saved) router.push(`/suppliers/${saved.id}`);
        }}
      />
    </section>
  );
}
