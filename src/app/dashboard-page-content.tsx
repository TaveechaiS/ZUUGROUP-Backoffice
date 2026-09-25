'use client';

import { useState } from 'react';
import { DASHBOARD_MOCK } from './data';
import { ActivityRow } from '@/components/pages/module-list-page';

export function DashboardPageContent() {
  const [period, setPeriod] = useState('เดือนนี้');
  return (
    <section className="flex flex-1 flex-col gap-6 p-6 pb-8" aria-label="Dashboard ข้อมูลจำลอง">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#e0e5eb] bg-[#f5f6f8] px-6 py-4">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#64748b]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#357ece]" />
          ข้อมูลจำลอง · สำหรับนำเสนอ
        </span>
        <label className="flex items-center gap-2 text-xs font-medium text-[#556273]">
          ช่วงเวลา
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-10 min-w-[130px] rounded-md border border-[#dce4ed] bg-white px-3 text-sm font-normal text-[#35465d] outline-none focus:border-[#5b9ddb]"
          >
            <option>เดือนนี้</option>
            <option>สัปดาห์นี้</option>
            <option>ปีนี้</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_MOCK.metrics.map((metric, index) => (
          <article
            key={metric.label}
            className="relative overflow-hidden rounded-xl border border-[#e2e9f1] bg-white p-6"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="m-0 text-sm font-medium text-[#718096]">{metric.label}</p>
              <span
                className={`rounded-md px-2 py-1 text-xs font-semibold ${index === 3 ? 'bg-[#fff6e9] text-[#936622]' : 'bg-[#edf7f1] text-[#347555]'}`}
              >
                {metric.change}
              </span>
            </div>
            <p className="mb-0 mt-4 text-2xl font-semibold tracking-tight text-[#172b45] tabular-nums">
              {metric.value}
            </p>
            <p className="mb-0 mt-1.5 text-xs text-[#98a4b3]">{metric.note}</p>
            <span
              className={`absolute bottom-0 left-0 h-[3px] w-full ${index === 3 ? 'bg-[#d9a54e]' : 'bg-[#5b9ddb]'}`}
            />
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <section className="rounded-xl border border-[#e2e9f1] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="m-0 text-base font-semibold text-[#26364b]">แนวโน้มยอดขาย</h3>
              <p className="mb-0 mt-1 text-sm text-[#8492a6]">แสดงตัวอย่างประจำ{period}</p>
            </div>
            <span className="text-sm font-semibold text-[#347555]">
              +8.2% <span className="font-normal text-[#98a4b3]">เทียบช่วงก่อน</span>
            </span>
          </div>
          <div className="mt-6 flex h-[190px] items-end gap-2 border-b border-l border-[#e8eef4] px-2 pb-0 sm:gap-4 sm:px-4">
            {[38, 52, 44, 68, 58, 78, 62, 88, 72, 94, 77, 100].map((height, index) => (
              <div key={index} className="group flex h-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-[4px] transition-colors ${index === 9 ? 'bg-[#1a58a7]' : 'bg-[#c9def2] group-hover:bg-[#8cbde7]'}`}
                  style={{ height: `${height}%` }}
                  title={`ข้อมูลตัวอย่าง ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="ml-2 mt-2 flex justify-between text-xs text-[#a1adbb] sm:ml-4">
            <span>1 ก.ย.</span>
            <span>8 ก.ย.</span>
            <span>15 ก.ย.</span>
            <span>22 ก.ย.</span>
            <span>วันนี้</span>
          </div>
        </section>

        <section className="rounded-xl border border-[#e2e9f1] bg-white p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="m-0 text-base font-semibold text-[#26364b]">คำสั่งซื้อแยกตามสถานะ</h3>
              <p className="mb-0 mt-1 text-sm text-[#8492a6]">สัดส่วนจำลอง</p>
            </div>
            <span className="text-sm text-[#8492a6]">128 รายการ</span>
          </div>
          <div className="mt-6 space-y-4">
            {[
              ['จัดส่งครบ', '72%', 'bg-[#5b9ddb]', '92 รายการ'],
              ['กำลังดำเนินการ', '18%', 'bg-[#d9a54e]', '23 รายการ'],
              ['รออนุมัติ', '10%', 'bg-[#b7c4d3]', '13 รายการ'],
            ].map(([label, width, color, count]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between gap-2 text-sm">
                  <span className="text-[#526176]">{label}</span>
                  <span className="text-[#8492a6]">
                    {count} · {width}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#edf1f5]">
                  <div className={`h-full rounded-full ${color}`} style={{ width }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-[#f7f9fc] px-4 py-3 text-sm leading-6 text-[#718096]">
            ตัวเลข กราฟ และสถานะทั้งหมดเป็นข้อมูลสมมุติเพื่อใช้ประกอบการนำเสนอ
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e2e9f1] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e9eef4] px-6 py-5">
          <div>
            <h3 className="m-0 text-base font-semibold text-[#26364b]">รายการที่ควรติดตาม</h3>
            <p className="mb-0 mt-1 text-sm text-[#8492a6]">ตัวอย่างเหตุการณ์ล่าสุด</p>
          </div>
          <span className="text-sm text-[#8492a6]">ดูทั้งหมด →</span>
        </div>
        <div className="divide-y divide-[#edf1f5]">
          {DASHBOARD_MOCK.activity.map((item) => (
            <ActivityRow key={item.ref} item={item} />
          ))}
        </div>
      </section>
    </section>
  );
}
