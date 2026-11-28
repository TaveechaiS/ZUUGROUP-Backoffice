// Executes the actual detail page and its callbacks without changing real data.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import crypto from 'node:crypto';
import * as productConfig from '../src/config/products.ts';
let values = [],
  refs = [],
  cursor = 0,
  refCursor = 0;
const jsx = (type, props) => ({ type, props: props ?? {} });
const Alert = () => null;
const react = {
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
  useEffect() {},
  useId: () => 'test-id',
};
class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
const config = { ...productConfig };
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/types/api/product-full.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: config },
);
const options = Object.fromEntries(
  Object.entries(config.PRODUCT_OPTION_FIELDS).map(([label, kind], i) => [
    kind,
    [
      {
        id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
        kind,
        name: label,
        code: kind === 'codeGroup' ? 'RX' : kind === 'codeFormat' ? 'TB' : null,
        active: true,
        version: 1,
      },
    ],
  ]),
);
const optionIds = Object.fromEntries(
  Object.entries(config.PRODUCT_OPTION_FIELDS).map(([label, kind]) => [label, options[kind][0].id]),
);
const product = {
  id: crypto.randomUUID(),
  code: 'RX-TB-00001',
  name: 'Original',
  sequence: '00001',
  unit: 'หน่วยสินค้า',
  salePrice: '10.00',
  version: 'a'.repeat(32),
  details: {
    fields: {
      'ชื่อสินค้าเต็ม (ไทย)': 'Original',
      'ชื่อสินค้าเต็ม (ภาษาอังกฤษ)': 'English',
      ราคาขาย: '10.00',
      เลขลำดับ: '00001',
      รหัสสินค้าเต็ม: 'RX-TB-00001',
      ...Object.fromEntries(Object.keys(optionIds).map((label) => [label, label])),
    },
    options: optionIds,
    files: [
      { id: crypto.randomUUID(), kind: 'image', name: 'old.png', type: 'image/png', size: 100 },
    ],
  },
};
let latest = structuredClone(product),
  mode = 'lost',
  admin = true;
const calls = [],
  requests = new Map(),
  replaced = [];
const transport = {
  HttpError,
  async Get(url) {
    calls.push(['GET', url]);
    if (url.startsWith('/api/product-options')) return { options };
    if (url.includes('/full/requests/')) {
      const request = requests.get(url.split('/').at(-1));
      if (!request) throw new HttpError('missing', 404);
      return { status: request.status, product: { id: product.id, code: latest.code } };
    }
    return { product: structuredClone(latest) };
  },
  async Delete(url) {
    calls.push(['DELETE', url]);
    requests.get(url.split('/').at(-1)).status = 'cancelled';
  },
  async Post(url, body) {
    calls.push(['POST', url, body]);
    if (url.endsWith('/edit-requests')) {
      requests.set(body.requestId, { body, status: 'pending' });
      return { status: 'pending' };
    }
    if (url.endsWith('/files')) return {};
    const request = requests.get(url.split('/').at(-1));
    if (mode === 'stale')
      throw new HttpError('ข้อมูลสินค้าถูกเปลี่ยนแล้ว กรุณาโหลดข้อมูลล่าสุดก่อนแก้ไขอีกครั้ง', 409);
    request.status = 'complete';
    latest = {
      ...latest,
      code: 'RX-TB-' + request.body.data.sequence,
      version: 'b'.repeat(32),
      salePrice: request.body.data.fields['ราคาขาย'],
      details: {
        ...latest.details,
        fields: { ...latest.details.fields, ...request.body.data.fields },
        files: latest.details.files.filter((file) => request.body.keepFileIds.includes(file.id)),
      },
    };
    if (mode === 'lost') {
      mode = 'success';
      throw new HttpError('network response lost', 503);
    }
    return { product: { id: product.id, code: latest.code } };
  },
};
const exports = {};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/app/products/[id]/page.tsx', 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText,
  {
    exports,
    crypto: crypto.webcrypto,
    File,
    FormData,
    Uint8Array,
    Intl,
    Date,
    AbortController,
    console,
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === '@/service/http') return transport;
      if (name === '@/types/api/product-full') return config;
      if (name === '@/config/products') return productConfig;
      if (name === 'next/navigation')
        return { useRouter: () => ({ replace: (url) => replaced.push(url), refresh() {} }) };
      if (name === '@/components/ui/route-data')
        return { useRouteData: () => ({ product, isAdmin: admin }) };
      if (name === '@/components/ui/success-alert-component') return { default: Alert };
      if (name === '@/components/ui/sortable-table')
        return {
          default: () => null,
          useTableSort: () => ({ key: '', direction: 'asc' }),
          withTableSort: (url) => url,
        };
      if (name.startsWith('@/components/ui/') || name === 'next/link' || name === 'next/image')
        return { default: () => null };
      if (name === './product-record-history') return { default: () => null };
      throw Error(name);
    },
  },
);
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}
function render() {
  cursor = 0;
  refCursor = 0;
  return nodes(exports.default());
}
const text = (n) =>
  typeof n === 'string'
    ? n
    : Array.isArray(n)
      ? n.map(text).join('')
      : n?.props
        ? text(n.props.children)
        : '';
