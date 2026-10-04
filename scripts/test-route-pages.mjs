// Migration integrity checks only; no HTTP calls or database reads.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const definitions = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    );
}
const pages = walk('src/app').filter((file) => file.endsWith('page.tsx'));
for (const file of pages) {
  const source = fs.readFileSync(file, 'utf8');
  assert.ok(!source.includes('components/pages'), file + ': shared full page import');
  assert.ok(
    !/ModuleListPage|RecordFormPage|RecordDetailPage|usePaginatedList/.test(source),
    file + ': generic whole page/data hook',
  );
  assert.ok(!/export\s+\{[^}]*default[^}]*\}\s+from/.test(source), file + ': full page re-export');
}
assert.ok(!fs.existsSync('src/components/pages'), 'old pages directory remains');
function controls(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const keys = new Set();
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      for (const attribute of node.attributes.properties) {
        if (!ts.isJsxAttribute(attribute) || !attribute.initializer) continue;
        if (attribute.name.text === 'name' && ts.isStringLiteral(attribute.initializer))
          keys.add(attribute.initializer.text);
        if (
          attribute.name.text === 'field' &&
          ts.isJsxExpression(attribute.initializer) &&
          attribute.initializer.expression &&
          ts.isObjectLiteralExpression(attribute.initializer.expression)
        ) {
          const key = attribute.initializer.expression.properties.find(
            (property) =>
              ts.isPropertyAssignment(property) &&
              property.name.getText(source).replaceAll('"', '').replaceAll("'", '') === 'key',
          );
          if (key && ts.isStringLiteral(key.initializer)) keys.add(key.initializer.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return keys;
}
for (const recordModule of definitions) {
  if (recordModule.key === 'customer-groups') {
    for (const suffix of ['/page.tsx', '/create/page.tsx', '/[id]/page.tsx'])
      assert.ok(
        fs
          .readFileSync('src/app/customers/groups' + suffix, 'utf8')
          .includes("redirect('/customers')"),
      );
    continue;
  }
  if (recordModule.key === 'orders') {
    const workflow = fs.readFileSync('src/components/operations/order-workspace.tsx', 'utf8');
    assert.ok(
      workflow.includes('productId') &&
        workflow.includes('quantity') &&
        workflow.includes('customerId'),
    );
    assert.ok(workflow.includes('expectedUpdatedAt'));
    assert.ok(
      fs.readFileSync('src/app/orders/create/layout.tsx', 'utf8').includes('requireActiveUser'),
    );
    const service = fs.readFileSync('src/server/operations/service.ts', 'utf8');
    assert.ok(service.includes("approve: ['MANAGER']") && service.includes("complete: ['ADMIN']"));
    continue;
  }
  const root = 'src/app' + recordModule.page;
  const create = root + '/create/page.tsx';
  const detail = root + '/[id]/page.tsx';
  for (const file of [create, detail]) {
    const fields = controls(file);
    for (const field of recordModule.fields)
      assert.ok(fields.has(field.key), file + ': missing field ' + field.key);
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(!/\{entity\.fields\.map/.test(source), file + ': generic fields render');
    assert.ok(
      source.includes('noValidate') && source.includes('fieldErrors'),
      file + ': lost inline validation',
    );
  }
  assert.ok(
    fs.readFileSync(root + '/create/layout.tsx', 'utf8').includes('requireAdmin'),
    root + ': missing create auth guard',
  );
  assert.ok(
    fs.readFileSync(detail, 'utf8').includes('expectedUpdatedAt'),
    detail + ': lost edit concurrency guard',
  );
}
for (const route of ['users', 'audit-logs'])
  assert.ok(fs.readFileSync('src/app/' + route + '/layout.tsx', 'utf8').includes('requireAdmin'));
assert.ok(fs.readFileSync('src/app/products/layout.tsx', 'utf8').includes('requireActiveUser'));
const combobox = fs.readFileSync('src/components/ui/search-combobox.tsx', 'utf8');
assert.ok(
  !/service\/http|\/api\/|\bfetch\(/.test(combobox),
  'Combobox must not choose/fetch page endpoints',
);
console.log(
  `PASS: ${pages.length} routes own their page code; ${definitions.length} create/edit field sets and server guards preserved; Combobox has no API transport (offline)`,
);
