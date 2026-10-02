// In-process route tests with DB/Auth stubs only. Never sends HTTP or opens a database.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';

function loader(stubs) {
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
      Response,
      URL,
      URLSearchParams,
      Error,
      Date,
      require(name) {
        if (name in stubs) return stubs[name];
        if (name.startsWith('@/server/validation/')) return load('src/' + name.slice(2) + '.ts');
        throw new Error('Unexpected runtime dependency: ' + name);
      },
    });
    return exports;
  }
  return load;
}
const id = '11111111-1111-4111-8111-111111111111';
const actorId = '22222222-2222-4222-8222-222222222222';
const request = (method, query = '', body = {}) => ({
  method,
  nextUrl: new URL('http://offline.invalid/api/orders' + query),
  url: 'http://offline.invalid/api/orders' + query,
  text: async () => JSON.stringify(body),
  json: async () => body,
});
let actor = null,
  calls = [],
  writes = [];
class RecordError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const pagination = { offset: 0, limit: 10, total: 20, hasMore: true };
const row = { id, code: 'A', name: 'รายการ' };
const service = {
  RecordError,
  recordModule: (key) => ({ key }),
  recordList: async () => {
    calls.push('list');
    return { data: [row], pagination };
  },
  recordDetail: async () => {
    calls.push('detail');
    return { data: row };
  },
  recordFilters: async () => {
    calls.push('filters');
    return { data: { status: ['นอกหน้าปัจจุบัน'] } };
  },
  recordConfig: async (_entity, canWrite) => {
    calls.push('config');
    return { data: { canWrite } };
  },
  recordOptions: async () => {
    calls.push('options');
    return { data: [{ id, code: 'A', name: 'รายการ' }], pagination };
  },
  recordWrite: async (_entity, action, _id, body) => {
    writes.push({ action, body });
    return { data: row };
  },
};
const load = loader({
  '@/server/auth/current-user': {
    getCurrentApiUser: async () => {
      calls.push('auth');
      return actor;
    },
  },
  '@/server/auth/api-authorization': { hasSameOrigin: () => true },
  './service': service,
});
const { recordHandler } = load('src/server/records/handlers.ts');
let result = await recordHandler(request('GET'), 'orders');
assert.equal(result.status, 200);
assert.deepEqual(calls, ['list']);
calls = [];
result = await recordHandler(request('GET', '?include=filters,config,options'), 'orders');
let body = await result.json();
assert.equal(body.config.canWrite, false);
assert.deepEqual(body.filters.status, ['นอกหน้าปัจจุบัน']);
assert.equal(body.options.pagination.total, 20);
assert.equal(calls.filter((c) => c === 'list').length, 1);
assert.ok(!calls.includes('options'), 'included options should reuse the same paginated rows');
calls = [];
result = await recordHandler(request('GET', '?view=options'), 'orders');
assert.equal(result.status, 200);
assert.deepEqual(calls, ['options']);
calls = [];
result = await recordHandler(request('GET', '?include=unsupported'), 'orders');
assert.equal(result.status, 400);
assert.deepEqual(calls, []);
result = await recordHandler(request('GET', '?deleted=true'), 'orders');
assert.equal(result.status, 401);
actor = { id: actorId, userRole: { roleId: 'SALES' } };
result = await recordHandler(request('GET', '?deleted=true&include=filters'), 'orders');
assert.equal(result.status, 403);
result = await recordHandler(request('PATCH', '', { action: 'restore' }), 'orders', id);
assert.equal(result.status, 403);
actor = { id: actorId, userRole: { roleId: 'ADMIN' } };
result = await recordHandler(
  request('PATCH', '', { action: 'restore', reason: 'กู้คืน' }),
  'orders',
  id,
);
assert.equal(result.status, 200);
assert.equal(writes.at(-1).action, 'restore');
assert.deepEqual(JSON.parse(JSON.stringify(writes.at(-1).body)), { reason: 'กู้คืน' });
result = await recordHandler(request('DELETE', '', { reason: 'ลบ' }), 'orders', id);
assert.equal(result.status, 200);
assert.equal(writes.at(-1).action, 'delete');
for (const [method, value] of [
  ['PATCH', { action: 'delete' }],
  ['PATCH', { action: 'restore', name: 'แก้' }],
  ['DELETE', { action: 'restore' }],
]) {
  const count = writes.length;
  result = await recordHandler(request(method, '', value), 'orders', id);
  assert.equal(result.status, 400);
  assert.equal(writes.length, count);
}

// Execute the existing user transaction guards via new DELETE/PATCH dispatch.
let countAdmins = 1,
  targetId = id,
  deletedAt = null,
  changes = [];
