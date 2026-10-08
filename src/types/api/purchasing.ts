type Pagination = { offset: number; limit: number; total: number; hasMore: boolean };
type Actor = { id: string; roleId: string; name: string };

export type SupplierRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  taxId: string;
  address: string;
  contact: string;
  phone: string;
  email: string;
  paymentTerms: string;
  notes: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deleteReason: string | null;
  purchaseCount: number;
  openPurchaseCount: number;
};
export type SupplierOption = { id: string; code: string; name: string; paymentTerms: string };
export type SupplierPage = { data: SupplierRow[]; pagination: Pagination; actor: Actor };

export type PurchaseLine = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitCost: string;
  discount: string;
  received: number;
  remaining: number;
};
export type PurchaseReceipt = {
  id: string;
  code: string;
  lotId: string;
  lineId: string;
  productName: string;
  unit: string;
  quantity: number;
  totalCost: string;
  warehouseName: string;
  actorName: string;
  createdAt: string;
};
export type PurchaseRow = {
  id: string;
  code: string;
  status: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  paymentTerms: string;
  orderDate: string;
  expectedOn: string | null;
  amount: string;
  ordered: number;
  received: number;
  notes: string;
  closeReason: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  lines?: PurchaseLine[];
  receipts?: PurchaseReceipt[];
};
export type PurchasePage = { data: PurchaseRow[]; pagination: Pagination; actor: Actor };

export type OpenPurchaseLine = {
  id: string;
  purchaseOrderId: string;
  purchaseOrderCode: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  received: number;
  remaining: number;
  unitCost: string;
  discount: string;
};
