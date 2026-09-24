'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/config/app';
import {
  ADMIN_PAGES,
  CUSTOMER_SECONDARY_NAV,
  NAVIGATION_SECTIONS,
  type AdminPage,
} from '@/config/navigation';

const iconAssets: Record<string, { width: number; height: number }> = {
  dashboard: { width: 20, height: 20 },
  customers: { width: 24, height: 20 },
  products: { width: 22, height: 21 },
  purchases: { width: 21, height: 22 },
  quotes: { width: 18, height: 22 },
  orders: { width: 18, height: 22 },
  billing: { width: 18, height: 20 },
  promotions: { width: 20, height: 23 },
  'sales-report': { width: 20, height: 20 },
  'inventory-report': { width: 20, height: 23 },
  users: { width: 18, height: 20 },
  'audit-logs': { width: 22, height: 22 },
  settings: { width: 22, height: 22 },
};

function NavigationIcon({ name }: { name: string }) {
  const size = iconAssets[name];
  return (
    <Image
      aria-hidden="true"
      className="block shrink-0"
      src={`/icons/${name}.svg`}
      alt=""
      width={size.width}
      height={size.height}
    />
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const currentPath = usePathname();
  const mainPages = ADMIN_PAGES.filter((page) => !page.secondaryOnly && !page.hiddenFromSidebar);

  return (
    <aside
      className={`sticky inset-x-0 top-0 z-[5] block h-auto w-full overflow-visible bg-[var(--blue-700)] text-white md:fixed md:inset-y-0 md:right-auto md:flex md:h-full md:overflow-hidden ${collapsed ? 'md:w-[var(--collapsed-sidebar-width)]' : 'md:w-[var(--expanded-sidebar-width)]'}`}
      aria-label="เมนูหลัก"
    >
      <div
        className={`flex h-auto w-full min-w-0 flex-col overflow-visible md:h-full md:overflow-hidden ${collapsed ? 'md:items-center' : ''}`}
      >
        <div
          className={`flex min-h-16 flex-row items-center justify-start px-4 ${collapsed ? 'md:min-h-[120px] md:flex-col md:justify-center md:gap-2 md:px-[10px] md:py-2' : 'md:min-h-[100px] md:justify-between md:px-5'}`}
        >
          <div
            className={`flex min-w-0 items-center gap-3 ${collapsed ? 'md:justify-center' : ''}`}
          >
            <button
              className="grid shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              type="button"
              aria-label={collapsed ? 'ขยายเมนูหลัก' : 'ย่อเมนูหลัก'}
              aria-expanded={!collapsed}
              onClick={onToggle}
            >
              <Image
                aria-hidden="true"
                className="block h-[42px] w-[42px] shrink-0 object-contain md:h-[70px] md:w-[70px]"
                src="/logo.png"
                alt=""
                width={70}
                height={70}
              />
            </button>
            <span className={`grid gap-1 ${collapsed ? 'md:hidden' : ''}`}>
              <strong className="text-lg leading-[1.1] font-bold text-white md:text-3xl">
                {APP_CONFIG.name}
              </strong>
              <small className="block text-[10px] leading-[1.3] font-normal text-white md:text-sm">
                บริษัทจัดการยานำเข้า
              </small>
            </span>
          </div>
        </div>
        <div
          className={`mb-[13px] ml-5 mr-5 hidden h-px bg-white/[0.15] ${collapsed ? 'md:hidden' : 'md:block'}`}
        />
        <nav
          className={`${collapsed ? 'hidden' : 'flex'} gap-[5px] overflow-x-auto px-3 pb-[10px] [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255_/_25%)_transparent] md:flex-1 md:overflow-x-visible md:overflow-y-auto md:px-[14px] md:pb-[18px] ${collapsed ? 'md:hidden' : 'md:block'}`}
          aria-label="เมนูผู้ดูแลระบบ"
        >
          {NAVIGATION_SECTIONS.map((section) => {
            const pages = ADMIN_PAGES.filter(
              (page) => page.section === section && !page.secondaryOnly && !page.hiddenFromSidebar,
            );
            return (
              <section
                className="m-0 flex shrink-0 items-center gap-1 md:mb-[15px] md:block"
                key={section}
              >
                <h2 className="hidden text-sm font-semibold text-white md:mx-3 md:mb-[6px] md:block">
                  {section}
                </h2>
                <ul className="m-0 flex list-none gap-1 p-0 md:grid md:gap-[3px]">
                  {pages.map((page: AdminPage) => {
                    const active =
                      page.href === currentPath ||
                      (page.href !== '/' && currentPath.startsWith(`${page.href}/`));
                    return (
                      <li key={page.href}>
                        <Link
                          className={`flex min-h-[35px] items-center gap-[7px] whitespace-nowrap rounded-md border border-white/[0.15] px-[10px] text-[11px] font-normal text-white md:min-h-[43px] md:gap-[13px] md:rounded-sm md:border-0 md:px-3 md:text-base ${active ? 'border-white bg-white/[0.13] md:shadow-[inset_3px_0_#fff]' : ''}`}
                          href={page.href}
                          aria-current={active ? 'page' : undefined}
                        >
                          <NavigationIcon name={page.icon} />
                          <span>{page.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </nav>
        <nav
          className={`hidden w-full flex-1 flex-col items-center gap-2 overflow-y-auto px-[10px] py-[14px] ${collapsed ? 'md:flex' : ''}`}
          aria-label="หมวดเมนู"
        >
          {mainPages.map((page) => {
            const active =
              page.href === currentPath ||
              (page.href !== '/' && currentPath.startsWith(`${page.href}/`));
            return (
              <Link
                className={`grid min-h-12 w-[66px] shrink-0 place-items-center rounded-[5px] text-white hover:bg-white/[0.14] ${active ? 'bg-white/[0.14]' : ''}`}
                key={page.href}
                href={page.href}
                title={page.label}
                aria-label={page.label}
                aria-current={active ? 'page' : undefined}
              >
                <NavigationIcon name={page.icon} />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export function CustomerSecondarySidebar() {
  const currentPath = usePathname();
  const [query, setQuery] = useState('');
  const filteredPages = CUSTOMER_SECONDARY_NAV.filter((page) =>
    page.label.toLocaleLowerCase('th').includes(query.trim().toLocaleLowerCase('th')),
  );

  return (
    <aside
      className="w-full shrink-0 border-b border-[var(--line)] bg-white px-[14px] py-3 text-[var(--ink-950)] xl:w-[var(--secondary-sidebar-width)] xl:border-b-0 xl:border-r xl:py-7"
      aria-label="เมนูย่อยลูกค้า"
    >
      <div className="hidden px-4 pb-[15px] pt-px xl:block">
        <h2 className="text-[19px] font-[650]">ลูกค้า</h2>
        <p className="mt-1 text-xs font-normal text-[var(--ink-700)]">เมนูย่อย</p>
      </div>
      <label className="mb-5 hidden h-11 items-center gap-[10px] rounded-3xl border border-[#d5dce7] px-[14px] shadow-[0_2px_4px_rgb(30_55_90_/_4%)] xl:flex">
        <span
          className="relative h-[14px] w-[14px] shrink-0 rounded-full border-[1.7px] border-[#63728a] after:absolute after:-right-[5px] after:-bottom-[3px] after:h-[1.7px] after:w-[6px] after:rotate-[48deg] after:rounded-sm after:bg-[#63728a] after:content-['']"
          aria-hidden="true"
        />
        <input
          className="w-full min-w-0 border-0 bg-transparent font-[inherit] text-[13px] font-normal text-[var(--ink-950)] outline-0 placeholder:text-[var(--ink-500)]"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ค้นหาเมนู"
          aria-label="ค้นหาเมนูย่อย"
        />
      </label>
      <nav aria-label="หน้าลูกค้า">
        <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 xl:grid xl:overflow-visible">
          {filteredPages.map((page) => {
            const active = page.href === currentPath;
            return (
              <li key={page.href}>
                <Link
                  className={`flex min-h-10 items-center whitespace-nowrap rounded-[2px] px-4 text-sm font-normal xl:min-h-14 ${active ? 'bg-[var(--blue-50)] text-[var(--blue-800)]' : 'text-[#68758b]'}`}
                  href={page.href}
                  aria-current={active ? 'page' : undefined}
                >
                  {page.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {filteredPages.length === 0 && (
          <p className="px-4 py-3 text-xs font-normal text-[var(--ink-500)]">ไม่พบเมนูที่ค้นหา</p>
        )}
      </nav>
    </aside>
  );
}
