'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_PAGES } from '@/config/navigation';
import SecondarySidebarFrame from '@/components/layout/secondary-sidebar-frame';

export default function TerritorySecondarySidebar({ roleId }: { roleId: string }) {
  const pathname = usePathname();
  const parentHref = '/customers/territories';
  const creating = pathname === `${parentHref}/create`;
  const pages = [
    { href: parentHref, label: 'รายงานเขต' },
    ...ADMIN_PAGES.filter((page) => page.parentHref === parentHref && roleId === 'ADMIN'),
  ];

  return (
    <SecondarySidebarFrame>
      <nav
        aria-label="เมนูเขต"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-2 md:px-0 md:py-5"
      >
        {pages.map((page) => {
          const active = page.href === parentHref ? !creating : pathname === page.href;
          return (
            <Link
              key={page.href}
              href={page.href}
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
