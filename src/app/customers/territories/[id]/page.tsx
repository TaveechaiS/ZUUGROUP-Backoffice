'use client';
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Delete, Get, HttpError, Update } from '@/service/http';
import type {
  RecordConfigResponse,
  RecordDetailResponse,
  RecordOptionsResponse,
  RecordRow,
} from '@/types/api/records';
import type { CustomerListResponse } from '@/types/api/customers';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import StatusBadge from '@/components/ui/status-badge';
import SearchCombobox from '@/components/ui/search-combobox';
import PaginationControls from '@/components/ui/pagination-controls';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import { inputClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/form-classes';

type Person = { id: string; name: string };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleted?: string | string[] }>;
}) {
  const { id } = use(params);
  const deletedView = use(searchParams).deleted === 'true';
  return <TerritoryDetail key={id + deletedView} id={id} deletedView={deletedView} />;
}

function TerritoryDetail({ id, deletedView }: { id: string; deletedView: boolean }) {
  const router = useRouter();
  const lock = useRef(false);
  const [item, setItem] = useState<RecordRow | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [missing, setMissing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');
  const [after, setAfter] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      Get<RecordDetailResponse>(
        '/api/sales-territories/' + encodeURIComponent(id) + (deletedView ? '?deleted=true' : ''),
        controller.signal,
      ),
      Get<RecordConfigResponse>('/api/sales-territories?view=config', controller.signal),
    ])
      .then(([result, config]) => {
        if (controller.signal.aborted) return;
        setItem(result.data);
        setCanWrite(config.data.canWrite);
        setMissing(false);
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setMissing(caught instanceof HttpError && caught.status === 404);
        setError(caught instanceof Error ? caught.message : 'โหลดเขตขายไม่สำเร็จ');
      });
    return () => controller.abort();
  }, [id, retry, deletedView]);

  function reload() {
    setItem(null);
    setError('');
    setMissing(false);
    setRetry((value) => value + 1);
  }

  async function run(action: () => Promise<unknown>, done: string, next = '') {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setActionError('');
    try {
      await action();
      setConfirming(false);
      setEditing(false);
      setAfter(next);
      setMessage(done);
    } catch (caught) {
      setConfirming(false);
      setActionError(caught instanceof Error ? caught.message : 'ดำเนินการไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  const deleted = Boolean(item?.deletedAt);
  const members = ((item?.salesMembers ?? []) as Person[]).map((person) => person.name);

  return (
    <section className="min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8">
      <Link
        href={deletedView ? '/customers/territories?tab=deleted' : '/customers/territories'}
        className="text-sm text-[#1a58a7] hover:underline"
      >
        ← กลับเขตขาย
      </Link>
      {missing ? (
        <NotFoundComponent title="ไม่พบเขตขาย" onRefresh={reload} />
      ) : error ? (
        <div role="alert" className="flex gap-3 text-sm text-red-600">
          {error}
          <button type="button" className="text-[#1a58a7]" onClick={reload}>
            ลองใหม่
          </button>
        </div>
      ) : !item ? (
        <LoadingComponent isVisible label="กำลังโหลดเขตขาย..." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg poppins-semibold text-[#344256]">{item.name}</h2>
            {deleted && <StatusBadge value="ลบแล้ว" />}
          </div>
          {editing ? (
            <TerritoryForm
              item={item}
              busy={busy}
              onCancel={() => {
                setEditing(false);
                setActionError('');
              }}
              onSave={(body) =>
                void run(
                  () => Update('/api/sales-territories/' + item.id, body),
                  'บันทึกเขตขายแล้ว',
                )
              }
            />
          ) : (
            <>
              <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
                <h3 className="text-base poppins-semibold text-[#1a58a7]">ข้อมูลเขตขาย</h3>
                <dl className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[#65758b]">ชื่อเขต</dt>
                    <dd className="mt-2 poppins-medium text-[#344256]">{item.name}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[#65758b]">หมายเหตุ</dt>
                    <dd className="mt-2 whitespace-pre-wrap break-words text-[#344256]">
                      {String(item.notes || '—')}
                    </dd>
                  </div>
                  {deleted && (
                    <div className="sm:col-span-2">
                      <dt className="text-[#65758b]">เหตุผลการลบ</dt>
                      <dd className="mt-2 whitespace-pre-wrap text-[#344256]">
                        {String(item.deleteReason || '—')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
                <h3 className="text-base poppins-semibold text-[#1a58a7]">ผู้รับผิดชอบ</h3>
                <div className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-[#65758b]">ผู้จัดการ (Manager)</p>
                    <p className="mt-2 text-[#344256]">{String(item.managerName || '—')}</p>
                  </div>
                  <div>
                    <p className="text-[#65758b]">ฝ่ายขาย (Sales) · {members.length} คน</p>
                    <ul className="mt-2 space-y-2 text-[#344256]">
                      {members.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                    {!members.length && <p className="mt-2 text-[#344256]">—</p>}
                  </div>
                </div>
              </div>
            </>
          )}
          {!deleted && <TerritoryCustomers territoryId={item.id} />}
          {actionError && (
            <p role="alert" className="text-sm poppins-regular text-red-600">
              {actionError}
            </p>
          )}
          {canWrite && !deleted && !editing && (
            <div className="rounded-lg border border-red-100 p-4 md:p-6">
              <h3 className="text-base poppins-semibold text-red-600">ลบเขตขาย</h3>
              <p className="mt-2 text-sm poppins-regular text-[#65758b]">
                ลบได้เมื่อเขตไม่มีลูกค้า ผู้จัดการ และฝ่ายขายแล้ว กู้คืนได้ในแท็บ ลบแล้ว
              </p>
              <label className="mt-4 block text-sm poppins-medium text-[#344256]">
                เหตุผลการลบ
                <span aria-hidden="true" className="ml-1 text-red-600">
                  *
                </span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={1000}
                  rows={2}
                  className={`${inputClass} mt-2`}
                />
              </label>
              <button
                type="button"
                disabled={busy || !reason.trim()}
                onClick={() => setConfirming(true)}
                className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm poppins-medium text-white disabled:opacity-50"
              >
                ลบเขตขาย
              </button>
            </div>
          )}
          <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
            {canWrite && deleted && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(
                    () => Update('/api/sales-territories/' + item.id, { action: 'restore' }),
                    'กู้คืนเขตขายแล้ว',
                    '/customers/territories/' + item.id,
                  )
                }
                className={`${primaryButtonClass} min-w-36`}
              >
                กู้คืน
              </button>
            )}
            {canWrite && !deleted && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={`${primaryButtonClass} min-w-36`}
              >
                แก้ไข
              </button>
            )}
          </div>
          <ConfirmationDialog
            isOpen={confirming}
            title={`ลบเขตขาย ${item.name}?`}
            description={`เหตุผล: ${reason.trim()} — กู้คืนได้ภายหลัง`}
            busy={busy}
            onCancel={() => setConfirming(false)}
            onConfirm={() =>
              void run(
                () => Delete('/api/sales-territories/' + item.id, { reason: reason.trim() }),
                'ลบเขตขายแล้ว',
                '/customers/territories',
              )
            }
          />
        </>
      )}
      <SuccessAlertComponent
        isOpen={Boolean(message)}
        title={message}
        onClose={() => {
          setMessage('');
          if (after) router.push(after);
          else reload();
        }}
      />
    </section>
  );
}

function TerritoryForm({
  item,
  busy,
  onCancel,
  onSave,
}: {
  item: RecordRow;
  busy: boolean;
  onCancel: () => void;
  onSave: (body: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(item.name);
  const [notes, setNotes] = useState(String(item.notes ?? ''));
  const [manager, setManager] = useState<Person | null>(
    item.managerId ? { id: String(item.managerId), name: String(item.managerName ?? '') } : null,
  );
  const [sales, setSales] = useState<Person[]>((item.salesMembers ?? []) as Person[]);
  const [error, setError] = useState('');
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) {
          setError('กรุณากรอกชื่อเขต');
          return;
        }
        onSave({
          name: name.trim(),
          notes,
          managerId: manager?.id ?? null,
          salesIds: sales.map((person) => person.id),
          expectedUpdatedAt: item.updatedAt,
        });
      }}
      className="space-y-6 rounded-lg border border-[#d9e3ee] p-4 md:p-6"
    >
      <h3 className="text-base poppins-semibold text-[#1a58a7]">แก้ไขเขตขาย</h3>
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm poppins-medium text-[#344256]">
          ชื่อเขต
          <span aria-hidden="true" className="ml-1 text-red-600">
            *
          </span>
          <input
            value={name}
            maxLength={500}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(error)}
            className={`${inputClass} mt-2 h-11`}
          />
        </label>
        <div className="text-sm poppins-medium text-[#344256]">
          ผู้จัดการ (Manager)
          <div className="mt-2 poppins-regular">
            <RoleUserPicker
              role="MANAGER"
              label="ผู้จัดการ"
              value={manager}
              onChange={setManager}
            />
          </div>
        </div>
        <label className="text-sm poppins-medium text-[#344256] sm:col-span-2">
          หมายเหตุ
          <textarea
            value={notes}
            maxLength={4000}
            rows={3}
            onChange={(event) => setNotes(event.target.value)}
            className={`${inputClass} mt-2 min-h-24 resize-y`}
          />
        </label>
        <div className="text-sm poppins-medium text-[#344256] sm:col-span-2">
          ฝ่ายขาย (Sales) · {sales.length} คน
          <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
            {sales.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm poppins-regular text-[#1a58a7]"
              >
                {person.name}
                <button
                  type="button"
                  aria-label={`นำ ${person.name} ออก`}
                  onClick={() => setSales(sales.filter((entry) => entry.id !== person.id))}
                  className="text-[#65758b] hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 max-w-md poppins-regular">
            <RoleUserPicker
              key={sales.length}
              role="SALES"
              label="เพิ่มฝ่ายขาย"
              value={null}
              onChange={(person) => {
                if (person && !sales.some((entry) => entry.id === person.id))
                  setSales([...sales, person]);
              }}
            />
          </div>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm poppins-regular text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={`${secondaryButtonClass} min-w-36`}
        >
          ยกเลิก
        </button>
        <button type="submit" disabled={busy} className={`${primaryButtonClass} min-w-36`}>
          {busy ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </form>
  );
}

// Active users of one role from /api/users?view=options (Admin only), searched 10 at a time.
function RoleUserPicker({
  role,
  label,
  value,
  onChange,
}: {
  role: 'MANAGER' | 'SALES';
  label: string;
  value: Person | null;
  onChange: (person: Person | null) => void;
}) {
  const [options, setOptions] = useState<{ id: string; code: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [more, setMore] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({
        view: 'options',
        roleId: role,
        search,
        offset: String(offset),
        limit: '10',
      });
      Get<RecordOptionsResponse>('/api/users?' + params, controller.signal)
        .then((result) => {
          if (controller.signal.aborted) return;
          setOptions(result.data);
          setMore(result.pagination.hasMore);
          setError('');
          setLoading(false);
        })
        .catch((caught) => {
          if (controller.signal.aborted) return;
          setError(caught instanceof Error ? caught.message : 'โหลดผู้ใช้งานไม่สำเร็จ');
          setLoading(false);
        });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [role, search, offset]);
  const shown =
    value && !options.some((option) => option.id === value.id)
      ? [{ id: value.id, code: value.name, name: '' }, ...options]
      : options;
  return (
    <SearchCombobox
      field={{ key: `territory-${role.toLowerCase()}`, label, required: false }}
      value={value?.id ?? ''}
      onChange={(id) => {
        const option = shown.find((entry) => entry.id === id);
        onChange(option ? { id: option.id, name: option.name || option.code } : null);
      }}
      invalid={false}
      options={shown}
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

function TerritoryCustomers({ territoryId }: { territoryId: string }) {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [result, setResult] = useState<CustomerListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const sort = useTableSort(() => setOffset(0));
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      territoryId,
      limit: String(pageSize),
      offset: String(offset),
    });
    Get<CustomerListResponse>(
      withTableSort('/api/customers?' + params, { key: sort.key, direction: sort.direction }),
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return;
        setResult(data);
        setError('');
        setLoading(false);
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setError(caught instanceof Error ? caught.message : 'โหลดลูกค้าไม่สำเร็จ');
        setLoading(false);
      });
    return () => controller.abort();
  }, [territoryId, offset, pageSize, retry, sort.key, sort.direction]);
  const rows = result?.data ?? [];
  return (
    <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
      <h3 className="text-base poppins-semibold text-[#1a58a7]">
        ลูกค้า · {result?.pagination.total ?? 0} ราย
      </h3>
      {error && (
        <div role="alert" className="mt-4 flex gap-3 text-sm text-red-600">
          {error}
          <button
            type="button"
            className="text-[#1a58a7]"
            onClick={() => {
              setLoading(true);
              setRetry((value) => value + 1);
            }}
          >
            ลองใหม่
          </button>
        </div>
      )}
      <div
        className="relative mt-4 min-h-40 overflow-hidden rounded-lg border border-[#e3e9f0]"
        aria-busy={loading}
      >
        <div className="overflow-x-auto">
          <SortableTable
            sort={sort}
            columns={['code', 'name', 'province', 'status']}
            className="w-full min-w-[640px] text-left text-sm poppins-regular text-[#344256]"
          >
            <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
              <tr>
                {['รหัสลูกค้า', 'ชื่อสถานประกอบการ / บริษัท', 'จังหวัด', 'สถานะ'].map((label) => (
                  <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading &&
                !error &&
                rows.map((customer) => (
                  <tr
                    key={customer.id}
                    role="link"
                    tabIndex={0}
                    aria-label={`เปิดลูกค้า ${customer.code} ${customer.name}`}
                    onClick={() => router.push('/customers/' + customer.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') router.push('/customers/' + customer.id);
                    }}
                    className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc]"
                  >
                    <td className="whitespace-nowrap px-4 py-3 poppins-medium text-[#1a58a7]">
                      {customer.code}
                    </td>
                    <td className="px-4 py-3">{customer.name}</td>
                    <td className="whitespace-nowrap px-4 py-3">{customer.province || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={customer.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </SortableTable>
        </div>
        <LoadingComponent
          isVisible={loading && !error}
          variant="content"
          label="กำลังโหลดลูกค้า..."
        />
        {!loading && !error && !rows.length && <NotFoundComponent title="ยังไม่มีลูกค้าในเขตนี้" />}
        <div className="border-t border-[#edf0f4] p-3">
          <PaginationControls
            page={Math.floor(offset / pageSize) + 1}
            pages={Math.max(1, Math.ceil((result?.pagination.total ?? 0) / pageSize))}
            total={result?.pagination.total ?? 0}
            count={rows.length}
            pageSize={pageSize}
            onChange={(page) => {
              setLoading(true);
              setOffset((page - 1) * pageSize);
            }}
            onPageSizeChange={(size) => {
              setLoading(true);
              setPageSize(size);
              setOffset(0);
            }}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
