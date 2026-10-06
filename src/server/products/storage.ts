import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { PRODUCT_FILE_LIMIT, PRODUCT_IMAGE_TYPES } from '@/types/api/product-full';
import { ProductError } from '@/server/validation/products';
export const PRODUCT_BUCKET = 'product-attachments';
export function productStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new ProductError('ยังไม่ได้ตั้งค่าพื้นที่เก็บไฟล์', 503);
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).storage.from(PRODUCT_BUCKET);
}
export function inspectProductFile(bytes: Uint8Array, kind: string, suppliedType: string) {
  if (!bytes.length || bytes.length > PRODUCT_FILE_LIMIT)
    throw new ProductError('ไฟล์ต้องมีขนาดมากกว่า 0 และไม่เกิน 10 MB');
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
    !['image', 'document'].includes(kind) ||
    (!PRODUCT_IMAGE_TYPES.includes(type) && !(kind === 'document' && type === 'application/pdf')) ||
    (suppliedType && suppliedType !== type)
  )
    throw new ProductError(
      'ชนิดไฟล์ไม่รองรับหรือเนื้อหาไฟล์ไม่ตรงชนิด รองรับ JPEG/PNG/WebP/GIF และ PDF สำหรับเอกสาร',
    );
  return type;
}
