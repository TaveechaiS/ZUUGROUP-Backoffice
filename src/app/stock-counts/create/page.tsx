'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Get, Post } from '@/service/http';
import type { StockCountPage } from '@/types/api/stock-counts';
import LoadingComponent from '@/components/ui/loading-component';
import SuccessAlertComponent from '@/components/ui/success-alert-component';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import {
  FieldLabel,
  Section,
  inputClass,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

export default function Page() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<StockCountPage['warehouses'] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [warehouseId, setWarehouseId] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<{ id: string; code: string; lines: number } | null>(null);
  const commandKey = useRef(crypto.randomUUID());
  const lock = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Get<StockCountPage>('/api/stock-counts?limit=1', controller.signal)
      .then((response) => {
        setWarehouses(response.warehouses);
        setWarehouseId((current) => current || response.warehouses[0]?.id || '');
      })
      .catch((e) => {
        if (!controller.signal.aborted) setLoadError(e.message);
      });
    return () => controller.abort();
  }, [reload]);

  async function execute() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await Post<{ data: { id: string; code: string; lines: number } }>(
        '/api/stock-counts',
        { warehouseId, name, notes, idempotencyKey: commandKey.current },
      );
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
      aria-label="เริ่มรอบตรวจนับ"
      className="relative min-h-80 min-w-0 w-full px-4 py-6 md:px-6 md:py-8"
    >
      <h2 className="mb-6 text-lg poppins-semibold text-[#344256]">เริ่มรอบตรวจนับ</h2>
      {!warehouses ? (
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
          <LoadingComponent isVisible variant="content" label="กำลังโหลดคลัง..." />
        )
      ) : (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!warehouseId) return setError('กรุณาเลือกคลัง');
            setError('');
            setConfirm(true);
          }}
        >
          <fieldset disabled={busy || Boolean(saved)} className="min-w-0 space-y-9 border-0 p-0">
            <Section title="ข้อมูลรอบตรวจนับ" open>
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <label className="min-w-0">
                  <FieldLabel text="คลังที่ตรวจนับ" required />
                  <select
                    value={warehouseId}
                    onChange={(event) => {
                      setWarehouseId(event.target.value);
                      commandKey.current = crypto.randomUUID();
                    }}
                    className={inputClass}
                  >
                    {warehouses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0">
                  <FieldLabel text="ชื่อรอบ" />
                  <input
                    value={name}
                    maxLength={200}
                    placeholder="เช่น ตรวจนับสิ้นเดือน ต.ค."
                    onChange={(event) => {
                      setName(event.target.value);
                      commandKey.current = crypto.randomUUID();
                    }}
                    className={inputClass}
                  />
                </label>
                <label className="min-w-0 sm:col-span-2">
                  <FieldLabel text="หมายเหตุ" />
                  <textarea
                    value={notes}
                    rows={3}
                    maxLength={1000}
                    onChange={(event) => setNotes(event.target.value)}
                    className={`${inputClass} min-h-24 resize-y`}
                  />
                </label>
              </div>
              <p className="mt-4 text-sm text-[#718096]">
                ระบบดึงล็อตที่มีคงเหลือในคลังนี้ ณ เวลาเริ่มรอบเป็นยอดระบบ แล้วจึงคีย์จำนวนนับจริง
              </p>
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
              onClick={() => router.push('/stock-counts')}
              className={secondaryButton}
            >
              ยกเลิก
            </button>
            <button type="submit" disabled={busy} className={primaryButton}>
              {busy ? 'กำลังบันทึก...' : 'เริ่มรอบตรวจนับ'}
            </button>
          </div>
        </form>
      )}
      <ConfirmationDialog
        isOpen={confirm}
        title="ยืนยันเริ่มรอบตรวจนับ?"
        description="ยอดระบบจะถูกบันทึก ณ เวลานี้เพื่อใช้เทียบกับจำนวนนับจริง"
        variant="primary"
        confirmLabel="ยืนยัน"
        busyLabel="กำลังบันทึก..."
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void execute()}
      />
      <SuccessAlertComponent
        isOpen={Boolean(saved)}
        title={saved ? `เริ่มรอบ ${saved.code} แล้ว (${saved.lines} ล็อต)` : ''}
        onClose={() => {
          if (saved) router.push(`/stock-counts/${saved.id}`);
        }}
      />
    </section>
  );
}
