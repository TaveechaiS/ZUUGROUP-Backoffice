import fs from 'node:fs';
import pg from 'pg';
import dotenv from 'dotenv';
import { operationalSeedSql } from './operational-seed-sql.mjs';
dotenv.config({ path: '.env.local', quiet: true });
const query = operationalSeedSql();
if (process.argv.includes('--emit')) {
  fs.writeFileSync('scripts/seed-operational-data.sql', query);
  console.log('Prepared business seed SQL.');
} else {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });
  try {
    await client.connect();
    const result = await client.query(query);
    console.log(result.at(-1).rows[0]);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Seed failed:', error.code ?? error.name);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}
