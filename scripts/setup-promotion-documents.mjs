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
      'SELECT (SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM sales_order_lines) AS "orderLines",(SELECT count(*)::int FROM quotations) AS quotes,(SELECT count(*)::int FROM quotation_lines) AS "quoteLines"',
    )
  ).rows[0];
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK285-promotion-documents'))");
  const before = await counts();
  await db.query(
    await fs.readFile('prisma/migrations/20261014_promotion_documents/migration.sql', 'utf8'),
  );
  const after = await counts();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Row counts changed');
  const gifts = (await db.query('SELECT count(*)::int AS n FROM sales_order_lines WHERE is_gift'))
    .rows[0].n;
  if (gifts) throw new Error('unexpected gift lines');
  await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
  console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', ...after }));
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
