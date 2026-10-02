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
