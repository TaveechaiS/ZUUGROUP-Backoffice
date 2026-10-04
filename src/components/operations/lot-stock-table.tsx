'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import type { LotRow, StockRow } from '@/types/api/operations';
import StatusBadge from '@/components/ui/status-badge';
import { dateOnly, money } from './shared';

export default function LotStockTable({
  rows,
  canCost,
  admin,
  warningDays,
  onAction,
}: {
  rows: LotRow[];
  canCost: boolean;
  admin: boolean;
  warningDays: number;
  onAction: (row: StockRow, action: string) => void;
}) {
  const [expanded, setExpanded] = useState('');
  const columns = [
    'เลขล็อต',
    'สินค้า',
    'คลัง',
    'คงเหลือ',
    'จอง',
    'พร้อมใช้',
    'วันผลิต',
    'วันหมดอายุ',
    'สถานะ',
    ...(canCost ? ['ต้นทุนล็อต'] : []),
  ];
  const labels: Record<string, string> = {
    transfer: 'โอนคลัง',
    adjust: 'ปรับยอด',
    correct: 'แก้ข้อมูลรับเข้า',
    condition: 'สภาพสินค้า',
    give: 'แจก / บริจาค',
  };
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return (
    <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
      <thead className="bg-[#f8f9fb] text-xs text-[#65758b]">
        <tr>
          {columns.map((label) => (
            <th key={label} scope="col" className="px-4 py-3 poppins-semibold">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const toggle = () => setExpanded((value) => (value === row.lotId ? '' : row.lotId));
          const days = (Date.parse(row.expiresOn) - Date.parse(today)) / 86400000;
          const age = days <= 0 ? 'หมดอายุ' : days <= warningDays ? 'ใกล้หมดอายุ' : '';
          return (
            <Fragment key={row.lotId}>
              <tr
                role="button"
                tabIndex={0}
                aria-expanded={expanded === row.lotId}
                aria-label={`ดูล็อต ${row.lotNumber} ของ ${row.productName}`}
                onClick={toggle}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                  }
                }}
                className="cursor-pointer border-t border-[#edf0f4] hover:bg-[#fafbfc] focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-[#1a58a7]"
              >
                <td className="px-4 py-3 text-[#1a58a7] poppins-medium">{row.lotNumber}</td>
                <td className="px-4 py-3">
                  {row.productName}
                  <small className="block text-[#718096]">{row.productCode}</small>
                </td>
                <td className="px-4 py-3">
                  {row.balances
                    .filter((b) => b.quantity > 0)
                    .map((b) => b.warehouseName)
                    .join(', ') || '-'}
                </td>
                <td className="px-4 py-3 tabular-nums">{row.quantity}</td>
                <td className="px-4 py-3 tabular-nums">{row.reserved}</td>
                <td className="px-4 py-3 tabular-nums">{row.available}</td>
                <td className="px-4 py-3">{dateOnly(row.manufacturedOn)}</td>
                <td className="px-4 py-3">{dateOnly(row.expiresOn)}</td>
                <td className="px-4 py-3">
                  <StatusBadge value={row.status} />
                  {age && age !== row.status && (
                    <div className="mt-1">
                      <StatusBadge value={age} />
                    </div>
                  )}
                </td>
                {canCost && (
                  <td className="px-4 py-3">
                    {money(row.totalCost)}
                    <small className="block text-[#718096]">ต่อหน่วย {money(row.unitCost)}</small>
                  </td>
                )}
              </tr>
              {expanded === row.lotId && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="border-t border-blue-100 bg-blue-50/50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          className="text-[#1a58a7] poppins-medium"
                          href={'/products/' + encodeURIComponent(row.productCode)}
                        >
                          ดูข้อมูลสินค้า {row.productName}
                        </Link>
                        <p className="mt-1 text-xs text-[#65758b]">
                          รับเข้า {row.receiptCode} · จำนวนรับเข้า {row.receivedQuantity} {row.unit}{' '}
                          · แหล่งที่มา {row.source || '-'}
                        </p>
                        <p className="mt-1 break-all text-xs text-[#65758b]">
                          Lot ID: {row.lotId} · รับเข้า ID: {row.receiptId}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpanded('')}
                        className="text-sm text-[#65758b]"
                      >
                        ปิดรายละเอียด
                      </button>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {row.balances.map((balance) => (
                        <div
                          key={balance.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#d9e3ee] bg-white p-3"
                        >
                          <p className="text-sm">
                            <span className="poppins-medium">{balance.warehouseName}</span>
                            <span className="ml-3 text-[#65758b]">
                              คงเหลือ {balance.quantity} · จอง {balance.reserved} · พร้อมใช้{' '}
                              {balance.available}
                            </span>
                          </p>
                          {admin && (
                            <div className="flex flex-wrap gap-2">
                              {[
                                'transfer',
                                'adjust',
                                'correct',
                                'condition',
                                ...(balance.warehouseCode === 'MARKETING' ? ['give'] : []),
                              ].map((action) => (
                                <button
                                  type="button"
                                  key={action}
                                  onClick={() => onAction(balance, action)}
                                  className="rounded-md border border-[#d9e3ee] px-3 py-1.5 text-xs text-[#1a58a7] hover:bg-blue-50"
                                >
                                  {labels[action]}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
