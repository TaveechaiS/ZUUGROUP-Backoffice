import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const exports = {};
const jsx = (type, props) => ({ type, props: props ?? {} });
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync('src/components/ui/pagination-controls.tsx', 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText,
  {
    exports,
    require(name) {
      if (name === 'react') return { useId: () => 'page-size' };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      throw Error(name);
    },
  },
);
const plain = (x) => JSON.parse(JSON.stringify(x));
const visible = exports.visiblePaginationPages;
assert.deepEqual(plain(visible(1, 0)), [1]);
assert.deepEqual(plain(visible(2, 3)), [1, 2, 3]);
for (const total of [6, 10, 100, 1000])
  for (const page of [1, 2, Math.ceil(total / 2), total - 1, total]) {
    const numbers = visible(page, total).filter((x) => typeof x === 'number');
    assert.equal(numbers[0], 1);
    assert.equal(numbers.at(-1), total);
    assert.ok(numbers.includes(page));
    assert.equal(new Set(numbers).size, numbers.length);
    assert.ok(numbers.every((n, i) => n >= 1 && n <= total && (!i || n > numbers[i - 1])));
    assert.ok(numbers.length <= 5);
  }
assert.ok(visible(50, 100).includes('before') && visible(50, 100).includes('after'));
assert.equal(visible(50, 100, 7).filter((x) => typeof x === 'number').length, 7);
function nodes(n) {
  if (!n || typeof n !== 'object') return [];
  if (Array.isArray(n)) return n.flatMap(nodes);
  return [n, ...nodes(n.props?.children)];
}
let selectedPage, selectedSize;
const base = {
  page: 3,
  pages: 10,
  total: 100,
  count: 10,
  pageSize: 10,
  onChange: (p) => {
    selectedPage = p;
  },
  onPageSizeChange: (s) => {
    selectedSize = s;
  },
};
let tree = nodes(exports.default(base));
const select = tree.find((x) => x.type === 'select');
assert.deepEqual(plain(select.props.children.map((x) => x.props.value)), [10, 20, 50, 100]);
select.props.onChange({ target: { value: '100' } });
assert.equal(selectedSize, 100);
select.props.onChange({ target: { value: '200' } });
assert.equal(selectedSize, 100);
tree.find((x) => x.props['aria-label'] === 'หน้า 10').props.onClick();
assert.equal(selectedPage, 10);
assert.equal(tree.find((x) => x.props['aria-current'] === 'page').props.children, 3);
tree = nodes(exports.default({ ...base, page: 1, pages: 1, total: 0, count: 0 }));
const arrows = tree.filter((x) => x.type === 'button' && !x.props['aria-label']);
assert.ok(arrows.every((x) => x.props.disabled));
tree = nodes(exports.default({ ...base, disabled: true }));
assert.ok(
  tree.filter((x) => x.type === 'button' || x.type === 'select').every((x) => x.props.disabled),
);
console.log(
  'PASS page numbers/first-last/ellipsis/bounds/zero/custom window/10-20-50-100/select/click/disabled.',
);
