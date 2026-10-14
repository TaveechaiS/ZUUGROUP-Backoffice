'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ChevronDown from '@/components/ui/chevron-down';
import NotFoundComponent from '@/components/ui/not-found-component';
import LoadingComponent from '@/components/ui/loading-component';
import StatusBadge from '@/components/ui/status-badge';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import { CUSTOMER_TEXT_FIELDS } from '@/config/customers';
import { Get, Update } from '@/service/http';
import type { CustomerRequestDetail } from '@/types/api/customer-requests';

type TextKey = keyof typeof CUSTOMER_TEXT_FIELDS;
type Action = 'approve' | 'return' | 'reject';
const dateTime = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Bangkok',
});
const date = new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
  dateStyle: 'medium',
  timeZone: 'Asia/Bangkok',
});
const confirmText: Record<Action, [string, string]> = {
  approve: ['ยืนยันอนุมัติและเพิ่มลูกค้า?', 'ระบบจะสร้างลูกค้าจากข้อมูลคำขอนี้ทันที'],
  return: ['ยืนยันส่งกลับแก้ไข?', 'ผู้ขอจะเห็นเหตุผลและส่งคำขอใหม่ได้'],
  reject: ['ยืนยันไม่อนุมัติ?', 'คำขอนี้จะปิดและไม่สร้างลูกค้า'],
};
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

