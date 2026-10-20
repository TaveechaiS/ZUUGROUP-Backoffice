import { RecordError } from './records';

export function day(value: unknown) {
  if (typeof value !== 'string' && value !== undefined)
    throw new RecordError(400, 'วันที่ไม่ถูกต้อง');
  const v = String(value ?? '').trim();
  if (!v || v.length > 1000) throw new RecordError(400, 'กรุณากรอกวันที่ให้ถูกต้อง');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
    Number.isNaN(Date.parse(v)) ||
    new Date(v).toISOString().slice(0, 10) !== v
  )
    throw new RecordError(400, 'วันที่ไม่ถูกต้อง');
  return v;
}

export function addDays(date: string, days: number) {
  const value = new Date(date + 'T00:00:00Z');
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
