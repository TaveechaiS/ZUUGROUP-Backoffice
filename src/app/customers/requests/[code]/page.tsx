'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import ChevronDown from '@/components/ui/chevron-down';
import NotFoundComponent from '@/components/ui/not-found-component';
import StatusBadge from '@/components/ui/status-badge';
import { CUSTOMER_TEXT_FIELDS } from '@/config/customers';
import { SAMPLE_REQUESTS } from '../request-data';

type TextKey = keyof typeof CUSTOMER_TEXT_FIELDS;
const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
const date = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeZone: 'Asia/Bangkok',
});
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
      'profession',
      'professionalName',
      'professionalLicenseNumber',
    ],
  },
];

export default function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const request = SAMPLE_REQUESTS.find((item) => item.code === decodeURIComponent(code));
  const [reason, setReason] = useState('');
  if (!request)
    return (
      <NotFoundComponent
        title="ไม่พบคำขอ"
        onBack={() => history.back()}
        backLabel="กลับรายการคำขอ"
      />
    );
  const fields = request.fields;
  const text = (key: TextKey) =>
    (key === 'licenseExpiresAt' && fields[key]
      ? date.format(new Date(`${fields[key]}T12:00:00+07:00`))
      : fields[key]) || '—';

  return (
    <section
      aria-label={`คำขอ ${request.code}`}
      className="min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/customers/requests" className="text-sm text-[#1a58a7] hover:underline">
        ← กลับรายการคำขอ
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm poppins-medium text-[#1a58a7]">{request.code}</p>
          <h1 className="mt-1 text-xl poppins-semibold break-words text-[#26364b]">
            {fields.name}
          </h1>
          <p className="mt-2 text-sm poppins-regular text-[#718096]">
            ขอโดย {request.requester.name} ({request.requester.role}) · {request.territory} ·{' '}
            {dateTime.format(new Date(request.submittedAt))}
          </p>
        </div>
        <StatusBadge value={request.status} />
      </div>
      <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm poppins-regular text-[#1a58a7]">
        ตัวอย่างหน้าจอ — ข้อมูลสมมุติ ปุ่มดำเนินการจะใช้งานได้เมื่อเชื่อมคำขอจาก Sales / Manager
      </p>
      {request.reason && (
        <div className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm">
          <p className="poppins-semibold text-orange-600">เหตุผล ({request.status})</p>
          <p className="mt-1 whitespace-pre-wrap text-[#344256]">{request.reason}</p>
        </div>
      )}
      {request.customerCode && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-[#344256]">
          เพิ่มเป็นลูกค้าแล้ว:{' '}
          <Link
            href={`/customers?search=${request.customerCode}`}
            className="poppins-semibold text-[#1a58a7] hover:underline"
          >
            {request.customerCode}
          </Link>
        </div>
      )}
      {request.status === 'รอตรวจสอบ' && (
        <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
          <h2 className="text-base poppins-semibold text-[#1a58a7]">ลูกค้าที่อาจซ้ำ</h2>
          {request.duplicates.length ? (
            <ul className="mt-3 list-none space-y-2 p-0 text-sm">
              {request.duplicates.map((item) => (
                <li key={item.code} className="flex flex-wrap items-center gap-2">
                  <StatusBadge value="ต้องตรวจสอบ" />
                  <Link
                    href={`/customers?search=${item.code}`}
                    className="poppins-medium text-[#1a58a7] hover:underline"
                  >
                    {item.code} {item.name}
                  </Link>
                  <span className="text-[#65758b]">— {item.reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm poppins-regular text-[#65758b]">
              ไม่พบลูกค้าที่เลขภาษี ชื่อ หรือเบอร์โทรตรงกัน
            </p>
          )}
        </div>
      )}
      <Box title="ข้อมูลทั่วไป" open>
        <Grid>
          <Item label="ประเภทลูกค้า (กลุ่มรหัส)" value={request.codeGroup} />
          <Item label={CUSTOMER_TEXT_FIELDS.name.label} value={fields.name} />
          <Item label="เขตขาย" value={request.territory} />
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
        {request.shippingAddresses.length ? (
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-[#344256]">
            {request.shippingAddresses.map((address) => (
              <li key={address.name}>
                <span className="poppins-medium">{address.name}</span>
                {address.isDefault && (
                  <span className="ml-2 text-xs text-[#1a58a7]">(เริ่มต้น)</span>
                )}
                <span className="text-[#65758b]">
                  {' '}
                  — {address.address} {address.province}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm poppins-regular text-[#65758b]">ไม่ได้ระบุที่อยู่จัดส่ง</p>
        )}
      </Box>
      <Box title="เครดิตและการวางบิล">
        <Grid>
          <Item label="ระยะเวลาเครดิต (Credit Term)" value={request.creditTerm || '—'} />
          <Item
            label={CUSTOMER_TEXT_FIELDS.creditLimit.label}
            value={
              fields.creditLimit ? `${Number(fields.creditLimit).toLocaleString('th-TH')} บาท` : '—'
            }
          />
          <Item
            label={CUSTOMER_TEXT_FIELDS.billingCycle.label}
            value={fields.billingCycle || '—'}
          />
          <Item label="วันเริ่มนับเครดิต" value={request.creditStart || '—'} />
        </Grid>
      </Box>
      <Box title="เอกสารแนบ">
        {request.files.length ? (
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-[#344256]">
            {request.files.map((file) => (
              <li key={file.name}>
                <span className="text-[#65758b]">{file.type}: </span>
                {file.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm poppins-regular text-[#65758b]">ไม่มีเอกสารแนบ</p>
        )}
      </Box>
      <Box title="ประวัติคำขอ" open>
        <ol className="m-0 list-none space-y-3 p-0 text-sm">
          {request.history.map((entry) => (
            <li key={entry.at + entry.action} className="border-l-2 border-[#d9e3ee] pl-4">
              <p className="poppins-medium text-[#344256]">
                {entry.action} · {entry.actor}
              </p>
              <p className="text-xs text-[#65758b]">{dateTime.format(new Date(entry.at))}</p>
              {entry.note && <p className="mt-1 text-[#344256]">{entry.note}</p>}
            </li>
          ))}
        </ol>
      </Box>
      {request.status === 'รอตรวจสอบ' && (
        <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
          <h2 className="text-base poppins-semibold text-[#1a58a7]">ดำเนินการคำขอ</h2>
          <label className="mt-4 block text-sm poppins-medium text-[#344256]">
            เหตุผล (บังคับเมื่อส่งกลับแก้ไขหรือไม่อนุมัติ)
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={2}
              maxLength={1000}
              className="mt-2 block w-full rounded-md border border-[#d9e3ee] bg-white px-3 py-2.5 text-sm poppins-regular text-[#344256] outline-none focus:border-[#1a58a7]"
            />
          </label>
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled
              title="ใช้งานได้เมื่อเชื่อมข้อมูลคำขอ"
              className="rounded-lg border border-red-200 px-5 py-2.5 text-sm poppins-medium text-red-600 disabled:opacity-50"
            >
              ไม่อนุมัติ
            </button>
            <button
              type="button"
              disabled
              title="ใช้งานได้เมื่อเชื่อมข้อมูลคำขอ"
              className="rounded-lg border border-orange-200 px-5 py-2.5 text-sm poppins-medium text-orange-600 disabled:opacity-50"
            >
              ส่งกลับแก้ไข
            </button>
            <button
              type="button"
              disabled
              title="ใช้งานได้เมื่อเชื่อมข้อมูลคำขอ"
              className="rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white disabled:opacity-50"
            >
              อนุมัติและเพิ่มลูกค้า
            </button>
          </div>
          <p className="mt-3 text-right text-xs poppins-regular text-[#65758b]">
            อนุมัติแล้วจะเปิดฟอร์มเพิ่มลูกค้าที่เติมข้อมูลจากคำขอให้ตรวจและเลือกเลขรันก่อนบันทึก
          </p>
        </div>
      )}
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
        <h2 className="text-base poppins-semibold text-[#1a58a7]">{title}</h2>
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
