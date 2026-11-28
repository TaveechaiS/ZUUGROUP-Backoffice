export type CustomerDocumentRow = {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  documentTypeName: string;
  licenseExpiresAt: string | null;
};
export type CustomerDocumentPage = {
  data: CustomerDocumentRow[];
  pagination: { offset: number; limit: number; total: number; hasMore: boolean };
  documentTypes: { id: string; name: string }[];
};
