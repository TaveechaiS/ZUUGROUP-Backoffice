// Contract tests execute actual handlers/services with an isolated read-only DB stub.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import crypto from 'node:crypto';

const id = '11111111-1111-4111-8111-111111111111';
const optionRows = Array.from({ length: 15 }, (_, n) => ({
  id: `${n}`,
  kind: 'codeGroup',
  name: `Group ${n}`,
  code: `G${n}`,
  active: true,
  version: 1,
}));
let actor = { id, name: 'Test', userRole: { roleId: 'ADMIN' } };
let calls = [];
const sql = (strings, ...values) => ({
  text: strings.map((s, n) => s + (n < values.length ? (values[n]?.text ?? '?') : '')).join(''),
  values: values.flatMap((v) => v?.values ?? [v]),
});
const Prisma = {
  sql,
  empty: { text: '', values: [] },
  raw: (text) => ({ text, values: [] }),
  join: (values) => ({
    text: values.map((v) => v?.text ?? '?').join(','),
    values: values.flatMap((v) => v?.values ?? [v]),
  }),
};
const tx = {
  async $queryRaw(q) {
    calls.push(q);
    const s = q.text;
    if (s.includes('FROM inventory_policy'))
      return [{ saleMonths: 3, donationMonths: 6, warningDays: 90 }];
    if (s.includes('MAX(substring')) return [{ value: '1' }];
    if (s.includes('FROM product_options'))
      return s.includes('count(*)') ? [{ total: 15 }] : optionRows;
    if (s.includes('FROM users')) return [];
    if (s.includes('FROM customers')) return [];
    if (s.includes('SELECT id,code,name FROM warehouses'))
      return [{ id, code: 'MAIN', name: 'Main' }];
    if (
      s.includes('SELECT id,code,name,unit FROM products') ||
      s.startsWith('SELECT p.id,p.code,p.name,p.sale_price')
    )
      return [{ id, code: 'P1', name: 'Product', unit: 'box' }];
    if (s.includes('SELECT * FROM items'))
      return [{ id, code: 'P1', mainQuantity: 5, quantity: 20, lotCount: 2 }];
    if (s.includes('SELECT count(*)')) return [{ total: 1 }];
    if (s.includes('GROUP BY l.product_id')) return [{ productId: id, days: 2 }];
    if (s.includes('SELECT id,name FROM product_categories')) return [];
    if (s.startsWith('SELECT l.id FROM product_lots')) return [{ id }];
    if (s.startsWith('SELECT l.id AS "lotId"'))
      return [
        {
          id,
          lotId: id,
          warehouseCode: 'MAIN',
          quantity: 20,
          reserved: 0,
          expiresOn: '2099-01-01',
          condition: 'ปกติ',
          totalCost: '100',
          unitCost: '5',
        },
      ];
    throw Error('Unexpected query: ' + s);
  },
  $executeRaw() {
    throw Error('Writes are prohibited in this test');
  },
};
const db = { ...tx, $transaction: async (fn) => fn(tx) };
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    Date,
    Error,
    Intl,
    JSON,
    Object,
    URLSearchParams,
    Response,
    console,
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return crypto;
      if (name === '@/generated/prisma/client') return { Prisma };
      if (name === '@/server/db/prisma') return { getPrismaClient: () => db };
      if (name === '@/server/auth/current-user') return { getCurrentApiUser: async () => actor };
      if (name === '@/server/auth/api-authorization') return { hasSameOrigin: () => true };
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      throw Error('Unexpected import: ' + name);
    },
  });
  return exports;
}
const options = load('src/server/products/options.ts');
const optionHandler = load('src/server/products/options-handler.ts').productOptionsHandler;
const inventory = load('src/server/operations/service.ts');
let passed = 0;
const metrics = {};
async function test(name, run) {
  calls = [];
  await run();
  passed++;
  console.log('PASS ' + name);
}
await test('Batch returns all 15 options in one query, including empty requested kind', async () => {
  const result = await options.batchProductOptions(new URLSearchParams('kinds=codeGroup,brand'));
  assert.equal(result.options.codeGroup.length, 15);
  assert.equal(result.options.brand.length, 0);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].text.includes('active=true'));
  assert.ok(!calls[0].text.includes('LIMIT'));
});
await test('Batch rejects unknown, duplicate, empty, extra filters and duplicate query keys', async () => {
  for (const q of [
    'kinds=nope',
    'kinds=brand,brand',
    'kinds=',
    'kinds=brand&limit=10',
    'kinds=brand&kinds=unit',
  ])
    await assert.rejects(
      () => options.batchProductOptions(new URLSearchParams(q)),
      (e) => e.status === 400,
    );
  assert.equal(calls.length, 0);
});
await test('Unauthenticated batch does not query DB', async () => {
  actor = null;
  const response = await optionHandler({
    method: 'GET',
    nextUrl: { searchParams: new URLSearchParams('kinds=brand') },
  });
  assert.equal(response.status, 401);
  assert.equal(calls.length, 0);
  actor = { id, name: 'Test', userRole: { roleId: 'ADMIN' } };
});
await test('Table option endpoint default page size is 10', async () => {
  const result = await options.listProductOptions(new URLSearchParams('kind=codeGroup'), true);
  assert.equal(result.pagination.limit, 10);
  assert.ok(calls[0].text.includes('LIMIT ? OFFSET ?'));
  assert.deepEqual(calls[0].values.slice(-2), [10, 0]);
});
const admin = { id, name: 'Test', roleId: 'ADMIN' };
await test('Receive bootstrap only executes products, warehouses, next ID queries', async () => {
  const { data } = await inventory.operationOptions(admin, 'receive');
  assert.deepEqual(Object.keys(data).sort(), [
    'actor',
    'nextReceiptCode',
    'products',
    'warehouses',
  ]);
  assert.equal(calls.length, 3);
  assert.ok(
    !calls.some((q) => /customers|FROM users|inventory_policy|stock_balances/.test(q.text)),
  );
  assert.match(data.nextReceiptCode, /^GR-\d{4}-00001$/);
  metrics.receive = { queries: calls.length, bytes: Buffer.byteLength(JSON.stringify({ data })) };
});
await test('Receive bootstrap non-Admin has no next ID', async () => {
  const { data } = await inventory.operationOptions({ ...admin, roleId: 'SALES' }, 'receive');
  assert.equal(data.nextReceiptCode, undefined);
  assert.equal(calls.length, 2);
});
await test('Legacy options retain old fields and policy', async () => {
  const { data } = await inventory.operationOptions(admin);
  assert.ok('customers' in data && 'users' in data && 'policy' in data);
  assert.ok(calls.some((q) => q.text.includes('stock_balances')));
  metrics.legacy = { queries: calls.length, bytes: Buffer.byteLength(JSON.stringify({ data })) };
});
await test('Inventory options validate scope', async () => {
  await assert.rejects(
    () => inventory.inventoryRead(admin, new URLSearchParams('view=options&scope=nope')),
    (e) => e.status === 400,
  );
  assert.equal(calls.length, 0);
});
await test('Inventory page size 100 accepted; 101 rejected before DB', async () => {
  const result = await inventory.inventoryRead(
    admin,
    new URLSearchParams('view=products&limit=100&metadata=false'),
  );
  assert.equal(result.pagination.limit, 100);
  calls = [];
  await assert.rejects(
    () => inventory.inventoryRead(admin, new URLSearchParams('view=products&limit=101')),
    (e) => e.status === 400,
  );
  assert.equal(calls.length, 0);
});
for (const roleId of ['ADMIN', 'SALES', 'ACCOUNTING_CFO'])
  await test('Receipt capabilities and cost projection for ' + roleId, async () => {
    const r = await inventory.inventoryRead(
      { ...admin, roleId },
      new URLSearchParams(`view=receipt-items&lotId=${id}&limit=1`),
    );
    assert.equal(r.capabilities.canCorrectReceipt, roleId === 'ADMIN');
    assert.equal('totalCost' in r.data[0], roleId !== 'SALES');
    assert.equal(r.pagination.limit, 1);
    assert.ok(
      !calls.some((q) => q.text.includes('FROM users') || q.text.includes('FROM customers')),
    );
  });
