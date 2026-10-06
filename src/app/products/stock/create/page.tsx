'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post, HttpError } from '@/service/http';
import type { ReceiveOptions, Option } from '@/types/api/operations';
import SearchCombobox from '@/components/ui/search-combobox';
import LoadingComponent from '@/components/ui/loading-component';
import ListRequestState from '@/components/ui/list-request-state';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';

const inputClass =
  'mt-2 block h-11 w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none placeholder:text-[#8994a5] focus:border-[#1a58a7] focus:ring-2 focus:ring-blue-100';
const initial = {
  productId: '',
  warehouseId: '',
  code: '',
  quantity: '',
  totalCost: '',
  manufacturedOn: '',
  expiresOn: '',
  notes: '',
};
const sections = [
  {
    title: 'ข้อมูลการรับเข้า',
    fields: [
      ['productId', 'สินค้า'],
      ['warehouseId', 'คลังปลายทาง'],
      ['code', 'ID'],
    ],
  },
  {
    title: 'ข้อมูลล็อตสินค้า',
    fields: [
      ['quantity', 'จำนวนรับเข้า'],
      ['totalCost', 'ต้นทุนรวมล็อต'],
      ['unitCost', 'ต้นทุนต่อชิ้น'],
      ['manufacturedOn', 'วันผลิต'],
      ['expiresOn', 'วันหมดอายุ'],
    ],
  },
  { title: 'หมายเหตุ', fields: [['notes', 'หมายเหตุ']] },
] as const;

