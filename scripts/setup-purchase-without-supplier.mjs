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
      'SELECT (SELECT count(*)::int FROM suppliers) AS suppliers,(SELECT count(*)::int FROM purchase_orders) AS "purchaseOrders",(SELECT count(*)::int FROM stock_receipts) AS receipts',
    )
  ).rows[0];
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK277-without-supplier'))");
  const before = await counts();
  await db.query(
    await fs.readFile('prisma/migrations/20261014_purchase_without_supplier/migration.sql', 'utf8'),
  );
  const after = await counts();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Row counts changed');
  const check = (
    await db.query(
      "SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname='purchase_orders_status'",
    )
  ).rows[0].def;
  if (check.includes('supplier_id')) throw new Error('supplier_id still required');
  await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
  console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'applied', ...after, check }));
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.end();
}
