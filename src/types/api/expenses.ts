type Pagination = { offset: number; limit: number; total: number; hasMore: boolean };
type Actor = { id: string; roleId: string; name: string };

export type ExpenseFileRow = {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
};
export type ExpenseRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  expenseDate: string;
  categoryId: string;
  categoryName: string;
  amount: string;
  payee: string;
  description: string;
  notes: string;
  cancelReason: string;
  fileCount: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  files?: ExpenseFileRow[];
};
export type ExpensePage = {
  data: ExpenseRow[];
  pagination: Pagination;
  totalAmount: string;
  range: { from: string; to: string };
  categories: { id: string; name: string }[];
  actor: Actor;
};
