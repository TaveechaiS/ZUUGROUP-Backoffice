'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { APP_CONFIG } from '@/config/app';
import { ADMIN_PAGES, getAdminPage, type AdminPage } from '@/config/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import ProductSecondarySidebar from '@/components/layout/product-secondary-sidebar';
import CustomerSecondarySidebar from '@/components/layout/customer-secondary-sidebar';
import UserSecondarySidebar from '@/components/layout/user-secondary-sidebar';
import PromotionSecondarySidebar from '@/components/layout/promotion-secondary-sidebar';
import ReportSecondarySidebar from '@/components/layout/report-secondary-sidebar';
import SalesDocumentSecondarySidebar from '@/components/layout/sales-document-secondary-sidebar';
import StockSecondarySidebar from '@/components/layout/stock-secondary-sidebar';
import NavigationOnlyTabs from '@/components/layout/navigation-only-tabs';
import SettingsSecondarySidebar from '@/components/layout/settings-secondary-sidebar';
import PurchasingSecondarySidebar from '@/components/layout/purchasing-secondary-sidebar';
import { logout } from '@/app/login/actions';

export function AdminShell({
  children,
  account,
}: {
  children: ReactNode;
  account: { name: string; role: string; roleId: string } | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLDivElement>(null);
  const currentPath = usePathname();
  const showProductDetail =
    /^\/products\/[^/]+$/.test(currentPath) &&
    !['/products/create', '/products/stock'].includes(currentPath);
  const showProductTable = [
    '/products',
    '/products/stock/main',
    '/products/stock/marketing',
    '/products/stock/disposal',
  ].includes(currentPath);
  const page: AdminPage = getAdminPage(currentPath) ?? ADMIN_PAGES[0];
  const settingsSection =
    currentPath === '/settings' ||
    currentPath.startsWith('/settings/') ||
    page.parentHref === '/settings';
  const stockSection = page.href === '/products/stock' || page.parentHref === '/products/stock';
  const productSection =
    !stockSection &&
    (currentPath === '/products' ||
      currentPath.startsWith('/products/') ||
      page.parentHref === '/products');
  const userSection =
    currentPath === '/users' || currentPath.startsWith('/users/') || page.parentHref === '/users';
  const territorySection =
    currentPath === '/customers/territories' || currentPath.startsWith('/customers/territories/');
  const customerSection =
    !userSection &&
    !territorySection &&
    (currentPath === '/customers' || currentPath.startsWith('/customers/'));
  const promotionSection = currentPath === '/promotions' || currentPath.startsWith('/promotions/');
  const quoteSection = currentPath === '/quotes' || currentPath.startsWith('/quotes/');
  const orderSection = currentPath === '/orders' || currentPath.startsWith('/orders/');
  const billingSection = currentPath === '/billing' || currentPath.startsWith('/billing/');
  const purchasingSection =
    currentPath === '/purchases' ||
    currentPath.startsWith('/purchases/') ||
    currentPath === '/expenses' ||
    currentPath.startsWith('/expenses/');
  const salesReportSection =
    currentPath === '/reports/sales' || currentPath.startsWith('/reports/sales/');
  const financeReportSection =
    currentPath === '/reports/finance' || currentPath.startsWith('/reports/finance/');
  const inventoryReportSection =
    currentPath === '/reports/inventory' || currentPath.startsWith('/reports/inventory/');

  useEffect(() => {
    const shell = shellRef.current;
    const mainSidebar = shell?.firstElementChild;
    const topbar = topbarRef.current;
    if (!shell || !(mainSidebar instanceof HTMLElement) || !topbar) return;

    const updateHeight = () => {
      shell.style.setProperty(
        '--main-sidebar-height',
        `${mainSidebar.getBoundingClientRect().height}px`,
      );
      shell.style.setProperty('--topbar-height', `${topbar.getBoundingClientRect().height}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(mainSidebar);
    observer.observe(topbar);
    return () => {
      observer.disconnect();
      shell.style.removeProperty('--main-sidebar-height');
      shell.style.removeProperty('--topbar-height');
    };
  }, [currentPath]);

  if (currentPath === '/login') return <>{children}</>;

  return (
    <main ref={shellRef} className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        roleId={account?.roleId ?? ''}
      />
      <section
        className={`${collapsed ? 'min-h-[calc(100vh-64px)]' : 'min-h-[calc(100vh-102px)]'} bg-blue-700 md:min-h-screen print:!ml-0 print:bg-white ${collapsed ? 'md:ml-[var(--collapsed-sidebar-width)]' : 'md:ml-[var(--expanded-sidebar-width)]'}`}
      >
        <div
          ref={topbarRef}
          className="sticky top-[var(--main-sidebar-height,0px)] z-[5] border-t-[10px] border-blue-700 bg-blue-700 md:top-0 print:hidden"
        >
          <header className="relative flex min-h-20 items-center justify-between gap-3 border-b border-[#d7e3f0] bg-blue-50 px-4 py-2.5 md:min-h-18 md:gap-6 md:rounded-tl-[25px] md:px-7.5 md:py-0">
            <div className="min-w-0 flex-1">
              <h1 className="m-0 break-words text-lg leading-[1.35] poppins-bold text-[#111827] md:text-xl">
                {stockSection
                  ? 'สต็อก'
                  : productSection
                    ? 'สินค้า'
                    : customerSection
                      ? 'ลูกค้า'
                      : userSection
                        ? 'ผู้ใช้งาน'
                        : territorySection
                          ? 'ตั้งค่าระบบ'
                          : promotionSection
                            ? 'โปรโมชัน & ของแถม'
                            : salesReportSection
                              ? 'รายงานยอดขาย'
                              : inventoryReportSection
                                ? 'รายงานคลังสินค้า'
                                : financeReportSection
                                  ? 'รายงานการเงิน'
                                  : quoteSection
                                    ? 'ใบเสนอราคา'
                                    : orderSection
                                      ? 'คำสั่งซื้อ'
                                      : billingSection
                                        ? 'วางบิล & ลูกหนี้'
                                        : purchasingSection
                                          ? 'จัดซื้อ & ค่าใช้จ่าย'
                                          : settingsSection
                                            ? 'ตั้งค่าระบบ'
                                            : page.label}
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
                className="grid h-6 w-6 place-items-center rounded-full border border-blue-200 bg-white md:h-9 md:w-9"
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
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white bg-[#0875bb] text-xs poppins-semibold text-white md:h-9 md:w-9"
                  aria-hidden="true"
                >
                  {account?.name.slice(0, 1) ?? 'U'}
                </span>
                <span className="hidden gap-px text-xs text-gray-900 md:grid">
                  <strong>{account?.name ?? 'ผู้ใช้งาน'}</strong>
                  <small className="text-xs poppins-regular text-gray-600">
                    {account?.role ?? '-'}
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
        </div>
        <div
          className={`flex flex-col ${collapsed ? 'min-h-[calc(100vh-144px)]' : 'min-h-[calc(100vh-182px)]'} bg-white md:min-h-[calc(100vh-82px)]`}
        >
          <div className="flex min-w-0 flex-1 flex-col md:flex-row">
            {productSection && <ProductSecondarySidebar roleId={account?.roleId ?? ''} />}
            {stockSection && <StockSecondarySidebar />}
            {customerSection && <CustomerSecondarySidebar roleId={account?.roleId ?? ''} />}
            {userSection && account?.roleId === 'ADMIN' && <UserSecondarySidebar />}
            {promotionSection && <PromotionSecondarySidebar roleId={account?.roleId ?? ''} />}
            {quoteSection && (
              <SalesDocumentSecondarySidebar parentHref="/quotes" roleId={account?.roleId ?? ''} />
            )}
            {orderSection && (
              <SalesDocumentSecondarySidebar parentHref="/orders" roleId={account?.roleId ?? ''} />
            )}
            {billingSection && (
              <SalesDocumentSecondarySidebar parentHref="/billing" roleId={account?.roleId ?? ''} />
            )}
            {purchasingSection && <PurchasingSecondarySidebar roleId={account?.roleId ?? ''} />}
            {salesReportSection && <ReportSecondarySidebar parentHref="/reports/sales" />}
            {inventoryReportSection && <ReportSecondarySidebar parentHref="/reports/inventory" />}
            {financeReportSection && <ReportSecondarySidebar parentHref="/reports/finance" />}
            {settingsSection && account?.roleId === 'ADMIN' && <SettingsSecondarySidebar />}
            <div className="flex min-w-0 flex-1 flex-col">
              {showProductTable ||
              currentPath === '/products/stock' ||
              currentPath.startsWith('/products/stock/receipts/') ||
              (currentPath === '/products/stock/create' && account?.roleId === 'ADMIN') ||
              (currentPath === '/settings' && account?.roleId === 'ADMIN') ||
              territorySection ||
              (customerSection &&
                (currentPath === '/customers' ||
                  currentPath === '/customers/list' ||
                  currentPath === '/customers/create' ||
                  currentPath === '/customers/list/create' ||
                  currentPath === '/customers/dashboard' ||
                  currentPath.startsWith('/customers/dashboard/') ||
                  currentPath === '/customers/documents' ||
                  (/^\/customers\/[^/]+$/.test(currentPath) &&
                    !['groups', 'documents', 'dashboard'].includes(currentPath.split('/')[2])) ||
                  /^\/customers\/requests\/[^/]+$/.test(currentPath) ||
                  (/^\/customers\/[^/]+\/edit$/.test(currentPath) &&
                    !['territories', 'groups', 'documents', 'dashboard', 'list'].includes(
                      currentPath.split('/')[2],
                    ) &&
                    account?.roleId === 'ADMIN'))) ||
              (userSection && account?.roleId === 'ADMIN') ||
              showProductDetail ||
              orderSection ||
              quoteSection ||
              purchasingSection ||
              billingSection ||
              currentPath === '/stock-counts' ||
              currentPath.startsWith('/stock-counts/') ||
              promotionSection ||
              salesReportSection ||
              inventoryReportSection ||
              financeReportSection ||
              (currentPath === '/products/create' && account?.roleId === 'ADMIN') ||
              ((currentPath === '/settings/product-options' ||
                currentPath === '/settings/customer-options') &&
                account?.roleId === 'ADMIN') ? (
                children
              ) : (
                <NavigationOnlyTabs
                  key={`${currentPath}:${account?.roleId ?? ''}`}
                  pathname={currentPath}
                  roleId={account?.roleId ?? ''}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
