'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomerCodePreview from './customer-code-preview';
import CustomerAttachmentsPreview, { type SelectedFile } from './customer-attachments-preview';
import CustomerBillingPreview from './customer-billing-preview';
import CustomerChoicePreview, { type ChoiceOption } from './customer-choice-preview';
import CustomerDatePreview from './customer-date-preview';
import CustomerAddressPicker from './customer-address-picker';
import ChevronDown from '@/components/ui/chevron-down';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import { Delete, Get, HttpError, Post, Update } from '@/service/http';
import { useRouteData } from '@/components/ui/route-data';
import {
  CUSTOMER_OPTION_FIELDS,
  CUSTOMER_TEXT_FIELDS,
  SHIPPING_FIELDS,
  SHIPPING_LIMIT,
  CUSTOMER_STATUSES,
} from '@/config/customers';
import type { ShippingAddress } from '@/types/api/customers';
import type { CustomerOptionBatch } from '@/types/api/customer-options';
import type { CustomerDetailResponse, CustomerListResponse } from '@/types/api/customers';

type FormField = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  required?: boolean;
  choice?: 'territory' | 'creditTerm' | 'creditStart' | 'profession' | 'customerStatus';
  date?: boolean;
  suggestions?: 'billingCycle';
};
type Section = { title: string; description?: string; fields: FormField[] };

const inputClass =
  'mt-2 block w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none placeholder:text-[#8994a5]';
const label = (key: keyof typeof CUSTOMER_TEXT_FIELDS | keyof typeof CUSTOMER_OPTION_FIELDS) =>
  key in CUSTOMER_TEXT_FIELDS
    ? CUSTOMER_TEXT_FIELDS[key as keyof typeof CUSTOMER_TEXT_FIELDS].label
    : CUSTOMER_OPTION_FIELDS[key as keyof typeof CUSTOMER_OPTION_FIELDS];

