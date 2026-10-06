import type { ReactNode } from 'react';
import { requireActiveUser } from '@/server/auth/current-user';
import { RouteDataProvider } from '@/components/ui/route-data';
import { notFound } from 'next/navigation';
import { getProductByCode } from '@/server/products/service';
export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const actor = await requireActiveUser();
  const { id } = await params;
  const product = await getProductByCode(
    id,
    ['ADMIN', 'ACCOUNTING_CFO'].includes(actor.userRole?.roleId ?? ''),
  );
  if (!product || (product.deletedAt && actor.userRole?.roleId !== 'ADMIN')) notFound();
  return (
    <RouteDataProvider
      key={product.id}
      data={{
        actorId: actor.id,
        isAdmin: actor.userRole?.roleId === 'ADMIN',
        product,
      }}
    >
      {children}
    </RouteDataProvider>
  );
}
