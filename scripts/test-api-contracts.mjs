// Offline validators and filesystem contract checks. No HTTP, credentials or DB connection.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';

const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    URL,
    URLSearchParams,
    require(name) {
      const target = name.startsWith('@/server/validation/')
        ? path.resolve('src', name.slice(2) + '.ts')
        : name.startsWith('.')
          ? path.resolve(path.dirname(file), name + '.ts')
          : null;
      assert.ok(
        target?.startsWith(path.resolve('src/server/validation') + path.sep),
        'Validator imported runtime dependency: ' + name,
      );
      return load(target);
    },
  });
  return exports;
}
const plain = (value) => JSON.parse(JSON.stringify(value));
const error = (fn, message) => assert.throws(fn, (caught) => caught.message === message);
const records = load('src/server/validation/records.ts');
const products = load('src/server/validation/products.ts');
const users = load('src/server/validation/users.ts');
const auth = load('src/server/validation/auth.ts');
const publicApi = load('src/server/validation/public.ts');
const audit = load('src/server/validation/audit.ts');
const report = load('src/server/validation/reports.ts');
const warehouse = load('src/server/validation/warehouses.ts');
const resource = load('src/server/validation/resource-api.ts');
assert.deepEqual(
  plain(
    resource.resourceQuery(new URLSearchParams('include=filters,options'), ['filters', 'options']),
  ),
  { view: null, include: ['filters', 'options'] },
);
for (const query of [
  'include=',
  'include=bad',
  'include=filters,filters',
  'view=',
  'view=bad',
  'view=filters&include=filters',
  'view=filters&view=filters',
  'include=filters&include=filters',
])
  assert.throws(
    () => resource.resourceQuery(new URLSearchParams(query), ['filters']),
    (e) => e.status === 400,
  );
assert.deepEqual(plain(resource.mutationBody({ reason: 'x' }, 'DELETE', ['reason'])), {
  reason: 'x',
});
for (const [body, method] of [
  [null, 'PATCH'],
  [[], 'PATCH'],
  [{ action: 'delete' }, 'PATCH'],
  [{ action: 'restore' }, 'POST'],
  [{ action: 'restore', name: 'edit' }, 'PATCH'],
  [{ action: 'restore' }, 'DELETE'],
  [{ reason: 'x', status: 'ACTIVE' }, 'DELETE'],
])
  assert.throws(
    () => resource.mutationBody(body, method, ['reason']),
    (e) => e.status === 400,
  );
const id = '11111111-1111-4111-8111-111111111111';
const moduleDefinition = {
  fields: [
    { key: 'code', label: 'รหัส', type: 'text', required: true },
    { key: 'amount', label: 'ยอด', type: 'number', required: false },
    {
      key: 'customerId',
      label: 'ลูกค้า',
      type: 'relation',
      relation: 'customers',
      required: false,
    },
    { key: 'fileUrl', label: 'ลิงก์ไฟล์', type: 'text', required: false },
  ],
};
assert.deepEqual(
  plain(records.cleanBody(moduleDefinition, { code: ' A ', amount: '', customerId: '' }, false)),
  {
    values: { code: 'A', amount: null, customerId: null, fileUrl: '' },
  },
);
for (const input of [null, [], 2, 'invalid'])
  error(() => records.cleanBody(moduleDefinition, input, false), 'กรุณาส่ง JSON object');
