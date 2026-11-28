'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Delete, Get, Post, HttpError } from '@/service/http';
import {
  PRODUCT_OPTION_FIELDS,
  PRODUCT_TEXT_FIELDS,
  PRODUCT_FILE_LIMIT,
  PRODUCT_IMAGE_TYPES,
} from '@/config/products';
import { PRODUCT_OPTION_KINDS, type ProductOptionKind } from '@/config/product-options';
import type { ProductOption } from '@/types/api/product-options';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import { inputClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/form-classes';

type OptionBatch = { options: Record<ProductOptionKind, ProductOption[]> };
const OptionLoader = createContext<(() => Promise<OptionBatch>) | null>(null);

const requiredFields = new Set([
  'รหัสสินค้าภายในบริษัท',
  'ชื่อสินค้าเต็ม',
  'ประเภทผลิตภัณฑ์',
  'หมวดหมู่สินค้า',
  'หน่วยสินค้า',
  'ราคาขาย',
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

const productSections = [
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
      ['ราคาขาย', 'ราคาขายต่อหน่วยสินค้า'],
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
    title: 'รูปสินค้าและเอกสาร',
    fields: [
      ['รูปสินค้า', 'รูปหลัก รูปกล่อง ฉลาก และตัวสินค้า'],
      ['เอกสารแนบ', 'รูปหรือ PDF พร้อมประเภทเอกสาร ชื่อ และวันที่ที่เกี่ยวข้อง'],
    ],
  },
] as const;

export default function Page() {
  const id = useId();
  const router = useRouter();
  const optionRequest = useRef<Promise<OptionBatch> | null>(null);
  const loadOptions = useCallback(() => {
    if (!optionRequest.current) {
      optionRequest.current = Get<OptionBatch>(
        '/api/product-options?kinds=' + Object.keys(PRODUCT_OPTION_KINDS).join(','),
      ).catch((error) => {
        optionRequest.current = null;
        throw error;
      });
    }
    return optionRequest.current;
  }, []);
  useEffect(() => {
    const invalidate = (event: FocusEvent) => {
      if (event.target !== window) return;
      optionRequest.current = null;
    };
    window.addEventListener('focus', invalidate, true);
    return () => window.removeEventListener('focus', invalidate, true);
  }, []);
  const formRef = useRef<HTMLFormElement>(null);
  const lock = useRef(false);
  const pending = useRef<{
    id: string;
    signature: string;
    created?: boolean;
    files: { id: string; kind: string; file: File }[];
  } | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');
  const [savedCode, setSavedCode] = useState('');
  const [action, setAction] = useState<'save' | 'cancel' | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['ข้อมูลทั่วไป']);
  async function save() {
    if (lock.current || !formRef.current) return;
    lock.current = true;
    setError('');
    setBusy(true);
    try {
      const form = new FormData(formRef.current);
      const fields = Object.fromEntries(
        [...Object.keys(PRODUCT_OPTION_FIELDS), ...PRODUCT_TEXT_FIELDS].map((key) => [
          key,
          String(form.get(key) ?? ''),
        ]),
      );
      const data = { fields, sequence: String(form.get('product-sequence') ?? '') };
      const files = [
        ...images.map((file) => ({ kind: 'image', file })),
        ...documents.map((file) => ({ kind: 'document', file })),
      ];
      const fileHashes: string[] = [];
      for (const { file } of files) {
        const bytes = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
        fileHashes.push(
          Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, '0')).join(
            '',
          ),
        );
      }
      const signature =
        JSON.stringify(data) +
        JSON.stringify(
          files.map(({ kind, file }, index) => [kind, file.name, file.size, fileHashes[index]]),
        );
      if (pending.current) {
        const previous = await Get<{ status: string; product?: { code: string } }>(
          `/api/products/full/requests/${pending.current.id}`,
        ).catch((error) => {
          if (error instanceof HttpError && error.status === 404) return null;
          throw error;
        });
        if (previous?.status === 'complete') {
          setSavedCode(previous.product!.code);
          setAction('save');
          return;
        }
        if (!previous) pending.current = null;
        else if (previous.status === 'cancelled' || pending.current.signature !== signature) {
          await Delete(`/api/products/full/requests/${pending.current.id}`);
          pending.current = null;
        }
      }
      pending.current ??= {
        id: crypto.randomUUID(),
        signature,
        files: files.map((item) => ({ ...item, id: crypto.randomUUID() })),
      };
      const request = pending.current;
      setProgress('ตรวจข้อมูลสินค้า');
      const started = await Post<{ status: string }>('/api/products/full/requests', {
        requestId: request.id,
        data: {
          ...data,
          files: request.files.map(({ id, kind, file }, index) => ({
            id,
            kind,
            name: file.name,
            type: file.type,
            size: file.size,
            digest: fileHashes[index],
          })),
        },
      });
      request.created = true;
      if (started.status !== 'complete') {
        for (let index = 0; index < request.files.length; index++) {
          setProgress(`อัปโหลดไฟล์ ${index + 1}/${request.files.length}`);
          const item = request.files[index];
          const body = new FormData();
          body.append('fileId', item.id);
          body.append('kind', item.kind);
          body.append('file', item.file);
          await Post(`/api/products/full/requests/${request.id}/files`, body);
        }
      }
      setProgress('บันทึกสินค้า');
      const result = await Post<{ product: { id: string; code: string } }>(
        `/api/products/full/requests/${request.id}`,
      );
      setSavedCode(result.product.code);
      setAction('save');
    } catch (error) {
      if (
        pending.current &&
        !pending.current.created &&
        error instanceof HttpError &&
        [400, 404, 409].includes(error.status)
      )
        pending.current = null;
      setError(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
      setProgress('');
      lock.current = false;
    }
  }
  async function cancel() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (pending.current) {
        const previous = await Get<{ status: string; product?: { code: string } }>(
          `/api/products/full/requests/${pending.current.id}`,
        ).catch((error) => {
          if (error instanceof HttpError && error.status === 404) return null;
          throw error;
        });
        if (previous?.status === 'complete') {
          setSavedCode(previous.product!.code);
          setAction('save');
          return;
        }
        if (previous) await Delete(`/api/products/full/requests/${pending.current.id}`);
      }
      router.push('/products');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'ยกเลิกไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <OptionLoader.Provider value={loadOptions}>
      <form
        ref={formRef}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
        className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
      >
        <fieldset disabled={busy || Boolean(savedCode)} className="min-w-0 border-0 p-0">
          <div className="space-y-9">
            {productSections.map((section, index) => (
              <details
                key={section.title}
                open={openSections.includes(section.title)}
                onToggle={(event) => {
                  const open = event.currentTarget.open;
                  setOpenSections((current) =>
                    open
                      ? current.includes(section.title)
                        ? current
                        : [...current, section.title]
                      : current.filter((title) => title !== section.title),
                  );
                }}
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
                    viewBox="0 0 23 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 -rotate-90 transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
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
                          <ProductAttachmentField
                            id={fieldId}
                            imagesOnly={label === 'รูปสินค้า'}
                            onFilesChange={label === 'รูปสินค้า' ? setImages : setDocuments}
                          />
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
                            name={label}
                            aria-required={required}
                            placeholder={`กรอก${label}`}
                            rows={3}
                            className={`${inputClass} mt-2 min-h-24 resize-y`}
                          />
                        ) : (
                          <input
                            id={fieldId}
                            name={label}
                            type="text"
                            aria-required={required}
                            placeholder={`กรอก${label}`}
                            className={`${inputClass} mt-2 h-11`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
            <button
              type="button"
              onClick={() => setAction('cancel')}
              className={secondaryButtonClass}
            >
              ยกเลิก
            </button>
            <button type="submit" className={primaryButtonClass}>
              {busy ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </fieldset>
        {progress && (
          <p role="status" className="mt-4 text-sm poppins-regular text-[#65758b]">
            {progress}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 text-sm poppins-regular text-red-600">
            {error}
          </p>
        )}
        <SuccessAlertComponent
          isOpen={action !== null}
          title={action === 'save' ? 'บันทึกสินค้าแล้ว' : 'ยกเลิกการเพิ่มสินค้า'}
          description={
            action === 'save'
              ? `บันทึกข้อมูลและไฟล์เรียบร้อย รหัสสินค้า ${savedCode}`
              : 'ข้อมูลที่ยังไม่บันทึกจะไม่ถูกเก็บ กดตกลงเพื่อกลับรายการสินค้า'
          }
          onClose={() => {
            const previous = action;
            setAction(null);
            if (previous === 'save') router.push('/products/' + encodeURIComponent(savedCode));
            else void cancel();
          }}
        />
      </form>
    </OptionLoader.Provider>
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
              name={field.label}
              type="text"
              aria-label={field.label}
              placeholder={field.label}
              className={`${inputClass} mt-2 h-11`}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function ProductCodeFields({ id }: { id: string }) {
  const [sequence, setSequence] = useState('00001');
  const [codeGroup, setCodeGroup] = useState<ProductOption | null>(null);
  const [codeFormat, setCodeFormat] = useState<ProductOption | null>(null);
  const [loadedPair, setLoadedPair] = useState('');
  const [sequenceError, setSequenceError] = useState('');
  const [retry, setRetry] = useState(0);
  const groupId = codeGroup?.id;
  const formatId = codeFormat?.id;
  const pair = codeGroup && codeFormat ? `${codeGroup.id}:${codeFormat.id}` : '';
  useEffect(() => {
    if (!groupId || !formatId) return;
    const controller = new AbortController();
    Get<{ sequence: string }>(
      `/api/products/full/next?groupId=${groupId}&formatId=${formatId}`,
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setSequence(result.sequence);
          setLoadedPair(`${groupId}:${formatId}`);
          setSequenceError('');
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setSequenceError(error instanceof Error ? error.message : 'โหลดเลขลำดับไม่สำเร็จ');
      });
    return () => controller.abort();
  }, [groupId, formatId, retry]);
  const fullCode =
    pair &&
    pair === loadedPair &&
    !sequenceError &&
    codeGroup?.code &&
    codeFormat?.code &&
    Number(sequence) > 0
      ? `${codeGroup.code}-${codeFormat.code}-${sequence.padStart(5, '0')}`
      : '';
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
            <ProductOptionCombobox
              id={`${id}-${field.key}`}
              kind={field.key === 'group' ? 'codeGroup' : 'codeFormat'}
              name={field.label}
              required
              canManage
              onChange={field.key === 'group' ? setCodeGroup : setCodeFormat}
            />
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
            placeholder="เลขลำดับ"
            value={sequence}
            disabled={Boolean(pair && pair !== loadedPair)}
            onChange={(event) => {
              if (/^\d{0,5}$/.test(event.target.value)) setSequence(event.target.value);
            }}
            onBlur={() => {
              if (Number(sequence) > 0) setSequence(sequence.padStart(5, '0'));
            }}
            className={`${inputClass} mt-2 h-11`}
          />
        </div>
      </div>
      <input
        id={id}
        type="text"
        readOnly
        value={fullCode}
        aria-label="รหัสสินค้าเต็ม"
        placeholder="รหัสสินค้าเต็ม"
        className={`${inputClass} mt-2 mt-4 h-11 bg-blue-50`}
      />
      {pair && pair !== loadedPair && !sequenceError && (
        <p role="status" className="mt-2 text-xs poppins-regular text-[#65758b]">
          กำลังโหลดเลขลำดับถัดไป
        </p>
      )}
      {sequenceError && (
        <div role="alert" className="mt-2 text-xs poppins-regular text-red-600">
          {sequenceError}{' '}
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="text-[#1a58a7] underline"
          >
            ลองใหม่
          </button>
        </div>
      )}
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

function ProductOptionCombobox({
  id,
  kind,
  required = false,
  canManage = false,
  onChange,
  name,
}: {
  id: string;
  kind: ProductOptionKind;
  required?: boolean;
  canManage?: boolean;
  onChange?: (option: ProductOption | null) => void;
  name?: string;
}) {
  const label = PRODUCT_OPTION_KINDS[kind].label;
  const loadOptions = useContext(OptionLoader)!;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ProductOption | null>(null);
  const selectedRef = useRef<ProductOption | null>(null);
  const [allItems, setItems] = useState<ProductOption[]>([]);
  const normalized = query.normalize('NFKC').trim().toLocaleLowerCase('th-TH');
  const items = allItems.filter((item) =>
    `${item.code ?? ''} ${item.name}`
      .normalize('NFKC')
      .toLocaleLowerCase('th-TH')
      .includes(normalized),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const message = selectionError || error;
  const [active, setActive] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const requestVersion = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validateSelection = () => {
      setRefresh((v) => v + 1);
      const previous = selectedRef.current;
      if (!previous) return;
      loadOptions()
        .then(({ options }) => {
          const data = options[kind].filter((item) => item.id === previous.id);
          if (selectedRef.current?.id !== previous.id) return;
          selectedRef.current = data[0] ?? null;
          setSelected(data[0] ?? null);
          onChange?.(data[0] ?? null);
          setSelectionError(data[0] ? '' : 'รายการที่เลือกถูกปิดแล้ว กรุณาเลือกใหม่');
        })
        .catch(() => {
          if (selectedRef.current?.id !== previous.id) return;
          onChange?.(null);
          setSelectionError('ตรวจสอบรายการที่เลือกไม่ได้ กรุณาลองใหม่');
        });
    };
    window.addEventListener('focus', validateSelection);
    return () => window.removeEventListener('focus', validateSelection);
  }, [kind, onChange, loadOptions]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const version = ++requestVersion.current;
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      loadOptions()
        .then((response) => {
          if (version !== requestVersion.current || cancelled) return;
          setItems(response.options[kind]);
          setActive(0);
        })
        .catch((e: Error) => {
          if (!cancelled) setError(e.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, [kind, open, refresh, loadOptions]);
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function choose(item: ProductOption) {
    selectedRef.current = item;
    setSelected(item);
    onChange?.(item);
    setOpen(false);
    setQuery('');
    setError('');
    setSelectionError('');
  }
  return (
    <div
      className="relative mt-2"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setQuery('');
        }
      }}
    >
      <input type="hidden" name={`product-option-${kind}`} value={selected?.id ?? ''} />
      <input
        type="hidden"
        name={name ?? label}
        value={selectionError ? '' : (selected?.id ?? '')}
      />
      <input
        id={id}
        role="combobox"
        aria-label={label}
        aria-required={required}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && items[active] ? `${id}-option-${items[active].id}` : undefined
        }
        aria-describedby={message ? `${id}-error` : undefined}
        autoComplete="off"
        placeholder={`ค้นหาและเลือก${label}`}
        value={open ? query : (selected?.name ?? '')}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) {
            setOpen(false);
            setQuery('');
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
            setActive((value) =>
              Math.max(0, Math.min(items.length - 1, value + (event.key === 'ArrowDown' ? 1 : -1))),
            );
          } else if (event.key === 'Enter') {
            event.preventDefault();
            if (open && items[active] && !loading) choose(items[active]);
            else setOpen(true);
          } else if (event.key === 'Escape') {
            setOpen(false);
            setQuery('');
          }
        }}
        className={`block h-11 w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 ${selected ? 'pr-16' : 'pr-9'} text-sm poppins-regular text-[#344256] outline-none transition-colors placeholder:text-[#8994a5] hover:border-blue-300 focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100`}
      />
      {selected && (
        <button
          type="button"
          aria-label={`ล้าง${label}`}
          onClick={() => {
            selectedRef.current = null;
            setSelected(null);
            onChange?.(null);
            setQuery('');
            setSelectionError('');
            setOpen(false);
          }}
          className="absolute right-9 top-3 rounded px-1 text-sm text-[#65758b] hover:text-[#344256] focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-0 flex h-11 items-center opacity-30"
      >
        <svg className="h-4 w-4" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1 1L7 7L13 1"
            stroke="#101828"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-md border border-[#d9e3ee] bg-white shadow-sm"
          onMouseDown={(event) => event.preventDefault()}
        >
          <div
            ref={listRef}
            id={`${id}-options`}
            role="listbox"
            aria-label={label}
            className="max-h-[min(25rem,50vh)] overflow-y-auto"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                id={`${id}-option-${item.id}`}
                role="option"
                aria-selected={selected?.id === item.id}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(item)}
                className={`flex h-10 items-center overflow-hidden whitespace-nowrap px-3 text-sm poppins-regular text-[#344256] ${index === active ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
              >
                {item.code ? `${item.code} — ${item.name}` : item.name}
              </div>
            ))}
          </div>
          {loading && (
            <p role="status" className="px-3 py-2 text-sm poppins-regular text-[#65758b]">
              กำลังโหลด...
            </p>
          )}
          {!loading && !message && !items.length && (
            <p role="status" className="px-3 py-2 text-sm poppins-regular text-[#65758b]">
              ไม่พบรายการ
            </p>
          )}
          {canManage && !loading && !items.length && (
            <Link
              href={`/settings/product-options?kind=${kind}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-sm poppins-medium text-[#1a58a7]"
            >
              ไปตั้งค่า{label}
            </Link>
          )}
          {error && (
            <button
              type="button"
              onClick={() => setRefresh((v) => v + 1)}
              className="px-3 py-2 text-sm poppins-medium text-[#1a58a7]"
            >
              ลองใหม่
            </button>
          )}
        </div>
      )}
      {message && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm poppins-regular text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}

function ProductNameCombobox({ id, kind }: { id: string; kind: 'brand' | 'manufacturer' }) {
  return <ProductOptionCombobox id={id} kind={kind} canManage />;
}

type Attachment = { id: string; file: File; url: string };

function acceptsProductAttachment(file: Pick<File, 'type' | 'name'>, imagesOnly: boolean) {
  return (
    PRODUCT_IMAGE_TYPES.includes(file.type) ||
    (!imagesOnly && (file.type === 'application/pdf' || (!file.type && /\.pdf$/i.test(file.name))))
  );
}

function fileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toLocaleString('th-TH', { maximumFractionDigits: 1 })} KB`
    : `${(bytes / (1024 * 1024)).toLocaleString('th-TH', { maximumFractionDigits: 1 })} MB`;
}

function ProductAttachmentField({
  id,
  imagesOnly,
  onFilesChange,
}: {
  id: string;
  imagesOnly: boolean;
  onFilesChange?: (files: File[]) => void;
}) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState('');
  const urls = useRef(new Map<string, string>());
  useEffect(() => {
    onFilesChange?.(attachments.map((item) => item.file));
  }, [attachments, onFilesChange]);

  useEffect(() => {
    const ownedUrls = urls.current;
    return () => {
      for (const url of ownedUrls.values()) URL.revokeObjectURL(url);
      ownedUrls.clear();
    };
  }, []);

  function removeAttachment(attachment: Attachment) {
    URL.revokeObjectURL(attachment.url);
    urls.current.delete(attachment.id);
    setAttachments((current) => current.filter((item) => item.id !== attachment.id));
  }

  return (
    <div className="mt-2">
      <input
        id={id}
        type="file"
        multiple
        accept={
          imagesOnly
            ? 'image/jpeg,image/png,image/webp,image/gif'
            : 'image/jpeg,image/png,image/webp,image/gif,.pdf,application/pdf'
        }
        aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`}
        className="block w-full rounded-md border border-[#d9e3ee] bg-white p-2 text-sm poppins-regular text-[#344256] file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          const accepted = files.filter(
            (file) =>
              acceptsProductAttachment(file, imagesOnly) &&
              file.size > 0 &&
              file.size <= PRODUCT_FILE_LIMIT,
          );
          const rejected = files.filter((file) => !accepted.includes(file));
          const added: Attachment[] = [];
          try {
            for (const file of accepted) {
              const attachment = { id: crypto.randomUUID(), file, url: URL.createObjectURL(file) };
              added.push(attachment);
              urls.current.set(attachment.id, attachment.url);
            }
            setAttachments((current) => [...current, ...added]);
            setError(
              rejected.length
                ? `ไฟล์ที่ไม่รองรับ/เกิน 10 MB/ว่าง: ${rejected.map((file) => file.name).join(', ')}`
                : '',
            );
          } catch {
            for (const attachment of added) {
              URL.revokeObjectURL(attachment.url);
              urls.current.delete(attachment.id);
            }
            setError('แสดงไฟล์ที่เลือกไม่ได้ กรุณาลองเลือกอีกครั้ง');
          }
        }}
      />
      <p aria-live="polite" className="mt-2 text-xs leading-5 poppins-regular text-[#65758b]">
        {attachments.length
          ? `แนบแล้ว ${attachments.length} ไฟล์ เลือกเพิ่มได้`
          : 'ยังไม่ได้แนบไฟล์'}
        {' — ไม่เกิน 10 MB ต่อไฟล์'}
      </p>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 break-words text-xs leading-5 poppins-regular text-red-600"
        >
          {error}
        </p>
      )}
      {attachments.length > 0 && (
        <ul className="mt-3 flex list-none flex-wrap gap-3 p-0">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="min-w-0 w-full rounded-md border border-[#d9e3ee] p-3 sm:w-52"
            >
              {attachment.file.type.startsWith('image/') ? (
                <Image
                  src={attachment.url}
                  alt={attachment.file.name}
                  width={184}
                  height={128}
                  unoptimized
                  className="mb-3 h-32 w-full rounded bg-blue-50 object-contain"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="mb-3 flex h-32 items-center justify-center rounded bg-blue-50 text-sm poppins-semibold text-blue-700"
                >
                  PDF
                </div>
              )}
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block break-words text-sm poppins-medium text-[#1a58a7] underline-offset-2 hover:underline"
              >
                {attachment.file.name}
              </a>
              <p className="mt-1 text-xs poppins-regular text-[#65758b]">
                {fileSize(attachment.file.size)}
              </p>
              <button
                type="button"
                onClick={() => removeAttachment(attachment)}
                aria-label={`นำไฟล์ ${attachment.file.name} ออก`}
                className="mt-3 rounded border border-[#d9e3ee] px-3 py-1.5 text-xs poppins-medium text-[#344256] hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                นำออก
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
