'use client';
import PaginationControls from '@/components/ui/pagination-controls';
import type { RecordListResponse } from '@/types/api/records';
import type { RecordOptionsResponse, RecordFiltersResponse } from '@/types/api/records';
import type { RecordDetailResponse, RecordConfigResponse } from '@/types/api/records';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { RecordModule, RecordConfig, RecordField, RecordRow } from '@/types/api/records';
import { Delete, Get, Post, Update } from '@/service/http';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import StatusBadge from '@/components/ui/status-badge';
import SearchCombobox from '@/components/ui/search-combobox';
export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const moduleKey = 'customers';
  const entity = {
    key: 'customers',
    model: 'Customer',
    table: 'customers',
    page: '/customers',
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
        label: 'กลุ่มลูกค้า',
        type: 'text',
        required: false,
      },
      {
        key: 'province',
        label: 'จังหวัด',
        type: 'text',
        required: false,
      },
      {
        key: 'owner',
        label: 'ผู้ดูแล / ผู้บันทึก',
        type: 'text',
        required: false,
      },
      {
        key: 'paymentTerms',
        label: 'เงื่อนไขชำระเงิน',
        type: 'text',
        required: false,
      },
      {
        key: 'territoryId',
        label: 'เขตขาย',
        type: 'relation',
        relation: 'sales-territories',
        required: true,
      },
      {
        key: 'notes',
        label: 'หมายเหตุ',
        type: 'textarea',
        required: false,
      },
    ],
    display: ['category', 'province', 'owner', 'paymentTerms'],
    title: 'ลูกค้า',
    action: 'เพิ่มลูกค้า',
    columns: ['ชื่อลูกค้า', 'กลุ่ม / จังหวัด', 'ผู้ดูแล', 'สถานะ'],
    tabs: ['ทั้งหมด'],
    filters: ['ทุกหมวด'],
    eyebrow: '',
    description: '',
  };
  const router = useRouter();
  const mutationLock = useRef(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [row, setRow] = useState<RecordRow | null>(null),
    [config, setConfig] = useState<RecordConfig | null>(null),
    [error, setError] = useState(''),
    [edit, setEdit] = useState(false),
    [reason, setReason] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [afterClosePath, setAfterClosePath] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      Get<RecordDetailResponse>(
        '/api/' + moduleKey + '/' + encodeURIComponent(id),
        controller.signal,
      ),
      Get<RecordConfigResponse>('/api/' + moduleKey + '?view=config', controller.signal),
    ])
      .then(([r, c]) => {
        setRow(r.data);
        setConfig(c.data);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [moduleKey, id]);
  async function remove() {
    if (mutationLock.current || notice) return;
    mutationLock.current = true;
    setBusy(true);
    setError('');
    try {
      await Delete('/api/' + moduleKey + '/' + row!.id, { reason });
      setNotice('ลบรายการแล้ว');
      setAfterClosePath(entity.page);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ลบไม่สำเร็จ');
    } finally {
      setConfirmDelete(false);
      mutationLock.current = false;
      setBusy(false);
    }
  }
  if (!row || !config)
    return error ? (
      <section role="alert" className="p-6">
        {error}
        <Link href={entity.page} className="ml-3 text-[#1a58a7]">
          กลับรายการ
        </Link>
      </section>
    ) : (
      <LoadingComponent isVisible />
    );
  if (edit)
    return (
      <EditForm
        record={row}
        onSaved={(r) => {
          setRow(r);
          setEdit(false);
          setNotice('บันทึกข้อมูลแล้ว');
        }}
      />
    );
  const date = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  });
  return (
    <section className="flex flex-1 flex-col gap-5 p-6">
      <ConfirmationDialog
        isOpen={confirmDelete}
        title={`ลบ${entity.title}นี้?`}
        description={`${row.name} จะถูกซ่อนจากรายการปกติ สามารถกู้คืนได้ในแท็บลบแล้ว`}
        busy={busy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void remove()}
      />
      <SuccessAlertComponent
        title={notice}
        isOpen={Boolean(notice)}
        onClose={() => {
          setNotice('');
          if (afterClosePath) {
            const path = afterClosePath;
            setAfterClosePath('');
            router.push(path);
            router.refresh();
          }
        }}
      />
      <Link href={entity.page} className="text-sm text-[#1a58a7]">
        ← {entity.title}
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-xl poppins-semibold">{row.name}</h1>
          <p className="text-sm text-[#718096]">
            {row.code} · แก้ไขล่าสุด {date.format(new Date(row.updatedAt))}
          </p>
        </div>
        {config.canWrite && (
          <button
            onClick={() => setEdit(true)}
            className="rounded bg-[#1a58a7] px-4 py-2 text-sm text-white"
          >
            แก้ไขข้อมูล
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <dl className="grid max-w-4xl gap-4 rounded-xl border border-[#d9e3ee] bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[#718096]">รหัส / เลขอ้างอิง</dt>
          <dd className="m-0 mt-1 break-words text-sm">{row.code || '-'}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#718096]">ชื่อ / หัวข้อ</dt>
          <dd className="m-0 mt-1 break-words text-sm">{row.name || '-'}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#718096]">สถานะ</dt>
          <dd className="m-0 mt-1 break-words text-sm">
            <StatusBadge value={row.status || 'ยังไม่ระบุ'} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#718096]">กลุ่มลูกค้า</dt>
          <dd className="m-0 mt-1 break-words text-sm">{String(row.category ?? '-') || '-'}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#718096]">จังหวัด</dt>
          <dd className="m-0 mt-1 break-words text-sm">{String(row.province ?? '-') || '-'}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#718096]">ผู้ดูแล / ผู้บันทึก</dt>
          <dd className="m-0 mt-1 break-words text-sm">{String(row.owner ?? '-') || '-'}</dd>
        </div>
        <div>
          <dt className="text-xs text-[#718096]">เงื่อนไขชำระเงิน</dt>
          <dd className="m-0 mt-1 break-words text-sm">{String(row.paymentTerms ?? '-') || '-'}</dd>
        </div>

        <div>
          <dt className="text-xs text-[#718096]">เขตขาย</dt>
          <dd className="m-0 mt-1 break-words text-sm">
            <RelationName moduleKey="sales-territories" id={String(row.territoryId ?? '')} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[#718096]">หมายเหตุ</dt>
          <dd className="m-0 mt-1 break-words text-sm">{String(row.notes ?? '-') || '-'}</dd>
        </div>
      </dl>
      <LinkedRecordPanel moduleKey="customers" record={row} />
      {config.canWrite && (
        <div className="max-w-4xl rounded-xl border border-red-200 p-5">
          <h2 className="text-sm poppins-semibold text-red-700">ลบรายการ</h2>
          <label className="block text-sm">
            เหตุผล
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              className="mt-2 h-10 w-full rounded border border-[#d9e3ee] px-3"
            />
          </label>
          <button
            disabled={busy || Boolean(notice)}
            onClick={() => setConfirmDelete(true)}
            className="mt-4 rounded border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
          >
            {busy ? 'กำลังลบ...' : 'ลบรายการ'}
          </button>
        </div>
      )}
    </section>
  );
}
function RelationName({ moduleKey, id }: { moduleKey: string; id: string }) {
  const [name, setName] = useState('');
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    Get<{ data: { title?: string; name?: string } }>(
      '/api/' + moduleKey + '/' + id,
      controller.signal,
    )
      .then((r) => setName(r.data.name ?? '-'))
      .catch(() => {});
    return () => controller.abort();
  }, [moduleKey, id]);
  return id ? name || 'รายการที่เชื่อมไว้' : '-';
}

