import fs from 'node:fs';
import assert from 'node:assert/strict';
import { businessRecord, drugProducts, warehouseNames } from './seed-business-catalog.mjs';
import { buildRefreshPlan, refreshSql } from './realistic-refresh-plan.mjs';
import { operationalSeedSql } from './operational-seed-sql.mjs';
const modules = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
const snake = (key) => key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
for (const m of modules) {
  const rows = Array.from({ length: 15 }, (_, i) => businessRecord(m.key, i));
  assert.equal(new Set(rows.map((r) => r.name)).size, 15, m.key + ' names must be distinct');
  for (const row of rows) {
    assert.ok(!/\s\d{3,4}$|mock|demo|ตัวอย่าง/i.test(row.name));
    for (const f of m.fields.filter((f) => !f.relation))
      assert.ok(f.key in row, m.key + '/' + f.key);
    if (m.fields.some((f) => f.key === 'owner')) assert.ok(row.owner);
    assert.equal(row.subtitle, undefined);
    if (m.key === 'customer-documents') assert.equal(row.fileUrl, '');
  }
}
assert.equal(new Set(warehouseNames).size, 15);
assert.equal(new Set(drugProducts.map((x) => x[1])).size, 15);
for (const p of drugProducts) {
  if (['Normal saline', 'Oral rehydration salts'].includes(p[0])) assert.notEqual(p[2], 'TAB');
}
const before = JSON.parse(fs.readFileSync('scripts/snapshots/TASK-076-before.json', 'utf8'));
const plan = buildRefreshPlan(before);
assert.ok(plan.changes.length > 200);
assert.ok(!plan.changes.some((x) => x.code === 'VIT-PWD-0002'));
for (const row of plan.changes) {
  for (const protectedKey of [
    'id',
    'code',
    'status',
    'sequence',
    'category_id',
    'dosage_form_id',
    'default_warehouse_id',
    'deleted_at',
  ])
    assert.ok(!(protectedKey in row.after));
  if (row.table !== 'warehouses') assert.ok(row.guard.updated_at);
}
const after = structuredClone(before);
const tables = Object.fromEntries(modules.map((m) => [m.table, after.records[m.key]]));
tables.products = after.products;
tables.warehouses = after.masters.warehouses;
for (const c of plan.changes)
  Object.assign(
    tables[c.table].find((r) => r.id === c.id),
    c.after,
  );
for (const m of modules) {
  assert.equal(after.records[m.key].length, before.records[m.key].length);
  assert.equal(
    new Set(after.records[m.key].map((r) => r.name)).size,
    after.records[m.key].length,
    'duplicate names: ' + m.key,
  );
  for (const row of after.records[m.key]) {
    assert.ok(!/\s\d{3}$/.test(row.name));
    for (const f of m.fields.filter((f) => f.relation)) {
      const id = row[snake(f.key)];
      if (id)
        assert.ok(
          (f.relation === 'warehouses' ? after.masters.warehouses : after.records[f.relation]).some(
            (r) => r.id === id,
          ),
        );
    }
  }
}
assert.equal(buildRefreshPlan(after).changes.length, 0, 'refresh must be idempotent');
const edited = structuredClone(before);
const owned = edited.records.customers.find((r) => r.code === 'CUS-INIT-001');
owned.name = 'ร้านยาที่เจ้าของแก้เอง';
owned.owner = 'ผู้ดูแลที่เจ้าของกำหนด';
assert.ok(!buildRefreshPlan(edited).changes.some((x) => x.id === owned.id));
const fieldEdited = structuredClone(before);
const fieldRow = fieldEdited.records.customers.find((r) => r.code === 'CUS-INIT-002');
fieldRow.owner = 'ชื่อที่เจ้าของแก้';
assert.ok(
  !('owner' in buildRefreshPlan(fieldEdited).changes.find((x) => x.id === fieldRow.id).after),
);
assert.ok(refreshSql(plan).includes('updated_at" IS NOT DISTINCT FROM'));
assert.ok(refreshSql(plan).includes('Concurrent edit:'));
assert.ok(refreshSql(plan, { rollback: true }).includes('realistic_data_rollback'));
const sql = operationalSeedSql();
assert.ok(sql.includes('ON CONFLICT'));
assert.ok(sql.includes('existing.name=v.name'));
assert.ok(!/\b(?:DROP|DELETE|TRUNCATE|ALTER|CREATE TABLE)\b/i.test(sql));
assert.ok(!/drug_name\|\||คลัง 01|เอกสารลูกค้า 001/.test(sql));
console.log(
  'PASS: 14 complete catalogs, unique names, valid relations/form pairs, unchanged IDs/codes/status, preserved user edits, repeat-safe refresh and guarded rollback (offline)',
);
