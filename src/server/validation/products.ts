import type { ProductStatus, ValidatedProductInput } from '@/types/api/products';
const codePattern = /^[A-Z0-9]{2,3}$/;
export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class ProductError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

export function requiredString(value: unknown, label: string, max = 160) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || [...text].length > max)
    throw new ProductError(`กรุณากรอก${label}ไม่เกิน ${max} ตัวอักษร`);
  return text;
}
function requiredId(value: unknown, label: string) {
  if (typeof value !== 'string' || !uuidPattern.test(value))
    throw new ProductError(`กรุณาเลือก${label}`);
  return value;
}
function price(value: unknown) {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(text) || Number(text) > 9999999999.99) {
    throw new ProductError('ราคาขายต้องเป็นตัวเลขตั้งแต่ 0 บาท และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
  }
  return text;
}
function sequence(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value !== 'string' || !/^[0-9]{4}$/.test(value) || value === '0000') {
    throw new ProductError('เลขลำดับต้องเป็นเลข 4 หลัก ระหว่าง 0001 ถึง 9999');
  }
  return Number(value);
}
export function productInput(
  body: Record<string, unknown>,
  creating = false,
): ValidatedProductInput {
  const status: ProductStatus | null =
    body.status === 'INACTIVE' ? 'INACTIVE' : body.status === 'ACTIVE' ? 'ACTIVE' : null;
  if (!status) throw new ProductError('สถานะสินค้าไม่ถูกต้อง');
  return {
    name: requiredString(body.name, 'ชื่อสินค้า'),
    categoryId: requiredId(body.categoryId, 'หมวดหมู่'),
    dosageFormId: requiredId(body.dosageFormId, 'รูปแบบยา'),
    drugId: requiredId(body.drugId, 'ตัวยา'),
    defaultWarehouseId: requiredId(body.defaultWarehouseId, 'คลังที่เกี่ยวข้อง'),
    unit: requiredString(body.unit, 'หน่วยประจำ', 80),
    salePrice: price(body.salePrice),
    status,
    sequence: creating ? sequence(body.sequence) : null,
  };
}

export function productMasterInput(type: unknown, body: Record<string, unknown>) {
  const name = requiredString(body.name, 'ชื่อรายการแม่');
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (type !== 'drug' && type !== 'category' && type !== 'dosageForm')
    throw new ProductError('ประเภทรายการแม่ไม่ถูกต้อง');
  if (type !== 'drug' && !codePattern.test(code))
    throw new ProductError('รหัสต้องเป็นตัวอักษรหรือตัวเลข 2–3 หลัก');
  return { name, code, type };
}
