'use client';
import type { RecordOptionsResponse, RecordFiltersResponse } from '@/types/api/records';
import type { RecordDetailResponse } from '@/types/api/records';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { RecordModule, RecordField } from '@/types/api/records';
import { Get, Post } from '@/service/http';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import SearchCombobox from '@/components/ui/search-combobox';
export default function Page() {
  const entity: RecordModule = {
    key: 'promotions',
    model: 'Promotion',
    table: 'promotions',
    page: '/promotions',
    fields: [
      {
        key: 'code',
        label: 'รหัส / เลขอ้างอิง',
        type: 'text',
        required: true,
      },
      {
        key: 'name',
        label: 'ชื่อ / หัวข้อ',
        type: 'text',
        required: true,
      },
      {
        key: 'status',
        label: 'สถานะ',
        type: 'text',
        required: true,
      },
      {
        key: 'category',
        label: 'ประเภท',
        type: 'text',
        required: false,
      },
      {
        key: 'description',
        label: 'รายละเอียด',
        type: 'textarea',
        required: false,
      },
      {
        key: 'owner',
        label: 'ผู้ดูแล / ผู้บันทึก',
        type: 'text',
        required: false,
      },
      {
        key: 'conditions',
        label: 'เงื่อนไข',
        type: 'textarea',
        required: false,
      },
      {
        key: 'notes',
        label: 'หมายเหตุ',
        type: 'textarea',
        required: false,
      },
    ],
    display: ['category', 'description', 'owner', 'conditions'],
    title: 'โปรโมชันและของแถม',
    action: 'สร้างโปรโมชัน',
    columns: ['ชื่อโปรโมชัน', 'ช่วงเวลา / กลุ่มสินค้า', 'ผู้สร้าง', 'สถานะ'],
    tabs: ['ทั้งหมด'],
    filters: ['ทุกหมวด'],
    eyebrow: '',
    description: '',
  };
  const router = useRouter();
  const formId = useId();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const mutationLock = useRef(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(entity.fields.map((f) => [f.key, f.key === 'status' ? 'ใช้งานอยู่' : ''])),
  );
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [createdId, setCreatedId] = useState('');
  function changeValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutationLock.current || createdId) return;
    const errors: Record<string, string> = {};
    for (const field of entity.fields) {
      const value = values[field.key]?.trim() ?? '';
      const control = event.currentTarget.elements.namedItem(field.key);
      if (field.required && !value) {
        errors[field.key] =
          `${field.relation || field.key === 'status' ? 'กรุณาเลือก' : 'กรุณากรอก'}${field.label}`;
      } else if (
        !field.relation &&
        field.key !== 'status' &&
        (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement)
      ) {
        const validity = control.validity;
        if (validity.badInput || validity.typeMismatch)
          errors[field.key] = `กรุณากรอก${field.label}ให้ถูกต้อง`;
        else if (validity.rangeUnderflow)
          errors[field.key] =
            `กรุณากรอก${field.label}ตั้งแต่ ${control.getAttribute('min')} ขึ้นไป`;
        else if (validity.stepMismatch)
          errors[field.key] = `กรุณากรอก${field.label}เป็นตัวเลขทศนิยมไม่เกิน 2 ตำแหน่ง`;
        else if (validity.tooLong)
          errors[field.key] = `กรุณากรอก${field.label}ไม่เกิน ${control.maxLength} ตัวอักษร`;
        else if (!validity.valid) errors[field.key] = `กรุณากรอก${field.label}ให้ถูกต้อง`;
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setError('');
      const first = event.currentTarget.elements.namedItem(Object.keys(errors)[0]);
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    const body = { ...values };
    await persist(body);
  }
  async function persist(body: Record<string, unknown>) {
    if (mutationLock.current || createdId) return;
    mutationLock.current = true;
    setBusy(true);
    setError('');
    try {
      const url = '/api/' + entity.key;
      const result = await Post<RecordDetailResponse>(url, body);
      setCreatedId(result.data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="flex flex-1 flex-col gap-5 p-6">
      <SuccessAlertComponent
        title={`เพิ่ม${entity.title}แล้ว`}
        isOpen={Boolean(createdId)}
        onClose={() => {
          if (!createdId) return;
          const path = entity.page + '/' + createdId;
          setCreatedId('');
          router.push(path);
          router.refresh();
        }}
      />
      <Link href={entity.page} className="text-sm text-[#1a58a7]">
        ← {entity.title}
      </Link>
      <h1 className="m-0 text-xl font-semibold">{entity.action}</h1>
      <form
        noValidate
        onSubmit={save}
        className="max-w-3xl rounded-xl border border-[#d9e3ee] bg-white p-5 shadow-xs"
      >
        {error && (
          <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <fieldset
          disabled={busy || Boolean(createdId)}
          className="grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2"
        >
          <label>
            <span className="mb-2 block text-sm text-[#344256]">
              รหัส / เลขอ้างอิง <span className="text-red-600"> *</span>
            </span>
            <input
              name="code"
              type="text"
              required
              aria-invalid={Boolean(fieldErrors['code'])}
              aria-describedby={fieldErrors['code'] ? `${formId}-code-error` : undefined}
              maxLength={500}
              value={values['code']}
              onChange={(event) => changeValue('code', event.target.value)}
              className="h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['code'] && (
              <p
                id={`${formId}-code-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['code']}
              </p>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm text-[#344256]">
              ชื่อ / หัวข้อ <span className="text-red-600"> *</span>
            </span>
            <input
              name="name"
              type="text"
              required
              aria-invalid={Boolean(fieldErrors['name'])}
              aria-describedby={fieldErrors['name'] ? `${formId}-name-error` : undefined}
              maxLength={500}
              value={values['name']}
              onChange={(event) => changeValue('name', event.target.value)}
              className="h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['name'] && (
              <p
                id={`${formId}-name-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['name']}
              </p>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm text-[#344256]">
              สถานะ <span className="text-red-600"> *</span>
            </span>
            <RelationPicker
              field={{ key: 'status', label: 'สถานะ', type: 'text', required: true }}
              statusModule={entity.key}
              value={values['status']}
              invalid={Boolean(fieldErrors['status'])}
              errorId={fieldErrors['status'] ? `${formId}-status-error` : undefined}
              onChange={(value) => changeValue('status', value)}
            />
            {fieldErrors['status'] && (
              <p
                id={`${formId}-status-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['status']}
              </p>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm text-[#344256]">ประเภท</span>
            <input
              name="category"
              type="text"
              aria-invalid={Boolean(fieldErrors['category'])}
              aria-describedby={fieldErrors['category'] ? `${formId}-category-error` : undefined}
              maxLength={500}
              value={values['category']}
              onChange={(event) => changeValue('category', event.target.value)}
              className="h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['category'] && (
              <p
                id={`${formId}-category-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['category']}
              </p>
            )}
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm text-[#344256]">รายละเอียด</span>
            <textarea
              name="description"
              aria-invalid={Boolean(fieldErrors['description'])}
              aria-describedby={
                fieldErrors['description'] ? `${formId}-description-error` : undefined
              }
              value={values['description']}
              maxLength={4000}
              onChange={(event) => changeValue('description', event.target.value)}
              className="min-h-24 w-full rounded-md border border-[#d9e3ee] bg-white p-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['description'] && (
              <p
                id={`${formId}-description-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['description']}
              </p>
            )}
          </label>
          <label>
            <span className="mb-2 block text-sm text-[#344256]">ผู้ดูแล / ผู้บันทึก</span>
            <input
              name="owner"
              type="text"
              aria-invalid={Boolean(fieldErrors['owner'])}
              aria-describedby={fieldErrors['owner'] ? `${formId}-owner-error` : undefined}
              maxLength={500}
              value={values['owner']}
              onChange={(event) => changeValue('owner', event.target.value)}
              className="h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['owner'] && (
              <p
                id={`${formId}-owner-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['owner']}
              </p>
            )}
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm text-[#344256]">เงื่อนไข</span>
            <textarea
              name="conditions"
              aria-invalid={Boolean(fieldErrors['conditions'])}
              aria-describedby={
                fieldErrors['conditions'] ? `${formId}-conditions-error` : undefined
              }
              value={values['conditions']}
              maxLength={4000}
              onChange={(event) => changeValue('conditions', event.target.value)}
              className="min-h-24 w-full rounded-md border border-[#d9e3ee] bg-white p-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['conditions'] && (
              <p
                id={`${formId}-conditions-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['conditions']}
              </p>
            )}
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm text-[#344256]">หมายเหตุ</span>
            <textarea
              name="notes"
              aria-invalid={Boolean(fieldErrors['notes'])}
              aria-describedby={fieldErrors['notes'] ? `${formId}-notes-error` : undefined}
              value={values['notes']}
              maxLength={4000}
              onChange={(event) => changeValue('notes', event.target.value)}
              className="min-h-24 w-full rounded-md border border-[#d9e3ee] bg-white p-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['notes'] && (
              <p
                id={`${formId}-notes-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['notes']}
              </p>
            )}
          </label>
        </fieldset>
        <div className="mt-6 flex justify-end gap-3 border-t border-[#e3e9f0] pt-4">
          <Link href={entity.page} className="rounded border border-[#d9e3ee] px-4 py-2 text-sm">
            ยกเลิก
          </Link>
          <button
            disabled={busy || Boolean(createdId)}
            className="rounded bg-[#1a58a7] px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {busy ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </form>
    </section>
  );
}
function RelationPicker({
  field,
  value,
  onChange,
  invalid,
  errorId,
  statusModule,
}: {
  field: RecordField;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  errorId?: string;
  statusModule?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [search, setSearch] = useState(''),
    [offset, setOffset] = useState(0),
    [remoteOptions, setOptions] = useState<{ id: string; code: string; name: string }[]>([]),
    [more, setMore] = useState(false),
    [error, setError] = useState('');
  const options = statusModule
    ? [...new Set([...statuses, value, 'ใช้งานอยู่'])]
        .filter((status) => status && status.includes(search.trim()))
        .map((status) => ({ id: status, code: status, name: '' }))
    : remoteOptions;
  useEffect(() => {
    if (!statusModule) return;
    const controller = new AbortController();
    Get<RecordFiltersResponse>(`/api/${statusModule}?view=filters`, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setStatuses(result.data.status ?? []);
        setLoading(false);
        setError('');
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : 'โหลดสถานะไม่สำเร็จ');
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [statusModule]);
  useEffect(() => {
    if (statusModule) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ search, offset: String(offset), limit: '10' });
      Get<RecordOptionsResponse>(
        '/api/' + field.relation + '?view=options&' + params,
        controller.signal,
      )
        .then((r) => {
          if (controller.signal.aborted) return;
          setOptions(r.data);
          setMore(r.pagination.hasMore);
          setError('');
          setLoading(false);
        })
        .catch((e) => {
          if (!controller.signal.aborted) {
            setError(e.message);
            setLoading(false);
          }
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [field.relation, offset, search, statusModule]);
  return (
    <SearchCombobox
      field={field}
      value={value}
      onChange={onChange}
      invalid={invalid}
      errorId={errorId}
      statusModule={statusModule}
      options={options}
      search={search}
      offset={offset}
      loading={loading}
      error={error}
      more={more}
      setSearch={setSearch}
      setOffset={setOffset}
      setLoading={setLoading}
      setError={setError}
    />
  );
}
