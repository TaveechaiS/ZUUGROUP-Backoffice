// Offline contract checks: no network, credentials or DB connection.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import path from 'node:path';
function load(file, modules = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      if (name === 'server-only') return {};
      if (name === '@/generated/prisma/client') return { Prisma: {} };
      if (name === 'node:crypto') return { randomUUID: () => 'unused' };
      if (name.startsWith('@/server/validation/'))
        return load('src/' + name.slice(2) + '.ts', modules);
      if (name.startsWith('.') && file.includes('validation'))
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
const pagination = load('src/server/pagination.ts');
const plain = (value) => JSON.parse(JSON.stringify(value));
assert.deepEqual(plain(pagination.paginationQuery(new URLSearchParams())), {
  offset: 0,
  limit: 10,
});
for (const input of [
  'limit=0',
  'limit=101',
  'offset=-1',
  'offset=100001',
  'limit=1.5',
  'offset=NaN',
  'limit=',
  'offset=9007199254740992',
])
  assert.throws(
    () => pagination.paginationQuery(new URLSearchParams(input)),
    (error) => error.status === 400,
  );
assert.deepEqual(plain(pagination.paginationResult(15, 10, 10)), {
  total: 15,
  offset: 10,
  limit: 10,
  page: 2,
  pageSize: 10,
  totalPages: 2,
});
assert.equal(pagination.paginationResult(0, 0, 10).totalPages, 1);
for (const size of [1, 10, 20, 50, 100])
  assert.equal(pagination.paginationQuery(new URLSearchParams(`limit=${size}`)).limit, size);
let calls = [];
const delegate = {
  count: (query) => {
    calls.push(['count', query]);
    return Promise.resolve(15);
  },
  findMany: (query) => {
    calls.push(['findMany', query]);
    return Promise.resolve([]);
  },
};
const db = {
  user: delegate,
  product: delegate,
  auditEvent: delegate,
  $transaction: async (queries, options) => {
    assert.equal(options.isolationLevel, 'RepeatableRead');
    return Promise.all(queries);
  },
};
const modules = {
  '@/server/pagination': pagination,
  '@/server/db/prisma': {
    getPrismaClient: () => db,
    readWithConnectionRetry: (callback) => callback(db),
  },
};
const users = load('src/server/users/service.ts', modules);
await users.paginatedUsers(
  new URLSearchParams('offset=10&limit=10&role=SALES&status=SUSPENDED&deleted=true&search=abc'),
);
assert.equal(calls[1][1].skip, 10);
assert.equal(calls[1][1].take, 10);
assert.deepEqual(plain(calls[0][1].where), plain(calls[1][1].where));
assert.equal(calls[1][1].where.userRole.is.roleId, 'SALES');
assert.equal(calls[1][1].where.status, 'SUSPENDED');
assert.deepEqual(plain(calls[1][1].where.deletedAt), { not: null });
assert.equal(calls[1][1].where.OR.length, 3);
calls = [];
await users.paginatedUsers(new URLSearchParams('offset=100&limit=100'));
assert.equal(calls[1][1].skip, 100);
assert.equal(calls[1][1].take, 100);
await assert.rejects(
  users.paginatedUsers(new URLSearchParams('role=Inventory')),
  (error) => error.status === 400,
);
calls = [];
await users.exportUsers(new URLSearchParams('search=abc'));
assert.equal(calls[0][0], 'findMany');
assert.equal(calls[0][1].take, undefined);
const products = load('src/server/products/service.ts', modules);
await assert.rejects(
  products.paginatedProducts(new URLSearchParams('deleted=true'), false),
  (error) => error.status === 403,
);
await assert.rejects(
  products.paginatedProducts(new URLSearchParams('categoryId=invalid'), true),
  (error) => error.status === 400,
);
calls = [];
await products.paginatedProducts(new URLSearchParams('offset=10&status=INACTIVE&search=abc'), true);
assert.equal(calls[1][1].skip, 10);
assert.equal(calls[1][1].take, 10);
assert.deepEqual(plain(calls[0][1].where), plain(calls[1][1].where));
assert.equal(calls[1][1].where.OR[2].drug.is.name.contains, 'abc');
const audit = load('src/server/audit-logs/service.ts', modules);
calls = [];
await audit.paginatedAuditEvents(new URLSearchParams('action=customers.updated&offset=10'));
assert.equal(calls[1][1].where.action, 'customers.updated');
assert.equal(calls[1][1].take, 10);
assert.equal(calls[1][1].skip, 10);
assert.equal(calls[1][1].select.before, undefined);
assert.equal(calls[1][1].select.after, undefined);
console.log(
  'PASS: pagination bounds, totals, filters, transactions, deleted permissions, full CSV query and audit contract (offline)',
);
