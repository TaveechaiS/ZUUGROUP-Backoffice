import { isProductOptionKind } from '@/config/product-options';
import ProductOptionsManager from '@/components/settings/product-options-manager';
export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  return <ProductOptionsManager initialKind={isProductOptionKind(kind) ? kind : 'codeGroup'} />;
}
