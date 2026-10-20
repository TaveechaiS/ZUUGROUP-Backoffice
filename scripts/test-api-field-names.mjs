// Offline contract checks: no network, credentials or DB connection.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import path from 'node:path';
import { Prisma as RealPrisma } from '../src/generated/prisma/client.ts';
function load(file, modules = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return { randomUUID: () => 'unused' };
      if (name === '@/generated/prisma/client' && !(name in modules)) return { Prisma: RealPrisma };
      if (name.startsWith('@/server/validation/'))
        return load('src/' + name.slice(2) + '.ts', modules);
      if (name.startsWith('.') && /validation|territory-sales/.test(file + name))
        return load(path.resolve(path.dirname(file), name + '.ts'), modules);
      if (!(name in modules)) throw new Error('Unexpected import: ' + name);
      return modules[name];
    },
    URLSearchParams,
    Intl,
    Date,
    console,
  });
  return exports;
}

const plain = (value) => JSON.parse(JSON.stringify(value));
const pagination = load('src/server/pagination.ts');
const instant = new Date('2026-10-02T03:00:00.000Z');
const fixture = {
  id: '11111111-1111-4111-8111-111111111111',
  code: 'MED-TAB-0001',
  name: 'รายการทดสอบ',
  categoryId: 'category-id',
  dosageFormId: 'form-id',
  drugId: 'drug-id',
  defaultWarehouseId: 'warehouse-id',
  category: { id: 'category-id', code: 'MED', name: 'หมวด' },
  dosageForm: { id: 'form-id', code: 'TAB', name: 'เม็ด' },
  drug: { id: 'drug-id', name: 'ตัวยา' },
  defaultWarehouse: { id: 'warehouse-id', code: 'WH', name: 'คลัง' },
  unit: 'กล่อง',
  sequence: 1,
  salePrice: { toFixed: () => '10.00' },
  status: 'ACTIVE',
  createdAt: instant,
  updatedAt: instant,
  deletedAt: null,
  deleteReason: null,
};
let userFixture = {
  id: fixture.id,
  employeeCode: 'admin',
  name: 'Admin',
  email: 'admin@example.test',
  team: null,
  status: 'ACTIVE',
  lastLoginAt: instant,
  userRole: { roleId: 'ADMIN', role: { name: 'Admin' } },
  deletedAt: instant,
  deletedByUser: { name: 'ผู้ลบ', employeeCode: 'EMP-001' },
  deleteReason: 'เหตุผล',
  territorySalesMemberships: [],
  managedTerritories: [],
};
let auditFixture = {
  id: fixture.id,
  occurredAt: instant,
  action: 'users.updated',
  actorRole: 'ADMIN',
  requestId: 'request-id',
  actor: { name: 'ผู้ทำ', employeeCode: 'EMP-001' },
  target: null,
};
const db = {
  user: { count: async () => 1, findMany: async () => [userFixture] },
  auditEvent: { count: async () => 1, findMany: async () => [auditFixture] },
  product: {
    count: async () => 1,
    findMany: async (query) => {
      // Public projection respects the actual select allowlist.
      if (query.select && query.select.drug)
        return [
          {
            id: fixture.id,
            code: fixture.code,
            name: fixture.name,
            categoryId: fixture.categoryId,
            dosageFormId: fixture.dosageFormId,
            drugId: fixture.drugId,
            unit: fixture.unit,
            category: { name: fixture.category.name },
            dosageForm: { name: fixture.dosageForm.name },
            drug: { name: fixture.drug.name },
          },
        ];
      return [fixture];
    },
  },
  $transaction: async (queries) => Promise.all(queries),
};
const modules = {
  '@/server/pagination': pagination,
  '@/server/db/prisma': { getPrismaClient: () => db, readWithConnectionRetry: (fn) => fn(db) },
};
const products = load('src/server/products/service.ts', modules);
const result = plain(products.productView(fixture));
assert.equal(result.name, fixture.name);
assert.equal(result.defaultWarehouse.name, 'คลัง');
assert.equal(result.category.code, 'MED');
for (const key of ['warehouse', 'categoryCode', 'dosageFormCode']) assert.ok(!(key in result));
const publicService = load('src/server/products/public-service.ts', modules);
const publicResult = plain(await publicService.publicProducts(new URLSearchParams()));
assert.deepEqual(publicResult.data[0].category, { name: 'หมวด' });
for (const key of ['salePrice', 'defaultWarehouse', 'defaultWarehouseId', 'deleteReason'])
  assert.ok(!(key in publicResult.data[0]));
const users = load('src/server/users/service.ts', modules);
let user = plain(await users.paginatedUsers(new URLSearchParams())).users[0];
assert.equal(user.userRole.role.name, 'Admin');
assert.equal(user.lastLoginAt, instant.toISOString());
assert.deepEqual(user.deletedByUser, userFixture.deletedByUser);
assert.equal(user.deletedAt, instant.toISOString());
for (const key of ['role', 'roleId', 'lastActive', 'deletedBy']) assert.ok(!(key in user));
userFixture = {
  ...userFixture,
  lastLoginAt: null,
  userRole: null,
  deletedByUser: null,
  deletedAt: null,
};
user = plain(await users.paginatedUsers(new URLSearchParams())).users[0];
for (const key of ['lastLoginAt', 'userRole', 'deletedByUser', 'deletedAt'])
  assert.equal(user[key], null);
