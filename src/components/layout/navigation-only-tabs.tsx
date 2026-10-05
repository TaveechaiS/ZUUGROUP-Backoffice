'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { RECORD_MODULES } from '@/features/records/types';

function tabsFor(pathname: string, roleId: string): string[] {
  if (pathname === '/users') return ['รายการปกติ', 'ลบแล้ว'];
  if (pathname === '/products') {
    return ['ทั้งหมด', 'สินค้าใกล้หมด', 'สินค้าหมด', ...(roleId === 'ADMIN' ? ['ลบแล้ว'] : [])];
  }
  if (pathname === '/products/stock') return ['ทั้งหมด', 'ใกล้หมดอายุ', 'หมดอายุ'];
  // Other stock pages have a single tab; create/detail pages have none.
  const pageDefinition = RECORD_MODULES.find((item) => item.page === pathname && item.key !== 'orders');
  if (!pageDefinition) return [];
  return [...pageDefinition.tabs, ...(roleId === 'ADMIN' ? ['ลบแล้ว'] : [])];
}

export default function NavigationOnlyTabs({
  pathname,
  roleId,
}: {
  pathname: string;
  roleId: string;
}) {
  const tabs = tabsFor(pathname, roleId);
  const [selected, setSelected] = useState(tabs[0] ?? '');
  const id = useId();
  if (tabs.length < 2) return null;

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    setSelected(tabs[next]);
    const buttons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[next]?.focus();
  }

  return (
    <div className="px-4 pt-6 md:px-6">
      <div
        role="tablist"
        aria-label="แท็บของหน้า"
        className="flex flex-wrap gap-x-5 border-b border-[#e4e9f0]"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={selected === tab}
            aria-controls={`${id}-panel`}
            tabIndex={selected === tab ? 0 : -1}
            onClick={() => setSelected(tab)}
            onKeyDown={(event) => moveTab(event, index)}
            className={`-mb-px min-h-10 border-b-2 px-1 pb-3 text-sm transition-colors ${selected === tab ? 'border-[#1a58a7] poppins-semibold text-[#1a58a7]' : 'border-transparent text-[#8994a5] hover:text-[#1a58a7] poppins-regular'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${tabs.indexOf(selected)}`}
      />
    </div>
  );
}
