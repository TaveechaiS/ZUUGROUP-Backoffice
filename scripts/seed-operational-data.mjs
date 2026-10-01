import fs from 'node:fs';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({path:'.env.local',quiet:true});
const modules=JSON.parse(fs.readFileSync('src/features/records/modules.json','utf8'));
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
const snake=value=>value.replace(/[A-Z]/g,c=>'_'+c.toLowerCase());
const categories=[['MED','ยาแผนปัจจุบัน'],['HER','ยาสมุนไพร'],['SUP','เวชภัณฑ์'],['VIT','วิตามิน'],['NUT','ผลิตภัณฑ์โภชนาการ'],['COS','ผลิตภัณฑ์ดูแลผิว'],['DEN','ทันตกรรม'],['LAB','อุปกรณ์ห้องปฏิบัติการ'],['EQP','เครื่องมือแพทย์'],['SAN','ผลิตภัณฑ์ทำความสะอาด'],['REH','อุปกรณ์ฟื้นฟู'],['PED','ผลิตภัณฑ์สำหรับเด็ก'],['VET','เวชภัณฑ์สัตว์'],['WND','อุปกรณ์ดูแลแผล'],['GEN','ผลิตภัณฑ์ทั่วไป']];
const forms=[['TAB','ยาเม็ด'],['CAP','แคปซูล'],['SYR','น้ำเชื่อม'],['INJ','ยาฉีด'],['CRM','ครีม'],['GEL','เจล'],['OIN','ขี้ผึ้ง'],['DRP','ยาหยด'],['SPR','สเปรย์'],['PWD','ผง'],['SOL','สารละลาย'],['SUS','ยาน้ำแขวนตะกอน'],['SUP','ยาเหน็บ'],['PAD','แผ่น'],['DEV','อุปกรณ์']];
const drugs=['Paracetamol','Cetirizine','Loratadine','Ibuprofen','Amoxicillin','Omeprazole','Metformin','Amlodipine','Losartan','Atorvastatin','Vitamin C','Calcium carbonate','Zinc sulfate','Oral rehydration salts','Normal saline'];
const warehouses=Array.from({length:15},(_,i)=>['WH-INIT-'+String(i+1).padStart(2,'0'),'คลัง '+String(i+1).padStart(2,'0')]);
const sql=['BEGIN;',`LOCK TABLE ${[...modules.map(m=>'"'+m.table+'"'),'products','product_categories','dosage_forms','drugs','warehouses'].join(',')} IN SHARE ROW EXCLUSIVE MODE;`];
for(const [table,rows]of [['product_categories',categories],['dosage_forms',forms],['warehouses',warehouses]])sql.push(`INSERT INTO ${table}(id,code,name) SELECT gen_random_uuid(),v.code,v.name FROM (VALUES ${rows.map(([c,n])=>'('+quote(c)+','+quote(n)+')').join(',')}) v(code,name) WHERE NOT EXISTS(SELECT 1 FROM ${table} t WHERE t.code=v.code OR t.name=v.name) ON CONFLICT DO NOTHING;`);
sql.push(`INSERT INTO drugs(id,name) VALUES ${drugs.map(name=>'(gen_random_uuid(),'+quote(name)+')').join(',')} ON CONFLICT(name) DO NOTHING;`);
const prefixes={'customers':'CUS','customer-groups':'GRP','sales-territories':'TER','customer-documents':'DOC','customer-follow-ups':'FUP','suppliers':'SUP','expenses':'EXP','purchases':'PO','quotes':'QT','orders':'SO','billing':'INV','promotions':'PRM','stock-counts':'CNT','settings':'SET'};
const priority=m=>['customer-groups','sales-territories','suppliers','customers'].indexOf(m.key);
const ordered=[...modules].sort((a,b)=>(priority(a)<0?10:priority(a))-(priority(b)<0?10:priority(b)));
for(const m of ordered){
 const code=`${quote(prefixes[m.key]+'-INIT-')}||lpad(n::text,3,'0')`;
 const select=['gen_random_uuid()'];
 for(const f of m.fields){let value="''";
  if(f.key==='code')value=code;
  else if(f.key==='name')value=quote(m.key==='customers'?'องค์กรลูกค้า ':m.key==='suppliers'?'ผู้ขาย ':m.key==='customer-groups'?'กลุ่มลูกค้า ':m.title+' ')+'||lpad(n::text,3,\'0\')';
  else if(f.key==='status')value=quote(['customers','customer-groups','sales-territories','suppliers','promotions','settings'].includes(m.key)?'ใช้งานอยู่':'ร่าง');
  else if(f.key==='amount')value='NULL';
  else if(f.relation){const target=f.relation==='warehouses'?'warehouses':modules.find(d=>d.key===f.relation).table;const active=f.relation==='warehouses'?'':'WHERE deleted_at IS NULL';value=`(SELECT id FROM "${target}" ${active} ORDER BY code OFFSET ((n-1)%greatest(1,(SELECT count(*)::int FROM "${target}" ${active}))) LIMIT 1)`;}
  else if(f.key==='category')value=quote(m.key==='customers'?'องค์กร':m.key==='expenses'?'ค่าใช้จ่ายทั่วไป':m.key==='suppliers'?'ผู้จำหน่าย':m.key==='settings'?'ข้อมูลทั่วไป':'ทั่วไป');
  else if(['province','location'].includes(f.key))value=quote('กรุงเทพมหานคร');
  else if(f.key==='documentType')value=quote('ข้อมูลลูกค้า');
  else if(f.key==='followUpText')value=quote('รอบันทึกข้อมูลติดตาม');
  select.push(value);
 }
 sql.push(`INSERT INTO "${m.table}"(id,${m.fields.map(f=>'"'+snake(f.key)+'"').join(',')}) SELECT ${select.join(',')} FROM (SELECT n FROM generate_series(1,10000) n WHERE NOT EXISTS(SELECT 1 FROM "${m.table}" existing WHERE existing.code=${code}) ORDER BY n LIMIT greatest(0,15-(SELECT count(*)::int FROM "${m.table}" WHERE deleted_at IS NULL))) candidates ON CONFLICT(code) DO NOTHING;`);
}
sql.push(`DO $seed$ DECLARE i integer; cat_id uuid; cat_code text; form_id uuid; form_code text; drug_id uuid; drug_name text; warehouse_id uuid; seq integer; missing integer; BEGIN
 SELECT id,code INTO cat_id,cat_code FROM product_categories WHERE code='MED';
 SELECT id,code INTO form_id,form_code FROM dosage_forms WHERE code='TAB';
 SELECT id INTO warehouse_id FROM warehouses ORDER BY code LIMIT 1;
 SELECT greatest(0,15-count(*)::int) INTO missing FROM products WHERE deleted_at IS NULL;
 FOR i IN 1..missing LOOP
 SELECT id,name INTO drug_id,drug_name FROM drugs ORDER BY name OFFSET ((i-1)%(SELECT count(*)::int FROM drugs)) LIMIT 1;
 SELECT coalesce(max(sequence),0)+1 INTO seq FROM products WHERE category_id=cat_id AND dosage_form_id=form_id;
 IF seq>9999 THEN RAISE EXCEPTION 'Product sequence exhausted'; END IF;
 INSERT INTO products(id,code,sequence,name,category_id,dosage_form_id,drug_id,default_warehouse_id,unit,sale_price,status,is_sample,updated_at) VALUES(gen_random_uuid(),cat_code||'-'||form_code||'-'||lpad(seq::text,4,'0'),seq,drug_name||' '||lpad(seq::text,4,'0'),cat_id,form_id,drug_id,warehouse_id,'หน่วย',0,'ACTIVE',false,now());
 END LOOP;
 END $seed$;`);
