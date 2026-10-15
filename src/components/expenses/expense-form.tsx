'use client';

import { useRef, useState } from 'react';
import {
  DateInput,
  FieldLabel,
  Section,
  bangkokToday,
  inputClass,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

export type ExpenseDraft = {
  name: string;
  expenseDate: string;
  categoryId: string;
  amount: string;
  payee: string;
  description: string;
  notes: string;
  idempotencyKey: string;
};

export default function ExpenseForm({
  categories,
  initial,
  withFiles = false,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  categories: { id: string; name: string }[];
  initial?: Omit<ExpenseDraft, 'idempotencyKey'> & { code: string };
  withFiles?: boolean;
  busy: boolean;
  error: string;
  submitLabel: string;
  onSubmit: (draft: ExpenseDraft, files: File[]) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    expenseDate: initial?.expenseDate ?? bangkokToday(),
    categoryId: initial?.categoryId ?? '',
    amount: initial?.amount ?? '',
    payee: initial?.payee ?? '',
    description: initial?.description ?? '',
    notes: initial?.notes ?? '',
  });
  const [files, setFiles] = useState<File[]>([]);
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
        if (!values.name.trim()) return setInvalid('กรุณากรอกรายการ');
        if (!values.expenseDate || values.expenseDate > bangkokToday())
          return setInvalid('วันที่ค่าใช้จ่ายต้องไม่เกินวันนี้');
        if (!values.categoryId) return setInvalid('กรุณาเลือกหมวดค่าใช้จ่าย');
        if (!/^\d{1,12}(\.\d{1,2})?$/.test(values.amount) || Number(values.amount) <= 0)
          return setInvalid('จำนวนเงินต้องมากกว่า 0 และทศนิยมไม่เกิน 2 หลัก');
        if (files.some((file) => file.size > 10485760))
          return setInvalid('ไฟล์แนบต้องไม่เกิน 10 MB ต่อไฟล์');
        onSubmit(
          { ...values, name: values.name.trim(), idempotencyKey: commandKey.current },
          files,
        );
      }}
      aria-label={initial ? `แก้ไขค่าใช้จ่าย ${initial.code}` : 'เพิ่มค่าใช้จ่าย'}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-9 border-0 p-0">
        <Section title="ข้อมูลค่าใช้จ่าย" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text="เลขที่" />
              <input
                value={initial?.code ?? 'ออกอัตโนมัติเมื่อบันทึก (EX-ปี-ลำดับ)'}
                disabled
                className={inputClass}
              />
            </label>
            <div className="min-w-0">
              <FieldLabel text="วันที่" required />
              <DateInput
                label="วันที่"
                value={values.expenseDate}
                max={bangkokToday()}
                onChange={(value) => set('expenseDate', value)}
              />
            </div>
            <label className="min-w-0">
              <FieldLabel text="รายการ" required />
              <input
                value={values.name}
                maxLength={200}
                placeholder="เช่น ค่าน้ำมันรถส่งของ"
                onChange={(event) => set('name', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="min-w-0">
              <FieldLabel text="หมวดค่าใช้จ่าย" required />
              <select
                value={values.categoryId}
                onChange={(event) => set('categoryId', event.target.value)}
                className={inputClass}
              >
                <option value="">เลือกหมวด</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0">
              <FieldLabel text="จำนวนเงิน (รวม VAT)" required />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={values.amount}
                onChange={(event) => set('amount', event.target.value)}
                className={`${inputClass} text-right`}
              />
            </label>
            <label className="min-w-0">
              <FieldLabel text="ผู้รับเงิน" />
              <input
                value={values.payee}
                maxLength={200}
                onChange={(event) => set('payee', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="min-w-0 sm:col-span-2">
              <FieldLabel text="รายละเอียด" />
              <textarea
                value={values.description}
                rows={3}
                maxLength={1000}
                onChange={(event) => set('description', event.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
              />
            </label>
          </div>
        </Section>
        {withFiles && (
          <Section title="ไฟล์แนบ" open>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              aria-label="ไฟล์แนบ"
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
              className="block w-full text-sm text-[#344256] file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:poppins-medium file:text-[#1a58a7]"
            />
            <p className="mt-2 text-xs text-[#718096]">
              ใบเสร็จหรือหลักฐาน JPEG/PNG/WebP/GIF/PDF ไม่เกิน 10 MB ต่อไฟล์
            </p>
          </Section>
        )}
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
