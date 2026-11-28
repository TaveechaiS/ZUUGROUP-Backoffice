'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { OperationOptions, OrderRow } from '@/types/api/operations';
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
  dateTime,
  lineTotal,
  inputClass,
  money,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
const confirmText: Record<string, [string, string]> = {
  edit: [
    'ยืนยันบันทึกการแก้ไข?',
    'ระบบจะล้างการจองเดิมแล้วจองล็อตใหม่ตามรายการที่แก้ เอกสารกลับเป็นรอตรวจ',
  ],
  approve: ['ยืนยันอนุมัติ?', 'เอกสารจะส่งต่อให้ Admin จัดของ'],
  return: ['ยืนยันส่งกลับแก้ไข?', 'ผู้สร้างจะเห็นเหตุผลและแก้ไขแล้วส่งใหม่ ยอดจองยังกันไว้'],
  cancel: ['ยืนยันยกเลิกคำสั่งซื้อ?', 'ระบบจะคืนยอดจองทั้งหมด ยกเลิกแล้วแก้ไม่ได้'],
  complete: ['ยืนยันจัดของและตัดคลัง?', 'เอกสารจะเป็นเสร็จสิ้นและตัดสินค้าตามล็อตที่จองไว้'],
};
const doneText: Record<string, string> = {
  edit: 'บันทึกการแก้ไขและจองใหม่แล้ว',
  approve: 'อนุมัติแล้ว',
  return: 'ส่งกลับแก้ไขแล้ว',
  cancel: 'ยกเลิกและคืนยอดจองแล้ว',
  complete: 'จัดของและตัดคลังแล้ว',
};
const cellClass = 'px-4 py-3 align-top';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [options, setOptions] = useState<OperationOptions | null>(null);
  const [row, setRow] = useState<OrderRow | null>(null);
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
    Get<{ data: OperationOptions }>('/api/inventory?view=options', controller.signal)
      .then((response) => setOptions(response.data))
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [version]);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: OrderRow }>('/api/orders/' + encodeURIComponent(params.id), controller.signal)
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
      await Update<{ data: { id: string } }>('/api/orders/' + row.id, command);
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
        title="ไม่พบคำสั่งซื้อ"
        backLabel="กลับรายการคำสั่งซื้อ"
        onBack={() => history.back()}
      />
    );

  const role = options?.actor.roleId ?? '';
  const isCreator = role === 'SALES' && row?.createdById === options?.actor.id;
  const open =
    Boolean(row?.workflowManaged) && !['เสร็จสิ้น', 'ยกเลิก'].includes(row?.status ?? '');
  const canEdit =
    open &&
    ((isCreator && ['รอตรวจ', 'ส่งกลับแก้ไข'].includes(row?.status ?? '')) ||
      role === 'MANAGER' ||
      role === 'ADMIN');
  const canDecide = ['MANAGER', 'ADMIN'].includes(role);
  const canCancel = canDecide || isCreator;

  return (
    <section
      aria-label="รายละเอียดคำสั่งซื้อ"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/orders" className="text-sm text-[#1a58a7] hover:underline print:hidden">
        ← กลับรายการคำสั่งซื้อ
      </Link>
      <LoadingComponent
        isVisible={loading || !options}
        variant="content"
        label="กำลังโหลดคำสั่งซื้อ..."
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
                {edit ? `แก้ไขคำสั่งซื้อ ${row.code}` : row.customerName}
              </h2>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                {row.territoryName || 'ยังไม่กำหนดเขต'} · สร้างโดย {row.createdByName || '—'} ·{' '}
                {dateTime(row.createdAt)}
              </p>
            </div>
            <StatusBadge value={row.status} />
          </div>
          {row.returnReason && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${row.status === 'ยกเลิก' ? 'border-red-100 bg-red-50' : 'border-orange-100 bg-orange-50'}`}
            >
              <p
                className={`poppins-semibold ${row.status === 'ยกเลิก' ? 'text-red-600' : 'text-orange-600'}`}
              >
                เหตุผล ({row.status})
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[#344256]">{row.returnReason}</p>
            </div>
          )}
          {!row.workflowManaged && (
            <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm poppins-regular text-[#1a58a7]">
              เอกสารเดิมมีเฉพาะข้อมูลหัวเอกสาร จึงยังไม่มีรายการจองล็อตหรือการตัดคลัง
            </p>
          )}
          {edit ? (
            <DocumentForm
              kind="order"
              key={row.updatedAt}
              options={options}
              initial={{
                code: row.code,
                customerId: row.customerId ?? '',
                notes: row.notes,
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
              submitLabel="บันทึกและจองใหม่"
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
              <Section title="ข้อมูลคำสั่งซื้อ" open>
                <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Item label="ลูกค้า" value={row.customerName} />
                  <Item label="เขตขาย" value={row.territoryName} />
                  <Item label="สร้างเมื่อ" value={dateTime(row.createdAt)} />
                  <Item label="Sales ประจำเขต" value={row.salesName} />
                  <Item label="Manager ประจำเขต" value={row.managerName} />
                  <Item label="ผู้สร้าง" value={row.createdByName} />
                  <Item label="ผู้อนุมัติ" value={row.approvedByName} />
                  <Item label="ผู้จัดและตัดคลัง" value={row.completedByName} />
                  <Item
                    label="ใบเสนอราคาอ้างอิง"
                    value={
                      row.quotationCode ? (
                        <Link
                          href={`/quotes/${row.quotationId}`}
                          className="poppins-medium text-[#1a58a7] hover:underline"
                        >
                          {row.quotationCode}
                        </Link>
                      ) : (
                        '— (สร้างตรง)'
                      )
                    }
                  />
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
                          'ล็อตที่จัดให้ (FEFO)',
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
                          <td className={`${cellClass} poppins-medium`}>
                            {line.productName}
                            {line.isGift && (
                              <span className="ml-2 inline-block align-middle">
                                <StatusBadge value="ของแถม" />
                              </span>
                            )}
                          </td>
                          <td className={`${cellClass} text-right`}>
                            {line.quantity.toLocaleString('th-TH')}
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
                          <td className={cellClass}>
                            {line.allocations.length ? (
                              <ul className="m-0 list-none space-y-1 p-0 text-xs">
                                {line.allocations.map((allocation) => (
                                  <li
                                    key={allocation.id}
                                    className="flex flex-wrap items-center gap-2"
                                  >
                                    <span className="poppins-medium">{allocation.lotNumber}</span>
                                    <span className="text-[#718096]">
                                      {allocation.quantity.toLocaleString('th-TH')}
                                    </span>
                                    <StatusBadge value={allocation.status} />
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-xs text-[#718096]">ไม่มีล็อตที่จอง</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Totals lines={row.lines ?? []} billDiscount={row.billDiscount} />
                <dl className="m-0 ml-auto mt-2 grid max-w-sm grid-cols-[1fr_auto] gap-x-6 gap-y-2 text-sm">
                  {row.costAmount !== undefined && (
                    <>
                      <dt className="text-[#65758b]">ต้นทุนที่จ่าย</dt>
                      <dd className="m-0 text-right">{money(row.costAmount)}</dd>
                      <dt className="text-[#65758b]">ผลต่างยอดขายกับต้นทุน</dt>
                      <dd className="m-0 text-right">{money(row.grossProfit)}</dd>
                    </>
                  )}
                </dl>
              </Section>
              {open && (
                <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6 print:hidden">
                  <h3 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h3>
                  <p className="mt-2 text-sm poppins-regular text-[#65758b]">
                    สร้างเอกสารแล้วจองทันที · Manager อนุมัติ · ตัดของเมื่อ Admin ยืนยันเสร็จสิ้น
                  </p>
                  {canCancel && (
                    <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                      เหตุผล (บังคับเมื่อส่งกลับแก้ไขหรือยกเลิก)
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
                        ยกเลิกและคืนจอง
                      </button>
                    )}
                    {canDecide && (
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
                        แก้รายการสินค้า
                      </button>
                    )}
                    {role === 'MANAGER' && ['รอตรวจ', 'ส่งกลับแก้ไข'].includes(row.status) && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => ask('approve')}
                        className={primaryButton}
                      >
                        อนุมัติ
                      </button>
                    )}
                    {role === 'ADMIN' && row.status === 'อนุมัติ' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => ask('complete')}
                        className={primaryButton}
                      >
                        ยืนยันจัดของและตัดคลัง
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
