import type { CustomerOptionKind } from '@/config/customer-options';
export type CustomerOption = {
  id: string;
  kind: CustomerOptionKind;
  name: string;
  code: string | null;
  days: number | null;
  active: boolean;
  version: number;
};
export type CustomerOptionsResponse = {
  data: CustomerOption[];
  pagination: { total: number; limit: number; offset: number };
};
export type CustomerOptionBatch = { options: Record<CustomerOptionKind, CustomerOption[]> };
