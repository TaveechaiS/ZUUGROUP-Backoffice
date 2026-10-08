export const SUPPLIER_STATUSES = ['ใช้งาน', 'ระงับ'] as const;
export const SUPPLIER_FILTERS = [...SUPPLIER_STATUSES, 'ลบแล้ว'] as const;
export const PAYMENT_TERMS = ['เงินสด', '30 วัน', '60 วัน', '90 วัน'] as const;
export const PURCHASE_STATUSES = [
  'รอรับสินค้า',
  'รับบางส่วน',
  'รับครบ',
  'ปิดแล้ว',
  'ยกเลิก',
] as const;
export const PURCHASE_OPEN_STATUSES: readonly string[] = ['รอรับสินค้า', 'รับบางส่วน'];
