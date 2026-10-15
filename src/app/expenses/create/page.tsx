'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post } from '@/service/http';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import ExpenseForm, { type ExpenseDraft } from '@/components/expenses/expense-form';

type Option = { id: string; name: string };

export default function Page() {
  const router = useRouter();
  const [categories, setCategories] = useState<Option[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [pending, setPending] = useState<{ draft: ExpenseDraft; files: File[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<{ id: string; code: string } | null>(null);
  const created = useRef<{ key: string; id: string; code: string } | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ options: { expenseCategory: Option[] } }>(
      '/api/customer-options?kinds=expenseCategory',
      controller.signal,
    )
      .then((response) => setCategories(response.options.expenseCategory))
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [reload]);

  async function execute({ draft, files }: { draft: ExpenseDraft; files: File[] }) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (created.current?.key !== draft.idempotencyKey) {
        const response = await Post<{ data: { id: string; code: string } }>('/api/expenses', draft);
        created.current = { key: draft.idempotencyKey, ...response.data };
      }
      for (const file of files) {
        const body = new FormData();
        body.append('file', file);
        await Post(`/api/expenses/${created.current.id}/files`, body);
      }
      setSaved(created.current);
    } catch (e) {
      setError(
        (created.current ? `บันทึก ${created.current.code} แล้ว แต่แนบไฟล์ไม่สำเร็จ: ` : '') +
          (e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ'),
      );
    } finally {
      setPending(null);
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="เพิ่มค่าใช้จ่าย"
      className="relative min-h-80 min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <h2 className="mb-6 text-lg poppins-semibold text-[#344256]">เพิ่มค่าใช้จ่าย</h2>
      {!categories ? (
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
          <LoadingComponent isVisible variant="content" label="กำลังโหลดหมวดค่าใช้จ่าย..." />
        )
      ) : (
        <ExpenseForm
          categories={categories}
          withFiles
          busy={busy || Boolean(saved)}
          error={error}
          submitLabel="บันทึกค่าใช้จ่าย"
          onSubmit={(draft, files) => setPending({ draft, files })}
          onCancel={() => router.push('/expenses')}
        />
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title="ยืนยันบันทึกค่าใช้จ่าย?"
        description="บันทึกแล้วแก้ไขได้ หรือยกเลิกพร้อมเหตุผล"
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
        title={saved ? `บันทึกค่าใช้จ่าย ${saved.code} แล้ว` : ''}
        onClose={() => {
          if (saved) router.push(`/expenses/${saved.id}`);
        }}
      />
    </section>
  );
}
