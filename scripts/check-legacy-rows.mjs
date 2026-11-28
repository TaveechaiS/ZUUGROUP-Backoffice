import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local', quiet: true });
const checks = [
  ['invoices', 'sales_order_id', 'deleted_at IS NULL'],
  ['invoices', 'issue_date', 'deleted_at IS NULL'],
  ['invoices', 'due_date', 'deleted_at IS NULL'],
  ['invoices', 'created_by_id', 'deleted_at IS NULL'],
  ['customer_follow_ups', 'contacted_on', 'deleted_at IS NULL'],
  ['customer_follow_ups', 'created_by_id', 'deleted_at IS NULL'],
  ['expenses', 'expense_date', 'deleted_at IS NULL'],
  ['expenses', 'category_id', 'deleted_at IS NULL'],
  ['expenses', 'created_by_id', 'deleted_at IS NULL'],
];
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});
await client.connect();
let problems = 0;
try {
  for (const [table, column, scope] of checks) {
    const { rows } = await client.query(
      `SELECT count(*)::int AS total FROM public.${table} WHERE ${column} IS NULL AND ${scope}`,
    );
    problems += rows[0].total;
    console.log(`${rows[0].total ? 'FOUND' : 'OK   '} ${table}.${column} NULL: ${rows[0].total}`);
  }
} finally {
  await client.end();
}
console.log(
  problems
    ? `FAIL: ${problems} legacy rows need backfill before deploy`
    : 'PASS: no legacy rows missing 20261014 columns',
);
process.exitCode = problems ? 1 : 0;
