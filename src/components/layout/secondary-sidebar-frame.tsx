import type { ReactNode } from 'react';

export default function SecondarySidebarFrame({ children }: { children: ReactNode }) {
  return (
    <aside className="print:hidden sticky top-[calc(var(--main-sidebar-height,0px)+var(--topbar-height,90px))] z-[4] shrink-0 border-b border-[#edf0f4] bg-white md:top-[var(--topbar-height,82px)] md:h-[calc(100dvh-var(--topbar-height,82px))] md:w-52 md:self-start md:overflow-y-auto md:border-r md:border-b-0 lg:w-60">
      {children}
    </aside>
  );
}
