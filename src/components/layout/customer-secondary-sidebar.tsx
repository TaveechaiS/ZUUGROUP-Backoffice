'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_PAGES } from '@/config/navigation';
import SecondarySidebarFrame from '@/components/layout/secondary-sidebar-frame';

export default function CustomerSecondarySidebar({ roleId }: { roleId: string }) {
  const pathname = usePathname();
  const creating = pathname === '/customers/create' || pathname === '/customers/list/create';
  const requests =
    pathname === '/customers/requests' || pathname.startsWith('/customers/requests/');
  const listing =
    pathname === '/customers' ||
    pathname === '/customers/list' ||
    (/^\/customers\/[^/]+$/.test(pathname) &&
      ![
        '/customers/create',
        '/customers/requests',
        '/customers/groups',
        '/customers/territories',
        '/customers/documents',
        '/customers/dashboard',
      ].includes(pathname));
  const pages = ADMIN_PAGES.filter(
    (page) =>
      page.parentHref === '/customers' &&
      (!['/customers/create', '/customers/requests'].includes(page.href) || roleId === 'ADMIN'),
  );

  return (
    <SecondarySidebarFrame>
      <nav
        aria-label="เมนูลูกค้า"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-2 md:px-0 md:py-5"
      >
        {pages.map((page) => {
          const active =
            page.href === '/customers/create'
              ? creating
              : page.href === '/customers/requests'
                ? requests
                : listing && !creating && !requests;
          return (
            <Link
              key={page.href}
              href={page.href === '/customers/list' ? '/customers' : page.href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 whitespace-nowrap rounded-md px-4 py-3 text-sm transition-colors md:rounded-none md:px-6 ${active ? 'bg-blue-50 poppins-semibold text-[#1a58a7]' : 'text-[#65758b] hover:bg-blue-50 poppins-regular'}`}
            >
              {page.label}
            </Link>
          );
        })}
      </nav>
    </SecondarySidebarFrame>
  );
}
