'use client';

import { useRef, useState } from 'react';
import type { ReceiveOptions } from '@/types/api/operations';
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

type LineInput = { productId: string; quantity: string; unitCost: string; discount: string };
export type PurchaseDraft = {
  supplierId: string;
  orderDate: string;
  expectedOn: string;
  notes: string;
  lines: { productId: string; quantity: number; unitCost: string; discount: string }[];
  idempotencyKey: string;
};
const blankLine = (): LineInput => ({ productId: '', quantity: '1', unitCost: '', discount: '0' });

export default function PurchaseForm({
  options,
  initial,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  options: ReceiveOptions;
  initial?: {
    code: string;
    supplierId: string;
    supplierName: string;
    orderDate: string;
    expectedOn: string | null;
    notes: string;
    lines: LineInput[];
  };
  busy: boolean;
  error: string;
  submitLabel: string;
  onSubmit: (draft: PurchaseDraft) => void;
  onCancel: () => void;
}) {
  const [supplierId, setSupplierId] = useState(initial?.supplierId ?? '');
  const [orderDate, setOrderDate] = useState(initial?.orderDate ?? bangkokToday());
  const [expectedOn, setExpectedOn] = useState(initial?.expectedOn ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [lines, setLines] = useState<LineInput[]>(
    initial?.lines.length ? initial.lines : [blankLine()],
  );
  const [invalid, setInvalid] = useState('');
  const commandKey = useRef(crypto.randomUUID());
  const touch = () => {
    commandKey.current = crypto.randomUUID();
    setInvalid('');
  };
  const supplier = options.suppliers.find((item) => item.id === supplierId);
  const supplierChoices =
    initial && !options.suppliers.some((item) => item.id === initial.supplierId)
      ? [
          { id: initial.supplierId, code: '', name: initial.supplierName, paymentTerms: '' },
          ...options.suppliers,
        ]
      : options.suppliers;
  const product = (id: string) => options.products.find((item) => item.id === id);
  const priced = lines.map((line) => ({
    quantity: Number(line.quantity || 0),
    unitPrice: line.unitCost || 0,
    discount: line.discount || 0,
  }));
  function setLine(index: number, patch: Partial<LineInput>) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...patch } : line)));
    touch();
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!supplierId) return setInvalid('กรุณาเลือกผู้ขาย');
        if (!orderDate || orderDate > bangkokToday())
          return setInvalid('วันที่สั่งซื้อต้องไม่เกินวันนี้');
        if (expectedOn && expectedOn < orderDate)
          return setInvalid('วันที่คาดว่าจะได้รับต้องไม่ก่อนวันที่สั่งซื้อ');
        for (const [index, line] of lines.entries()) {
          if (!line.productId) return setInvalid(`กรุณาเลือกสินค้าบรรทัด ${index + 1}`);
          if (!/^[1-9]\d*$/.test(line.quantity))
            return setInvalid(`จำนวนบรรทัด ${index + 1} ต้องเป็นจำนวนเต็มมากกว่า 0`);
          if (!/^\d{1,12}(\.\d{1,2})?$/.test(line.unitCost))
            return setInvalid(`ต้นทุนต่อหน่วยบรรทัด ${index + 1} ไม่ถูกต้อง`);
          if (!/^\d{1,10}(\.\d{1,2})?$/.test(line.discount || '0'))
            return setInvalid(`ส่วนลดบรรทัด ${index + 1} ไม่ถูกต้อง`);
        }
        if (new Set(lines.map((line) => line.productId)).size !== lines.length)
          return setInvalid('สินค้าในใบสั่งซื้อต้องไม่ซ้ำกัน');
        onSubmit({
          supplierId,
          orderDate,
          expectedOn,
          notes,
          lines: lines.map((line) => ({
            productId: line.productId,
            quantity: Number(line.quantity),
            unitCost: line.unitCost,
            discount: line.discount || '0',
          })),
          idempotencyKey: commandKey.current,
        });
      }}
      aria-label={initial ? `แก้ไขใบสั่งซื้อ ${initial.code}` : 'สร้างใบสั่งซื้อ'}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-9 border-0 p-0">
        <Section title="ข้อมูลใบสั่งซื้อ" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text="เลขที่ใบสั่งซื้อ" />
              <input
                value={initial?.code ?? 'ออกอัตโนมัติเมื่อบันทึก (PO-ปี-ลำดับ)'}
                disabled
                className={inputClass}
              />
            </label>
            <label className="min-w-0">
              <FieldLabel text="ผู้ขาย" required />
              <select
                required
                value={supplierId}
                onChange={(event) => {
                  setSupplierId(event.target.value);
                  touch();
                }}
                className={inputClass}
              >
                <option value="">เลือกผู้ขาย</option>
                {supplierChoices.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.code ? ` · ${item.code}` : ''}
                  </option>
                ))}
              </select>
              {!options.suppliers.length && (
                <span className="mt-1 block text-xs text-[#718096]">
                  ยังไม่มีผู้ขายที่ใช้งาน — เพิ่มผู้ขายก่อน
                </span>
              )}
            </label>
            <div className="min-w-0">
              <FieldLabel text="วันที่สั่งซื้อ" required />
              <DateInput
                label="วันที่สั่งซื้อ"
                value={orderDate}
                max={bangkokToday()}
                onChange={(value) => {
                  setOrderDate(value);
                  touch();
                }}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel text="วันที่คาดว่าจะได้รับ" />
              <DateInput
                label="วันที่คาดว่าจะได้รับ"
                value={expectedOn}
                min={orderDate}
                required={false}
                onChange={(value) => {
                  setExpectedOn(value);
                  touch();
                }}
              />
            </div>
          </div>
          {supplier && (
            <dl className="m-0 mt-5 grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg bg-[#f7f9fc] p-4 sm:grid-cols-2">
              <Item label="รหัสผู้ขาย" value={supplier.code} />
              <Item label="เงื่อนไขชำระเงิน" value={supplier.paymentTerms} />
            </dl>
          )}
        </Section>
        <Section title="รายการสินค้า" open>
          <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm poppins-regular text-[#344256]">
              <thead className="border-b border-[#d9e3ee] bg-[#f7f9fc] text-[#65758b]">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3 poppins-medium">
                    #
                  </th>
                  <th scope="col" className="px-4 py-3 poppins-medium">
                    สินค้า <span className="text-red-600">*</span>
                  </th>
                  <th scope="col" className="w-28 px-4 py-3 poppins-medium">
                    จำนวน <span className="text-red-600">*</span>
                  </th>
                  <th scope="col" className="w-40 px-4 py-3 poppins-medium">
                    ต้นทุน/หน่วย (รวม VAT) <span className="text-red-600">*</span>
                  </th>
                  <th scope="col" className="w-32 px-4 py-3 poppins-medium">
                    ส่วนลด (บาท)
                  </th>
                  <th scope="col" className="w-32 px-4 py-3 text-right poppins-medium">
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
                    <tr key={index} className="border-b border-[#edf1f5] last:border-b-0">
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
                              {item.name} · {item.code}
                            </option>
                          ))}
                        </select>
                        {selected && (
                          <p className="mt-1 text-xs text-[#718096]">หน่วย: {selected.unit}</p>
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
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          aria-label={`ต้นทุนต่อหน่วย ${index + 1}`}
                          value={line.unitCost}
                          onChange={(event) => setLine(index, { unitCost: event.target.value })}
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
            className="mt-4 rounded-lg border border-[#d9e3ee] px-4 py-2 text-sm poppins-medium text-[#1a58a7] hover:bg-blue-50"
          >
            + เพิ่มสินค้า
          </button>
          <Totals lines={priced} />
        </Section>
        <Section title="หมายเหตุ" open={Boolean(initial?.notes)}>
          <textarea
            aria-label="หมายเหตุ"
            value={notes}
            rows={3}
            maxLength={1000}
            onChange={(event) => {
              setNotes(event.target.value);
              touch();
            }}
            className={`${inputClass} mt-0 min-h-24 resize-y`}
          />
        </Section>
      </fieldset>
      {(invalid || error) && (
        <p role="alert" className="mt-6 text-sm poppins-regular text-red-600">
          {invalid || error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={`w-36 ${secondaryButton}`}
        >
          ยกเลิก
        </button>
        <button type="submit" disabled={busy} className={`min-w-36 ${primaryButton}`}>
          {busy ? 'กำลังบันทึก...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
