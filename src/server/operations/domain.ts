import { RecordError, uuid } from '@/server/validation/records';
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new RecordError(400, 'กรุณาส่งข้อมูลที่ถูกต้อง');
  return value as Record<string, unknown>;
}
export function str(value: unknown, label: string, required = true, max = 1000) {
  if (typeof value !== 'string' && value !== undefined)
    throw new RecordError(400, `${label}ไม่ถูกต้อง`);
  const v = String(value ?? '').trim();
  if ((required && !v) || v.length > max) throw new RecordError(400, `กรุณากรอก${label}ให้ถูกต้อง`);
  return v;
}
export function id(value: unknown, label = 'ID') {
  const v = str(value, label);
  if (!uuid(v)) throw new RecordError(400, `${label}ไม่ถูกต้อง`);
  return v;
}
export function qty(value: unknown, allowZero = false) {
  const n = Number(value);
  if (
    !Number.isSafeInteger(n) ||
    n < (allowZero ? 0 : 1) ||
    n > 100000000 ||
    value === '' ||
    value === null
  )
    throw new RecordError(400, 'จำนวนต้องเป็นจำนวนเต็มที่ถูกต้อง');
  return n;
}
export function cost(value: unknown) {
  const v = String(value ?? '');
  if (!/^\d{1,12}(\.\d{1,2})?$/.test(v))
    throw new RecordError(400, 'ต้นทุนต้องไม่ติดลบและทศนิยมไม่เกิน 2 หลัก');
  return v;
}
// TASK-275: per-line discount in baht (prices include VAT); missing means no discount.
export function discount(value: unknown) {
  const v = value === undefined || value === null || value === '' ? '0' : String(value);
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(v))
    throw new RecordError(400, 'ส่วนลดต้องไม่ติดลบและทศนิยมไม่เกิน 2 หลัก');
  return v;
}
export function day(value: unknown) {
  const v = str(value, 'วันที่');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
    Number.isNaN(Date.parse(v)) ||
    new Date(v).toISOString().slice(0, 10) !== v
  )
    throw new RecordError(400, 'วันที่ไม่ถูกต้อง');
  return v;
}
export function bangkokDay(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
export function addDays(date: string, days: number) {
  const value = new Date(date + 'T00:00:00Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function addMonths(date: string, months: number) {
  const [y, m, d] = date.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const end = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(d, end));
  return first.toISOString().slice(0, 10);
}
export function stockStatus(
  expires: string,
  condition: string,
  months: number,
  warningDays: number,
) {
  const today = bangkokDay();
  if (condition !== 'ปกติ') return 'เสื่อมสภาพ';
  if (expires <= today) return 'หมดอายุ';
  if (expires < addMonths(today, months)) return 'งดขาย';
  if ((Date.parse(expires) - Date.parse(today)) / 86400000 <= warningDays) return 'ใกล้หมดอายุ';
  return 'พร้อมขาย';
}
export function requestedLines(value: unknown) {
  if (!Array.isArray(value) || !value.length || value.length > 50)
    throw new RecordError(400, 'กรุณาเพิ่มสินค้า 1–50 รายการ');
  const lines = value.map((v) => {
    const b = object(v);
    return {
      productId: id(b.productId, 'สินค้า'),
      quantity: qty(b.quantity),
      discount: discount(b.discount),
    };
  });
  if (new Set(lines.map((l) => l.productId)).size !== lines.length)
    throw new RecordError(400, 'สินค้าในเอกสารต้องไม่ซ้ำกัน');
  return lines;
}
export const orderStates = {
  pending: 'รอตรวจ',
  approved: 'อนุมัติ',
  returned: 'ส่งกลับแก้ไข',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
} as const;
