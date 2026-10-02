import type { RecordModule } from '@/types/api/records';
export class RecordError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const uuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export function text(params: URLSearchParams, key: string) {
  const v = (params.get(key) ?? '').trim();
  if (v.length > 200) throw new RecordError(400, `${key} ยาวเกิน 200 ตัวอักษร`);
  return v;
}
export function integer(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
) {
  const v = params.get(key);
  if (v === null) return fallback;
  if (!/^\d+$/.test(v) || !Number.isSafeInteger(Number(v)) || Number(v) < min || Number(v) > max)
    throw new RecordError(400, `${key} ต้องเป็นจำนวนเต็ม ${min}–${max}`);
  return Number(v);
}
export function cleanBody(m: RecordModule, body: unknown, partial: boolean) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new RecordError(400, 'กรุณาส่ง JSON object');
  const input = body as Record<string, unknown>;
  const allowed = new Set([...m.fields.map((f) => f.key), 'expectedUpdatedAt']);
  if (Object.keys(input).some((k) => !allowed.has(k)))
    throw new RecordError(400, 'มีฟิลด์ที่ไม่รองรับ');
  const values: Record<string, string | null> = {};
  for (const f of m.fields) {
    if (!(f.key in input) && partial) continue;
    const raw = input[f.key] ?? '';
    if (typeof raw !== 'string' && typeof raw !== 'number')
      throw new RecordError(400, `${f.label} ไม่ถูกต้อง`);
    const v = String(raw).trim();
    if (v.length > (f.type === 'textarea' ? 4000 : 500))
      throw new RecordError(400, `${f.label} ยาวเกินกำหนด`);
    if (f.required && !v) throw new RecordError(400, `กรุณากรอก${f.label}`);
    if (f.type === 'number' && v && !/^\d{1,12}(\.\d{1,2})?$/.test(v))
      throw new RecordError(400, `${f.label} ต้องเป็นจำนวนไม่ติดลบและทศนิยมไม่เกิน 2 หลัก`);
    if (f.relation && v && !uuid(v))
      throw new RecordError(400, `${f.label} ต้องเป็น ID ที่ถูกต้อง`);
    if (f.key === 'fileUrl' && v) {
      try {
        const u = new URL(v);
        if (!['https:', 'http:'].includes(u.protocol)) throw new Error();
      } catch {
        throw new RecordError(400, 'ลิงก์ไฟล์ต้องเป็น http หรือ https');
      }
    }
    values[f.key] = (f.type === 'number' || f.relation) && !v ? null : v;
  }
  if (!Object.keys(values).length) throw new RecordError(400, 'ไม่มีข้อมูลที่แก้ไข');
  if (
    'expectedUpdatedAt' in input &&
    (typeof input.expectedUpdatedAt !== 'string' ||
      Number.isNaN(Date.parse(input.expectedUpdatedAt)))
  )
    throw new RecordError(400, 'expectedUpdatedAt ไม่ถูกต้อง');
  return { values, expected: input.expectedUpdatedAt as string | undefined };
}

export function recordReason(body: unknown) {
  const input =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const reason = String(input.reason ?? '').trim();
  if (reason.length > 1000) throw new RecordError(400, 'เหตุผลยาวเกินกำหนด');
  return reason;
}