error(
  () => records.cleanBody(moduleDefinition, { code: 'A', unknown: 1 }, false),
  'มีฟิลด์ที่ไม่รองรับ',
);
error(() => records.cleanBody(moduleDefinition, { code: '' }, false), 'กรุณากรอกรหัส');
error(
  () => records.cleanBody(moduleDefinition, { code: 'A', amount: '-1' }, false),
  'ยอด ต้องเป็นจำนวนไม่ติดลบและทศนิยมไม่เกิน 2 หลัก',
);
error(
  () => records.cleanBody(moduleDefinition, { code: 'A', amount: '1e3' }, false),
  'ยอด ต้องเป็นจำนวนไม่ติดลบและทศนิยมไม่เกิน 2 หลัก',
);
error(
  () => records.cleanBody(moduleDefinition, { customerId: 'bad' }, true),
  'ลูกค้า ต้องเป็น ID ที่ถูกต้อง',
);
error(
  () => records.cleanBody(moduleDefinition, { fileUrl: 'javascript:alert(1)' }, true),
  'ลิงก์ไฟล์ต้องเป็น http หรือ https',
);
error(() => records.cleanBody(moduleDefinition, {}, true), 'ไม่มีข้อมูลที่แก้ไข');
error(
  () => records.cleanBody(moduleDefinition, { code: 'A', expectedUpdatedAt: '' }, true),
  'expectedUpdatedAt ไม่ถูกต้อง',
);
assert.equal(
  records.cleanBody(
    moduleDefinition,
    { code: 'A', expectedUpdatedAt: '2026-10-02T00:00:00Z' },
    true,
  ).expected,
  '2026-10-02T00:00:00Z',
);
assert.equal(records.recordReason({ reason: 10 }), '10');
const product = {
  name: ' ยา ',
  categoryId: id,
  dosageFormId: id,
  drugId: id,
  defaultWarehouseId: id,
  unit: ' กล่อง ',
  salePrice: '120.50',
  status: 'ACTIVE',
};
assert.equal(products.productInput(product, true).sequence, null);
assert.equal(products.productInput({ ...product, sequence: '0001' }, true).sequence, 1);
assert.equal(products.productInput({ ...product, sequence: 'bad' }, false).sequence, null);
error(() => products.productInput({ ...product, status: 'draft' }), 'สถานะสินค้าไม่ถูกต้อง');
error(
  () => products.productInput({ ...product, sequence: '0000' }, true),
  'เลขลำดับต้องเป็นเลข 4 หลัก ระหว่าง 0001 ถึง 9999',
);
error(
  () => products.productInput({ ...product, salePrice: '1e3' }),
  'ราคาขายต้องเป็นตัวเลขตั้งแต่ 0 บาท และมีทศนิยมไม่เกิน 2 ตำแหน่ง',
);
error(() => products.productInput({ ...product, categoryId: 'bad' }), 'กรุณาเลือกหมวดหมู่');
assert.equal(products.productMasterInput('category', { name: 'ยา', code: 'med' }).code, 'MED');
error(
  () => products.productMasterInput('category', { name: 'ยา', code: 'LONG' }),
  'รหัสต้องเป็นตัวอักษรหรือตัวเลข 2–3 หลัก',
);
assert.equal(users.passwordIsValid('😀'.repeat(7)), false);
assert.equal(users.passwordIsValid('😀'.repeat(8)), true);
assert.equal(users.isRoleId('Inventory'), false);
assert.equal(
  users.userCreateInput({
    name: ' คน ',
    email: 'USER@EXAMPLE.COM',
    password: 'abcdefgh',
    roleId: 'SALES',
  }).email,
  'user@example.com',
);
assert.equal(
  users.userCreateInput({ name: 'คน', email: 'bad', password: 'abcdefgh', roleId: 'SALES' }),
  null,
);
assert.equal(users.userUpdateError({ action: 'role', roleId: 'Inventory' }), 'บทบาทไม่ถูกต้อง');
assert.equal(
  users.userUpdateError({ action: 'password', password: '1234567' }),
  'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
);
assert.equal(
  users.userUpdateError({ action: 'delete', reason: '' }),
  'กรุณาระบุเหตุผลไม่เกิน 500 ตัวอักษร',
);
assert.ok(
  users.userUpdateError({
    action: 'profile',
    employeeCode: 'create',
    name: 'คน',
    email: 'u@example.com',
    team: '',
  }),
);
assert.equal(users.userUpdateError({ action: 'status', status: 'ACTIVE' }), null);
for (const input of [null, [], { email: 'x', password: 1 }])
  assert.equal(auth.isLoginBody(input), false);
assert.equal(auth.isLoginBody({ email: '', password: '' }), true); // signIn handles required values, as before.
assert.equal(publicApi.publicQuery(new URLSearchParams('limit=&offset=')).limit, 10);
error(() => publicApi.publicId('bad'), 'ID ต้องเป็น UUID');
error(() => audit.auditQuery(new URLSearchParams('action=bad%20action')), 'action ไม่ถูกต้อง');
assert.equal(
  audit.auditQuery(new URLSearchParams('action=customers.update')).action,
  'customers.update',
);
assert.equal(report.inventoryQuery(new URLSearchParams()).limit, 10);
error(() => report.inventoryQuery(new URLSearchParams('limit=51')), 'limit ไม่ถูกต้อง');
assert.equal(warehouse.warehouseQuery(new URLSearchParams('limit=51')), null);
assert.equal(warehouse.warehouseQuery(new URLSearchParams('offset=')).offset, 0); // Keep the existing Number conversion.

