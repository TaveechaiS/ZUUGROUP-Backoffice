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
      'SELECT (SELECT count(*)::int FROM expenses) AS expenses,(SELECT count(*)::int FROM customers) AS customers',
    )
  ).rows[0];
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK282-expenses'))");
  const before = await counts();
  await db.query(await fs.readFile('prisma/migrations/20261014_expenses/migration.sql', 'utf8'));
  const after = await counts();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Row counts changed');
  const security = (
    await db.query(
      "SELECT c.relname AS table, c.relrowsecurity AS rls, has_table_privilege('anon',c.oid,'SELECT') OR has_table_privilege('authenticated',c.oid,'SELECT') AS client FROM pg_class c WHERE c.oid IN ('public.expense_files'::regclass)",
    )
  ).rows;
  if (security.some((row) => !row.rls || row.client))
    throw new Error('expense_files security check failed');
  await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
  const categories = (
    await db.query("SELECT count(*)::int AS n FROM customer_options WHERE kind='expenseCategory'")
  ).rows[0].n;
  console.log(
    JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', ...after, categories, security }),
  );
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
