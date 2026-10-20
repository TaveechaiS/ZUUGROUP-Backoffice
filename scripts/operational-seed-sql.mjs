import fs from 'node:fs';
import {
  businessRecord,
  categories,
  forms,
  drugNames,
  drugProducts,
  warehouseNames,
  prefixes,
} from './seed-business-catalog.mjs';
const modules = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
const quote = (value) => (value == null ? 'NULL' : "'" + String(value).replaceAll("'", "''") + "'");
const snake = (value) => value.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
export function operationalSeedSql() {
  const sql = [
    'BEGIN;',
    "SET LOCAL lock_timeout = '5s';",
    "SET LOCAL statement_timeout = '30s';",
    `LOCK TABLE ${[...modules.map((m) => 'public."' + m.table + '"'), 'public.products', 'public.product_categories', 'public.dosage_forms', 'public.drugs', 'public.warehouses'].join(',')} IN SHARE ROW EXCLUSIVE MODE;`,
  ];
  for (const [table, rows] of [
    ['product_categories', categories],
    ['dosage_forms', forms],
    [
      'warehouses',
      warehouseNames.map((name, i) => ['WH-INIT-' + String(i + 1).padStart(2, '0'), name]),
    ],
  ]) {
    sql.push(
      `INSERT INTO public.${table}(id,code,name) SELECT gen_random_uuid(),v.code,v.name FROM (VALUES ${rows.map(([code, name]) => '(' + quote(code) + ',' + quote(name) + ')').join(',')}) v(code,name) WHERE NOT EXISTS(SELECT 1 FROM public.${table} t WHERE t.code=v.code OR t.name=v.name) ON CONFLICT DO NOTHING;`,
    );
  }
  sql.push(
    `INSERT INTO public.drugs(id,name) VALUES ${drugNames.map((name) => '(gen_random_uuid(),' + quote(name) + ')').join(',')} ON CONFLICT(name) DO NOTHING;`,
  );
  const priority = (key) =>
    ['customer-groups', 'sales-territories', 'suppliers', 'customers'].includes(key)
      ? ['customer-groups', 'sales-territories', 'suppliers', 'customers'].indexOf(key)
      : 10;
  for (const m of [...modules].sort((a, b) => priority(a.key) - priority(b.key))) {
    const rows = Array.from({ length: 15 }, (_, index) => businessRecord(m.key, index));
    const nativeFields = m.fields.filter((f) => !f.relation);
    const values = rows
      .map(
        (row, index) =>
          '(' + [index, ...nativeFields.map((f) => quote(row[f.key] ?? ''))].join(',') + ')',
      )
      .join(',');
    const projection = m.fields.map((f) => {
      if (!f.relation)
        return f.type === 'number' ? `nullif(v."${f.key}",'')::numeric` : `v."${f.key}"`;
      const target =
        f.relation === 'warehouses'
          ? 'warehouses'
          : (modules.find((x) => x.key === f.relation)?.table ?? f.relation);
      const prefix = f.relation === 'warehouses' ? 'WH' : prefixes[f.relation],
        width = f.relation === 'warehouses' ? 2 : 3,
        active = f.relation === 'warehouses' ? 'true' : 'deleted_at IS NULL';
      return `coalesce((SELECT id FROM public."${target}" WHERE code=${quote(prefix + '-INIT-')}||lpad((v.position+1)::text,${width},'0') AND ${active}),(SELECT id FROM public."${target}" WHERE ${active} ORDER BY code OFFSET (v.position%greatest(1,(SELECT count(*)::int FROM public."${target}" WHERE ${active}))) LIMIT 1))`;
    });
    sql.push(
      `INSERT INTO public."${m.table}"(id,${m.fields.map((f) => '"' + snake(f.key) + '"').join(',')}) SELECT gen_random_uuid(),${projection.join(',')} FROM (VALUES ${values}) v(position,${nativeFields.map((f) => '"' + f.key + '"').join(',')}) WHERE NOT EXISTS(SELECT 1 FROM public."${m.table}" existing WHERE existing.code=v.code OR existing.name=v.name) ORDER BY v.position LIMIT greatest(0,15-(SELECT count(*)::int FROM public."${m.table}" WHERE deleted_at IS NULL)) ON CONFLICT(code) DO NOTHING;`,
    );
  }
  sql.push(`DO $products$ DECLARE entry jsonb; cat uuid; form uuid; drug uuid; warehouse uuid; seq integer; BEGIN
 SELECT id INTO cat FROM public.product_categories WHERE code='MED'; SELECT id INTO warehouse FROM public.warehouses WHERE code='MAIN'; IF warehouse IS NULL THEN SELECT id INTO warehouse FROM public.warehouses ORDER BY code LIMIT 1; END IF;
 FOR entry IN SELECT value FROM jsonb_array_elements(${quote(JSON.stringify(drugProducts))}::jsonb) LOOP
 EXIT WHEN (SELECT count(*) FROM public.products WHERE deleted_at IS NULL)>=15;
 CONTINUE WHEN EXISTS(SELECT 1 FROM public.products WHERE name=entry->>1);
 SELECT id INTO form FROM public.dosage_forms WHERE code=entry->>2; SELECT id INTO drug FROM public.drugs WHERE name=entry->>0;
 SELECT coalesce(max(sequence),0)+1 INTO seq FROM public.products WHERE category_id=cat AND dosage_form_id=form;
 IF seq>9999 THEN RAISE EXCEPTION 'Product sequence exhausted'; END IF;
 INSERT INTO public.products(id,code,sequence,name,category_id,dosage_form_id,drug_id,default_warehouse_id,unit,sale_price,status,is_sample,updated_at) VALUES(gen_random_uuid(),'MED-'||(entry->>2)||'-'||lpad(seq::text,4,'0'),seq,entry->>1,cat,form,drug,warehouse,entry->>3,(entry->>4)::numeric,'ACTIVE',false,now());
 END LOOP; END $products$;`);
  sql.push('COMMIT;');
  sql.push(
    'SELECT ' +
      [
        ...modules.map(
          (m) =>
            `(SELECT count(*)::int FROM public."${m.table}" WHERE deleted_at IS NULL) AS "${m.key}"`,
        ),
        `(SELECT count(*)::int FROM public.products WHERE deleted_at IS NULL) products`,
      ].join(',') +
      ';',
  );
  return sql.join('\n') + '\n';
}
