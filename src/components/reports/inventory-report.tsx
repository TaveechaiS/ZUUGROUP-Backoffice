'use client';

import Link from 'next/link';
import StatusBadge from '@/components/ui/status-badge';
import ReportTable, {
  count,
  type ReportColumn,
  type ReportFilter,
} from '@/components/reports/report-table';
import { dateOnly, dateTime, money } from '@/components/sales/document-ui';

type Row = Record<string, unknown>;
const warehouses: ReportFilter = {
  key: 'warehouseCode',
  label: 'คลัง',
  options: [
    ['MAIN', 'คลังหลัก'],
    ['MARKETING', 'คลังการตลาด'],
    ['DISPOSAL', 'คลังรอทำลาย'],
  ],
};
const product = (r: Row) => (
  <>
    <Link
      href={'/products/' + encodeURIComponent(String(r.code ?? r.productCode))}
      className="text-[#1a58a7] hover:underline"
    >
      {String(r.name ?? r.productName)}
    </Link>
    <p className="mt-1 text-xs text-[#718096]">{String(r.code ?? r.productCode)}</p>
  </>
);
const lot = (r: Row) => (
  <>
    <Link
      href={'/products/stock/receipts/' + String(r.lotId)}
      className="whitespace-nowrap text-[#1a58a7] hover:underline"
    >
      {String(r.receiptCode)}
    </Link>
    <p className="mt-1 text-xs text-[#718096]">ล็อต {String(r.lotNumber)}</p>
  </>
);
const units = (key: string) => (r: Row) => `${count(r[key])} ${String(r.unit ?? '')}`;
const daysLabel = (days: number) =>
  days > 0 ? `เหลือ ${days} วัน` : days === 0 ? 'หมดอายุวันนี้' : `หมดอายุแล้ว ${-days} วัน`;

