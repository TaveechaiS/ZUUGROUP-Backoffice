export const PAGE_ROLES: Record<string, string[]> = {
  '/users': ['ADMIN'],
  '/audit-logs': ['ADMIN'],
  '/settings': ['ADMIN'],
  '/purchases': ['ADMIN', 'ACCOUNTING_CFO'],
  '/expenses': ['ADMIN', 'ACCOUNTING_CFO', 'MANAGER'],
  '/reports/finance': ['ADMIN', 'ACCOUNTING_CFO', 'MANAGER'],
};

export function canSeePage(href: string, roleId: string) {
  const rule = Object.entries(PAGE_ROLES).find(
    ([prefix]) => href === prefix || href.startsWith(prefix + '/'),
  );
  return !rule || rule[1].includes(roleId);
}