const sections: Section[] = [
  {
    title: 'ข้อมูลทั่วไป',
    fields: [
      {
        key: 'name',
        label: label('name'),
        required: true,
        placeholder: 'ชื่อร้านขายยา คลินิก หรือโรงพยาบาลที่จดทะเบียน',
      },
      {
        key: 'customerStatus',
        label: label('customerStatus'),
        placeholder: '',
        choice: 'customerStatus',
      },
      { key: 'territoryId', label: label('territoryId'), placeholder: '', choice: 'territory' },
      {
        key: 'notes',
        label: label('notes'),
        placeholder: 'ข้อมูลเพิ่มเติมเกี่ยวกับลูกค้า',
        multiline: true,
      },
    ],
  },
  {
    title: 'ข้อมูลติดต่อ',
    fields: [
      {
        key: 'contactName',
        label: label('contactName'),
        placeholder: 'ชื่อบุคคลที่ติดต่อประสานงาน',
      },
      { key: 'phone', label: label('phone'), placeholder: 'เบอร์โทรศัพท์หลักของสถานประกอบการ' },
      { key: 'email', label: label('email'), placeholder: 'อีเมลหลักของสถานประกอบการ' },
      {
        key: 'accountingContactName',
        label: label('accountingContactName'),
        placeholder: 'ผู้ประสานงานวางบิลและชำระเงิน',
      },
      {
        key: 'accountingPhone',
        label: label('accountingPhone'),
        placeholder: 'เบอร์โทรศัพท์ฝ่ายบัญชี',
      },
      {
        key: 'accountingEmail',
        label: label('accountingEmail'),
        placeholder: 'อีเมลสำหรับส่งเอกสารวางบิล',
      },
    ],
  },
  {
    title: 'ข้อมูลภาษีและที่อยู่ออกบิล',
    fields: [
      { key: 'taxId', label: label('taxId'), placeholder: 'เลขประจำตัวผู้เสียภาษี 13 หลัก' },
      { key: 'vatStatus', label: label('vatStatus'), placeholder: '' },
      { key: 'branchType', label: label('branchType'), placeholder: '' },
      {
        key: 'branchNumber',
        label: label('branchNumber'),
        placeholder: 'เลขที่ตามทะเบียนภาษี เช่น 00000 หรือ 00001',
      },
      {
        key: 'billingAddress',
        label: label('billingAddress'),
        placeholder: 'บ้านเลขที่ อาคาร ซอย ถนน ตามทะเบียนภาษี',
        multiline: true,
      },
      {
        key: 'billingSubdistrict',
        label: label('billingSubdistrict'),
        placeholder: 'ตำบลหรือแขวง',
      },
      { key: 'billingDistrict', label: label('billingDistrict'), placeholder: 'อำเภอหรือเขต' },
      { key: 'billingProvince', label: label('billingProvince'), placeholder: 'จังหวัด' },
      { key: 'billingPostcode', label: label('billingPostcode'), placeholder: 'รหัสไปรษณีย์' },
    ],
  },
  {
    title: 'ที่อยู่จัดส่งสินค้า',
    description: 'ลูกค้าหนึ่งรายมีที่อยู่จัดส่งได้หลายแห่ง และเลือกที่อยู่จัดส่งเริ่มต้นได้',
    fields: [],
  },
  {
    title: 'ใบอนุญาตและผู้ประกอบวิชาชีพ',
    fields: [
      {
        key: 'licenseType',
        label: label('licenseType'),
        placeholder: 'ประเภทใบอนุญาตสถานพยาบาลหรือขายยา',
      },
      {
        key: 'licenseNumber',
        label: label('licenseNumber'),
        placeholder: 'เลขที่ตามเอกสารใบอนุญาต',
      },
      {
        key: 'licenseLocation',
        label: label('licenseLocation'),
        placeholder: 'สถานที่ที่ใบอนุญาตนี้ครอบคลุม',
      },
      { key: 'licenseExpiresAt', label: label('licenseExpiresAt'), placeholder: '', date: true },
      { key: 'licenseStatus', label: label('licenseStatus'), placeholder: 'ผลการตรวจสอบเอกสาร' },
      {
        key: 'licenseVerifiedBy',
        label: label('licenseVerifiedBy'),
        placeholder: 'ผู้ใช้งานที่ตรวจสอบเอกสาร',
      },
      { key: 'licenseVerifiedAt', label: label('licenseVerifiedAt'), placeholder: '', date: true },
      { key: 'profession', label: label('profession'), placeholder: '', choice: 'profession' },
      {
        key: 'professionalName',
        label: label('professionalName'),
        placeholder: 'ชื่อแพทย์หรือเภสัชกรผู้รับผิดชอบ',
      },
      {
        key: 'professionalLicenseNumber',
        label: label('professionalLicenseNumber'),
        placeholder: 'เลขที่ใบประกอบวิชาชีพของผู้รับผิดชอบ',
      },
    ],
  },
  {
    title: 'เครดิตและการวางบิล',
    fields: [
      { key: 'creditTermId', label: label('creditTermId'), placeholder: '', choice: 'creditTerm' },
      {
        key: 'creditLimit',
        label: label('creditLimit'),
        placeholder: 'วงเงินเครดิตสูงสุด (บาท)',
      },
      {
        key: 'billingCycle',
        label: label('billingCycle'),
        placeholder: 'เลือกจากรายการหรือพิมพ์รอบวางบิลเอง',
        suggestions: 'billingCycle',
      },
      {
        key: 'creditStartId',
        label: label('creditStartId'),
        placeholder: '',
        choice: 'creditStart',
      },
    ],
  },
  { title: 'เอกสารแนบ', description: 'เลือกภาพหรือ PDF ประกอบข้อมูลลูกค้า', fields: [] },
];
const requiredKeys = Object.entries(CUSTOMER_TEXT_FIELDS)
  .filter(([, field]) => 'required' in field && field.required)
  .map(([key]) => key);
const blankAddress = (isDefault: boolean): ShippingAddress => ({
  id: crypto.randomUUID(),
  isDefault,
  ...(Object.fromEntries(Object.keys(SHIPPING_FIELDS).map((key) => [key, ''])) as Record<
    keyof typeof SHIPPING_FIELDS,
    string
  >),
});
async function sha256(file: File) {
  const bytes = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, '0')).join('');
}

type Customer = CustomerDetailResponse['data'];

