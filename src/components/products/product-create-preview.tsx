'use client';

import { useId, useState } from 'react';
import ProductNameCombobox from '@/components/products/product-name-combobox';
import ProductOptionCombobox from '@/components/products/product-option-combobox';
import type { ProductOptionKind } from '@/config/product-options';
import ProductAttachmentField from '@/components/products/product-attachment-field';
import SuccessAlertComponent from '@/components/ui/success-alert-component';

const requiredFields = new Set([
  'รหัสสินค้าภายในบริษัท',
  'ชื่อสินค้าเต็ม',
  'ประเภทผลิตภัณฑ์',
  'หมวดหมู่สินค้า',
  'หน่วยสินค้า',
  'ราคาขาย',
  'ภาษี',
]);

const comboboxFields = new Set([
  'ยี่ห้อ',
  'ประเภทผลิตภัณฑ์',
  'หมวดหมู่สินค้า',
  'บริษัทผู้ผลิต',
  'ตัวยาสำคัญ',
  'รูปแบบยา',
  'ประเภทตามกฎหมาย',
  'หน่วยสินค้า',
]);

const productOptionFields: Record<string, ProductOptionKind> = {
  กลุ่มรหัส: 'codeGroup',
  รูปแบบ: 'codeFormat',
  ประเภทผลิตภัณฑ์: 'productType',
  หมวดหมู่สินค้า: 'category',
  ตัวยาสำคัญ: 'ingredient',
  รูปแบบยา: 'dosageForm',
  ประเภทตามกฎหมาย: 'legalType',
  หน่วยสินค้า: 'unit',
};

const multilineFields = new Set([
  'รายละเอียดสินค้า',
  'สรรพคุณ / ข้อบ่งใช้',
  'คำเตือนและข้อห้ามใช้',
  'เงื่อนไขการสั่งจ่าย',
  'รูปสินค้า',
  'เอกสารแนบ',
]);

const inputClass =
  'mt-2 block w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none transition-colors placeholder:text-[#8994a5] hover:border-blue-300 focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100';

const sections = [
  {
    title: 'ข้อมูลทั่วไป',
    fields: [
      ['รหัสสินค้าภายในบริษัท', 'รหัสอ้างอิงของสินค้า เช่น กลุ่มรหัส–รูปแบบ–เลขลำดับ'],
      ['ชื่อสินค้าเต็ม', 'ชื่อภาษาไทยและภาษาอังกฤษ พร้อมรายละเอียดที่ใช้แยกสินค้า'],
      ['ชื่อการค้า', 'ชื่อผลิตภัณฑ์บนบรรจุภัณฑ์'],
      ['ยี่ห้อ', 'แบรนด์ของผลิตภัณฑ์ เลือกจากรายการกลาง'],
      ['ประเภทผลิตภัณฑ์', 'ยา เครื่องสำอาง เครื่องมือแพทย์ หรือประเภทอื่น'],
      ['หมวดหมู่สินค้า', 'กลุ่มที่ใช้จัดรายการ ค้นหา และทำรายงาน'],
      ['หน่วยสินค้า', 'หน่วยที่ใช้ระบุจำนวนสินค้า เช่น เม็ด ขวด กล่อง หรือลัง'],
      ['บริษัทผู้ผลิต', 'บริษัทหรือโรงงานที่ผลิตสินค้า'],
      ['รายละเอียดสินค้า', 'คำอธิบายเพิ่มเติมเกี่ยวกับตัวสินค้า'],
    ],
  },
  {
    title: 'ข้อมูลยาและทะเบียน',
    fields: [
      ['ตัวยาสำคัญ', 'ชื่อสามัญทางยา รองรับผลิตภัณฑ์ที่มีหลายตัวยา'],
      ['ความแรง', 'ปริมาณ หน่วย และฐานความแรงของตัวยาแต่ละตัว'],
      ['รูปแบบยา', 'เช่น ยาเม็ด แคปซูล น้ำเชื่อม ยาฉีด หรือครีม'],
      ['ข้อมูลทะเบียนผลิตภัณฑ์', 'ประเภททะเบียนและเลขทะเบียน เช่น เลขทะเบียนตำรับยา'],
      ['ประเภทตามกฎหมาย', 'ประเภทของผลิตภัณฑ์ที่ตรวจสอบแล้ว พร้อมแหล่งอ้างอิง'],
      ['สรรพคุณ / ข้อบ่งใช้', 'ข้อมูลตามฉลากหรือเอกสารกำกับผลิตภัณฑ์'],
      ['คำเตือนและข้อห้ามใช้', 'คำเตือน ข้อห้าม และข้อมูลความปลอดภัยตามเอกสารกำกับ'],
      ['เงื่อนไขการสั่งจ่าย', 'เงื่อนไขที่ต้องตรวจสอบก่อนขาย พร้อมข้อมูลอ้างอิง'],
    ],
  },
  {
    title: 'ราคาและการจำหน่าย',
    fields: [
      ['ราคาต้นทุน', 'ราคาต้นทุนต่อหน่วยสินค้า'],
      ['ราคาขาย', 'ราคาขายต่อหน่วยสินค้า'],
      ['ภาษี', 'อัตราภาษีเป็นเปอร์เซ็นต์ เริ่มต้น 7% และแก้ไขได้'],
    ],
  },
  {
    title: 'รูปสินค้าและเอกสาร',
    fields: [
      ['รูปสินค้า', 'รูปหลัก รูปกล่อง ฉลาก และตัวสินค้า'],
      ['เอกสารแนบ', 'รูปหรือ PDF พร้อมประเภทเอกสาร ชื่อ และวันที่ที่เกี่ยวข้อง'],
    ],
  },
] as const;

