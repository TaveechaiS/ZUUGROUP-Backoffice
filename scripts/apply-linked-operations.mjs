import fs from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
try {
  await client.connect();
  if (process.argv.includes('--apply')) {
    const sql = fs.readFileSync(
      'prisma/migrations/20261003_linked_operations/migration.sql',
      'utf8',
    );
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='10s'");
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended('TASK-092-schema',0))");
    const exists = (await client.query("SELECT to_regclass('public.product_lots') AS name")).rows[0]
      .name;
    if (!exists) {
      fs.mkdirSync('local-backups', { recursive: true });
      const before = await client.query(
        "SELECT 'territories' AS entity,to_jsonb(t) AS data FROM sales_territories t UNION ALL SELECT 'customers',to_jsonb(c) FROM customers c",
      );
      fs.writeFileSync('local-backups/TASK-092-before.json', JSON.stringify(before.rows, null, 2));
      await client.query(sql);
      const tracked = (
        await client.query("SELECT to_regclass('public._prisma_migrations') AS name")
      ).rows[0].name;
      if (tracked)
        await client.query(
          'INSERT INTO public._prisma_migrations(id,checksum,finished_at,migration_name,started_at,applied_steps_count) VALUES($1,$2,now(),$3,now(),1)',
          [
            randomUUID(),
            createHash('sha256').update(sql).digest('hex'),
            '20261003_linked_operations',
          ],
        );
    }
    await client.query('COMMIT');
    console.log(
      exists ? 'Migration already present.' : 'Migration applied; local pre-change backup saved.',
    );
  }
  const meta = await client.query(
    "SELECT to_regclass('public.product_lots') IS NOT NULL AS ready,(SELECT count(*)::int FROM sales_territories WHERE code IN ('ZONE-N','ZONE-E','ZONE-W','ZONE-S')) AS starter_territories,(SELECT count(*)::int FROM users WHERE deleted_at IS NULL) AS users",
  );
  console.log(meta.rows[0]);
  const warehouses = await client.query('SELECT code,name FROM warehouses ORDER BY code');
  console.log(warehouses.rows);
  const migrations = await client.query(
    "SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS prisma_history",
  );
  console.log(migrations.rows[0]);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('Database operation failed:', error.code ?? error.name);
  process.exitCode = 1;
} finally {
  await client.end();
}
