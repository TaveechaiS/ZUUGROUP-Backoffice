'use client';

import { useRef, useState } from 'react';
import type { OperationOptions } from '@/types/api/operations';
import { FOLLOW_UP_CHANNELS } from '@/config/follow-ups';
import {
  DateInput,
  FieldLabel,
  Section,
  bangkokToday,
  inputClass,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

export type FollowUpDraft = {
  customerId: string;
  name: string;
  contactedOn: string;
  channel: string;
  nextOn: string;
  summary: string;
  notes: string;
  idempotencyKey: string;
};

export default function FollowUpForm({
  customers,
  initial,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  customers: OperationOptions['customers'];
  initial?: Omit<FollowUpDraft, 'idempotencyKey'> & { code: string };
  busy: boolean;
  error: string;
  submitLabel: string;
  onSubmit: (draft: FollowUpDraft) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    customerId: initial?.customerId ?? '',
    name: initial?.name ?? '',
    contactedOn: initial?.contactedOn ?? bangkokToday(),
    channel: initial?.channel ?? 'โทร',
    nextOn: initial?.nextOn ?? '',
    summary: initial?.summary ?? '',
    notes: initial?.notes ?? '',
  });
  const [invalid, setInvalid] = useState('');
  const commandKey = useRef(crypto.randomUUID());
  const set = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    commandKey.current = crypto.randomUUID();
    setInvalid('');
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!values.customerId) return setInvalid('กรุณาเลือกลูกค้า');
        if (!values.name.trim()) return setInvalid('กรุณากรอกหัวข้อ');
        if (!values.contactedOn || values.contactedOn > bangkokToday())
          return setInvalid('วันที่ติดต่อต้องไม่เกินวันนี้');
        if (values.nextOn && values.nextOn < values.contactedOn)
          return setInvalid('วันนัดครั้งถัดไปต้องไม่ก่อนวันที่ติดต่อ');
        onSubmit({ ...values, name: values.name.trim(), idempotencyKey: commandKey.current });
      }}
      aria-label={initial ? `แก้ไขการติดตาม ${initial.code}` : 'บันทึกการติดตาม'}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-9 border-0 p-0">
        <Section title="ข้อมูลการติดตาม" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text="ลูกค้า" required />
              <select
                value={values.customerId}
                onChange={(event) => set('customerId', event.target.value)}
                className={inputClass}
              >
                <option value="">เลือกลูกค้า</option>
                {customers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.code}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0">
              <FieldLabel text="หัวข้อ" required />
              <input
                value={values.name}
                maxLength={200}
                placeholder="เช่น เสนอสินค้าใหม่ ติดตามการชำระ"
                onChange={(event) => set('name', event.target.value)}
                className={inputClass}
              />
            </label>
            <div className="min-w-0">
              <FieldLabel text="วันที่ติดต่อ" required />
              <DateInput
                label="วันที่ติดต่อ"
                value={values.contactedOn}
                max={bangkokToday()}
                onChange={(value) => set('contactedOn', value)}
              />
            </div>
            <label className="min-w-0">
              <FieldLabel text="ช่องทาง" required />
              <select
                value={values.channel}
                onChange={(event) => set('channel', event.target.value)}
                className={inputClass}
              >
                {FOLLOW_UP_CHANNELS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <div className="min-w-0">
              <FieldLabel text="นัดครั้งถัดไป" />
              <DateInput
                label="นัดครั้งถัดไป"
                value={values.nextOn}
                min={values.contactedOn}
                required={false}
                onChange={(value) => set('nextOn', value)}
              />
            </div>
            <label className="min-w-0 sm:col-span-2">
              <FieldLabel text="สรุปการติดต่อ" />
              <textarea
                value={values.summary}
                rows={4}
                maxLength={2000}
                onChange={(event) => set('summary', event.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
              />
            </label>
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
