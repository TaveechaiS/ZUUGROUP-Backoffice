'use client';

import { useRef, useState } from 'react';
import type { ReceiveOptions } from '@/types/api/operations';
import type { PromotionRow } from '@/types/api/promotions';
import { CloseIcon } from '@/components/icons/status-icons';
import {
  PROMOTION_MIN_TYPES,
  PROMOTION_REWARD_TYPES,
  PROMOTION_SAVE_STATUSES,
} from '@/config/promotions';
import {
  DateInput,
  FieldLabel,
  Section,
  bangkokToday,
  inputClass,
  money,
  primaryButton,
  secondaryButton,
} from '@/components/sales/document-ui';

export const rewardText = (
  row: Pick<PromotionRow, 'rewardType' | 'discountValue' | 'giftCount'>,
) =>
  row.rewardType === 'ของแถม'
    ? `ของแถม ${row.giftCount} รายการ`
    : row.rewardType === 'ส่วนลด%'
      ? `ส่วนลด ${Number(row.discountValue).toLocaleString('th-TH')}%`
      : `ส่วนลด ${money(row.discountValue)} บาท`;
export const conditionText = (row: Pick<PromotionRow, 'minType' | 'minValue'>) =>
  row.minType === 'จำนวน'
    ? `ครบ ${Number(row.minValue).toLocaleString('th-TH')} ชิ้น`
    : `ครบ ${money(row.minValue)} บาท`;

type GiftInput = { productId: string; quantity: string; warehouseId: string };
export type PromotionDraft = {
  name: string;
  status: string;
  startsOn: string;
  endsOn: string;
  minType: string;
  minValue: string;
  rewardType: string;
  discountValue: string;
  description: string;
  notes: string;
  productIds: string[];
  gifts: { productId: string; quantity: number; warehouseId: string }[];
  idempotencyKey: string;
};
export type PromotionInitial = Omit<PromotionDraft, 'gifts' | 'idempotencyKey'> & {
  code: string;
  gifts: GiftInput[];
};

