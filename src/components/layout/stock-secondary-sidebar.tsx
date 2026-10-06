'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_PAGES, getAdminPage } from '@/config/navigation';
import SecondarySidebarFrame from '@/components/layout/secondary-sidebar-frame';

export default function StockSecondarySidebar() {
  const pathname = usePathname();
  const parentHref = '/products/stock';
  const page = getAdminPage(pathname);
  const pages = [
    { href: parentHref, label: 'รายงานสต็อก' },
    ...ADMIN_PAGES.filter((item) => item.parentHref === parentHref),
  ];

  return (
    <SecondarySidebarFrame>
      <nav
        aria-label="เมนูสต็อก"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-2 md:px-0 md:py-5"
      >
        {pages.map((item) => {
          const active = page?.href === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 whitespace-nowrap rounded-md px-4 py-3 text-sm transition-colors md:rounded-none md:px-6 ${active ? 'bg-blue-50 poppins-semibold text-[#1a58a7]' : 'text-[#65758b] hover:bg-blue-50 poppins-regular'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </SecondarySidebarFrame>
  );
}