export default function Page() {
  const router = useRouter();
  const [options, setOptions] = useState<ReceiveOptions | null>(null);
  const [values, setValues] = useState(initial);
  const [open, setOpen] = useState<string[]>(['ข้อมูลการรับเข้า', 'ข้อมูลล็อตสินค้า']);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [alert, setAlert] = useState<'save' | 'cancel' | null>(null);
  const [savedCode, setSavedCode] = useState('');
  const lock = useRef(false);
  const attempted = useRef(false);
  const initialized = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setLoadError('');
      Get<{ data: ReceiveOptions }>('/api/inventory?view=options&scope=receive', controller.signal)
        .then(({ data }) => {
          if (controller.signal.aborted) return;
          setOptions(data);
          if (!initialized.current) {
            initialized.current = true;
            const requested = new URLSearchParams(window.location.search).get('productId');
            setValues((current) => ({
              ...current,
              code: current.code || data.nextReceiptCode || '',
              warehouseId: data.warehouses.find((item) => item.code === 'MAIN')?.id ?? '',
              productId: data.products.some((item) => item.id === requested) ? requested! : '',
            }));
          }
        })
        .catch((caught) => {
          if (!controller.signal.aborted)
            setLoadError(caught instanceof Error ? caught.message : 'โหลดตัวเลือกไม่สำเร็จ');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [retry]);
  const product = options?.products.find((item) => item.id === values.productId);
  const idParts = values.code.match(/^(GR)-(\d{4})-(\d*)$/);
  const idPrefix = idParts ? idParts[1] + '-' + idParts[2] + '-' : '';
  const days =
    values.manufacturedOn && values.expiresOn
      ? (Date.parse(values.expiresOn) - Date.parse(values.manufacturedOn)) / 86400000
      : NaN;
  const unitCost =
    values.totalCost !== '' &&
    Number(values.quantity) > 0 &&
    Number.isFinite(Number(values.totalCost))
      ? (Number(values.totalCost) / Number(values.quantity)).toLocaleString('th-TH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : '';
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  function change(key: keyof typeof initial, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setError('');
  }
  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || lock.current || savedCode) return;
    if (pending) {
      setConfirm(true);
      return;
    }
    setError('');
    if (!product || !options?.warehouses.some((item) => item.id === values.warehouseId)) {
      setError('กรุณาเลือกสินค้าและคลังปลายทาง');
      return;
    }
    const sequence = idParts?.[3] ?? '';
    if (!idPrefix || !/^\d{1,5}$/.test(sequence) || Number(sequence) < 1) {
      setError('กรุณากรอกเลขลำดับ ID ระหว่าง 1–99999');
      return;
    }
    if (!/^[1-9]\d*$/.test(values.quantity) || Number(values.quantity) > 100000000) {
      setError('จำนวนรับเข้าต้องเป็นจำนวนเต็มมากกว่า 0');
      return;
    }
    if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(values.totalCost)) {
      setError('ต้นทุนรวมล็อตต้องตั้งแต่ 0 และทศนิยมไม่เกิน 2 ตำแหน่ง');
      return;
    }
    if (!Number.isFinite(days) || days <= 0 || values.manufacturedOn > today) {
      setError('กรุณาระบุวันผลิตไม่เกินวันนี้ และวันหมดอายุหลังวันผลิต');
      return;
    }
    attempted.current = false;
    setPending({
      action: 'receive',
      idempotencyKey: crypto.randomUUID(),
      code: idPrefix + sequence.padStart(5, '0'),
      notes: values.notes.trim(),
      lots: [
        {
          productId: values.productId,
          warehouseId: values.warehouseId,
          quantity: Number(values.quantity),
          totalCost: values.totalCost,
          manufacturedOn: values.manufacturedOn,
          expiresOn: values.expiresOn,
        },
      ],
    });
    setConfirm(true);
  }
  async function receive() {
    if (!pending || lock.current) return;
    lock.current = true;
    attempted.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await Post<{ data: { code: string; id: string } }>('/api/inventory', pending);
      if (!result.data?.id || !result.data.code)
        throw new Error('ไม่ได้รับผลการรับเข้า กรุณาลองคำขอเดิมอีกครั้ง');
      setSavedCode(result.data.code);
      setPending(null);
      setConfirm(false);
      setAlert('save');
    } catch (caught) {
      setConfirm(false);
      if (caught instanceof HttpError && caught.status < 500) {
        setPending(null);
        attempted.current = false;
      }
      setError(
        (caught instanceof Error ? caught.message : 'บันทึกรับเข้าไม่สำเร็จ') +
          ' หากผลคำขอยังไม่ชัดเจน ให้กดบันทึกเพื่อลองคำขอเดิมอีกครั้ง',
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="min-w-0 w-full px-4 py-6 text-[#344256] md:px-6 md:py-8">
      <ListRequestState error={loadError} retry={() => setRetry((value) => value + 1)} />
      {loading ? (
        <LoadingComponent isVisible />
      ) : (
        options &&
        !loadError && (
          <form onSubmit={prepare} noValidate>
            <fieldset
              disabled={busy || Boolean(pending) || Boolean(savedCode)}
              className="min-w-0 space-y-6 border-0 p-0"
            >
              {sections.map((section) => (
                <details
                  key={section.title}
                  open={open.includes(section.title)}
                  onToggle={(event) => {
                    const expanded = event.currentTarget.open;
                    setOpen((current) =>
                      expanded
                        ? current.includes(section.title)
                          ? current
                          : [...current, section.title]
                        : current.filter((title) => title !== section.title),
                    );
                  }}
                  className="group rounded-lg border border-[#d9e3ee] p-4 md:p-6"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a58a7] [&::-webkit-details-marker]:hidden">
                    <h3 className="text-base poppins-semibold text-[#1a58a7]">{section.title}</h3>
                    <svg
                      width="23"
                      height="13"
                      viewBox="0 0 23 13"
                      fill="none"
                      aria-hidden="true"
                      className="shrink-0 -rotate-90 transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
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
                    {section.fields.map(([key, label]) => {
                      const required = !['unitCost', 'notes'].includes(key);
                      const isDate = key === 'manufacturedOn' || key === 'expiresOn';
                      return (
                        <div
                          key={key}
                          className={
                            key === 'notes'
                              ? 'basis-full'
                              : key === 'expiresOn'
                                ? 'min-w-0 basis-full md:basis-[calc(50%-1rem)]'
                                : 'min-w-0 basis-full md:basis-[calc(50%-1rem)] md:flex-1'
                          }
                        >
                          <label htmlFor={'stock-' + key} className="text-sm poppins-medium">
                            {label}
                            {required && (
                              <span aria-hidden="true" className="ml-1 text-red-600">
                                *
                              </span>
                            )}
                          </label>
                          {key === 'productId' || key === 'warehouseId' ? (
                            <SelectField
                              label={label}
                              id={'stock-' + key}
                              value={values[key]}
                              options={key === 'productId' ? options.products : options.warehouses}
                              onChange={(value) => change(key, value)}
                            />
                          ) : key === 'code' ? (
                            <div className="mt-2 flex min-w-0 items-center gap-2">
                              <input
                                readOnly
                                aria-label="ตัวอักษร ID"
                                value={idParts?.[1] ?? 'GR'}
                                className={
                                  inputClass
                                    .replace('mt-2', 'mt-0')
                                    .replace('w-full', 'w-16')
                                    .replace('bg-white', 'bg-blue-50') + ' shrink-0 text-center'
                                }
                              />
                              <span aria-hidden="true">-</span>
                              <input
                                readOnly
                                aria-label="ปี ID"
                                value={idParts?.[2] ?? ''}
                                className={
                                  inputClass
                                    .replace('mt-2', 'mt-0')
                                    .replace('w-full', 'w-24')
                                    .replace('bg-white', 'bg-blue-50') + ' shrink-0 text-center'
                                }
                              />
                              <span aria-hidden="true">-</span>
                              <input
                                id="stock-code"
                                aria-label="เลขลำดับ ID"
                                required
                                inputMode="numeric"
                                maxLength={5}
                                value={idParts?.[3] ?? ''}
                                onChange={(event) => {
                                  if (idPrefix && /^\d{0,5}$/.test(event.target.value))
                                    change('code', idPrefix + event.target.value);
                                }}
                                onBlur={() => {
                                  if (idPrefix && Number(idParts?.[3]) > 0)
                                    change('code', idPrefix + idParts![3].padStart(5, '0'));
                                }}
                                className={inputClass.replace('mt-2', 'mt-0') + ' min-w-0 flex-1'}
                              />
                            </div>
                          ) : key === 'unitCost' ? (
                            <input
                              id="stock-unitCost"
                              readOnly
                              value={unitCost}
                              className={inputClass + ' bg-blue-50'}
                            />
                          ) : key === 'notes' ? (
                            <textarea
                              id={'stock-' + key}
                              value={values[key]}
                              onChange={(event) => change(key, event.target.value)}
                              rows={3}
                              className={inputClass + ' h-auto resize-y'}
                            />
                          ) : (
                            <input
                              id={'stock-' + key}
                              name={key}
                              required={required}
                              type={isDate ? 'date' : 'text'}
                              inputMode={
                                key === 'quantity'
                                  ? 'numeric'
                                  : key === 'totalCost'
                                    ? 'decimal'
                                    : undefined
                              }
                              value={values[key]}
                              onChange={(event) => change(key, event.target.value)}
                              className={inputClass}
                            />
                          )}
                          {isDate && values[key] && (
                            <p className="mt-2 text-xs text-[#65758b]">{dateOnly(values[key])}</p>
                          )}
                          {key === 'quantity' && product && (
                            <p className="mt-2 text-xs text-[#65758b]">
                              หน่วยสินค้า: {product.unit}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </details>
              ))}
            </fieldset>
            {error && (
              <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-4">
              <div className="w-36 text-right">
                <button
                  type="button"
                  disabled={busy || Boolean(pending)}
                  onClick={() => setAlert('cancel')}
                  className="w-full rounded-lg border border-[#d9e3ee] px-5 py-2.5 text-sm poppins-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
              </div>
              <div className="w-36 text-right">
                <button
                  type="submit"
                  disabled={busy || Boolean(savedCode)}
                  className="w-full rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white hover:bg-[#174a8b] disabled:opacity-50"
                >
                  {busy ? 'กำลังบันทึก…' : pending ? 'ลองบันทึกอีกครั้ง' : 'บันทึก'}
                </button>
              </div>
            </div>
          </form>
        )
      )}
      <ConfirmationDialog
        isOpen={confirm}
        title="ยืนยันรับสินค้าเข้าคลัง"
        description={
          'รับ ' +
          (product?.name ?? '') +
          ' จำนวน ' +
          values.quantity +
          ' ' +
          (product?.unit ?? '') +
          ' เข้าคลัง ' +
          (options?.warehouses.find((item) => item.id === values.warehouseId)?.name ?? '') +
          ' เมื่อยืนยันจะเพิ่มยอดสต็อกจริง'
        }
        variant="primary"
        confirmLabel="ยืนยันรับเข้า"
        busyLabel="กำลังรับเข้า…"
        busy={busy}
        onCancel={() => {
          if (!busy) {
            setConfirm(false);
            if (!attempted.current) setPending(null);
          }
        }}
        onConfirm={receive}
      />
      <SuccessAlertComponent
        isOpen={alert !== null}
        title={alert === 'save' ? 'รับสินค้าเข้าแล้ว' : 'ยกเลิกการเพิ่มสต็อก'}
        description={
          alert === 'save'
            ? 'บันทึก ID ' + savedCode + ' และเพิ่มยอดเข้าคลังแล้ว'
            : 'ข้อมูลที่กรอกจะไม่ถูกบันทึก'
        }
        onClose={() => {
          setAlert(null);
          router.push('/products/stock');
          router.refresh();
        }}
      />
    </section>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const selected = options.find((item) => item.id === value);
  const matches = options.filter((item) =>
    (item.code + ' ' + item.name).toLowerCase().includes(search.toLowerCase()),
  );
  const items =
    selected && !matches.some((item) => item.id === selected.id) ? [selected, ...matches] : matches;
  return (
    <div id={id} className="mt-2">
      <SearchCombobox
        local
        statusModule="local-options"
        field={{ key: id, label, required: true }}
        value={value}
        onChange={onChange}
        invalid={false}
        options={items}
        search={search}
        offset={offset}
        loading={loading}
        error={error}
        more={false}
        setSearch={setSearch}
        setOffset={setOffset}
        setLoading={setLoading}
        setError={setError}
      />
    </div>
  );
}

const dateOnly = (value: string) =>
  new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    dateStyle: 'medium',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value.slice(0, 10) + 'T00:00:00+07:00'));
