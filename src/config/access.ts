export const PAGE_ROLES: Record<string, string[]> = {
  '/users': ['ADMIN'],
  '/audit-logs': ['ADMIN'],
  '/settings': ['ADMIN'],
  '/purchases': ['ADMIN', 'ACCOUNTING_CFO'],
  '/purchases/create': ['ADMIN'],
  '/expenses': ['ADMIN', 'ACCOUNTING_CFO', 'MANAGER'],
  '/expenses/create': ['ADMIN', 'ACCOUNTING_CFO'],
  '/reports/finance': ['ADMIN', 'ACCOUNTING_CFO', 'MANAGER'],
  '/products/create': ['ADMIN'],
  '/products/stock/create': ['ADMIN'],
  '/stock-counts/create': ['ADMIN'],
  '/promotions/create': ['ADMIN'],
  '/customers/groups/create': ['ADMIN'],
  '/customers/territories/create': ['ADMIN'],
  '/billing/create': ['ADMIN', 'ACCOUNTING_CFO'],
  '/quotes/create': ['ADMIN', 'SALES'],
  '/customers/create': ['ADMIN', 'SALES', 'MANAGER'],
  '/customers/requests': ['ADMIN', 'SALES', 'MANAGER'],
  '/customers/dashboard/create': ['ADMIN', 'SALES', 'MANAGER'],
  '/orders/create': ['ADMIN', 'SALES'],
};

export function canSeePage(href: string, roleId: string) {
  const rule = Object.entries(PAGE_ROLES)
    .filter(([prefix]) => href === prefix || href.startsWith(prefix + '/'))
    .sort((a, b) => b[0].length - a[0].length)[0];
  return !rule || rule[1].includes(roleId);
}