export default function Page() {
  const params = useParams<{ id: string }>();
  const [request, setRequest] = useState<CustomerRequestDetail | null>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [version, setVersion] = useState(0);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: CustomerRequestDetail; actor: { roleId: string } }>(
      '/api/customer-requests/' + encodeURIComponent(params.id),
      controller.signal,
    )
      .then((response) => {
        if (controller.signal.aborted) return;
        setRequest(response.data);
        setRole(response.actor.roleId);
        setMissing(false);
        setLoading(false);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setMissing(e?.status === 404);
        setLoadError(e.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, [params.id, version]);

  async function execute(action: Action) {
    if (lock.current || !request) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await Update('/api/customer-requests/' + request.id, {
        action,
        reason,
        expectedUpdatedAt: request.updatedAt,
      });
      setNotice(
        action === 'approve'
          ? 'อนุมัติและเพิ่มลูกค้าแล้ว'
          : action === 'return'
            ? 'ส่งกลับแก้ไขแล้ว'
            : 'ไม่อนุมัติคำขอแล้ว',
      );
      setReason('');
      setLoading(true);
      setVersion((value) => value + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ทำรายการไม่สำเร็จ');
    } finally {
      setPending(null);
      lock.current = false;
      setBusy(false);
    }
  }

  if (missing && !loading)
    return (
      <NotFoundComponent
        title="ไม่พบคำขอ"
        onBack={() => history.back()}
        backLabel="กลับรายการคำขอ"
      />
    );
  if (!request)
    return (
      <section className="relative min-h-80 w-full px-4 py-6 md:px-6 md:py-8">
        <LoadingComponent isVisible={loading} variant="content" label="กำลังโหลดคำขอ..." />
        {loadError && (
          <p role="alert" className="text-sm text-red-600">
            {loadError}
          </p>
        )}
      </section>
    );
  const fields = request.draft.fields;
  const text = (key: TextKey) =>
    (key === 'licenseExpiresAt' && fields[key]
      ? date.format(new Date(`${fields[key]}T12:00:00+07:00`))
      : fields[key]) || '—';
  const admin = role === 'ADMIN';
  const waiting = request.status === 'รอตรวจสอบ';

  return (
    <section
      aria-label={`คำขอ ${request.name}`}
      className="min-w-0 w-full space-y-6 px-4 py-6 md:px-6 md:py-8"
    >
      <Link href="/customers/requests" className="text-sm text-[#1a58a7] hover:underline">
        ← กลับรายการคำขอ
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="mt-1 text-xl poppins-semibold break-words text-[#26364b]">
            {fields.name}
          </h1>
          <p className="mt-2 text-sm poppins-regular text-[#718096]">
            ขอโดย {request.requesterName} ({request.requesterRole}) · {request.territoryName} ·{' '}
            {dateTime.format(new Date(request.submittedAt))}
          </p>
        </div>
        <StatusBadge value={request.status} />
      </div>
      {request.reviewReason && (
        <div className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm">
          <p className="poppins-semibold text-orange-600">
            เหตุผล ({request.status}) · {request.reviewerName}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-[#344256]">{request.reviewReason}</p>
        </div>
      )}
      {request.status === 'ส่งกลับแก้ไข' && !admin && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-[#1a58a7]">
          แก้ไขตามเหตุผลแล้วส่งคำขอใหม่ได้ที่{' '}
          <Link href="/customers/create" className="poppins-semibold hover:underline">
            ส่งคำขอเพิ่มลูกค้า
          </Link>
        </p>
      )}
      {request.customerCode && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-[#344256]">
          เพิ่มเป็นลูกค้าแล้ว:{' '}
          <Link
            href={`/customers/${request.customerId}`}
            className="poppins-semibold text-[#1a58a7] hover:underline"
          >
            {request.customerCode}
          </Link>
        </div>
      )}
      {waiting && admin && (
        <div className="rounded-lg border border-[#d9e3ee] p-4 md:p-6">
          <h2 className="text-base poppins-semibold text-[#1a58a7]">ลูกค้าที่อาจซ้ำ</h2>
          {request.duplicates.length ? (
            <ul className="mt-3 list-none space-y-2 p-0 text-sm">
              {request.duplicates.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-2">
                  <StatusBadge value="ต้องตรวจสอบ" />
                  <Link
                    href={`/customers/${item.id}`}
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
          <Item label="ประเภทลูกค้า (กลุ่มรหัส)" value={request.codeGroupName} />
          <Item label={CUSTOMER_TEXT_FIELDS.name.label} value={fields.name} />
          <Item label="เขตขาย" value={request.territoryName} />
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
        {request.draft.shippingAddresses.length ? (
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-[#344256]">
            {request.draft.shippingAddresses.map((address) => (
              <li key={address.id}>
                <span className="poppins-medium">{address.name || 'ที่อยู่จัดส่ง'}</span>
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
          <Item label="ระยะเวลาเครดิต (Credit Term)" value={request.creditTermName || '—'} />
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
          <Item label="วันเริ่มนับเครดิต" value={request.creditStartName || '—'} />
        </Grid>
      </Box>
      <Box title="เอกสารแนบ">
        {request.files.length ? (
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-[#344256]">
            {request.files.map((file) => (
              <li key={file.id}>
                <span className="text-[#65758b]">{file.documentTypeName}: </span>
                {file.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm poppins-regular text-[#65758b]">ไม่มีเอกสารแนบ</p>
        )}
      </Box>
      {waiting && admin && (
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
          {error && (
            <p role="alert" className="mt-4 text-sm poppins-regular text-red-600">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={busy || !reason.trim()}
              onClick={() => setPending('reject')}
              className="rounded-lg border border-red-200 px-5 py-2.5 text-sm poppins-medium text-red-600 disabled:opacity-50"
            >
              ไม่อนุมัติ
            </button>
            <button
              type="button"
              disabled={busy || !reason.trim()}
              onClick={() => setPending('return')}
              className="rounded-lg border border-orange-200 px-5 py-2.5 text-sm poppins-medium text-orange-600 disabled:opacity-50"
            >
              ส่งกลับแก้ไข
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setPending('approve')}
              className="rounded-lg bg-[#1a58a7] px-5 py-2.5 text-sm poppins-medium text-white disabled:opacity-50"
            >
              อนุมัติและเพิ่มลูกค้า
            </button>
          </div>
        </div>
      )}
      <ConfirmationDialog
        isOpen={Boolean(pending)}
        title={pending ? confirmText[pending][0] : ''}
        description={pending ? confirmText[pending][1] : ''}
        variant={pending === 'approve' ? 'primary' : 'danger'}
        confirmLabel="ยืนยัน"
        busyLabel="กำลังบันทึก..."
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) void execute(pending);
        }}
      />
      <SuccessAlertComponent
        isOpen={Boolean(notice)}
        title={notice}
        onClose={() => setNotice('')}
      />
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
