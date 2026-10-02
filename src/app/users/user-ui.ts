export const roles = [
  ['ADMIN', 'Admin'],
  ['SALES', 'Sales'],
  ['MANAGER', 'Manager'],
  ['ACCOUNTING_CFO', 'Accounting & CFO'],
] as const;

export const fieldClass =
  'mt-1.5 h-10 w-full rounded-lg border border-[#dce4ed] bg-white px-3 text-sm text-[#26364b] outline-none focus:border-[#1a58a7]';

export function userPath(employeeCode: string) {
  return `/users/${encodeURIComponent(employeeCode)}`;
}
