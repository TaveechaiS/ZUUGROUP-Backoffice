// Executes real handlers/services. Only DB and identity are replaced; no network or env access.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import ts from 'typescript';
import { sqltag, raw, join, empty } from '@prisma/client/runtime/client';

const modules = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
const actorId = '22222222-2222-4222-8222-222222222222';
let actor = { id: actorId, userRole: { roleId: 'ADMIN' } };
let sameOrigin = true;
let failAudit = false;
let tick = 0;
const now = () => new Date(Date.UTC(2026, 9, 3, 0, 0, ++tick));
let rows = Array.from({ length: 12 }, (_, i) => ({
  id: `11111111-1111-4111-8111-${String(i + 1).padStart(12, '0')}`,
  code: `GROUP-${i + 1}`,
  name: `กลุ่มร้านยา ${i + 1}`,
  status: 'ACTIVE',
  category: 'ร้านยา',
  description: '',
  owner: '',
  notes: '',
  createdAt: now(),
  updatedAt: now(),
  deletedAt: null,
}));
let audits = [];
const field = (name) => name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
const copy = (value) => structuredClone(value);

// Fail closed: accept only the SQL shapes exercised here. PostgreSQL itself is not emulated.
function query(sql) {
  const text = sql.text;
  const values = sql.values;
  assert.match(text, /(?:FROM|INTO|UPDATE) "customer_groups"/);
  if (text.startsWith('INSERT INTO')) {
    const keys = [
      ...text.match(/INSERT INTO "customer_groups" \((.*?)\) VALUES/s)[1].matchAll(/"(\w+)"/g),
    ].map((m) => field(m[1]));
    const data = Object.fromEntries(keys.map((key, i) => [key, values[i]]));
    if (rows.some((row) => row.code === data.code))
      throw Object.assign(new Error('duplicate'), { code: 'P2002' });
    const row = { ...data, id: randomUUID(), createdAt: now(), updatedAt: now(), deletedAt: null };
    rows.push(row);
    return [copy(row)];
  }
  if (text.startsWith('UPDATE')) {
    const idIndex = Number(text.match(/WHERE id=\$(\d+)::uuid/)[1]) - 1;
    const row = rows.find((row) => row.id === values[idIndex]);
    assert.ok(row);
    const setters = text.split(' SET ')[1].split(' WHERE ')[0];
    for (const match of setters.matchAll(/"(\w+)"=\$(\d+)/g))
      row[field(match[1])] = values[Number(match[2]) - 1];
    if (setters.includes('deleted_at=now()')) {
      row.deletedAt = now();
      row.deletedById = values[Number(setters.match(/deleted_by_id=\$(\d+)/)[1]) - 1];
      row.deleteReason = values[Number(setters.match(/delete_reason=\$(\d+)/)[1]) - 1];
    } else if (setters.includes('deleted_at=NULL')) {
      row.deletedAt = row.deletedById = row.deleteReason = null;
    }
    row.updatedAt = now();
    return [copy(row)];
  }
  assert.ok(text.startsWith('SELECT'), `Unsupported SQL: ${text}`);
  // Discard the projection's memberCount subquery before interpreting outer WHERE.
  const tail = text.slice(text.lastIndexOf('FROM "customer_groups"'));
  let selected = rows.slice();
  if (tail.includes('deleted_at IS NOT NULL')) selected = selected.filter((row) => row.deletedAt);
  else if (tail.includes('deleted_at IS NULL')) selected = selected.filter((row) => !row.deletedAt);
  const idMatch = tail.match(/id=\$(\d+)::uuid/);
  const codeMatch = tail.match(/code=\$(\d+)/);
  if (idMatch || codeMatch)
    selected = selected.filter(
      (row) =>
        (idMatch && row.id === values[Number(idMatch[1]) - 1]) ||
        (codeMatch && row.code === values[Number(codeMatch[1]) - 1]),
    );
  const likes = [...tail.matchAll(/"(\w+)" ILIKE \$(\d+)/g)];
  if (likes.length)
    selected = selected.filter((row) =>
      likes.some((match) => {
        const pattern = values[Number(match[2]) - 1];
        assert.ok(pattern.startsWith('%') && pattern.endsWith('%'));
        const literal = pattern.slice(1, -1).replace(/\\([\\%_])/g, '$1');
        return String(row[field(match[1])] ?? '')
          .toLowerCase()
          .includes(literal.toLowerCase());
      }),
    );
  for (const match of tail.matchAll(/"(\w+)"=\$(\d+)/g))
    selected = selected.filter((row) => row[field(match[1])] === values[Number(match[2]) - 1]);
  if (text.startsWith('SELECT count(*)')) return [{ total: selected.length }];
  if (tail.includes('ORDER BY created_at DESC,id ASC'))
    selected.sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
  const paging = tail.match(/OFFSET \$(\d+) LIMIT \$(\d+)/);
  if (paging)
    selected = selected.slice(
      values[Number(paging[1]) - 1],
      values[Number(paging[1]) - 1] + values[Number(paging[2]) - 1],
    );
  else
    assert.ok(
      tail.includes('LIMIT 1') || tail.includes('FOR UPDATE'),
      `Unsupported SELECT: ${tail}`,
    );
  return copy(selected.map((row) => ({ ...row, memberCount: 0 })));
}
const db = {
  $queryRaw: async (sql) => query(sql),
  recordImportMap: { findUnique: async () => null },
  auditEvent: {
    create: async ({ data }) => {
      if (failAudit) throw new Error('simulated audit unavailable');
      audits.push(copy(data));
    },
  },
  $transaction: async (work, options) => {
    if (Array.isArray(work)) {
      assert.equal(options.isolationLevel, 'RepeatableRead');
      return Promise.all(work);
    }
    const before = copy({ rows, audits });
    try {
      return await work(db);
    } catch (error) {
      ({ rows, audits } = before);
      throw error;
    }
  },
};
const stubs = {
  'server-only': {},
  '@/generated/prisma/client': { Prisma: { sql: sqltag, raw, join, empty } },
  '@/server/db/prisma': {
    getPrismaClient: () => db,
    readWithConnectionRetry: (callback) => callback(db),
  },
  '@/features/records/types': {
    RECORD_MODULES: modules,
    moduleFor: (key) => modules.find((m) => m.key === key),
  },
  '@/server/auth/current-user': { getCurrentApiUser: async () => actor },
  '@/server/auth/api-authorization': { hasSameOrigin: () => sameOrigin },
};
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
    Date,
    Error,
    crypto: { randomUUID },
    require(name) {
      if (name in stubs) return stubs[name];
      if (name === 'node:crypto') return { randomUUID };
      const target = name.startsWith('@/')
        ? path.resolve('src', name.slice(2) + '.ts')
        : path.resolve(path.dirname(file), name + '.ts');
      const relative = path.relative(path.resolve('src/server'), target);
      if (
        (name.startsWith('@/server/') || name.startsWith('.')) &&
        !relative.startsWith('..') &&
        !path.isAbsolute(relative)
      )
        return load(target);
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}
const { recordHandler } = load('src/server/records/handlers.ts');
let passed = 0;
async function call(method, status, body = {}, id, query = '') {
  const url = new URL(`http://offline.invalid/api/customer-groups${query}`);
  const response = await recordHandler(
    { method, nextUrl: url, text: async () => JSON.stringify(body) },
    'customer-groups',
    id,
  );
  const data = await response.json();
  assert.equal(response.status, status, `${method}: ${JSON.stringify(data)}`);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  return data;
}
async function test(name, action) {
  await action();
  passed++;
  console.log(`PASS: ${name}`);
}
async function rejected(method, status, body, id, query) {
  const before = copy({ rows, audits });
  await call(method, status, body, id, query);
  assert.deepEqual({ rows, audits }, before, 'Rejected request changed records/audit');
}
let created;
await test('pagination: total, stable order, no overlap, last/empty page', async () => {
  const first = await call('GET', 200);
  const second = await call('GET', 200, {}, undefined, '?offset=10&limit=10');
  assert.equal(first.data.length, 10);
  assert.equal(first.pagination.total, 12);
  assert.equal(first.pagination.hasMore, true);
  assert.equal(second.data.length, 2);
  assert.equal(second.pagination.hasMore, false);
  assert.equal(new Set([...first.data, ...second.data].map((row) => row.id)).size, 12);
  assert.equal(first.data[0].code, 'GROUP-12');
  assert.equal((await call('GET', 200, {}, undefined, '?offset=20')).data.length, 0);
});
await test('Thai search and empty results', async () => {
  const found = await call(
    'GET',
    200,
    {},
    undefined,
    '?search=' + encodeURIComponent('กลุ่มร้านยา 12'),
  );
  assert.equal(found.pagination.total, 1);
  assert.equal(found.data[0].code, 'GROUP-12');
  assert.equal((await call('GET', 200, {}, undefined, '?search=unmatched')).pagination.total, 0);
});
await test('create persists native fields and audit', async () => {
  created = (
    await call('POST', 201, { code: 'FLOW-NEW', name: 'ร้านยา %_ ทดสอบ', status: 'ACTIVE' })
  ).data;
  assert.equal(rows.length, 13);
  assert.equal(audits.at(-1).action, 'customer-groups.create');
  assert.equal(audits.at(-1).actorUserId, actorId);
  assert.equal(audits.at(-1).after.id, created.id);
});
await test('literal wildcard search and status filter', async () => {
  const found = await call('GET', 200, {}, undefined, '?search=%25_&status=ACTIVE');
  assert.deepEqual(
    found.data.map((row) => row.id),
    [created.id],
  );
});
await test('detail by id/code and missing detail', async () => {
  assert.equal((await call('GET', 200, {}, created.id)).data.name, created.name);
  assert.equal((await call('GET', 200, {}, created.code)).data.id, created.id);
  await rejected('GET', 404, {}, 'missing');
});
await test('update preserves omitted fields and records before/after', async () => {
  created = (
    await call(
      'PATCH',
      200,
      { name: 'กลุ่มแก้ไข', expectedUpdatedAt: created.updatedAt },
      created.id,
    )
  ).data;
  assert.equal(created.code, 'FLOW-NEW');
  assert.equal(created.status, 'ACTIVE');
  assert.equal(audits.at(-1).before.name, 'ร้านยา %_ ทดสอบ');
  assert.equal(audits.at(-1).after.name, 'กลุ่มแก้ไข');
});
await test('stale update rejected without state/audit change', () =>
  rejected(
    'PATCH',
    409,
    { name: 'ทับข้อมูล', expectedUpdatedAt: '2020-01-01T00:00:00.000Z' },
    created.id,
  ));
