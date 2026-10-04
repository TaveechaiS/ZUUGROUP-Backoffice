'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type {
  OperationOptions,
  StockRow,
  LotRow,
  ReceiptRow,
  MovementRow,
  PageData,
} from '@/types/api/operations';
import { Get, Post } from '@/service/http';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import LotStockTable from './lot-stock-table';
import {
  Field,
  ErrorMessage,
  Paging,
  inputClass,
  buttonClass,
  secondaryClass,
  money,
  dateTime,
  dateOnly,
} from './shared';
type ReceiveLine = {
  productId: string;
  warehouseId: string;
  lotNumber: string;
  quantity: string;
  totalCost: string;
  manufacturedOn: string;
  expiresOn: string;
};
type View = 'stock' | 'receipts' | 'movements';
type Revision = {
  id: string;
  lotId: string;
  reason: string;
  createdAt: string;
  actorName: string;
  beforeData?: { receivedQuantity: number; totalCost: string };
  afterData?: { receivedQuantity: number; totalCost: string };
};
type Receipt = ReceiptRow & { revisions: Revision[] };
const emptyLot = (warehouseId = ''): ReceiveLine => ({
  productId: '',
  warehouseId,
  lotNumber: '',
  quantity: '',
  totalCost: '',
  manufacturedOn: '',
  expiresOn: '',
});
export default function InventoryWorkspace({
  initialView = 'stock',
  warehouseCode,
  title = initialView === 'receipts' ? 'รับสินค้าเข้า' : 'ล็อตสินค้า',
}: {
  initialView?: View;
  warehouseCode?: 'MAIN' | 'MARKETING' | 'DISPOSAL';
  title?: string;
}) {
  const [view, setView] = useState<View>(initialView),
    [options, setOptions] = useState<OperationOptions | null>(null),
    [rows, setRows] = useState<(LotRow | Receipt | MovementRow)[]>([]),
    [expiryTab, setExpiryTab] = useState(''),
    [productId, setProductId] = useState(''),
    [expiryBefore, setExpiryBefore] = useState(''),
    [search, setSearch] = useState(''),
    [warehouseId, setWarehouse] = useState(''),
    [offset, setOffset] = useState(0),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(''),
    [receive, setReceive] = useState(false),
    [code, setCode] = useState(''),
    [source, setSource] = useState(''),
    [notes, setNotes] = useState(''),
    [lots, setLots] = useState<ReceiveLine[]>([emptyLot()]),
    [selected, setSelected] = useState<StockRow | null>(null),
    [action, setAction] = useState(''),
    [values, setValues] = useState<Record<string, string>>({}),
    [confirmed, setConfirmed] = useState(false),
    [pending, setPending] = useState<Record<string, unknown> | null>(null),
    [expanded, setExpanded] = useState('');
  const lock = useRef(false),
    key = useRef(crypto.randomUUID());
  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: OperationOptions }>('/api/inventory?view=options', controller.signal)
      .then((r) => setOptions(r.data))
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [version]);
  useEffect(() => {
    if (warehouseCode && !options) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      const q = new URLSearchParams({
        view: view === 'stock' ? 'lots' : view,
        search,
        offset: String(offset),
        limit: '10',
      });
      if (view === 'stock') {
        q.set('expiry', expiryTab);
        q.set('productId', productId);
        q.set('expiryBefore', expiryBefore);
      }
      const fixedWarehouse = warehouseCode
        ? options?.warehouses.find((w) => w.code === warehouseCode)
        : undefined;
      if (warehouseCode && !fixedWarehouse) {
        setError('ไม่พบคลังที่เลือก กรุณาติดต่อ Admin');
        setRows([]);
        setLoading(false);
        return;
      }
      if (view === 'stock' && (fixedWarehouse?.id || warehouseId))
        q.set('warehouseId', fixedWarehouse?.id || warehouseId);
      Get<PageData<LotRow | Receipt | MovementRow>>('/api/inventory?' + q, controller.signal)
        .then((r) => {
          if (controller.signal.aborted) return;
          setRows(r.data);
          setTotal(r.pagination.total);
          if (offset >= r.pagination.total && offset)
            setOffset(Math.max(0, Math.ceil(r.pagination.total / 10) - 1) * 10);
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
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    view,
    search,
    offset,
    warehouseId,
    version,
    warehouseCode,
    options,
    expiryTab,
    productId,
    expiryBefore,
  ]);
  const admin = options?.actor.roleId === 'ADMIN',
    canCost = ['ADMIN', 'ACCOUNTING_CFO'].includes(options?.actor.roleId ?? '');
  function openReceive() {
    const main = options?.warehouses.find((w) => w.code === 'MAIN')?.id ?? '';
    setReceive(true);
    setLots([emptyLot(main)]);
    setCode('RCV-' + Date.now());
    setSource('');
    setNotes('');
    key.current = crypto.randomUUID();
  }
  function openAction(r: StockRow, type: string) {
    setSelected(r);
    setAction(type);
    setValues({
      quantity:
        type === 'correct'
          ? String(r.receivedQuantity)
          : type === 'adjust'
            ? String(r.quantity)
            : '',
      warehouseId: r.warehouseId,
      targetWarehouseId: '',
      reason: '',
      totalCost: r.totalCost ?? '',
      manufacturedOn: r.manufacturedOn,
      expiresOn: r.expiresOn,
      recipient: '',
      giveType: 'แจก',
      arrivalOn: '',
      condition: r.condition,
    });
    setConfirmed(false);
    key.current = crypto.randomUUID();
  }
  function changeValue(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    key.current = crypto.randomUUID();
  }
  function changeLot(index: number, name: keyof ReceiveLine, value: string) {
    setLots((v) => v.map((l, i) => (i === index ? { ...l, [name]: value } : l)));
    key.current = crypto.randomUUID();
  }
  async function execute() {
    if (!pending || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await Post('/api/inventory', pending);
      setNotice('บันทึกรายการแล้ว');
      setPending(null);
      setReceive(false);
      setSelected(null);
      setVersion((v) => v + 1);
      key.current = crypto.randomUUID();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const actionLabels: Record<string, string> = {
    correct: 'ยกเลิกข้อมูลผิดและบันทึกแก้ไข',
    adjust: 'ปรับยอดตามของจริง',
    transfer: 'โอนคลัง',
    give: 'แจก / บริจาค',
    condition: 'บันทึกสภาพสินค้า',
  };
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-5 p-4 text-[#26364b] md:p-6">
      <SuccessAlertComponent isOpen={!!notice} title={notice} onClose={() => setNotice('')} />
      <ConfirmationDialog
        isOpen={!!pending}
        title="ยืนยันรายการนี้?"
        description={
          error ||
          'ระบบจะบันทึกยอดและประวัติพร้อมข้อมูลต้นทาง กรุณาตรวจจำนวนและล็อตให้ตรงกับของจริง'
        }
        busy={busy}
        variant="primary"
        confirmLabel="ยืนยัน"
        busyLabel="กำลังบันทึก..."
        onCancel={() => setPending(null)}
        onConfirm={() => void execute()}
      />
      <h2 className="sr-only">{title}</h2>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3ee]">
        {view === 'stock' ? (
          <div role="tablist" aria-label="อายุล็อตสินค้า" className="flex flex-wrap gap-5">
            {[
              ['', 'ทั้งหมด'],
              ['near', 'ใกล้หมดอายุ'],
              ['expired', 'หมดอายุ'],
            ].map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={expiryTab === value}
                onClick={() => {
                  setExpiryTab(value);
                  setOffset(0);
                }}
                className={`border-b-2 px-1 py-3 text-sm ${expiryTab === value ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#718096]'}`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <h2 className="py-3 text-sm poppins-semibold text-[#1a58a7]">
            {view === 'receipts' ? 'ประวัติรับเข้า' : 'ความเคลื่อนไหว'}
          </h2>
        )}
        {admin && view !== 'movements' && (
          <button className={buttonClass + ' mb-2'} onClick={openReceive}>
            + รับสินค้าเข้า
          </button>
        )}
      </div>
      <ErrorMessage message={error} />
      {receive && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPending({
              action: 'receive',
              code,
              source,
              notes,
              lots: lots.map((l) => ({ ...l, quantity: Number(l.quantity) })),
              idempotencyKey: key.current,
            });
          }}
          className="flex flex-col gap-5 rounded-xl border border-gray-100 bg-white p-5"
        >
          <h2 className="text-lg poppins-semibold">รับสินค้าเข้า — สร้างล็อตใหม่</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="เลขที่รับเข้า">
              <input
                required
                className={inputClass}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  key.current = crypto.randomUUID();
                }}
              />
            </Field>
            <Field label="แหล่งที่มา (ถ้ามี)">
              <input
                className={inputClass}
                value={source}
                onChange={(e) => {
                  setSource(e.target.value);
                  key.current = crypto.randomUUID();
                }}
              />
            </Field>
            <Field label="หมายเหตุ">
              <input
                className={inputClass}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  key.current = crypto.randomUUID();
                }}
              />
            </Field>
          </div>
          {lots.map((l, i) => (
            <fieldset className="rounded-xl border border-gray-200 p-4" key={i}>
              <legend className="px-2 text-sm poppins-medium">ล็อต {i + 1}</legend>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="สินค้า">
                  <select
                    required
                    className={inputClass}
                    value={l.productId}
                    onChange={(e) => changeLot(i, 'productId', e.target.value)}
                  >
                    <option value="">เลือกสินค้า</option>
                    {options?.products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.unit}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="คลังรับเข้า">
                  <select
                    required
                    className={inputClass}
                    value={l.warehouseId}
                    onChange={(e) => changeLot(i, 'warehouseId', e.target.value)}
                  >
                    <option value="">เลือกคลัง</option>
                    {options?.warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="เลขล็อตบนสินค้า">
                  <input
                    required
                    className={inputClass}
                    value={l.lotNumber}
                    onChange={(e) => changeLot(i, 'lotNumber', e.target.value)}
                  />
                </Field>
                <Field label="จำนวนรับเข้า">
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    className={inputClass}
                    value={l.quantity}
                    onChange={(e) => changeLot(i, 'quantity', e.target.value)}
                  />
                </Field>
                <Field
                  label="ต้นทุนรวมล็อต (บาท)"
                  hint="เช่น 1,000 ชิ้น ชิ้นละ 5 บาท ให้กรอก 5,000 บาท"
                >
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={l.totalCost}
                    onChange={(e) => changeLot(i, 'totalCost', e.target.value)}
                  />
                </Field>
                <Field label="วันผลิต">
                  <input
                    required
                    type="date"
                    className={inputClass}
                    value={l.manufacturedOn}
                    onChange={(e) => changeLot(i, 'manufacturedOn', e.target.value)}
                  />
                </Field>
                <Field label="วันหมดอายุ" hint="ฉลากมีเพียงเดือน/ปี ให้ระบุวันสุดท้ายของเดือนนั้น">
                  <input
                    required
                    type="date"
                    className={inputClass}
                    value={l.expiresOn}
                    onChange={(e) => changeLot(i, 'expiresOn', e.target.value)}
                  />
                </Field>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={lots.length === 1}
                    className={secondaryClass}
                    onClick={() => {
                      setLots((v) => v.filter((_, n) => n !== i));
                      key.current = crypto.randomUUID();
                    }}
                  >
                    ลบแถวล็อต
                  </button>
                </div>
              </div>
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryClass}
              disabled={lots.length >= 50}
              onClick={() => {
                setLots((v) => [
                  ...v,
                  emptyLot(options?.warehouses.find((w) => w.code === 'MAIN')?.id),
                ]);
                key.current = crypto.randomUUID();
              }}
            >
              เพิ่มล็อต
            </button>
            <button className={buttonClass} disabled={busy}>
              บันทึกรับเข้า
            </button>
            <button
              type="button"
              className={secondaryClass}
              disabled={busy}
              onClick={() => setReceive(false)}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}
      {selected && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPending({
              action,
              lotId: selected.lotId,
              ...values,
              quantity: Number(values.quantity),
              recipientConfirmed: confirmed,
              idempotencyKey: key.current,
            });
          }}
          className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-white p-5"
        >
          <div className="flex flex-wrap justify-between gap-2">
            <h2 className="poppins-semibold">
              {actionLabels[action]} · {selected.productName} / {selected.lotNumber}
            </h2>
            <button className={secondaryClass} type="button" onClick={() => setSelected(null)}>
              ปิด
            </button>
          </div>
          <p className="break-all text-xs text-gray-500">
            Lot ID: {selected.lotId} · รับเข้าจาก {selected.receiptCode}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {action !== 'condition' && (
              <Field
                label={
                  action === 'correct'
                    ? 'จำนวนรับเข้าที่ถูกต้อง'
                    : action === 'adjust'
                      ? 'ยอดคงเหลือจริงในคลังนี้'
                      : 'จำนวน'
                }
              >
                <input
                  required
                  type="number"
                  min={action === 'adjust' ? '0' : '1'}
                  step="1"
                  className={inputClass}
                  value={values.quantity}
                  onChange={(e) => changeValue('quantity', e.target.value)}
                />
              </Field>
            )}
            {action === 'correct' && (
              <>
                <Field label="ต้นทุนรวมล็อตที่ถูกต้อง">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={values.totalCost}
                    onChange={(e) => changeValue('totalCost', e.target.value)}
                  />
                </Field>
                <Field label="วันผลิต">
                  <input
                    required
                    type="date"
                    className={inputClass}
                    value={values.manufacturedOn}
                    onChange={(e) => changeValue('manufacturedOn', e.target.value)}
                  />
                </Field>
                <Field label="วันหมดอายุ">
                  <input
                    required
                    type="date"
                    className={inputClass}
                    value={values.expiresOn}
                    onChange={(e) => changeValue('expiresOn', e.target.value)}
                  />
                </Field>
              </>
            )}
            {action === 'transfer' && (
              <Field label="คลังปลายทาง">
                <select
                  required
                  className={inputClass}
                  value={values.targetWarehouseId}
                  onChange={(e) => changeValue('targetWarehouseId', e.target.value)}
                >
                  <option value="">เลือกคลัง</option>
                  {options?.warehouses
                    .filter((w) => w.id !== selected.warehouseId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            {action === 'condition' && (
              <Field label="สภาพสินค้า">
                <select
                  className={inputClass}
                  value={values.condition}
                  onChange={(e) => changeValue('condition', e.target.value)}
                >
                  <option>ปกติ</option>
                  <option>เสื่อมสภาพ</option>
                </select>
              </Field>
            )}
            {action === 'give' && (
              <>
                <Field label="ประเภท">
                  <select
                    className={inputClass}
                    value={values.giveType}
                    onChange={(e) => changeValue('giveType', e.target.value)}
                  >
                    <option>แจก</option>
                    <option>บริจาค</option>
                  </select>
                </Field>
                <Field label="ผู้รับ">
                  <input
                    required
                    className={inputClass}
                    value={values.recipient}
                    onChange={(e) => changeValue('recipient', e.target.value)}
                  />
                </Field>
                {values.giveType === 'บริจาค' && (
                  <>
                    <Field label="วันที่คาดว่าผู้รับได้รับ">
                      <input
                        required
                        type="date"
                        className={inputClass}
                        value={values.arrivalOn}
                        onChange={(e) => changeValue('arrivalOn', e.target.value)}
                      />
                    </Field>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        required
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => {
                          setConfirmed(e.target.checked);
                          key.current = crypto.randomUUID();
                        }}
                      />
                      ตรวจสภาพและยืนยันเงื่อนไขผู้รับแล้ว
                    </label>
                  </>
                )}
              </>
            )}
            <Field label="เหตุผล">
              <textarea
                required
                className={inputClass}
                value={values.reason}
                onChange={(e) => changeValue('reason', e.target.value)}
              />
            </Field>
          </div>
          {action === 'correct' && (
            <p className="text-xs text-gray-500">
              แก้ได้ภายใน 7 วันจากบันทึกต้นฉบับ · เก็บ Lot ID และประวัติเดิม ·
              ผลต่างจำนวนปรับในคลังที่เลือกนี้
            </p>
          )}
          <button disabled={busy} className={buttonClass + ' self-start'}>
            ตรวจและยืนยันรายการ
          </button>
        </form>
      )}
      {!warehouseCode && (
        <nav className="flex flex-wrap gap-4 text-sm" aria-label="ประวัติคลัง">
          {(
            [
              ['stock', 'ล็อตสินค้า'],
              ['receipts', 'ประวัติรับเข้า'],
              ['movements', 'ความเคลื่อนไหว'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              className={
                view === v
                  ? 'text-[#1a58a7] poppins-semibold'
                  : 'text-[#718096] hover:text-[#1a58a7]'
              }
              onClick={() => {
                setView(v);
                setOffset(0);
                setExpanded('');
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap gap-3 rounded-lg border border-[#e3e9f0] bg-[#f8f9fb] p-3">
        <input
          aria-label="ค้นหาคลัง"
          placeholder={
            view === 'receipts' ? 'ค้นหาเลขที่รับเข้าหรือแหล่งที่มา' : 'ค้นหาสินค้าหรือเลขล็อต'
          }
          className={inputClass + ' max-w-sm'}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
        />
        {view === 'stock' && !warehouseCode && (
          <select
            aria-label="คลังสินค้า"
            className={inputClass + ' max-w-56'}
            value={warehouseId}
            onChange={(e) => {
              setWarehouse(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">ทุกคลัง</option>
            {options?.warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}
        {view === 'stock' && (
          <>
            <select
              aria-label="สินค้า"
              className={inputClass + ' max-w-56'}
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setOffset(0);
              }}
            >
              <option value="">สินค้าทั้งหมด</option>
              {options?.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <label className="text-xs text-[#53647c]">
              หมดอายุภายในวันที่
              <input
                type="date"
                className={inputClass}
                value={expiryBefore}
                onChange={(e) => {
                  setExpiryBefore(e.target.value);
                  setOffset(0);
                }}
              />
            </label>
          </>
        )}
      </div>
      <div
        className="relative min-h-52 overflow-x-auto rounded-lg border border-[#e3e9f0] bg-white"
        aria-busy={loading}
      >
        <LoadingComponent isVisible={loading} variant="content" />
        {view === 'stock' ? (
          <LotStockTable
            rows={rows as LotRow[]}
            canCost={canCost}
            admin={!!admin}
            warningDays={options?.policy.warningDays ?? 90}
            onAction={openAction}
          />
        ) : view === 'receipts' ? (
          <div className="divide-y divide-gray-100">
            {(rows as Receipt[]).map((r) => (
              <article key={r.id} className="p-4">
                <button
                  className="flex w-full flex-wrap justify-between gap-3 text-left"
                  onClick={() => setExpanded((v) => (v === r.id ? '' : r.id))}
                >
                  <span>
                    <span className="poppins-medium">{r.code}</span>
                    <small className="block text-gray-500">
                      {r.source || 'ยังไม่ระบุแหล่งที่มา'} · {r.actorName}
                    </small>
                  </span>
                  <span className="text-sm text-gray-500">
                    {dateTime(r.createdAt)} · {new Set(r.lots.map((l) => l.lotId)).size} ล็อต
                  </span>
                </button>
                {expanded === r.id && (
                  <div className="mt-4 flex flex-col gap-3">
                    <p className="text-sm">หมายเหตุ: {r.notes || '-'}</p>
                    {r.lots.map((l) => (
                      <div key={l.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                        <p>
                          {l.productName} · ล็อต {l.lotNumber} · รับเข้า {l.receivedQuantity}{' '}
                          {l.unit}
                        </p>
                        <p className="text-gray-500">
                          {l.warehouseName} คงเหลือ {l.quantity} / จอง {l.reserved} · หมดอายุ{' '}
                          {dateOnly(l.expiresOn)}
                        </p>
                        <p className="break-all text-xs text-gray-500">Lot ID: {l.lotId}</p>
                        {canCost && <p>ต้นทุนรวมล็อต {money(l.totalCost)} บาท</p>}
                        {admin && (
                          <button
                            className={secondaryClass + ' mt-2'}
                            onClick={() => openAction(l, 'correct')}
                          >
                            แก้ข้อมูลรับเข้า
                          </button>
                        )}
                      </div>
                    ))}
                    <h3 className="text-sm poppins-medium">ประวัติแก้ข้อมูล</h3>
                    {r.revisions.length ? (
                      r.revisions.map((v) => (
                        <div key={v.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                          <p>
                            {dateTime(v.createdAt)} · {v.actorName} · {v.reason}
                          </p>
                          {v.beforeData && v.afterData && (
                            <p className="text-gray-500">
                              จำนวนรับเข้า {v.beforeData.receivedQuantity} →{' '}
                              {v.afterData.receivedQuantity} · ต้นทุน{' '}
                              {money(v.beforeData.totalCost)} → {money(v.afterData.totalCost)}
                            </p>
                          )}
                          <p className="break-all text-xs text-gray-500">
                            รายการแก้ไข {v.id} · ล็อต {v.lotId}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">ยังไม่มีการแก้ไข</p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-blue-50">
              <tr>
                {['วันเวลา / ผู้ทำ', 'สินค้า / ล็อต', 'คลัง', 'จำนวน', 'รายการ / เหตุผล'].map(
                  (t) => (
                    <th scope="col" key={t} className="p-4 poppins-medium">
                      {t}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {(rows as MovementRow[]).map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="p-4">
                    {dateTime(r.occurredAt)}
                    <small className="block text-gray-500">{r.actorName}</small>
                  </td>
                  <td className="p-4">
                    {r.productName}
                    <small className="block text-gray-500">{r.lotNumber}</small>
                  </td>
                  <td className="p-4">{r.warehouseName}</td>
                  <td className={'p-4 ' + (r.quantity < 0 ? 'text-red-600' : 'text-emerald-600')}>
                    {r.quantity > 0 ? '+' : ''}
                    {r.quantity}
                  </td>
                  <td className="p-4">
                    {r.kind}
                    <small className="block text-gray-500">{r.reason || '-'}</small>
                    {r.kind === 'ขาย' ? (
                      <Link className="text-xs text-[#1a58a7]" href={'/orders/' + r.sourceId}>
                        ดู Order
                      </Link>
                    ) : (
                      <small className="block max-w-64 break-all text-gray-500">
                        อ้างอิง {r.sourceId}
                      </small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !rows.length && (
          <p className="p-10 text-center text-sm text-gray-500">
            ยังไม่มีข้อมูล — รับสินค้าจริงเพื่อเริ่มยอดคลัง
          </p>
        )}
      </div>
      <Paging offset={offset} total={total} onChange={setOffset} />
      {options && (
        <details className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
          <summary className="cursor-pointer poppins-medium">เกณฑ์อายุสินค้า</summary>
          <p className="mt-3 text-gray-500">
            ขาย: อายุเหลืออย่างน้อย {options.policy.saleMonths} เดือน · บริจาค: อย่างน้อย{' '}
            {options.policy.donationMonths} เดือนเมื่อผู้รับได้รับ · เตือนใกล้หมดอายุ{' '}
            {options.policy.warningDays} วัน · การเตือนไม่ย้ายของเอง
          </p>
          {admin && (
            <PolicyEditor
              options={options}
              busy={busy}
              onSave={(b) => {
                key.current = crypto.randomUUID();
                setPending({ ...b, action: 'policy', idempotencyKey: key.current });
              }}
            />
          )}
        </details>
      )}
    </section>
  );
}
function PolicyEditor({
  options,
  busy,
  onSave,
}: {
  options: OperationOptions;
  busy: boolean;
  onSave: (b: Record<string, unknown>) => void;
}) {
  const [sale, setSale] = useState(String(options.policy.saleMonths)),
    [donation, setDonation] = useState(String(options.policy.donationMonths)),
    [warning, setWarning] = useState(String(options.policy.warningDays));
  return (
    <form
      className="mt-4 grid gap-3 sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          saleMonths: Number(sale),
          donationMonths: Number(donation),
          warningDays: Number(warning),
        });
      }}
    >
      <Field label="ขั้นต่ำขาย (เดือน)">
        <input
          required
          type="number"
          min="0"
          max="24"
          className={inputClass}
          value={sale}
          onChange={(e) => setSale(e.target.value)}
        />
      </Field>
      <Field label="ขั้นต่ำบริจาค (เดือน)">
        <input
          required
          type="number"
          min="6"
          max="36"
          className={inputClass}
          value={donation}
          onChange={(e) => setDonation(e.target.value)}
        />
      </Field>
      <Field label="เตือน (วัน)">
        <input
          required
          type="number"
          min="1"
          max="730"
          className={inputClass}
          value={warning}
          onChange={(e) => setWarning(e.target.value)}
        />
      </Field>
      <button disabled={busy} className={buttonClass + ' self-end'}>
        บันทึกเกณฑ์
      </button>
    </form>
  );
}
