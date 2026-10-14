'use client';
import PrintButton from '@/components/ui/print-button';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { InvoiceRow } from '@/types/api/billing';
import { PAYMENT_METHODS } from '@/config/billing';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import {
  DateInput,
  FieldLabel,
  Item,
  Section,
  bangkokToday,
  dateOnly,
  dateTime,
  inputClass,
  money,
  primaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
const cellClass = 'px-4 py-3 align-top';
const confirmText: Record<string, [string, string]> = {
  pay: ['ยืนยันบันทึกรับชำระ?', 'ยอดค้างและสถานะใบแจ้งหนี้จะคำนวณใหม่ทันที'],
  'void-payment': ['ยืนยันยกเลิกรายการรับชำระ?', 'รายการนี้จะไม่นับเป็นยอดชำระ'],
  cancel: ['ยืนยันยกเลิกใบแจ้งหนี้?', 'ยกเลิกแล้วคำสั่งซื้อนี้วางบิลใหม่ได้'],
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<InvoiceRow | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [version, setVersion] = useState(0);
  const [payment, setPayment] = useState({
    paidOn: bangkokToday(),
    amount: '',
    method: 'โอน',
    reference: '',
    notes: '',
  });
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState<Command | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: InvoiceRow; actor: { roleId: string } }>(
      '/api/billing/' + encodeURIComponent(params.id),
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
      await Update('/api/billing/' + row.id, command);
      setNotice(
        command.action === 'pay'
          ? 'บันทึกรับชำระแล้ว'
          : command.action === 'cancel'
            ? 'ยกเลิกใบแจ้งหนี้แล้ว'
            : 'ยกเลิกรายการรับชำระแล้ว',
      );
      setPayment((current) => ({ ...current, amount: '', reference: '', notes: '' }));
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

  if (missing && !loading)
    return (
      <NotFoundComponent
        title="ไม่พบใบแจ้งหนี้"
        backLabel="กลับรายการใบแจ้งหนี้"
        onBack={() => history.back()}
      />
    );

  const writer = ['ADMIN', 'ACCOUNTING_CFO'].includes(role);
  const open = row && row.savedStatus !== 'ยกเลิก';
  const outstanding = Number(row?.outstanding ?? 0);
  const activePayments = (row?.payments ?? []).filter((item) => !item.voidedAt);

  return (
    <section
      aria-label="รายละเอียดใบแจ้งหนี้"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/billing" className="text-sm text-[#1a58a7] hover:underline print:hidden">
        ← กลับรายการใบแจ้งหนี้
      </Link>
      <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดใบแจ้งหนี้..." />
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
                {row.customerName}
              </h1>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                ออกโดย {row.createdByName || '—'} · {dateTime(row.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PrintButton />
              <StatusBadge value={row.status} />
            </div>
          </div>
          {row.cancelReason && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <p className="poppins-semibold text-slate-600">เหตุผลยกเลิก</p>
              <p className="mt-1 whitespace-pre-wrap text-[#344256]">{row.cancelReason}</p>
            </div>
          )}
          <Section title="ข้อมูลใบแจ้งหนี้" open>
            <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <Item
                label="คำสั่งซื้อ"
                value={
                  <Link
                    href={'/orders/' + row.salesOrderId}
                    className="text-[#1a58a7] hover:underline"
                  >
                    {row.salesOrderCode}
                  </Link>
                }
              />
              <Item label="วันที่ออก" value={dateOnly(row.issueDate)} />
              <Item
                label="ครบกำหนด"
                value={
                  row.daysOverdue > 0 && outstanding > 0 && open
                    ? `${dateOnly(row.dueDate)} (เกิน ${row.daysOverdue} วัน)`
                    : dateOnly(row.dueDate)
                }
              />
              <Item label="ยอดเรียกเก็บ (รวม VAT)" value={`${money(row.amount)} บาท`} />
              <Item label="ชำระแล้ว" value={`${money(row.paid)} บาท`} />
              <Item label="ค้างชำระ" value={`${money(row.outstanding)} บาท`} />
              <Item label="หมายเหตุ" value={row.notes} wide />
            </dl>
          </Section>
          <Section title="ประวัติรับชำระ" open>
            {row.payments?.length ? (
              <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
                <table className="w-full min-w-[820px] border-collapse text-left text-sm poppins-regular text-[#344256]">
                  <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
                    <tr>
                      {[
                        'วันที่รับ',
                        'จำนวนเงิน',
                        'วิธีชำระ',
                        'อ้างอิง',
                        'ผู้บันทึก',
                        'สถานะ',
                        '',
                      ].map((label, index) => (
                        <th key={index} scope="col" className="px-4 py-3 poppins-medium">
                          {label || <span className="sr-only">ดำเนินการ</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {row.payments.map((item) => (
                      <tr key={item.id} className="border-b border-[#edf1f5] last:border-b-0">
                        <td className={`${cellClass} whitespace-nowrap`}>
                          {dateOnly(item.paidOn)}
                        </td>
                        <td className={`${cellClass} whitespace-nowrap text-right`}>
                          {money(item.amount)}
                        </td>
                        <td className={cellClass}>{item.method}</td>
                        <td className={cellClass}>
                          <p>{item.reference || '—'}</p>
                          {item.notes && (
                            <p className="mt-1 text-xs text-[#718096]">{item.notes}</p>
                          )}
                        </td>
                        <td className={cellClass}>
                          <p>{item.createdByName}</p>
                          <p className="mt-1 text-xs text-[#718096]">{dateTime(item.createdAt)}</p>
                        </td>
                        <td className={cellClass}>
                          <StatusBadge value={item.voidedAt ? 'ยกเลิก' : 'บันทึกแล้ว'} />
                          {item.voidReason && (
                            <p className="mt-1 text-xs text-[#718096]">{item.voidReason}</p>
                          )}
                        </td>
                        <td className={`${cellClass} text-right`}>
                          {writer && open && !item.voidedAt && (
                            <button
                              type="button"
                              disabled={busy || !reason.trim()}
                              title={reason.trim() ? '' : 'กรอกเหตุผลในกล่องดำเนินการก่อน'}
                              onClick={() =>
                                ask({ action: 'void-payment', paymentId: item.id, reason })
                              }
                              className="text-sm poppins-medium text-red-600 hover:underline disabled:opacity-40"
                            >
                              ยกเลิกรายการ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[#718096]">ยังไม่มีการรับชำระ</p>
            )}
          </Section>
          {writer && open && outstanding > 0 && (
            <div className="print:hidden">
              <Section title="บันทึกรับชำระ" open>
                <form
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (
                      !/^\d{1,12}(\.\d{1,2})?$/.test(payment.amount) ||
                      Number(payment.amount) <= 0
                    )
                      return setError('จำนวนเงินต้องมากกว่า 0');
                    if (Number(payment.amount) > outstanding)
                      return setError(`รับชำระเกินยอดค้าง (ค้าง ${money(outstanding)})`);
                    if (!payment.paidOn || payment.paidOn > bangkokToday())
                      return setError('วันที่รับชำระต้องไม่เกินวันนี้');
                    ask({ action: 'pay', ...payment });
                  }}
                  className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2"
                >
                  <div className="min-w-0">
                    <FieldLabel text="วันที่รับ" required />
                    <DateInput
                      label="วันที่รับ"
                      value={payment.paidOn}
                      max={bangkokToday()}
                      onChange={(value) => setPayment((current) => ({ ...current, paidOn: value }))}
                    />
                  </div>
                  <label className="min-w-0">
                    <FieldLabel text="จำนวนเงิน" required />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={payment.amount}
                      placeholder={String(outstanding)}
                      onChange={(event) =>
                        setPayment((current) => ({ ...current, amount: event.target.value }))
                      }
                      className={`${inputClass} text-right`}
                    />
                  </label>
                  <label className="min-w-0">
                    <FieldLabel text="วิธีชำระ" required />
                    <select
                      value={payment.method}
                      onChange={(event) =>
                        setPayment((current) => ({ ...current, method: event.target.value }))
                      }
                      className={inputClass}
                    >
                      {PAYMENT_METHODS.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-0">
                    <FieldLabel text="เลขอ้างอิง (เลขโอน/เลขเช็ค)" />
                    <input
                      value={payment.reference}
                      maxLength={200}
                      onChange={(event) =>
                        setPayment((current) => ({ ...current, reference: event.target.value }))
                      }
                      className={inputClass}
                    />
                  </label>
                  <div className="flex justify-end sm:col-span-2">
                    <button type="submit" disabled={busy} className={`min-w-36 ${primaryButton}`}>
                      บันทึกรับชำระ
                    </button>
                  </div>
                </form>
              </Section>
            </div>
          )}
          {writer && open && (
            <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6 print:hidden">
              <h2 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h2>
              <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                เหตุผล (บังคับเมื่อยกเลิกใบแจ้งหนี้หรือรายการรับชำระ)
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
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={busy || !reason.trim() || activePayments.length > 0}
                  title={activePayments.length ? 'ยกเลิกรายการรับชำระก่อน' : ''}
                  onClick={() => ask({ action: 'cancel', reason })}
                  className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  ยกเลิกใบแจ้งหนี้
                </button>
              </div>
            </div>
          )}
        </>
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title={confirmText[pending?.action ?? '']?.[0] ?? 'ยืนยัน?'}
        description={confirmText[pending?.action ?? '']?.[1] ?? ''}
        variant={pending?.action === 'pay' ? 'primary' : 'danger'}
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
