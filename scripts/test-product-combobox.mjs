// Render the actual page-local combobox with isolated hooks; no browser or HTTP.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as productConfig from '../src/config/products.ts';
import * as formClasses from '../src/components/ui/form-classes.ts';
const data = Array.from({ length: 25 }, (_, i) => ({
  id: String(i),
  kind: 'codeGroup',
  name: 'Group ' + i,
  code: 'G' + i,
  active: true,
  version: 1,
}));
let values = [true, '', null, data, false, '', '', 0, 0];
let cursor = 0;
let networkCalls = 0;
const react = {
  createContext: () => ({}),
  useCallback: (fn) => fn,
  useContext: () => async () => {
    networkCalls++;
    return { options: { codeGroup: data } };
  },
  useEffect: () => {},
  useId: () => 'test',
  useRef: (value) => ({ current: value }),
  useState: (initial) => {
    const n = cursor++;
    if (values[n] === undefined) values[n] = initial;
    return [
      values[n],
      (next) => {
        values[n] = typeof next === 'function' ? next(values[n]) : next;
      },
    ];
  },
};
const jsx = (type, props) => ({ type, props: props ?? {} });
const exports = {};
const source =
  fs.readFileSync('src/app/products/create/page.tsx', 'utf8') +
  '\nexport { ProductOptionCombobox };';
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText;
vm.runInNewContext(code, {
  exports,
  console,
  require(name) {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (name === '@/config/product-options')
      return { PRODUCT_OPTION_KINDS: { codeGroup: { label: 'Group' } } };
    if (name === '@/service/http')
      return {
        Get: () => {
          networkCalls++;
          throw Error('Unexpected request');
        },
      };
    if (name === '@/types/api/product-full') return {};
    if (name === '@/config/products') return productConfig;
    if (name === '@/components/ui/form-classes') return formClasses;
    if (name === 'next/navigation') return { useRouter: () => ({}) };
    if (
      name === 'next/link' ||
      name === 'next/image' ||
      name === '@/components/ui/success-alert-component'
    )
      return { default: () => null };
    throw Error('Unexpected module ' + name);
  },
});
const render = () => {
  cursor = 0;
  return exports.ProductOptionCombobox({ id: 'combo', kind: 'codeGroup' });
};
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}
let tree = nodes(render());
assert.equal(tree.filter((n) => n.props.role === 'option').length, 25);
assert.ok(tree.find((n) => n.props.role === 'listbox').props.className.includes('25rem'));
const input = tree.find((n) => n.props.role === 'combobox');
input.props.onChange({ target: { value: 'Group 24' } });
tree = nodes(render());
assert.equal(tree.filter((n) => n.props.role === 'option').length, 1);
assert.equal(networkCalls, 0);
tree.find((n) => n.props.role === 'option').props.onClick();
tree = nodes(render());
assert.equal(tree.find((n) => n.props.role === 'combobox').props.value, 'Group 24');
assert.equal(values[2].id, '24');
assert.ok(!tree.some((n) => n.props.onClick?.name === 'loadMore'));
assert.equal(networkCalls, 0);
console.log(
  'PASS Complete 25 options, bounded scroll, client search, selection beyond row 10; no HTTP on typing/selection.',
);
