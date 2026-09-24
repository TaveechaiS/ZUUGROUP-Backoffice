'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { APP_CONFIG } from '@/config/app';
import { ADMIN_PAGES, getAdminPage, type AdminPage } from '@/config/navigation';
import { CustomerSecondarySidebar, Sidebar } from '@/components/layout/sidebar';

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = usePathname();
  const page: AdminPage = getAdminPage(currentPath) ?? ADMIN_PAGES[0];

  return (
    <main className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <section
        className={`${collapsed ? 'min-h-[calc(100vh-64px)]' : 'min-h-[calc(100vh-102px)]'} border-t-[10px] border-[var(--blue-700)] bg-[var(--blue-700)] md:min-h-screen ${collapsed ? 'md:ml-[var(--collapsed-sidebar-width)]' : 'md:ml-[var(--expanded-sidebar-width)]'}`}
      >
        <header className="relative z-[3] flex min-h-20 items-center justify-between gap-6 border-b border-[#d7e3f0] bg-[var(--blue-50)] px-4 py-2.5 md:sticky md:top-0 md:min-h-23 md:rounded-tl-[25px] md:px-7.5 md:py-0">
          <div>
            <h1 className="m-0 text-lg leading-[1.35] poppins-bold text-[#111827] md:text-xl">
              {page.label}
            </h1>
            <p className="mt-0.5 max-w-47.5 text-xs text-[var(--ink-950)] md:max-w-none md:text-sm">
              {page.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#59677e] md:gap-5">
            <time
              className="flex items-center gap-1 whitespace-nowrap md:gap-[9px] md:text-sm"
              dateTime={new Date().toISOString().slice(0, 10)}
            >
              <svg
                className="h-[17px] w-[17px] fill-none stroke-[#5a6982] stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round] md:h-5.5 md:w-5.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect x="3.5" y="5" width="17" height="16" rx="2" />
                <path d="M7.5 3v4M16.5 3v4M3.5 10h17" />
              </svg>
              {new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: APP_CONFIG.timeZone,
              }).format(new Date())}
            </time>
            <span className="h-7 w-px bg-[#8994a3] opacity-80 md:h-11.5" />
            <span
              className="grid h-6 w-6 place-items-center rounded-full border border-[var(--blue-200)] bg-white md:h-9 md:w-9"
              aria-label="การแจ้งเตือน"
            >
              <svg
                className="h-3.5 w-3.5 fill-none stroke-[#17263b] stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round] md:h-4.5 md:w-4.5"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                <circle className="fill-[#e23535] stroke-white stroke-2" cx="18" cy="6" r="4" />
              </svg>
            </span>
            <span className="h-7 w-px bg-[#8994a3] opacity-80 md:h-11.5" />
            <span className="flex items-center gap-2.5 poppins-semibold">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white bg-[#0875bb] text-xs font-[650] text-white md:h-9 md:w-9"
                aria-hidden="true"
              >
                A
              </span>
              <span className="hidden gap-px text-xs text-[var(--ink-950)] md:grid">
                <strong>ผู้ดูแลระบบ</strong>
                <small className="text-xs poppins-regular text-[var(--ink-700)]">Admin</small>
              </span>
              <svg
                className="ml-3 hidden h-2 w-3.5 md:block"
                viewBox="0 0 14 8"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 1L7 7L13 1"
                  stroke="#101828"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </header>
        <div
          className={`flex flex-col ${collapsed ? 'min-h-[calc(100vh-144px)]' : 'min-h-[calc(100vh-182px)]'} bg-white md:min-h-[calc(100vh-92px)] xl:flex-row`}
        >
          {currentPath.startsWith('/customers') && <CustomerSecondarySidebar />}
          <div className="flex min-w-0 flex-1 flex-col px-4.5 py-3.5 md:px-7.5 md:pb-4.5 md:pt-6">
            {children}
            <footer className="flex items-center gap-2 border-t border-[var(--line)] pt-3 text-xs text-[#95a1b2]">
              เขตเวลา {APP_CONFIG.timeZone} <span>·</span> {APP_CONFIG.name}
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}

