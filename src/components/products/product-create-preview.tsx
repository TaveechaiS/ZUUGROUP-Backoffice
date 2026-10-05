'use client';

import { useId, useState } from 'react';
import ProductNameCombobox from '@/components/products/product-name-combobox';
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
  'สถานะสินค้า',
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

const multilineFields = new Set([
  'รายละเอียดสินค้า',
  'สรรพคุณ / ข้อบ่งใช้',
  'คำเตือนและข้อห้ามใช้',
  'เงื่อนไขการสั่งจ่าย',
  'เงื่อนไขจัดเก็บ',
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
      ['ราคาขาย', 'ราคาขายต่อหน่วยสินค้า'],
      ['ภาษี', 'อัตราภาษีเป็นเปอร์เซ็นต์ เริ่มต้น 7% และแก้ไขได้'],
      ['สถานะสินค้า', 'สถานะการเปิดขาย พักขาย หรือเลิกจำหน่าย'],
    ],
  },
  {
    title: 'การจัดเก็บ',
    fields: [['เงื่อนไขจัดเก็บ', 'ช่วงอุณหภูมิและข้อกำหนด เช่น หลีกเลี่ยงแสง']],
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
          <section key={section.title} aria-labelledby={`${id}-section-${index}`}>
            <div className="mb-4">
              <h3
                id={`${id}-section-${index}`}
                className="text-base poppins-semibold text-[#1a58a7]"
              >
                {section.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-5">
              {section.fields.map(([label, description], fieldIndex) => {
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
                          aria-describedby={`${fieldId}-help`}
                          className={`${inputClass} h-11 pr-10`}
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute right-3 top-3 text-sm poppins-regular text-[#65758b]"
                        >
                          %
                        </span>
                      </div>
                    ) : label === 'สถานะสินค้า' ? (
                      <select
                        id={fieldId}
                        name="product-status"
                        defaultValue="เปิดขาย"
                        aria-required={required}
                        aria-describedby={`${fieldId}-help`}
                        className={`${inputClass} h-11`}
                      >
                        <option value="เปิดขาย">เปิดขาย</option>
                        <option value="พักขาย">พักขาย</option>
                        <option value="เลิกจำหน่าย">เลิกจำหน่าย</option>
                      </select>
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
                        aria-describedby={`${fieldId}-help`}
                        aria-required={required}
                        placeholder={`กรอก${label}`}
                        rows={3}
                        className={`${inputClass} min-h-24 resize-y`}
                      />
                    ) : (
                      <input
                        id={fieldId}
                        name={`product-${index}-${fieldIndex}`}
                        type="text"
                        aria-required={required}
                        aria-describedby={`${fieldId}-help`}
                        placeholder={`กรอก${label}`}
                        className={`${inputClass} h-11`}
                      />
                    )}
                    <p
                      id={`${fieldId}-help`}
                      className="mt-1.5 text-xs leading-5 poppins-regular text-[#65758b]"
                    >
                      {label === 'ยี่ห้อ' || label === 'บริษัทผู้ผลิต'
                        ? `พิมพ์แล้วเลือกเพิ่ม${label}ใหม่ หรือเลือกชื่อเดิม จำรายการไว้ในเบราว์เซอร์นี้`
                        : label === 'รูปสินค้า' || label === 'เอกสารแนบ'
                          ? `${label === 'รูปสินค้า' ? 'แนบรูปได้หลายรูป' : 'แนบรูปหรือ PDF ได้หลายไฟล์'} เลือกเพิ่มได้ ไฟล์ยังไม่ถูกบันทึกและจะหายเมื่อออกจากหน้า`
                          : description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-8 border-t border-[#e4e9f0] pt-5 text-sm leading-6 poppins-regular text-[#65758b]">
        เลขล็อต วันผลิต วันหมดอายุ จำนวนรับเข้า และต้นทุนรับเข้า อยู่ที่หน้าเพิ่มสต็อกสินค้า
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-4">
        <div className="w-36 text-right">
          <button
            type="button"
            aria-describedby={`${id}-cancel-help`}
            onClick={() => setAction('cancel')}
            className="w-full rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-sm poppins-medium text-[#344256] transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
          >
            ยกเลิก
          </button>
          <p id={`${id}-cancel-help`} className="mt-2 text-xs leading-5 poppins-regular text-[#65758b]">
            แสดงตัวอย่างการยกเลิก
          </p>
        </div>
        <div className="w-36 text-right">
          <button
            type="button"
            aria-describedby={`${id}-save-help`}
            onClick={() => setAction('save')}
            className="w-full rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white transition hover:bg-[#174a8b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a58a7]"
          >
            บันทึก
          </button>
          <p id={`${id}-save-help`} className="mt-2 text-xs leading-5 poppins-regular text-[#65758b]">
            แสดงตัวอย่างการบันทึก
          </p>
        </div>
      </div>
      <SuccessAlertComponent
        isOpen={action !== null}
        title={action === 'save' ? 'ตัวอย่างการบันทึกสินค้า' : 'ตัวอย่างการยกเลิก'}
        description={action === 'save'
          ? 'หน้าตัวอย่างนี้ยังไม่บันทึกข้อมูลสินค้า กดตกลงเพื่อกลับไปกรอกข้อมูลต่อ'
          : 'หน้าตัวอย่างนี้ยังไม่ล้างข้อมูลหรือออกจากหน้า กดตกลงเพื่อกลับไปกรอกข้อมูลต่อ'}
        onClose={() => setAction(null)}
      />
    </article>
  );
}

function ProductNameFields({ id }: { id: string }) {
  return (
    <fieldset className="min-w-0 basis-full" aria-describedby={`${id}-help`}>
      <legend className="text-sm poppins-medium text-[#344256]">
        ชื่อสินค้าเต็ม
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-4">
        {[
          { language: 'th', label: 'ชื่อสินค้าเต็ม (ไทย)' },
          { language: 'en', label: 'ชื่อสินค้าเต็ม (ภาษาอังกฤษ)' },
        ].map((field) => (
          <div key={field.language} className="min-w-0 basis-full sm:flex-1 sm:basis-0">
            <input
              id={`${id}-${field.language}`}
              name={`product-name-${field.language}`}
              type="text"
              aria-describedby={`${id}-help`}
              aria-label={field.label}
              placeholder={field.label}
              className={`${inputClass} h-11`}
            />
          </div>
        ))}
      </div>
      <p id={`${id}-help`} className="mt-1.5 text-xs leading-5 poppins-regular text-[#65758b]">
        กรอกอย่างน้อยหนึ่งภาษา ใช้ชื่อที่ระบุสินค้าได้ชัดเจน รวมความแรง รูปแบบ และขนาดบรรจุ
      </p>
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
            <label
              htmlFor={`${id}-${field.key}`}
              className="block text-sm poppins-medium text-[#344256]"
            >
              {field.label}
              <span aria-hidden="true" className="ml-1 text-red-600">
                *
              </span>
            </label>
            <EmptyProductCombobox id={`${id}-${field.key}`} label={field.label} required />
            <p
              id={`${id}-${field.key}-help`}
              className="mt-1.5 text-xs leading-5 poppins-regular text-[#65758b]"
            >
              {field.key === 'group'
                ? 'เลือกกลุ่มรหัสสินค้าจากรายการกลาง'
                : 'เลือกรูปแบบสำหรับท่อนที่สองของรหัส'}
            </p>
          </div>
        ))}
        <div className="min-w-0 basis-full sm:flex-1 sm:basis-0">
          <label htmlFor={`${id}-sequence`} className="block text-sm poppins-medium text-[#344256]">
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
            aria-describedby={`${id}-sequence-help`}
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
          <p
            id={`${id}-sequence-help`}
            className="mt-1.5 text-xs leading-5 poppins-regular text-[#65758b]"
          >
            แก้เลขเองได้ โดยเลขต้องไม่ซ้ำในกลุ่มรหัสและรูปแบบเดียวกัน
          </p>
        </div>
      </div>
      <input
        id={id}
        type="text"
        readOnly
        value=""
        aria-describedby={`${id}-help`}
        aria-label="รหัสสินค้าเต็ม"
        placeholder="รหัสสินค้าเต็ม"
        className={`${inputClass} mt-4 h-11 bg-blue-50`}
      />
      <p id={`${id}-help`} className="mt-1.5 text-xs leading-5 poppins-regular text-[#65758b]">
        รหัสจะสร้างเมื่อเลือกข้อมูลครบ การรันเลขและตรวจเลขซ้ำจะพร้อมเมื่อเชื่อมข้อมูลรายการกลาง
      </p>
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  return (
    <div className="relative mt-2">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-required={required}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-autocomplete="list"
        aria-describedby={`${id}-help`}
        autoComplete="off"
        placeholder={`ค้นหาและเลือก${label}`}
        value={search}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
          setSearch('');
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter') {
            event.preventDefault();
            setOpen(true);
          } else if (event.key === 'Escape') {
            event.preventDefault();
            setOpen(false);
            setSearch('');
          } else if (event.key === 'Tab') {
            setOpen(false);
          }
        }}
        className={`${inputClass} mt-0 h-11 pr-9`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 text-sm text-[#65758b]"
      >
        ⌄
      </span>
      <div
        hidden={!open}
        className="absolute z-20 mt-1 w-full rounded-md border border-[#d9e3ee] bg-white"
      >
        <div id={`${id}-options`} role="listbox" aria-label={label} />
        {open && (
          <p role="status" className="px-3 py-3 text-sm poppins-regular text-[#65758b]">
            ยังไม่มีรายการ
          </p>
        )}
      </div>
    </div>
  );
}
