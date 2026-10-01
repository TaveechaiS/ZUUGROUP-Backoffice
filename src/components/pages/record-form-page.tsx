'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { moduleFor, type RecordField, type RecordRow } from '@/features/records/types';
import { Get, Post, Update } from '@/service/http';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
export function RecordFormPage({
  moduleKey,
  record,
  onSaved,
}: {
  moduleKey: string;
  record?: RecordRow;
  onSaved?: (row: RecordRow) => void;
}) {
  const entity = moduleFor(moduleKey)!;
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      entity.fields.map((f) => [
        f.key,
        record?.fields[f.key] ?? (f.key === 'status' ? 'ใช้งานอยู่' : ''),
      ]),
    ),
  );
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [createdId, setCreatedId] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const url = '/api/' + entity.key + (record ? '/' + record.id : '');
      const body = { ...values, ...(record ? { expectedUpdatedAt: record.updatedAt } : {}) };
      const result = record
        ? await Update<{ data: RecordRow }>(url, body)
        : await Post<{ data: RecordRow }>(url, body);
      if (onSaved) onSaved(result.data);
      else setCreatedId(result.data.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
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
      <h1 className="m-0 text-xl font-semibold">
        {record ? 'แก้ไข' + entity.title : entity.action}
      </h1>
      <form
        onSubmit={save}
        className="max-w-3xl rounded-xl border border-[#d9e3ee] bg-white p-5 shadow-xs"
      >
        {error && (
          <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <fieldset disabled={busy || Boolean(createdId)} className="grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2">
          {entity.fields.map((field) => (
            <label key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <span className="mb-2 block text-sm text-[#344256]">
                {field.label}
                {field.required ? ' *' : ''}
              </span>
              {field.relation ? (
                <RelationPicker
                  field={field}
                  value={values[field.key]}
                  onChange={(value) => setValues((v) => ({ ...v, [field.key]: value }))}
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  value={values[field.key]}
                  maxLength={4000}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  className="min-h-24 w-full rounded-md border border-[#d9e3ee] p-3 text-sm"
                />
              ) : (
                <input
                  type={
                    field.type === 'number' ? 'number' : field.key === 'fileUrl' ? 'url' : 'text'
                  }
                  min={field.type === 'number' ? 0 : undefined}
                  step={field.type === 'number' ? '0.01' : undefined}
                  required={field.required}
                  maxLength={500}
                  value={values[field.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  className="h-10 w-full rounded-md border border-[#d9e3ee] px-3 text-sm"
                />
              )}
            </label>
          ))}
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
}: {
  field: RecordField;
  value: string;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState(''),
    [offset, setOffset] = useState(0),
    [options, setOptions] = useState<{ id: string; code: string; name: string }[]>([]),
    [more, setMore] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ search, offset: String(offset), limit: '10' });
      Get<{
        data: { id: string; code: string; name: string }[];
        pagination: { hasMore: boolean };
      }>('/api/' + field.relation + '/options?' + params, controller.signal)
        .then((r) => {
          setOptions(r.data);
          setMore(r.pagination.hasMore);
          setError('');
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(e.message);
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [field.relation, offset, search]);
  return (
    <div className="space-y-2">
      <input
        aria-label={'ค้นหา' + field.label}
        placeholder={'ค้นหา' + field.label}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOffset(0);
        }}
        className="h-9 w-full rounded border border-[#d9e3ee] px-3 text-sm"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded border border-[#d9e3ee] px-3 text-sm"
      >
        <option value="">ยังไม่ระบุ</option>
        {value && !options.some((o) => o.id === value) && (
          <option value={value}>รายการที่เลือกไว้</option>
        )}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.code} · {o.name}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-3 text-xs text-[#1a58a7]">
        <button
          type="button"
          disabled={offset === 0}
          onClick={() => setOffset((n) => Math.max(0, n - 10))}
          className="disabled:opacity-40"
        >
          ก่อนหน้า
        </button>
        <button
          type="button"
          disabled={!more}
          onClick={() => setOffset((n) => n + 10)}
          className="disabled:opacity-40"
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
