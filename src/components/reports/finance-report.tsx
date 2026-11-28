'use client';

import Link from 'next/link';
import ReportTable, { count, type ReportColumn } from '@/components/reports/report-table';
import { dateOnly, money } from '@/components/sales/document-ui';

const amount = (key: string, label: string, sortable = false): ReportColumn => ({
  key: sortable ? key : null,
  label,
  align: 'right',
  render: (r) => money(r[key]),
});

const views = {
  aging: {
    title: 'อายุลูกหนี้',
    searchPlaceholder: 'ชื่อหรือรหัสลูกค้า',
    emptyTitle: 'ไม่มียอดค้างชำระ',
    totalLabel: 'ยอดค้างชำระรวม ณ วันนี้',
    columns: [
      {
        key: 'name',
        label: 'ลูกค้า',
        render: (r) => (
          <>
            <p>{String(r.name)}</p>
            <p className="mt-1 text-xs text-[#718096]">{String(r.code)}</p>
          </>
        ),
      },
      { key: 'invoices', label: 'ใบแจ้งหนี้', align: 'right', render: (r) => count(r.invoices) },
      amount('current', 'ยังไม่ถึงกำหนด'),
      amount('d30', '1–30 วัน'),
      amount('d60', '31–60 วัน'),
      amount('d90', '61–90 วัน'),
      amount('over90', 'เกิน 90 วัน'),
      amount('outstanding', 'รวมค้างชำระ', true),
    ],
  },
  payments: {
    title: 'รับชำระ',
    ranged: true,
    searchPlaceholder: 'เลขที่ใบแจ้งหนี้ ลูกค้า หรือเลขอ้างอิง',
    emptyTitle: 'ไม่มีการรับชำระในช่วงวันที่นี้',
    totalLabel: 'รับชำระรวม',
    columns: [
      { key: 'paidOn', label: 'วันที่รับ', render: (r) => dateOnly(String(r.paidOn)) },
      {
        key: 'invoiceCode',
        label: 'ใบแจ้งหนี้',
        render: (r) => (
          <Link
            href={'/billing/' + String(r.invoiceId)}
            className="whitespace-nowrap text-[#1a58a7] hover:underline"
          >
            {String(r.invoiceCode)}
          </Link>
        ),
      },
      { key: 'customerName', label: 'ลูกค้า', render: (r) => String(r.customerName) },
      { key: 'method', label: 'วิธีชำระ', render: (r) => String(r.method) },
      { key: null, label: 'อ้างอิง', render: (r) => String(r.reference || '—') },
      amount('amount', 'จำนวนเงิน', true),
      { key: null, label: 'ผู้บันทึก', render: (r) => String(r.createdByName) },
    ],
  },
  expenses: {
    title: 'ค่าใช้จ่ายตามหมวด',
    ranged: true,
    searchPlaceholder: 'ชื่อหมวด',
    emptyTitle: 'ไม่มีค่าใช้จ่ายในช่วงวันที่นี้',
    totalLabel: 'ค่าใช้จ่ายรวม',
    columns: [
      { key: 'name', label: 'หมวด', render: (r) => String(r.name) },
      { key: 'count', label: 'จำนวนรายการ', align: 'right', render: (r) => count(r.count) },
      amount('amount', 'จำนวนเงิน (รวม VAT)', true),
    ],
  },
} satisfies Record<
  string,
  {
    title: string;
    searchPlaceholder: string;
    emptyTitle: string;
    totalLabel: string;
    ranged?: boolean;
    columns: ReportColumn[];
  }
>;

export default function FinanceReport({ view }: { view: keyof typeof views }) {
  return <ReportTable key={view} endpoint={'/api/reports/finance/' + view} {...views[view]} />;
}
