'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { Get, Post, Update } from '@/service/http';
import { PRODUCT_OPTION_KINDS, type ProductOptionKind } from '@/config/product-options';
import type { ProductOption, ProductOptionsResponse } from '@/types/api/product-options';
import StatusBadge from '@/components/ui/status-badge';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
const inputClass =
  'h-11 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm poppins-regular text-[#344256] outline-none focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100';
const buttonClass =
  'rounded-md bg-[#1a58a7] px-4 py-2.5 text-sm poppins-medium text-white disabled:opacity-50';
export default function ProductOptionsManager({ initialKind }: { initialKind: ProductOptionKind }) {
  const [kind, setKind] = useState(initialKind);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<ProductOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState<ProductOption | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const definition = PRODUCT_OPTION_KINDS[kind];
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        kind,
        search,
        includeInactive: 'true',
        limit: '10',
        offset: String(offset),
      });
      Get<ProductOptionsResponse>('/api/product-options?' + params, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) {
            setResult(data);
            if (offset && !data.data.length) setOffset(0);
          }
        })
        .catch((e: Error) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [kind, search, offset, refresh]);
  function resetForm() {
    setEditing(null);
    setName('');
    setCode('');
    setFormError('');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      setFormError('กรุณากรอกชื่อ');
      return;
    }
    if (!editing && definition.codeRequired && !/^[A-Z0-9]{2,3}$/.test(code.trim())) {
      setFormError('กรุณากรอกรหัส A-Z หรือ 0-9 จำนวน 2–3 ตัว');
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      if (editing)
        await Update('/api/product-options', { id: editing.id, version: editing.version, name });
      else
        await Post('/api/product-options', {
          kind,
          name,
          ...(definition.codeRequired ? { code: code.trim() } : {}),
        });
      resetForm();
      setRefresh((v) => v + 1);
      setSuccess('บันทึกรายการแล้ว');
    } catch (e) {
      setFormError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function toggle(item: ProductOption) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await Update('/api/product-options', {
        id: item.id,
        version: item.version,
        active: !item.active,
      });
      if (editing?.id === item.id) resetForm();
      setRefresh((v) => v + 1);
      setSuccess(item.active ? 'ปิดรายการแล้ว' : 'เปิดรายการแล้ว');
    } catch (e) {
      setError((e as Error).message);
      setRefresh((v) => v + 1);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="min-w-0 space-y-6 p-4 md:p-6">
      <h2 className="text-lg poppins-semibold text-[#344256]">ข้อมูลพื้นฐานสินค้า</h2>
      <div className="flex flex-wrap gap-4">
        <label className="min-w-0 flex-1 basis-64 space-y-2 text-sm poppins-medium text-[#344256]">
          รายการ
          <select
            value={kind}
            disabled={busy}
            className={inputClass}
            onChange={(e) => {
              setKind(e.target.value as ProductOptionKind);
              setOffset(0);
              setSearch('');
              setResult(null);
              resetForm();
            }}
          >
            {Object.entries(PRODUCT_OPTION_KINDS).map(([value, config]) => (
              <option key={value} value={value}>
                {config.group} — {config.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 flex-1 basis-64 space-y-2 text-sm poppins-medium text-[#344256]">
          ค้นหา
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            placeholder="ค้นหาชื่อหรือรหัส"
            className={inputClass}
          />
        </label>
      </div>
      <form
        noValidate
        onSubmit={submit}
        className="space-y-4 rounded-lg border border-[#d9e3ee] p-4"
      >
        <h3 className="text-base poppins-semibold text-[#344256]">
          {editing ? 'แก้ชื่อ' : 'เพิ่ม'}
          {definition.label}
        </h3>
        <div className="flex flex-wrap gap-4">
          {definition.codeRequired && (
            <label className="min-w-0 basis-full space-y-2 text-sm poppins-medium text-[#344256] sm:basis-36">
              รหัส <span className="text-red-600">*</span>
              <input
                value={code}
                disabled={busy || Boolean(editing)}
                maxLength={3}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={inputClass}
                aria-required="true"
              />
            </label>
          )}
          <label className="min-w-0 flex-1 basis-64 space-y-2 text-sm poppins-medium text-[#344256]">
            ชื่อ <span className="text-red-600">*</span>
            <input
              value={name}
              disabled={busy}
              maxLength={160}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              aria-required="true"
              aria-invalid={Boolean(formError)}
              aria-describedby={formError ? 'option-form-error' : undefined}
            />
          </label>
        </div>
        {formError && (
          <p id="option-form-error" role="alert" className="text-sm poppins-regular text-red-600">
            {formError}
          </p>
        )}
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
          {editing && (
            <button
              type="button"
              disabled={busy}
              onClick={resetForm}
              className="px-4 py-2 text-sm poppins-medium text-[#65758b]"
            >
              ยกเลิก
            </button>
          )}
        </div>
      </form>
      {error && (
        <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
          {error}
          <button type="button" onClick={() => setRefresh((v) => v + 1)} className="text-[#1a58a7]">
            ลองใหม่
          </button>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-[#d9e3ee]" aria-busy={loading}>
        <table className="w-full min-w-[580px] text-left text-sm poppins-regular text-[#344256]">
          <thead className="bg-[#f8f9fb] text-[#65758b]">
            <tr>
              {['รหัส', 'ชื่อ', 'สถานะ', 'จัดการ'].map((label) => (
                <th scope="col" key={label} className="px-4 py-3 poppins-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              !error &&
              result?.data.map((item) => (
                <tr key={item.id} className="border-t border-[#d9e3ee]">
                  <td className="px-4 py-3">{item.code ?? '—'}</td>
                  <td className="break-words px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={item.active ? 'ใช้งาน' : 'ไม่ใช้งาน'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setEditing(item);
                          setName(item.name);
                          setCode(item.code ?? '');
                          setFormError('');
                        }}
                        className="text-[#1a58a7] disabled:opacity-50"
                      >
                        แก้ชื่อ
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => toggle(item)}
                        className="text-[#65758b] disabled:opacity-50"
                      >
                        {item.active ? 'ปิดรายการ' : 'เปิดรายการ'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && (
          <p role="status" className="p-4 text-sm poppins-regular text-[#65758b]">
            กำลังโหลด...
          </p>
        )}
        {!loading && !error && !result?.data.length && (
          <p className="p-4 text-sm poppins-regular text-[#65758b]">ไม่พบรายการ</p>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-[#d9e3ee] p-3 text-sm poppins-regular text-[#65758b]">
          <span>ทั้งหมด {result?.pagination.total ?? 0} รายการ</span>
          <div className="flex gap-3">
            <button
              disabled={offset === 0 || loading || busy}
              onClick={() => setOffset((v) => Math.max(0, v - 10))}
              className="disabled:opacity-30"
            >
              ก่อนหน้า
            </button>
            <span>หน้า {offset / 10 + 1}</span>
            <button
              disabled={loading || busy || offset + 10 >= (result?.pagination.total ?? 0)}
              onClick={() => setOffset((v) => v + 10)}
              className="disabled:opacity-30"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
      <SuccessAlertComponent
        isOpen={Boolean(success)}
        title={success}
        onClose={() => setSuccess('')}
      />
    </section>
  );
}
