'use client';
import PrintButton from '@/components/ui/print-button';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { ReceiveOptions } from '@/types/api/operations';
import type { PurchaseRow } from '@/types/api/purchasing';
import { PURCHASE_OPEN_STATUSES } from '@/config/purchasing';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import PurchaseForm, { type PurchaseDraft } from '@/components/purchasing/purchase-form';
import {
  Item,
  Section,
  Totals,
  dateOnly,
  dateTime,
  inputClass,
  lineTotal,
  money,
  secondaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
const confirmText: Record<string, [string, string]> = {
  edit: ['ยืนยันบันทึกการแก้ไข?', 'แก้ได้จนกว่าจะรับสินค้าครั้งแรก'],
  close: ['ยืนยันปิดใบสั่งซื้อ?', 'ส่วนที่ค้างรับจะไม่รับต่อ ปิดแล้วรับสินค้าจากใบนี้ไม่ได้'],
  cancel: ['ยืนยันยกเลิกใบสั่งซื้อ?', 'ยกเลิกแล้วรับสินค้าจากใบนี้ไม่ได้'],
};
const doneText: Record<string, string> = {
  edit: 'บันทึกการแก้ไขแล้ว',
  close: 'ปิดใบสั่งซื้อแล้ว',
  cancel: 'ยกเลิกใบสั่งซื้อแล้ว',
};
const cellClass = 'px-4 py-3 align-top';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<PurchaseRow | null>(null);
  const [role, setRole] = useState('');
  const [options, setOptions] = useState<ReceiveOptions | null>(null);
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
    Get<{ data: PurchaseRow; actor: { roleId: string } }>(
      '/api/purchases/' + encodeURIComponent(params.id),
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
    if (!edit || options) return;
    const controller = new AbortController();
    Get<{ data: ReceiveOptions }>('/api/inventory?view=options&scope=receive', controller.signal)
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
  async function execute(command: Command) {
    if (lock.current || !row) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await Update('/api/purchases/' + row.id, command);
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
        title="ไม่พบใบสั่งซื้อ"
        backLabel="กลับรายการใบสั่งซื้อ"
        onBack={() => history.back()}
      />
    );

  const admin = role === 'ADMIN';
  const open = PURCHASE_OPEN_STATUSES.includes(row?.status ?? '');
  const received = (row?.receipts ?? []).length > 0;
  const lines = (row?.lines ?? []).map((line) => ({ ...line, unitPrice: line.unitCost }));

  return (
    <section
      aria-label="รายละเอียดใบสั่งซื้อ"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/purchases" className="text-sm text-[#1a58a7] hover:underline print:hidden">
        ← กลับรายการใบสั่งซื้อ
      </Link>
      <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดใบสั่งซื้อ..." />
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
                {edit ? `แก้ไขใบสั่งซื้อ ${row.code}` : `ใบสั่งซื้อ ${row.code}`}
              </h1>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                สร้างโดย {row.createdByName || '—'} · {dateTime(row.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PrintButton />
              <StatusBadge value={row.status} />
            </div>
          </div>
          {row.closeReason && (
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
              <p className="poppins-semibold text-slate-600">เหตุผล ({row.status})</p>
              <p className="mt-1 whitespace-pre-wrap text-[#344256]">{row.closeReason}</p>
            </div>
          )}
          {edit ? (
            options ? (
              <PurchaseForm
                key={row.updatedAt}
                options={options}
                initial={{
                  code: row.code,
                  orderDate: row.orderDate,
                  expectedOn: row.expectedOn,
                  notes: row.notes,
                  lines: (row.lines ?? []).map((line) => ({
                    productId: line.productId,
                    quantity: String(line.quantity),
                    unitCost: line.unitCost,
                    discount: line.discount,
                  })),
                }}
                busy={busy}
                error={error}
                submitLabel="บันทึกการแก้ไข"
                onSubmit={(draft: PurchaseDraft) =>
                  setPending({ ...draft, action: 'edit', expectedUpdatedAt: row.updatedAt })
                }
                onCancel={() => {
                  setEdit(false);
                  setError('');
                }}
              />
            ) : (
              <div className="relative min-h-40">
                <LoadingComponent isVisible variant="content" label="กำลังโหลดสินค้า..." />
              </div>
            )
          ) : (
            <>
              <Section title="ข้อมูลใบสั่งซื้อ" open>
                <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Item label="วันที่สั่งซื้อ" value={dateOnly(row.orderDate)} />
                  <Item label="วันที่คาดว่าจะได้รับ" value={dateOnly(row.expectedOn)} />
                  <Item
                    label="รับแล้ว / สั่ง"
                    value={`${row.received.toLocaleString('th-TH')} / ${row.ordered.toLocaleString('th-TH')}`}
                  />
                  <Item label="หมายเหตุ" value={row.notes} />
                </dl>
              </Section>
              <Section title="รายการสินค้า" open>
                <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
                  <table className="w-full min-w-[1000px] border-collapse text-left text-sm poppins-regular text-[#344256]">
                    <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
                      <tr>
                        {[
                          '#',
                          'สินค้า',
                          'สั่ง',
                          'รับแล้ว',
                          'ค้างรับ',
                          'ต้นทุน/หน่วย (รวม VAT)',
                          'ส่วนลด (บาท)',
                          'รวม',
                          '',
                        ].map((label, index) => (
                          <th key={index} scope="col" className="px-4 py-3 poppins-medium">
                            {label || <span className="sr-only">รับสินค้า</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line, index) => (
                        <tr key={line.id} className="border-b border-[#edf1f5] last:border-b-0">
                          <td className={cellClass}>{index + 1}</td>
                          <td className={cellClass}>
                            <p className="poppins-medium">{line.productName}</p>
                            {line.productCode && (
                              <p className="mt-1 text-xs text-[#718096]">{line.productCode}</p>
                            )}
                          </td>
                          <td className={`${cellClass} whitespace-nowrap text-right`}>
                            {line.quantity.toLocaleString('th-TH')} {line.unit}
                          </td>
                          <td className={`${cellClass} whitespace-nowrap text-right`}>
                            {line.received.toLocaleString('th-TH')}
                          </td>
                          <td
                            className={`${cellClass} whitespace-nowrap text-right ${line.remaining > 0 ? 'poppins-medium text-orange-600' : ''}`}
                          >
                            {line.remaining.toLocaleString('th-TH')}
                          </td>
                          <td className={`${cellClass} text-right`}>{money(line.unitCost)}</td>
                          <td className={`${cellClass} text-right`}>
                            {Number(line.discount) ? money(line.discount) : '—'}
                          </td>
                          <td className={`${cellClass} text-right poppins-medium`}>
                            {money(lineTotal(line))}
                          </td>
                          <td className={`${cellClass} whitespace-nowrap text-right`}>
                            {admin && open && line.remaining > 0 && (
                              <Link
                                href={`/products/stock/create?purchaseOrderLineId=${line.id}`}
                                className="text-sm poppins-medium text-[#1a58a7] hover:underline"
                              >
                                รับสินค้า
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Totals lines={lines} />
              </Section>
              <Section title="ประวัติรับเข้า" open={received}>
                {received ? (
                  <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
                    <table className="w-full min-w-[860px] border-collapse text-left text-sm poppins-regular text-[#344256]">
                      <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
                        <tr>
                          {[
                            'ID รับเข้า',
                            'สินค้า',
                            'จำนวน',
                            'ต้นทุนรวมล็อต',
                            'คลัง',
                            'ผู้รับ / เวลา',
                          ].map((label) => (
                            <th key={label} scope="col" className="px-4 py-3 poppins-medium">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(row.receipts ?? []).map((receipt) => (
                          <tr
                            key={receipt.id}
                            className="border-b border-[#edf1f5] last:border-b-0"
                          >
                            <td className={`${cellClass} whitespace-nowrap`}>
                              <Link
                                href={`/products/stock/receipts/${receipt.lotId}`}
                                className="poppins-medium text-[#1a58a7] hover:underline"
                              >
                                {receipt.code}
                              </Link>
                            </td>
                            <td className={cellClass}>{receipt.productName}</td>
                            <td className={`${cellClass} whitespace-nowrap text-right`}>
                              {receipt.quantity.toLocaleString('th-TH')} {receipt.unit}
                            </td>
                            <td className={`${cellClass} text-right`}>
                              {money(receipt.totalCost)}
                            </td>
                            <td className={cellClass}>{receipt.warehouseName}</td>
                            <td className={cellClass}>
                              <p>{receipt.actorName}</p>
                              <p className="mt-1 text-xs text-[#718096]">
                                {dateTime(receipt.createdAt)}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-[#718096]">ยังไม่รับสินค้าจากใบสั่งซื้อนี้</p>
                )}
              </Section>
              {admin && open && (
                <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6 print:hidden">
                  <h2 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h2>
                  <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                    เหตุผล (บังคับเมื่อ{received ? 'ปิดใบ' : 'ยกเลิก'})
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
                      disabled={busy || !reason.trim()}
                      onClick={() => ask(received ? 'close' : 'cancel')}
                      className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {received ? 'ปิดใบ (ไม่รับส่วนที่เหลือ)' : 'ยกเลิกใบสั่งซื้อ'}
                    </button>
                    {!received && (
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
        variant={['close', 'cancel'].includes(pending?.action ?? '') ? 'danger' : 'primary'}
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
