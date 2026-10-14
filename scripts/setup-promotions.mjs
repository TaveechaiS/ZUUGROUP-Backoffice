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
      'SELECT (SELECT count(*)::int FROM promotions) AS promotions,(SELECT count(*)::int FROM products) AS products',
    )
  ).rows[0];
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK278-promotions'))");
  const before = await counts();
  await db.query(await fs.readFile('prisma/migrations/20261014_promotions/migration.sql', 'utf8'));
  const after = await counts();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Row counts changed');
  const security = (
    await db.query(
      "SELECT c.relname AS table, c.relrowsecurity AS rls, has_table_privilege('anon',c.oid,'SELECT') OR has_table_privilege('authenticated',c.oid,'SELECT') AS client FROM pg_class c WHERE c.oid IN ('public.promotion_products'::regclass,'public.promotion_gifts'::regclass)",
    )
  ).rows;
  if (security.some((row) => !row.rls || row.client))
    throw new Error('promotion tables security check failed');
  await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
  console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', ...after, security }));
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
