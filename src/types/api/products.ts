import type { Pagination, OffsetPagination, DataResponse } from '@/types/api';
export type ProductView = {
  id: string;
  code: string;
  name: string;
  sequence: string;
  categoryId: string;
  category: { id: string; name: string; code: string };
  dosageFormId: string;
  dosageForm: { id: string; name: string; code: string };
  drugId: string;
  drug: { id: string; name: string };
  defaultWarehouseId: string;
  defaultWarehouse: { id: string; name: string; code: string };
  unit: string;
  salePrice: string;
  status: 'ACTIVE' | 'INACTIVE';
  deletedAt: string | null;
  deleteReason: string | null;
  createdAt: string;
};
export type Master = { id: string; name: string; code?: string };
export type Masters = {
  categories: Master[];
  dosageForms: Master[];
  drugs: Master[];
  warehouses: Master[];
};

export type ProductStatus = ProductView['status'];
export type ProductCreateRequest = {
  name: string;
  categoryId: string;
  dosageFormId: string;
  drugId: string;
  defaultWarehouseId: string;
  unit: string;
  salePrice: string | number;
  status: ProductStatus;
  sequence?: string | null;
};
export type ProductUpdateRequest = ProductCreateRequest & { action: 'update' };
export type ValidatedProductInput = Omit<ProductCreateRequest, 'salePrice' | 'sequence'> & {
  salePrice: string;
  sequence: number | null;
};
export type ProductMutationRequest = ProductUpdateRequest | { action: 'restore'; reason: string };
export type ProductMasterRequest = {
  type: 'drug' | 'category' | 'dosageForm';
  name: string;
  code?: string;
};
export type ProductsListResponse = {
  products: ProductView[];
  pagination: Pagination;
  filters?: ProductFiltersResponse;
};
export type ProductResponse = { product: ProductView };
export type ProductMasterResponse = { item: Master };
export type ProductFiltersResponse = { categories: { id: string; name: string }[] };
export type PublicProductView = Pick<
  ProductView,
  'id' | 'code' | 'name' | 'categoryId' | 'dosageFormId' | 'drugId' | 'unit'
> & { category: { name: string }; dosageForm: { name: string }; drug: { name: string } };
export type PublicProductsResponse = DataResponse<PublicProductView[]> & {
  pagination: OffsetPagination;
};

export type ProductDeleteRequest = { reason: string };
