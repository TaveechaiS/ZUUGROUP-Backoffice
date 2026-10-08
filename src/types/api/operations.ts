import type { OpenPurchaseLine, SupplierOption } from '@/types/api/purchasing';
export type Option = {
  id: string;
  code: string;
  name: string;
  salePrice?: string;
  unit?: string;
  available?: number;
  roleId?: string;
  territoryName?: string;
};
export type OperationOptions = {
  nextReceiptCode?: string;
  products: Option[];
  customers: Option[];
  warehouses: Option[];
  users: Option[];
  actor: { id: string; roleId: string; name: string };
  policy: { saleMonths: number; donationMonths: number; warningDays: number };
};
export type ReceiveOptions = Pick<
  OperationOptions,
  'nextReceiptCode' | 'products' | 'warehouses' | 'actor'
> & {
  suppliers: SupplierOption[];
  openLines: OpenPurchaseLine[];
};
export type StockRow = {
  id: string;
  lotId: string;
  productId: string;
  productName: string;
  productCode: string;
  unit: string;
  lotNumber: string;
  receiptId: string;
  receiptCode: string;
  source: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  quantity: number;
  reserved: number;
  available: number;
  receivedQuantity: number;
  manufacturedOn: string;
  expiresOn: string;
  createdAt: string;
  condition: string;
  status: string;
  disposalDestroyed?: boolean;
  totalCost?: string;
  unitCost?: string;
};
export type LotRow = StockRow & { balances: StockRow[] };
export type StockProductRow = {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unit: string;
  salePrice: string;
  status: string;
  deletedAt: string | null;
  quantity: number;
  reserved: number;
  available: number;
  mainAvailable: number;
  mainQuantity: number;
  lotCount: number;
  marketingDays?: number | null;
  marketingLots?: {
    id: string;
    receiptCode: string;
    quantity: number;
    expiresOn: string;
    daysUntilExpiry: number;
  }[];
};
export type ReceiptRow = {
  id: string;
  code: string;
  source: string;
  notes: string;
  actorName: string;
  createdAt: string;
  lots: StockRow[];
};
export type MovementRow = {
  id: string;
  lotId: string;
  lotNumber: string;
  productName: string;
  warehouseName: string;
  quantity: number;
  kind: string;
  sourceId: string;
  reason: string;
  actorName: string;
  occurredAt: string;
};
export type OrderLine = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  allocations: {
    id: string;
    lotId: string;
    lotNumber: string;
    quantity: number;
    status: string;
    unitCost?: string;
  }[];
};
export type OrderRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  customerId: string | null;
  customerName: string;
  territoryName: string;
  managerName: string;
  salesName: string;
  createdByName: string;
  createdById: string | null;
  approvedByName: string;
  completedByName: string;
  returnReason: string;
  notes: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  workflowManaged: boolean;
  quotationId: string | null;
  quotationCode: string | null;
  lines?: OrderLine[];
  costAmount?: string;
  grossProfit?: string;
};
export type PageData<T> = {
  capabilities?: { canCorrectReceipt: boolean };
  data: T[];
  pagination: { offset: number; limit: number; total: number; hasMore: boolean };
};
