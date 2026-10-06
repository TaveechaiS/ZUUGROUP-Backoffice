import { ProductError, uuidPattern } from './products';
import {
  PRODUCT_OPTION_FIELDS,
  PRODUCT_TEXT_FIELDS,
  PRODUCT_FILE_LIMIT,
  PRODUCT_IMAGE_TYPES,
  type ProductDraft,
} from '@/types/api/product-full';

export function fullDraft(body: unknown): ProductDraft {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new ProductError('ข้อมูลสินค้าไม่ถูกต้อง');
  const input = body as Record<string, unknown>;
  if (!input.fields || typeof input.fields !== 'object' || Array.isArray(input.fields))
    throw new ProductError('ข้อมูลสินค้าไม่ครบ');
  const source = input.fields as Record<string, unknown>;
  const allowed = new Set([...Object.keys(PRODUCT_OPTION_FIELDS), ...PRODUCT_TEXT_FIELDS]);
  if (Object.keys(source).some((key) => !allowed.has(key)))
    throw new ProductError('พบช่องข้อมูลที่ระบบไม่รองรับ');
  const fields: Record<string, string> = {};
  for (const label of allowed) {
    if (source[label] !== undefined && typeof source[label] !== 'string')
      throw new ProductError(`ข้อมูล${label}ไม่ถูกต้อง`);
    const value = (source[label] as string | undefined)?.trim() ?? '';
    if (value.length > (label.startsWith('ชื่อสินค้าเต็ม') ? 160 : 8000))
      throw new ProductError(`${label}ยาวเกินไป`);
    fields[label] = value;
  }
  for (const label of Object.keys(PRODUCT_OPTION_FIELDS)) {
    if (fields[label] && !uuidPattern.test(fields[label]))
      throw new ProductError(`กรุณาเลือก${label}จากรายการ`);
    if (fields[label]) fields[label] = fields[label].toLowerCase();
  }
  for (const label of ['กลุ่มรหัส', 'รูปแบบ', 'ประเภทผลิตภัณฑ์', 'หมวดหมู่สินค้า', 'หน่วยสินค้า']) {
    if (!fields[label]) throw new ProductError(`กรุณาเลือก${label}`);
  }
  if (!fields['ชื่อสินค้าเต็ม (ไทย)'] && !fields['ชื่อสินค้าเต็ม (ภาษาอังกฤษ)'])
    throw new ProductError('กรุณากรอกชื่อสินค้าเต็มอย่างน้อยหนึ่งภาษา');
  for (const label of ['ราคาขาย']) {
    if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(fields[label]))
      throw new ProductError(`${label}ต้องเป็นเลขตั้งแต่ 0 และทศนิยมไม่เกิน 2 ตำแหน่ง`);
  }
  const sequence =
    input.sequence === undefined || input.sequence === '' ? '' : String(input.sequence);
  if (sequence && (!/^\d{1,5}$/.test(sequence) || Number(sequence) < 1))
    throw new ProductError('เลขลำดับต้องอยู่ระหว่าง 1–99999');
  if (input.files !== undefined && !Array.isArray(input.files))
    throw new ProductError('รายการไฟล์ไม่ถูกต้อง');
  const files: ProductDraft['files'] = ((input.files as unknown[] | undefined) ?? []).map(
    (value) => {
      if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new ProductError('รายการไฟล์ไม่ถูกต้อง');
      const file = value as Record<string, unknown>;
      if (
        typeof file.id !== 'string' ||
        !uuidPattern.test(file.id) ||
        !['image', 'document'].includes(String(file.kind)) ||
        typeof file.name !== 'string' ||
        typeof file.type !== 'string' ||
        typeof file.digest !== 'string' ||
        !/^[a-f0-9]{64}$/.test(file.digest) ||
        !Number.isInteger(file.size) ||
        Number(file.size) < 1 ||
        Number(file.size) > PRODUCT_FILE_LIMIT
      )
        throw new ProductError('รายการไฟล์หรือขนาดไฟล์ไม่ถูกต้อง');
      if (
        !PRODUCT_IMAGE_TYPES.includes(file.type) &&
        !(
          file.kind === 'document' &&
          (file.type === 'application/pdf' || (!file.type && /\.pdf$/i.test(file.name)))
        )
      )
        throw new ProductError('ชนิดไฟล์ไม่รองรับ');
      return {
        id: file.id.toLowerCase(),
        kind: file.kind as 'image' | 'document',
        name: file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 255) || 'ไฟล์แนบ',
        type: file.type,
        size: Number(file.size),
        digest: file.digest,
      };
    },
  );
  if (new Set(files.map((file) => file.id)).size !== files.length)
    throw new ProductError('รหัสไฟล์แนบซ้ำ');
  return { fields, sequence: sequence ? sequence.padStart(5, '0') : '', files };
}