sql.push(`INSERT INTO audit_events(id,occurred_at,actor_role,action,request_id,schema_version,"after") VALUES(gen_random_uuid(),now(),'SYSTEM','system.seed.initial_records',gen_random_uuid()::text,1,jsonb_build_object('targetRows',15,'modules',${modules.length},'stockChanged',false));`);
sql.push('COMMIT;');
sql.push('SELECT '+[...modules.map(m=>`(SELECT count(*)::int FROM "${m.table}" WHERE deleted_at IS NULL) AS "${m.key}"`),`(SELECT count(*)::int FROM products WHERE deleted_at IS NULL) products`,`(SELECT count(*)::int FROM product_categories) categories`,`(SELECT count(*)::int FROM dosage_forms) dosage_forms`,`(SELECT count(*)::int FROM drugs) drugs`,`(SELECT count(*)::int FROM warehouses) warehouses`].join(',')+';');
const query=sql.join('\n')+'\n';
if(process.argv.includes('--emit')){fs.writeFileSync('scripts/seed-operational-data.sql',query);console.log('Prepared initial records SQL.');}
else {const client=new pg.Client({connectionString:process.env.DATABASE_URL});try{await client.connect();const result=await client.query(query);console.log(result.at(-1).rows[0]);}catch(error){await client.query('ROLLBACK').catch(()=>{});console.error('Seed failed:',error.code??error.name);process.exitCode=1;}finally{await client.end();}}
