import fs from 'node:fs/promises';
import pg from 'pg';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: '.env.local', quiet: true });
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await db.connect();
  const before = (
    await db.query(
      "SELECT jsonb_build_object('products',(SELECT jsonb_agg(to_jsonb(p)) FROM products p),'stock',(SELECT jsonb_agg(to_jsonb(b)) FROM stock_balances b),'indexes',(SELECT jsonb_agg(to_jsonb(i)) FROM pg_indexes i WHERE tablename='products')) AS snapshot",
    )
  ).rows[0].snapshot;
  await fs.mkdir('local-backups', { recursive: true });
  await fs.writeFile(
    'local-backups/TASK-177-before-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json',
    JSON.stringify(before, null, 2),
  );
  await db.query('BEGIN');
  const migration = await fs.readFile(
    'prisma/migrations/20261006_product_full/migration.sql',
    'utf8',
  );
  // Names on older migrations varied. Only replace this exact legacy unique index.
  const indexes = (
    await db.query(
      "SELECT indexname FROM pg_indexes WHERE tablename='products' AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%(category_id, dosage_form_id, sequence)%' AND indexdef NOT LIKE '% WHERE %'",
    )
  ).rows;
  for (const { indexname } of indexes)
    await db.query('DROP INDEX public."' + indexname.replaceAll('"', '""') + '"');
  await db.query(migration);
  const after = (
    await db.query(
      'SELECT count(*)::int AS products,(SELECT coalesce(sum(quantity),0)::int FROM stock_balances) AS quantity FROM products',
    )
  ).rows[0];
  if (
    after.products !== (before.products?.length ?? 0) ||
    after.quantity !== (before.stock ?? []).reduce((s, b) => s + b.quantity, 0)
  )
    throw Error('Existing counts changed');
  if (process.argv.includes('--dry-run')) await db.query('ROLLBACK');
  else {
    const storage = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    ).storage;
    const settings = {
      public: false,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    };
    const { data } = await storage.getBucket('product-attachments');
    const { error } = data
      ? await storage.updateBucket('product-attachments', settings)
      : await storage.createBucket('product-attachments', settings);
    if (error) throw Error('Private bucket setup failed: ' + error.message);
    await db.query('COMMIT');
  }
  console.log(
    JSON.stringify({ mode: process.argv.includes('--dry-run') ? 'dry-run' : 'applied', ...after }),
  );
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