function EditForm({ record, onSaved }: { record: RecordRow; onSaved: (row: RecordRow) => void }) {
  const entity: RecordModule = {
    key: 'customers',
    model: 'Customer',
    table: 'customers',
    page: '/customers',
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
        label: 'กลุ่มลูกค้า',
        type: 'text',
        required: false,
      },
      {
        key: 'province',
        label: 'จังหวัด',
        type: 'text',
        required: false,
      },
      {
        key: 'owner',
        label: 'ผู้ดูแล / ผู้บันทึก',
        type: 'text',
        required: false,
      },
      {
        key: 'paymentTerms',
        label: 'เงื่อนไขชำระเงิน',
        type: 'text',
        required: false,
      },
      {
        key: 'territoryId',
        label: 'เขตขาย',
        type: 'relation',
        relation: 'sales-territories',
        required: true,
      },
      {
        key: 'notes',
        label: 'หมายเหตุ',
        type: 'textarea',
        required: false,
      },
    ],
    display: ['category', 'province', 'owner', 'paymentTerms'],
    title: 'ลูกค้า',
    action: 'เพิ่มลูกค้า',
    columns: ['ชื่อลูกค้า', 'กลุ่ม / จังหวัด', 'ผู้ดูแล', 'สถานะ'],
    tabs: ['ทั้งหมด'],
    filters: ['ทุกหมวด'],
    eyebrow: '',
    description: '',
  };
  const router = useRouter();
  const formId = useId();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const mutationLock = useRef(false);
  const [pendingEdit, setPendingEdit] = useState<Record<string, unknown> | null>(null);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      entity.fields.map((f) => [
        f.key,
        String(record?.[f.key] ?? (f.key === 'status' ? 'ใช้งานอยู่' : '')),
      ]),
    ),
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
    if (mutationLock.current || createdId || pendingEdit) return;
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
    const body = { ...values, ...(record ? { expectedUpdatedAt: record.updatedAt } : {}) };
    if (record) {
      setPendingEdit(body);
      return;
    }
    await persist(body);
  }
  async function persist(body: Record<string, unknown>) {
    if (mutationLock.current || createdId) return;
    mutationLock.current = true;
    setBusy(true);
    setError('');
    try {
      const url = '/api/' + entity.key + (record ? '/' + record.id : '');
      const result = record
        ? await Update<RecordDetailResponse>(url, body)
        : await Post<RecordDetailResponse>(url, body);
      if (onSaved) onSaved(result.data);
      else setCreatedId(result.data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setPendingEdit(null);
      mutationLock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="flex flex-1 flex-col gap-5 p-6">
      <ConfirmationDialog
        isOpen={pendingEdit !== null}
        variant="primary"
        title={`บันทึกการแก้ไข${entity.title}?`}
        description="ยืนยันบันทึกข้อมูลที่แก้ไข หากยกเลิกข้อมูลในฟอร์มจะยังอยู่"
        confirmLabel="ยืนยันบันทึก"
        busyLabel="กำลังบันทึก..."
        busy={busy}
        onCancel={() => setPendingEdit(null)}
        onConfirm={() => {
          if (pendingEdit) void persist(pendingEdit);
        }}
      />
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
      <h1 className="m-0 text-xl poppins-semibold">
        {record ? 'แก้ไข' + entity.title : entity.action}
      </h1>
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
            <span className="mb-2 block text-sm text-[#344256]">กลุ่มลูกค้า</span>
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
          <label>
            <span className="mb-2 block text-sm text-[#344256]">จังหวัด</span>
            <input
              name="province"
              type="text"
              aria-invalid={Boolean(fieldErrors['province'])}
              aria-describedby={fieldErrors['province'] ? `${formId}-province-error` : undefined}
              maxLength={500}
              value={values['province']}
              onChange={(event) => changeValue('province', event.target.value)}
              className="h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['province'] && (
              <p
                id={`${formId}-province-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['province']}
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
          <label>
            <span className="mb-2 block text-sm text-[#344256]">เงื่อนไขชำระเงิน</span>
            <input
              name="paymentTerms"
              type="text"
              aria-invalid={Boolean(fieldErrors['paymentTerms'])}
              aria-describedby={
                fieldErrors['paymentTerms'] ? `${formId}-paymentTerms-error` : undefined
              }
              maxLength={500}
              value={values['paymentTerms']}
              onChange={(event) => changeValue('paymentTerms', event.target.value)}
              className="h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm aria-invalid:border-red-600"
            />
            {fieldErrors['paymentTerms'] && (
              <p
                id={`${formId}-paymentTerms-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['paymentTerms']}
              </p>
            )}
          </label>

          <label>
            <span className="mb-2 block text-sm text-[#344256]">เขตขาย</span>
            <RelationPicker
              field={{
                key: 'territoryId',
                label: 'เขตขาย',
                type: 'relation',
                relation: 'sales-territories',
                required: true,
              }}
              value={values['territoryId']}
              invalid={Boolean(fieldErrors['territoryId'])}
              errorId={fieldErrors['territoryId'] ? `${formId}-territoryId-error` : undefined}
              onChange={(value) => changeValue('territoryId', value)}
            />
            {fieldErrors['territoryId'] && (
              <p
                id={`${formId}-territoryId-error`}
                role="alert"
                className="mb-0 mt-1.5 text-xs text-red-600"
              >
                {fieldErrors['territoryId']}
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

function LinkedRecordPanel({ moduleKey, record }: { moduleKey: string; record: RecordRow }) {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (moduleKey !== 'sales-territories') return;
    let active = true;
    queueMicrotask(() => {
      if (active) setBusy(true);
    });
    const params = new URLSearchParams({
      territoryId: record.id,
      offset: String(offset),
      limit: String(pageSize),
    });
    Get<RecordListResponse>(`/customers?${params}`)
      .then((result) => {
        if (!active) return;
        setRows(result.data);
        setTotal(result.pagination.total);
        setError('');
      })
      .catch(() => {
        if (active) setError('โหลดลูกค้าในเขตไม่สำเร็จ');
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [moduleKey, record.id, offset, pageSize]);
  const name = (key: string) => String(record[key] || '-');
  return (
    <section className="mt-6 border-t border-gray-100 pt-5">
      <h2 className="poppins-semibold mb-3 text-lg">ข้อมูลที่เชื่อมโยง</h2>
      <dl className="grid gap-3 text-sm md:grid-cols-3">
        {moduleKey === 'customers' && (
          <div>
            <dt className="text-gray-500">เขตขาย</dt>
            <dd>
              {record.territoryId ? (
                <Link
                  className="text-blue-600 underline"
                  href={`/customers/territories/${record.territoryId}`}
                >
                  {name('territoryName')}
                </Link>
              ) : (
                '-'
              )}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-gray-500">ผู้จัดการ (Manager)</dt>
          <dd>{name('managerName')}</dd>
        </div>
        <div>
          <dt className="text-gray-500">ฝ่ายขาย (Sales)</dt>
          <dd>{name('salesName')}</dd>
        </div>
      </dl>
      {moduleKey === 'sales-territories' && (
        <div className="mt-5">
          <h3 className="poppins-medium mb-2">ลูกค้าในเขต ({total})</h3>
          {error && (
            <p role="alert" className="text-red-600">
              {error}
            </p>
          )}
          {busy ? (
            <div className="relative min-h-32">
              <LoadingComponent isVisible variant="content" padding="py-12" />
            </div>
          ) : rows.length ? (
            <ul className="divide-y divide-gray-100">
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    className="block py-3 text-blue-600 hover:bg-blue-50"
                    href={`/customers/${row.id}`}
                  >
                    {row.name} · {row.code}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">ยังไม่มีลูกค้าในเขตนี้</p>
          )}
          <PaginationControls
            page={Math.floor(offset / pageSize) + 1}
            pages={Math.max(1, Math.ceil(total / pageSize))}
            total={total}
            count={rows.length}
            onChange={(page) => setOffset((page - 1) * pageSize)}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setOffset(0);
            }}
            disabled={busy}
          />
        </div>
      )}
    </section>
  );
}
