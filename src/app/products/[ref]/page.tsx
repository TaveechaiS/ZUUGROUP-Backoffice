import { notFound } from 'next/navigation';
import { requireActiveUser } from '@/server/auth/current-user';
import { getProductByCode, productMasters } from '@/server/products/service';
import { ProductDetail } from './product-detail';

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  const user = await requireActiveUser();
  const { ref } = await params;
  const product = await getProductByCode(ref);
  if (!product || product.deletedAt && user.userRole?.roleId !== 'ADMIN') notFound();
  return <ProductDetail initialProduct={product} masters={await productMasters()} isAdmin={user.userRole?.roleId === 'ADMIN'} />;
}