// One form for create and edit (TASK-268); `initial` switches to edit mode.
export default function CustomerForm({ initial }: { initial?: Customer }) {
  const router = useRouter();
  const routeData = useRouteData();
  const asRequest = !initial && routeData.isAdmin === false;
  const [submitted, setSubmitted] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lock = useRef(false);
  const pending = useRef<{ id: string; signature: string; created?: boolean } | null>(null);
  const [options, setOptions] = useState<CustomerOptionBatch['options'] | null>(null);
  const [territories, setTerritories] = useState<ChoiceOption[]>([]);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [addresses, setAddresses] = useState<ShippingAddress[]>(() =>
    initial?.details.shippingAddresses.length
      ? initial.details.shippingAddresses
      : [blankAddress(true)],
  );
  const [keepFileIds, setKeepFileIds] = useState<string[]>(
    () => initial?.details.files.map((file) => file.id) ?? [],
  );
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [openSections, setOpenSections] = useState<string[]>(['ข้อมูลทั่วไป']);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<{ id: string; code: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      Get<CustomerOptionBatch>(
        '/api/customer-options?kinds=codeGroup,creditTerm,creditStart,billingCycle,documentType',
        controller.signal,
      ),
      Get<CustomerListResponse>('/api/customers?include=filters&limit=1', controller.signal),
    ])
      .then(([batch, list]) => {
        setOptions(batch.options);
        setTerritories(
          (list.filters?.territories ?? []).map((item) => ({ id: item.id, label: item.name })),
        );
      })
      .catch((e: Error) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [reload]);

  async function save() {
    if (lock.current || !formRef.current) return;
    lock.current = true;
    setError('');
    setBusy(true);
    try {
      const form = new FormData(formRef.current);
      const value = (key: string) => String(form.get(key) ?? '').trim();
      const fields = Object.fromEntries(
        [...Object.keys(CUSTOMER_TEXT_FIELDS), ...Object.keys(CUSTOMER_OPTION_FIELDS)].map(
          (key) => [key, value(key)],
        ),
      );
      const missing = [
        ...(value('codeGroupId') ? [] : ['กลุ่มรหัสลูกค้า']),
        ...requiredKeys
          .filter((key) => !fields[key])
          .map((key) => CUSTOMER_TEXT_FIELDS[key as keyof typeof CUSTOMER_TEXT_FIELDS].label),
      ];
      if (missing.length) throw new Error('กรุณากรอก ' + missing.join(', '));
      const data = {
        codeGroupId: value('codeGroupId'),
        sequence: value('sequence'),
        fields,
        shippingAddresses: addresses,
      };
      const hashes: string[] = [];
      for (const item of files) hashes.push(await sha256(item.file));
      const manifest = files.map((item, index) => ({
        id: item.id,
        documentTypeId: item.documentTypeId,
        name: item.file.name,
        type: item.file.type,
        size: item.file.size,
        digest: hashes[index],
      }));
      const signature = JSON.stringify(data) + JSON.stringify(manifest) + keepFileIds.join();
      if (pending.current) {
        const previous = await Get<{ status: string; customer?: { id: string; code: string } }>(
          `/api/customers/requests/${pending.current.id}`,
        ).catch((e) => {
          if (e instanceof HttpError && e.status === 404) return null;
          throw e;
        });
        if (previous?.status === 'complete') {
          setSaved(previous.customer!);
          return;
        }
        if (!previous) pending.current = null;
        else if (previous.status === 'cancelled' || pending.current.signature !== signature) {
          await Delete(`/api/customers/requests/${pending.current.id}`);
          pending.current = null;
        }
      }
      pending.current ??= { id: crypto.randomUUID(), signature };
      const request = pending.current;
      setProgress('ตรวจข้อมูลลูกค้า');
      const started = initial
        ? await Post<{ status: string }>(`/api/customers/${initial.id}/edit-requests`, {
            requestId: request.id,
            expectedUpdatedAt: initial.updatedAt,
            keepFileIds,
            data: { ...data, files: manifest },
          })
        : await Post<{ status: string }>('/api/customers/requests', {
            requestId: request.id,
            data: { ...data, files: manifest },
          });
      request.created = true;
      if (started.status !== 'complete') {
        for (let index = 0; index < files.length; index++) {
          setProgress(`อัปโหลดไฟล์ ${index + 1}/${files.length}`);
          const body = new FormData();
          body.append('fileId', files[index].id);
          body.append('documentTypeId', files[index].documentTypeId);
          body.append('file', files[index].file);
          await Post(`/api/customers/requests/${request.id}/files`, body);
        }
      }
      if (asRequest) {
        setProgress('ส่งคำขอ');
        await Update(`/api/customer-requests/${request.id}`, { action: 'submit' });
        setSubmitted(request.id);
        return;
      }
      setProgress('บันทึกลูกค้า');
      const result = await Post<{ customer: { id: string; code: string } }>(
        `/api/customers/requests/${request.id}`,
      );
      setSaved(result.customer);
    } catch (e) {
      if (
        pending.current &&
        !pending.current.created &&
        e instanceof HttpError &&
        [400, 404, 409].includes(e.status)
      )
        pending.current = null;
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
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
      if (pending.current?.created) {
        const previous = await Get<{ status: string; customer?: { id: string; code: string } }>(
          `/api/customers/requests/${pending.current.id}`,
        ).catch((e) => {
          if (e instanceof HttpError && e.status === 404) return null;
          throw e;
        });
        if (previous?.status === 'complete') {
          setSaved(previous.customer!);
          return;
        }
        if (previous && previous.status !== 'cancelled')
          await Delete(`/api/customers/requests/${pending.current.id}`);
      }
      router.push(initial ? `/customers/${initial.id}` : '/customers');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ยกเลิกไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (!options)
    return (
      <section
        aria-label="เพิ่มลูกค้า"
        className="relative min-h-80 w-full px-4 py-6 md:px-6 md:py-8"
      >
        {loadError ? (
          <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
            {loadError}
            <button
              type="button"
              onClick={() => {
                setLoadError('');
                setReload((v) => v + 1);
              }}
              className="text-[#1a58a7]"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <LoadingComponent isVisible variant="content" label="กำลังโหลดตัวเลือกลูกค้า..." />
        )}
      </section>
    );

  const choiceOptions: Record<NonNullable<FormField['choice']>, ChoiceOption[]> = {
    customerStatus: CUSTOMER_STATUSES.map((status) => ({ id: status, label: status })),
    territory: territories,
    creditTerm: options.creditTerm.map((item) => ({ id: item.id, label: item.name })),
    creditStart: options.creditStart.map((item) => ({ id: item.id, label: item.name })),
    profession: [
      { id: 'แพทย์', label: 'แพทย์' },
      { id: 'เภสัชกร', label: 'เภสัชกร' },
    ],
  };

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
      aria-label={initial ? `แก้ไขลูกค้า ${initial.code}` : 'เพิ่มลูกค้า'}
      className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      {initial && (
        <h1 className="mb-6 text-xl poppins-semibold text-[#26364b]">แก้ไขลูกค้า {initial.code}</h1>
      )}
      <datalist id="billing-cycle-options">
        {options.billingCycle.map((item) => (
          <option key={item.id} value={item.name} />
        ))}
      </datalist>
      <fieldset
        disabled={busy || Boolean(saved) || Boolean(submitted)}
        className="min-w-0 border-0 p-0"
      >
        <div className="space-y-9">
          {sections.map((section, index) => (
            <details
              key={section.title}
              open={openSections.includes(section.title)}
              onToggle={(event) => {
                const open = event.currentTarget.open;
                setOpenSections((current) =>
                  open
                    ? [...new Set([...current, section.title])]
                    : current.filter((title) => title !== section.title),
                );
              }}
              className="group rounded-lg border border-[#d9e3ee] p-4 md:p-6"
            >
              <SectionTitle title={section.title} />
              {index === 0 && (
                <CustomerCodePreview
                  groups={options.codeGroup}
                  initialGroup={initial?.codeGroup?.id}
                  initialSequence={
                    initial?.sequence ? String(initial.sequence).padStart(4, '0') : ''
                  }
                />
              )}
              {section.description && (
                <p className="mt-3 text-sm poppins-regular text-[#8994a5]">{section.description}</p>
              )}
              {section.title === 'เอกสารแนบ' ? (
                <>
                  {initial && (
                    <ExistingFiles
                      files={initial.details.files}
                      keep={keepFileIds}
                      onChange={setKeepFileIds}
                    />
                  )}
                  <CustomerAttachmentsPreview
                    documentTypes={options.documentType}
                    onChange={setFiles}
                  />
                </>
              ) : section.title === 'ข้อมูลภาษีและที่อยู่ออกบิล' ? (
                <CustomerBillingPreview fields={section.fields} initial={initial?.details.fields} />
              ) : section.title === 'ที่อยู่จัดส่งสินค้า' ? (
                <ShippingAddresses addresses={addresses} onChange={setAddresses} />
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <Field
                      key={field.key}
                      field={field}
                      required={section.title === 'ข้อมูลติดต่อ' || field.required}
                      options={field.choice ? choiceOptions[field.choice] : undefined}
                      initialValue={
                        initial?.details.fields[field.key as keyof Customer['details']['fields']]
                      }
                    />
                  ))}
                </div>
              )}
            </details>
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="mt-6 text-sm poppins-regular text-red-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-end gap-4">
        {progress && (
          <p role="status" className="text-sm poppins-regular text-[#65758b]">
            {progress}...
          </p>
        )}
        <button
          type="button"
          disabled={busy || Boolean(saved) || Boolean(submitted)}
          onClick={() => void cancel()}
          className="w-36 rounded-lg border border-[#d9e3ee] bg-white px-5 py-2.5 text-center text-sm poppins-medium text-[#344256] hover:bg-gray-50 disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={busy || Boolean(saved) || Boolean(submitted)}
          className="w-36 rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white disabled:opacity-50"
        >
          {busy ? 'กำลังบันทึก...' : asRequest ? 'ส่งคำขอ' : 'บันทึก'}
        </button>
      </div>
      <SuccessAlertComponent
        isOpen={Boolean(submitted)}
        title="ส่งคำขอเพิ่มลูกค้าแล้ว"
        description="Admin จะตรวจและอนุมัติ ติดตามสถานะได้ที่ คำขอของฉัน"
        onClose={() => {
          if (submitted) router.push(`/customers/requests/${submitted}`);
        }}
      />
      <SuccessAlertComponent
        isOpen={Boolean(saved)}
        title={
          saved ? `${initial ? 'บันทึกการแก้ไขลูกค้า' : 'บันทึกลูกค้า'} ${saved.code} แล้ว` : ''
        }
        onClose={() => {
          if (saved) router.push(`/customers/${saved.id}`);
        }}
      />
      {saved && (
        <p className="mt-4 text-right text-sm poppins-regular">
          <Link href={`/customers/${saved.id}`} className="text-[#1a58a7]">
            เปิดข้อมูลลูกค้า {saved.code}
          </Link>
        </p>
      )}
    </form>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a58a7] [&::-webkit-details-marker]:hidden">
      <h3 className="text-base poppins-semibold text-[#1a58a7]">{title}</h3>
      <ChevronDown className="shrink-0 text-[#1A58A7] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
    </summary>
  );
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <span className="block text-sm poppins-medium text-[#344256]">
      {text}
      {required && (
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      )}
    </span>
  );
}

