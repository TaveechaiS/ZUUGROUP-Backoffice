export const PURCHASE_STATUSES = [
  'รอรับสินค้า',
  'รับบางส่วน',
  'รับครบ',
  'ปิดแล้ว',
  'ยกเลิก',
] as const;
export const PURCHASE_OPEN_STATUSES: readonly string[] = ['รอรับสินค้า', 'รับบางส่วน'];
