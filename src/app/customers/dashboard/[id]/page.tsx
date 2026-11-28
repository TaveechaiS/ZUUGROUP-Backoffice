'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { OperationOptions } from '@/types/api/operations';
import type { FollowUpRow } from '@/types/api/follow-ups';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import FollowUpForm, { type FollowUpDraft } from '@/components/follow-ups/follow-up-form';
import {
  Item,
  Section,
  dateOnly,
  dateTime,
  inputClass,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
const confirmText: Record<string, [string, string]> = {
  edit: ['ยืนยันบันทึกการแก้ไข?', 'ข้อมูลการติดตามจะเปลี่ยนทันที'],
  done: ['ยืนยันปิดการติดตาม?', 'ปิดแล้วแก้ไขไม่ได้ หากต้องติดตามต่อให้บันทึกรายการใหม่'],
  cancel: ['ยืนยันยกเลิกการติดตาม?', 'ยกเลิกแล้วแก้ไขไม่ได้'],
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<FollowUpRow | null>(null);
  const [actor, setActor] = useState<{ id: string; roleId: string } | null>(null);
  const [options, setOptions] = useState<OperationOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [version, setVersion] = useState(0);
  const [edit, setEdit] = useState(false);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<Command | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: FollowUpRow; actor: { id: string; roleId: string } }>(
      '/api/customer-follow-ups/' + encodeURIComponent(params.id),
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return;
        setRow(response.data);
        setActor(response.actor);
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

  useEffect(() => {
    if (!edit || options) return;
    const controller = new AbortController();
    Get<{ data: OperationOptions }>('/api/inventory?view=options', controller.signal)
      .then((response) => setOptions(response.data))
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [edit, options]);

  function reload() {
    setLoading(true);
    setLoadError('');
    setVersion((value) => value + 1);
  }
  function ask(command: Command) {
    setError('');
    setPending({
      ...command,
      expectedUpdatedAt: row?.updatedAt,
      idempotencyKey: crypto.randomUUID(),
    });
  }
  async function execute(command: Command) {
    if (lock.current || !row) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await Update('/api/customer-follow-ups/' + row.id, command);
      setNotice(
        command.action === 'done'
          ? 'ปิดการติดตามแล้ว'
          : command.action === 'cancel'
            ? 'ยกเลิกการติดตามแล้ว'
            : 'บันทึกการแก้ไขแล้ว',
      );
      setEdit(false);
      setNote('');
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    } finally {
      setPending(null);
      lock.current = false;
      setBusy(false);
    }
  }

  if (missing && !loading)
    return (
      <NotFoundComponent
        title="ไม่พบรายการติดตาม"
        backLabel="กลับรายการติดตาม"
        onBack={() => history.back()}
      />
    );

  const canWrite =
    actor &&
    row &&
    row.savedStatus === 'รอติดตาม' &&
    (['ADMIN', 'MANAGER'].includes(actor.roleId) ||
      (actor.roleId === 'SALES' && row.createdById === actor.id));

  return (
    <section
      aria-label="รายละเอียดการติดตาม"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/customers/dashboard" className="text-sm text-[#1a58a7] hover:underline">
        ← กลับรายการติดตาม
      </Link>
      <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดการติดตาม..." />
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
              <h2 className="mt-1 text-lg poppins-semibold break-words text-[#344256]">
                {edit ? `แก้ไขการติดตาม ${row.code}` : row.name}
              </h2>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                บันทึกโดย {row.createdByName || '—'} · {dateTime(row.createdAt)}
              </p>
            </div>
            <StatusBadge value={row.status} />
          </div>
          {edit ? (
            options ? (
              <FollowUpForm
                key={row.updatedAt}
                customers={options.customers}
                initial={{
                  code: row.code,
                  customerId: row.customerId,
                  name: row.name,
                  contactedOn: row.contactedOn,
                  channel: row.channel,
                  nextOn: row.nextOn ?? '',
                  summary: row.summary,
                  notes: row.notes,
                }}
                busy={busy}
                error={error}
                submitLabel="บันทึกการแก้ไข"
                onSubmit={(draft: FollowUpDraft) =>
                  setPending({ ...draft, action: 'edit', expectedUpdatedAt: row.updatedAt })
                }
                onCancel={() => {
                  setEdit(false);
                  setError('');
                }}
              />
            ) : (
              <div className="relative min-h-40">
                <LoadingComponent isVisible variant="content" label="กำลังโหลดลูกค้า..." />
              </div>
            )
          ) : (
            <>
              <Section title="ข้อมูลการติดตาม" open>
                <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Item
                    label="ลูกค้า"
                    value={
                      <Link
                        href={'/customers/' + encodeURIComponent(row.customerCode)}
                        className="text-[#1a58a7] hover:underline"
                      >
                        {row.customerCode} · {row.customerName}
                      </Link>
                    }
                  />
                  <Item label="วันที่ติดต่อ" value={dateOnly(row.contactedOn)} />
                  <Item label="ช่องทาง" value={row.channel} />
                  <Item label="นัดครั้งถัดไป" value={dateOnly(row.nextOn)} />
                  <Item label="สรุปการติดต่อ" value={row.summary} wide />
                  {row.result && <Item label="ผลการติดตาม" value={row.result} wide />}
                  {row.cancelReason && <Item label="เหตุผลยกเลิก" value={row.cancelReason} wide />}
                  <Item label="หมายเหตุ" value={row.notes} wide />
                </dl>
              </Section>
              {canWrite && (
                <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
                  <h3 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h3>
                  <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                    ผลการติดตาม / เหตุผลยกเลิก
                    <textarea
                      value={note}
                      rows={3}
                      maxLength={2000}
                      onChange={(event) => setNote(event.target.value)}
                      className={inputClass}
                    />
                  </label>
                  {error && (
                    <p role="alert" className="mt-4 text-sm poppins-regular text-red-600">
                      {error}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
                    <button
                      type="button"
                      disabled={busy || !note.trim()}
                      onClick={() => ask({ action: 'cancel', reason: note })}
                      className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      ยกเลิก
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
                    <button
                      type="button"
                      disabled={busy || !note.trim()}
                      onClick={() => ask({ action: 'done', result: note })}
                      className={primaryButton}
                    >
                      ปิดการติดตาม
                    </button>
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
        variant={pending?.action === 'cancel' ? 'danger' : 'primary'}
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
