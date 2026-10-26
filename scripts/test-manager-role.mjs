import assert from 'node:assert/strict';
import { canSeePage } from '../src/config/access.ts';
import { ADMIN_PAGES } from '../src/config/navigation.ts';

const hidden = [
  '/quotes/create',
  '/orders/create',
  '/billing/create',
  '/expenses/create',
  '/purchases',
  '/purchases/create',
  '/products/create',
  '/products/stock/create',
  '/stock-counts/create',
  '/promotions/create',
  '/customers/groups/create',
  '/customers/territories/create',
  '/users',
  '/audit-logs',
  '/settings',
];
for (const href of hidden) assert.equal(canSeePage(href, 'MANAGER'), false, href);
for (const href of [
  '/',
  '/quotes',
  '/orders',
  '/billing',
  '/expenses',
  '/reports/finance/aging',
  '/reports/sales/sellers',
  '/customers',
  '/customers/create',
  '/customers/requests',
  '/customers/dashboard/create',
  '/products/stock',
  '/stock-counts',
])
  assert.equal(canSeePage(href, 'MANAGER'), true, href);
for (const href of ['/quotes/create', '/orders/create']) {
  assert.equal(canSeePage(href, 'SALES'), true, href);
  assert.equal(canSeePage(href, 'ADMIN'), true, href);
}
const menu = ADMIN_PAGES.filter((p) => canSeePage(p.href, 'MANAGER')).map((p) => p.href);
assert.ok(!menu.some((href) => hidden.includes(href)));
console.log(`PASS: manager role page access (${menu.length} pages visible)`);