export default function PromotionForm({
  options,
  initial,
  busy,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  options: ReceiveOptions;
  initial?: PromotionInitial;
  busy: boolean;
  error: string;
  submitLabel: string;
  onSubmit: (draft: PromotionDraft) => void;
  onCancel: () => void;
}) {
  const giftWarehouses = options.warehouses.filter((w) => w.code !== 'DISPOSAL');
  const defaultWarehouse =
    giftWarehouses.find((w) => w.code === 'MARKETING')?.id ?? giftWarehouses[0]?.id ?? '';
  const blankGift = (): GiftInput => ({
    productId: '',
    quantity: '1',
    warehouseId: defaultWarehouse,
  });
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    status: initial?.status ?? 'ใช้งาน',
    startsOn: initial?.startsOn ?? bangkokToday(),
    endsOn: initial?.endsOn ?? bangkokToday(30),
    minType: initial?.minType ?? 'จำนวน',
    minValue: initial?.minValue ?? '',
    rewardType: initial?.rewardType ?? 'ของแถม',
    discountValue: initial?.discountValue ?? '',
    description: initial?.description ?? '',
    notes: initial?.notes ?? '',
  });
  const [productIds, setProductIds] = useState<string[]>(
    initial?.productIds.length ? initial.productIds : [''],
  );
  const [gifts, setGifts] = useState<GiftInput[]>(
    initial?.gifts.length ? initial.gifts : [blankGift()],
  );
  const [invalid, setInvalid] = useState('');
  const commandKey = useRef(crypto.randomUUID());
  const touch = () => {
    commandKey.current = crypto.randomUUID();
    setInvalid('');
  };
  const set = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    touch();
  };
  const product = (id: string) => options.products.find((item) => item.id === id);
  const isGift = values.rewardType === 'ของแถม';

  function submit() {
    if (!values.name.trim()) return setInvalid('กรุณากรอกชื่อโปรโมชัน');
    if (!values.startsOn || !values.endsOn) return setInvalid('กรุณาระบุช่วงวันที่');
    if (values.endsOn < values.startsOn) return setInvalid('วันสิ้นสุดต้องไม่ก่อนวันเริ่ม');
    if (
      values.minType === 'จำนวน'
        ? !/^[1-9]\d*$/.test(values.minValue)
        : !/^\d{1,12}(\.\d{1,2})?$/.test(values.minValue) || Number(values.minValue) <= 0
    )
      return setInvalid(
        values.minType === 'จำนวน'
          ? 'จำนวนขั้นต่ำต้องเป็นจำนวนเต็มมากกว่า 0'
          : 'ยอดขั้นต่ำต้องมากกว่า 0',
      );
    if (
      !isGift &&
      (!/^\d{1,12}(\.\d{1,2})?$/.test(values.discountValue) || Number(values.discountValue) <= 0)
    )
      return setInvalid('ส่วนลดต้องมากกว่า 0');
    if (values.rewardType === 'ส่วนลด%' && Number(values.discountValue) > 100)
      return setInvalid('ส่วนลดเปอร์เซ็นต์ต้องไม่เกิน 100');
    const chosen = productIds.filter(Boolean);
    if (!chosen.length) return setInvalid('กรุณาเลือกสินค้าที่ร่วมรายการอย่างน้อย 1 รายการ');
    if (new Set(chosen).size !== chosen.length)
      return setInvalid('สินค้าที่ร่วมรายการต้องไม่ซ้ำกัน');
    if (isGift) {
      for (const [index, gift] of gifts.entries()) {
        if (!gift.productId) return setInvalid(`กรุณาเลือกของแถมบรรทัด ${index + 1}`);
        if (!/^[1-9]\d*$/.test(gift.quantity))
          return setInvalid(`จำนวนของแถมบรรทัด ${index + 1} ต้องเป็นจำนวนเต็มมากกว่า 0`);
        if (!gift.warehouseId) return setInvalid(`กรุณาเลือกคลังของแถมบรรทัด ${index + 1}`);
      }
      if (new Set(gifts.map((gift) => gift.productId)).size !== gifts.length)
        return setInvalid('ของแถมต้องไม่ซ้ำกัน');
    }
    onSubmit({
      ...values,
      name: values.name.trim(),
      discountValue: isGift ? '0' : values.discountValue,
      productIds: chosen,
      gifts: isGift ? gifts.map((gift) => ({ ...gift, quantity: Number(gift.quantity) })) : [],
      idempotencyKey: commandKey.current,
    });
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      aria-label={initial ? `แก้ไขโปรโมชัน ${initial.code}` : 'เพิ่มโปรโมชัน'}
    >
      <fieldset disabled={busy} className="min-w-0 space-y-9 border-0 p-0">
        <Section title="ข้อมูลโปรโมชัน" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text="รหัสโปรโมชัน" />
              <input
                value={initial?.code ?? 'ออกอัตโนมัติเมื่อบันทึก (PR-ปี-ลำดับ)'}
                disabled
                className={inputClass}
              />
            </label>
            <label className="min-w-0">
              <FieldLabel text="ชื่อโปรโมชัน" required />
              <input
                value={values.name}
                maxLength={200}
                placeholder="เช่น ซื้อครบ 10 กล่อง แถม 1"
                onChange={(event) => set('name', event.target.value)}
                className={inputClass}
              />
            </label>
            <div className="min-w-0">
              <FieldLabel text="วันเริ่ม" required />
              <DateInput
                label="วันเริ่ม"
                value={values.startsOn}
                onChange={(value) => set('startsOn', value)}
              />
            </div>
            <div className="min-w-0">
              <FieldLabel text="วันสิ้นสุด" required />
              <DateInput
                label="วันสิ้นสุด"
                value={values.endsOn}
                min={values.startsOn}
                onChange={(value) => set('endsOn', value)}
              />
            </div>
            <label className="min-w-0">
              <FieldLabel text="สถานะ" required />
              <select
                value={values.status}
                onChange={(event) => set('status', event.target.value)}
                className={inputClass}
              >
                {PROMOTION_SAVE_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0 sm:col-span-2">
              <FieldLabel text="รายละเอียด" />
              <textarea
                value={values.description}
                rows={3}
                maxLength={1000}
                onChange={(event) => set('description', event.target.value)}
                className={`${inputClass} min-h-24 resize-y`}
              />
            </label>
          </div>
        </Section>
        <Section title="เงื่อนไข" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text="ขั้นต่ำตาม" required />
              <select
                value={values.minType}
                onChange={(event) => set('minType', event.target.value)}
                className={inputClass}
              >
                {PROMOTION_MIN_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value === 'จำนวน' ? 'จำนวนรวมของสินค้าที่ร่วม' : 'มูลค่ารวม (บาท)'}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-0">
              <FieldLabel
                text={values.minType === 'จำนวน' ? 'จำนวนขั้นต่ำ' : 'ยอดขั้นต่ำ (บาท)'}
                required
              />
              <input
                type="number"
                min={values.minType === 'จำนวน' ? '1' : '0.01'}
                step={values.minType === 'จำนวน' ? '1' : '0.01'}
                value={values.minValue}
                onChange={(event) => set('minValue', event.target.value)}
                className={`${inputClass} text-right`}
              />
            </label>
          </div>
          <div className="mt-6">
            <FieldLabel text="สินค้าที่ร่วมรายการ" required />
            <ul className="mt-2 space-y-3">
              {productIds.map((productId, index) => (
                <li key={index} className="flex items-start gap-3">
                  <select
                    aria-label={`สินค้าที่ร่วมรายการ ${index + 1}`}
                    value={productId}
                    onChange={(event) => {
                      setProductIds((current) =>
                        current.map((value, i) => (i === index ? event.target.value : value)),
                      );
                      touch();
                    }}
                    className={`${inputClass} mt-0`}
                  >
                    <option value="">เลือกสินค้า</option>
                    {options.products.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} · {item.code}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`ลบสินค้าที่ร่วมรายการ ${index + 1}`}
                    title="ลบ"
                    disabled={productIds.length === 1}
                    onClick={() => {
                      setProductIds((current) => current.filter((_, i) => i !== index));
                      touch();
                    }}
                    className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-md text-red-600 hover:bg-red-50 disabled:text-[#c3cad5] disabled:hover:bg-transparent"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setProductIds((current) => [...current, '']);
                touch();
              }}
              className={`mt-4 ${secondaryButton}`}
            >
              + เพิ่มสินค้า
            </button>
          </div>
        </Section>
        <Section title="ของแถม / ส่วนลด" open>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <label className="min-w-0">
              <FieldLabel text="ประเภทรางวัล" required />
              <select
                value={values.rewardType}
                onChange={(event) => set('rewardType', event.target.value)}
                className={inputClass}
              >
                {PROMOTION_REWARD_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            {!isGift && (
              <label className="min-w-0">
                <FieldLabel
                  text={values.rewardType === 'ส่วนลด%' ? 'ส่วนลด (%)' : 'ส่วนลด (บาท)'}
                  required
                />
                <input
                  type="number"
                  min="0.01"
                  max={values.rewardType === 'ส่วนลด%' ? '100' : undefined}
                  step="0.01"
                  value={values.discountValue}
                  onChange={(event) => set('discountValue', event.target.value)}
                  className={`${inputClass} text-right`}
                />
              </label>
            )}
          </div>
          {isGift && (
            <>
              <div className="mt-6 overflow-x-auto rounded-lg border border-[#e3e9f0]">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm poppins-regular text-[#344256]">
                  <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
                    <tr>
                      <th scope="col" className="w-12 px-4 py-3 poppins-semibold">
                        #
                      </th>
                      <th scope="col" className="px-4 py-3 poppins-semibold">
                        ของแถม <span className="text-red-600">*</span>
                      </th>
                      <th scope="col" className="w-32 px-4 py-3 poppins-semibold">
                        จำนวน <span className="text-red-600">*</span>
                      </th>
                      <th scope="col" className="w-48 px-4 py-3 poppins-semibold">
                        ตัดจากคลัง <span className="text-red-600">*</span>
                      </th>
                      <th scope="col" className="w-16 px-4 py-3">
                        <span className="sr-only">ลบ</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {gifts.map((gift, index) => {
                      const selected = product(gift.productId);
                      const update = (patch: Partial<GiftInput>) => {
                        setGifts((current) =>
                          current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
                        );
                        touch();
                      };
                      return (
                        <tr key={index} className="border-t border-[#edf0f4]">
                          <td className="px-4 py-3 pt-6 align-top">{index + 1}</td>
                          <td className="px-4 py-3 align-top">
                            <select
                              aria-label={`ของแถม ${index + 1}`}
                              value={gift.productId}
                              onChange={(event) => update({ productId: event.target.value })}
                              className={inputClass}
                            >
                              <option value="">เลือกสินค้า</option>
                              {options.products.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} · {item.code}
                                </option>
                              ))}
                            </select>
                            {selected && (
                              <p className="mt-1 text-xs text-[#718096]">หน่วย: {selected.unit}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              aria-label={`จำนวนของแถม ${index + 1}`}
                              value={gift.quantity}
                              onChange={(event) => update({ quantity: event.target.value })}
                              className={`${inputClass} text-right`}
                            />
                          </td>
                          <td className="px-4 py-3 align-top">
                            <select
                              aria-label={`คลังของแถม ${index + 1}`}
                              value={gift.warehouseId}
                              onChange={(event) => update({ warehouseId: event.target.value })}
                              className={inputClass}
                            >
                              {giftWarehouses.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 pt-4 text-right align-top">
                            <button
                              type="button"
                              aria-label={`ลบของแถมบรรทัด ${index + 1}`}
                              title="ลบบรรทัด"
                              disabled={gifts.length === 1}
                              onClick={() => {
                                setGifts((current) => current.filter((_, i) => i !== index));
                                touch();
                              }}
                              className="inline-grid h-9 w-9 place-items-center rounded-md text-red-600 hover:bg-red-50 disabled:text-[#c3cad5] disabled:hover:bg-transparent"
                            >
                              <CloseIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGifts((current) => [...current, blankGift()]);
                  touch();
                }}
                className={`mt-4 ${secondaryButton}`}
              >
                + เพิ่มของแถม
              </button>
            </>
          )}
        </Section>
        <Section title="หมายเหตุ" open={Boolean(initial?.notes)}>
          <textarea
            aria-label="หมายเหตุ"
            value={values.notes}
            rows={3}
            maxLength={1000}
            onChange={(event) => set('notes', event.target.value)}
            className={`${inputClass} mt-0 min-h-24 resize-y`}
          />
        </Section>
      </fieldset>
      {(invalid || error) && (
        <p role="alert" className="mt-6 text-sm poppins-regular text-red-600">
          {invalid || error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[#d9e3ee] pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className={secondaryButton}
        >
          ยกเลิก
        </button>
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? 'กำลังบันทึก...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
