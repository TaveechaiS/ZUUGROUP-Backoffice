export type ProductFileView = {
  id: string;
  kind: 'image' | 'document';
  name: string;
  type: string;
  size: number;
};
export type ProductDetails = {
  fields: Record<string, string>;
  options: Record<string, string>;
  files: ProductFileView[];
};
export type ProductDraft = {
  fields: Record<string, string>;
  sequence: string;
  files: (ProductFileView & { digest: string })[];
};
export type ProductEditContext = {
  targetProductId: string;
  expectedVersion: string;
  keepFileIds: string[];
};
export type ProductHistoryEntry = {
  id: string;
  occurredAt: string;
  actorName: string;
  action: string;
  changes: { field: string; before: string; after: string }[];
};
export const PRODUCT_FILE_LIMIT = 10 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const PRODUCT_OPTION_FIELDS = {
  กลุ่มรหัส: 'codeGroup',
  รูปแบบ: 'codeFormat',
  ประเภทผลิตภัณฑ์: 'productType',
  หมวดหมู่สินค้า: 'category',
  ยี่ห้อ: 'brand',
  บริษัทผู้ผลิต: 'manufacturer',
  ตัวยาสำคัญ: 'ingredient',
  รูปแบบยา: 'dosageForm',
  ประเภทตามกฎหมาย: 'legalType',
  หน่วยสินค้า: 'unit',
} as const;
export const PRODUCT_TEXT_FIELDS = [
  'ชื่อสินค้าเต็ม (ไทย)',
  'ชื่อสินค้าเต็ม (ภาษาอังกฤษ)',
  'ชื่อการค้า',
  'รายละเอียดสินค้า',
  'ราคาขาย',
  'ความแรง',
  'ข้อมูลทะเบียนผลิตภัณฑ์',
  'สรรพคุณ / ข้อบ่งใช้',
  'คำเตือนและข้อห้ามใช้',
  'เงื่อนไขการสั่งจ่าย',
];
