'use client';
import PaginationControls from '@/components/ui/pagination-controls';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import { use, useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';
import { Get, Post, Update } from '@/service/http';
import {
  CUSTOMER_OPTION_KINDS,
  isCustomerOptionKind,
  type CustomerOptionKind,
} from '@/config/customer-options';
import type { CustomerOption, CustomerOptionsResponse } from '@/types/api/customer-options';
import StatusBadge from '@/components/ui/status-badge';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import SearchCombobox from '@/components/ui/search-combobox';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import { filterClass, inputClass, primaryButtonClass } from '@/components/ui/form-classes';
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string | string[] }>;
}) {
  const { kind: requestedKind } = use(searchParams);
  const initialKind = isCustomerOptionKind(requestedKind) ? requestedKind : 'codeGroup';
  const [kind, setKind] = useState<CustomerOptionKind | ''>(initialKind);
  const [kindSearch, setKindSearch] = useState('');
  const options = Object.entries(CUSTOMER_OPTION_KINDS)
    .filter(([, config]) => `${config.group} ${config.label}`.includes(kindSearch.trim()))
    .map(([id, config]) => ({ id, code: config.group, name: config.label }));
  const selector = (
    <div className="flex min-w-0 flex-col gap-2 lg:pb-[60px]">
      <p className="text-sm poppins-medium text-[#344256]">รายการ</p>
      <div className="min-w-0 flex-1 [&_input]:h-11">
        <SearchCombobox
          field={{ key: 'customer-option-kind', label: 'รายการ', required: true }}
          value={kind}
          onChange={(value) => setKind(isCustomerOptionKind(value) ? value : '')}
          invalid={false}
          statusModule="รายการ"
          options={options}
          search={kindSearch}
          offset={0}
          loading={false}
          error=""
          more={false}
          setSearch={setKindSearch}
          setOffset={() => {}}
          setLoading={() => {}}
          setError={() => {}}
        />
      </div>
    </div>
  );
  return (
    <section
      aria-label="ข้อมูลพื้นฐานลูกค้า"
      className="flex min-w-0 flex-1 flex-col gap-5 p-4 pb-10 text-[#26364b] md:p-6"
    >
      {kind ? (
        <CustomerOptionPanel key={kind} kind={kind} selector={selector} />
      ) : (
        <div className="min-w-0 rounded-lg border border-[#d9e3ee] p-4 md:p-6">{selector}</div>
      )}
    </section>
  );
}

