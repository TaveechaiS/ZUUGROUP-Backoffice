import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { requireActiveUser } from '@/server/auth/current-user';
import { RouteDataProvider } from '@/components/ui/route-data';
export default async function Layout({ children }: { children: ReactNode }) {
  const user = await requireActiveUser();
  const role = user.userRole?.roleId ?? '';
  if (!['ADMIN', 'SALES', 'MANAGER'].includes(role)) redirect('/customers');
  return (
    <RouteDataProvider data={{ actorId: user.id, isAdmin: role === 'ADMIN' }}>
      {children}
    </RouteDataProvider>
  );
}
