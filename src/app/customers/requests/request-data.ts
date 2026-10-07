// TASK-272 preview data. Customer requests are not stored yet: Sales/Manager submission and the
// database come with the other roles. Every value here is fictional and never saved.
export const REQUEST_STATUSES = [
  'รอตรวจสอบ',
  'ส่งกลับแก้ไข',
  'อนุมัติแล้ว',
  'ไม่อนุมัติ',
  'ยกเลิก',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export type CustomerRequest = {
  code: string;
  status: RequestStatus;
  requester: { name: string; role: 'Sales' | 'Manager' };
  territory: string;
  submittedAt: string;
  codeGroup: string;
  creditTerm: string;
  creditStart: string;
  fields: Record<string, string>;
  shippingAddresses: { name: string; address: string; province: string; isDefault: boolean }[];
  files: { type: string; name: string }[];
  duplicates: { code: string; name: string; reason: string }[];
  history: { at: string; actor: string; action: string; note?: string }[];
  reason?: string;
  customerCode?: string;
};

const base = (n: number, province: string) => ({
  contactName: `ผู้ติดต่อตัวอย่าง ${n}`,
  phone: `000-100-00${n}0`,
  email: `request${n}@example.com`,
  accountingContactName: `ฝ่ายบัญชีตัวอย่าง ${n}`,
  accountingPhone: `000-100-01${n}0`,
  accountingEmail: `account-req${n}@example.com`,
  taxId: `000000000${n}${n}${n}${n}`,
  vatStatus: 'จดทะเบียน',
  branchType: 'สำนักงานใหญ่',
  branchNumber: '00000',
  billingAddress: `${n}/1 ถนนตัวอย่าง`,
  billingSubdistrict: 'ตำบลตัวอย่าง',
  billingDistrict: `เมือง${province}`,
  billingProvince: province,
  billingPostcode: '00000',
  licenseType: 'ใบอนุญาตขายยา (ตัวอย่าง)',
  licenseNumber: `ตัวอย่าง-REQ-${n}`,
  licenseLocation: 'สถานที่ตามใบอนุญาต (ตัวอย่าง)',
  licenseExpiresAt: '2027-06-30',
  licenseStatus: '',
  profession: 'เภสัชกร',
  professionalName: `เภสัชกรตัวอย่าง ${n}`,
  professionalLicenseNumber: `ภ.ตัวอย่าง-${n}`,
  creditLimit: '50000',
  billingCycle: 'ทุกสิ้นเดือน',
  notes: 'คำขอตัวอย่างสำหรับดูหน้าจอ ไม่ใช่ข้อมูลจริง',
});

export const SAMPLE_REQUESTS: CustomerRequest[] = [
  {
    code: 'REQ-2569-0005',
    status: 'รอตรวจสอบ',
    requester: { name: 'Sales ตัวอย่าง A', role: 'Sales' },
    territory: 'ภาคตะวันออก',
    submittedAt: '2026-10-07T09:30:00+07:00',
    codeGroup: 'PHA · ร้านขายยา',
    creditTerm: 'เครดิต 30 วัน',
    creditStart: '',
    fields: { name: 'ร้านยาคำขอตัวอย่าง ระยอง', ...base(5, 'ระยอง') },
    shippingAddresses: [
      { name: 'หน้าร้าน', address: '5/1 ถนนตัวอย่าง', province: 'ระยอง', isDefault: true },
    ],
    files: [{ type: 'ใบอนุญาตสถานพยาบาล / ใบอนุญาตขายยา', name: 'license-sample.pdf' }],
    duplicates: [],
    history: [{ at: '2026-10-07T09:30:00+07:00', actor: 'Sales ตัวอย่าง A', action: 'ส่งคำขอ' }],
  },
  {
    code: 'REQ-2569-0004',
    status: 'รอตรวจสอบ',
    requester: { name: 'Manager ตัวอย่าง ใต้', role: 'Manager' },
    territory: 'ภาคใต้',
    submittedAt: '2026-10-06T15:10:00+07:00',
    codeGroup: 'CLN · คลินิกเวชกรรม / ทันตกรรม',
    creditTerm: 'เงินสด',
    creditStart: '',
    fields: { name: 'คลินิกตัวอย่าง นครศรีธรรมราช', ...base(4, 'นครศรีธรรมราช') },
    shippingAddresses: [],
    files: [],
    duplicates: [
      {
        code: 'CLN-0003',
        name: 'คลินิกตัวอย่าง นครศรีธรรมราช',
        reason: 'ชื่อสถานประกอบการตรงกัน',
      },
    ],
    history: [
      { at: '2026-10-06T15:10:00+07:00', actor: 'Manager ตัวอย่าง ใต้', action: 'ส่งคำขอ' },
    ],
  },
  {
    code: 'REQ-2569-0003',
    status: 'ส่งกลับแก้ไข',
    requester: { name: 'Sales ตัวอย่าง B', role: 'Sales' },
    territory: 'ภาคตะวันตก',
    submittedAt: '2026-10-05T11:00:00+07:00',
    codeGroup: 'PHA · ร้านขายยา',
    creditTerm: 'เครดิต 60 วัน',
    creditStart: '',
    fields: { name: 'ร้านยาคำขอตัวอย่าง ราชบุรี', ...base(3, 'ราชบุรี') },
    shippingAddresses: [],
    files: [],
    duplicates: [],
    reason: 'ไม่มีไฟล์ใบอนุญาตขายยา กรุณาแนบแล้วส่งใหม่',
    history: [
      { at: '2026-10-05T11:00:00+07:00', actor: 'Sales ตัวอย่าง B', action: 'ส่งคำขอ' },
      {
        at: '2026-10-05T16:20:00+07:00',
        actor: 'Admin',
        action: 'ส่งกลับแก้ไข',
        note: 'ไม่มีไฟล์ใบอนุญาตขายยา กรุณาแนบแล้วส่งใหม่',
      },
    ],
  },
  {
    code: 'REQ-2569-0002',
    status: 'อนุมัติแล้ว',
    requester: { name: 'Sales ตัวอย่าง A', role: 'Sales' },
    territory: 'ภาคตะวันออก',
    submittedAt: '2026-10-03T10:00:00+07:00',
    codeGroup: 'PHA · ร้านขายยา',
    creditTerm: 'เครดิต 30 วัน',
    creditStart: '',
    fields: { name: 'ร้านขายยาตัวอย่าง ชลบุรี', ...base(2, 'ชลบุรี') },
    shippingAddresses: [],
    files: [],
    duplicates: [],
    customerCode: 'PHA-0001',
    history: [
      { at: '2026-10-03T10:00:00+07:00', actor: 'Sales ตัวอย่าง A', action: 'ส่งคำขอ' },
      {
        at: '2026-10-03T14:00:00+07:00',
        actor: 'Admin',
        action: 'อนุมัติแล้ว',
        note: 'เพิ่มเป็นลูกค้า PHA-0001',
      },
    ],
  },
  {
    code: 'REQ-2569-0001',
    status: 'ไม่อนุมัติ',
    requester: { name: 'Manager ตัวอย่าง ใต้', role: 'Manager' },
    territory: 'ภาคใต้',
    submittedAt: '2026-10-01T09:00:00+07:00',
    codeGroup: 'WSL · ยี่ปั๊ว / ผู้ค้าส่ง',
    creditTerm: 'เครดิต 90 วัน',
    creditStart: '',
    fields: { name: 'ผู้ค้าส่งคำขอตัวอย่าง สงขลา', ...base(1, 'สงขลา') },
    shippingAddresses: [],
    files: [],
    duplicates: [],
    reason: 'ข้อมูลใบอนุญาตไม่ถูกต้อง',
    history: [
      { at: '2026-10-01T09:00:00+07:00', actor: 'Manager ตัวอย่าง ใต้', action: 'ส่งคำขอ' },
      {
        at: '2026-10-02T10:30:00+07:00',
        actor: 'Admin',
        action: 'ไม่อนุมัติ',
        note: 'ข้อมูลใบอนุญาตไม่ถูกต้อง',
      },
    ],
  },
];