export function DashboardPlaceholder() {
  return (
    <div
      className="flex min-h-[400px] flex-1 flex-col items-center justify-center px-2 pb-[42px] pt-7 text-center md:min-h-[480px] md:px-5 md:pb-[62px] md:pt-9"
      aria-label="พื้นที่ Dashboard ยังไม่มีข้อมูล"
    >
      <div className="relative mb-[15px] h-[150px] w-[184px]" aria-hidden="true">
        <div className="absolute left-[21px] top-[9px] h-[116px] w-[142px] -rotate-[19deg] rounded-full border border-[var(--blue-100)]" />
        <div className="absolute left-[14px] top-6 h-[91px] w-[153px] rotate-[23deg] rounded-full border border-[#e9eff8]" />
        <div className="absolute left-[34px] top-[25px] h-[104px] w-[92px] -rotate-[11deg] rounded-[10px] border border-[#dbe6f2] bg-[var(--blue-50)] shadow-[0_8px_25px_rgb(33_73_119_/_8%)]" />
        <div className="absolute left-[61px] top-7 flex h-[104px] w-[92px] rotate-[6deg] flex-col gap-2 rounded-[10px] border border-[#dbe6f2] bg-white px-3 py-[14px] shadow-[0_8px_25px_rgb(33_73_119_/_8%)]">
          <span className="block h-[5px] w-[62px] rounded-[3px] bg-[var(--blue-200)]" />
          <span className="block h-1 w-[42px] rounded-[3px] bg-[#d8e2ee]" />
          <span className="mt-[3px] block h-1 w-[62px] rounded-[3px] bg-[#e7edf5]" />
          <span className="mt-[3px] block h-1 w-[46px] rounded-[3px] bg-[#e7edf5]" />
          <span className="mt-[3px] block h-1 w-[62px] rounded-[3px] bg-[#e7edf5]" />
        </div>
        <span className="absolute right-6 top-[15px] text-2xl text-[var(--blue-500)]">✦</span>
        <span className="absolute bottom-[19px] left-[15px] text-2xl text-[var(--blue-300)]">
          ✧
        </span>
      </div>
      <h2 className="m-0 text-base font-[650] text-[var(--ink-950)]">
        Dashboard กำลังเตรียมข้อมูล
      </h2>
      <p className="mb-[18px] mt-2 max-w-[320px] text-xs leading-[1.8] text-[var(--ink-500)] md:max-w-[450px]">
        หน้านี้จะสรุปภาพรวมหลังจากจัดทำโมดูลข้อมูลย่อยเรียบร้อยแล้ว
      </p>
      <span className="inline-flex max-w-full items-center gap-[7px] rounded-[7px] border border-[#e7edf5] bg-white px-3 py-2 text-xs text-[var(--ink-700)]">
        <span className="h-[6px] w-[6px] rounded-full bg-[var(--blue-500)]" />{' '}
        เริ่มจากจัดทำข้อมูลหลักและการทำงานแต่ละส่วน
      </span>
    </div>
  );
}

export function ModulePlaceholder({ page }: { page: AdminPage }) {
  return (
    <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center px-[10px] py-9 text-center md:min-h-[480px] md:px-5 md:py-12">
      <span
        className="mb-5 flex h-[68px] w-[68px] items-center justify-center gap-1 rounded-[20px] border border-[var(--blue-100)] bg-[linear-gradient(145deg,#fff,var(--blue-50))] shadow-[0_8px_24px_rgb(33_73_119_/_6%)]"
        aria-hidden="true"
      >
        <span className="h-6 w-[5px] rounded bg-[var(--blue-300)]" />
        <span className="h-[34px] w-[5px] rounded bg-[var(--blue-600)]" />
        <span className="h-4 w-[5px] rounded bg-[var(--blue-400)]" />
      </span>
      <span className="rounded-full border border-[var(--blue-100)] bg-[var(--blue-50)] px-[9px] py-[5px] text-xs poppins-semibold text-[var(--blue-800)]">
        เตรียมโครงหน้าแล้ว
      </span>
      <h2 className="mt-[14px] text-lg font-[650] text-[var(--ink-950)]">หน้า{page.label}</h2>
      <p className="mt-2 max-w-[430px] text-xs leading-[1.8] text-[var(--ink-500)]">
        หน้านี้เตรียมไว้สำหรับส่วนงาน{page.label} รายละเอียดและการจัดการข้อมูลจะทำตามลำดับโครงการ
      </p>
    </div>
  );
}
