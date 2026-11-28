import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });
const dryRun = process.argv.includes('--dry-run');
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK268-customer-status'))");
  const before = (await db.query('SELECT count(*)::int AS total FROM customers')).rows[0].total;
  await db.query(
    await fs.readFile('prisma/migrations/20261007_customer_status/migration.sql', 'utf8'),
  );
  const after = (await db.query('SELECT count(*)::int AS total FROM customers')).rows[0].total;
  if (before !== after) throw new Error('Customer count changed');
  const security = (
    await db.query(
      "SELECT bool_and(relrowsecurity) AS rls, bool_or(has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT')) AS client FROM pg_class WHERE oid IN ('public.customer_create_requests'::regclass,'public.customer_files'::regclass)",
    )
  ).rows[0];
  if (!security.rls || security.client) throw new Error('Request/file table security check failed');
  const statuses = (
    await db.query(
      'SELECT status,count(*)::int AS total FROM customers WHERE details IS NOT NULL GROUP BY status',
    )
  ).rows;
  await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
  console.log(JSON.stringify({ statuses }));
  console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', customers: after, security }));
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
