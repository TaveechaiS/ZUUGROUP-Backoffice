export type Dashboard = {
  counts: { customers: number; products: number; orders: number; quotes: number };
  activity: {
    id: string;
    code: string;
    name: string;
    status: string;
    module: string;
    createdAt: string;
  }[];
  unavailable: string[];
};

export type DashboardResponse = { data: Dashboard };
export type ReportKey = 'sales' | 'inventory' | 'finance';

type ReportPagination = { offset: number; limit: number; total: number; hasMore: boolean };
type ReportActor = { id: string; roleId: string; name: string };

export type SalesReportSummary = { orders: number; quantity: number; total: string; net: string };
export type SalesReportPage<T> = {
  data: T[];
  pagination: ReportPagination;
  summary: SalesReportSummary;
  range: { from: string; to: string };
  actor: ReportActor;
};
export type SalesDayRow = {
  soldOn: string;
  orders: number;
  quantity: number;
  total: string;
  net: string;
};
export type SalesGroupRow = {
  id: string;
  code: string;
  name: string;
  unit?: string;
  territoryName?: string;
  orders: number;
  quantity?: number;
  customers?: number;
  total: string;
  net: string;
};
export type SalesDetailRow = {
  id: string;
  soldOn: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  discount: string;
  total: string;
};

export type InventoryReportPage<T> = {
  data: T[];
  pagination: ReportPagination;
  range?: { from: string; to: string };
  seesCost: boolean;
  actor: ReportActor;
};
