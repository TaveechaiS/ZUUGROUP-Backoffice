// Real DB/service checks in one outer rollback; nothing is seeded or left behind.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';
import dotenv from 'dotenv';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';
import { SerializedPrismaPg } from '../src/server/db/serialized-pg.ts';
dotenv.config({ path: '.env.local', quiet: true });
const db = new PrismaClient({
  adapter: new SerializedPrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const definitions = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
let facade;
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      crypto,
      URLSearchParams,
      Date,
      Intl,
      console,
      Response,
      require(name) {
        if (name === 'server-only') return {};
        if (name === 'node:crypto') return crypto;
        if (name === '@/generated/prisma/client') return { Prisma };
        if (name === '@/server/db/prisma')
          return { getPrismaClient: () => facade, readWithConnectionRetry: (fn) => fn(facade) };
        if (name === '@/features/records/types')
          return {
            RECORD_MODULES: definitions,
            moduleFor: (key) => definitions.find((m) => m.key === key),
          };
        if (name === '@/server/auth/current-user') return { getCurrentApiUser: async () => actor };
        if (name === '@/server/auth/api-authorization') return { hasSameOrigin: () => sameOrigin };
        if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
        if (name.startsWith('.')) return load(path.join(path.dirname(file), name + '.ts'));
        throw Error(name);
      },
    },
  );
  return exports;
}
let actor = null,
  sameOrigin = true;
