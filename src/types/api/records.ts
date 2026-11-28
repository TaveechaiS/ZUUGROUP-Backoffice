import type { OffsetPagination, DataResponse } from '@/types/api';
export type RecordField = {
  key: string;
  label: string;
  type: string;
  relation?: string;
  required: boolean;
};
export type RecordModule = {
  key: string;
  model: string;
  table: string;
  page: string;
  fields: RecordField[];
  display: (string | null)[];
  title: string;
  action: string;
  columns: string[];
  tabs: string[];
  filters: string[];
  eyebrow: string;
  description: string;
};
export type RecordRow = {
  [key: string]: unknown;
  id: string;
  code: string;
  name: string;
  status: string;
  category?: string | null | { name: string };
  province?: string | null;
  owner?: string | null;
  paymentTerms?: string | null;
  groupId?: string | null;
  territoryId?: string | null;
  notes?: string | null;
  description?: string | null;
  area?: string | null;
  customerId?: string | null;
  documentType?: string | null;
  dateText?: string | null;
  fileUrl?: string | null;
  followUpText?: string | null;
  location?: string | null;
  contact?: string | null;
  amount?: string | null;
  supplierId?: string | null;
  dueText?: string | null;
  conditions?: string | null;
  warehouseId?: string | null;
  resultText?: string | null;
  value?: string | null;
  dosageForm?: { name: string };
  memberCount?: number;
  salesIds?: string[];
  salesMembers?: { id: string; name: string }[];
  salesCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
export type RecordConfig = RecordModule & {
  metrics: { label: string; value: string; note: string }[];
  canWrite: boolean;
};
export type RecordFilters = Record<string, string[]>;

/** Values accepted by the current records validator; fields vary by module. */
export type RecordWriteRequest = Record<string, string | number | null | undefined> & {
  expectedUpdatedAt?: string;
};
export type RecordReasonRequest = { reason?: string };
export type RecordRestoreRequest = RecordReasonRequest & { action: 'restore' };
export type RecordListResponse = DataResponse<RecordRow[]> & {
  pagination: OffsetPagination;
  filters?: RecordFilters;
  config?: RecordConfig;
  options?: RecordOptionsResponse;
};
export type RecordDetailResponse = DataResponse<RecordRow>;
export type RecordOptionsResponse = DataResponse<{ id: string; code: string; name: string }[]> & {
  pagination: OffsetPagination;
};
export type RecordFiltersResponse = DataResponse<RecordFilters>;
export type RecordConfigResponse = DataResponse<RecordConfig>;
