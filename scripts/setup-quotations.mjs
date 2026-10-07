// TASK-275: apply the quotation workflow migration. `--dry-run` rolls back after the checks.
import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });
const dryRun = process.argv.includes('--dry-run');
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const counts = async () =>
  (
    await db.query(
      'SELECT (SELECT count(*)::int FROM quotations) AS quotations,(SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM sales_order_lines) AS "orderLines"',
    )
  ).rows[0];
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK275-quotations'))");
  const before = await counts();
  await db.query(await fs.readFile('prisma/migrations/20261007_quotations/migration.sql', 'utf8'));
  const after = await counts();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Row counts changed');
  const security = (
    await db.query(
      "SELECT relrowsecurity AS rls, has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT') AS client FROM pg_class WHERE oid='public.quotation_lines'::regclass",
    )
  ).rows[0];
  if (!security.rls || security.client) throw new Error('quotation_lines security check failed');
  await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
  console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', ...after, security }));
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
