'use client';
import SortableTable from '@/components/ui/sortable-table';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Get, Post, HttpError } from '@/service/http';
import type { PageData, LotRow } from '@/types/api/operations';

import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import ListRequestState from '@/components/ui/list-request-state';
import SuccessAlertComponent from '@/components/ui/success-alert-component';

type Draft = {
  quantity: string;
  totalCost: string;
  manufacturedOn: string;
  expiresOn: string;
  warehouseId: string;
  reason: string;
};
type Correction = Draft & { action: 'correct'; lotId: string; idempotencyKey: string };
const editableFields: Record<string, keyof Draft> = {
  จำนวนรับเข้า: 'quantity',
  ต้นทุนรวมล็อต: 'totalCost',
  วันผลิต: 'manufacturedOn',
  วันหมดอายุ: 'expiresOn',
};

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<PageData<LotRow> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [original, setOriginal] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pending, setPending] = useState<Correction | null>(null);
  const [alert, setAlert] = useState<'cancel' | 'save' | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      setIsAdmin(false);
      setEditing(false);
      setDraft(null);
      setOriginal(null);
      setPending(null);
      setSaveError('');
      Get<PageData<LotRow>>(
        '/api/inventory?view=receipt-items&lotId=' + encodeURIComponent(id) + '&limit=1&offset=0',
        controller.signal,
      )
        .then((value) => {
          if (!controller.signal.aborted) {
            setResult(value);
            setIsAdmin(value.capabilities?.canCorrectReceipt === true);
          }
        })
        .catch((caught) => {
          if (!controller.signal.aborted) {
            setMissing(caught instanceof HttpError && caught.status === 404);
            setError(caught instanceof Error ? caught.message : 'โหลดรายละเอียดสินค้าไม่สำเร็จ');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, retry]);
  const lot = result?.data.find((item) => item.id === id);
  function beginEdit() {
    if (!lot || !isAdmin) return;
    const value: Draft = {
      quantity: String(lot.receivedQuantity),
      totalCost: lot.totalCost ?? '',
      manufacturedOn: lot.manufacturedOn.slice(0, 10),
      expiresOn: lot.expiresOn.slice(0, 10),
      warehouseId:
        lot.balances.find((balance) => balance.warehouseCode === 'MAIN')?.warehouseId ??
        lot.balances[0]?.warehouseId ??
        '',
      reason: '',
    };
    setDraft(value);
    setOriginal(value);
    setSaveError('');
    setEditing(true);
  }
  function cancelEdit() {
    if (busy || pending) return;
    if (JSON.stringify(draft) !== JSON.stringify(original)) setAlert('cancel');
    else setEditing(false);
  }
  async function saveEdit() {
    if (!lot || !draft || !isAdmin || busy) return;
    setSaveError('');
    let body = pending;
    if (!body) {
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
      if (
        !/^\d+$/.test(draft.quantity) ||
        Number(draft.quantity) < 1 ||
        Number(draft.quantity) > 100000000
      ) {
        setSaveError('กรอกจำนวนรับเข้าเป็นจำนวนเต็ม 1–100,000,000');
        return;
      }
      if (!/^\d{1,12}(\.\d{1,2})?$/.test(draft.totalCost)) {
        setSaveError('กรอกต้นทุนรวมล็อตตั้งแต่ 0 และทศนิยมไม่เกิน 2 ตำแหน่ง');
        return;
      }
      if (
        !draft.manufacturedOn ||
        !draft.expiresOn ||
        draft.manufacturedOn > today ||
        draft.expiresOn <= draft.manufacturedOn
      ) {
        setSaveError('วันผลิตต้องไม่เกินวันนี้ และวันหมดอายุต้องหลังวันผลิต');
        return;
      }
      if (
        !lot.balances.some((balance) => balance.warehouseId === draft.warehouseId) ||
        !draft.reason.trim()
      ) {
        setSaveError('เลือกคลังที่ปรับผลต่างและกรอกเหตุผลการแก้ไข');
        return;
      }
      body = {
        ...draft,
        reason: draft.reason.trim(),
        action: 'correct',
        lotId: lot.id,
        idempotencyKey: crypto.randomUUID(),
      };
      setPending(body);
    }
    setBusy(true);
    try {
      await Post('/api/inventory', body);
      setPending(null);
      setEditing(false);
      setAlert('save');
      setRetry((value) => value + 1);
    } catch (caught) {
      const definitive = caught instanceof HttpError && caught.status >= 400 && caught.status < 500;
      if (definitive) setPending(null);
      setSaveError(
        (caught instanceof Error ? caught.message : 'บันทึกไม่สำเร็จ') +
          (definitive ? '' : ' กดลองบันทึกอีกครั้งเพื่อส่งคำขอเดิม'),
      );
    } finally {
      setBusy(false);
    }
  }
  const inputClass =
    'mt-2 min-h-11 w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular outline-none focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100 disabled:bg-[#f8f9fb]';
  if (missing && !loading) return <NotFoundComponent />;
  return (
    <section className="min-w-0 space-y-6 px-4 py-6 text-[#344256] md:px-6 md:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg poppins-semibold text-[#1a58a7]">
          รายละเอียดการเติมสินค้า{lot ? ' · ' + lot.receiptCode : ''}
        </h2>
        <Link
          href="/products/stock"
          className="rounded-md border border-[#d9e3ee] px-4 py-2 text-sm poppins-medium text-[#1a58a7] hover:bg-blue-50"
        >
          กลับรายงานสต็อก
        </Link>
      </div>
      <ListRequestState error={error} retry={() => setRetry((value) => value + 1)} />
      {loading ? (
        <LoadingComponent isVisible />
      ) : (
        !error &&
        (lot ? (
          <>
            <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
              <h3 className="mb-4 text-base poppins-semibold text-[#1a58a7]">
                ข้อมูลสินค้าที่เติม
              </h3>
              <dl className="flex flex-wrap gap-x-8 gap-y-5">
                <div className="basis-full">
                  <dt className="text-sm poppins-medium">สินค้า</dt>
                  <dd className="mt-2 min-h-11 rounded-md border border-[#d9e3ee] bg-[#f8f9fb] px-3 py-2.5 text-sm">
                    <Link
                      href={'/products/' + encodeURIComponent(lot.productCode)}
                      className="text-[#1a58a7] hover:underline"
                    >
                      {lot.productCode} · {lot.productName}
                    </Link>
                  </dd>
                </div>
                {[
                  ['ID', lot.receiptCode],
                  ['วันและเวลา', dateTime(lot.createdAt)],
                  ['จำนวนรับเข้า', lot.receivedQuantity.toLocaleString('th-TH') + ' ' + lot.unit],
                  ['จำนวนคงเหลือ', lot.quantity.toLocaleString('th-TH') + ' ' + lot.unit],
                  ['วันผลิต', dateOnly(lot.manufacturedOn)],
                  ['วันหมดอายุ', dateOnly(lot.expiresOn)],
                  ...(lot.totalCost !== undefined ? [['ต้นทุนรวมล็อต', money(lot.totalCost)]] : []),
                  ...(lot.unitCost !== undefined ? [['ต้นทุนต่อชิ้น', money(lot.unitCost)]] : []),
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="min-w-0 basis-full md:basis-[calc(50%-1rem)] md:flex-1"
                  >
                    <dt className="text-sm poppins-medium">{label}</dt>
                    {editing && draft && editableFields[label] ? (
                      <dd>
                        <input
                          aria-label={label}
                          type={editableFields[label].endsWith('On') ? 'date' : 'text'}
                          inputMode={
                            editableFields[label] === 'quantity'
                              ? 'numeric'
                              : editableFields[label] === 'totalCost'
                                ? 'decimal'
                                : undefined
                          }
                          value={draft[editableFields[label]]}
                          disabled={busy || Boolean(pending)}
                          onChange={(event) =>
                            setDraft({ ...draft, [editableFields[label]]: event.target.value })
                          }
                          className={inputClass}
                        />
                      </dd>
                    ) : (
                      <dd className="mt-2 min-h-11 break-words rounded-md border border-[#d9e3ee] bg-[#f8f9fb] px-3 py-2.5 text-sm">
                        {editing && draft && label === 'ต้นทุนต่อชิ้น'
                          ? Number(draft.quantity) > 0 && Number.isFinite(Number(draft.totalCost))
                            ? money(String(Number(draft.totalCost) / Number(draft.quantity)))
                            : '—'
                          : value}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
              {editing && draft && (
                <div className="mt-5 flex flex-wrap gap-5">
                  <label className="min-w-0 basis-full text-sm poppins-medium md:flex-1">
                    คลังที่ปรับผลต่าง <span className="text-red-600">*</span>
                    <select
                      aria-label="คลังที่ปรับผลต่าง"
                      value={draft.warehouseId}
                      disabled={busy || Boolean(pending)}
                      onChange={(event) => setDraft({ ...draft, warehouseId: event.target.value })}
                      className={inputClass}
                    >
                      <option value="">เลือกคลัง</option>
                      {lot.balances.map((balance) => (
                        <option key={balance.warehouseId} value={balance.warehouseId}>
                          {balance.warehouseName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="min-w-0 basis-full text-sm poppins-medium md:flex-1">
                    เหตุผลการแก้ไข <span className="text-red-600">*</span>
                    <input
                      aria-label="เหตุผลการแก้ไข"
                      value={draft.reason}
                      maxLength={200}
                      disabled={busy || Boolean(pending)}
                      onChange={(event) => setDraft({ ...draft, reason: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
              <h3 className="mb-4 text-base poppins-semibold text-[#1a58a7]">คงเหลือแยกคลัง</h3>
              <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
                <SortableTable className="w-full whitespace-nowrap text-left text-sm">
                  <thead className="bg-[#f7f9fc] text-[#65758b]">
                    <tr>
                      {['คลัง', 'จำนวนคงเหลือ'].map((label) => (
                        <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lot.balances.map((balance) => (
                      <tr key={balance.id} className="border-t border-[#d9e3ee]">
                        <td className="px-4 py-3">{balance.warehouseName}</td>
                        <td className="px-4 py-3">
                          {balance.quantity.toLocaleString('th-TH')} {balance.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </SortableTable>
                {!lot.balances.length && (
                  <p className="p-6 text-center text-sm text-[#65758b]">
                    ไม่มีข้อมูลยอดคลังของสินค้าที่เติมครั้งนี้
                  </p>
                )}
              </div>
            </div>
            {saveError && (
              <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {saveError}
              </p>
            )}
            {isAdmin && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
                {editing ? (
                  <>
                    <button
                      type="button"
                      disabled={busy || Boolean(pending)}
                      onClick={cancelEdit}
                      className="rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-sm poppins-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={saveEdit}
                      className="rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] disabled:opacity-50"
                    >
                      {busy ? 'กำลังบันทึก…' : pending ? 'ลองบันทึกอีกครั้ง' : 'บันทึก'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={beginEdit}
                    className="rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b]"
                  >
                    แก้ไข
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <NotFoundComponent title="ไม่พบข้อมูลสินค้าที่เติม" />
        ))
      )}
      <SuccessAlertComponent
        isOpen={alert !== null}
        title={alert === 'save' ? 'บันทึกการแก้ไขแล้ว' : 'ยกเลิกการแก้ไข'}
        description={
          alert === 'save'
            ? 'บันทึกข้อมูลการเติมสต็อกแล้ว ระบบกำลังโหลดข้อมูลล่าสุด'
            : 'ข้อมูลที่เปลี่ยนในรอบนี้จะไม่ถูกบันทึก กดตกลงเพื่อกลับไปดูข้อมูลเดิม'
        }
        onClose={() => {
          if (alert === 'cancel') {
            setDraft(original);
            setEditing(false);
            setSaveError('');
          }
          setAlert(null);
        }}
      />
    </section>
  );
}

const dateOnly = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value.slice(0, 10) + 'T00:00:00+07:00'));

const dateTime = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));

const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