function Field({
  field,
  required = false,
  options,
  initialValue,
}: {
  field: FormField;
  required?: boolean;
  options?: ChoiceOption[];
  initialValue?: string;
}) {
  const id = useId();
  if (field.date)
    return (
      <div className="min-w-0">
        <FieldLabel text={field.label} required={required} />
        <div className="mt-2">
          <CustomerDatePreview label={field.label} name={field.key} initialValue={initialValue} />
        </div>
      </div>
    );
  if (options)
    return (
      <div className="min-w-0">
        <FieldLabel text={field.label} required={required} />
        <div className="mt-2 poppins-regular">
          <CustomerChoicePreview
            binary={field.choice === 'profession'}
            initialValue={initialValue || (field.choice === 'customerStatus' ? 'ใช้งาน' : '')}
            name={field.key}
            label={field.label}
            options={options}
            required={required}
          />
        </div>
      </div>
    );
  return (
    <label htmlFor={id} className={`min-w-0 ${field.multiline ? 'sm:col-span-2' : ''}`}>
      <FieldLabel text={field.label} required={required} />
      {field.multiline ? (
        <textarea
          id={id}
          name={field.key}
          defaultValue={initialValue}
          aria-required={required}
          placeholder={field.placeholder}
          rows={3}
          className={`${inputClass} min-h-24 resize-y`}
        />
      ) : (
        <input
          id={id}
          name={field.key}
          defaultValue={initialValue}
          aria-required={required}
          placeholder={field.placeholder}
          inputMode={field.key === 'creditLimit' ? 'decimal' : undefined}
          list={field.suggestions === 'billingCycle' ? 'billing-cycle-options' : undefined}
          className={`${inputClass} h-11`}
        />
      )}
    </label>
  );
}

