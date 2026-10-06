'use client';
import PaginationControls from '@/components/ui/pagination-controls';
import SortableTable, { useTableSort, withTableSort } from '@/components/ui/sortable-table';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Get, Post, Update } from '@/service/http';
import type { OperationOptions, OrderRow, PageData } from '@/types/api/operations';
import StatusBadge from '@/components/ui/status-badge';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-2 text-sm poppins-medium text-[#26364b]">
      {label}
      {children}
      {hint && <span className="text-xs poppins-regular text-gray-500">{hint}</span>}
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
      {message}
    </p>
  ) : null;
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#26364b] outline-none focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50';

const buttonClass =
  'rounded-lg bg-[#1a58a7] px-4 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] disabled:cursor-not-allowed disabled:opacity-50';

const secondaryClass =
  'rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm poppins-medium text-[#26364b] hover:bg-blue-50 disabled:opacity-50';

const money = (value: unknown) =>
  Number(value ?? 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const dateTime = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
type LineInput = { productId: string; quantity: string };
export default function Page() {
  const mode = 'list' as 'list' | 'create' | 'detail';
  const params = useParams<{ id: string }>(),
    router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const [options, setOptions] = useState<OperationOptions | null>(null),
    [rows, setRows] = useState<OrderRow[]>([]),
    [row, setRow] = useState<OrderRow | null>(null),
    [search, setSearch] = useState(''),
    [status, setStatus] = useState(''),
    [offset, setOffset] = useState(0),
    [total, setTotal] = useState(0),
    [version, setVersion] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [after, setAfter] = useState(''),
    [edit, setEdit] = useState(false),
    [code, setCode] = useState(''),
    [customerId, setCustomer] = useState(''),
    [notes, setNotes] = useState(''),
    [reason, setReason] = useState(''),
    [lines, setLines] = useState<LineInput[]>([{ productId: '', quantity: '1' }]),
    [pending, setPending] = useState<Record<string, unknown> | null>(null);
  const sort = useTableSort(() => setOffset(0));
  const lock = useRef(false),
    commandKey = useRef(crypto.randomUUID());
  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: OperationOptions }>('/api/inventory?view=options', controller.signal)
      .then((r) => setOptions(r.data))
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [version]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        setLoading(true);
        setError('');
        const url =
          mode === 'detail'
            ? '/api/orders/' + encodeURIComponent(params.id)
            : '/api/orders?' +
              new URLSearchParams({
                search,
                status,
                offset: String(offset),
                limit: String(pageSize),
              });
        if (mode === 'create') {
          setLoading(false);
          return;
        }
        Get<PageData<OrderRow> | { data: OrderRow }>(
          mode === 'list' ? withTableSort(url, { key: sort.key, direction: sort.direction }) : url,
          controller.signal,
        )
          .then((r) => {
            if (controller.signal.aborted) return;
            if ('pagination' in r) {
              setRows(r.data);
              setTotal(r.pagination.total);
              if (offset >= r.pagination.total && offset)
                setOffset(Math.max(0, Math.ceil(r.pagination.total / pageSize) - 1) * pageSize);
            } else {
              setRow(r.data);
              setNotes(r.data.notes);
              setCustomer(r.data.customerId ?? '');
              setCode(r.data.code);
              setLines(
                (r.data.lines ?? []).map((l) => ({
                  productId: l.productId,
                  quantity: String(l.quantity),
                })),
              );
            }
            setLoading(false);
          })
          .catch((e) => {
            if (!controller.signal.aborted) {
              setError(e.message);
              setLoading(false);
            }
          });
      },
      mode === 'list' ? 200 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [mode, params.id, search, status, offset, pageSize, version, sort.key, sort.direction]);
  const role = options?.actor.roleId ?? '',
    canCreate = ['SALES', 'ADMIN'].includes(role),
    canEdit =
      !!row?.workflowManaged &&
      !['เสร็จสิ้น', 'ยกเลิก'].includes(row.status) &&
      ((role === 'SALES' &&
        row.createdById === options?.actor.id &&
        ['รอตรวจ', 'ส่งกลับแก้ไข'].includes(row.status)) ||
        role === 'MANAGER' ||
        role === 'ADMIN');
  function ask(action: string) {
    setPending({
      action,
      reason,
      expectedUpdatedAt: row?.updatedAt,
      idempotencyKey: crypto.randomUUID(),
    });
  }
  async function execute(body: Record<string, unknown>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const r =
        mode === 'create'
          ? await Post<{ data: { id: string } }>('/api/orders', body)
          : await Update<{ data: { id: string } }>('/api/orders/' + row!.id, body);
      commandKey.current = crypto.randomUUID();
      setNotice(mode === 'create' ? 'สร้าง Order และจองสินค้าแล้ว' : 'บันทึกคำสั่งแล้ว');
      setPending(null);
      setEdit(false);
      setReason('');
      if (mode === 'create') setAfter('/orders/' + r.data.id);
      else setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function save() {
    const body = {
      code,
      customerId,
      notes,
      lines: lines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
      idempotencyKey: commandKey.current,
      ...(mode === 'detail' ? { action: 'edit', expectedUpdatedAt: row?.updatedAt } : {}),
    };
    setPending(body);
  }
  const sum = lines.reduce(
    (n, l) =>
      n +
      Number(options?.products.find((p) => p.id === l.productId)?.salePrice ?? 0) *
        Number(l.quantity || 0),
    0,
  );
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 text-[#26364b] md:p-6">
      <SuccessAlertComponent
        isOpen={!!notice}
        title={notice}
        onClose={() => {
          setNotice('');
          if (after) {
            router.push(after);
            setAfter('');
          }
        }}
      />
      <ConfirmationDialog
        isOpen={!!pending}
        title={pending?.action === 'complete' ? 'ยืนยันจัดของและตัดคลัง?' : 'ยืนยันบันทึกเอกสาร?'}
        description={
          error ||
          (pending?.action === 'complete'
            ? 'เอกสารจะเป็นเสร็จสิ้นและตัดสินค้าตามล็อตที่จองไว้'
            : 'ระบบจะบันทึกประวัติและปรับจำนวนจองตามคำสั่งนี้')
        }
        variant="primary"
        confirmLabel="ยืนยัน"
        busyLabel="กำลังบันทึก..."
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) void execute(pending);
        }}
      />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl poppins-semibold">
          {mode === 'create' ? 'สร้างคำสั่งซื้อ' : 'คำสั่งซื้อและจัดส่ง'}
        </h1>
        {mode === 'list' ? (
          canCreate && (
            <Link href="/orders/create" className={buttonClass}>
              สร้างคำสั่งซื้อ
            </Link>
          )
        ) : (
          <Link href="/orders" className={secondaryClass}>
            กลับรายการ
          </Link>
        )}
      </header>
      <ErrorMessage message={error} />
      {mode === 'list' && (
        <>
          <div className="flex flex-wrap gap-3">
            <input
              className={inputClass + ' max-w-sm'}
              placeholder="ค้นหาเลขที่หรือลูกค้า"
              aria-label="ค้นหาคำสั่งซื้อ"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOffset(0);
              }}
            />
            <select
              className={inputClass + ' max-w-52'}
              aria-label="สถานะ"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setOffset(0);
              }}
            >
              <option value="">ทุกสถานะ</option>
              {['รอตรวจ', 'อนุมัติ', 'ส่งกลับแก้ไข', 'เสร็จสิ้น', 'ยกเลิก'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="relative min-h-48 overflow-x-auto rounded-xl border border-gray-100 bg-white">
            <LoadingComponent isVisible={loading} variant="content" />
            <SortableTable
              sort={sort}
              columns={['code', 'territoryName', 'createdAt', 'amount', 'status']}
              className="w-full min-w-[750px] text-left text-sm"
            >
              <thead className="bg-blue-50">
                <tr>
                  {['เลขที่ / ลูกค้า', 'เขต / ผู้สร้าง', 'วันที่', 'ยอดขาย', 'สถานะ'].map((t) => (
                    <th key={t} scope="col" className="p-4 poppins-medium">
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    tabIndex={0}
                    key={r.id}
                    onClick={() => router.push('/orders/' + r.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push('/orders/' + r.id);
                      }
                    }}
                    className="cursor-pointer border-t border-gray-100 hover:bg-blue-50/50"
                  >
                    <td className="p-4">
                      <span className="poppins-medium">{r.code}</span>
                      <small className="block text-gray-500">{r.customerName}</small>
                    </td>
                    <td className="p-4">
                      {r.territoryName}
                      <small className="block text-gray-500">{r.createdByName}</small>
                    </td>
                    <td className="p-4">{dateTime(r.createdAt)}</td>
                    <td className="p-4">{money(r.amount)}</td>
                    <td className="p-4">
                      <StatusBadge value={r.status} />
                      {!r.workflowManaged && (
                        <small className="block pt-1 text-gray-500">เอกสารเดิม</small>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && !rows.length && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500">
                      ไม่พบคำสั่งซื้อ
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableTable>
          </div>
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
            disabled={loading}
          />
        </>
      )}
      {mode !== 'list' && (
        <div className="relative min-h-48">
          <LoadingComponent isVisible={loading || !options} variant="content" />
          {mode === 'create' || edit ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              className="flex max-w-5xl flex-col gap-5 rounded-xl border border-gray-100 bg-white p-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="เลขที่คำสั่งซื้อ">
                  <input
                    required
                    className={inputClass}
                    value={code}
                    disabled={mode === 'detail'}
                    onChange={(e) => {
                      setCode(e.target.value);
                      commandKey.current = crypto.randomUUID();
                    }}
                  />
                </Field>
                <Field label="ลูกค้า">
                  <select
                    required
                    disabled={mode === 'detail'}
                    className={inputClass}
                    value={customerId}
                    onChange={(e) => {
                      setCustomer(e.target.value);
                      commandKey.current = crypto.randomUUID();
                    }}
                  >
                    <option value="">เลือกลูกค้า</option>
                    {options?.customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} · {c.territoryName || 'ยังไม่กำหนดเขต'}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <h2 className="poppins-medium">รายการสินค้า</h2>
              <p className="text-xs text-gray-500">
                เลือกสินค้าและจำนวน ระบบจองล็อตที่หมดอายุก่อนให้อัตโนมัติ
                โดยใช้เฉพาะล็อตที่ผ่านเกณฑ์ขาย
              </p>
              {lines.map((l, index) => {
                const product = options?.products.find((p) => p.id === l.productId);
                return (
                  <div
                    className="grid items-end gap-3 rounded-lg border border-gray-100 p-3 sm:grid-cols-[1fr_120px_120px_auto]"
                    key={index}
                  >
                    <Field label={`สินค้า ${index + 1}`}>
                      <select
                        required
                        className={inputClass}
                        value={l.productId}
                        onChange={(e) => {
                          setLines((v) =>
                            v.map((r, i) =>
                              i === index ? { ...r, productId: e.target.value } : r,
                            ),
                          );
                          commandKey.current = crypto.randomUUID();
                        }}
                      >
                        <option value="">เลือกสินค้า</option>
                        {options?.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · พร้อมขาย {p.available} {p.unit}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="จำนวน">
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        className={inputClass}
                        value={l.quantity}
                        onChange={(e) => {
                          setLines((v) =>
                            v.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r)),
                          );
                          commandKey.current = crypto.randomUUID();
                        }}
                      />
                    </Field>
                    <div className="py-3 text-sm">
                      {money(Number(product?.salePrice ?? 0) * Number(l.quantity))} บาท
                    </div>
                    <button
                      type="button"
                      disabled={lines.length === 1}
                      className={secondaryClass}
                      onClick={() => {
                        setLines((v) => v.filter((_, i) => i !== index));
                        commandKey.current = crypto.randomUUID();
                      }}
                    >
                      ลบแถว
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                className={secondaryClass + ' self-start'}
                onClick={() => {
                  setLines((v) => [...v, { productId: '', quantity: '1' }]);
                  commandKey.current = crypto.randomUUID();
                }}
              >
                เพิ่มสินค้า
              </button>
              <Field label="หมายเหตุ">
                <textarea
                  className={inputClass}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    commandKey.current = crypto.randomUUID();
                  }}
                />
              </Field>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="poppins-semibold">ยอดขาย {money(sum)} บาท</span>
                <div className="flex gap-2">
                  {edit && (
                    <button
                      type="button"
                      disabled={busy}
                      className={secondaryClass}
                      onClick={() => {
                        setEdit(false);
                        setVersion((v) => v + 1);
                      }}
                    >
                      ยกเลิก
                    </button>
                  )}
                  <button
                    className={buttonClass}
                    disabled={busy || (mode === 'create' && !canCreate)}
                  >
                    บันทึกและจองสินค้า
                  </button>
                </div>
              </div>
            </form>
          ) : (
            row && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl poppins-semibold">{row.code}</h2>
                    <p className="text-sm text-gray-500">
                      {row.customerName} · {row.territoryName}
                    </p>
                  </div>
                  <StatusBadge value={row.status} />
                </div>
                <dl className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 text-sm sm:grid-cols-3">
                  {[
                    ['ผู้สร้าง', row.createdByName],
                    ['Manager ประจำเขต', row.managerName],
                    ['Sales ประจำเขต', row.salesName],
                    ['ผู้อนุมัติ', row.approvedByName],
                    ['ผู้จัดและตัดคลัง', row.completedByName],
                    ['สร้างเมื่อ', dateTime(row.createdAt)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-gray-500">{label}</dt>
                      <dd className="mt-1">{value || '-'}</dd>
                    </div>
                  ))}
                </dl>
                {row.returnReason && (
                  <p className="rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                    เหตุผล: {row.returnReason}
                  </p>
                )}
                {!row.workflowManaged && (
                  <p className="rounded-lg bg-blue-50 p-4 text-sm">
                    เอกสารเดิมมีเฉพาะข้อมูลหัวเอกสาร จึงยังไม่มีรายการจองล็อตหรือการตัดคลัง
                  </p>
                )}
                <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                  <SortableTable className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-blue-50">
                      <tr>
                        {['สินค้า', 'จำนวน', 'ราคาขายต่อหน่วย', 'ล็อตที่จัดให้', 'สถานะ'].map(
                          (t) => (
                            <th key={t} scope="col" className="p-4 poppins-medium">
                              {t}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {row.lines?.map((l) => (
                        <tr key={l.id} className="border-t border-gray-100">
                          <td className="p-4">{l.productName}</td>
                          <td className="p-4">{l.quantity}</td>
                          <td className="p-4">{money(l.unitPrice)}</td>
                          <td className="p-4">
                            {l.allocations.map((a) => (
                              <div key={a.id}>
                                {a.lotNumber} · {a.quantity}
                                <small className="block text-gray-500">ล็อต {a.lotId}</small>
                              </div>
                            ))}
                          </td>
                          <td className="p-4">
                            {l.allocations.map((a) => (
                              <div key={a.id} className="py-1">
                                <StatusBadge value={a.status} />
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </SortableTable>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5">
                  <p className="poppins-semibold">ยอดขาย {money(row.amount)} บาท</p>
                  {row.costAmount !== undefined && (
                    <div className="mt-2 flex flex-wrap gap-5 text-sm">
                      <span>ต้นทุนที่จ่าย {money(row.costAmount)} บาท</span>
                      <span>ผลต่างยอดขายกับต้นทุน {money(row.grossProfit)} บาท</span>
                    </div>
                  )}
                  <p className="mt-3 text-sm text-gray-500">หมายเหตุ: {row.notes || '-'}</p>
                </div>
                {row.workflowManaged && !['เสร็จสิ้น', 'ยกเลิก'].includes(row.status) && (
                  <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5">
                    {(['MANAGER', 'ADMIN'].includes(role) ||
                      (role === 'SALES' && row.createdById === options?.actor.id)) && (
                      <Field label="เหตุผลส่งกลับ / ยกเลิก">
                        <textarea
                          className={inputClass}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </Field>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {canEdit && (
                        <button
                          className={secondaryClass}
                          disabled={busy}
                          onClick={() => setEdit(true)}
                        >
                          แก้รายการสินค้า
                        </button>
                      )}
                      {role === 'MANAGER' && ['รอตรวจ', 'ส่งกลับแก้ไข'].includes(row.status) && (
                        <button
                          className={buttonClass}
                          disabled={busy}
                          onClick={() => ask('approve')}
                        >
                          อนุมัติ
                        </button>
                      )}
                      {['MANAGER', 'ADMIN'].includes(role) && (
                        <button
                          className={secondaryClass}
                          disabled={busy || !reason.trim()}
                          onClick={() => ask('return')}
                        >
                          ส่งกลับ Sales แก้ไข
                        </button>
                      )}
                      {role === 'ADMIN' && row.status === 'อนุมัติ' && (
                        <button
                          className={buttonClass}
                          disabled={busy}
                          onClick={() => ask('complete')}
                        >
                          ยืนยันจัดของและตัดคลัง
                        </button>
                      )}
                      {(['MANAGER', 'ADMIN'].includes(role) ||
                        (role === 'SALES' && row.createdById === options?.actor.id)) && (
                        <button
                          className={secondaryClass + ' text-red-600'}
                          disabled={busy || !reason.trim()}
                          onClick={() => ask('cancel')}
                        >
                          ยกเลิก Order และคืนจอง
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      สร้างเอกสารแล้วจองทันที · ตัดของเมื่อ Admin ยืนยันเสร็จสิ้น
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
