// Executes the actual stock history page, effects and callbacks with a fake transport.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as formClasses from '../src/components/ui/form-classes.ts';
let values = [],
  cursor = 0,
  effectIndex = 0;
const effects = [],
  timers = new Map(),
  requests = [];
let timerId = 0;
const jsx = (type, props) => ({ type, props: props ?? {} });
const Pagination = () => null;
const react = {
  useState(initial) {
    const i = cursor++;
    if (!(i in values)) values[i] = typeof initial === 'function' ? initial() : initial;
    return [
      values[i],
      (v) => {
        values[i] = typeof v === 'function' ? v(values[i]) : v;
      },
    ];
  },
  useEffect(fn, deps) {
    const i = effectIndex++;
    if (!effects[i] || deps.some((d, n) => d !== effects[i].deps[n])) {
      effects[i]?.cleanup?.();
      effects[i] = { fn, deps, changed: true };
    }
  },
};
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/app/products/stock/page.tsx', 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText,
  {
    exports,
    Intl,
    Date,
    URL,
    URLSearchParams,
    AbortController,
    setTimeout(fn) {
      const i = ++timerId;
      timers.set(i, fn);
      return i;
    },
    clearTimeout(i) {
      timers.delete(i);
    },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'next/navigation') return { useRouter: () => ({ push() {} }) };
      if (name === '@/components/ui/sortable-table')
        return {
          default: () => null,
          useTableSort: () => ({ key: '', direction: 'asc' }),
          withTableSort: (url) => url,
        };
      if (name === '@/components/ui/pagination-controls') return { default: Pagination };
      if (name === '@/service/http')
        return {
          Get: async (url, signal) => {
            const query = new URL(url, 'http://test.invalid').searchParams;
            const limit = Number(query.get('limit')),
              offset = Number(query.get('offset'));
            requests.push({ limit, offset, signal });
            return {
              data: Array.from({ length: Math.min(limit, 149 - offset) }, (_, i) => ({
                id: String(offset + i),
                receiptCode: 'GR',
                createdAt: '2026-10-06T00:00:00Z',
                productCode: 'P',
                productName: 'Test',
                receivedQuantity: 1,
                unit: 'box',
              })),
              pagination: { total: 149, limit, offset },
            };
          },
        };
      if (name === '@/components/ui/form-classes') return formClasses;
      if (name === 'next/link' || name.startsWith('@/components/ui/'))
        return { default: () => null };
      if (name.startsWith('@/components/icons/'))
        return new Proxy({}, { get: () => () => null });
      throw Error(name);
    },
  },
);
function nodes(n) {
  if (!n || typeof n !== 'object') return [];
  if (Array.isArray(n)) return n.flatMap(nodes);
  return [n, ...nodes(n.props?.children)];
}
function render() {
  cursor = 0;
  effectIndex = 0;
  return nodes(exports.default());
}
async function flush() {
  for (const e of effects)
    if (e.changed) {
      e.changed = false;
      e.cleanup = e.fn();
    }
  for (const [id, fn] of timers) {
    timers.delete(id);
    fn();
  }
  for (let i = 0; i < 8; i++) await Promise.resolve();
}
render();
await flush();
let tree = render();
let controls = tree.find((x) => x.type === Pagination);
assert.equal(requests.at(-1).limit, 10);
assert.equal(requests.at(-1).offset, 0);
assert.equal(controls.props.pages, 15);
controls.props.onChange(3);
render();
await flush();
tree = render();
controls = tree.find((x) => x.type === Pagination);
assert.equal(requests.at(-1).offset, 20);
const previous = requests.at(-1).signal;
controls.props.onPageSizeChange(100);
render();
await flush();
tree = render();
controls = tree.find((x) => x.type === Pagination);
assert.equal(requests.at(-1).limit, 100);
assert.equal(requests.at(-1).offset, 0);
assert.equal(previous.aborted, true);
assert.equal(controls.props.page, 1);
assert.equal(controls.props.pages, 2);
assert.equal(controls.props.count, 100);
controls.props.onChange(2);
render();
await flush();
tree = render();
controls = tree.find((x) => x.type === Pagination);
assert.equal(requests.at(-1).offset, 100);
assert.equal(controls.props.count, 49);
console.log(
  'PASS actual stock page 10/page3 -> 100/page1 -> last49, real query limit/offset and previous request aborted (offline).',
);
