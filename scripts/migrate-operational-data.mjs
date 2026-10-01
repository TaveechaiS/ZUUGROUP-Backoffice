// Emits idempotent SQL using current DB rows. It does not overwrite existing business records.
import fs from 'node:fs';
const modules=JSON.parse(fs.readFileSync('src/features/records/modules.json','utf8'));
const snake=s=>s.replace(/[A-Z]/g,c=>'_'+c.toLowerCase());
const q=s=>"'"+s.replaceAll("'","''")+"'";
const clean=s=>`btrim(regexp_replace(${s},'\\s*\\(ตัวอย่าง\\)|ข้อมูลตัวอย่าง|ตัวอย่าง|Mock|Demo','', 'gi'))`;
const first="btrim(split_part(r.subtitle,'·',1))";
const rest="btrim(regexp_replace(r.subtitle,'^[^·]*·?',''))";
const amount="CASE WHEN r.value ~ '^฿[[:space:]]*[0-9,]+(\\.[0-9]{1,2})?$' THEN replace(regexp_replace(r.value,'[^0-9,.]','','g'),',','')::numeric ELSE NULL END";
const sql=['BEGIN;'];
for(const m of [...modules].sort((a,b)=> (a.key==='customers'?-1:b.key==='customers'?1:0))){
 const cols=['id',...m.fields.map(f=>snake(f.key))];
 const select=['r.id'];
 for(const f of m.fields){let expr="''";
  if(f.key==='code')expr='r.ref';else if(f.key==='name')expr=clean('r.title');else if(f.key==='status')expr=`coalesce(nullif(${clean('r.status')},''),'บันทึกแล้ว')`;
  else if(f.key==='category'||f.key==='documentType')expr=clean(first);
  else if(['province','location'].includes(f.key))expr=clean(rest);
  else if(['owner','contact'].includes(f.key))expr=clean('r.owner');
  else if(['paymentTerms','conditions','resultText','value','dateText','followUpText'].includes(f.key))expr=clean('r.value');
  else if(['description','dueText','area'].includes(f.key))expr=clean('r.subtitle');
  else if(f.key==='amount')expr=amount;
  else if(f.relation){const t=modules.find(d=>d.key===f.relation);expr=f.relation==='customers'?"(SELECT c.id FROM customers c WHERE c.code=r.ref OR c.name=r.title ORDER BY c.code LIMIT 1)":t?`(SELECT c.id FROM "${t.table}" c WHERE c.name=r.title ORDER BY c.code LIMIT 1)`:'NULL';}
  select.push(expr);
 }
 let source=`demo_rows r WHERE r.dataset_key=${q(m.page.slice(1))}`;
 if(m.key==='customers')source="(SELECT DISTINCT ON (ref) * FROM demo_rows WHERE dataset_key IN ('customers','customers/list','customers/dashboard') ORDER BY ref,CASE dataset_key WHEN 'customers' THEN 1 WHEN 'customers/list' THEN 2 ELSE 3 END) r";
 sql.push(`INSERT INTO "${m.table}" (${cols.map(c=>'"'+c+'"').join(',')}) SELECT ${select.join(',')} FROM ${source} ON CONFLICT(code) DO NOTHING;`);
 sql.push(`INSERT INTO record_import_map(source_id,source_module,entity,record_id) SELECT r.id,r.dataset_key,${q(m.key)},t.id FROM demo_rows r JOIN "${m.table}" t ON t.code=r.ref WHERE r.dataset_key=${q(m.page.slice(1))} ON CONFLICT(source_id) DO NOTHING;`);
}
sql.push("INSERT INTO record_import_map(source_id,source_module,entity,record_id) SELECT r.id,r.dataset_key,'customers',t.id FROM demo_rows r JOIN customers t ON t.code=r.ref WHERE r.dataset_key='customers/list' ON CONFLICT(source_id) DO NOTHING;");
sql.push("COMMIT;");
sql.push('SELECT '+modules.map(m=>`(SELECT count(*)::int FROM "${m.table}") AS "${m.key}"`).join(',')+';');
fs.writeFileSync('scripts/operational-import.sql',sql.join('\n')+'\n');
console.log('Prepared SQL for 14 domain tables.');
