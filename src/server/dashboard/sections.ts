import { canSeePage } from '@/config/access';

export function dashboardSections(roleId: string) {
  return {
    finance: canSeePage('/reports/finance', roleId),
    purchases: canSeePage('/purchases', roleId),
    inventory: roleId === 'ADMIN',
    customerRequests: roleId === 'ADMIN',
  };
}
