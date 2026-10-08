'use client';

import { useRef, useState } from 'react';
import { PAYMENT_TERMS, SUPPLIER_STATUSES } from '@/config/purchasing';
import {
  FieldLabel,
  Section,
  inputClass,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

export type SupplierDraft = {
  name: string;
  taxId: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  paymentTerms: string;
  status: string;
  notes: string;
  idempotencyKey: string;
};
type Values = Omit<SupplierDraft, 'idempotencyKey'>;
const blank: Values = {
  name: '',
  taxId: '',
  address: '',
  contact: '',
  phone: '',
  email: '',
  paymentTerms: 'เงินสด',
  status: 'ใช้งาน',
  notes: '',
};

export default function SupplierForm({
  initial,
  code,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Values;
  code?: string;
  busy: boolean;
  error: string;
  submitLabel: string;
  onSubmit: (draft: SupplierDraft) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Values>(initial ?? blank);
  const [invalid, setInvalid] = useState('');
  const commandKey = useRef(crypto.randomUUID());
  function set(key: keyof Values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setInvalid('');
    commandKey.current = crypto.randomUUID();
  }
  const text = (key: keyof Values, label: string, required = false, props = {}) => (
    <label className="min-w-0">
      <FieldLabel text={label} required={required} />
      <input
        required={required}
        value={values[key]}
        onChange={(event) => set(key, event.target.value)}
        className={inputClass}
        {...props}
      />
    </label>
  );

  return (
    <form
      noValidate
      aria-label={code ? `แก้ไขผู้ขาย ${code}` : 'เพิ่มผู้ขาย'}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = Object.fromEntries(
          Object.entries(values).map(([key, value]) => [key, value.trim()]),
        ) as Values;
        if (!trimmed.name) return setInvalid('กรุณากรอกชื่อผู้ขาย');
        if (trimmed.taxId && !/^\d{13}$/.test(trimmed.taxId))
          return setInvalid('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก');
        if (trimmed.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email))
          return setInvalid('อีเมลไม่ถูกต้อง');
        onSubmit({ ...trimmed, idempotencyKey: commandKey.current });
      }}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-9 border-0 p-0">
        <Section title="ข้อมูลผู้ขาย" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text="รหัสผู้ขาย" />
              <input
                value={code ?? 'ออกอัตโนมัติเมื่อบันทึก (SUP-ลำดับ)'}
                disabled
                className={inputClass}
              />
            </label>
            {text('name', 'ชื่อผู้ขาย', true, { maxLength: 200 })}
            {text('taxId', 'เลขประจำตัวผู้เสียภาษี', false, {
              inputMode: 'numeric',
              maxLength: 13,
              placeholder: 'ตัวเลข 13 หลัก',
            })}
            <label className="min-w-0">
              <FieldLabel text="เงื่อนไขชำระเงิน" required />
              <select
                value={values.paymentTerms}
                onChange={(event) => set('paymentTerms', event.target.value)}
                className={inputClass}
              >
                {PAYMENT_TERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0">
              <FieldLabel text="สถานะ" required />
              <select
                value={values.status}
                onChange={(event) => set('status', event.target.value)}
                className={inputClass}
              >
                {SUPPLIER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 sm:col-span-2">
              <FieldLabel text="ที่อยู่" />
              <textarea
                value={values.address}
                rows={2}
                maxLength={1000}
                onChange={(event) => set('address', event.target.value)}
                className={`${inputClass} resize-y`}
              />
            </label>
          </div>
        </Section>
        <Section title="ผู้ติดต่อ" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {text('contact', 'ชื่อผู้ติดต่อ', false, { maxLength: 200 })}
            {text('phone', 'เบอร์โทร', false, { inputMode: 'tel', maxLength: 50 })}
            {text('email', 'อีเมล', false, { type: 'email', maxLength: 200 })}
          </div>
        </Section>
        <Section title="หมายเหตุ" open={Boolean(initial?.notes)}>
          <textarea
            aria-label="หมายเหตุ"
            value={values.notes}
            rows={3}
            maxLength={1000}
            onChange={(event) => set('notes', event.target.value)}
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
