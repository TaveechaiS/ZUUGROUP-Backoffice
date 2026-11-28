import type { ReactNode } from 'react';
import { requireActiveUser } from '@/server/auth/current-user';
import { RouteDataProvider } from '@/components/ui/route-data';

export default async function Layout({ children }: { children: ReactNode }) {
  const actor = await requireActiveUser();
  return (
    <RouteDataProvider data={{ actorId: actor.id, isAdmin: actor.userRole?.roleId === 'ADMIN' }}>
      {children}
    </RouteDataProvider>
  );
}
