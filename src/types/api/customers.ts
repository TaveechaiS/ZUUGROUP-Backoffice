import type {
  CUSTOMER_OPTION_FIELDS,
  CUSTOMER_TEXT_FIELDS,
  SHIPPING_FIELDS,
} from '@/config/customers';

export type CustomerTextField = keyof typeof CUSTOMER_TEXT_FIELDS;
export type CustomerOptionField = keyof typeof CUSTOMER_OPTION_FIELDS;
export type ShippingAddress = { id: string; isDefault: boolean } & Record<
  keyof typeof SHIPPING_FIELDS,
  string
>;

export type CustomerFileView = {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  name: string;
  type: string;
  size: number;
};
export type CustomerDraft = {
  codeGroupId: string;
  sequence: string;
  fields: Record<CustomerTextField | CustomerOptionField, string>;
  shippingAddresses: ShippingAddress[];
  files: (Omit<CustomerFileView, 'documentTypeName'> & { digest: string })[];
};
export type CustomerDetails = {
  fields: Record<CustomerTextField | CustomerOptionField, string>;
  shippingAddresses: ShippingAddress[];
  files: CustomerFileView[];
};

export type CustomerListRow = {
  id: string;
  code: string;
  name: string;
  province: string;
  contactName: string;
  phone: string;
  status: string;
  licenseStatus: string;
  licenseExpiresAt: string | null;
  creditDays: number | null;
  creditTermName: string | null;
  creditLimit: string | null;
  territoryId: string | null;
  territoryName: string | null;
  deletedAt: string | null;
  deleteReason: string | null;
};
export type CustomerListResponse = {
  data: CustomerListRow[];
  pagination: { total: number; limit: number; offset: number };
  filters?: {
    provinces: string[];
    territories: { id: string; name: string }[];
    licenseStatuses: string[];
  };
  config?: { canWrite: boolean };
};
export type CustomerDetailResponse = {
  data: CustomerListRow & {
    codeGroup: { id: string; code: string; name: string } | null;
    sequence: number | null;
    creditTerm: { id: string; name: string; days: number } | null;
    creditStart: { id: string; name: string } | null;
    details: CustomerDetails;
    createdAt: string;
    updatedAt: string;
    history: { createdBy: string | null; updatedBy: string | null; updatedAt: string | null };
  };
  config: { canWrite: boolean };
};
