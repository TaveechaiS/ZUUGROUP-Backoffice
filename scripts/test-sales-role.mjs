import assert from 'node:assert/strict';
import { canSeePage } from '../src/config/access.ts';
import { ADMIN_PAGES } from '../src/config/navigation.ts';

const adminOnly = [
  '/products/create',
  '/products/stock/create',
  '/stock-counts/create',
  '/promotions/create',
  '/customers/groups/create',
  '/customers/territories/create',
  '/purchases/create',
  '/users',
  '/audit-logs',
  '/settings',
];
for (const href of adminOnly) {
  assert.equal(canSeePage(href, 'SALES'), false, href);
  assert.equal(canSeePage(href, 'ADMIN'), true, href);
}
for (const href of ['/purchases', '/expenses', '/reports/finance', '/billing/create'])
  assert.equal(canSeePage(href, 'SALES'), false, href);
assert.equal(canSeePage('/purchases', 'ACCOUNTING_CFO'), true);
assert.equal(canSeePage('/purchases/create', 'ACCOUNTING_CFO'), false);
assert.equal(canSeePage('/expenses/create', 'ACCOUNTING_CFO'), true);
assert.equal(canSeePage('/expenses/create', 'MANAGER'), false);
assert.equal(canSeePage('/billing/create', 'ACCOUNTING_CFO'), true);
for (const href of [
  '/',
  '/customers',
  '/customers/create',
  '/customers/requests',
  '/customers/dashboard/create',
  '/quotes/create',
  '/orders/create',
  '/billing',
  '/products/stock',
  '/stock-counts',
  '/reports/sales/summary',
  '/reports/inventory/summary',
])
  assert.equal(canSeePage(href, 'SALES'), true, href);
const salesMenu = ADMIN_PAGES.filter((p) => canSeePage(p.href, 'SALES')).map((p) => p.href);
assert.ok(!salesMenu.some((href) => adminOnly.includes(href)));
console.log(`PASS: sales role page access (${salesMenu.length} pages visible)`);
