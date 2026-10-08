'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SecondarySidebarFrame from '@/components/layout/secondary-sidebar-frame';

export default function PurchasingSecondarySidebar({ roleId }: { roleId: string }) {
  const pathname = usePathname();
  const admin = roleId === 'ADMIN';
  const pages = [
    { href: '/purchases', label: 'รายการใบสั่งซื้อ' },
    ...(admin ? [{ href: '/purchases/create', label: 'สร้างใบสั่งซื้อ' }] : []),
    { href: '/suppliers', label: 'ผู้ขาย' },
    ...(admin ? [{ href: '/suppliers/create', label: 'เพิ่มผู้ขาย' }] : []),
  ];
  const isActive = (href: string) =>
    href.endsWith('/create')
      ? pathname === href
      : (pathname === href || pathname.startsWith(href + '/')) && !pathname.endsWith('/create');

  return (
    <SecondarySidebarFrame>
      <nav
        aria-label="เมนูจัดซื้อ"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-2 md:px-0 md:py-5"
      >
        {pages.map((page) => {
          const active = isActive(page.href);
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
