import { uuidPattern } from './products';
import { CustomerError } from './customer-error';
import {
  CUSTOMER_FILE_LIMIT,
  CUSTOMER_IMAGE_TYPES,
  CUSTOMER_OPTION_FIELDS,
  CUSTOMER_TEXT_FIELDS,
  SHIPPING_FIELDS,
  SHIPPING_LIMIT,
} from '@/config/customers';
import type { CustomerDraft, ShippingAddress } from '@/types/api/customers';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function object(value: unknown, message: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new CustomerError(message);
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, max: number) {
  if (value !== undefined && typeof value !== 'string')
    throw new CustomerError(`ข้อมูล${label}ไม่ถูกต้อง`);
  const result = ((value as string | undefined) ?? '').replace(/[\u0000-\u001f]/g, (c) =>
    c === '\n' ? c : ' ',
  );
  const trimmed = result.trim();
  if ([...trimmed].length > max) throw new CustomerError(`${label}ยาวเกิน ${max} ตัวอักษร`);
  return trimmed;
}
function validDate(value: string) {
  if (!datePattern.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function customerDraft(body: unknown): CustomerDraft {
  const input = object(body, 'ข้อมูลลูกค้าไม่ถูกต้อง');
  const allowedKeys = new Set(['codeGroupId', 'sequence', 'fields', 'shippingAddresses', 'files']);
  if (Object.keys(input).some((key) => !allowedKeys.has(key)))
    throw new CustomerError('พบช่องข้อมูลที่ระบบไม่รองรับ');
  if (typeof input.codeGroupId !== 'string' || !uuidPattern.test(input.codeGroupId))
    throw new CustomerError('กรุณาเลือกกลุ่มรหัสลูกค้า');
  const sequence =
    input.sequence === undefined || input.sequence === '' ? '' : String(input.sequence);
  if (sequence && (!/^\d{1,6}$/.test(sequence) || Number(sequence) < 1))
    throw new CustomerError('เลขรันต้องเป็นตัวเลข 1–999999');

  const source = object(input.fields, 'ข้อมูลลูกค้าไม่ครบ');
  const known = new Set([
    ...Object.keys(CUSTOMER_TEXT_FIELDS),
    ...Object.keys(CUSTOMER_OPTION_FIELDS),
  ]);
  if (Object.keys(source).some((key) => !known.has(key)))
    throw new CustomerError('พบช่องข้อมูลที่ระบบไม่รองรับ');
  const fields = {} as CustomerDraft['fields'];
  for (const [key, field] of Object.entries(CUSTOMER_TEXT_FIELDS)) {
    const value = text(source[key], field.label, field.max);
    if ('required' in field && field.required && !value)
      throw new CustomerError(`กรุณากรอก${field.label}`);
    if ('choices' in field && value && !(field.choices as readonly string[]).includes(value))
      throw new CustomerError(`กรุณาเลือก${field.label}จากรายการ`);
    fields[key as keyof typeof CUSTOMER_TEXT_FIELDS] = value;
  }
  fields.customerStatus ||= 'ใช้งาน';
  for (const [key, label] of Object.entries(CUSTOMER_OPTION_FIELDS)) {
    const value = text(source[key], label, 36).toLowerCase();
    if (value && !uuidPattern.test(value)) throw new CustomerError(`กรุณาเลือก${label}จากรายการ`);
    fields[key as keyof typeof CUSTOMER_OPTION_FIELDS] = value;
  }
  if (!/^\d{13}$/.test(fields.taxId))
    throw new CustomerError('เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลขครบ 13 หลัก');
  for (const key of ['email', 'accountingEmail'] as const)
    if (fields[key] && !emailPattern.test(fields[key]))
      throw new CustomerError(`รูปแบบ${CUSTOMER_TEXT_FIELDS[key].label}ไม่ถูกต้อง`);
  for (const key of ['licenseExpiresAt', 'licenseVerifiedAt'] as const)
    if (fields[key] && !validDate(fields[key]))
      throw new CustomerError(`${CUSTOMER_TEXT_FIELDS[key].label}ไม่ถูกต้อง`);
  if (
    fields.creditLimit &&
    (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/.test(fields.creditLimit.replaceAll(',', '')) ||
      Number(fields.creditLimit.replaceAll(',', '')) > 999999999999.99)
  )
    throw new CustomerError('วงเงินเครดิตต้องเป็นตัวเลขตั้งแต่ 0 และทศนิยมไม่เกิน 2 ตำแหน่ง');
  fields.creditLimit = fields.creditLimit.replaceAll(',', '');

  if (input.shippingAddresses !== undefined && !Array.isArray(input.shippingAddresses))
    throw new CustomerError('ที่อยู่จัดส่งไม่ถูกต้อง');
  const rawAddresses = (input.shippingAddresses as unknown[] | undefined) ?? [];
  if (rawAddresses.length > SHIPPING_LIMIT)
    throw new CustomerError(`ที่อยู่จัดส่งได้ไม่เกิน ${SHIPPING_LIMIT} แห่ง`);
  const shippingAddresses: ShippingAddress[] = rawAddresses
    .map((value) => {
      const address = object(value, 'ที่อยู่จัดส่งไม่ถูกต้อง');
      const allowed = new Set(['id', 'isDefault', ...Object.keys(SHIPPING_FIELDS)]);
      if (Object.keys(address).some((key) => !allowed.has(key)))
        throw new CustomerError('พบช่องที่อยู่จัดส่งที่ระบบไม่รองรับ');
      if (typeof address.id !== 'string' || !uuidPattern.test(address.id))
        throw new CustomerError('รหัสที่อยู่จัดส่งไม่ถูกต้อง');
      if (address.isDefault !== undefined && typeof address.isDefault !== 'boolean')
        throw new CustomerError('ค่าที่อยู่จัดส่งเริ่มต้นไม่ถูกต้อง');
      const result = {
        id: address.id.toLowerCase(),
        isDefault: Boolean(address.isDefault),
      } as ShippingAddress;
      for (const [key, field] of Object.entries(SHIPPING_FIELDS))
        result[key as keyof typeof SHIPPING_FIELDS] = text(address[key], field.label, field.max);
      return result;
    })
    // Untouched blank address cards are not saved.
    .filter((address) =>
      Object.keys(SHIPPING_FIELDS).some((key) => address[key as keyof typeof SHIPPING_FIELDS]),
    );
  if (new Set(shippingAddresses.map((address) => address.id)).size !== shippingAddresses.length)
    throw new CustomerError('รหัสที่อยู่จัดส่งซ้ำ');
  if (shippingAddresses.filter((address) => address.isDefault).length > 1)
    throw new CustomerError('เลือกที่อยู่จัดส่งเริ่มต้นได้เพียงแห่งเดียว');
  if (shippingAddresses.length && !shippingAddresses.some((address) => address.isDefault))
    shippingAddresses[0].isDefault = true;

  if (input.files !== undefined && !Array.isArray(input.files))
    throw new CustomerError('รายการไฟล์ไม่ถูกต้อง');
  const files = ((input.files as unknown[] | undefined) ?? []).map((value) => {
    const file = object(value, 'รายการไฟล์ไม่ถูกต้อง');
    if (
      typeof file.id !== 'string' ||
      !uuidPattern.test(file.id) ||
      typeof file.documentTypeId !== 'string' ||
      !uuidPattern.test(file.documentTypeId) ||
      typeof file.name !== 'string' ||
      typeof file.type !== 'string' ||
      typeof file.digest !== 'string' ||
      !/^[a-f0-9]{64}$/.test(file.digest) ||
      !Number.isInteger(file.size) ||
      Number(file.size) < 1 ||
      Number(file.size) > CUSTOMER_FILE_LIMIT
    )
      throw new CustomerError('รายการไฟล์หรือขนาดไฟล์ไม่ถูกต้อง');
    if (
      !CUSTOMER_IMAGE_TYPES.includes(file.type) &&
      file.type !== 'application/pdf' &&
      !(!file.type && /\.pdf$/i.test(file.name))
    )
      throw new CustomerError('ชนิดไฟล์ไม่รองรับ รองรับ JPEG/PNG/WebP/GIF และ PDF');
    return {
      id: file.id.toLowerCase(),
      documentTypeId: file.documentTypeId.toLowerCase(),
      name: file.name.replace(/[\u0000-\u001f]/g, '').slice(0, 255) || 'ไฟล์แนบ',
      type: file.type,
      size: Number(file.size),
      digest: file.digest,
    };
  });
  if (files.length > 50) throw new CustomerError('แนบไฟล์ได้ไม่เกิน 50 ไฟล์');
  if (new Set(files.map((file) => file.id)).size !== files.length)
    throw new CustomerError('รหัสไฟล์แนบซ้ำ');
  return {
    codeGroupId: input.codeGroupId.toLowerCase(),
    sequence,
    fields,
    shippingAddresses,
    files,
  };
}
