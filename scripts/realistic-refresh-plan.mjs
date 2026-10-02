import fs from 'node:fs';
import {
  businessRecord,
  prefixes,
  warehouseNames,
  drugProducts,
} from './seed-business-catalog.mjs';
const modules = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
const legacy = JSON.parse(
  fs.readFileSync('scripts/fixtures/operational-migration-backup.json', 'utf8'),
).rows;
const snake = (key) => key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
const same = (a, b) => a === b || (a != null && b != null && String(a) === String(b));
const oldTitles = {
  customers: 'องค์กรลูกค้า',
  'customer-groups': 'กลุ่มลูกค้า',
  suppliers: 'ผู้ขาย',
  'customer-follow-ups': 'ภาพรวมลูกค้า',
};
export function buildRefreshPlan(snapshot) {
  const changes = [],
    skipped = [],
    projections = new Map();
  const allTables = {
    ...Object.fromEntries(modules.map((m) => [m.table, snapshot.records[m.key]])),
    products: snapshot.products,
    warehouses: snapshot.masters.warehouses,
  };
  for (const [table, rows] of Object.entries(allTables))
    for (const row of rows) projections.set(table + ':' + row.id, { ...row });
  const projected = (table, id) => projections.get(table + ':' + id);
  const propose = (table, row, values, allowed) => {
    const before = {},
      after = {};
    for (const [key, value] of Object.entries(values)) {
      if (same(row[key], value)) continue;
      if (!allowed(key, row[key])) {
        skipped.push({
          table,
          id: row.id,
          code: row.code,
          field: key,
          reason: 'ค่าเดิมไม่ตรง seed หรือเป็นค่าที่ผู้ใช้บันทึก',
        });
        continue;
      }
      before[key] = row[key] ?? null;
      after[key] = value;
    }
    if (Object.keys(after).length) {
      changes.push({
        table,
        id: row.id,
        code: row.code,
        guard: row.updated_at
          ? { code: row.code, updated_at: row.updated_at, deleted_at: row.deleted_at }
          : { code: row.code },
        before,
        after,
      });
      Object.assign(projected(table, row.id), after);
    }
  };
  for (const row of snapshot.masters.warehouses) {
    const n = /^WH-INIT-(\d{2})$/.exec(row.code);
    if (n && row.name === 'คลัง ' + n[1])
      propose('warehouses', row, { name: warehouseNames[Number(n[1]) - 1] }, () => true);
  }
  const ordered = [...modules].sort((a, b) => {
    const priority = (k) =>
      ['customer-groups', 'sales-territories', 'suppliers', 'customers'].includes(k)
        ? ['customer-groups', 'sales-territories', 'suppliers', 'customers'].indexOf(k)
        : 10;
    return priority(a.key) - priority(b.key);
  });
  for (const m of ordered) {
    for (const [position, row] of snapshot.records[m.key].entries()) {
      const match = new RegExp('^' + prefixes[m.key] + '-INIT-(\\d{3})$').exec(row.code);
      const mapping = snapshot.imports.find((x) => x.entity === m.key && x.record_id === row.id);
      const original = mapping
        ? legacy.find((x) => x.id === mapping.source_id && x.dataset_key === mapping.source_module)
        : m.key === 'customers'
          ? legacy.find((x) => x.id === row.id && x.ref === row.code && x.title === row.name)
          : null;
      const initialName = match ? (oldTitles[m.key] ?? m.title) + ' ' + match[1] : null;
      const initial = Boolean(match && row.name === initialName);
      const imported = Boolean(
        original && row.code === original.ref && row.name === original.title,
      );
      if (!initial && !imported) {
        skipped.push({
          table: m.table,
          id: row.id,
          code: row.code,
          reason: 'คงรายการที่ผู้ใช้สร้างหรือแก้ชื่อไว้',
        });
        continue;
      }
      const index = initial ? Number(match[1]) - 1 : position;
      const originalCustomer =
        snapshot.records.customers.find((x) => x.id === row.customer_id) ??
        snapshot.records.customers.find((x) => x.name === row.name);
      const customer = originalCustomer ? projected('customers', originalCustomer.id) : null;
      const supplier =
        projected('suppliers', row.supplier_id) ??
        projected('suppliers', snapshot.records.suppliers.find((x) => x.name === row.name)?.id);
      const warehouse = projected('warehouses', row.warehouse_id);
      const values = businessRecord(m.key, index, {
        customerName: customer?.name,
        supplierName: supplier?.name,
        warehouseName: warehouse?.name,
        province: customer?.province,
      });
      const desired = Object.fromEntries(
        m.fields
          .filter((f) => !['code', 'status'].includes(f.key) && !f.relation)
          .map((f) => [snake(f.key), values[f.key] ?? '']),
      );
      const defaults = Object.fromEntries(
        m.fields.map((f) => [
          snake(f.key),
          f.key === 'name'
            ? initialName
            : f.key === 'amount'
              ? null
              : f.key === 'category'
                ? m.key === 'customers'
                  ? 'องค์กร'
                  : m.key === 'expenses'
                    ? 'ค่าใช้จ่ายทั่วไป'
                    : m.key === 'suppliers'
                      ? 'ผู้จำหน่าย'
                      : m.key === 'settings'
                        ? 'ข้อมูลทั่วไป'
                        : 'ทั่วไป'
                : ['province', 'location'].includes(f.key)
                  ? 'กรุงเทพมหานคร'
                  : f.key === 'documentType'
                    ? 'ข้อมูลลูกค้า'
                    : f.key === 'followUpText'
                      ? 'รอบันทึกข้อมูลติดตาม'
                      : '',
        ]),
      );
      // Real relations remain intact; only fill missing seed relations.
      for (const f of m.fields.filter((f) => f.relation)) {
        const key = snake(f.key);
        if (row[key]) continue;
        const candidates =
          f.relation === 'warehouses' ? snapshot.masters.warehouses : snapshot.records[f.relation];
        const preferred =
          f.key === 'customerId'
            ? originalCustomer
            : f.key === 'supplierId'
              ? snapshot.records.suppliers.find((x) => x.name === row.name)
              : f.key === 'groupId'
                ? candidates.find((x) =>
                    (projected('customer_groups', x.id)?.name ?? '').includes(row.category),
                  )
                : f.key === 'territoryId'
                  ? candidates.find((x) =>
                      (projected('sales_territories', x.id)?.area ?? '').includes(row.province),
                    )
                  : null;
        const target =
          preferred ??
          candidates.filter((x) => !x.deleted_at)[
            index % candidates.filter((x) => !x.deleted_at).length
          ];
        if (target) desired[key] = target.id;
      }
      if (imported) {
        // Keep already meaningful imported labels; document names become descriptive.
        if (
          ![
            'customer-documents',
            'customer-follow-ups',
            'quotes',
            'orders',
            'purchases',
            'billing',
          ].includes(m.key)
        )
          delete desired.name;
        if (m.key === 'customer-documents' && row.document_type)
          desired.name =
            row.document_type + ' — ' + (customer?.name ?? row.name) + ' · ชุดตรวจเอกสารเปิดบัญชี';
        if (['purchases', 'quotes', 'orders', 'billing', 'customer-follow-ups'].includes(m.key)) {
          const period = /^[A-Z]+-69(\d{2})-/.exec(row.code);
          const month = [
            'มกราคม',
            'กุมภาพันธ์',
            'มีนาคม',
            'เมษายน',
            'พฤษภาคม',
            'มิถุนายน',
            'กรกฎาคม',
            'สิงหาคม',
            'กันยายน',
            'ตุลาคม',
            'พฤศจิกายน',
            'ธันวาคม',
          ][Number(period?.[1] ?? 9) - 1];
          if (m.key === 'billing') desired.name = 'วางบิล — ' + (customer?.name ?? row.name);
          desired.name += ' · รอบ' + month + ' 2569';
        }
        if (/^\d+ รายการ$/.test(row.owner ?? '') && row.owner === original.owner) {
          desired.owner = (row.description ?? '').split(' · ').at(-1) || values.owner;
        } else if ((row.owner ?? '').startsWith('ผู้ดูแล:') && row.owner === original.owner)
          desired.owner = row.owner.replace(/^ผู้ดูแล:\s*/, '');
      }
      propose(m.table, row, desired, (key, value) => {
        if (initial) return same(value, defaults[key]) || value == null;
        if (key === 'name') return same(value, original.title);
        if (
          key === 'owner' &&
          same(value, original.owner) &&
          (/^\d+ รายการ$/.test(value ?? '') || (value ?? '').startsWith('ผู้ดูแล:'))
        )
          return true;
        return value == null || value === '';
      });
    }
  }
  for (const row of snapshot.products) {
    if (row.deleted_at) continue;
    const drug = snapshot.masters.drugs.find((x) => x.id === row.drug_id),
      form = snapshot.masters.dosage_forms.find((x) => x.id === row.dosage_form_id);
    const generated =
      drug &&
      form?.code === 'TAB' &&
      row.name === drug.name + ' ' + String(row.sequence).padStart(4, '0') &&
      row.unit === 'หน่วย' &&
      Number(row.sale_price) === 0 &&
      row.code.startsWith('MED-TAB-');
    const initial =
      (row.code === 'MED-TAB-0001' && row.name === 'พาราเซตามอล 500 มก. (ตัวอย่าง)') ||
      (row.code === 'MED-CAP-0001' && row.name === 'อะม็อกซีซิลลิน 250 มก. (ตัวอย่าง)');
    if (!generated && !initial) {
      skipped.push({
        table: 'products',
        id: row.id,
        code: row.code,
        reason: 'คงสินค้าที่ผู้ใช้สร้างหรือแก้ไขไว้',
      });
      continue;
    }
    if (initial) {
      propose(
        'products',
        row,
        { name: row.name.replace(' (ตัวอย่าง)', ''), is_sample: false },
        () => true,
      );
      continue;
    }
    let product = drugProducts.find((x) => x[0] === drug.name && x[2] === form.code);
    const values = { is_sample: false };
    if (!product) {
      const replacement =
        drug.name === 'Normal saline'
          ? ['Metformin', 'เมตฟอร์มินชนิดเม็ดสำหรับคลินิก', 'TAB', 'กล่อง', '155.00']
          : ['Paracetamol', 'พาราเซตามอลชนิดเม็ดสำหรับร้านยา', 'TAB', 'กล่อง', '130.00'];
      product = replacement;
      const target = snapshot.masters.drugs.find((x) => x.name === replacement[0]);
      if (!target) throw new Error('Missing replacement drug master');
      values.drug_id = target.id;
    }
    Object.assign(values, { name: product[1], unit: product[3], sale_price: product[4] });
    propose('products', row, values, () => true);
  }
  return {
    task: 'TASK-076',
    project: snapshot.project,
    capturedAt: snapshot.capturedAt,
    changes,
    skipped,
  };
}
const identifierAllowlist = new Set([...modules.map((x) => x.table), 'products', 'warehouses']);
const fieldAllowlist = Object.fromEntries(
  modules.map((m) => [
    m.table,
    new Set(m.fields.map((f) => snake(f.key)).filter((f) => !['code', 'status'].includes(f))),
  ]),
);
fieldAllowlist.products = new Set(['name', 'unit', 'sale_price', 'drug_id', 'is_sample']);
fieldAllowlist.warehouses = new Set(['name']);
const literal = (value) =>
  value === null
    ? 'NULL'
    : typeof value === 'boolean'
      ? String(value)
      : "'" + String(value).replaceAll("'", "''") + "'";
