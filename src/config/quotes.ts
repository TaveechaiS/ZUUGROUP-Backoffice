// TASK-275 quotation workflow constants.
export const QUOTE_STATUSES = [
  'รออนุมัติ',
  'ส่งกลับแก้ไข',
  'อนุมัติ',
  'ไม่อนุมัติ',
  'ยกเลิก',
] as const;
// "หมดอายุ" is derived from validUntil; it is a display/filter status only.
export const QUOTE_DISPLAY_STATUSES = [...QUOTE_STATUSES, 'หมดอายุ'] as const;
export const QUOTE_VALID_DAYS = 30;
