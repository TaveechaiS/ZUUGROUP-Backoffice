export type ProductView = {
  id: string; code: string; name: string; sequence: string;
  categoryId: string; category: string; categoryCode: string;
  dosageFormId: string; dosageForm: string; dosageFormCode: string;
  drugId: string; drug: string; defaultWarehouseId: string; warehouse: string;
  unit: string; salePrice: string; status: 'ACTIVE' | 'INACTIVE';
  isSample: boolean; deletedAt: string | null; deleteReason: string | null; createdAt: string;
};
export type Master = { id: string; name: string; code?: string };
export type Masters = { categories: Master[]; dosageForms: Master[]; drugs: Master[]; warehouses: Master[] };
export const inputClass = 'mt-1.5 h-10 w-full rounded-md border border-[#d9e3ee] bg-white px-3 text-sm text-[#26364b] outline-none focus:border-[#1a58a7]';
export const buttonClass = 'rounded-md bg-[#1a58a7] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';
export const money = (value: string) => new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
