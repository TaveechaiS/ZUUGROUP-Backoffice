'use client';

import Link from 'next/link';
import ReportTable, { count, type ReportColumn } from '@/components/reports/report-table';
import { dateOnly, money } from '@/components/sales/document-ui';

const totals: ReportColumn[] = [
  { key: 'total', label: 'ยอดขาย (รวม VAT)', align: 'right', render: (r) => money(r.total) },
  { key: null, label: 'ยอดก่อน VAT', align: 'right', render: (r) => money(r.net) },
];
const margin: ReportColumn[] = [
  { key: 'cost', label: 'ต้นทุนขาย', align: 'right', costOnly: true, render: (r) => money(r.cost) },
  {
    key: 'profit',
    label: 'กำไรขั้นต้น',
    align: 'right',
    costOnly: true,
    render: (r) => (
      <span className={Number(r.profit) < 0 ? 'text-red-600' : ''}>{money(r.profit)}</span>
    ),
  },
];
const orders: ReportColumn = {
  key: 'orders',
  label: 'คำสั่งซื้อ',
  align: 'right',
  render: (r) => count(r.orders),
};
const name = (r: Record<string, unknown>) => (
  <>
    <p>{String(r.name ?? '-')}</p>
    {Boolean(r.code) && <p className="mt-1 text-xs text-[#718096]">{String(r.code)}</p>}
  </>
);

const views = {
  summary: {
    title: 'สรุปยอดขาย',
    searchPlaceholder: 'ชื่อหรือรหัสลูกค้า / สินค้า',
    emptyTitle: 'ไม่มียอดขายในช่วงวันที่นี้',
    columns: [
      { key: 'soldOn', label: 'วันที่ขาย', render: (r) => dateOnly(String(r.soldOn)) },
      orders,
      { key: 'quantity', label: 'จำนวนสินค้า', align: 'right', render: (r) => count(r.quantity) },
      ...totals,
      ...margin,
    ],
  },
  products: {
    title: 'ยอดขายตามสินค้า',
    searchPlaceholder: 'ชื่อหรือรหัสสินค้า',
    emptyTitle: 'ไม่พบยอดขายสินค้าในช่วงวันที่นี้',
    columns: [
      { key: 'name', label: 'สินค้า', render: name },
      {
        key: 'quantity',
        label: 'จำนวนที่ขาย',
        align: 'right',
        render: (r) => `${count(r.quantity)} ${String(r.unit ?? '')}`,
      },
      orders,
      ...totals,
      ...margin,
    ],
  },
  customers: {
    title: 'ยอดขายตามลูกค้า',
    searchPlaceholder: 'ชื่อหรือรหัสลูกค้า',
    emptyTitle: 'ไม่พบยอดขายลูกค้าในช่วงวันที่นี้',
    columns: [
      { key: 'name', label: 'ลูกค้า', render: name },
      { key: 'territoryName', label: 'เขตขาย', render: (r) => String(r.territoryName ?? '-') },
      orders,
      ...totals,
      ...margin,
    ],
  },
  sellers: {
    title: 'ยอดขายตามผู้ขาย',
    searchPlaceholder: 'ชื่อหรือรหัสพนักงาน',
    emptyTitle: 'ไม่พบยอดขายของผู้ขายในช่วงวันที่นี้',
    columns: [
      { key: 'name', label: 'ผู้ขาย', render: name },
      orders,
      { key: 'customers', label: 'ลูกค้า', align: 'right', render: (r) => count(r.customers) },
      ...totals,
      ...margin,
    ],
  },
  details: {
    title: 'รายละเอียดรายการขาย',
    searchPlaceholder: 'เลขที่คำสั่งซื้อ ลูกค้า หรือสินค้า',
    emptyTitle: 'ไม่พบรายการขายในช่วงวันที่นี้',
    columns: [
      { key: 'soldOn', label: 'วันที่ขาย', render: (r) => dateOnly(String(r.soldOn)) },
      {
        key: 'orderCode',
        label: 'เลขที่คำสั่งซื้อ',
        render: (r) => (
          <Link
            href={'/orders/' + String(r.orderId)}
            className="whitespace-nowrap text-[#1a58a7] hover:underline"
          >
            {String(r.orderCode)}
          </Link>
        ),
      },
      { key: 'customerName', label: 'ลูกค้า', render: (r) => String(r.customerName) },
      {
        key: 'productName',
        label: 'สินค้า',
        render: (r) => name({ name: r.productName, code: r.productCode }),
      },
      {
        key: 'quantity',
        label: 'จำนวน',
        align: 'right',
        render: (r) => `${count(r.quantity)} ${String(r.unit ?? '')}`,
      },
      { key: null, label: 'ราคา/หน่วย', align: 'right', render: (r) => money(r.unitPrice) },
      {
        key: null,
        label: 'ส่วนลด',
        align: 'right',
        render: (r) => (Number(r.discount) ? money(r.discount) : '—'),
      },
      { key: 'total', label: 'ยอดรวม (รวม VAT)', align: 'right', render: (r) => money(r.total) },
      ...margin,
    ],
  },
} satisfies Record<
  string,
  { title: string; searchPlaceholder?: string; emptyTitle: string; columns: ReportColumn[] }
>;

export default function SalesReport({ view }: { view: keyof typeof views }) {
  const config = views[view];
  return (
    <ReportTable
      key={view}
      endpoint={'/api/reports/sales/' + view}
      ranged
      summary
      remoteFilters={[
        { key: 'territoryId', label: 'เขตขาย', source: 'territories' },
        { key: 'sellerId', label: 'ผู้ขาย', source: 'sellers' },
      ]}
      {...config}
    />
  );
}