function ShippingAddresses({
  addresses,
  onChange,
}: {
  addresses: ShippingAddress[];
  onChange: (addresses: ShippingAddress[]) => void;
}) {
  const update = (id: string, patch: Partial<ShippingAddress>) =>
    onChange(
      addresses.map((address) =>
        address.id === id
          ? { ...address, ...patch }
          : patch.isDefault
            ? { ...address, isDefault: false }
            : address,
      ),
    );
  return (
    <div className="mt-4 space-y-5">
      {addresses.map((address, index) => (
        <div key={address.id} className="rounded-md border border-[#e4e9f0] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm poppins-semibold text-[#344256]">
              ที่อยู่จัดส่งแห่งที่ {index + 1}
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm poppins-regular text-[#344256]">
                <input
                  type="radio"
                  name="shipping-default"
                  checked={address.isDefault}
                  onChange={() => update(address.id, { isDefault: true })}
                  className="h-4 w-4 cursor-pointer accent-blue-700"
                />
                ที่อยู่จัดส่งเริ่มต้น
              </label>
              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const rest = addresses.filter((item) => item.id !== address.id);
                    if (address.isDefault) rest[0] = { ...rest[0], isDefault: true };
                    onChange(rest);
                  }}
                  className="text-sm poppins-medium text-red-600"
                >
                  นำออก
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {Object.entries(SHIPPING_FIELDS)
              .filter(([key]) => !['subdistrict', 'district', 'province', 'postcode'].includes(key))
              .map(([key, field]) => (
                <label key={key} className={`min-w-0 ${key === 'address' ? 'sm:col-span-2' : ''}`}>
                  <FieldLabel text={field.label} />
                  {key === 'address' ? (
                    <textarea
                      value={address[key as keyof typeof SHIPPING_FIELDS]}
                      onChange={(event) => update(address.id, { [key]: event.target.value })}
                      placeholder="บ้านเลขที่ อาคาร ถนน และรายละเอียดสถานที่"
                      rows={3}
                      className={`${inputClass} min-h-24 resize-y`}
                    />
                  ) : (
                    <input
                      value={address[key as keyof typeof SHIPPING_FIELDS]}
                      onChange={(event) => update(address.id, { [key]: event.target.value })}
                      placeholder={field.label}
                      className={`${inputClass} h-11`}
                    />
                  )}
                </label>
              ))}
            <CustomerAddressPicker
              idPrefix={`shipping-${address.id}`}
              value={{
                province: address.province,
                district: address.district,
                subdistrict: address.subdistrict,
                postcode: address.postcode,
              }}
              onChange={(next) => update(address.id, next)}
              labels={{
                province: SHIPPING_FIELDS.province.label,
                district: SHIPPING_FIELDS.district.label,
                subdistrict: SHIPPING_FIELDS.subdistrict.label,
                postcode: SHIPPING_FIELDS.postcode.label,
              }}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        disabled={addresses.length >= SHIPPING_LIMIT}
        onClick={() => onChange([...addresses, blankAddress(!addresses.length)])}
        className="rounded-lg border border-[#d9e3ee] px-4 py-2 text-sm poppins-medium text-[#344256] hover:bg-blue-50 disabled:opacity-50"
      >
        เพิ่มที่อยู่จัดส่ง
      </button>
    </div>
  );
}

function ExistingFiles({
  files,
  keep,
  onChange,
}: {
  files: Customer['details']['files'];
  keep: string[];
  onChange: (keep: string[]) => void;
}) {
  if (!files.length) return null;
  return (
    <div className="mt-4">
      <p className="text-sm poppins-medium text-[#344256]">ไฟล์เดิม</p>
      <ul className="mt-2 list-none space-y-2 p-0">
        {files.map((file) => {
          const kept = keep.includes(file.id);
          return (
            <li key={file.id} className="flex flex-wrap items-center gap-3 text-sm poppins-regular">
              <span className={kept ? 'text-[#344256]' : 'text-[#8994a5] line-through'}>
                {file.documentTypeName}:{' '}
                <a
                  href={`/api/customers/files/${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a58a7] hover:underline"
                >
                  {file.name}
                </a>
              </span>
              <button
                type="button"
                onClick={() =>
                  onChange(kept ? keep.filter((id) => id !== file.id) : [...keep, file.id])
                }
                className="rounded border border-[#d9e3ee] px-3 py-1 text-xs poppins-medium text-[#344256] hover:bg-blue-50"
              >
                {kept ? 'นำออก' : 'เก็บไว้'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