const button = (label) => render().find((n) => n.type === 'button' && text(n) === label);
await button('แก้ไข').props.onClick();
let tree = render();
assert.equal(tree.find((n) => n.props.label === 'กลุ่มรหัส').props.value, optionIds['กลุ่มรหัส']);
assert.equal(
  tree.find((n) => n.props.label === 'หน่วยสินค้า').props.value,
  optionIds['หน่วยสินค้า'],
);
tree
  .find((n) => n.type === 'input' && n.props['aria-label'] === 'ราคาขาย')
  .props.onChange({ target: { value: '25.00' } });
tree = render();
tree
  .find((n) => n.type === 'input' && n.props['aria-label'] === 'เลขลำดับ')
  .props.onChange({ target: { value: '00002' } });
tree = render();
assert.equal(tree.find((n) => n.props['aria-label'] === 'รหัสสินค้าเต็ม').props.readOnly, true);
tree
  .find((n) => n.type === 'details' && text(n.props.children).includes('รูปสินค้าและเอกสาร'))
  .props.onToggle({ currentTarget: { open: true } });
tree = render();
tree
  .find((n) => n.type === 'input' && n.props.type === 'file')
  .props.onChange({
    target: { files: [new File(['test'], 'new.png', { type: 'image/png' })], value: 'file' },
  });
await button('บันทึก').props.onClick();
assert.equal(render().find((n) => n.type === Alert).props.isOpen, false);
assert.ok(button('บันทึก'));
const begin = calls.find(([method, url]) => method === 'POST' && url.endsWith('/edit-requests'));
assert.equal(begin[2].expectedVersion, product.version);
assert.equal(begin[2].data.fields['ราคาขาย'], '25.00');
assert.equal(begin[2].data.fields['หน่วยสินค้า'], optionIds['หน่วยสินค้า']);
assert.equal(begin[2].data.sequence, '00002');
assert.equal(begin[2].keepFileIds[0], product.details.files[0].id);
assert.equal(begin[2].data.files.length, 1);
assert.match(begin[2].data.files[0].digest, /^[a-f0-9]{64}$/);
await button('บันทึก').props.onClick();
assert.equal(
  calls.filter(([method, url]) => method === 'POST' && url.endsWith('/edit-requests')).length,
  1,
);
assert.equal(
  calls.filter(([method, url]) => method === 'POST' && /requests\/[^/]+$/.test(url)).length,
  1,
);
assert.ok(button('แก้ไข'));
assert.equal(render().find((n) => n.type === Alert).props.isOpen, true);
assert.equal(replaced.at(-1), '/products/RX-TB-00002');
console.log(
  'PASS full edit prefill IDs, all fields/sequence/file manifest, lost commit response retry and success only after confirmed commit',
);
render()
  .find((n) => n.type === Alert)
  .props.onClose();
await button('แก้ไข').props.onClick();
mode = 'stale';
tree = render();
tree
  .find((n) => n.type === 'input' && n.props['aria-label'] === 'ราคาขาย')
  .props.onChange({ target: { value: '77.00' } });
await button('บันทึก').props.onClick();
tree = render();
assert.equal(
  tree.find((n) => n.type === 'input' && n.props['aria-label'] === 'ราคาขาย').props.value,
  '77.00',
);
assert.equal(button('บันทึก').props.disabled, true);
assert.ok(button('โหลดข้อมูลล่าสุดและเริ่มแก้ไขใหม่'));
assert.equal(tree.find((n) => n.type === Alert).props.isOpen, false);
await button('ยกเลิก').props.onClick();
assert.equal(render().find((n) => n.type === Alert).props.title, 'ยกเลิกการแก้ไข');
render()
  .find((n) => n.type === Alert)
  .props.onClose();
assert.ok(button('แก้ไข'));
assert.ok(calls.some(([method]) => method === 'DELETE'));
console.log(
  'PASS stale409 keeps draft/blocks save, no fake success, dirty cancel alert and pending cleanup',
);
values = [];
refs = [];
admin = false;
assert.equal(button('แก้ไข'), undefined);
console.log('PASS non-Admin has no editing controls');