const target = () => ({
  id: targetId,
  status: 'ACTIVE',
  deletedAt,
  userRole: { roleId: 'ADMIN' },
  authAccounts: [{ providerUserId: 'unused' }],
});
const tx = {
  $queryRaw: async () => [],
  user: {
    findUnique: async ({ where }) =>
      where.id === actorId
        ? { id: actorId, status: 'ACTIVE', deletedAt: null, userRole: { roleId: 'ADMIN' } }
        : target(),
    count: async () => countAdmins,
    findFirst: async () => null,
    update: async ({ data }) => {
      changes.push(data);
      return target();
    },
  },
  auditEvent: { create: async () => {} },
};
const userLoad = loader({
  'node:crypto': { randomUUID: () => 'offline-request' },
  'next/server': { NextResponse: { json: Response.json } },
  '@/server/users/service': { getUserById: async () => target() },
  '@/server/auth/api-authorization': { authorizeUserManagement: async () => ({ user: actor }) },
  '@/lib/supabase/admin': {
    hasSupabaseAdminKey: () => false,
    createSupabaseAdminClient: () => {
      throw Error('Unexpected Auth mutation');
    },
  },
  '@/server/db/prisma': { getPrismaClient: () => ({ $transaction: async (fn) => fn(tx) }) },
});
const users = userLoad('src/app/api/users/[id]/route.ts');
const context = () => ({ params: Promise.resolve({ id: targetId }) });
result = await users.DELETE(request('DELETE', '', { reason: 'ทดสอบ' }), context());
assert.equal(result.status, 409);
assert.equal(changes.length, 0); // Last admin
targetId = actorId;
result = await users.DELETE(request('DELETE', '', { reason: 'ทดสอบ' }), context());
assert.equal(result.status, 409);
assert.equal(changes.length, 0); // Own account
targetId = id;
countAdmins = 2;
result = await users.DELETE(request('DELETE', '', { reason: 'ทดสอบ' }), context());
assert.equal(result.status, 200);
assert.ok(changes.at(-1).deletedAt);
deletedAt = new Date();
result = await users.PATCH(
  request('PATCH', '', { action: 'restore', reason: 'กู้คืน' }),
  context(),
);
assert.equal(result.status, 200);
assert.equal(changes.at(-1).deletedAt, null);
const previous = changes.length;
result = await users.PATCH(request('PATCH', '', { action: 'delete', reason: 'ทดสอบ' }), context());
assert.equal(result.status, 400);
assert.equal(changes.length, previous);
result = await users.PATCH(
  request('PATCH', '', { action: 'restore', reason: 'ทดสอบ', name: 'แก้' }),
  context(),
);
assert.equal(result.status, 400);
assert.equal(changes.length, previous);

// Product reads must not reveal deleted details to a non-admin; mutation methods dispatch separately.
let productDeleted = null;
const productWrites = [];
const productLoad = loader({
  'next/server': { NextResponse: { json: Response.json } },
  '@/server/auth/current-user': { getCurrentApiUser: async () => actor },
  '@/server/auth/api-authorization': {
    authorizeUserManagement: async () =>
      actor?.userRole.roleId === 'ADMIN'
        ? { user: actor }
        : { error: Response.json({ error: 'ไม่มีสิทธิ์' }, { status: actor ? 403 : 401 }) },
  },
  '@/server/products/service': {
    ProductError: class extends Error {},
    getProductById: async () => ({ id, deletedAt: productDeleted }),
    updateProduct: async (_id, value) => {
      productWrites.push(value);
      return { id };
    },
  },
});
const products = productLoad('src/app/api/products/[id]/route.ts');
const productContext = { params: Promise.resolve({ id }) };
actor = null;
result = await products.GET(request('GET'), productContext);
assert.equal(result.status, 401);
actor = { id: actorId, userRole: { roleId: 'SALES' } };
productDeleted = 'deleted';
result = await products.GET(request('GET'), productContext);
assert.equal(result.status, 404);
result = await products.DELETE(request('DELETE', '', { reason: 'ลบ' }), productContext);
assert.equal(result.status, 403);
assert.equal(productWrites.length, 0);
actor = { id: actorId, userRole: { roleId: 'ADMIN' } };
result = await products.GET(request('GET'), productContext);
assert.equal(result.status, 200);
result = await products.DELETE(request('DELETE', '', { reason: 'ลบ' }), productContext);
assert.equal(result.status, 200);
assert.equal(productWrites.at(-1).action, 'delete');
result = await products.PATCH(
  request('PATCH', '', { action: 'restore', reason: 'กู้คืน' }),
  productContext,
);
assert.equal(result.status, 200);
assert.equal(productWrites.at(-1).action, 'restore');
const previousProducts = productWrites.length;
result = await products.PATCH(
  request('PATCH', '', { action: 'restore', reason: 'กู้คืน', name: 'แก้' }),
  productContext,
);
assert.equal(result.status, 400);
assert.equal(productWrites.length, previousProducts);

// All page requests moved; the old resource routes are absent.
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
for (const file of walk('src/app/api').filter((f) => f.endsWith('route.ts')))
  assert.ok(
    !['filters', 'options', 'config', 'restore'].includes(path.basename(path.dirname(file))),
    file,
  );
for (const file of walk('src/app').filter((f) => f.endsWith('page.tsx'))) {
  const source = fs.readFileSync(file, 'utf8');
  assert.ok(
    !/\/restore|\/options\?|\/filters['`]|\+ '\/config'/.test(source),
    file + ': retired request',
  );
}
console.log(
  'PASS: combined metadata, bounded options, view-only reads, authorization, command validation, last-admin/self guards, delete/restore dispatch and retired consumers (offline)',
);
