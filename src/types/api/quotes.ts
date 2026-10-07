// TASK-275 quotation API shapes. Status constants live in src/config/quotes.ts.

export type QuoteLine = {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: string;
  discount: string;
};

export type QuoteRow = {
  id: string;
  code: string;
  status: string;
  displayStatus: string;
  customerId: string | null;
  customerCode: string;
  customerName: string;
  territoryName: string;
  salesName: string;
  managerName: string;
  createdByName: string;
  createdById: string | null;
  approvedByName: string;
  returnReason: string;
  notes: string;
  amount: string;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  workflowManaged: boolean;
  orderId: string | null;
  orderCode: string | null;
  lines?: QuoteLine[];
};

export type QuotePage = {
  data: QuoteRow[];
  pagination: { offset: number; limit: number; total: number; hasMore: boolean };
  actor: { id: string; roleId: string; name: string };
};