function CustomerOptionPanel({
  kind,
  selector,
}: {
  kind: CustomerOptionKind;
  selector: ReactNode;
}) {
  const formErrorId = useId();
  const [search, setSearch] = useState('');
  const [activeOnly, setActiveOnly] = useState('');
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const sort = useTableSort(() => setOffset(0));
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState<CustomerOptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState<CustomerOption | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [days, setDays] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const definition = CUSTOMER_OPTION_KINDS[kind];
  const columns = [
    ...(definition.codeRequired ? ['code'] : []),
    'name',
    ...(definition.daysRequired ? ['days'] : []),
    'active',
    null,
  ];
  const headers = [
    ...(definition.codeRequired ? ['รหัส'] : []),
    'ชื่อ',
    ...(definition.daysRequired ? ['จำนวนวัน'] : []),
    'สถานะ',
    'จัดการ',
  ];
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        kind,
        search,
        includeInactive: activeOnly ? 'false' : 'true',
        limit: String(pageSize),
        offset: String(offset),
      });
      Get<CustomerOptionsResponse>(
        withTableSort('/api/customer-options?' + params, {
          key: sort.key,
          direction: sort.direction,
        }),
        controller.signal,
      )
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
  }, [kind, search, activeOnly, offset, pageSize, refresh, sort.key, sort.direction]);
  function resetForm() {
    setEditing(null);
    setName('');
    setCode('');
    setDays('');
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
    if (definition.daysRequired && (!/^\d{1,3}$/.test(days) || Number(days) > 365)) {
      setFormError('กรุณากรอกจำนวนวัน 0–365');
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const dayValue = definition.daysRequired ? { days: Number(days) } : {};
      if (editing)
        await Update('/api/customer-options', {
          id: editing.id,
          version: editing.version,
          name,
          ...dayValue,
        });
      else
        await Post('/api/customer-options', {
          kind,
          name,
          ...(definition.codeRequired ? { code: code.trim() } : {}),
          ...dayValue,
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
  async function toggle(item: CustomerOption) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await Update('/api/customer-options', {
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
    <div className="flex min-w-0 flex-col gap-5">
      <div className="grid min-w-0 gap-6 rounded-lg border border-[#d9e3ee] p-4 md:p-6 lg:grid-cols-2 lg:items-stretch">
        {selector}
        <div className="flex min-w-0 flex-col gap-2">
          <h3 className="text-sm poppins-medium text-[#344256]">
            {editing ? 'แก้ไข' : 'เพิ่ม'}
            {definition.label}
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
          </h3>
          <form noValidate onSubmit={submit} className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap gap-4">
                {definition.codeRequired && (
                  <div className="relative min-w-0 basis-full text-sm poppins-medium text-[#344256] sm:basis-36">
                    <input
                      aria-label="รหัส"
                      placeholder="รหัส"
                      value={code}
                      disabled={busy || Boolean(editing)}
                      maxLength={3}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className={inputClass}
                      aria-required="true"
                    />
                  </div>
                )}
                <div className="relative min-w-0 flex-1 basis-64 text-sm poppins-medium text-[#344256]">
                  <input
                    aria-label="ชื่อ"
                    placeholder="ชื่อ"
                    value={name}
                    disabled={busy}
                    maxLength={160}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    aria-required="true"
                    aria-invalid={Boolean(formError)}
                    aria-describedby={formError ? formErrorId : undefined}
                  />
                </div>
                {definition.daysRequired && (
                  <div className="relative min-w-0 basis-full text-sm poppins-medium text-[#344256] sm:basis-36">
                    <input
                      aria-label="จำนวนวัน"
                      placeholder="จำนวนวัน (0 = เงินสด)"
                      inputMode="numeric"
                      value={days}
                      disabled={busy}
                      maxLength={3}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) setDays(e.target.value);
                      }}
                      className={inputClass}
                      aria-required="true"
                    />
                  </div>
                )}
              </div>
              {formError && (
                <p id={formErrorId} role="alert" className="text-sm poppins-regular text-red-600">
                  {formError}
                </p>
              )}
            </div>
            <div className="flex min-h-11 justify-end gap-3">
              <button type="submit" disabled={busy} className={`${primaryButtonClass} order-last`}>
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
        </div>
      </div>
      <div className="grid gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3 md:grid-cols-2">
        <label className="text-xs text-[#53647c]">
          ค้นหา
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOffset(0);
            }}
            placeholder={definition.codeRequired ? 'ค้นหาชื่อหรือรหัส' : 'ค้นหาชื่อ'}
            className={`mt-1.5 ${filterClass}`}
          />
        </label>
        <label className="text-xs text-[#53647c]">
          สถานะ
          <select
            value={activeOnly}
            onChange={(event) => {
              setActiveOnly(event.target.value);
              setOffset(0);
            }}
            className={`mt-1.5 ${filterClass}`}
          >
            <option value="">ทั้งหมด</option>
            <option value="active">ใช้งานเท่านั้น</option>
          </select>
        </label>
      </div>
      {error && (
        <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
          {error}
          <button type="button" onClick={() => setRefresh((v) => v + 1)} className="text-[#1a58a7]">
            ลองใหม่
          </button>
        </div>
      )}
      <div
        className="relative min-h-52 min-w-0 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <SortableTable
          sort={sort}
          columns={columns}
          className="w-full min-w-[580px] border-collapse text-left text-sm"
        >
          <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
            <tr>
              {headers.map((label) => (
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
                <tr key={item.id} className="border-t border-[#edf0f4] hover:bg-[#fafbfc]">
                  {definition.codeRequired && <td className="px-4 py-3">{item.code ?? '—'}</td>}
                  <td className="break-words px-4 py-3">{item.name}</td>
                  {definition.daysRequired && (
                    <td className="px-4 py-3">{item.days === 0 ? 'เงินสด' : `${item.days} วัน`}</td>
                  )}
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
                          setDays(item.days === null ? '' : String(item.days));
                          setFormError('');
                        }}
                        className="text-[#1a58a7] disabled:opacity-50"
                      >
                        แก้ไข
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
        </SortableTable>
        <LoadingComponent
          isVisible={loading && !error}
          variant="content"
          label="กำลังโหลดข้อมูลพื้นฐานลูกค้า..."
        />
        {!loading && !error && !result?.data.length && (
          <NotFoundComponent
            title="ไม่พบรายการ"
            onRefresh={() => setRefresh((value) => value + 1)}
          />
        )}
        <div className="border-t border-[#edf0f4] p-3">
          <PaginationControls
            page={Math.floor(offset / pageSize) + 1}
            pages={Math.max(1, Math.ceil((result?.pagination.total ?? 0) / pageSize))}
            total={result?.pagination.total ?? 0}
            count={result?.data.length ?? 0}
            onChange={(page) => setOffset((page - 1) * pageSize)}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setOffset(0);
            }}
            disabled={loading || busy}
          />
        </div>
      </div>
      <SuccessAlertComponent
        isOpen={Boolean(success)}
        title={success}
        onClose={() => setSuccess('')}
      />
    </div>
  );
}