function walk(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? walk(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
}
for (const file of walk('src/types').filter((f) => f.endsWith('.ts'))) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  assert.ok(
    source.statements.every(
      (node) =>
        ts.isTypeAliasDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly),
    ),
    'API types contain runtime code: ' + file,
  );
}
const routes = walk('src/app/api')
  .filter((f) => f.endsWith('route.ts'))
  .map((file) => {
    const routePath =
      '/api/' + path.relative('src/app/api', path.dirname(file)).split(path.sep).join('/');
    const pattern = routePath
      .replace(/\/$/, '')
      .split('/')
      .map((segment) =>
        segment.startsWith('[') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      )
      .join('/');
    const source = fs.readFileSync(file, 'utf8');
    return {
      pattern: new RegExp('^' + pattern + '$'),
      methods: [
        ...source.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PATCH|DELETE|PUT)\b/g),
      ].map((m) => m[1]),
      specificity: routePath.split('[').length,
    };
  });
const definitions = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
let count = 0;
for (const file of walk('postman').filter((f) => f.endsWith('.postman_collection.json'))) {
  const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.ok(collection.info.schema.endsWith('/v2.1.0/collection.json'));
  for (const variable of collection.variable || []) {
    if (/token|password|secret|serviceRoleKey/i.test(variable.key))
      assert.ok(!variable.value, 'Credential embedded in Collection variable: ' + variable.key);
  }
  function check(items) {
    for (const item of items) {
      if (!item.request) {
        check(item.item || []);
        continue;
      }
      const request = item.request;
      const raw = typeof request.url === 'string' ? request.url : request.url.raw;
      if (raw.startsWith('{{supabaseUrl}}')) continue; // External Data API, not an application route.
      const url = raw
        .replace('{{baseUrl}}', '')
        .replace(/\{\{[^}]+\}\}/g, '__ID__')
        .split('?')[0];
      const route = routes
        .filter((r) => r.pattern.test(url))
        .sort((a, b) => a.specificity - b.specificity)[0];
      assert.ok(
        route?.methods.includes(request.method),
        file + ': missing route/method ' + request.method + ' ' + url,
      );
      if (request.body?.raw) {
        const body = JSON.parse(request.body.raw);
        for (const [key, value] of Object.entries(body))
          if (/password|token|secret/i.test(key))
            assert.ok(
              typeof value === 'string' && /^\{\{[^}]+\}\}$/.test(value),
              'Credential embedded in request: ' + item.name,
            );
        const definition = definitions.find(
          (d) => url === '/api/' + d.key || url.startsWith('/api/' + d.key + '/'),
        );
        if (definition && ['POST', 'PATCH'].includes(request.method) && body.action !== 'restore') {
          if (definition.key === 'orders') {
            const allowed = new Set([
              'code',
              'customerId',
              'notes',
              'lines',
              'idempotencyKey',
              'action',
              'reason',
              'expectedUpdatedAt',
            ]);
            for (const key of Object.keys(body))
              assert.ok(allowed.has(key), item.name + ': unsupported order field ' + key);
            assert.ok(body.idempotencyKey, item.name + ': missing retry key');
            if (request.method === 'POST')
              assert.ok(body.customerId && body.lines?.length && body.code);
          } else {
            const allowed = new Set([...definition.fields.map((f) => f.key), 'expectedUpdatedAt']);
            for (const key of Object.keys(body))
              assert.ok(allowed.has(key), item.name + ': unsupported body field ' + key);
            if (request.method === 'POST')
              for (const field of definition.fields.filter((f) => f.required))
                assert.ok(field.key in body, item.name + ': missing required field ' + field.key);
          }
        }
      }
      const admin =
        (request.method !== 'GET' && url !== '/api/auth/login') ||
        /(?:\?|&)deleted=true/.test(raw) ||
        url.startsWith('/api/users') ||
        url.startsWith('/api/audit-logs');
      if (admin)
        assert.ok(
          (request.header || []).some(
            (h) =>
              h.key.toLowerCase() === 'authorization' &&
              /\{\{(?:adminToken|activeToken)\}\}/.test(h.value),
          ) || request.auth?.type === 'bearer',
          item.name + ': missing authorization',
        );
      count++;
    }
  }
  check(collection.item);
}
console.log(
  `PASS: pure validator boundaries, API types contain no runtime code, ${count} local Postman app requests match route methods/bodies/auth (offline)`,
);
