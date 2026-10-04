'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/config/app';
import { ADMIN_PAGES, NAVIGATION_SECTIONS, type AdminPage } from '@/config/navigation';

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

export function Sidebar({
  collapsed,
  onToggle,
  roleId,
}: {
  collapsed: boolean;
  onToggle: () => void;
  roleId: string;
}) {
  const currentPath = usePathname();
  const allowedPages = ADMIN_PAGES.filter(
    (page) => roleId === 'ADMIN' || !['/users', '/audit-logs', '/settings'].includes(page.href),
  );
  const mainPages = allowedPages.filter((page) => !page.secondaryOnly && !page.hiddenFromSidebar);

  return (
    <aside
      className={`sticky inset-x-0 top-0 z-[5] block h-auto w-full overflow-visible bg-blue-700 text-white md:fixed md:inset-y-0 md:right-auto md:flex md:h-full md:overflow-hidden ${collapsed ? 'md:w-[var(--collapsed-sidebar-width)]' : 'md:w-[var(--expanded-sidebar-width)]'}`}
      aria-label="เมนูหลัก"
    >
      <div
        className={`flex h-auto w-full min-w-0 flex-col overflow-visible md:h-full md:overflow-hidden ${collapsed ? 'md:items-center' : ''}`}
      >
        <div
          className={`flex min-h-16 flex-row items-center justify-start px-4 ${collapsed ? 'md:min-h-30 md:flex-col md:justify-center md:gap-2 md:px-2.5 md:py-2' : 'md:min-h-25 md:justify-between md:px-5'}`}
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
                className="block h-10.5 w-10.5 shrink-0 object-contain md:h-17.5 md:w-17.5"
                src="/logo.png"
                alt=""
                width={70}
                height={70}
              />
            </button>
            <span className={`grid gap-1 ${collapsed ? 'md:hidden' : ''}`}>
              <strong className="text-lg leading-[1.1] poppins-bold text-white md:text-3xl">
                {APP_CONFIG.name}
              </strong>
              <small className="block text-xs leading-[1.3] poppins-regular text-white md:text-sm">
                บริษัทจัดการยานำเข้า
              </small>
            </span>
          </div>
        </div>
        <div
          className={`mb-[13px] ml-5 mr-5 hidden h-px bg-white/[0.15] ${collapsed ? 'md:hidden' : 'md:block'}`}
        />
        <nav
          className={`${collapsed ? 'hidden' : 'flex'} gap-[5px] overflow-x-auto px-3 pb-2.5 [scrollbar-width:thin] [scrollbar-color:rgb(255_255_255_/_25%)_transparent] md:flex-1 md:overflow-x-visible md:overflow-y-auto md:px-3.5 md:pb-4.5 ${collapsed ? 'md:hidden' : 'md:block'}`}
          aria-label="เมนูผู้ดูแลระบบ"
        >
          {NAVIGATION_SECTIONS.map((section) => {
            const pages = allowedPages.filter(
              (page) => page.section === section && !page.secondaryOnly && !page.hiddenFromSidebar,
            );
            return (
              <section
                className="m-0 flex shrink-0 items-center gap-1 md:mb-[15px] md:block"
                key={section}
              >
                <h2 className="hidden text-sm poppins-semibold text-white md:mx-3 md:mb-1.5 md:block">
                  {section}
                </h2>
                <ul className="m-0 flex list-none gap-1 p-0 md:grid md:gap-[3px]">
                  {pages.map((page: AdminPage) => {
                    const active =
                      page.href === currentPath ||
                      (page.href !== '/' && currentPath.startsWith(page.href + '/'));
                    return (
                      <li key={page.href}>
                        <Link
                          className={`flex min-h-[35px] items-center gap-[7px] whitespace-nowrap rounded-md border border-white/15 px-2.5 text-xs poppins-regular text-white md:min-h-[43px] md:gap-[13px] md:rounded-sm md:border-0 md:px-3 md:text-sm ${active ? 'border-white bg-white/13 md:shadow-[inset_3px_0_#fff]' : ''}`}
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
          className={`hidden w-full flex-1 flex-col items-center gap-2 overflow-y-auto px-2.5 py-3.5 ${collapsed ? 'md:flex' : ''}`}
          aria-label="หมวดเมนู"
        >
          {mainPages.map((page) => {
            const active =
              page.href === currentPath ||
              (page.href !== '/' && currentPath.startsWith(`${page.href}/`));
            return (
              <Link
                className={`grid min-h-12 w-16.5 shrink-0 place-items-center rounded-[5px] text-white hover:bg-white/[0.14] ${active ? 'bg-white/[0.14]' : ''}`}
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
