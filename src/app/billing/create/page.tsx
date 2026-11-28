'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Get, Post } from '@/service/http';
import type { UninvoicedOrder } from '@/types/api/billing';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import {
  DateInput,
  FieldLabel,
  Item,
  Section,
  bangkokToday,
  dateOnly,
  inputClass,
  money,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

export default function Page() {
  const router = useRouter();
  const preset = useSearchParams().get('salesOrderId') ?? '';
  const [orders, setOrders] = useState<UninvoicedOrder[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [orderId, setOrderId] = useState(preset);
  const [issueDate, setIssueDate] = useState(bangkokToday());
  const [notes, setNotes] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<{ id: string; code: string } | null>(null);
  const commandKey = useRef(crypto.randomUUID());
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<{ data: UninvoicedOrder[] }>('/api/billing?view=uninvoiced', controller.signal)
      .then((response) => setOrders(response.data))
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [reload]);

  const order = orders?.find((item) => item.id === orderId);

  async function execute() {
    if (lock.current || !order) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await Post<{ data: { id: string; code: string } }>('/api/billing', {
        salesOrderId: order.id,
        issueDate,
        notes,
        idempotencyKey: commandKey.current,
      });
      setSaved(response.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setConfirm(false);
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="วางบิล"
      className="relative min-h-80 min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <h2 className="mb-6 text-lg poppins-semibold text-[#344256]">วางบิล</h2>
      {!orders ? (
        loadError ? (
          <div role="alert" className="flex gap-3 text-sm poppins-regular text-red-600">
            {loadError}
            <button
              type="button"
              onClick={() => {
                setLoadError('');
                setReload((value) => value + 1);
              }}
              className="text-[#1a58a7]"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          <LoadingComponent isVisible variant="content" label="กำลังโหลดคำสั่งซื้อ..." />
        )
      ) : !orders.length ? (
        <NotFoundComponent
          title="ไม่มีคำสั่งซื้อเสร็จสิ้นที่รอวางบิล"
          backLabel="กลับรายการใบแจ้งหนี้"
          onBack={() => router.push('/billing')}
        />
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!order) return setError('กรุณาเลือกคำสั่งซื้อ');
            if (!issueDate || issueDate > bangkokToday())
              return setError('วันที่ออกต้องไม่เกินวันนี้');
            setError('');
            setConfirm(true);
          }}
        >
          <fieldset disabled={busy || Boolean(saved)} className="min-w-0 space-y-9 border-0 p-0">
            <Section title="ข้อมูลใบแจ้งหนี้" open>
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <label className="min-w-0">
                  <FieldLabel text="คำสั่งซื้อ (เสร็จสิ้น ยังไม่วางบิล)" required />
                  <select
                    value={orderId}
                    onChange={(event) => {
                      setOrderId(event.target.value);
                      commandKey.current = crypto.randomUUID();
                    }}
                    className={inputClass}
                  >
                    <option value="">เลือกคำสั่งซื้อ</option>
                    {orders.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} · {item.customerName} · {money(item.amount)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="min-w-0">
                  <FieldLabel text="วันที่ออก" required />
                  <DateInput
                    label="วันที่ออก"
                    value={issueDate}
                    max={bangkokToday()}
                    onChange={(value) => {
                      setIssueDate(value);
                      commandKey.current = crypto.randomUUID();
                    }}
                  />
                </div>
              </div>
              {order && (
                <dl className="m-0 mt-5 grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg bg-[#f7f9fc] p-4 sm:grid-cols-3">
                  <Item label="ลูกค้า" value={order.customerName} />
                  <Item label="ยอดเรียกเก็บ (รวม VAT)" value={`${money(order.amount)} บาท`} />
                  <Item
                    label={`ครบกำหนด (เครดิต ${order.creditDays} วัน)`}
                    value={issueDate ? dateOnly(addDays(issueDate, order.creditDays)) : '—'}
                  />
                </dl>
              )}
            </Section>
            <Section title="หมายเหตุ">
              <textarea
                aria-label="หมายเหตุ"
                value={notes}
                rows={3}
                maxLength={1000}
                onChange={(event) => setNotes(event.target.value)}
                className={`${inputClass} mt-0 min-h-24 resize-y`}
              />
            </Section>
          </fieldset>
          {error && (
            <p role="alert" className="mt-6 text-sm poppins-regular text-red-600">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
            <button
              type="button"
              disabled={busy}
              onClick={() => router.push('/billing')}
              className={secondaryButton}
            >
              ยกเลิก
            </button>
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? 'กำลังบันทึก...' : 'ออกใบแจ้งหนี้'}
            </button>
          </div>
        </form>
      )}
      <ConfirmationDialog
        isOpen={confirm}
        title="ยืนยันออกใบแจ้งหนี้?"
        description="ยอดเรียกเก็บเท่ากับยอดคำสั่งซื้อ ครบกำหนดตามเครดิตของลูกค้า"
        variant="primary"
        confirmLabel="ยืนยัน"
        busyLabel="กำลังบันทึก..."
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void execute()}
      />
      <SuccessAlertComponent
        isOpen={Boolean(saved)}
        title={saved ? `ออกใบแจ้งหนี้ ${saved.code} แล้ว` : ''}
        onClose={() => {
          if (saved) router.push(`/billing/${saved.id}`);
        }}
      />
    </section>
  );
}
