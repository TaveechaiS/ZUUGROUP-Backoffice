'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { APP_CONFIG } from '@/config/app';
import { ADMIN_PAGES, getAdminPage, type AdminPage } from '@/config/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { logout } from '@/app/login/actions';

export function AdminShell({
  children,
  account,
}: {
  children: ReactNode;
  account: { name: string; role: string; roleId: string } | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const currentPath = usePathname();
  const page: AdminPage = getAdminPage(currentPath) ?? ADMIN_PAGES[0];

  if (currentPath === '/login') return <>{children}</>;

  return (
    <main className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        roleId={account?.roleId ?? ''}
      />
      <section
        className={`${collapsed ? 'min-h-[calc(100vh-64px)]' : 'min-h-[calc(100vh-102px)]'} border-t-[10px] border-[var(--blue-700)] bg-[var(--blue-700)] md:min-h-screen ${collapsed ? 'md:ml-[var(--collapsed-sidebar-width)]' : 'md:ml-[var(--expanded-sidebar-width)]'}`}
      >
        <header className="relative z-[3] flex min-h-20 items-center justify-between gap-3 border-b border-[#d7e3f0] bg-[var(--blue-50)] px-4 py-2.5 md:sticky md:top-0 md:min-h-23 md:gap-6 md:rounded-tl-[25px] md:px-7.5 md:py-0">
          <div className="min-w-0 flex-1">
            <h1 className="m-0 break-words text-lg leading-[1.35] poppins-bold text-[#111827] md:text-xl">
              {page.label}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-xs text-[#59677e] md:gap-5">
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
            <span className="flex shrink-0 items-center gap-2.5 poppins-semibold">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white bg-[#0875bb] text-xs font-[650] text-white md:h-9 md:w-9"
                aria-hidden="true"
              >
                {account?.name.slice(0, 1) ?? 'U'}
              </span>
              <span className="hidden gap-px text-xs text-[var(--ink-950)] md:grid">
                <strong>{account?.name ?? 'ผู้ใช้งาน'}</strong>
                <small className="text-xs poppins-regular text-[var(--ink-700)]">
                  {account?.role ?? ''}
                </small>
              </span>
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-[#d7e3f0] px-2 py-1.5 text-xs text-[#344256] hover:bg-white"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </header>
        <div
          className={`flex flex-col ${collapsed ? 'min-h-[calc(100vh-144px)]' : 'min-h-[calc(100vh-182px)]'} bg-white md:min-h-[calc(100vh-92px)]`}
        >
          <div className="flex min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </section>
    </main>
  );
}
