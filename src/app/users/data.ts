export const ROLES = ['Admin', 'Sales', 'Manager', 'Accounting & CFO'] as const;
export type Role = (typeof ROLES)[number];

export type UserStatus = 'ใช้งานอยู่' | 'ระงับการใช้งาน';
export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string;
  status: UserStatus;
  lastActive: string;
};
export type StatusTab = 'ทั้งหมด' | 'ใช้งานอยู่' | 'ระงับการใช้งาน';

const INITIAL_USERS: UserRow[] = [
  {
    id: 'USR-001',
    name: 'อรทัย วัฒนากร',
    email: 'orathai@example.test',
    role: 'Admin',
    team: 'บริหารระบบ',
    status: 'ใช้งานอยู่',
    lastActive: 'วันนี้ 09:42',
  },
  {
    id: 'USR-002',
    name: 'ธนกร ศิริพงษ์',
    email: 'thanakorn@example.test',
    role: 'Sales',
    team: 'ฝ่ายขายกรุงเทพฯ',
    status: 'ใช้งานอยู่',
    lastActive: 'วันนี้ 09:18',
  },
  {
    id: 'USR-003',
    name: 'พิมพ์ชนก รัตนชัย',
    email: 'pimchanok@example.test',
    role: 'Sales',
    team: 'ฝ่ายขายภาคกลาง',
    status: 'ใช้งานอยู่',
    lastActive: 'วันนี้ 08:56',
  },
  {
    id: 'USR-004',
    name: 'กิตติพงษ์ วงศ์สวัสดิ์',
    email: 'kittipong@example.test',
    role: 'Manager',
    team: 'บริหารการขาย',
    status: 'ใช้งานอยู่',
    lastActive: 'เมื่อวาน 16:30',
  },
  {
    id: 'USR-005',
    name: 'สุรีย์พร จันทร์ดี',
    email: 'sureeporn@example.test',
    role: 'Accounting & CFO',
    team: 'การเงิน',
    status: 'ใช้งานอยู่',
    lastActive: 'เมื่อวาน 15:12',
  },
  {
    id: 'USR-006',
    name: 'ณัฐวุฒิ เกษมสุข',
    email: 'nattawut@example.test',
    role: 'Sales',
    team: 'ฝ่ายขายภาคเหนือ',
    status: 'ระงับการใช้งาน',
    lastActive: '18 ก.ย. 2569',
  },
  {
    id: 'USR-007',
    name: 'จิราภรณ์ พูลเพิ่ม',
    email: 'jiraporn@example.test',
    role: 'Accounting & CFO',
    team: 'การเงิน',
    status: 'ใช้งานอยู่',
    lastActive: '18 ก.ย. 2569',
  },
  {
    id: 'USR-008',
    name: 'ภาคภูมิ ตั้งมั่น',
    email: 'phakphum@example.test',
    role: 'Manager',
    team: 'บริหารการขาย',
    status: 'ระงับการใช้งาน',
    lastActive: '12 ก.ย. 2569',
  },
];

export const PRESENTATION_USERS = Array.from({ length: 30 }, (_, index) => {
  const seed = INITIAL_USERS[index % INITIAL_USERS.length];
  const sample = Math.floor(index / INITIAL_USERS.length);
  return sample === 0
    ? seed
    : {
        ...seed,
        id: `${seed.id}-${sample + 1}`,
        name: `${seed.name} · ตัวอย่าง ${sample + 1}`,
      };
});

export const TABS: StatusTab[] = ['ทั้งหมด', 'ใช้งานอยู่', 'ระงับการใช้งาน'];
