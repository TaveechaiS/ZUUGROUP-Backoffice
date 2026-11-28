'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Get, Update } from '@/service/http';
import type { StockCountRow } from '@/types/api/stock-counts';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
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
type Draft = Record<string, { counted: string; note: string }>;
const cellClass = 'px-4 py-3 align-top';
const confirmText: Record<string, [string, string]> = {
  count: ['ยืนยันบันทึกจำนวนนับ?', 'บันทึกผลเพื่อเทียบยอด ไม่เปลี่ยนยอดสต็อก'],
  close: ['ยืนยันปิดรอบตรวจนับ?', 'ปิดแล้วแก้จำนวนนับไม่ได้'],
  cancel: ['ยืนยันยกเลิกรอบตรวจนับ?', 'ยกเลิกแล้วแก้ไขไม่ได้'],
};

export default function Page() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<StockCountRow | null>(null);
  const [role, setRole] = useState('');
  const [draft, setDraft] = useState<Draft>({});
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [version, setVersion] = useState(0);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState<Command | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: StockCountRow; actor: { roleId: string } }>(
      '/api/stock-counts/' + encodeURIComponent(params.id),
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return;
        setRow(response.data);
        setRole(response.actor.roleId);
        setDraft(
          Object.fromEntries(
            (response.data.lines ?? []).map((line) => [
              line.id,
              {
                counted: line.countedQuantity === null ? '' : String(line.countedQuantity),
                note: line.note,
              },
            ]),
          ),
        );
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
      await Update('/api/stock-counts/' + row.id, command);
      setNotice(
        command.action === 'count'
          ? 'บันทึกจำนวนนับแล้ว'
          : command.action === 'close'
            ? 'ปิดรอบตรวจนับแล้ว'
            : 'ยกเลิกรอบตรวจนับแล้ว',
      );
      setReason('');
      setLoading(true);
      setVersion((value) => value + 1);
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
        title="ไม่พบรอบตรวจนับ"
        backLabel="กลับรายการตรวจนับ"
        onBack={() => history.back()}
      />
    );

  const editable = role === 'ADMIN' && row?.status === 'กำลังนับ';
  const invalid = Object.values(draft).some(
    (value) => value.counted !== '' && !/^\d{1,9}$/.test(value.counted),
  );

  return (
    <section
      aria-label="รายละเอียดรอบตรวจนับ"
      className="relative min-h-80 min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/stock-counts" className="text-sm text-[#1a58a7] hover:underline">
        ← กลับรายการตรวจนับ
      </Link>
      <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดรอบตรวจนับ..." />
      {loadError && !missing && (
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
      )}
      {row && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm poppins-medium text-[#1a58a7]">{row.code}</p>
              <h2 className="mt-1 text-lg poppins-semibold break-words text-[#344256]">
                {row.name}
              </h2>
              <p className="mt-2 text-sm poppins-regular text-[#718096]">
                เริ่มโดย {row.createdByName} · {dateTime(row.createdAt)}
              </p>
            </div>
            <StatusBadge value={row.status} />
          </div>
          <Section title="ข้อมูลรอบตรวจนับ" open>
            <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              <Item label="คลัง" value={row.warehouseName} />
              <Item label="ผลตรวจนับ" value={row.resultText || 'ยังไม่คีย์จำนวนนับ'} />
              <Item label="ปิดรอบเมื่อ" value={row.closedAt ? dateTime(row.closedAt) : '—'} />
              {row.cancelReason && <Item label="เหตุผลยกเลิก" value={row.cancelReason} wide />}
              <Item label="หมายเหตุ" value={row.notes} wide />
            </dl>
          </Section>
          <Section title={`รายการล็อต (${row.lineCount})`} open>
            <div className="overflow-x-auto rounded-lg border border-[#e3e9f0]">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm poppins-regular text-[#344256]">
                <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
                  <tr>
                    {[
                      'สินค้า',
                      'ID รับเข้า / ล็อต',
                      'หมดอายุ',
                      'ยอดระบบ',
                      'นับได้',
                      'ต่าง',
                      'หมายเหตุ',
                    ].map((label) => (
                      <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(row.lines ?? []).map((line) => {
                    const value = draft[line.id] ?? { counted: '', note: '' };
                    const counted = value.counted === '' ? null : Number(value.counted);
                    const diff = counted === null ? null : counted - line.systemQuantity;
                    return (
                      <tr key={line.id} className="border-t border-[#edf0f4]">
                        <td className={cellClass}>
                          <p className="poppins-medium">{line.productName}</p>
                          <p className="mt-1 text-xs text-[#718096]">{line.productCode}</p>
                        </td>
                        <td className={cellClass}>
                          <p>{line.receiptCode}</p>
                          <p className="mt-1 text-xs text-[#718096]">ล็อต {line.lotNumber}</p>
                        </td>
                        <td className={`${cellClass} whitespace-nowrap`}>
                          {dateOnly(line.expiresOn)}
                        </td>
                        <td className={`${cellClass} whitespace-nowrap text-right`}>
                          {line.systemQuantity.toLocaleString('th-TH')} {line.unit}
                        </td>
                        <td className={`${cellClass} w-32`}>
                          {editable ? (
                            <input
                              type="number"
                              min="0"
                              step="1"
                              aria-label={`จำนวนนับ ${line.productName} ${line.lotNumber}`}
                              value={value.counted}
                              onChange={(event) =>
                                setDraft((current) => ({
                                  ...current,
                                  [line.id]: { ...value, counted: event.target.value },
                                }))
                              }
                              className={`${inputClass} mt-0 text-right`}
                            />
                          ) : (
                            <span className="block text-right">
                              {line.countedQuantity === null
                                ? '—'
                                : line.countedQuantity.toLocaleString('th-TH')}
                            </span>
                          )}
                        </td>
                        <td
                          className={`${cellClass} whitespace-nowrap text-right poppins-medium ${diff ? (diff < 0 ? 'text-red-600' : 'text-orange-600') : ''}`}
                        >
                          {diff === null
                            ? '—'
                            : `${diff > 0 ? '+' : ''}${diff.toLocaleString('th-TH')}`}
                        </td>
                        <td className={cellClass}>
                          {editable ? (
                            <input
                              aria-label={`หมายเหตุ ${line.lotNumber}`}
                              value={value.note}
                              maxLength={500}
                              onChange={(event) =>
                                setDraft((current) => ({
                                  ...current,
                                  [line.id]: { ...value, note: event.target.value },
                                }))
                              }
                              className={`${inputClass} mt-0`}
                            />
                          ) : (
                            line.note || '—'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
          {editable && (
            <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
              <h3 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการ</h3>
              <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                เหตุผล (บังคับเมื่อยกเลิกรอบ)
                <textarea
                  value={reason}
                  rows={2}
                  maxLength={1000}
                  onChange={(event) => setReason(event.target.value)}
                  className={inputClass}
                />
              </label>
              {(error || invalid) && (
                <p role="alert" className="mt-4 text-sm poppins-regular text-red-600">
                  {invalid ? 'จำนวนนับต้องเป็นจำนวนเต็มตั้งแต่ 0' : error}
                </p>
              )}
              <div className="mt-5 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
                <button
                  type="button"
                  disabled={busy || !reason.trim()}
                  onClick={() => ask({ action: 'cancel', reason })}
                  className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm poppins-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  ยกเลิกรอบ
                </button>
                <button
                  type="button"
                  disabled={busy || invalid}
                  onClick={() =>
                    ask({
                      action: 'count',
                      lines: Object.entries(draft).map(([id, value]) => ({
                        id,
                        countedQuantity: value.counted,
                        note: value.note,
                      })),
                    })
                  }
                  className={secondaryButton}
                >
                  บันทึกจำนวนนับ
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => ask({ action: 'close' })}
                  className={primaryButton}
                >
                  ปิดรอบตรวจนับ
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
