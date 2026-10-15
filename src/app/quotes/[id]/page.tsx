'use client';
import PrintButton from '@/components/ui/print-button';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { OperationOptions } from '@/types/api/operations';
import type { QuoteRow } from '@/types/api/quotes';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import DocumentForm, { type DocumentDraft } from '@/components/sales/document-form';
import {
  Item,
  Section,
  Totals,
  dateOnly,
  dateTime,
  inputClass,
  lineTotal,
  money,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
const confirmText: Record<string, [string, string]> = {
  edit: ['ยืนยันบันทึกการแก้ไข?', 'สินค้าเดิมคงราคาเดิม สินค้าใหม่ใช้ราคาปัจจุบัน'],
  approve: ['ยืนยันอนุมัติ?', 'ใบเสนอราคาพร้อมส่งลูกค้าและสร้างคำสั่งซื้อได้'],
  reject: ['ยืนยันไม่อนุมัติ?', 'ไม่อนุมัติแล้วดำเนินการต่อไม่ได้'],
  return: ['ยืนยันส่งกลับแก้ไข?', 'ผู้สร้างจะเห็นเหตุผลและแก้ไขแล้วส่งใหม่'],
  cancel: ['ยืนยันยกเลิกใบเสนอราคา?', 'ยกเลิกแล้วดำเนินการต่อไม่ได้'],
  convert: [
    'ยืนยันสร้างคำสั่งซื้อ?',
    'ระบบจะสร้างคำสั่งซื้อจากรายการ ราคา และส่วนลดในใบนี้ เข้าสถานะอนุมัติทันทีและจองสต็อก ทำได้ครั้งเดียว',
  ],
};
const doneText: Record<string, string> = {
  edit: 'บันทึกการแก้ไขแล้ว',
  approve: 'อนุมัติแล้ว',
  reject: 'บันทึกไม่อนุมัติแล้ว',
  return: 'ส่งกลับแก้ไขแล้ว',
  cancel: 'ยกเลิกใบเสนอราคาแล้ว',
};
const cellClass = 'px-4 py-3 align-top';

export default function Page() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [options, setOptions] = useState<OperationOptions | null>(null);
  const [row, setRow] = useState<QuoteRow | null>(null);
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
  const [orderId, setOrderId] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: OperationOptions }>('/api/inventory?view=options', controller.signal)
      .then((response) => setOptions(response.data))
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [version]);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: QuoteRow }>('/api/quotes/' + encodeURIComponent(params.id), controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        setRow(response.data);
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
      const response = await Update<{ data: { orderId?: string; orderCode?: string } }>(
        '/api/quotes/' + row.id,
        command,
      );
      if (command.action === 'convert' && response.data.orderId) {
        setOrderId(response.data.orderId);
        setNotice(`สร้างคำสั่งซื้อ ${response.data.orderCode} และจองสต็อกแล้ว`);
      } else setNotice(doneText[command.action] ?? 'บันทึกแล้ว');
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
        title="ไม่พบใบเสนอราคา"
        backLabel="กลับรายการใบเสนอราคา"
        onBack={() => history.back()}
      />
    );

  const role = options?.actor.roleId ?? '';
  const status = row?.status ?? '';
  const expired = row?.displayStatus === 'หมดอายุ';
  const isCreator = row?.createdById === options?.actor.id;
  const open =
    Boolean(row?.workflowManaged) &&
    !row?.orderId &&
    ['รออนุมัติ', 'ส่งกลับแก้ไข', 'อนุมัติ'].includes(status);
  const salesOwn = role !== 'SALES' || isCreator;
  const waiting = ['รออนุมัติ', 'ส่งกลับแก้ไข'].includes(status);
  const canEdit =
    open && salesOwn && (role === 'MANAGER' || role === 'ADMIN' || (role === 'SALES' && waiting));
  const canDecide = open && role === 'MANAGER' && waiting;
  const canReturn = open && ['MANAGER', 'ADMIN'].includes(role) && status !== 'ส่งกลับแก้ไข';
  const canCancel = open && salesOwn && ['SALES', 'MANAGER', 'ADMIN'].includes(role);
  const canConvert =
    open &&
    status === 'อนุมัติ' &&
    !expired &&
    (role === 'ADMIN' || (role === 'SALES' && isCreator));

  return (
    <section
      aria-label="รายละเอียดใบเสนอราคา"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/quotes" className="text-sm text-[#1a58a7] hover:underline print:hidden">
        ← กลับรายการใบเสนอราคา
      </Link>
      <LoadingComponent
        isVisible={loading || !options}
        variant="content"
        label="กำลังโหลดใบเสนอราคา..."
      />
      {loadError && !missing && (
        <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
          {loadError}
          <button type="button" onClick={reload} className="text-[#1a58a7]">
            ลองใหม่
          </button>
        </div>
      )}
      {row && options && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm poppins-medium text-[#1a58a7]">{row.code}</p>
              <h2 className="mt-1 text-lg poppins-semibold break-words text-[#344256]">
                {edit ? `แก้ไขใบเสนอราคา ${row.code}` : row.customerName}
              </h2>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                {row.territoryName || 'ยังไม่กำหนดเขต'} · สร้างโดย {row.createdByName || '—'} ·{' '}
                {dateTime(row.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PrintButton />
              <StatusBadge value={row.displayStatus} />
            </div>
          </div>
          {row.orderId && (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-[#344256]">
              สร้างคำสั่งซื้อแล้ว:{' '}
              <Link
                href={`/orders/${row.orderId}`}
                className="poppins-semibold text-[#1a58a7] hover:underline"
              >
                {row.orderCode}
              </Link>
            </div>
          )}
          {expired && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              เลยวันที่ใช้ได้ถึง ({dateOnly(row.validUntil)}) —
              แก้วันที่ใช้ได้ถึงก่อนอนุมัติหรือสร้างคำสั่งซื้อ
            </p>
          )}
          {row.returnReason && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${status === 'ส่งกลับแก้ไข' ? 'border-orange-100 bg-orange-50' : 'border-red-100 bg-red-50'}`}
            >
              <p
                className={`poppins-semibold ${status === 'ส่งกลับแก้ไข' ? 'text-orange-600' : 'text-red-600'}`}
              >
                เหตุผล ({status})
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[#344256]">{row.returnReason}</p>
            </div>
          )}
          {!row.workflowManaged && (
            <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm poppins-regular text-[#1a58a7]">
              ใบเสนอราคาเดิมมีเฉพาะข้อมูลหัวเอกสาร ไม่มีรายการสินค้า
            </p>
          )}
          {edit ? (
            <DocumentForm
              kind="quote"
              key={row.updatedAt}
              options={options}
              initial={{
                code: row.code,
                customerId: row.customerId ?? '',
                notes: row.notes,
                validUntil: row.validUntil,
                promotionId: row.promotionId,
                lines: (row.lines ?? [])
                  .filter((line) => !line.isGift)
                  .map((line) => ({
                    productId: line.productId,
                    quantity: String(line.quantity),
                    discount: line.discount,
                    unitPrice: line.unitPrice,
                  })),
              }}
              busy={busy}
              error={error}
              submitLabel="บันทึกการแก้ไข"
              onSubmit={(draft: DocumentDraft) =>
                setPending({ ...draft, action: 'edit', expectedUpdatedAt: row.updatedAt })
              }
              onCancel={() => {
                setEdit(false);
                setError('');
              }}
            />
          ) : (
            <>
              <Section title="ข้อมูลใบเสนอราคา" open>
                <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Item
                    label="ลูกค้า"
                    value={[row.customerCode, row.customerName].filter(Boolean).join(' · ')}
                  />
                  <Item label="เขตขาย" value={row.territoryName} />
                  <Item label="ใช้ได้ถึง" value={dateOnly(row.validUntil)} />
                  <Item label="Sales ประจำเขต" value={row.salesName} />
                  <Item label="Manager ประจำเขต" value={row.managerName} />
                  <Item label="ผู้สร้าง" value={row.createdByName} />
                  <Item label="ผู้อนุมัติ" value={row.approvedByName} />
                  <Item
                    label="โปรโมชัน"
                    value={
                      row.promotion
                        ? `${row.promotion.code} · ${row.promotion.name}`
                        : '— (ไม่ใช้โปรโมชัน)'
                    }
                  />
                  <Item label="หมายเหตุ" value={row.notes} />
                </dl>
              </Section>
              {row.workflowManaged && (
                <Section title="รายการสินค้า" open>
                  <div className="overflow-x-auto rounded-lg border border-[#e3e9f0]">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm poppins-regular text-[#344256]">
                      <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
                        <tr>
                          {[
                            '#',
                            'สินค้า',
                            'จำนวน',
                            'ราคา/หน่วย (รวม VAT)',
                            'ส่วนลด (บาท)',
                            'รวม',
                          ].map((label) => (
                            <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(row.lines ?? []).map((line, index) => (
                          <tr key={line.id} className="border-t border-[#edf0f4]">
                            <td className={cellClass}>{index + 1}</td>
                            <td className={cellClass}>
                              <p className="poppins-medium">
                                {line.productName}
                                {line.isGift && (
                                  <span className="ml-2 inline-block align-middle">
                                    <StatusBadge value="ของแถม" />
                                  </span>
                                )}
                              </p>
                              {line.productCode && (
                                <p className="mt-1 text-xs text-[#718096]">{line.productCode}</p>
                              )}
                            </td>
                            <td className={`${cellClass} whitespace-nowrap text-right`}>
                              {line.quantity.toLocaleString('th-TH')} {line.unit}
                            </td>
                            <td className={`${cellClass} text-right`}>
                              {line.isGift ? '' : money(line.unitPrice)}
                            </td>
                            <td className={`${cellClass} text-right`}>
                              {Number(line.discount) ? money(line.discount) : '—'}
                            </td>
                            <td className={`${cellClass} text-right poppins-medium`}>
                              {line.isGift ? '' : money(lineTotal(line))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Totals lines={row.lines ?? []} billDiscount={row.billDiscount} />
                  <p className="mt-2 text-right text-xs text-[#718096]">
                    ใบเสนอราคาไม่จองสต็อก — จองเมื่อสร้างคำสั่งซื้อ
                  </p>
                </Section>
              )}
              {open && (
                <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6 print:hidden">
                  <h3 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h3>
                  {(canCancel || canReturn || canDecide) && (
                    <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                      เหตุผล (บังคับเมื่อส่งกลับแก้ไข ไม่อนุมัติ หรือยกเลิก)
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
                  <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
                    {canCancel && (
                      <button
                        type="button"
                        disabled={busy || !reason.trim()}
                        onClick={() => ask('cancel')}
                        className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        ยกเลิกใบเสนอราคา
                      </button>
                    )}
                    {canDecide && (
                      <button
                        type="button"
                        disabled={busy || !reason.trim()}
                        onClick={() => ask('reject')}
                        className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        ไม่อนุมัติ
                      </button>
                    )}
                    {canReturn && (
                      <button
                        type="button"
                        disabled={busy || !reason.trim()}
                        onClick={() => ask('return')}
                        className="rounded-lg border border-orange-200 bg-white px-5 py-2.5 text-sm poppins-medium text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                      >
                        ส่งกลับแก้ไข
                      </button>
                    )}
                    {canEdit && (
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
                    )}
                    {canDecide && (
                      <button
                        type="button"
                        disabled={busy || expired}
                        onClick={() => ask('approve')}
                        className={primaryButton}
                      >
                        อนุมัติ
                      </button>
                    )}
                    {canConvert && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => ask('convert')}
                        className={primaryButton}
                      >
                        สร้างคำสั่งซื้อ
                      </button>
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
        variant={['cancel', 'reject'].includes(pending?.action ?? '') ? 'danger' : 'primary'}
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
        onClose={() => {
          setNotice('');
          if (orderId) router.push(`/orders/${orderId}`);
        }}
      />
    </section>
  );
}
