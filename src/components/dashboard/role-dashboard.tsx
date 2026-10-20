'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { moduleFor } from '@/features/records/types';
import { Get } from '@/service/http';
import LoadingComponent from '@/components/ui/loading-component';
import NotFoundComponent from '@/components/ui/not-found-component';
import StatusBadge from '@/components/ui/status-badge';
import { dateTime, money } from '@/components/sales/document-ui';
import {
  AgingChart,
  Card,
  CardLink,
  RankList,
  StatCard,
  TaskList,
  TrendChart,
  thaiDay,
} from '@/components/dashboard/dashboard-ui';
import type { Dashboard, DashboardResponse } from '@/types/api/reports';

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const icons = {
  sales: 'M4 19V9m6 10V5m6 14v-7m4 7H2',
  orders: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h6M9 16h6',
  debt: 'M3 7h18v12H3zM3 11h18M7 15h3',
  received: 'M12 3v12m0 0-4-4m4 4 4-4M4 21h16',
  tasks: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  late: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
};

function percentChange(current: string, previous: string) {
  const before = Number(previous);
  return before ? ((Number(current) - before) / before) * 100 : null;
}

export default function RoleDashboard() {
  const [data, setData] = useState<Dashboard | null>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  const reload = () => setRetry((value) => value + 1);
  useEffect(() => {
    const controller = new AbortController();
    Get<DashboardResponse>('/api/dashboard', controller.signal)
      .then((r) => {
        setData(r.data);
        setError('');
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [retry]);
  if (!data)
    return (
      <section className="p-6">
        {!error && <LoadingComponent isVisible />}
        {error && (
          <div role="alert">
            {error}
            <button
              onClick={() => {
                setError('');
                reload();
              }}
              className="ml-3 text-blue-700 underline"
            >
              ลองใหม่
            </button>
          </div>
        )}
      </section>
    );

  const { sales, finance, inventory, tasks } = data;
  const pending = tasks.reduce((sum, task) => sum + task.count, 0);
  const late = tasks.find((task) => task.key === 'followLate')?.count ?? 0;

  return (
    <section className="flex flex-1 flex-col gap-6 bg-[#f7f9fc] p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-xl poppins-semibold text-[#26364b]">
            {data.mine ? 'งานของฉัน' : 'ภาพรวมระบบ'}
          </h2>
          <p className="m-0 mt-1 text-sm text-[#718096]">ข้อมูล ณ วันที่ {thaiDay(data.today)}</p>
        </div>
        <button
          type="button"
          onClick={reload}
          className="rounded-lg border border-[#d9e3ee] bg-white px-4 py-2 text-sm poppins-medium text-[#344256] hover:bg-gray-50"
        >
          รีเฟรช
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={data.mine ? 'ยอดขายของฉันเดือนนี้' : 'ยอดคำสั่งซื้อเสร็จสิ้นเดือนนี้'}
          value={money(sales.total)}
          unit="บาท"
          hint="เทียบช่วงเดียวกันเดือนก่อน"
          change={percentChange(sales.total, sales.prevTotal)}
          tone="blue"
          icon={<Icon d={icons.sales} />}
          href="/reports/sales"
        />
        <StatCard
          label={data.mine ? 'คำสั่งซื้อของฉันที่เสร็จสิ้นเดือนนี้' : 'คำสั่งซื้อเสร็จสิ้นเดือนนี้'}
          value={sales.orders.toLocaleString('th-TH')}
          unit="รายการ"
          hint={`เดือนก่อนช่วงเดียวกัน ${sales.prevOrders.toLocaleString('th-TH')} รายการ`}
          tone="emerald"
          icon={<Icon d={icons.orders} />}
          href="/orders"
        />
        {finance ? (
          <>
            <StatCard
              label="ลูกหนี้คงค้าง"
              value={money(finance.outstanding)}
              unit="บาท"
              hint={`เกินกำหนด ${money(finance.overdue)} บาท`}
              tone={Number(finance.overdue) > 0 ? 'red' : 'orange'}
              icon={<Icon d={icons.debt} />}
              href="/reports/finance"
            />
            <StatCard
              label="รับชำระเดือนนี้"
              value={money(finance.receivedThisMonth)}
              unit="บาท"
              hint={`${finance.paymentsThisMonth.toLocaleString('th-TH')} รายการรับชำระ`}
              tone="emerald"
              icon={<Icon d={icons.received} />}
              href="/billing"
            />
          </>
        ) : (
          <>
            <StatCard
              label="งานที่รอดำเนินการ"
              value={pending.toLocaleString('th-TH')}
              unit="รายการ"
              hint="รวมทุกงานในรายการด้านล่าง"
              tone="orange"
              icon={<Icon d={icons.tasks} />}
              href="/quotes"
            />
            <StatCard
              label="ติดตามลูกค้าเกินนัด"
              value={late.toLocaleString('th-TH')}
              unit="ราย"
              hint="สถานะรอติดตามที่เลยวันนัด"
              tone={late ? 'red' : 'emerald'}
              icon={<Icon d={icons.late} />}
              href="/customers/dashboard"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title={data.mine ? 'ยอดขายของฉัน 12 เดือน' : 'ยอดคำสั่งซื้อเสร็จสิ้น 12 เดือน'}
          action={<CardLink href="/reports/sales">ดูรายงาน</CardLink>}
          className="lg:col-span-2"
        >
          <TrendChart trend={sales.trend} />
        </Card>
        <Card title="งานที่รอดำเนินการ">
          <TaskList tasks={tasks} />
        </Card>
      </div>

      <div className={`grid gap-4 ${finance ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {finance && (
          <Card title="อายุลูกหนี้" action={<CardLink href="/reports/finance">ดูรายงาน</CardLink>}>
            <AgingChart finance={finance} />
          </Card>
        )}
        <Card title="สินค้าขายดีเดือนนี้">
          <RankList
            rows={sales.topProducts.map((row) => ({
              id: row.id,
              name: row.name,
              total: row.total,
              detail: `${row.quantity.toLocaleString('th-TH')} ${row.unit}`.trim(),
            }))}
            empty="ยังไม่มีสินค้าขายเดือนนี้"
            onRefresh={reload}
          />
        </Card>
        <Card title="ลูกค้ายอดสูงเดือนนี้">
          <RankList
            rows={sales.topCustomers.map((row) => ({
              id: row.id,
              name: row.name,
              total: row.total,
              detail: `${row.orders.toLocaleString('th-TH')} คำสั่งซื้อ`,
            }))}
            empty="ยังไม่มีลูกค้าซื้อเดือนนี้"
            onRefresh={reload}
          />
        </Card>
      </div>

      {inventory && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card
            title={`ล็อตใกล้หมดอายุ (${inventory.expiringCount.toLocaleString('th-TH')})`}
            action={<CardLink href="/reports/inventory">ดูทั้งหมด</CardLink>}
          >
            {inventory.expiring.length ? (
              <ul className="m-0 grid list-none gap-3 p-0">
                {inventory.expiring.map((lot) => (
                  <li
                    key={lot.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#e3e9f0] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="m-0 truncate text-sm poppins-medium text-[#26364b]">
                        {lot.productName}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-[#718096]">
                        ล็อต {lot.lotNumber} · หมดอายุ {thaiDay(lot.expiresOn)} · คงเหลือ{' '}
                        {lot.quantity.toLocaleString('th-TH')}
                      </p>
                    </div>
                    <StatusBadge
                      value={
                        lot.daysLeft > 0
                          ? `เหลือ ${lot.daysLeft} วัน`
                          : lot.daysLeft === 0
                            ? 'หมดอายุวันนี้'
                            : `หมดอายุแล้ว ${-lot.daysLeft} วัน`
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <NotFoundComponent
                title="ไม่มีล็อตใกล้หมดอายุ"
                description={`ไม่มีล็อตคงเหลือที่หมดอายุภายใน ${inventory.expiryDays} วัน`}
                onRefresh={reload}
              />
            )}
          </Card>
          <Card
            title={`สินค้าใกล้หมด (${inventory.lowStockCount.toLocaleString('th-TH')})`}
            action={<CardLink href="/reports/inventory">ดูทั้งหมด</CardLink>}
          >
            {inventory.lowStock.length ? (
              <ul className="m-0 grid list-none gap-3 p-0">
                {inventory.lowStock.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#e3e9f0] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="m-0 truncate text-sm poppins-medium text-[#26364b]">
                        {product.name}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-[#718096]">
                        {product.code} · คลังหลัก {product.main.toLocaleString('th-TH')}{' '}
                        {product.unit}
                      </p>
                    </div>
                    <StatusBadge value={product.main === 0 ? 'สินค้าหมด' : 'สินค้าใกล้หมด'} />
                  </li>
                ))}
              </ul>
            ) : (
              <NotFoundComponent
                title="ไม่มีสินค้าใกล้หมด"
                description={`สินค้าทุกตัวในคลังหลักมีมากกว่า ${inventory.lowStockLevel} หน่วย`}
                onRefresh={reload}
              />
            )}
          </Card>
        </div>
      )}

      <Card title="เอกสารล่าสุด">
        {data.activity.length ? (
          <div className="-m-5 divide-y divide-[#e3e9f0]">
            {data.activity.map((row) => (
              <Link
                key={row.module + row.id}
                href={moduleFor(row.module)!.page + '/' + row.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-[#f7f9fc]"
              >
                <div>
                  <p className="m-0 text-sm poppins-medium text-[#26364b]">
                    {row.code} · {row.name}
                  </p>
                  <p className="mb-0 mt-1 text-xs text-[#718096]">{dateTime(row.createdAt)}</p>
                </div>
                <StatusBadge value={row.status} />
              </Link>
            ))}
          </div>
        ) : (
          <NotFoundComponent title="ยังไม่มีเอกสารล่าสุด" onRefresh={reload} />
        )}
      </Card>
    </section>
  );
}
