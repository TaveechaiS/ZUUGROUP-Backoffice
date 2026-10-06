// Real service/DB integration with an outer rollback; no persistent business fixtures.
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
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    {
      exports,
      crypto,
      console,
      URLSearchParams,
      Date,
      Intl,
      require(name) {
        if (name === 'server-only') return {};
        if (name === '@/generated/prisma/client') return { Prisma };
        if (name === '@/server/db/prisma')
          return { getPrismaClient: () => facade, readWithConnectionRetry: (fn) => fn(facade) };
        if (name === '@/features/records/types')
          return {
            RECORD_MODULES: definitions,
            moduleFor: (key) => definitions.find((m) => m.key === key),
          };
        if (name === 'node:crypto') return crypto;
        if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
        if (name.startsWith('.')) return load(path.join(path.dirname(file), name + '.ts'));
        throw Error(name);
      },
    },
  );
  return exports;
}
const { recordWrite, recordModule, recordDetail, recordList } = load(
  'src/server/records/service.ts',
);
const { cleanBody } = load('src/server/validation/records.ts');
const territory = recordModule('sales-territories');
const ids = Array.from({ length: 6 }, () => crypto.randomUUID());
const prefix = 'TASK224-' + crypto.randomUUID().slice(0, 8);
const rollback = new Error('TASK224_ROLLBACK');
const baseline = await db.salesTerritory.count();
let checks = 0;
async function reject(work, status) {
  await assert.rejects(work, (error) => error.status === status);
  checks++;
}
try {
  assert.throws(() => cleanBody(territory, { salesIds: [ids[0], ids[0].toUpperCase()] }, true));
  assert.throws(() => cleanBody(territory, { salesIds: [ids[0]], salesId: ids[0] }, true));
  assert.throws(() => cleanBody(territory, { salesIds: ['bad'] }, true));
  checks += 3;
  await db
    .$transaction(
      async (tx) => {
        facade = new Proxy(tx, {
          get(target, key) {
            if (key === '$transaction')
              return async (work) => (typeof work === 'function' ? work(tx) : Promise.all(work));
            const value = Reflect.get(target, key);
            return typeof value === 'function' ? value.bind(target) : value;
          },
        });
        const admin = await tx.user.findFirst({
          where: { userRole: { roleId: 'ADMIN' }, deletedAt: null },
        });
        assert.ok(admin);
        const actor = { id: admin.id, roleId: 'ADMIN' };
        await tx.user.createMany({
          data: ids.map((id, n) => ({
            id,
            employeeCode: prefix + '-' + n,
            email: prefix + '-' + n + '@example.invalid',
            name: 'Fixture ' + n,
            status: 'ACTIVE',
          })),
        });
        await tx.userRole.createMany({
          data: ids.map((userId, n) => ({ userId, roleId: n === 5 ? 'MANAGER' : 'SALES' })),
        });
        const created = (
          await recordWrite(
            territory,
            'create',
            null,
            {
              code: prefix,
              name: prefix,
              status: 'ใช้งานอยู่',
              managerId: ids[5],
              salesIds: ids.slice(0, 3),
            },
            actor,
          )
        ).data;
        assert.equal(created.salesCount, 3);
        assert.equal(created.salesIds.length, 3);
        assert.ok(
          created.salesName.includes('Fixture 0') && created.salesName.includes('Fixture 2'),
        );
        checks++;
        await reject(
          () =>
            recordWrite(
              territory,
              'create',
              null,
              { code: prefix + '-taken', name: 'Taken', status: 'ใช้งานอยู่', salesIds: [ids[1]] },
              actor,
            ),
          409,
        );
        await reject(
          () =>
            recordWrite(
              territory,
              'create',
              null,
              { code: prefix + '-role', name: 'Wrong', status: 'ใช้งานอยู่', salesIds: [ids[5]] },
              actor,
            ),
          400,
        );
        const edited = (
          await recordWrite(
            territory,
            'update',
            created.id,
            {
              name: 'Edited',
              salesIds: [ids[1], ids[2], ids[3], ids[4]],
              expectedUpdatedAt: created.updatedAt,
            },
            actor,
          )
        ).data;
        assert.equal(edited.salesCount, 4);
        assert.ok(!edited.salesIds.includes(ids[0]));
        checks++;
        await reject(
          () =>
            recordWrite(
              territory,
              'update',
              created.id,
              { name: 'Stale', salesIds: [], expectedUpdatedAt: created.updatedAt },
              actor,
            ),
          409,
        );
        const partial = (
          await recordWrite(
            territory,
            'update',
            created.id,
            { notes: 'Only notes', expectedUpdatedAt: edited.updatedAt },
            actor,
          )
        ).data;
        assert.equal(partial.salesCount, 4);
        checks++;
        const scalar = (
          await recordWrite(
            territory,
            'update',
            created.id,
            { salesId: partial.salesId, expectedUpdatedAt: partial.updatedAt },
            actor,
          )
        ).data;
        assert.equal(scalar.salesCount, 4);
        checks++;
        await reject(
          () =>
            recordWrite(
              territory,
              'update',
              created.id,
              { salesId: ids[0], expectedUpdatedAt: scalar.updatedAt },
              actor,
            ),
          409,
        );
        const detail = (await recordDetail(territory, created.id)).data;
        assert.equal(detail.salesMembers.length, 4);
        const list = await recordList(
          territory,
          new URLSearchParams({ sortBy: 'salesCount', sortDirection: 'desc', limit: '10' }),
        );
        assert.equal(list.data[0].salesCount, 4);
        checks++;
        const customer = await tx.customer.create({
          data: { code: prefix + '-customer', name: 'Fixture customer', territoryId: created.id },
        });
        const customerView = (await recordDetail(recordModule('customers'), customer.id)).data;
        assert.ok(
          customerView.salesName.includes('Fixture 1') &&
            customerView.salesName.includes('Fixture 4'),
        );
        checks++;
        const order = await tx.salesOrder.create({
          data: {
            code: prefix + '-order',
            name: 'Fixture order',
            customerId: customer.id,
            territoryId: created.id,
            createdById: admin.id,
          },
        });
        const { orderRead } = load('src/server/operations/service.ts');
        const orderView = await orderRead(actor, new URLSearchParams(), order.id);
        assert.ok(
          JSON.stringify(orderView).includes('Fixture 1') &&
            JSON.stringify(orderView).includes('Fixture 4'),
        );
        checks++;
        await reject(
          () =>
            recordWrite(
              territory,
              'delete',
              created.id,
              { reason: 'Cannot delete assigned' },
              actor,
            ),
          409,
        );
        const empty = (
          await recordWrite(
            territory,
            'update',
            created.id,
            { salesIds: [], expectedUpdatedAt: scalar.updatedAt },
            actor,
          )
        ).data;
        assert.equal(empty.salesCount, 0);
        checks++;
        assert.equal(await tx.salesTerritorySales.count({ where: { territoryId: created.id } }), 0);
        throw rollback;
      },
      { timeout: 30000 },
    )
    .catch((error) => {
      if (error !== rollback) throw error;
    });
  assert.equal(await db.salesTerritory.count(), baseline);
  assert.equal(await db.user.count({ where: { id: { in: ids } } }), 0);
  const raceUserId = crypto.randomUUID();
  const raceTerritoryIds = [crypto.randomUUID(), crypto.randomUUID()];
  try {
    await db.user.create({
      data: {
        id: raceUserId,
        employeeCode: prefix + '-race',
        email: prefix + '-race@example.invalid',
        name: 'Race fixture',
        userRole: { create: { roleId: 'SALES' } },
      },
    });
    await db.salesTerritory.createMany({
      data: raceTerritoryIds.map((id, n) => ({
        id,
        code: prefix + '-race-' + n,
        name: 'Race territory',
      })),
    });
    const admin = await db.user.findFirst({
      where: { userRole: { roleId: 'ADMIN' }, deletedAt: null },
    });
    facade = db;
    const outcomes = await Promise.allSettled(
      raceTerritoryIds.map((id) =>
        recordWrite(
          territory,
          'update',
          id,
          { salesIds: [raceUserId] },
          { id: admin.id, roleId: 'ADMIN' },
        ),
      ),
    );
    assert.equal(outcomes.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(outcomes.find((result) => result.status === 'rejected').reason.status, 409);
    assert.equal(await db.salesTerritorySales.count({ where: { userId: raceUserId } }), 1);
    checks++;
  } finally {
    await db.$transaction(async (tx) => {
      await tx.$executeRaw(
        Prisma.sql`DELETE FROM audit_events WHERE after->>'id'=ANY(${raceTerritoryIds}::text[]) OR before->>'id'=ANY(${raceTerritoryIds}::text[])`,
      );
      await tx.salesTerritorySales.deleteMany({ where: { territoryId: { in: raceTerritoryIds } } });
      await tx.salesTerritory.deleteMany({ where: { id: { in: raceTerritoryIds } } });
      await tx.userRole.deleteMany({ where: { userId: raceUserId } });
      await tx.user.deleteMany({ where: { id: raceUserId } });
    });
  }
  assert.equal(await db.salesTerritory.count(), baseline);
  console.log(
    `PASS ${checks} actual DB/service checks: multiple create/edit/remove, duplicate territory, concurrent assignment, wrong role, stale version, partial/legacy preservation, count/sort, customer/order projection; rollback/concurrency fixtures cleaned`,
  );
} finally {
  await db.$disconnect();
}
