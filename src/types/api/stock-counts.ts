export type StockCountLineRow = {
  id: string;
  lotId: string;
  productCode: string;
  productName: string;
  unit: string;
  lotNumber: string;
  receiptCode: string;
  expiresOn: string;
  systemQuantity: number;
  countedQuantity: number | null;
  note: string;
};
export type StockCountRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
  resultText: string;
  notes: string;
  cancelReason: string;
  lineCount: number;
  diffCount: number;
  createdByName: string;
  createdAt: string;
  closedAt: string | null;
  updatedAt: string;
  lines?: StockCountLineRow[];
};
export type StockCountPage = {
  data: StockCountRow[];
  pagination: { offset: number; limit: number; total: number; hasMore: boolean };
  warehouses: { id: string; code: string; name: string }[];
  actor: { id: string; roleId: string; name: string };
};
