import type { SalesFilterOptions } from './operations';
type Pagination = { offset: number; limit: number; total: number; hasMore: boolean };
type Actor = { id: string; roleId: string; name: string };

export type InvoicePaymentRow = {
  id: string;
  paidOn: string;
  amount: string;
  method: string;
  reference: string;
  notes: string;
  createdByName: string;
  createdAt: string;
  voidedAt: string | null;
  voidReason: string;
};
export type InvoiceRow = {
  id: string;
  code: string;
  status: string;
  savedStatus: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  salesOrderId: string;
  salesOrderCode: string;
  issueDate: string;
  dueDate: string;
  amount: string;
  paid: string;
  outstanding: string;
  daysOverdue: number;
  notes: string;
  cancelReason: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  payments?: InvoicePaymentRow[];
};
export type InvoicePage = {
  data: InvoiceRow[];
  pagination: Pagination;
  totalOutstanding: string;
  filters?: SalesFilterOptions;
  actor: Actor;
};
export type UninvoicedOrder = {
  id: string;
  code: string;
  customerName: string;
  amount: string;
  creditDays: number;
};