export default function ProductCreatePreview() {
  const id = useId();
  const [action, setAction] = useState<'save' | 'cancel' | null>(null);
  return (
    <article className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8">
      <div className="space-y-9">
        {sections.map((section, index) => (
          <details
            key={section.title}
            aria-labelledby={`${id}-section-${index}`}
            className="group rounded-lg border border-[#d9e3ee] p-4 md:p-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a58a7] [&::-webkit-details-marker]:hidden">
              <h3
                id={`${id}-section-${index}`}
                className="text-base poppins-semibold text-[#1a58a7]"
              >
                {section.title}
              </h3>
              <svg
                width="23"
                height="13"
                viewBox="0 0 23 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="shrink-0 -rotate-90 transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
              >
                <path
                  d="M1.5 1.5L11.5 11.5L21.5 1.5"
                  stroke="#1A58A7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-5">
              {section.fields.map(([label], fieldIndex) => {
                const fieldId = `${id}-field-${index}-${fieldIndex}`;
                const multiline = multilineFields.has(label);
                const required = requiredFields.has(label);
                if (label === 'รหัสสินค้าภายในบริษัท') {
                  return <ProductCodeFields key={label} id={fieldId} />;
                }
                if (label === 'ชื่อสินค้าเต็ม') {
                  return <ProductNameFields key={label} id={fieldId} />;
                }
                return (
                  <div
                    key={label}
                    className={`min-w-0 basis-full ${multiline ? '' : 'sm:basis-[calc(50%-1rem)]'}`}
                  >
                    <label
                      htmlFor={fieldId}
                      className="block text-sm poppins-medium text-[#344256]"
                    >
                      {label}
                      {required && (
                        <span aria-hidden="true" className="ml-1 text-red-600">
                          *
                        </span>
                      )}
                    </label>
                    {label === 'รูปสินค้า' || label === 'เอกสารแนบ' ? (
                      <ProductAttachmentField id={fieldId} imagesOnly={label === 'รูปสินค้า'} />
                    ) : label === 'ภาษี' ? (
                      <div className="relative">
                        <input
                          id={fieldId}
                          name="product-tax-rate"
                          type="number"
                          inputMode="decimal"
                          step="any"
                          defaultValue={7}
                          aria-required={required}
                          className={`${inputClass} h-11 pr-10`}
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute right-3 top-3 text-sm poppins-regular text-[#65758b]"
                        >
                          %
                        </span>
                      </div>
                    ) : label === 'ยี่ห้อ' || label === 'บริษัทผู้ผลิต' ? (
                      <ProductNameCombobox
                        id={fieldId}
                        kind={label === 'ยี่ห้อ' ? 'brand' : 'manufacturer'}
                      />
                    ) : comboboxFields.has(label) ? (
                      <EmptyProductCombobox id={fieldId} label={label} required={required} />
                    ) : multiline ? (
                      <textarea
                        id={fieldId}
                        name={`product-${index}-${fieldIndex}`}
                        aria-required={required}
                        placeholder={`กรอก${label}`}
                        rows={3}
                        className={`${inputClass} min-h-24 resize-y`}
                      />
                    ) : (
                      <input
                        id={fieldId}
                        name={`product-${index}-${fieldIndex}`}
                        type={label === 'ราคาต้นทุน' ? 'number' : 'text'}
                        inputMode={label === 'ราคาต้นทุน' ? 'decimal' : undefined}
                        step={label === 'ราคาต้นทุน' ? 'any' : undefined}
                        aria-required={required}
                        placeholder={`กรอก${label}`}
                        className={`${inputClass} h-11`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-4">
        <div className="w-36 text-right">
          <button
            type="button"
            onClick={() => setAction('cancel')}
            className="w-full rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-sm poppins-medium text-[#344256] transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
          >
            ยกเลิก
          </button>
        </div>
        <div className="w-36 text-right">
          <button
            type="button"
            onClick={() => setAction('save')}
            className="w-full rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white transition hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
          >
            บันทึก
          </button>
        </div>
      </div>
      <SuccessAlertComponent
        isOpen={action !== null}
        title={action === 'save' ? 'ตัวอย่างการบันทึกสินค้า' : 'ตัวอย่างการยกเลิก'}
        description={
          action === 'save'
            ? 'หน้าตัวอย่างนี้ยังไม่บันทึกข้อมูลสินค้า กดตกลงเพื่อกลับไปกรอกข้อมูลต่อ'
            : 'หน้าตัวอย่างนี้ยังไม่ล้างข้อมูลหรือออกจากหน้า กดตกลงเพื่อกลับไปกรอกข้อมูลต่อ'
        }
        onClose={() => setAction(null)}
      />
    </article>
  );
}

function ProductNameFields({ id }: { id: string }) {
  return (
    <fieldset className="min-w-0 basis-full">
      <legend className="text-sm poppins-medium text-[#344256]">
        ชื่อสินค้าเต็ม
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      </legend>
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        {[
          { language: 'th', label: 'ชื่อสินค้าเต็ม (ไทย)' },
          { language: 'en', label: 'ชื่อสินค้าเต็ม (ภาษาอังกฤษ)' },
        ].map((field) => (
          <div key={field.language} className="min-w-0 basis-full sm:basis-[calc(50%-1rem)]">
            <input
              id={`${id}-${field.language}`}
              name={`product-name-${field.language}`}
              type="text"
              aria-label={field.label}
              placeholder={field.label}
              className={`${inputClass} h-11`}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function ProductCodeFields({ id }: { id: string }) {
  const [sequence, setSequence] = useState('');
  const fields = [
    { key: 'group', label: 'กลุ่มรหัส' },
    { key: 'form', label: 'รูปแบบ' },
  ];
  return (
    <fieldset className="min-w-0 basis-full">
      <legend className="text-sm poppins-medium text-[#344256]">
        รหัสสินค้าภายในบริษัท
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-4">
        {fields.map((field) => (
          <div key={field.key} className="min-w-0 basis-full sm:flex-1 sm:basis-0">
            <label htmlFor={`${id}-${field.key}`} className="sr-only">
              {field.label}
              <span aria-hidden="true" className="ml-1 text-red-600">
                *
              </span>
            </label>
            <EmptyProductCombobox id={`${id}-${field.key}`} label={field.label} required />
          </div>
        ))}
        <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
          <label htmlFor={`${id}-sequence`} className="sr-only">
            เลขลำดับ
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
          </label>
          <input
            id={`${id}-sequence`}
            name="product-sequence"
            type="text"
            inputMode="numeric"
            maxLength={5}
            aria-required="true"
            placeholder="รันเมื่อเลือกกลุ่มและรูปแบบ"
            value={sequence}
            onChange={(event) => {
              if (/^\d{0,5}$/.test(event.target.value)) setSequence(event.target.value);
            }}
            onBlur={() => {
              if (Number(sequence) > 0) setSequence(sequence.padStart(5, '0'));
            }}
            className={`${inputClass} h-11`}
          />
        </div>
      </div>
      <input
        id={id}
        type="text"
        readOnly
        value=""
        aria-label="รหัสสินค้าเต็ม"
        placeholder="รหัสสินค้าเต็ม"
        className={`${inputClass} mt-4 h-11 bg-blue-50`}
      />
    </fieldset>
  );
}

function EmptyProductCombobox({
  id,
  label,
  required,
}: {
  id: string;
  label: string;
  required: boolean;
}) {
  const kind = productOptionFields[label];
  return <ProductOptionCombobox id={id} kind={kind} required={required} canManage />;
}