const audit = load('src/server/audit-logs/service.ts', modules);
const event = plain(await audit.paginatedAuditEvents(new URLSearchParams())).rows[0];
assert.equal(event.actor.name, 'ผู้ทำ');
assert.equal(event.actor.employeeCode, 'EMP-001');
assert.equal(event.target, null);
assert.equal(event.occurredAt, instant.toISOString());
for (const key of ['actorName', 'actorCode', 'targetName', 'targetCode', 'before', 'after'])
  assert.ok(!(key in event));
const definitions = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
const sql = (strings, ...values) => ({
  sql: strings.reduce(
    (all, part, i) => all + part + (i < values.length ? (values[i]?.sql ?? '?') : ''),
    '',
  ),
  values,
});
const Prisma = {
  sql,
  raw: (sql) => ({ sql }),
  join: (parts, separator = ',') => ({ sql: parts.map((part) => part.sql).join(separator) }),
  empty: { sql: '' },
};
const queries = [];
const row = {
  ...fixture,
  category: 'หมวดลูกค้า',
  province: 'กรุงเทพ',
  owner: 'ผู้ดูแล',
  paymentTerms: null,
  memberCount: 3,
  amount: '1234.50',
};
const recordsDb = {
  $queryRaw: async (query) => {
    queries.push(query);
    return query.sql.includes('count(*)::int total')
      ? [{ total: 1 }]
      : query.sql.startsWith('SELECT DISTINCT name FROM sales_territories')
        ? [{ name: 'เหนือ' }]
        : query.sql.startsWith('SELECT DISTINCT')
          ? [{ value: 'ค่า' }]
          : [row];
  },
  $transaction: async (queries) => Promise.all(queries),
};
const records = load('src/server/records/service.ts', {
  ...modules,
  '@/generated/prisma/client': { Prisma },
  '@/features/records/types': {
    moduleFor: (key) => definitions.find((m) => m.key === key),
    RECORD_MODULES: definitions,
  },
  '@/server/db/prisma': {
    getPrismaClient: () => recordsDb,
    readWithConnectionRetry: (fn) => fn(recordsDb),
  },
});
const customer = definitions.find((m) => m.key === 'customers');
const record = plain(
  await records.recordList(customer, new URLSearchParams('category=หมวดลูกค้า&province=กรุงเทพ')),
).data[0];
assert.equal(record.code, row.code);
assert.equal(record.name, row.name);
assert.equal(record.province, 'กรุงเทพ');
assert.equal(record.paymentTerms, null);
assert.equal(record.updatedAt, instant.toISOString());
for (const key of ['ref', 'title', 'subtitle', 'fields', 'value']) assert.ok(!(key in record));
assert.ok(queries[0].sql.includes('"category"=?'));
assert.ok(queries[0].sql.includes('"province"=?'));
const options = plain(await records.recordOptions(customer, new URLSearchParams())).data[0];
assert.deepEqual(options, { id: row.id, code: row.code, name: row.name });
const filters = plain(await records.recordFilters(customer)).data;
assert.deepEqual(Object.keys(filters).sort(), [
  'category',
  'owner',
  'province',
  'status',
  'territoryName',
]);
assert.deepEqual(filters.territoryName, ['เหนือ']);
const settings = definitions.find((m) => m.key === 'settings');
const setting = plain(await records.recordList(settings, new URLSearchParams())).data[0];
assert.ok('value' in setting); // settings.value is a native field, not a display alias.
const group = definitions.find((m) => m.key === 'customer-groups');
assert.equal(plain(await records.recordList(group, new URLSearchParams())).data[0].memberCount, 3);
let inventoryQuery;
const reportsDb = {
  ...db,
  product: {
    ...db.product,
    findMany: async (query) => {
      inventoryQuery = query;
      return [fixture];
    },
  },
};
const reports = load('src/server/records/reports.ts', {
  ...modules,
  './service': records,
  '@/generated/prisma/client': { Prisma },
  '@/server/db/prisma': { readWithConnectionRetry: (fn) => fn(reportsDb) },
});
const inventory = plain(
  await reports.reportData(
    'inventory',
    new URLSearchParams('category.name=หมวด&dosageForm.name=เม็ด'),
  ),
).data[0];
assert.equal(inventory.code, fixture.code);
assert.equal(inventory.name, fixture.name);
assert.equal(inventory.category.name, 'หมวด');
assert.equal(inventory.dosageForm.name, 'เม็ด');
assert.equal(inventory.unit, 'กล่อง');
assert.equal(inventory.status, 'ACTIVE');
assert.equal(inventory.createdAt, instant.toISOString());
assert.equal(inventoryQuery.where.category.name, 'หมวด');
assert.equal(inventoryQuery.where.dosageForm.name, 'เม็ด');
assert.equal(inventoryQuery.select.createdAt, true);
for (const key of ['ref', 'title', 'subtitle', 'fields', 'value']) assert.ok(!(key in inventory));
console.log(
  'PASS: native field names, nested relations, ISO/null dates, public allowlist and native filter/query keys (offline)',
);
