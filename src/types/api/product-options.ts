import type { ProductOptionKind } from '@/config/product-options';
export type ProductOption = {
  id: string;
  kind: ProductOptionKind;
  name: string;
  code: string | null;
  active: boolean;
  version: number;
};
export type ProductOptionsResponse = {
  data: ProductOption[];
  pagination: { total: number; limit: number; offset: number };
};
