export const PRODUCT_OPTION_KINDS = {
  codeGroup: { label: 'กลุ่มรหัส', group: 'รหัสสินค้า', codeRequired: true },
  codeFormat: { label: 'รูปแบบรหัส', group: 'รหัสสินค้า', codeRequired: true },
  productType: { label: 'ประเภทผลิตภัณฑ์', group: 'ประเภทสินค้า', codeRequired: false },
  category: { label: 'หมวดหมู่สินค้า', group: 'ประเภทสินค้า', codeRequired: true },
  brand: { label: 'ยี่ห้อ', group: 'บริษัทและแบรนด์', codeRequired: false },
  manufacturer: { label: 'บริษัทผู้ผลิต', group: 'บริษัทและแบรนด์', codeRequired: false },
  ingredient: { label: 'ตัวยาสำคัญ', group: 'ข้อมูลยา', codeRequired: false },
  dosageForm: { label: 'รูปแบบยา', group: 'ข้อมูลยา', codeRequired: true },
  legalType: { label: 'ประเภทตามกฎหมาย', group: 'ข้อมูลยา', codeRequired: false },
  unit: { label: 'หน่วยสินค้า', group: 'หน่วย', codeRequired: false },
} as const;

export type ProductOptionKind = keyof typeof PRODUCT_OPTION_KINDS;
export function isProductOptionKind(value: unknown): value is ProductOptionKind {
  return typeof value === 'string' && Object.hasOwn(PRODUCT_OPTION_KINDS, value);
}
