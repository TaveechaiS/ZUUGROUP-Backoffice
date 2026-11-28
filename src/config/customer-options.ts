export const CUSTOMER_OPTION_KINDS = {
  codeGroup: {
    label: 'กลุ่มรหัสลูกค้า',
    group: 'รหัสลูกค้า',
    codeRequired: true,
    daysRequired: false,
  },
  creditTerm: {
    label: 'ระยะเวลาเครดิต',
    group: 'เครดิตและการวางบิล',
    codeRequired: false,
    daysRequired: true,
  },
  creditStart: {
    label: 'วันเริ่มนับเครดิต',
    group: 'เครดิตและการวางบิล',
    codeRequired: false,
    daysRequired: false,
  },
  billingCycle: {
    label: 'รอบวางบิล',
    group: 'เครดิตและการวางบิล',
    codeRequired: false,
    daysRequired: false,
  },
  documentType: {
    label: 'ประเภทเอกสารแนบ',
    group: 'เอกสาร',
    codeRequired: false,
    daysRequired: false,
  },
  expenseCategory: {
    label: 'หมวดค่าใช้จ่าย',
    group: 'ค่าใช้จ่าย',
    codeRequired: false,
    daysRequired: false,
  },
} as const;

export type CustomerOptionKind = keyof typeof CUSTOMER_OPTION_KINDS;
export function isCustomerOptionKind(value: unknown): value is CustomerOptionKind {
  return typeof value === 'string' && Object.hasOwn(CUSTOMER_OPTION_KINDS, value);
}
