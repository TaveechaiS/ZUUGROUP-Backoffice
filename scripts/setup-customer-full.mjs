import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });
const dryRun = process.argv.includes('--dry-run');
const bucket = 'customer-attachments';
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK263-customer-full'))");
  const before = (await db.query('SELECT count(*)::int AS total FROM customers')).rows[0].total;
  await db.query(
    await fs.readFile('prisma/migrations/20261006_customer_full/migration.sql', 'utf8'),
  );
  const after = (await db.query('SELECT count(*)::int AS total FROM customers')).rows[0].total;
  if (before !== after) throw new Error('Customer count changed');
  const security = (
    await db.query(
      "SELECT bool_and(relrowsecurity) AS rls, bool_or(has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT')) AS client FROM pg_class WHERE oid IN ('public.customer_create_requests'::regclass,'public.customer_files'::regclass)",
    )
  ).rows[0];
  if (!security.rls || security.client) throw new Error('Request/file table security check failed');
  if (dryRun) await db.query('ROLLBACK');
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
    const { data } = await storage.getBucket(bucket);
    const { error } = data
      ? await storage.updateBucket(bucket, settings)
      : await storage.createBucket(bucket, settings);
    if (error) throw new Error('Private bucket setup failed: ' + error.message);
    await db.query('COMMIT');
  }
  console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', customers: after, security }));
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
