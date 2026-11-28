export type FollowUpRow = {
  id: string;
  code: string;
  name: string;
  status: string;
  savedStatus: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  contactedOn: string;
  channel: string;
  nextOn: string | null;
  summary: string;
  result: string;
  notes: string;
  cancelReason: string;
  createdById: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
};
export type FollowUpPage = {
  data: FollowUpRow[];
  pagination: { offset: number; limit: number; total: number; hasMore: boolean };
  actor: { id: string; roleId: string; name: string };
};
