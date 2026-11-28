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
