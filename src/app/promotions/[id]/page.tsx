'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { ReceiveOptions } from '@/types/api/operations';
import type { PromotionRow } from '@/types/api/promotions';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import PromotionForm, {
  conditionText,
  rewardText,
  type PromotionDraft,
} from '@/components/promotions/promotion-form';
import {
  Item,
  Section,
  dateOnly,
  dateTime,
  inputClass,
  secondaryButton,
} from '@/components/sales/document-ui';

type Command = Record<string, unknown> & { action: string };
const cellClass = 'px-4 py-3 align-top';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<PromotionRow | null>(null);
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
    Get<{ data: PromotionRow; actor: { roleId: string } }>(
      '/api/promotions/' + encodeURIComponent(params.id),
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
      await Update('/api/promotions/' + row.id, command);
      setNotice(command.action === 'cancel' ? 'ยกเลิกโปรโมชันแล้ว' : 'บันทึกการแก้ไขแล้ว');
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

  if (missing && !loading)
    return (
      <NotFoundComponent
        title="ไม่พบโปรโมชัน"
        backLabel="กลับรายการโปรโมชัน"
        onBack={() => history.back()}
      />
    );

  const admin = role === 'ADMIN';
  const active = row && row.savedStatus !== 'ยกเลิก';

  return (
    <section
      aria-label="รายละเอียดโปรโมชัน"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/promotions" className="text-sm text-[#1a58a7] hover:underline">
        ← กลับรายการโปรโมชัน
      </Link>
      <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดโปรโมชัน..." />
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
                {edit ? `แก้ไขโปรโมชัน ${row.code}` : row.name}
              </h1>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                สร้างโดย {row.createdByName || '—'} · {dateTime(row.createdAt)}
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
            options ? (
              <PromotionForm
                key={row.updatedAt}
                options={options}
                initial={{
                  code: row.code,
                  name: row.name,
                  status: row.savedStatus,
                  startsOn: row.startsOn,
                  endsOn: row.endsOn,
                  minType: row.minType,
                  minValue: row.minType === 'จำนวน' ? String(Number(row.minValue)) : row.minValue,
                  rewardType: row.rewardType,
                  discountValue: row.rewardType === 'ของแถม' ? '' : row.discountValue,
                  description: row.description,
                  notes: row.notes,
                  productIds: (row.products ?? []).map((item) => item.productId),
                  gifts: (row.gifts ?? []).map((gift) => ({
                    productId: gift.productId,
                    quantity: String(gift.quantity),
                    warehouseId: gift.warehouseId,
                  })),
                }}
                busy={busy}
                error={error}
                submitLabel="บันทึกการแก้ไข"
                onSubmit={(draft: PromotionDraft) =>
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
              <Section title="ข้อมูลโปรโมชัน" open>
                <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Item label="วันเริ่ม" value={dateOnly(row.startsOn)} />
                  <Item label="วันสิ้นสุด" value={dateOnly(row.endsOn)} />
                  <Item label="เงื่อนไข" value={conditionText(row)} />
                  <Item label="ของแถม / ส่วนลด" value={rewardText(row)} />
                  <Item label="รายละเอียด" value={row.description} wide />
                  <Item label="หมายเหตุ" value={row.notes} wide />
                </dl>
              </Section>
              <Section title="สินค้าที่ร่วมรายการ" open>
                <ul className="divide-y divide-[#edf1f5] rounded-lg border border-[#d9e3ee] text-sm">
                  {(row.products ?? []).map((item) => (
                    <li key={item.productId} className="flex flex-wrap gap-x-3 px-4 py-3">
                      <Link
                        href={'/products/' + encodeURIComponent(item.productCode)}
                        className="poppins-medium text-[#1a58a7] hover:underline"
                      >
                        {item.productCode}
                      </Link>
                      <span>{item.productName}</span>
                    </li>
                  ))}
                </ul>
              </Section>
              {row.rewardType === 'ของแถม' && (
                <Section title="ของแถม" open>
                  <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
                    <table className="w-full min-w-[600px] border-collapse text-left text-sm poppins-regular text-[#344256]">
                      <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
                        <tr>
                          {['#', 'สินค้า', 'จำนวน', 'ตัดจากคลัง'].map((label) => (
                            <th key={label} scope="col" className="px-4 py-3 poppins-medium">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(row.gifts ?? []).map((gift, index) => (
                          <tr key={gift.id} className="border-b border-[#edf1f5] last:border-b-0">
                            <td className={cellClass}>{index + 1}</td>
                            <td className={cellClass}>
                              <p className="poppins-medium">{gift.productName}</p>
                              {gift.productCode && (
                                <p className="mt-1 text-xs text-[#718096]">{gift.productCode}</p>
                              )}
                            </td>
                            <td className={`${cellClass} whitespace-nowrap`}>
                              {gift.quantity.toLocaleString('th-TH')} {gift.unit}
                            </td>
                            <td className={cellClass}>{gift.warehouseName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}
              {admin && active && (
                <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
                  <h2 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h2>
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
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
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
                      ยกเลิกโปรโมชัน
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
        title={pending?.action === 'cancel' ? 'ยืนยันยกเลิกโปรโมชัน?' : 'ยืนยันบันทึกการแก้ไข?'}
        description={
          pending?.action === 'cancel'
            ? 'ยกเลิกแล้วแก้ไขหรือใช้งานโปรโมชันนี้ไม่ได้'
            : 'เงื่อนไขใหม่มีผลทันทีตามช่วงวันที่'
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
