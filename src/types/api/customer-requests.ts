import type { CustomerDraft } from '@/types/api/customers';

export type CustomerRequestRow = {
  id: string;
  status: string;
  name: string;
  codeGroupName: string;
  territoryName: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  submittedAt: string;
  reviewerName: string;
  reviewedAt: string | null;
  reviewReason: string;
  customerId: string | null;
  customerCode: string | null;
  updatedAt: string;
};
export type CustomerRequestDetail = CustomerRequestRow & {
  draft: CustomerDraft & { fields: Record<string, string> };
  creditTermName: string;
  creditStartName: string;
  files: { id: string; name: string; type: string; size: number; documentTypeName: string }[];
  duplicates: { id: string; code: string; name: string; reason: string }[];
};
export type CustomerRequestPage = {
  data: CustomerRequestRow[];
  pagination: { offset: number; limit: number; total: number; hasMore: boolean };
  actor: { id: string; roleId: string; name: string };
};
