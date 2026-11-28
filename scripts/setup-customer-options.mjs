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
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK262-customer-options'))");
  await db.query(
    await fs.readFile('prisma/migrations/20261006_customer_options/migration.sql', 'utf8'),
  );
  const counts = (
    await db.query(
      'SELECT kind,count(*)::int AS total FROM customer_options GROUP BY kind ORDER BY kind',
    )
  ).rows;
  const security = (
    await db.query(
      "SELECT relrowsecurity AS rls, has_table_privilege('anon','public.customer_options','SELECT') AS anon, has_table_privilege('authenticated','public.customer_options','SELECT') AS authenticated FROM pg_class WHERE oid='public.customer_options'::regclass",
    )
  ).rows[0];
  if (!security.rls || security.anon || security.authenticated)
    throw new Error('customer_options security check failed');
  await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
  console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', counts, security }));
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
