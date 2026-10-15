'use client';

// Shared create/edit form for sales orders (TASK-274) and quotations (TASK-275). Saving goes
// through the caller so the confirmation dialog, idempotency key and API call stay with each page.
import { useEffect, useRef, useState } from 'react';
import { Get } from '@/service/http';
import type { PromotionPage, PromotionRow } from '@/types/api/promotions';
import { conditionText, rewardText } from '@/components/promotions/promotion-form';
import type { OperationOptions } from '@/types/api/operations';
import { CloseIcon } from '@/components/icons/status-icons';
import {
  DateInput,
  FieldLabel,
  Item,
  Section,
  Totals,
  bangkokToday,
  inputClass,
  lineTotal,
  money,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

type Kind = 'order' | 'quote';
// unitPrice is the price already locked on a saved document; new lines use the current price.
type LineInput = { productId: string; quantity: string; discount: string; unitPrice?: string };
export type DocumentDraft = {
  customerId: string;
  notes: string;
  validUntil?: string;
  promotionId: string;
  lines: { productId: string; quantity: number; discount: string }[];
  idempotencyKey: string;
};
const labels: Record<Kind, { name: string; numberHint: string }> = {
  order: { name: 'คำสั่งซื้อ', numberHint: 'SO' },
  quote: { name: 'ใบเสนอราคา', numberHint: 'QT' },
};
const blankLine = (): LineInput => ({ productId: '', quantity: '1', discount: '0' });

export default function DocumentForm({
  kind,
  options,
  initial,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  kind: Kind;
  options: OperationOptions;
  initial?: {
    code: string;
    customerId: string;
    notes: string;
    validUntil?: string | null;
    promotionId?: string | null;
    lines: LineInput[];
  };
  busy: boolean;
  error: string;
  submitLabel: string;
  onSubmit: (draft: DocumentDraft) => void;
  onCancel: () => void;
}) {
  const editing = Boolean(initial);
  const text = labels[kind];
  const [customerId, setCustomerId] = useState(initial?.customerId ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [validUntil, setValidUntil] = useState(initial?.validUntil ?? bangkokToday(30));
  const [promotionId, setPromotionId] = useState(initial?.promotionId ?? '');
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    Get<PromotionPage>('/api/promotions?status=ใช้งาน&limit=100', controller.signal)
      .then((response) => setPromotions(response.data))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const promotion = promotions.find((item) => item.id === promotionId);
  const [lines, setLines] = useState<LineInput[]>(
    initial?.lines.length ? initial.lines : [blankLine()],
  );
  // A retry of unchanged content reuses the key; any edit starts a new command.
  const commandKey = useRef(crypto.randomUUID());
  const touch = () => {
    commandKey.current = crypto.randomUUID();
  };
  const customer = options.customers.find((item) => item.id === customerId);
  const product = (id: string) => options.products.find((item) => item.id === id);
  const locked = new Map((initial?.lines ?? []).map((line) => [line.productId, line.unitPrice]));
  const priced = lines.map((line) => ({
    quantity: Number(line.quantity || 0),
    unitPrice: locked.get(line.productId) ?? product(line.productId)?.salePrice ?? 0,
    discount: line.discount || 0,
  }));
  function setLine(index: number, patch: Partial<LineInput>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
    touch();
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          customerId,
          notes,
          ...(kind === 'quote' ? { validUntil } : {}),
          promotionId,
          lines: lines.map((line) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            discount: line.discount || '0',
          })),
          idempotencyKey: commandKey.current,
        });
      }}
      aria-label={editing ? `แก้ไข${text.name} ${initial?.code}` : `สร้าง${text.name}`}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-9 border-0 p-0">
        <Section title={`ข้อมูล${text.name}`} open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text={`เลขที่${text.name}`} />
              <input
                value={initial?.code ?? `ออกอัตโนมัติเมื่อบันทึก (${text.numberHint}-ปี-ลำดับ)`}
                disabled
                className={inputClass}
              />
            </label>
            <label className="min-w-0">
              <FieldLabel text="ลูกค้า" required />
              <select
                required
                value={customerId}
                disabled={editing}
                onChange={(event) => {
                  setCustomerId(event.target.value);
                  touch();
                }}
                className={inputClass}
              >
                <option value="">เลือกลูกค้า</option>
                {options.customers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.territoryName || 'ยังไม่กำหนดเขต'}
                  </option>
                ))}
              </select>
            </label>
            {kind === 'quote' && (
              <div className="min-w-0">
                <FieldLabel text="ใช้ได้ถึง" required />
                <DateInput
                  label="ใช้ได้ถึง"
                  value={validUntil}
                  min={bangkokToday()}
                  onChange={(value) => {
                    setValidUntil(value);
                    touch();
                  }}
                />
              </div>
            )}
          </div>
          {customer && (
            <dl className="m-0 mt-5 grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg bg-[#f7f9fc] p-4 sm:grid-cols-2">
              <Item label="รหัสลูกค้า" value={customer.code} />
              <Item label="เขตขาย" value={customer.territoryName || 'ยังไม่กำหนดเขต'} />
            </dl>
          )}
        </Section>
        <Section title="รายการสินค้า" open>
          <div className="overflow-x-auto rounded-lg border border-[#e3e9f0]">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm poppins-regular text-[#344256]">
              <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3 poppins-semibold">
                    #
                  </th>
                  <th scope="col" className="px-4 py-3 poppins-semibold">
                    สินค้า <span className="text-red-600">*</span>
                  </th>
                  <th scope="col" className="w-32 px-4 py-3 poppins-semibold">
                    จำนวน <span className="text-red-600">*</span>
                  </th>
                  <th scope="col" className="w-36 px-4 py-3 poppins-semibold">
                    ส่วนลด (บาท)
                  </th>
                  <th scope="col" className="w-36 px-4 py-3 text-right poppins-semibold">
                    รวม (บาท)
                  </th>
                  <th scope="col" className="w-16 px-4 py-3">
                    <span className="sr-only">ลบ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => {
                  const selected = product(line.productId);
                  return (
                    <tr key={index} className="border-t border-[#edf0f4]">
                      <td className="px-4 py-3 align-top pt-6">{index + 1}</td>
                      <td className="px-4 py-3 align-top">
                        <select
                          required
                          aria-label={`สินค้า ${index + 1}`}
                          value={line.productId}
                          onChange={(event) => setLine(index, { productId: event.target.value })}
                          className={inputClass}
                        >
                          <option value="">เลือกสินค้า</option>
                          {options.products.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} · พร้อมขาย {item.available} {item.unit}
                            </option>
                          ))}
                        </select>
                        {selected && (
                          <p className="mt-1 text-xs text-[#718096]">
                            ราคา {money(priced[index].unitPrice)} บาท / {selected.unit} (รวม VAT)
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          required
                          type="number"
                          min="1"
                          step="1"
                          aria-label={`จำนวน ${index + 1}`}
                          value={line.quantity}
                          onChange={(event) => setLine(index, { quantity: event.target.value })}
                          className={`${inputClass} text-right`}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          aria-label={`ส่วนลด ${index + 1}`}
                          value={line.discount}
                          onChange={(event) => setLine(index, { discount: event.target.value })}
                          className={`${inputClass} text-right`}
                        />
                      </td>
                      <td className="px-4 py-3 pt-6 text-right align-top poppins-medium">
                        {money(lineTotal(priced[index]))}
                      </td>
                      <td className="px-4 py-3 pt-4 text-right align-top">
                        <button
                          type="button"
                          aria-label={`ลบสินค้าบรรทัด ${index + 1}`}
                          title="ลบบรรทัด"
                          disabled={lines.length === 1}
                          onClick={() => {
                            setLines((current) => current.filter((_, i) => i !== index));
                            touch();
                          }}
                          className="inline-grid h-9 w-9 place-items-center rounded-md text-red-600 hover:bg-red-50 disabled:text-[#c3cad5] disabled:hover:bg-transparent"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => {
              setLines((current) => [...current, blankLine()]);
              touch();
            }}
            className={`mt-4 ${secondaryButton}`}
          >
            + เพิ่มสินค้า
          </button>
          <Totals lines={priced} />
        </Section>
        <Section title="โปรโมชัน" open={Boolean(promotionId)}>
          <label className="block min-w-0">
            <FieldLabel text="โปรโมชันที่ใช้ (1 โปรต่อเอกสาร)" />
            <select
              value={promotionId}
              onChange={(event) => {
                setPromotionId(event.target.value);
                touch();
              }}
              className={inputClass}
            >
              <option value="">ไม่ใช้โปรโมชัน</option>
              {initial?.promotionId && !promotion && (
                <option value={initial.promotionId}>โปรโมชันเดิมของเอกสารนี้</option>
              )}
              {promotions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
            </select>
          </label>
          {promotion && (
            <p className="mt-3 text-sm text-[#53647c]">
              เงื่อนไข {conditionText(promotion)} จากสินค้าที่ร่วม {promotion.productCount} รายการ →{' '}
              {rewardText(promotion)}. ระบบตรวจเงื่อนไขและเพิ่มของแถม/ส่วนลดท้ายบิลเมื่อบันทึก
            </p>
          )}
        </Section>
        <Section title="หมายเหตุ" open={Boolean(initial?.notes)}>
          <textarea
            aria-label="หมายเหตุ"
            value={notes}
            rows={3}
            onChange={(event) => {
              setNotes(event.target.value);
              touch();
            }}
            className={`${inputClass} mt-0 min-h-24 resize-y`}
          />
        </Section>
      </fieldset>
      {error && (
        <p role="alert" className="mt-6 text-sm poppins-regular text-red-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={secondaryButton}
        >
          ยกเลิก
        </button>
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'กำลังบันทึก...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
