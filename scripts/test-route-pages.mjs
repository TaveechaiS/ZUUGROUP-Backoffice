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
  assert.ok(!source.includes('components/operations'), file + ': operations UI import remains');
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
    const workflow = [
      'src/app/orders/page.tsx',
      'src/app/orders/create/page.tsx',
      'src/app/orders/[id]/page.tsx',
      'src/components/sales/document-form.tsx',
    ]
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');
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
  // TASK-275: quotations use the dedicated quote workflow API and the shared document form.
  if (recordModule.key === 'quotes') {
    const pages = [
      'src/app/quotes/page.tsx',
      'src/app/quotes/create/page.tsx',
      'src/app/quotes/[id]/page.tsx',
    ]
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');
    assert.ok(pages.includes('/api/quotes') && pages.includes('kind="quote"'));
    assert.ok(pages.includes('expectedUpdatedAt') && pages.includes("'convert'"));
    assert.ok(
      fs.readFileSync('src/app/quotes/create/layout.tsx', 'utf8').includes('requireActiveUser'),
    );
    assert.ok(
      fs.readFileSync('src/server/quotes/service.ts', 'utf8').includes("approve: ['MANAGER']"),
    );
    continue;
  }
  if (recordModule.key === 'suppliers' || recordModule.key === 'purchases') {
    const root = 'src/app/' + recordModule.key;
    const pages = [root + '/page.tsx', root + '/create/page.tsx', root + '/[id]/page.tsx']
      .map((file) => fs.readFileSync(file, 'utf8'))
      .join('\n');
    assert.ok(pages.includes('/api/' + recordModule.key));
    assert.ok(pages.includes('expectedUpdatedAt'), root + ': lost edit concurrency guard');
    assert.ok(pages.includes('LoadingComponent') && pages.includes('NotFoundComponent'));
    assert.ok(
      fs.readFileSync(root + '/create/layout.tsx', 'utf8').includes('requireAdmin'),
      root + ': missing create auth guard',
    );
    assert.ok(
      fs
        .readFileSync('src/server/purchasing/service.ts', 'utf8')
        .includes("allow(actor, ['ADMIN'])"),
    );
    continue;
  }
  if (recordModule.key === 'sales-territories') {
    assert.ok(
      fs
        .readFileSync('src/app/customers/territories/page.tsx', 'utf8')
        .includes('/api/sales-territories'),
    );
    assert.ok(
      fs
        .readFileSync('src/app/customers/territories/[id]/page.tsx', 'utf8')
        .includes('/api/sales-territories/'),
    );
    assert.ok(
      fs
        .readFileSync('src/app/customers/territories/create/layout.tsx', 'utf8')
        .includes('requireAdmin'),
    );
    continue;
  }
  const root = 'src/app' + recordModule.page;
  const create = root + '/create/page.tsx';
  const detail = root + '/[id]/page.tsx';
  for (const file of [create, detail]) {
    // TASK-263: customer create/detail use the dedicated customer API, not record fields.
    if (file === 'src/app/customers/create/page.tsx') {
      // TASK-268: the page renders the shared create/edit form.
      assert.ok(fs.readFileSync(file, 'utf8').includes('<CustomerForm />'));
      const page = fs.readFileSync('src/app/customers/create/customer-form.tsx', 'utf8');
      assert.ok(page.includes('/edit-requests'), 'Customer edit must save via edit requests');
      assert.ok(
        fs.readFileSync('src/app/customers/[id]/edit/layout.tsx', 'utf8').includes('requireAdmin'),
      );
      assert.ok(page.includes('/api/customers/requests'), 'Customer create must save via requests');
      assert.ok(page.includes('/api/customer-options?kinds='), 'Customer create must load options');
      assert.ok(
        fs.readFileSync('src/app/customers/create/layout.tsx', 'utf8').includes('requireAdmin'),
      );
      continue;
    }
    if (file === 'src/app/customers/[id]/page.tsx') {
      const page = fs.readFileSync(file, 'utf8');
      assert.ok(page.includes("'/api/customers/'"), 'Customer detail must read the customer API');
      assert.ok(page.includes('LoadingComponent') && page.includes('NotFoundComponent'));
      continue;
    }
    const fields = controls(file);
    const removedTerritoryFields = new Set(['status', 'area', 'owner', 'managerId', 'salesId']);
    for (const field of recordModule.fields.filter(
      (field) => recordModule.key !== 'sales-territories' || !removedTerritoryFields.has(field.key),
    ))
      assert.ok(
        fields.has(
          recordModule.key === 'sales-territories' && field.key === 'salesId'
            ? 'salesIds'
            : field.key,
        ),
        file + ': missing field ' + field.key,
      );
    if (recordModule.key === 'sales-territories')
      for (const key of removedTerritoryFields)
        assert.ok(!fields.has(key), file + ': removed territory field still shown: ' + key);
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
  // TASK-263: customer detail is read-only until the customer edit task.
  if (recordModule.key !== 'customers')
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
