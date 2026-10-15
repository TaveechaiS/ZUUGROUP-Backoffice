'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChevronDown from '@/components/ui/chevron-down';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import StatusBadge from '@/components/ui/status-badge';
import { Delete, Get, HttpError, Update } from '@/service/http';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import {
  CUSTOMER_TEXT_FIELDS,
  SHIPPING_FIELDS,
  customerListStatus,
  licenseExpiry,
} from '@/config/customers';
import type { CustomerDetailResponse } from '@/types/api/customers';
import { inputClass, primaryButtonClass, secondaryButtonClass } from '@/components/ui/form-classes';

type Customer = CustomerDetailResponse['data'];
type TextKey = keyof typeof CUSTOMER_TEXT_FIELDS;

const date = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeZone: 'Asia/Bangkok',
});
const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
const money = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });
const showDate = (value: string) => (value ? date.format(new Date(`${value}T12:00:00+07:00`)) : '');

const sections: { title: string; keys: TextKey[] }[] = [
  {
    title: 'ข้อมูลติดต่อ',
    keys: [
      'contactName',
      'phone',
      'email',
      'accountingContactName',
      'accountingPhone',
      'accountingEmail',
    ],
  },
  {
    title: 'ข้อมูลภาษีและที่อยู่ออกบิล',
    keys: [
      'taxId',
      'vatStatus',
      'branchType',
      'branchNumber',
      'billingAddress',
      'billingSubdistrict',
      'billingDistrict',
      'billingProvince',
      'billingPostcode',
    ],
  },
  {
    title: 'ใบอนุญาตและผู้ประกอบวิชาชีพ',
    keys: [
      'licenseType',
      'licenseNumber',
      'licenseLocation',
      'licenseExpiresAt',
      'licenseStatus',
      'licenseVerifiedBy',
      'licenseVerifiedAt',
      'profession',
      'professionalName',
      'professionalLicenseNumber',
    ],
  },
];

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deleted?: string | string[] }>;
}) {
  const { id } = use(params);
  const deletedView = use(searchParams).deleted === 'true';
  const router = useRouter();
  const lock = useRef(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [reason, setReason] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  function retry() {
    setLoading(true);
    setError('');
    setMissing(false);
    setRefresh((v) => v + 1);
  }

  useEffect(() => {
    const controller = new AbortController();
    Get<CustomerDetailResponse>(
      '/api/customers/' + encodeURIComponent(id) + (deletedView ? '?deleted=true' : ''),
      controller.signal,
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setCustomer(result.data);
        setCanWrite(result.config.canWrite);
      })
      .catch((e: Error) => {
        if (controller.signal.aborted) return;
        if (e instanceof HttpError && e.status === 404) setMissing(true);
        else setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, refresh, deletedView]);

  async function run(action: 'delete' | 'restore') {
    if (lock.current || !customer) return;
    lock.current = true;
    setBusy(true);
    setActionError('');
    try {
      if (action === 'delete')
        await Delete('/api/customers/' + customer.id, { reason: reason.trim() });
      else await Update('/api/customers/' + customer.id, { action: 'restore' });
      setConfirming(false);
      setMessage(
        action === 'delete'
          ? `ลบลูกค้า ${customer.code} แล้ว`
          : `กู้คืนลูกค้า ${customer.code} แล้ว`,
      );
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'ดำเนินการไม่สำเร็จ');
      setConfirming(false);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (loading)
    return (
      <section className="relative min-h-80 w-full">
        <LoadingComponent isVisible variant="content" label="กำลังโหลดข้อมูลลูกค้า..." />
      </section>
    );
  if (missing || (!customer && !error))
    return (
      <NotFoundComponent title="ไม่พบลูกค้า" onRefresh={retry} onBack={() => history.back()} />
    );
  if (error || !customer)
    return (
      <div role="alert" className="flex gap-3 p-6 text-sm poppins-regular text-red-600">
        {error}
        <button type="button" onClick={retry} className="text-[#1a58a7]">
          ลองใหม่
        </button>
      </div>
    );

  const fields = customer.details.fields;
  const expiry = licenseExpiry(customer.licenseExpiresAt);
  const text = (key: TextKey) =>
    (key === 'licenseExpiresAt' || key === 'licenseVerifiedAt'
      ? showDate(fields[key])
      : fields[key]) || '—';

  return (
    <section
      aria-label={`ลูกค้า ${customer.code}`}
      className="min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm poppins-medium text-[#1a58a7]">{customer.code}</p>
          <h2 className="mt-1 text-lg poppins-semibold break-words text-[#344256]">
            {customer.name}
          </h2>
          <p className="mt-2 text-sm poppins-regular text-[#718096]">
            {customer.codeGroup?.name ?? '—'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={customerListStatus(customer)} />
          {expiry && !customer.deletedAt && customer.status === 'ใช้งาน' && (
            <span
              className={`text-sm poppins-medium ${expiry.days < 0 ? 'text-red-600' : 'text-orange-600'}`}
            >
              {expiry.detail}
            </span>
          )}
        </div>
      </div>
      <div className="space-y-6">
        <Box title="ข้อมูลทั่วไป" open>
          <Grid>
            <Item label="รหัสลูกค้า" value={customer.code} />
            <Item label="ประเภทลูกค้า (กลุ่มรหัส)" value={customer.codeGroup?.name ?? '—'} />
            <Item label={CUSTOMER_TEXT_FIELDS.name.label} value={customer.name} />
            <Item label="สถานะลูกค้า" value={customer.status} />
            <Item label="เขตขาย" value={customer.territoryName ?? '—'} />
            <Item label={CUSTOMER_TEXT_FIELDS.notes.label} value={fields.notes || '—'} wide />
          </Grid>
        </Box>
        {sections.map((section) => (
          <Box key={section.title} title={section.title}>
            <Grid>
              {section.keys.map((key) => (
                <Item
                  key={key}
                  label={CUSTOMER_TEXT_FIELDS[key].label}
                  value={text(key)}
                  wide={key === 'billingAddress'}
                />
              ))}
            </Grid>
          </Box>
        ))}
        <Box title="ที่อยู่จัดส่งสินค้า">
          {customer.details.shippingAddresses.length ? (
            <div className="space-y-4">
              {customer.details.shippingAddresses.map((address, index) => (
                <div key={address.id} className="rounded-lg border border-[#e3e9f0] p-4">
                  <p className="mb-3 text-sm poppins-semibold text-[#344256]">
                    ที่อยู่จัดส่งแห่งที่ {index + 1}
                    {address.isDefault && (
                      <span className="ml-2 text-xs poppins-medium text-[#1a58a7]">(เริ่มต้น)</span>
                    )}
                  </p>
                  <Grid>
                    {Object.entries(SHIPPING_FIELDS).map(([key, field]) => (
                      <Item
                        key={key}
                        label={field.label}
                        value={address[key as keyof typeof SHIPPING_FIELDS] || '—'}
                        wide={key === 'address'}
                      />
                    ))}
                  </Grid>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm poppins-regular text-[#65758b]">ยังไม่มีที่อยู่จัดส่ง</p>
          )}
        </Box>
        <Box title="เครดิตและการวางบิล">
          <Grid>
            <Item label="ระยะเวลาเครดิต (Credit Term)" value={customer.creditTerm?.name ?? '—'} />
            <Item
              label={CUSTOMER_TEXT_FIELDS.creditLimit.label}
              value={
                customer.creditLimit === null
                  ? '—'
                  : `${money.format(Number(customer.creditLimit))} บาท`
              }
            />
            <Item
              label={CUSTOMER_TEXT_FIELDS.billingCycle.label}
              value={fields.billingCycle || '—'}
            />
            <Item label="วันเริ่มนับเครดิต" value={customer.creditStart?.name ?? '—'} />
          </Grid>
        </Box>
        <Box title="เอกสารแนบ">
          {customer.details.files.length ? (
            <ul className="m-0 list-none space-y-2 p-0">
              {customer.details.files.map((file) => (
                <li key={file.id} className="text-sm poppins-regular text-[#344256]">
                  <span className="text-[#65758b]">{file.documentTypeName}: </span>
                  <a
                    href={`/api/customers/files/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-words text-[#1a58a7] underline-offset-2 hover:underline"
                  >
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm poppins-regular text-[#65758b]">ยังไม่มีเอกสารแนบ</p>
          )}
        </Box>
        <Box title="ประวัติข้อมูล">
          <Grid>
            <Item label="ผู้สร้าง" value={customer.history.createdBy ?? '—'} />
            <Item label="วันที่สร้าง" value={dateTime.format(new Date(customer.createdAt))} />
            <Item label="ผู้แก้ไขล่าสุด" value={customer.history.updatedBy ?? '—'} />
            <Item
              label="วันที่แก้ไขล่าสุด"
              value={dateTime.format(new Date(customer.history.updatedAt ?? customer.updatedAt))}
            />
            {customer.deletedAt && (
              <Item label="เหตุผลการลบ" value={customer.deleteReason ?? '—'} wide />
            )}
          </Grid>
        </Box>
      </div>
      {canWrite && !customer.deletedAt && (
        <div className="mt-6 rounded-lg border border-red-100 p-4 md:p-6">
          <h3 className="text-base poppins-semibold text-red-600">ลบลูกค้า</h3>
          <p className="mt-2 text-sm poppins-regular text-[#65758b]">
            ลูกค้าจะถูกซ่อนจากรายการและเลือกใช้ในเอกสารใหม่ไม่ได้ Admin กู้คืนได้ในแท็บ ลบแล้ว
          </p>
          <label className="mt-4 block text-sm poppins-medium text-[#344256]">
            เหตุผลการลบ
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={500}
              rows={2}
              className={`mt-2 ${inputClass}`}
            />
          </label>
          <button
            type="button"
            disabled={busy || !reason.trim()}
            onClick={() => setConfirming(true)}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm poppins-medium text-white disabled:opacity-50"
          >
            ลบลูกค้า
          </button>
        </div>
      )}
      {actionError && (
        <p role="alert" className="mt-4 text-sm poppins-regular text-red-600">
          {actionError}
        </p>
      )}
      <ConfirmationDialog
        isOpen={confirming}
        title={`ลบลูกค้า ${customer.code}?`}
        description={`เหตุผล: ${reason.trim()} — กู้คืนได้ภายหลัง`}
        busy={busy}
        onCancel={() => setConfirming(false)}
        onConfirm={() => void run('delete')}
      />
      <SuccessAlertComponent
        isOpen={Boolean(message)}
        title={message}
        onClose={() => {
          setMessage('');
          router.push(customer.deletedAt ? `/customers/${customer.id}` : '/customers');
        }}
      />
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
        {canWrite && customer.deletedAt && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run('restore')}
            className={`${primaryButtonClass} min-w-36`}
          >
            กู้คืน
          </button>
        )}
        {canWrite && !customer.deletedAt && (
          <Link
            href={`/customers/${customer.id}/edit`}
            className={`${primaryButtonClass} min-w-36 text-center text-white!`}
          >
            แก้ไข
          </Link>
        )}
        <Link
          href={customer.deletedAt ? '/customers?tab=deleted' : '/customers'}
          className={`${secondaryButtonClass} min-w-36`}
        >
          กลับ
        </Link>
      </div>
    </section>
  );
}

function Box({
  title,
  open = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={open} className="group rounded-lg border border-[#d9e3ee] p-4 md:p-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1a58a7] [&::-webkit-details-marker]:hidden">
        <h3 className="text-base poppins-semibold text-[#1a58a7]">{title}</h3>
        <ChevronDown className="shrink-0 text-[#1A58A7] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <dl className="m-0 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">{children}</dl>;
}

function Item({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="text-xs poppins-medium text-[#65758b]">{label}</dt>
      <dd className="m-0 mt-1 whitespace-pre-line break-words text-sm poppins-regular text-[#344256]">
        {value}
      </dd>
    </div>
  );
}
