// Read-only integration checks: actual services/handler and DB; only identity is stubbed.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';

dotenv.config({ path: '.env.local', quiet: true });
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const cache = new Map();
let identity;
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
    URLSearchParams,
    Response,
    console,
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return crypto;
      if (name === '@/generated/prisma/client') return { Prisma };
      if (name === '@/server/db/prisma')
        return { getPrismaClient: () => db, readWithConnectionRetry: (fn) => fn(db) };
      if (name === '@/server/auth/current-user') return { getCurrentApiUser: async () => identity };
      if (name === '@/server/auth/api-authorization') return { hasSameOrigin: () => true };
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      throw Error('Unexpected dependency ' + name);
    },
  });
  return exports;
}
try {
  const admin = await db.user.findFirst({
    where: { status: 'ACTIVE', deletedAt: null, userRole: { is: { roleId: 'ADMIN' } } },
    include: { userRole: true },
  });
  assert.ok(admin);
  identity = admin;
  const { operationsHandler } = load('src/server/operations/handlers.ts');
  async function get(query, status = 200) {
    const response = await operationsHandler(
      { method: 'GET', nextUrl: { searchParams: new URLSearchParams(query) } },
      'inventory',
    );
    const body = await response.json();
    assert.equal(response.status, status, JSON.stringify(body));
    return body;
  }
  const receipt = await db.stockReceipt.findUnique({ where: { code: 'SEED149-20261005' } });
  assert.ok(receipt);
  const all = await get({ view: 'products', search: 'ข้อมูลตัวอย่าง', limit: '10', offset: '0' });
  assert.equal(all.pagination.total, 12);
  assert.equal(all.data.length, 10);
  const second = await get({
    view: 'products',
    search: 'ข้อมูลตัวอย่าง',
    limit: '10',
    offset: '10',
  });
  assert.equal(second.data.length, 2);
  assert.equal(new Set([...all.data, ...second.data].map((r) => r.id)).size, 12);
  for (const warehouseCode of ['', 'MAIN', 'MARKETING', 'DISPOSAL']) {
    const body = await get({
      view: 'products',
      search: 'ข้อมูลตัวอย่าง',
      warehouseCode,
      limit: '50',
      offset: '0',
    });
    const expected = await db.$queryRaw(
      Prisma.sql`SELECT p.id,COALESCE(sum(b.quantity) FILTER (WHERE ${warehouseCode ? Prisma.sql`w.code=${warehouseCode}` : Prisma.sql`true`}),0)::int AS quantity FROM products p LEFT JOIN product_lots l ON l.product_id=p.id LEFT JOIN stock_balances b ON b.lot_id=l.id LEFT JOIN warehouses w ON w.id=b.warehouse_id WHERE p.name LIKE '%(ข้อมูลตัวอย่าง)' GROUP BY p.id ${warehouseCode && warehouseCode !== 'MAIN' ? Prisma.sql`HAVING COALESCE(sum(b.quantity) FILTER (WHERE w.code=${warehouseCode}),0)>0` : Prisma.empty}`,
    );
    assert.equal(body.pagination.total, expected.length);
    for (const row of body.data) {
      assert.equal(row.quantity, expected.find((r) => r.id === row.id).quantity);
      assert.ok(row.reserved >= 0 && row.reserved <= row.quantity);
      assert.equal(row.available, row.quantity - row.reserved);
      assert.ok(!('unitCost' in row) && !('totalCost' in row));
    }
    console.log(
      JSON.stringify({
        warehouse: warehouseCode || 'ALL',
        products: body.pagination.total,
        quantity: body.data.reduce((n, r) => n + r.quantity, 0),
      }),
    );
  }
  assert.equal(
    (await get({ view: 'products', search: 'ข้อมูลตัวอย่าง', status: 'INACTIVE' })).pagination
      .total,
    1,
  );
  assert.equal(
    (await get({ view: 'products', search: 'MED-TAB-9001' })).data[0].code,
    'MED-TAB-9001',
  );
  await get({ view: 'products', warehouseCode: 'WRONG' }, 400);
  identity = { ...admin, userRole: { roleId: 'SALES' } };
  await get({ view: 'products', deleted: 'true' }, 403);
  identity = null;
  await get({ view: 'products' }, 401);
  const ledger = await db.$queryRaw(
    Prisma.sql`SELECT b.lot_id FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id LEFT JOIN stock_movements m ON m.lot_id=b.lot_id AND m.warehouse_id=b.warehouse_id WHERE l.receipt_id=${receipt.id}::uuid GROUP BY b.lot_id,b.quantity HAVING COALESCE(sum(m.quantity),0)<>b.quantity`,
  );
  assert.equal(ledger.length, 0);
  const products = load('src/server/products/service.ts');
  assert.equal(
    (
      await products.paginatedProducts(
        new URLSearchParams({ search: 'ข้อมูลตัวอย่าง', limit: '10' }),
        true,
      )
    ).pagination.total,
    12,
  );
  console.log(
    'PASS: real DB readback, inventory GET handler, products service, pagination, search, status, warehouse scope, ledger and 400/401/403.',
  );
} catch (error) {
  console.error(
    'Verification failed:',
    error.code === 'ERR_ASSERTION' ? error.message : (error.code ?? error.message),
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
