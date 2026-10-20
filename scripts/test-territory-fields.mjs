// Actual UI handlers with mocked transport: verify payloads, locks and row navigation.
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as formClasses from '../src/components/ui/form-classes.ts';
import * as customerConfig from '../src/config/customers.ts';
import assert from 'node:assert/strict';
const jsx = (type, props) => ({ type, props: props ?? {} });
const id = '11111111-1111-4111-8111-111111111111';
const fixture = {
  id,
  code: 'HIDDEN_CODE',
  name: 'เขตทดสอบ',
  notes: 'หมายเหตุ',
  managerName: null,
  salesCount: 0,
  memberCount: 0,
  salesMembers: [],
};
let values = [],
  refs = [],
  cursor = 0,
  refCursor = 0,
  effects = [],
  pushed = '',
  redirected = '';
let posted = [],
  fetched = [],
  failPost = false,
  holdPost;
let failGet = 0;
class HttpError extends Error {}
const react = {
  use: (value) => value,
  useState(initial) {
    const i = cursor++;
    if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial;
    return [
      values[i],
      (next) => {
        values[i] = typeof next === 'function' ? next(values[i]) : next;
      },
    ];
  },
  useRef(initial) {
    const i = refCursor++;
    return (refs[i] ??= { current: initial });
  },
  useId: () => 'test',
  useEffect: (effect) => effects.push(effect),
};
function load(file) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    {
      exports,
      Error,
      AbortController,
      URLSearchParams,
      window: {
        setTimeout: (fn) => {
          fn();
          return 1;
        },
        clearTimeout() {},
      },
      require(name) {
        if (name === 'react') return react;
        if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
        if (name === 'next/navigation')
          return {
            useParams: () => ({ id }),
            useRouter: () => ({
              push: (path) => {
                pushed = path;
              },
            }),
            redirect: (path) => {
              redirected = path;
            },
          };
        if (name === 'next/link') return { __esModule: true, default: 'a' };
        if (name === '@/service/http')
          return {
            HttpError,
            Get: async (url) => {
              if (failGet) {
                const error = new HttpError('Request failed');
                error.status = failGet;
                throw error;
              }
              fetched.push(url);
              return url.includes('?')
                ? { data: [fixture], config: { canWrite: true }, pagination: { total: 1 } }
                : { data: fixture };
            },
            Post: async (url, body) => {
              posted.push({ url, body });
              if (holdPost) await holdPost;
              if (failPost) throw Error('Save failed');
              return { data: fixture };
            },
          };
        if (name.includes('sortable-table'))
          return {
            __esModule: true,
            default: 'table',
            useTableSort: () => ({ key: '', direction: 'asc' }),
            withTableSort: (url) => url,
          };
        if (name.includes('pagination-controls'))
          return { __esModule: true, default: 'pagination' };
        if (name.includes('success-alert')) return { __esModule: true, default: 'success' };
        if (name.includes('loading-component')) return { __esModule: true, default: 'loading' };
        if (name.includes('not-found-component')) return { __esModule: true, default: 'notfound' };
        if (name === '@/components/ui/form-classes') return formClasses;
        if (name === '@/config/customers') return customerConfig;
        if (name.startsWith('@/components/ui/'))
          return { __esModule: true, default: name.split('/').pop() };
        if (name.startsWith('@/components/icons/'))
          return new Proxy({ __esModule: true }, { get: (t, k) => (k in t ? t[k] : 'icon') });
        throw Error('Unexpected UI dependency ' + name);
      },
    },
  );
  return exports.default;
}
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  if (typeof tree.type === 'function') return nodes(tree.type(tree.props));
  return [tree, ...nodes(tree.props.children)];
}
function render(Page) {
  cursor = 0;
  refCursor = 0;
  effects = [];
  return nodes(Page({ searchParams: {}, params: { id } }));
}
const listState = () => [
  'active',
  { data: [fixture], config: { canWrite: true }, pagination: { total: 1 } },
  true,
  ' เขตใหม่ ',
  ' note ',
  '',
  0,
  10,
  0,
  false,
  false,
  '',
  '',
  false,
];
const Page = load('src/app/customers/territories/page.tsx');
values = listState();
let tree = render(Page);
assert.equal(tree.filter((node) => node.type === 'td').length, 4);
assert.equal(tree.filter((node) => node.type === 'th').length, 4);
assert.ok(
  !tree.some(
    (node) =>
      node.props.children === 'HIDDEN_CODE' ||
      node.props['aria-label'] === 'รหัสเขต' ||
      node.props['aria-label'] === 'รายการ',
  ),
);
const row = tree.find((node) => node.type === 'tr' && node.props.role === 'link');
row.props.onClick();
assert.equal(pushed, '/customers/territories/' + id);
for (const key of ['Enter', ' ']) {
  let prevented = false;
  row.props.onKeyDown({
    key,
    preventDefault() {
      prevented = true;
    },
  });
  assert.ok(prevented);
  assert.equal(pushed, '/customers/territories/' + id);
}
await tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
assert.deepEqual(JSON.parse(JSON.stringify(posted[0].body)), { name: 'เขตใหม่', notes: 'note' });
assert.equal(values[3], '');
assert.equal(values[13], true);
posted = [];
values = listState();
refs = [];
let release;
holdPost = new Promise((resolve) => {
  release = resolve;
});
tree = render(Page);
const submit = tree.find((node) => node.type === 'form').props.onSubmit;
const pending = submit({ preventDefault() {} });
await submit({ preventDefault() {} });
assert.equal(posted.length, 1);
release();
await pending;
holdPost = null;
values = listState();
refs = [];
failPost = true;
tree = render(Page);
await tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
assert.equal(values[3], ' เขตใหม่ ');
assert.equal(values[12], 'Save failed');
failPost = false;
values = listState();
values[3] = ' ';
refs = [];
posted = [];
tree = render(Page);
await tree.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
assert.equal(posted.length, 0);
values = listState();
values[2] = false;
refs = [];
tree = render(Page);
assert.ok(!tree.some((node) => node.type === 'form'));
effects[0]();
await new Promise((resolve) => setTimeout(resolve, 0));
assert.ok(fetched.at(-1).includes('include=config') && fetched.at(-1).includes('limit=10'));
values = [fixture, '', 0];
refs = [];
const Detail = load('src/app/customers/territories/[id]/page.tsx');
tree = render(Detail);
assert.ok(tree.some((node) => node.type === 'dd' && node.props.children === fixture.notes));
assert.ok(!tree.some((node) => node.props.children === 'HIDDEN_CODE'));
effects[0]();
await new Promise((resolve) => setTimeout(resolve, 0));
assert.ok(fetched.some((url) => url.startsWith('/api/sales-territories/' + id)));
load('src/app/customers/territories/create/page.tsx')();
assert.equal(redirected, '/customers/territories#add-territory');
const collection = JSON.parse(fs.readFileSync('postman/Zuugroup.postman_collection.json', 'utf8'));
const folder = collection.item.find((item) => item.name === 'เขตขาย (Sales Territories)');
assert.equal(folder.item.length, 4);
const createRequest = folder.item.find((item) => item.request.method === 'POST');
assert.deepEqual(Object.keys(JSON.parse(createRequest.request.body.raw)).sort(), ['name', 'notes']);
for (const request of folder.item) {
  assert.equal(request.request.auth.type, 'bearer');
  assert.ok(request.response.length);
}
// Empty and loading states must never hide a failed request.
values = listState();
values[1] = { data: [], pagination: { total: 0 } };
refs = [];
tree = render(Page);
assert.ok(tree.some((node) => node.type === 'notfound'));
values[9] = true;
tree = render(Page);
assert.ok(tree.some((node) => node.type === 'loading' && node.props.isVisible));
assert.ok(!tree.some((node) => node.type === 'notfound'));
values[9] = false;
values[11] = 'API failed';
tree = render(Page);
assert.ok(!tree.some((node) => node.type === 'notfound'));
assert.ok(!tree.some((node) => node.type === 'loading' && node.props.isVisible));
for (const status of [404, 503]) {
  values = [];
  refs = [];
  failGet = status;
  tree = render(Detail);
  effects[0]();
  await new Promise((resolve) => setTimeout(resolve, 0));
  tree = render(Detail);
  assert.equal(
    tree.some((node) => node.type === 'notfound'),
    status === 404,
  );
}
const CustomerDetail = load('src/app/customers/[id]/page.tsx');
for (const status of [404, 403, 503]) {
  values = [];
  refs = [];
  failGet = status;
  tree = render(CustomerDetail);
  effects[0]();
  await new Promise((resolve) => setTimeout(resolve, 0));
  tree = render(CustomerDetail);
  assert.equal(
    tree.some((node) => node.type === 'notfound'),
    status === 404,
  );
}
failGet = 0;
console.log(
  'PASS UI payload/lock/draft/navigation, shared loading/empty states and 404 vs403/503 errors for territory/customer detail, Postman contracts',
);