const service = load('src/server/records/service.ts');
const { recordHandler } = load('src/server/records/handlers.ts');
const { cleanBody } = load('src/server/validation/records.ts');
const territory = service.recordModule('sales-territories');
const request = (method, query = '', body = {}) => ({
  method,
  nextUrl: new URL('http://offline.invalid/api/sales-territories' + query),
  text: async () => JSON.stringify(body),
});
const prefix = 'TASK233-' + crypto.randomUUID().slice(0, 8);
const rollback = Error('TASK233_ROLLBACK');
const baseline = await db.salesTerritory.count();
let checks = 0;
try {
  const parsed = cleanBody(territory, { name: ' เขตทดสอบ ', notes: ' note ' }, false);
  assert.equal(parsed.values.name, 'เขตทดสอบ');
  assert.equal(parsed.values.notes, 'note');
  assert.ok(!('code' in parsed.values));
  assert.ok(parsed.values.status);
  checks++;
  for (const body of [
    { name: ' ' },
    { name: 'a', id: crypto.randomUUID() },
    { name: 'a'.repeat(501) },
    { name: 'a', notes: 'b'.repeat(4001) },
  ]) {
    assert.throws(
      () => cleanBody(territory, body, false),
      (error) => error.status === 400,
    );
    checks++;
  }
  for (const query of ['', '?view=options', '?include=config']) {
    const response = await recordHandler(request('GET', query), 'sales-territories');
    assert.equal(response.status, 401);
    checks++;
  }
  actor = { id: crypto.randomUUID(), userRole: { roleId: 'SALES' } };
  assert.equal(
    (await recordHandler(request('POST', '', { name: 'a' }), 'sales-territories')).status,
    403,
  );
  checks++;
  sameOrigin = false;
  actor.userRole.roleId = 'ADMIN';
  assert.equal(
    (await recordHandler(request('POST', '', { name: 'a' }), 'sales-territories')).status,
    403,
  );
  checks++;
  sameOrigin = true;
  await db.$transaction(
    async (tx) => {
      facade = new Proxy(tx, {
        get(target, key) {
          if (key === '$transaction')
            return (work) => (Array.isArray(work) ? Promise.all(work) : work(facade));
          const value = target[key];
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
      const admin = await tx.user.findFirst({
        where: { status: 'ACTIVE', deletedAt: null, userRole: { roleId: 'ADMIN' } },
        select: { id: true },
      });
      assert.ok(admin, 'Needs the existing active Admin; no test Auth account is created');
      actor = { id: admin.id, userRole: { roleId: 'ADMIN' } };
      const create = await recordHandler(
        request('POST', '', { name: prefix + ' A', notes: 'หมายเหตุทดสอบ' }),
        'sales-territories',
      );
      assert.equal(create.status, 201);
      const first = (await create.json()).data;
      assert.match(first.id, /^[0-9a-f-]{36}$/i);
      assert.equal(first.code, first.id);
      assert.equal(first.notes, 'หมายเหตุทดสอบ');
      assert.equal(first.managerId, null);
      assert.equal(first.salesCount, 0);
      assert.equal(first.memberCount, 0);
      checks++;
      const second = (
        await service.recordWrite(
          territory,
          'create',
          null,
          { name: prefix + ' B' },
          { id: admin.id, roleId: 'ADMIN' },
        )
      ).data;
      assert.notEqual(first.id, second.id);
      assert.equal(second.code, second.id);
      checks++;
      const stored = await tx.salesTerritory.findUnique({ where: { id: first.id } });
      assert.equal(stored.name, prefix + ' A');
      assert.equal(stored.code, first.id);
      checks++;
      const detail = await recordHandler(request('GET'), 'sales-territories', first.id);
      assert.equal(detail.status, 200);
      assert.equal((await detail.json()).data.id, first.id);
      checks++;
      actor.userRole.roleId = 'SALES';
      const list = await recordHandler(
        request(
          'GET',
          '?include=config&search=' + prefix + '&limit=1&sortBy=name&sortDirection=asc',
        ),
        'sales-territories',
      );
      assert.equal(list.status, 200);
      const listBody = await list.json();
      assert.equal(listBody.pagination.total, 2);
      assert.equal(listBody.data.length, 1);
      assert.equal(listBody.data[0].id, first.id);
      assert.equal(listBody.config.canWrite, false);
      checks++;
      const options = await recordHandler(
        request('GET', '?view=options&search=' + prefix),
        'sales-territories',
      );
      assert.equal(options.status, 200);
      assert.equal((await options.json()).data.length, 2);
      checks++;
      assert.equal(
        (await recordHandler(request('GET'), 'sales-territories', crypto.randomUUID())).status,
        404,
      );
      checks++;
      assert.equal(
        (await recordHandler(request('GET'), 'sales-territories', 'ZONE-001')).status,
        404,
      );
      checks++;
      assert.equal(
        await tx.auditEvent.count({
          where: { action: 'sales-territories.create', after: { path: ['id'], equals: first.id } },
        }),
        1,
      );
      checks++;
      // TASK-269: edit name/notes, refuse deleting a territory with customers, delete + restore.
      actor.userRole.roleId = 'ADMIN';
      const send = async (method, id, body) => {
        await tx.$executeRawUnsafe('SAVEPOINT territory_test');
        const response = await recordHandler(
          {
            ...request(method, '', body),
            nextUrl: new URL('http://offline.invalid/api/sales-territories/' + id),
          },
          'sales-territories',
          id,
        );
        if (response.status >= 400)
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT territory_test');
        await tx.$executeRawUnsafe('RELEASE SAVEPOINT territory_test');
        return response;
      };
      const current = await tx.salesTerritory.findUnique({ where: { id: first.id } });
      assert.equal(
        (
          await send('PATCH', first.id, {
            name: prefix + ' A2',
            notes: 'แก้ไข',
            expectedUpdatedAt: current.updatedAt.toISOString(),
          })
        ).status,
        200,
      );
      assert.equal(
        (await tx.salesTerritory.findUnique({ where: { id: first.id } })).name,
        prefix + ' A2',
      );
      assert.equal(
        (
          await send('PATCH', first.id, {
            name: 'x',
            expectedUpdatedAt: current.updatedAt.toISOString(),
          })
        ).status,
        409,
      );
      checks++;
      const withCustomers = await tx.salesTerritory.findFirst({
        where: { deletedAt: null, customerRecords: { some: { deletedAt: null } } },
      });
      if (withCustomers) {
        assert.equal((await send('DELETE', withCustomers.id, { reason: 'ทดสอบ' })).status, 409);
        checks++;
      }
      assert.equal((await send('DELETE', first.id, { reason: 'ทดสอบลบเขต' })).status, 200);
      const deleted = await recordHandler(
        { ...request('GET', '?deleted=true&search=' + encodeURIComponent(prefix)) },
        'sales-territories',
      );
      assert.ok((await deleted.json()).data.some((row) => row.id === first.id));
      assert.equal((await send('PATCH', first.id, { action: 'restore' })).status, 200);
      assert.equal(
        (await tx.salesTerritory.findUnique({ where: { id: first.id } })).deletedAt,
        null,
      );
      checks++;
      throw rollback;
    },
    { timeout: 60000 },
  );
} catch (error) {
  if (error !== rollback) throw error;
} finally {
  await db.$disconnect();
}
const verify = new PrismaClient({
  adapter: new SerializedPrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  assert.equal(await verify.salesTerritory.count(), baseline);
  assert.equal(await verify.salesTerritory.count({ where: { name: { startsWith: prefix } } }), 0);
} finally {
  await verify.$disconnect();
}
console.log(
  `PASS ${checks} territory service/handler checks: name-only create, UUID, stored row, audit, reads/search/sort/options, validation and auth; all writes rolled back`,
);
