// Integration tests use real PostgreSQL inside one rolled-back transaction.
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
const rollback = new Error('ROLLBACK_TEST_ONLY');
let passed = 0;
try {
  await db.$transaction(
    async (tx) => {
      const admin = await tx.user.findFirst({
        where: { deletedAt: null, status: 'ACTIVE', userRole: { is: { roleId: 'ADMIN' } } },
        include: { userRole: true },
      });
      assert.ok(admin);
      let identity = admin;
      let sameOrigin = true;
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
          URLSearchParams,
          Response,
          console,
          require(name) {
            if (name === 'server-only') return {};
            if (name === 'node:crypto') return crypto;
            if (name === '@/generated/prisma/client') return { Prisma };
            if (name === '@/server/db/prisma')
              return { getPrismaClient: () => ({ $transaction: (fn) => fn(tx) }) };
            if (name === '@/server/auth/current-user')
              return { getCurrentApiUser: async () => identity };
            if (name === '@/server/auth/api-authorization')
              return { hasSameOrigin: () => sameOrigin };
            if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
            if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
            throw Error('Unexpected dependency ' + name);
          },
        });
        return exports;
      }
      const { productOptionsHandler } = load('src/server/products/options-handler.ts');
      // Failed SQL requires a savepoint so the surrounding test transaction stays usable.
      async function request(method, params = {}, body = undefined, expected = 200) {
        await tx.$executeRawUnsafe('SAVEPOINT option_test');
        const response = await productOptionsHandler({
          method,
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        const data = await response.json();
        if (response.status >= 400) await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT option_test');
        await tx.$executeRawUnsafe('RELEASE SAVEPOINT option_test');
        assert.equal(response.status, expected, JSON.stringify(data));
        return data;
      }
      async function test(name, fn) {
        await fn();
        passed++;
        console.log('PASS: ' + name);
      }
      const kinds = Object.keys(load('src/config/product-options.ts').PRODUCT_OPTION_KINDS);
      await test('Seeded options in all 10 groups', async () => {
        for (const kind of kinds) assert.ok((await request('GET', { kind })).pagination.total > 0);
      });
      let item;
      const name = 'TASK151-test-' + crypto.randomUUID();
      await test('Admin create, rename and audit', async () => {
        item = (await request('POST', {}, { kind: 'brand', name }, 201)).item;
        item = (
          await request(
            'PATCH',
            {},
            { id: item.id, version: item.version, name: name + '-renamed' },
          )
        ).item;
        assert.equal(item.version, 2);
        assert.ok(
          (await tx.auditEvent.count({
            where: { action: 'PRODUCT_OPTION_UPDATED', after: { path: ['id'], equals: item.id } },
          })) > 0,
        );
      });
      await test('Duplicate name rejected case-insensitively', async () => {
        await request(
          'POST',
          {},
          { kind: 'brand', name: '  ' + item.name.toUpperCase() + '  ' },
          409,
        );
      });
      await test('Version conflict and immutable code rejected', async () => {
        await request('PATCH', {}, { id: item.id, version: 1, name: 'lost update' }, 409);
        await request('PATCH', {}, { id: item.id, version: item.version, code: 'XX' }, 400);
      });
      await test('Disable hides new choices; admin can still read and reopen', async () => {
        item = (await request('PATCH', {}, { id: item.id, version: item.version, active: false }))
          .item;
        assert.equal((await request('GET', { kind: 'brand', id: item.id })).pagination.total, 0);
        assert.equal(
          (await request('GET', { kind: 'brand', id: item.id, includeInactive: 'true' })).data[0]
            .active,
          false,
        );
        item = (await request('PATCH', {}, { id: item.id, version: item.version, active: true }))
          .item;
        assert.equal((await request('GET', { kind: 'brand', id: item.id })).pagination.total, 1);
      });
      await test('Legacy category rename preserves referenced product ID and stock', async () => {
        const category = (await request('GET', { kind: 'category' })).data[0];
        const product = await tx.product.findFirst({ where: { categoryId: category.id } });
        assert.ok(product);
        const changed = (
          await request(
            'PATCH',
            {},
            { id: category.id, version: category.version, name: category.name + ' TASK151-test' },
          )
        ).item;
        const legacy = await tx.productCategory.findUnique({ where: { id: category.id } });
        assert.equal(legacy.name, changed.name);
        assert.equal(
          (await tx.product.findUnique({ where: { id: product.id } })).categoryId,
          category.id,
        );
        await request('PATCH', {}, { id: category.id, version: changed.version, active: false });
        assert.ok(await tx.product.findUnique({ where: { id: product.id } }));
      });
      await test('Legacy ingredient creation uses the same UUID', async () => {
        const entry = (await request('POST', {}, { kind: 'ingredient', name }, 201)).item;
        assert.equal((await tx.drug.findUnique({ where: { id: entry.id } })).name, name);
      });
      await test('Input validation, pagination and search', async () => {
        await request('GET', { kind: 'unknown' }, undefined, 400);
        await request('GET', { kind: 'brand', id: 'invalid' }, undefined, 400);
        await request('POST', {}, { kind: 'codeGroup', name, code: 'TOOLONG' }, 400);
        const page = await request('GET', { kind: 'ingredient', limit: '2', offset: '2' });
        assert.equal(page.data.length, 2);
        assert.equal(
          (await request('GET', { kind: 'brand', search: item.name })).data[0].id,
          item.id,
        );
      });
      await test('Role/origin protection and anonymous denial', async () => {
        identity = { ...admin, userRole: { roleId: 'SALES' } };
        await request('GET', { kind: 'brand' });
        await request('GET', { kind: 'brand', includeInactive: 'true' }, undefined, 403);
        await request('POST', {}, { kind: 'brand', name }, 403);
        await request('PATCH', {}, { id: item.id, version: item.version, active: false }, 403);
        identity = admin;
        sameOrigin = false;
        await request('POST', {}, { kind: 'brand', name }, 403);
        sameOrigin = true;
        identity = null;
        await request('GET', { kind: 'brand' }, undefined, 401);
      });
      await test('RLS enabled; client roles have no direct grants; stock total unchanged', async () => {
        const rows =
          await tx.$queryRaw`SELECT relrowsecurity AS rls,has_table_privilege('anon','public.product_options','SELECT') AS anon,has_table_privilege('authenticated','public.product_options','INSERT') AS client_write FROM pg_class WHERE oid='public.product_options'::regclass`;
        assert.equal(rows[0].rls, true);
        assert.equal(rows[0].anon, false);
        assert.equal(rows[0].client_write, false);
        const totals =
          await tx.$queryRaw`SELECT sum(b.quantity)::int AS quantity FROM stock_balances b JOIN product_lots l ON l.id=b.lot_id JOIN stock_receipts r ON r.id=l.receipt_id WHERE r.code='SEED149-20261005'`;
        assert.equal(totals[0].quantity, 950);
      });
      throw rollback;
    },
    { timeout: 60000, maxWait: 10000 },
  );
} catch (error) {
  if (error !== rollback) {
    console.error(
      'Test failed:',
      error.code === 'ERR_ASSERTION' ? error.message : (error.code ?? error.message),
    );
    process.exitCode = 1;
  } else console.log(`Completed ${passed} checks; all fixture changes rolled back.`);
} finally {
  await db.$disconnect();
}
