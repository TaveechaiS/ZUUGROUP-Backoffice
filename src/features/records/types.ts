import definitions from './modules.json';
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
export const RECORD_MODULES = definitions as RecordModule[];
export const moduleFor = (key: string) => RECORD_MODULES.find((m) => m.key === key);
export const moduleForPage = (page: string) =>
  RECORD_MODULES.find(
    (m) => m.page === page || (page === '/customers/list' && m.key === 'customers'),
  );
export type RecordRow = {
  id: string;
  ref: string;
  title: string;
  subtitle: string;
  owner: string;
  value: string;
  status: string;
  deletedAt: string | null;
  fields: Record<string, string | null>;
  updatedAt: string;
};
export type RecordConfig = RecordModule & {
  metrics: { label: string; value: string; note: string }[];
  canWrite: boolean;
};
export type RecordFilters = {
  owners: string[];
  statuses: string[];
  types: string[];
  details: string[];
};
export async function readRecord<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, cache: 'no-store' });
  const result = await response.json();
  if (!response.ok)
    throw new Error(
      typeof result.error === 'string'
        ? result.error
        : (result.error?.message ?? 'โหลดข้อมูลไม่สำเร็จ'),
    );
  return result as T;
}
