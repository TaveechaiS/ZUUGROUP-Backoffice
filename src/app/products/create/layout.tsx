import type { ReactNode } from 'react';
import { requireAdmin } from '@/server/auth/current-user';
import { RouteDataProvider } from '@/components/ui/route-data';
import { productMasters } from '@/server/products/service';
export default async function Layout({ children }: { children: ReactNode }) {
  const actor = await requireAdmin();
  return (
    <RouteDataProvider data={{ actorId: actor.id, isAdmin: true, masters: await productMasters() }}>
      {children}
    </RouteDataProvider>
  );
}
