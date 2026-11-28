import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config({ path: '.env.local', quiet: true });
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK151-product-options'))");
  await db.query(
    await fs.readFile('prisma/migrations/20261005_product_options/migration.sql', 'utf8'),
  );
  const beforeCount = (await db.query('SELECT count(*)::int AS total FROM product_options')).rows[0]
    .total;
  for (const [kind, table, code] of [
    ['category', 'product_categories', 'code'],
    ['dosageForm', 'dosage_forms', 'code'],
    ['ingredient', 'drugs', 'NULL'],
  ]) {
    await db.query(
      `INSERT INTO product_options(id,kind,name,code,legacy) SELECT id,$1,name,${code},true FROM ${table} ON CONFLICT DO NOTHING`,
      [kind],
    );
  }
  const data = {
    codeGroup: [
      ['MED', 'ยาแผนปัจจุบัน'],
      ['HER', 'สมุนไพร'],
      ['SUP', 'เวชภัณฑ์'],
    ],
    codeFormat: [
      ['TAB', 'ยาเม็ด'],
      ['CAP', 'แคปซูล'],
      ['SYR', 'น้ำเชื่อม'],
      ['OTH', 'อื่น ๆ'],
    ],
    productType: ['ยา', 'สมุนไพร', 'อาหารเสริม', 'เครื่องสำอาง', 'เครื่องมือแพทย์'],
    brand: ['แบรนด์ตัวอย่าง A', 'แบรนด์ตัวอย่าง B'],
    manufacturer: ['บริษัทผู้ผลิตตัวอย่าง A', 'บริษัทผู้ผลิตตัวอย่าง B'],
    legalType: ['ยังไม่ระบุ / รอตรวจสอบ'],
    unit: ['เม็ด', 'แคปซูล', 'ขวด', 'กล่อง', 'หลอด', 'ซอง', 'ชิ้น', 'ลัง'],
  };
  for (const [kind, values] of Object.entries(data)) {
    for (const value of values) {
      const [code, name] = Array.isArray(value) ? value : [null, value];
      await db.query(
        'INSERT INTO product_options(kind,name,code) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [kind, name, code],
      );
    }
  }
  const rows = (
    await db.query(
      'SELECT kind,count(*)::int AS total FROM product_options GROUP BY kind ORDER BY kind',
    )
  ).rows;
  const added = rows.reduce((sum, row) => sum + row.total, 0) - beforeCount;
  if (added > 0) {
    await db.query(
      'INSERT INTO audit_events(id,actor_role,action,request_id,after) VALUES($1,$2,$3,$4,$5::jsonb)',
      [
        randomUUID(),
        'SYSTEM',
        'PRODUCT_OPTIONS_SEEDED',
        randomUUID(),
        JSON.stringify({ added, groups: rows }),
      ],
    );
  }
  await db.query(process.argv.includes('--dry-run') ? 'ROLLBACK' : 'COMMIT');
  console.log(
    JSON.stringify({
      mode: process.argv.includes('--dry-run') ? 'rolled back' : 'committed',
      groups: rows,
    }),
  );
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  console.error('Setup failed:', error.code ?? error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
