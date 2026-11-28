import type { Pagination } from '@/types/api';
export type AuditRow = {
  id: string;
  occurredAt: string;
  action: string;
  actorRole: string | null;
  requestId: string;
  actor: { name: string; employeeCode: string } | null;
  target: { name: string; employeeCode: string } | null;
};
export type AuditListResponse = {
  rows: AuditRow[];
  pagination: Pagination;
  filters?: AuditFiltersResponse;
};
export type AuditFiltersResponse = { actions: string[] };
