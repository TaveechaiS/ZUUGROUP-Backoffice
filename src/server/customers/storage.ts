import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { CUSTOMER_FILE_LIMIT, CUSTOMER_IMAGE_TYPES } from '@/config/customers';
import { CustomerError } from '@/server/validation/customer-error';

export const CUSTOMER_BUCKET = 'customer-attachments';

export function customerStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new CustomerError('ยังไม่ได้ตั้งค่าพื้นที่เก็บไฟล์', 503);
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(CUSTOMER_BUCKET);
}

// Trust file signatures, not the browser-supplied MIME type.
export function inspectCustomerFile(bytes: Uint8Array, suppliedType: string) {
  if (!bytes.length || bytes.length > CUSTOMER_FILE_LIMIT)
    throw new CustomerError('ไฟล์ต้องมีขนาดมากกว่า 0 และไม่เกิน 10 MB');
  const head = Buffer.from(bytes.subarray(0, 16));
  const type = head.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    ? 'image/png'
    : head[0] === 255 && head[1] === 216 && head[2] === 255
      ? 'image/jpeg'
      : ['GIF87a', 'GIF89a'].includes(head.subarray(0, 6).toString('ascii'))
        ? 'image/gif'
        : head.subarray(0, 4).toString('ascii') === 'RIFF' &&
            head.subarray(8, 12).toString('ascii') === 'WEBP'
          ? 'image/webp'
          : head.subarray(0, 5).toString('ascii') === '%PDF-'
            ? 'application/pdf'
            : '';
  if (
    (!CUSTOMER_IMAGE_TYPES.includes(type) && type !== 'application/pdf') ||
    (suppliedType && suppliedType !== type)
  )
    throw new CustomerError(
      'ชนิดไฟล์ไม่รองรับหรือเนื้อหาไฟล์ไม่ตรงชนิด รองรับ JPEG/PNG/WebP/GIF และ PDF',
    );
  return type;
}
