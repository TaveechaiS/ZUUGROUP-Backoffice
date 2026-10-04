export type AdminPage = {
  href: string;
  label: string;
  section: string;
  icon: string;
  description: string;
  isDashboard?: boolean;
  secondaryOnly?: boolean;
  parentHref?: string;
  hiddenFromSidebar?: boolean;
};

export const ADMIN_PAGES: AdminPage[] = [
  {
    href: '/',
    label: 'แดชบอร์ด',
    section: 'ภาพรวม',
    icon: 'dashboard',
    description: 'ภาพรวมการจัดการระบบ',
    isDashboard: true,
  },
  {
    href: '/customers',
    label: 'ลูกค้า',
    section: 'จัดการข้อมูล',
    icon: 'customers',
    description: 'จัดการข้อมูลลูกค้าและผู้ดูแลลูกค้า',
  },
  {
    href: '/customers/dashboard',
    label: 'แดชบอร์ดลูกค้า',
    section: 'จัดการข้อมูล',
    icon: 'customers',
    description: 'พื้นที่เตรียมไว้สำหรับภาพรวมข้อมูลลูกค้า',
    secondaryOnly: true,
  },
  {
    href: '/customers/list',
    label: 'รายชื่อลูกค้า',
    section: 'จัดการข้อมูล',
    icon: 'customers',
    description: 'รายการข้อมูลลูกค้าสำหรับผู้ดูแลระบบ',
    secondaryOnly: true,
  },
  {
    href: '/customers/groups',
    label: 'กลุ่มลูกค้า',
    section: 'จัดการข้อมูล',
    icon: 'customers',
    description: 'ใช้ตัวกรองกลุ่มในรายชื่อลูกค้า',
    secondaryOnly: true,
    hiddenFromSidebar: true,
  },
  {
    href: '/customers/territories',
    label: 'เขตและผู้แทนขาย',
    section: 'จัดการข้อมูล',
    icon: 'customers',
    description: 'พื้นที่เตรียมไว้สำหรับเขตและผู้แทนขาย',
    secondaryOnly: true,
  },
  {
    href: '/customers/documents',
    label: 'เอกสารแนบ',
    section: 'จัดการข้อมูล',
    icon: 'customers',
    description: 'พื้นที่เตรียมไว้สำหรับเอกสารแนบของลูกค้า',
    secondaryOnly: true,
  },
  {
    href: '/products',
    label: 'สินค้าและสต็อก',
    section: 'จัดการข้อมูล',
    icon: 'products',
    description: 'จัดการข้อมูลสินค้าและคลังสินค้า',
  },
  {
    href: '/products/stock/main',
    label: 'คลังหลัก',
    section: 'จัดการข้อมูล',
    icon: 'products',
    description: 'สินค้าและล็อตในคลังหลัก',
    secondaryOnly: true,
    parentHref: '/products',
  },
  {
    href: '/products/stock/marketing',
    label: 'คลังการตลาด',
    section: 'จัดการข้อมูล',
    icon: 'products',
    description: 'สินค้าและล็อตสำหรับแจกหรือบริจาค',
    secondaryOnly: true,
    parentHref: '/products',
  },
  {
    href: '/products/stock/disposal',
    label: 'คลังรอทำลาย',
    section: 'จัดการข้อมูล',
    icon: 'products',
    description: 'สินค้าและล็อตที่แยกไว้รอทำลาย',
    secondaryOnly: true,
    parentHref: '/products',
  },
  {
    href: '/products/stock',
    label: 'ล็อตสินค้า',
    section: 'จัดการข้อมูล',
    icon: 'products',
    description: 'รับเข้า ล็อต จอง โอน และปรับยอดคลัง',
    secondaryOnly: true,
    parentHref: '/products',
  },
  {
    href: '/purchases/receipts',
    label: 'รับสินค้าเข้า',
    section: 'จัดการข้อมูล',
    icon: 'purchases',
    description: 'รับสินค้าจริงและประวัติล็อต',
    secondaryOnly: true,
  },
  {
    href: '/stock-counts',
    label: 'ตรวจนับสินค้า',
    section: 'จัดการข้อมูล',
    icon: 'products',
    description: 'บันทึกผลตรวจนับด้วยมือเพื่อเทียบกับยอดในระบบ',
    hiddenFromSidebar: true,
  },
  {
    href: '/suppliers',
    label: 'ผู้ขาย',
    section: 'จัดการข้อมูล',
    icon: 'purchases',
    description: 'จัดการข้อมูลผู้ขายสำหรับการจัดซื้อ',
    hiddenFromSidebar: true,
  },
  {
    href: '/purchases',
    label: 'จัดซื้อ & รับเข้าสต็อก',
    section: 'จัดการข้อมูล',
    icon: 'purchases',
    description: 'จัดการใบสั่งซื้อและการรับสินค้า',
  },
  {
    href: '/expenses',
    label: 'ค่าใช้จ่าย',
    section: 'จัดการข้อมูล',
    icon: 'billing',
    description: 'จัดการค่าใช้จ่ายบริษัทแยกจากสินค้าขาย',
    hiddenFromSidebar: true,
  },
  {
    href: '/quotes',
    label: 'ใบเสนอราคา',
    section: 'จัดการคำสั่งซื้อ',
    icon: 'quotes',
    description: 'จัดการใบเสนอราคาและสถานะเอกสาร',
  },
  {
    href: '/orders',
    label: 'คำสั่งซื้อ & จัดส่ง',
    section: 'จัดการคำสั่งซื้อ',
    icon: 'orders',
    description: 'จัดการคำสั่งซื้อและการจัดส่งสินค้า',
  },
  {
    href: '/billing',
    label: 'วางบิล & ลูกหนี้',
    section: 'การเงิน',
    icon: 'billing',
    description: 'จัดการการวางบิล การรับชำระ และยอดคงค้าง',
  },
  {
    href: '/promotions',
    label: 'โปรโมชัน & ของแถม',
    section: 'การเงิน',
    icon: 'promotions',
    description: 'จัดการโปรโมชันและรายการของแถม',
  },
  {
    href: '/reports/sales',
    label: 'รายงานยอดขาย',
    section: 'การเงิน',
    icon: 'sales-report',
    description: 'รายงานยอดขายตามช่วงเวลาและเงื่อนไขที่กำหนด',
  },
  {
    href: '/reports/inventory',
    label: 'รายงานคลังสินค้า',
    section: 'การเงิน',
    icon: 'inventory-report',
    description: 'รายงานคลังและความเคลื่อนไหวของสินค้า',
  },
  {
    href: '/reports/finance',
    label: 'รายงานการเงิน',
    section: 'การเงิน',
    icon: 'sales-report',
    description: 'รายงานด้านการเงินตามสิทธิ์ที่กำหนด',
    hiddenFromSidebar: true,
  },
  {
    href: '/users',
    label: 'ผู้ใช้งาน',
    section: 'จัดการระบบ',
    icon: 'users',
    description: 'จัดการบัญชีผู้ใช้งานและบทบาท',
  },
  {
    href: '/audit-logs',
    label: 'Audit Logs',
    section: 'จัดการระบบ',
    icon: 'audit-logs',
    description: 'ตรวจสอบประวัติการทำรายการในระบบ',
  },
  {
    href: '/settings',
    label: 'ตั้งค่าระบบ',
    section: 'จัดการระบบ',
    icon: 'settings',
    description: 'จัดการค่าพื้นฐานของระบบ',
  },
];

export const NAVIGATION_SECTIONS = [
  'ภาพรวม',
  'จัดการข้อมูล',
  'จัดการคำสั่งซื้อ',
  'การเงิน',
  'จัดการระบบ',
] as const;

export function getAdminPage(path: string): AdminPage | undefined {
  const normalizedPath = path === '' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return (
    ADMIN_PAGES.find((page) => page.href === normalizedPath) ??
    ADMIN_PAGES.filter(
      (page) => page.href !== '/' && normalizedPath.startsWith(`${page.href}/`),
    ).sort((left, right) => right.href.length - left.href.length)[0]
  );
}
