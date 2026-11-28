export const CUSTOMER_FILE_LIMIT = 10 * 1024 * 1024;
export const CUSTOMER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type TextField = { label: string; max: number; required?: boolean; choices?: readonly string[] };

// API keys are camelCase; labels match the approved create form (TASK-238–259).
// TASK-268: customer status; blank input defaults to ใช้งาน.
export const CUSTOMER_STATUSES = ['ใช้งาน', 'ระงับ', 'เลิกค้าขาย'] as const;

export const CUSTOMER_TEXT_FIELDS = {
  name: { label: 'ชื่อสถานประกอบการ / ชื่อบริษัท', max: 200, required: true },
  notes: { label: 'หมายเหตุ', max: 4000 },
  customerStatus: { label: 'สถานะลูกค้า', max: 20, choices: CUSTOMER_STATUSES },
  contactName: { label: 'ชื่อผู้ติดต่อหลัก', max: 160, required: true },
  phone: { label: 'เบอร์โทรศัพท์', max: 30, required: true },
  email: { label: 'อีเมล', max: 254, required: true },
  accountingContactName: { label: 'ชื่อผู้ติดต่อฝ่ายบัญชี', max: 160, required: true },
  accountingPhone: { label: 'เบอร์โทรศัพท์ฝ่ายบัญชี', max: 30, required: true },
  accountingEmail: { label: 'อีเมลฝ่ายบัญชี', max: 254, required: true },
  taxId: { label: 'เลขประจำตัวผู้เสียภาษี', max: 13, required: true },
  vatStatus: {
    label: 'สถานะจดทะเบียน VAT',
    max: 20,
    required: true,
    choices: ['จดทะเบียน', 'ไม่จดทะเบียน'],
  },
  branchType: {
    label: 'สำนักงานใหญ่ / สาขา',
    max: 20,
    required: true,
    choices: ['สำนักงานใหญ่', 'สาขา'],
  },
  branchNumber: { label: 'เลขที่สาขา', max: 20 },
  billingAddress: { label: 'ที่อยู่ออกบิล', max: 1000, required: true },
  billingSubdistrict: { label: 'ตำบล / แขวง (ออกบิล)', max: 120, required: true },
  billingDistrict: { label: 'อำเภอ / เขต (ออกบิล)', max: 120, required: true },
  billingProvince: { label: 'จังหวัด (ออกบิล)', max: 120, required: true },
  billingPostcode: { label: 'รหัสไปรษณีย์ (ออกบิล)', max: 10, required: true },
  licenseType: { label: 'ประเภทใบอนุญาต', max: 160 },
  licenseNumber: { label: 'เลขที่ใบอนุญาตสถานพยาบาล / ใบอนุญาตขายยา', max: 120 },
  licenseLocation: { label: 'สถานประกอบการ / สาขาตามใบอนุญาต', max: 300 },
  licenseExpiresAt: { label: 'วันหมดอายุใบอนุญาต', max: 10 },
  licenseStatus: { label: 'ผลการตรวจสอบใบอนุญาต', max: 160 },
  licenseVerifiedBy: { label: 'ผู้ตรวจสอบใบอนุญาต', max: 160 },
  licenseVerifiedAt: { label: 'วันที่ตรวจสอบใบอนุญาต', max: 10 },
  profession: { label: 'วิชาชีพผู้รับผิดชอบ', max: 20, choices: ['แพทย์', 'เภสัชกร'] },
  professionalName: { label: 'ชื่อผู้ประกอบวิชาชีพ', max: 160 },
  professionalLicenseNumber: { label: 'เลขที่ใบประกอบวิชาชีพ', max: 120 },
  creditLimit: { label: 'วงเงินเครดิต (Credit Limit)', max: 16 },
  billingCycle: { label: 'รอบวางบิล', max: 160 },
} as const satisfies Record<string, TextField>;

export const CUSTOMER_OPTION_FIELDS = {
  territoryId: 'เขตขาย',
  creditTermId: 'ระยะเวลาเครดิต (Credit Term)',
  creditStartId: 'วันเริ่มนับเครดิต',
} as const;

export const SHIPPING_FIELDS = {
  name: { label: 'ชื่อสถานที่ / สาขาจัดส่ง', max: 200 },
  recipientName: { label: 'ชื่อผู้รับสินค้า', max: 160 },
  recipientPhone: { label: 'เบอร์โทรศัพท์ผู้รับสินค้า', max: 30 },
  address: { label: 'ที่อยู่จัดส่งสินค้า', max: 1000 },
  subdistrict: { label: 'ตำบล / แขวง (จัดส่ง)', max: 120 },
  district: { label: 'อำเภอ / เขต (จัดส่ง)', max: 120 },
  province: { label: 'จังหวัด (จัดส่ง)', max: 120 },
  postcode: { label: 'รหัสไปรษณีย์ (จัดส่ง)', max: 10 },
} as const;
export const SHIPPING_LIMIT = 20;

// TASK-267: expired = red, 0–30 days left = orange. Dates are compared in Asia/Bangkok.
export const LICENSE_WARNING_DAYS = 30;
// TASK-271: the list shows one badge and filters by the same value.
export const CUSTOMER_LIST_STATUSES = [
  'ใช้งาน',
  'ระงับ',
  'เลิกค้าขาย',
  'ใบอนุญาตหมดอายุ',
  'ใบอนุญาตใกล้หมดอายุ',
] as const;
export function customerListStatus(
  customer: { status: string; licenseExpiresAt: string | null; deletedAt?: string | null },
  now = new Date(),
) {
  if (customer.deletedAt) return 'ลบแล้ว';
  if (customer.status !== 'ใช้งาน') return customer.status;
  const expiry = licenseExpiry(customer.licenseExpiresAt, now);
  return expiry ? `ใบอนุญาต${expiry.label}` : 'ใช้งาน';
}
export function licenseExpiry(expiresAt: string | null | undefined, now = new Date()) {
  if (!expiresAt || !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) return null;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(now);
  const days = Math.round((Date.parse(expiresAt) - Date.parse(today)) / 86400000);
  if (days < 0) return { label: 'หมดอายุ', detail: `หมดอายุแล้ว ${-days} วัน`, days };
  if (days <= LICENSE_WARNING_DAYS)
    return { label: 'ใกล้หมดอายุ', detail: days ? `เหลือ ${days} วัน` : 'หมดอายุวันนี้', days };
  return null;
}
