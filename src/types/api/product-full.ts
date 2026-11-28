export type ProductFileView = {
  id: string;
  kind: 'image' | 'document';
  name: string;
  type: string;
  size: number;
};
export type ProductDetails = {
  fields: Record<string, string>;
  options: Record<string, string>;
  files: ProductFileView[];
};
export type ProductDraft = {
  fields: Record<string, string>;
  sequence: string;
  files: (ProductFileView & { digest: string })[];
};
export type ProductEditContext = {
  targetProductId: string;
  expectedVersion: string;
  keepFileIds: string[];
};
export type ProductHistoryEntry = {
  id: string;
  occurredAt: string;
  actorName: string;
  action: string;
  changes: { field: string; before: string; after: string }[];
};
