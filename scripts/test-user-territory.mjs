// Real assignment service in an outer rollback; no Auth accounts or lasting fixtures.
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
const db = new PrismaClient({ adapter: new SerializedPrismaPg({ connectionString: process.env.DATABASE_URL }) });
let facade;
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file, exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require(name) {
    if (name === 'server-only') return {};
    if (name === '@/generated/prisma/client') return { Prisma };
    if (name === '@/server/db/prisma') return { getPrismaClient: () => facade, readWithConnectionRetry: (fn) => fn(facade) };
    if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
    if (name.startsWith('.')) return load(path.join(path.dirname(file), name + '.ts'));
    throw Error(name);
  }, Date, URLSearchParams });
  return exports;
}
const { assignUserTerritory } = load('src/server/users/territory.ts');
const { userCreateInput, userUpdateError } = load('src/server/validation/users.ts');
const { getUserById } = load('src/server/users/service.ts');
const prefix = 'TASK225-' + crypto.randomUUID().slice(0, 8);
const rollback = Error('ROLLBACK_TASK225');
const baseline = await db.salesTerritory.count();
let checks = 0;
try {
  await db.$transaction(async (tx) => {
    facade = tx;
    const users = [];
    for (const [index, roleId] of ['SALES', 'SALES', 'MANAGER', 'MANAGER', 'ADMIN', 'SALES'].entries()) {
      users.push(await tx.user.create({ data: {
        employeeCode: prefix + '-' + index, email: prefix + '-' + index + '@example.invalid', name: 'Fixture ' + index,
        status: index === 5 ? 'SUSPENDED' : 'ACTIVE', userRole: { create: { roleId } },
      } }));
    }
    const a = await tx.salesTerritory.create({ data: { code: prefix + '-A', name: 'A' } });
    const b = await tx.salesTerritory.create({ data: { code: prefix + '-B', name: 'B' } });
    const deleted = await tx.salesTerritory.create({ data: { code: prefix + '-D', deletedAt: new Date() } });
    const input = { name: 'Test', email: 'test@example.invalid', password: 'password123', roleId: 'SALES', territoryId: a.id };
    assert.equal(userCreateInput(input).territoryId, a.id);
    assert.equal(userCreateInput({ ...input, territoryId: 'bad' }), null);
    assert.equal(userCreateInput({ ...input, roleId: 'ADMIN' }), null);
    assert.ok(userUpdateError({ action: 'profile', territoryId: 'bad' })); checks += 4;
    await assignUserTerritory(tx, users[0].id, a.id);
    await assignUserTerritory(tx, users[1].id, a.id);
    assert.equal(await tx.salesTerritorySales.count({ where: { territoryId: a.id } }), 2); checks++;
    const row = await getUserById(users[0].id);
    assert.equal(row.territoryId, a.id); assert.equal(row.territory.code, a.code); checks++;
    await assignUserTerritory(tx, users[0].id, b.id);
    assert.equal(await tx.salesTerritorySales.count({ where: { userId: users[0].id } }), 1);
    assert.equal((await tx.salesTerritory.findUnique({ where: { id: a.id } })).salesId, users[1].id);
    assert.equal((await tx.salesTerritory.findUnique({ where: { id: b.id } })).salesId, users[0].id); checks++;
    await assignUserTerritory(tx, users[0].id, null);
    assert.equal(await tx.salesTerritorySales.count({ where: { userId: users[0].id } }), 0);
    assert.equal((await tx.salesTerritory.findUnique({ where: { id: b.id } })).salesId, null); checks++;
    await assignUserTerritory(tx, users[2].id, a.id);
    await assert.rejects(assignUserTerritory(tx, users[3].id, a.id), (error) => error.status === 409); checks++;
    assert.equal((await getUserById(users[2].id)).territoryId, a.id); checks++;
    await assignUserTerritory(tx, users[2].id, b.id);
    assert.equal((await tx.salesTerritory.findUnique({ where: { id: a.id } })).managerId, null); checks++;
    await assert.rejects(assignUserTerritory(tx, users[0].id, deleted.id), (error) => error.status === 400); checks++;
    await assert.rejects(assignUserTerritory(tx, users[4].id, a.id), (error) => error.status === 400); checks++;
    await assert.rejects(assignUserTerritory(tx, users[5].id, a.id), (error) => error.status === 400); checks++;
    await assignUserTerritory(tx, users[2].id, null);
    assert.equal((await getUserById(users[2].id)).territoryId, null); checks++;
    throw rollback;
  }, { timeout: 60000 });
} catch (error) { if (error !== rollback) throw error; }
finally { await db.$disconnect(); }
const verify = new PrismaClient({ adapter: new SerializedPrismaPg({ connectionString: process.env.DATABASE_URL }) });
try {
  assert.equal(await verify.salesTerritory.count(), baseline);
  assert.equal(await verify.user.count({ where: { employeeCode: { startsWith: prefix } } }), 0);
} finally { await verify.$disconnect(); }
console.log(`PASS ${checks} user territory checks, real transaction rollback, no Auth writes or lasting fixtures`);
