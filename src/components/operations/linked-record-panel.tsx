'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Get } from '@/service/http';
import type { RecordRow, RecordListResponse } from '@/types/api/records';
import LoadingComponent from '@/components/ui/loading-component';

export default function LinkedRecordPanel({
  moduleKey,
  record,
}: {
  moduleKey: string;
  record: RecordRow;
}) {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (moduleKey !== 'sales-territories') return;
    let active = true;
    queueMicrotask(() => {
      if (active) setBusy(true);
    });
    const params = new URLSearchParams({
      territoryId: record.id,
      offset: String(offset),
      limit: '10',
    });
    Get<RecordListResponse>(`/customers?${params}`)
      .then((result) => {
        if (!active) return;
        setRows(result.data);
        setTotal(result.pagination.total);
        setError('');
      })
      .catch(() => {
        if (active) setError('โหลดลูกค้าในเขตไม่สำเร็จ');
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [moduleKey, record.id, offset]);
  const name = (key: string) => String(record[key] || '-');
  return (
    <section className="mt-6 border-t border-gray-100 pt-5">
      <h2 className="poppins-semibold mb-3 text-lg">ข้อมูลที่เชื่อมโยง</h2>
      <dl className="grid gap-3 text-sm md:grid-cols-3">
        {moduleKey === 'customers' && (
          <div>
            <dt className="text-gray-500">เขตขาย</dt>
            <dd>
              {record.territoryId ? (
                <Link
                  className="text-blue-600 underline"
                  href={`/customers/territories/${record.territoryId}`}
                >
                  {name('territoryName')}
                </Link>
              ) : (
                '-'
              )}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-gray-500">ผู้จัดการ (Manager)</dt>
          <dd>{name('managerName')}</dd>
        </div>
        <div>
          <dt className="text-gray-500">ฝ่ายขาย (Sales)</dt>
          <dd>{name('salesName')}</dd>
        </div>
      </dl>
      {moduleKey === 'sales-territories' && (
        <div className="mt-5">
          <h3 className="poppins-medium mb-2">ลูกค้าในเขต ({total})</h3>
          {error && (
            <p role="alert" className="text-red-600">
              {error}
            </p>
          )}
          {busy ? (
            <div className="relative min-h-32">
              <LoadingComponent isVisible variant="content" padding="py-12" />
            </div>
          ) : rows.length ? (
            <ul className="divide-y divide-gray-100">
              {rows.map((row) => (
                <li key={row.id}>
                  <Link
                    className="block py-3 text-blue-600 hover:bg-blue-50"
                    href={`/customers/${row.id}`}
                  >
                    {row.name} · {row.code}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">ยังไม่มีลูกค้าในเขตนี้</p>
          )}
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={busy || offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 10))}
              className="disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            <button
              type="button"
              disabled={busy || offset + 10 >= total}
              onClick={() => setOffset(offset + 10)}
              className="disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