await test('Marketing compact projection returns minimum days, no lot array or metadata', async () => {
  const r = await inventory.inventoryRead(
    admin,
    new URLSearchParams('view=products&warehouseCode=MARKETING&projection=summary&metadata=false'),
  );
  assert.equal(r.data[0].marketingDays, 2);
  assert.ok(!('marketingLots' in r.data[0]));
  assert.ok(!('filters' in r));
  assert.ok(
    calls.some((q) => q.text.includes('min(l.expires_on)') && q.text.includes('b.quantity>0')),
  );
  assert.ok(!calls.some((q) => q.text.includes('SELECT id,name FROM product_categories')));
  assert.equal(r.pagination.limit, 10);
});
const collection = JSON.parse(fs.readFileSync('postman/Zuugroup.postman_collection.json', 'utf8'));
await test('Postman folders, 43 routes, bodies, variables and examples are valid', async () => {
  const flat = (items) => items.flatMap((x) => (x.item ? flat(x.item) : [x]));
  const rows = flat(collection.item);
  assert.equal(rows.length, 43);
  assert.deepEqual(
    collection.item.map((x) => x.name),
    ['auth', 'products', 'stock'],
  );
  const variables = new Set(collection.variable.map((x) => x.key));
  for (const row of rows) {
    assert.ok(row.request.url.startsWith('{{baseUrl}}/api/'));
    if (row.request.body?.mode === 'raw') JSON.parse(row.request.body.raw);
    for (const match of JSON.stringify(row).matchAll(/\{\{([^}]+)\}\}/g))
      assert.ok(variables.has(match[1]), match[1]);
    assert.ok(row.response.length >= 1);
  }
  for (const key of ['accessToken', 'loginPassword', 'loginEmail'])
    assert.equal(collection.variable.find((x) => x.key === key).value, '');
});
console.log(`${passed} contract checks passed; no HTTP, real DB, or writes.`);
console.log(
  'Fixture-only bootstrap comparison (not production latency): ' + JSON.stringify(metrics),
);
