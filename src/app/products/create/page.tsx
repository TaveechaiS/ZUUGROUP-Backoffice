import { requireAdmin } from '@/server/auth/current-user';
import { productMasters } from '@/server/products/service';
import { CreateProductForm } from './create-product-form';

export default async function Page() {
  await requireAdmin();
  return <CreateProductForm initialMasters={await productMasters()} />;
}
