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
              return {
                getPrismaClient: () =>
                  new Proxy(tx, {
                    get: (target, key) =>
                      key === '$transaction'
                        ? (fn) => fn(tx)
                        : typeof target[key] === 'function'
                          ? target[key].bind(target)
                          : target[key],
                  }),
              };
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
      const { customerOptionsHandler } = load('src/server/customers/options-handler.ts');
      // Failed SQL requires a savepoint so the surrounding test transaction stays usable.
      async function request(method, params = {}, body = undefined, expected = 200) {
        await tx.$executeRawUnsafe('SAVEPOINT option_test');
        const response = await customerOptionsHandler({
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
      await test('Seeded agreed values: 5 code groups, 4 credit terms, 5 document types', async () => {
        const batch = await request('GET', { kinds: 'codeGroup,creditTerm,documentType' });
        assert.deepEqual(batch.options.codeGroup.map((item) => item.code).sort(), [
          'CLN',
          'GOV',
          'HOS',
          'PHA',
          'WSL',
        ]);
        assert.deepEqual(
          batch.options.creditTerm.map((item) => item.days),
          [0, 30, 60, 90],
        );
        assert.equal(batch.options.documentType.length, 5);
      });
      const name = 'TASK262-test-' + crypto.randomUUID();
      let item;
      await test('Admin creates billing cycle, renames it and audit is written', async () => {
        item = (await request('POST', {}, { kind: 'billingCycle', name }, 201)).item;
        assert.equal(item.code, null);
        assert.equal(item.days, null);
        item = (
          await request('PATCH', {}, { id: item.id, version: item.version, name: name + '-x' })
        ).item;
        assert.equal(item.version, 2);
        assert.ok(
          (await tx.auditEvent.count({
            where: { action: 'CUSTOMER_OPTION_UPDATED', after: { path: ['id'], equals: item.id } },
          })) > 0,
        );
      });
      await test('Credit term requires days 0–365 and days can be edited', async () => {
        await request('POST', {}, { kind: 'creditTerm', name }, 400);
        await request('POST', {}, { kind: 'creditTerm', name, days: 400 }, 400);
        await request('POST', {}, { kind: 'creditTerm', name, days: 1.5 }, 400);
        let term = (await request('POST', {}, { kind: 'creditTerm', name, days: 45 }, 201)).item;
        term = (await request('PATCH', {}, { id: term.id, version: term.version, days: 15 })).item;
        assert.equal(term.days, 15);
        await request('PATCH', {}, { id: item.id, version: item.version, days: 3 }, 400);
        await request('POST', {}, { kind: 'creditStart', name, days: 3 }, 400);
      });
      await test('Code group requires unique 2–3 char code; others reject code', async () => {
        await request('POST', {}, { kind: 'codeGroup', name }, 400);
        await request('POST', {}, { kind: 'codeGroup', name, code: 'TOOLONG' }, 400);
        await request('POST', {}, { kind: 'codeGroup', name, code: 'pha' }, 409);
        await request('POST', {}, { kind: 'documentType', name, code: 'AB' }, 400);
        const group = (await request('POST', {}, { kind: 'codeGroup', name, code: 'zz' }, 201))
          .item;
        assert.equal(group.code, 'ZZ');
      });
      await test('Duplicate name rejected case-insensitively; unknown fields rejected', async () => {
        await request(
          'POST',
          {},
          { kind: 'billingCycle', name: '  ' + item.name.toUpperCase() },
          409,
        );
        await request('POST', {}, { kind: 'billingCycle', name: 'x', extra: 1 }, 400);
      });
      await test('Version conflict and immutable kind/code rejected', async () => {
        await request('PATCH', {}, { id: item.id, version: 1, name: 'lost update' }, 409);
        await request('PATCH', {}, { id: item.id, version: item.version, code: 'XX' }, 400);
        await request('PATCH', {}, { id: item.id, version: item.version, kind: 'codeGroup' }, 400);
      });
      await test('Disable hides choice from form batch; admin still lists and reopens', async () => {
        item = (await request('PATCH', {}, { id: item.id, version: item.version, active: false }))
          .item;
        const batch = await request('GET', { kinds: 'billingCycle' });
        assert.ok(!batch.options.billingCycle.some((entry) => entry.id === item.id));
        const all = await request('GET', {
          kind: 'billingCycle',
          includeInactive: 'true',
          search: item.name,
        });
        assert.equal(all.data[0].active, false);
        item = (await request('PATCH', {}, { id: item.id, version: item.version, active: true }))
          .item;
      });
      await test('Validation, search, sort and pagination', async () => {
        await request('GET', { kind: 'unknown' }, undefined, 400);
        await request('GET', { kinds: 'codeGroup,unknown' }, undefined, 400);
        await request('GET', { kinds: 'codeGroup', limit: '1' }, undefined, 400);
        const page = await request('GET', { kind: 'codeGroup', limit: '2', offset: '0' });
        assert.equal(page.data.length, 2);
        const sorted = await request('GET', {
          kind: 'creditTerm',
          sortBy: 'days',
          sortDirection: 'desc',
        });
        assert.ok(sorted.data[0].days >= sorted.data.at(-1).days);
        await request('GET', { kind: 'creditTerm', sortBy: 'bad' }, undefined, 400);
        assert.equal(
          (await request('GET', { kind: 'codeGroup', search: 'PHA' })).data[0].code,
          'PHA',
        );
      });
      await test('Role/origin protection and anonymous denial', async () => {
        identity = { ...admin, userRole: { roleId: 'SALES' } };
        await request('GET', { kinds: 'codeGroup' });
        await request('GET', { kind: 'codeGroup', includeInactive: 'true' }, undefined, 403);
        await request('POST', {}, { kind: 'billingCycle', name: name + '2' }, 403);
        identity = admin;
        sameOrigin = false;
        await request('POST', {}, { kind: 'billingCycle', name: name + '2' }, 403);
        sameOrigin = true;
        identity = null;
        await request('GET', { kind: 'codeGroup' }, undefined, 401);
      });
      await test('RLS enabled and client roles have no direct grants', async () => {
        const rows =
          await tx.$queryRaw`SELECT relrowsecurity AS rls,has_table_privilege('anon','public.customer_options','SELECT') AS anon,has_table_privilege('authenticated','public.customer_options','INSERT') AS client_write FROM pg_class WHERE oid='public.customer_options'::regclass`;
        assert.equal(rows[0].rls, true);
        assert.equal(rows[0].anon, false);
        assert.equal(rows[0].client_write, false);
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
