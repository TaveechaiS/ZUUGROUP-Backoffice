export type DashboardExpiringLot = {
  id: string;
  productName: string;
  lotNumber: string;
  expiresOn: string;
  daysLeft: number;
  quantity: number;
};

export type DashboardTask = {
  key: string;
  label: string;
  count: number;
  href: string;
  tone: 'info' | 'warning' | 'danger';
};

export type Dashboard = {
  today: string;
  sales: {
    total: string;
    orders: number;
    prevTotal: string;
    prevOrders: number;
    trend: { month: string; total: string; orders: number }[];
    topProducts: { id: string; name: string; unit: string; quantity: number; total: string }[];
    topCustomers: { id: string; name: string; orders: number; total: string }[];
  };
  finance: {
    outstanding: string;
    overdue: string;
    overdueInvoices: number;
    receivedThisMonth: string;
    paymentsThisMonth: number;
    aging: { current: string; d30: string; d60: string; d90: string; over90: string };
  } | null;
  inventory: {
    expiring: DashboardExpiringLot[];
    lowStock: { id: string; code: string; name: string; unit: string; main: number }[];
    expiringCount: number;
    lowStockCount: number;
    expiryDays: number;
    lowStockLevel: number;
  } | null;
  tasks: DashboardTask[];
  activity: {
    id: string;
    code: string;
    name: string;
    status: string;
    module: string;
    createdAt: string;
  }[];
};

export type DashboardResponse = { data: Dashboard };
export type ReportKey = 'sales' | 'inventory' | 'finance';

type ReportPagination = { offset: number; limit: number; total: number; hasMore: boolean };
type ReportActor = { id: string; roleId: string; name: string };

export type SalesReportSummary = {
  orders: number;
  quantity: number;
  total: string;
  net: string;
  cost?: string;
  profit?: string;
};
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
