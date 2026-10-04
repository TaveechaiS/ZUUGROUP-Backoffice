'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_PAGES } from '@/config/navigation';

export default function ProductSecondarySidebar() {
  const pathname = usePathname();
  const pages = [
    { href: '/products', label: 'สินค้าทั้งหมด' },
    ...ADMIN_PAGES.filter((p) => p.parentHref === '/products'),
  ];
  return (
    <aside className="shrink-0 border-b border-[#edf0f4] bg-white md:w-52 md:border-r md:border-b-0 lg:w-60">
      <nav
        aria-label="เมนูสินค้าและสต็อก"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:gap-2 md:px-0 md:py-5"
      >
        {pages.map((page) => {
          const active =
            page.href === '/products'
              ? !pathname.startsWith('/products/stock')
              : pathname === page.href;
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
    </aside>
  );
}
