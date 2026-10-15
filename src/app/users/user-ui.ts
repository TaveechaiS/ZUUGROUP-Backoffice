export const roles = [
  ['ADMIN', 'Admin'],
  ['SALES', 'Sales'],
  ['MANAGER', 'Manager'],
  ['ACCOUNTING_CFO', 'Accounting & CFO'],
] as const;

export function userPath(employeeCode: string) {
  return `/users/${encodeURIComponent(employeeCode)}`;
}
