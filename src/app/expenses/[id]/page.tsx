'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Post, Update } from '@/service/http';
import type { ExpenseRow } from '@/types/api/expenses';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import ExpenseForm, { type ExpenseDraft } from '@/components/expenses/expense-form';
import {
  Item,
  Section,
  dateOnly,
  dateTime,
  inputClass,
  money,
  secondaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
type Option = { id: string; name: string };

export default function Page() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<ExpenseRow | null>(null);
  const [role, setRole] = useState('');
  const [categories, setCategories] = useState<Option[] | null>(null);
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
    Get<{ data: ExpenseRow; actor: { roleId: string } }>(
      '/api/expenses/' + encodeURIComponent(params.id),
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

  useEffect(() => {
    if (!edit || categories) return;
    const controller = new AbortController();
    Get<{ options: { expenseCategory: Option[] } }>(
      '/api/customer-options?kinds=expenseCategory',
      controller.signal,
    )
      .then((response) => setCategories(response.options.expenseCategory))
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [edit, categories]);

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
      await Update('/api/expenses/' + row.id, command);
      setNotice(command.action === 'cancel' ? 'ยกเลิกค่าใช้จ่ายแล้ว' : 'บันทึกการแก้ไขแล้ว');
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
  async function upload(files: FileList | null) {
    if (!files?.length || !row || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append('file', file);
        await Post(`/api/expenses/${row.id}/files`, body);
      }
      setNotice('แนบไฟล์แล้ว');
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'แนบไฟล์ไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (missing && !loading)
    return (
      <NotFoundComponent
        title="ไม่พบค่าใช้จ่าย"
        backLabel="กลับรายการค่าใช้จ่าย"
        onBack={() => history.back()}
      />
    );

  const writer = ['ADMIN', 'ACCOUNTING_CFO'].includes(role);
  const active = row?.status === 'บันทึกแล้ว';

  return (
    <section
      aria-label="รายละเอียดค่าใช้จ่าย"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/expenses" className="text-sm text-[#1a58a7] hover:underline">
        ← กลับรายการค่าใช้จ่าย
      </Link>
      <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดค่าใช้จ่าย..." />
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
                {edit ? `แก้ไขค่าใช้จ่าย ${row.code}` : row.name}
              </h2>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                บันทึกโดย {row.createdByName || '—'} · {dateTime(row.createdAt)}
              </p>
            </div>
            <StatusBadge value={row.status} />
          </div>
          {row.cancelReason && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <p className="poppins-semibold text-slate-600">เหตุผลยกเลิก</p>
              <p className="mt-1 whitespace-pre-wrap text-[#344256]">{row.cancelReason}</p>
            </div>
          )}
          {edit ? (
            categories ? (
              <ExpenseForm
                key={row.updatedAt}
                categories={categories}
                initial={{
                  code: row.code,
                  name: row.name,
                  expenseDate: row.expenseDate,
                  categoryId: row.categoryId,
                  amount: row.amount,
                  payee: row.payee,
                  description: row.description,
                  notes: row.notes,
                }}
                busy={busy}
                error={error}
                submitLabel="บันทึกการแก้ไข"
                onSubmit={(draft: ExpenseDraft) =>
                  setPending({ ...draft, action: 'edit', expectedUpdatedAt: row.updatedAt })
                }
                onCancel={() => {
                  setEdit(false);
                  setError('');
                }}
              />
            ) : (
              <div className="relative min-h-40">
                <LoadingComponent isVisible variant="content" label="กำลังโหลดหมวดค่าใช้จ่าย..." />
              </div>
            )
          ) : (
            <>
              <Section title="ข้อมูลค่าใช้จ่าย" open>
                <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Item label="วันที่" value={dateOnly(row.expenseDate)} />
                  <Item label="หมวด" value={row.categoryName} />
                  <Item label="จำนวนเงิน (รวม VAT)" value={`${money(row.amount)} บาท`} />
                  <Item label="ผู้รับเงิน" value={row.payee} />
                  <Item label="รายละเอียด" value={row.description} wide />
                  <Item label="หมายเหตุ" value={row.notes} wide />
                </dl>
              </Section>
              <Section title="ไฟล์แนบ" open>
                {row.files?.length ? (
                  <ul className="divide-y divide-[#edf1f5] rounded-lg border border-[#d9e3ee] text-sm">
                    {row.files.map((file) => (
                      <li key={file.id} className="flex flex-wrap justify-between gap-3 px-4 py-3">
                        <a
                          href={'/api/expenses/files/' + file.id}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-[#1a58a7] hover:underline"
                        >
                          {file.name}
                        </a>
                        <span className="text-xs text-[#718096]">{dateTime(file.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#718096]">ยังไม่มีไฟล์แนบ</p>
                )}
                {writer && active && (
                  <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                    แนบไฟล์เพิ่ม
                    <input
                      type="file"
                      multiple
                      disabled={busy}
                      accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                      onChange={(event) => {
                        void upload(event.target.files);
                        event.target.value = '';
                      }}
                      className="mt-2 block w-full text-sm text-[#344256] file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:poppins-medium file:text-[#1a58a7]"
                    />
                  </label>
                )}
              </Section>
              {writer && active && (
                <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
                  <h3 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h3>
                  <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                    เหตุผล (บังคับเมื่อยกเลิก)
                    <textarea
                      value={reason}
                      rows={2}
                      maxLength={1000}
                      onChange={(event) => setReason(event.target.value)}
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
                      disabled={busy || !reason.trim()}
                      onClick={() => {
                        setError('');
                        setPending({
                          action: 'cancel',
                          reason,
                          expectedUpdatedAt: row.updatedAt,
                          idempotencyKey: crypto.randomUUID(),
                        });
                      }}
                      className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      ยกเลิกค่าใช้จ่าย
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
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title={pending?.action === 'cancel' ? 'ยืนยันยกเลิกค่าใช้จ่าย?' : 'ยืนยันบันทึกการแก้ไข?'}
        description={
          pending?.action === 'cancel'
            ? 'ยกเลิกแล้วไม่นับในยอดค่าใช้จ่ายและแก้ไขไม่ได้'
            : 'ข้อมูลใหม่มีผลกับรายงานค่าใช้จ่ายทันที'
        }
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
