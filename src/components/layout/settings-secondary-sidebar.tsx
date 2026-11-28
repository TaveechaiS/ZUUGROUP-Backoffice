'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SecondarySidebarFrame from './secondary-sidebar-frame';
export default function SettingsSecondarySidebar() {
  const pathname = usePathname();
  const territoryActive =
    pathname === '/customers/territories' || pathname.startsWith('/customers/territories/');
  return (
    <SecondarySidebarFrame>
      <nav
        aria-label="ตั้งค่าระบบ"
        className="flex gap-1 overflow-x-auto p-2 md:flex-col md:px-0 md:py-5"
      >
        <Link
          href="/settings/product-options"
          aria-current={pathname === '/settings/product-options' ? 'page' : undefined}
          className={`shrink-0 whitespace-nowrap px-4 py-3 text-sm poppins-medium md:px-6 ${pathname === '/settings/product-options' ? 'bg-blue-50 text-[#1a58a7]' : 'text-[#65758b] hover:bg-blue-50'}`}
        >
          ข้อมูลพื้นฐานสินค้า
        </Link>
        <Link
          href="/settings/customer-options"
          aria-current={pathname === '/settings/customer-options' ? 'page' : undefined}
          className={`shrink-0 whitespace-nowrap px-4 py-3 text-sm poppins-medium md:px-6 ${pathname === '/settings/customer-options' ? 'bg-blue-50 text-[#1a58a7]' : 'text-[#65758b] hover:bg-blue-50'}`}
        >
          ข้อมูลพื้นฐานลูกค้า
        </Link>
        <Link
          href="/customers/territories"
          aria-current={territoryActive ? 'page' : undefined}
          className={`shrink-0 whitespace-nowrap px-4 py-3 text-sm poppins-medium md:px-6 ${territoryActive ? 'bg-blue-50 text-[#1a58a7]' : 'text-[#65758b] hover:bg-blue-50'}`}
        >
          เขตขาย
        </Link>
      </nav>
    </SecondarySidebarFrame>
  );
}
