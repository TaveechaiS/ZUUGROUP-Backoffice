import assert from 'node:assert/strict';
import { canSeePage } from '../src/config/access.ts';
import { ADMIN_PAGES } from '../src/config/navigation.ts';

const hidden = [
  '/customers/create',
  '/customers/requests',
  '/customers/dashboard/create',
  '/quotes/create',
  '/orders/create',
  '/purchases/create',
  '/products/create',
  '/products/stock/create',
  '/stock-counts/create',
  '/promotions/create',
  '/users',
  '/audit-logs',
  '/settings',
];
for (const href of hidden) assert.equal(canSeePage(href, 'ACCOUNTING_CFO'), false, href);
for (const href of [
  '/',
  '/billing',
  '/billing/create',
  '/expenses',
  '/expenses/create',
  '/purchases',
  '/reports/finance/aging',
  '/reports/sales/summary',
  '/customers',
  '/orders',
  '/quotes',
])
  assert.equal(canSeePage(href, 'ACCOUNTING_CFO'), true, href);
for (const role of ['ADMIN', 'SALES', 'MANAGER'])
  for (const href of ['/customers/create', '/customers/requests', '/customers/dashboard/create'])
    assert.equal(canSeePage(href, role), true, role + href);
const menu = ADMIN_PAGES.filter((p) => canSeePage(p.href, 'ACCOUNTING_CFO')).map((p) => p.href);
assert.ok(!menu.some((href) => hidden.includes(href)));
console.log(`PASS: cfo role page access (${menu.length} pages visible)`);
