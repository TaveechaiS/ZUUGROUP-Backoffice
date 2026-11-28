import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import pg from 'pg';

config({ path: '.env.local', quiet: true });
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const sql = await readFile(
  fileURLToPath(new URL('./seed-product-master.sql', import.meta.url)),
  'utf8',
);
try {
  await client.connect();
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  const { rows } = await client.query(
    'SELECT code, name FROM public.products WHERE code = ANY($1::text[]) ORDER BY code',
    [['MED-TAB-0001', 'MED-CAP-0001']],
  );
  console.log(`Initial products available: ${rows.length}`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await client.end().catch(() => {});
}
