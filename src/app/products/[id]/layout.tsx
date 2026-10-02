import type { ReactNode } from 'react';
import { requireActiveUser } from '@/server/auth/current-user';
import { RouteDataProvider } from '@/components/ui/route-data';
import { notFound } from 'next/navigation';
import { getProductByCode, productMasters } from '@/server/products/service';
export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const actor = await requireActiveUser();
  const { id } = await params;
  const product = await getProductByCode(id);
  if (!product || (product.deletedAt && actor.userRole?.roleId !== 'ADMIN')) notFound();
  return (
    <RouteDataProvider
      key={product.id}
      data={{
        actorId: actor.id,
        isAdmin: actor.userRole?.roleId === 'ADMIN',
        product,
        masters: await productMasters(),
      }}
    >
      {children}
    </RouteDataProvider>
  );
}
