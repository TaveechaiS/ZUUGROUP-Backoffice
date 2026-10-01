import { requireActiveUser } from '@/server/auth/current-user';
import { listProducts } from '@/server/products/service';
import { ProductsList } from './products-list';

export default async function Page() {
  const user = await requireActiveUser();
  const products = await listProducts(user.userRole?.roleId === 'ADMIN');
  return <ProductsList products={products} isAdmin={user.userRole?.roleId === 'ADMIN'} />;
}