export function refreshSql(plan, { rollback = false } = {}) {
  const statements = [
    'BEGIN;',
    "SET LOCAL lock_timeout = '5s';",
    "SET LOCAL statement_timeout = '30s';",
  ];
  statements.push(`DO $refresh$ DECLARE affected integer; changes integer := 0; BEGIN`);
  for (const change of plan.changes) {
    if (!identifierAllowlist.has(change.table)) throw new Error('Unapproved table');
    const before = rollback ? change.after : change.before,
      after = rollback ? change.before : change.after;
    for (const key of Object.keys(after))
      if (!fieldAllowlist[change.table].has(key)) throw new Error('Unapproved column');
    const guard = rollback ? { code: change.code } : change.guard;
    const condition = Object.entries({ ...before, ...guard })
      .map(([key, value]) => `"${key}" IS NOT DISTINCT FROM ${literal(value)}`)
      .join(' AND ');
    statements.push(
      `UPDATE public."${change.table}" SET ${Object.entries(after)
        .map(([key, value]) => `"${key}"=${literal(value)}`)
        .join(
          ',',
        )}${change.table === 'warehouses' ? '' : ',updated_at=now()'} WHERE id=${literal(change.id)}::uuid AND ${condition}; GET DIAGNOSTICS affected = ROW_COUNT; changes := changes + affected;`,
    );
    const already = Object.entries(after)
      .map(([key, value]) => `"${key}" IS NOT DISTINCT FROM ${literal(value)}`)
      .join(' AND ');
    statements.push(
      `IF affected=0 AND NOT EXISTS(SELECT 1 FROM public."${change.table}" WHERE id=${literal(change.id)}::uuid AND ${already}) THEN RAISE EXCEPTION 'Concurrent edit: ${change.table}/${change.id}'; END IF;`,
    );
  }
  statements.push(
    `IF changes>0 THEN INSERT INTO public.audit_events(id,occurred_at,actor_role,action,request_id,schema_version,"after") VALUES(gen_random_uuid(),now(),'SYSTEM',${literal(rollback ? 'system.seed.realistic_data_rollback' : 'system.seed.realistic_data_refresh')},gen_random_uuid()::text,1,jsonb_build_object('task','TASK-076','changedRows',changes,'stockChanged',false)); END IF; END $refresh$; COMMIT;`,
  );
  return statements.join('\n') + '\n';
}
if (process.argv.includes('--emit')) {
  const before = JSON.parse(fs.readFileSync('scripts/snapshots/TASK-076-before.json', 'utf8'));
  const plan = buildRefreshPlan(before);
  fs.writeFileSync('scripts/snapshots/TASK-076-plan.json', JSON.stringify(plan, null, 2) + '\n');
  fs.writeFileSync('scripts/snapshots/TASK-076-refresh.sql', refreshSql(plan));
  fs.writeFileSync('scripts/snapshots/TASK-076-rollback.sql', refreshSql(plan, { rollback: true }));
  console.log(
    JSON.stringify(
      {
        changes: plan.changes.length,
        byTable: Object.fromEntries(
          [...new Set(plan.changes.map((x) => x.table))].map((t) => [
            t,
            plan.changes.filter((x) => x.table === t).length,
          ]),
        ),
        skipped: plan.skipped.length,
      },
      null,
      2,
    ),
  );
}