const views = {
  summary: {
    title: 'สรุปคงเหลือ',
    searchPlaceholder: 'ชื่อหรือรหัสสินค้า',
    emptyTitle: 'ไม่พบสินค้า',
    columns: [
      { key: 'name', label: 'สินค้า', render: product },
      { key: 'main', label: 'คลังหลัก', align: 'right', render: units('main') },
      { key: null, label: 'จอง', align: 'right', render: (r) => count(r.reserved) },
      { key: 'available', label: 'พร้อมขาย', align: 'right', render: (r) => count(r.available) },
      { key: 'marketing', label: 'คลังการตลาด', align: 'right', render: (r) => count(r.marketing) },
      { key: 'disposal', label: 'คลังรอทำลาย', align: 'right', render: (r) => count(r.disposal) },
      { key: 'quantity', label: 'คงเหลือรวม', align: 'right', render: units('quantity') },
      {
        key: 'value',
        label: 'มูลค่าต้นทุน (บาท)',
        align: 'right',
        costOnly: true,
        render: (r) => money(r.value),
      },
    ],
  },
  movements: {
    title: 'ความเคลื่อนไหวสินค้า',
    ranged: true,
    searchPlaceholder: 'สินค้า ID รับเข้า หรือเลขล็อต',
    emptyTitle: 'ไม่พบความเคลื่อนไหวในช่วงวันที่นี้',
    filters: [
      {
        key: 'kind',
        label: 'ประเภท',
        options: ['รับเข้า', 'แก้รับเข้า', 'ขาย', 'โอนออก', 'โอนเข้า', 'ปรับยอด', 'ทำลายแล้ว'],
      },
      warehouses,
    ],
    columns: [
      { key: 'occurredAt', label: 'วันเวลา', render: (r) => dateTime(String(r.occurredAt)) },
      { key: 'kind', label: 'ประเภท', render: (r) => String(r.kind) },
      { key: 'productName', label: 'สินค้า', render: product },
      { key: null, label: 'ID รับเข้า / ล็อต', render: lot },
      { key: 'warehouseName', label: 'คลัง', render: (r) => String(r.warehouseName) },
      {
        key: 'quantity',
        label: 'จำนวน',
        align: 'right',
        render: (r) => (
          <span className={Number(r.quantity) < 0 ? 'text-red-600' : 'text-emerald-600'}>
            {Number(r.quantity) > 0 ? '+' : ''}
            {count(r.quantity)} {String(r.unit ?? '')}
          </span>
        ),
      },
      {
        key: null,
        label: 'เอกสารอ้างอิง',
        render: (r) =>
          r.orderId ? (
            <Link href={'/orders/' + String(r.orderId)} className="text-[#1a58a7] hover:underline">
              {String(r.reference)}
            </Link>
          ) : (
            String(r.reference || '—')
          ),
      },
      { key: null, label: 'ผู้บันทึก', render: (r) => String(r.actorName) },
    ],
  },
  expiry: {
    title: 'สินค้าใกล้หมดอายุ',
    searchPlaceholder: 'สินค้า ID รับเข้า หรือเลขล็อต',
    emptyTitle: 'ไม่มีสินค้าหมดอายุภายใน 90 วัน',
    filters: [warehouses],
    columns: [
      { key: 'productName', label: 'สินค้า', render: product },
      { key: null, label: 'ID รับเข้า / ล็อต', render: lot },
      { key: 'expiresOn', label: 'วันหมดอายุ', render: (r) => dateOnly(String(r.expiresOn)) },
      { key: 'warehouseName', label: 'คลัง', render: (r) => String(r.warehouseName) },
      { key: 'quantity', label: 'คงเหลือ', align: 'right', render: units('quantity') },
      {
        key: null,
        label: 'สถานะ',
        render: (r) => <StatusBadge value={daysLabel(Number(r.daysLeft))} />,
      },
    ],
  },
  'low-stock': {
    title: 'สินค้าคงเหลือต่ำ',
    searchPlaceholder: 'ชื่อหรือรหัสสินค้า',
    emptyTitle: 'ไม่มีสินค้าคงเหลือต่ำ',
    filters: [{ key: 'status', label: 'สถานะ', options: ['สินค้าใกล้หมด', 'สินค้าหมด'] }],
    columns: [
      { key: 'name', label: 'สินค้า', render: product },
      { key: 'main', label: 'คลังหลัก', align: 'right', render: units('main') },
      { key: null, label: 'จอง', align: 'right', render: (r) => count(r.reserved) },
      { key: 'available', label: 'พร้อมขาย', align: 'right', render: (r) => count(r.available) },
      { key: null, label: 'คลังการตลาด', align: 'right', render: (r) => count(r.marketing) },
      { key: 'quantity', label: 'คงเหลือรวม', align: 'right', render: units('quantity') },
      { key: null, label: 'สถานะ', render: (r) => <StatusBadge value={String(r.status)} /> },
    ],
  },
  counts: {
    title: 'ผลตรวจนับ',
    ranged: true,
    searchPlaceholder: 'รหัส ชื่อรอบ หรือผลตรวจนับ',
    emptyTitle: 'ไม่พบรอบตรวจนับในช่วงวันที่นี้',
    filters: [warehouses],
    columns: [
      {
        key: 'code',
        label: 'รหัส',
        render: (r) => (
          <Link
            href={'/stock-counts/' + String(r.id)}
            className="whitespace-nowrap text-[#1a58a7] hover:underline"
          >
            {String(r.code)}
          </Link>
        ),
      },
      { key: null, label: 'รอบตรวจนับ', render: (r) => String(r.name || '—') },
      { key: 'warehouseName', label: 'คลัง', render: (r) => String(r.warehouseName) },
      {
        key: null,
        label: 'ผลตรวจนับ (เทียบยอด ไม่ปรับยอด)',
        render: (r) => <p className="whitespace-pre-wrap">{String(r.resultText || '—')}</p>,
      },
      { key: 'createdAt', label: 'วันที่บันทึก', render: (r) => dateTime(String(r.createdAt)) },
      { key: 'status', label: 'สถานะ', render: (r) => <StatusBadge value={String(r.status)} /> },
    ],
  },
} satisfies Record<
  string,
  {
    title: string;
    searchPlaceholder: string;
    emptyTitle: string;
    ranged?: boolean;
    filters?: ReportFilter[];
    columns: ReportColumn[];
  }
>;

export default function InventoryReport({ view }: { view: keyof typeof views }) {
  return <ReportTable key={view} endpoint={'/api/reports/inventory/' + view} {...views[view]} />;
}
