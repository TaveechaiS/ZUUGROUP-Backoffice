'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { SupplierRow } from '@/types/api/purchasing';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import SupplierForm, { type SupplierDraft } from '@/components/purchasing/supplier-form';
import {
  Item,
  Section,
  dateTime,
  inputClass,
  secondaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
const confirmText: Record<string, [string, string]> = {
  edit: ['ยืนยันบันทึกการแก้ไข?', 'ผู้ขายที่ระงับจะเลือกในใบสั่งซื้อและรับเข้าใหม่ไม่ได้'],
  delete: ['ยืนยันลบผู้ขาย?', 'ลบแล้วกู้คืนได้จากแท็บ ลบแล้ว ใบสั่งซื้อเดิมยังอยู่'],
  restore: ['ยืนยันกู้คืนผู้ขาย?', 'ผู้ขายกลับมาใช้งานตามสถานะเดิม'],
};
const doneText: Record<string, string> = {
  edit: 'บันทึกการแก้ไขแล้ว',
  delete: 'ลบผู้ขายแล้ว',
  restore: 'กู้คืนผู้ขายแล้ว',
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<SupplierRow | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [version, setVersion] = useState(0);
  const [edit, setEdit] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState<Command | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: SupplierRow; actor: { roleId: string } }>(
      '/api/suppliers/' + encodeURIComponent(params.id),
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return;
        setRow(response.data);
        setRole(response.actor.roleId);
        setMissing(false);
        setLoading(false);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setMissing(e?.status === 404);
        setLoadError(e.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [params.id, version]);

  function reload() {
    setLoading(true);
    setLoadError('');
    setVersion((value) => value + 1);
  }
  async function execute(command: Command) {
    if (lock.current || !row) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await Update('/api/suppliers/' + row.id, command);
      setNotice(doneText[command.action] ?? 'บันทึกแล้ว');
      setEdit(false);
      setReason('');
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    } finally {
      setPending(null);
      lock.current = false;
      setBusy(false);
    }
  }
  function ask(action: string) {
    setError('');
    setPending({
      action,
      reason,
      expectedUpdatedAt: row?.updatedAt,
      idempotencyKey: crypto.randomUUID(),
    });
  }

  if (missing && !loading)
    return (
      <NotFoundComponent
        title="ไม่พบผู้ขาย"
        backLabel="กลับรายการผู้ขาย"
        onBack={() => history.back()}
      />
    );
  const admin = role === 'ADMIN';

  return (
    <section
      aria-label="รายละเอียดผู้ขาย"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/suppliers" className="text-sm text-[#1a58a7] hover:underline">
        ← กลับรายการผู้ขาย
      </Link>
      <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดผู้ขาย..." />
      {loadError && !missing && (
        <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
          {loadError}
          <button type="button" onClick={reload} className="text-[#1a58a7]">
            ลองใหม่
          </button>
        </div>
      )}
      {row && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm poppins-medium text-[#1a58a7]">{row.code}</p>
              <h1 className="mt-1 text-xl poppins-semibold break-words text-[#26364b]">
                {edit ? `แก้ไขผู้ขาย ${row.code}` : row.name}
              </h1>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                เพิ่มโดย {row.createdByName} · {dateTime(row.createdAt)}
              </p>
            </div>
            <StatusBadge value={row.deletedAt ? 'ลบแล้ว' : row.status} />
          </div>
          {row.deletedAt && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm">
              <p className="poppins-semibold text-red-600">ลบเมื่อ {dateTime(row.deletedAt)}</p>
              <p className="mt-1 whitespace-pre-wrap text-[#344256]">{row.deleteReason}</p>
            </div>
          )}
          {edit ? (
            <SupplierForm
              key={row.updatedAt}
              code={row.code}
              initial={{
                name: row.name,
                taxId: row.taxId,
                address: row.address,
                contact: row.contact,
                phone: row.phone,
                email: row.email,
                paymentTerms: row.paymentTerms,
                status: row.status,
                notes: row.notes,
              }}
              busy={busy}
              error={error}
              submitLabel="บันทึกการแก้ไข"
              onSubmit={(draft: SupplierDraft) =>
                setPending({ ...draft, action: 'edit', expectedUpdatedAt: row.updatedAt })
              }
              onCancel={() => {
                setEdit(false);
                setError('');
              }}
            />
          ) : (
            <>
              <Section title="ข้อมูลผู้ขาย" open>
                <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Item label="เลขประจำตัวผู้เสียภาษี" value={row.taxId} />
                  <Item label="เงื่อนไขชำระเงิน" value={row.paymentTerms} />
                  <Item label="ที่อยู่" value={row.address} wide />
                  <Item label="ผู้ติดต่อ" value={row.contact} />
                  <Item label="เบอร์โทร" value={row.phone} />
                  <Item label="อีเมล" value={row.email} />
                  <Item label="หมายเหตุ" value={row.notes} wide />
                </dl>
              </Section>
              <Section title="ใบสั่งซื้อ" open>
                <p className="text-sm text-[#344256]">
                  ทั้งหมด {row.purchaseCount.toLocaleString('th-TH')} ใบ · ค้างรับ{' '}
                  {row.openPurchaseCount.toLocaleString('th-TH')} ใบ
                </p>
                <Link
                  href={`/purchases?supplierId=${row.id}`}
                  className="mt-3 inline-block text-sm poppins-medium text-[#1a58a7] hover:underline"
                >
                  ดูใบสั่งซื้อของผู้ขายนี้ →
                </Link>
              </Section>
              {admin && (
                <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
                  <h2 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h2>
                  {!row.deletedAt && (
                    <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                      เหตุผล (บังคับเมื่อลบ)
                      <textarea
                        value={reason}
                        rows={2}
                        maxLength={1000}
                        onChange={(event) => setReason(event.target.value)}
                        className={inputClass}
                      />
                    </label>
                  )}
                  {error && (
                    <p role="alert" className="mt-4 text-sm poppins-regular text-red-600">
                      {error}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    {row.deletedAt ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => ask('restore')}
                        className={secondaryButton}
                      >
                        กู้คืน
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={busy || !reason.trim()}
                          onClick={() => ask('delete')}
                          className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          ลบผู้ขาย
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setError('');
                            setEdit(true);
                          }}
                          className={secondaryButton}
                        >
                          แก้ไข
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title={confirmText[pending?.action ?? '']?.[0] ?? 'ยืนยัน?'}
        description={confirmText[pending?.action ?? '']?.[1] ?? ''}
        variant={pending?.action === 'delete' ? 'danger' : 'primary'}
        confirmLabel="ยืนยัน"
        busyLabel="กำลังบันทึก..."
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) void execute(pending);
        }}
      />
      <SuccessAlertComponent
        isOpen={Boolean(notice)}
        title={notice}
        onClose={() => setNotice('')}
      />
    </section>
  );
}