await test('invalid/duplicate creates and invalid pagination rejected', async () => {
  await rejected('POST', 400, { code: 'BAD', name: '', status: 'ACTIVE' });
  await rejected('POST', 409, { code: 'FLOW-NEW', name: 'ซ้ำ', status: 'ACTIVE' });
  await rejected('PATCH', 400, { unexpected: 'value' }, created.id);
  await rejected('GET', 400, {}, undefined, '?limit=0');
});
await test('anonymous/non-admin/cross-origin writes rejected', async () => {
  actor = null;
  await rejected('DELETE', 401, {}, created.id);
  actor = { id: actorId, userRole: { roleId: 'SALES' } };
  await rejected('PATCH', 403, { name: 'ไม่มีสิทธิ์' }, created.id);
  actor = { id: actorId, userRole: { roleId: 'ADMIN' } };
  sameOrigin = false;
  await rejected('DELETE', 403, {}, created.id);
  sameOrigin = true;
});
await test('delete disappears from list/detail and records reason', async () => {
  await call('DELETE', 200, { reason: 'ทดสอบลบ' }, created.id);
  assert.equal((await call('GET', 200)).pagination.total, 12);
  await rejected('GET', 404, {}, created.id);
  assert.equal(rows.find((row) => row.id === created.id).deleteReason, 'ทดสอบลบ');
  assert.equal(audits.at(-1).action, 'customer-groups.delete');
});
await test('deleted list and restore obey admin permission', async () => {
  actor = { id: actorId, userRole: { roleId: 'SALES' } };
  await rejected('GET', 403, {}, undefined, '?deleted=true');
  await rejected('PATCH', 403, { action: 'restore' }, created.id);
  actor = { id: actorId, userRole: { roleId: 'ADMIN' } };
  assert.deepEqual(
    (await call('GET', 200, {}, undefined, '?deleted=true')).data.map((row) => row.id),
    [created.id],
  );
});
await test('repeated delete and edits to deleted records rejected', async () => {
  await rejected('DELETE', 409, {}, created.id);
  await rejected('PATCH', 409, { name: 'แก้หลังลบ' }, created.id);
  await rejected('PATCH', 400, { action: 'restore', name: 'ปะปน' }, created.id);
});
await test('restore retains fields, clears deletion, records audit', async () => {
  const restored = (
    await call('PATCH', 200, { action: 'restore', reason: 'ทดสอบกู้คืน' }, created.id)
  ).data;
  assert.equal(restored.name, 'กลุ่มแก้ไข');
  assert.equal(restored.deletedAt, null);
  assert.equal(rows.find((row) => row.id === created.id).deleteReason, null);
  assert.equal((await call('GET', 200)).pagination.total, 13);
  assert.equal(audits.at(-1).action, 'customer-groups.restore');
  await rejected('PATCH', 409, { action: 'restore' }, created.id);
});
await test('audit failure rolls back record mutation and hides internal error', async () => {
  failAudit = true;
  const before = copy({ rows, audits });
  const response = await call('PATCH', 503, { name: 'ต้อง rollback' }, created.id);
  assert.deepEqual({ rows, audits }, before);
  assert.ok(!response.error.message.includes('simulated audit'));
  failAudit = false;
});
console.log(
  `PASS: ${passed}/${passed} record flow scenarios (in-memory DB/Auth; no live HTTP or database)`,
);
