import fs from 'node:fs';
import dotenv from 'dotenv';
import pg from 'pg';
import { refreshSql } from './realistic-refresh-plan.mjs';
dotenv.config({ path: '.env.local', quiet: true });
const modes = process.argv.slice(2);
if (modes.length !== 1 || !['--apply', '--rollback', '--dry-run'].includes(modes[0]))
  throw new Error('เลือก --dry-run, --apply หรือ --rollback เพียงอย่างเดียว');
const plan = JSON.parse(fs.readFileSync('scripts/snapshots/TASK-076-plan.json', 'utf8'));
const target = new URL(process.env.DATABASE_URL ?? '');
if (
  !target.hostname.includes(plan.project) &&
  !decodeURIComponent(target.username).includes(plan.project)
)
  throw new Error('DATABASE_URL ไม่ใช่ project ของ snapshot');
let sql = refreshSql(plan, { rollback: modes[0] === '--rollback' });
if (modes[0] === '--dry-run') sql = sql.replace(/COMMIT;\n$/, 'ROLLBACK;\n');
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
try {
  await client.connect();
  await client.query(sql);
  console.log('TASK-076 ' + modes[0] + ' สำเร็จ');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('TASK-076 ไม่สำเร็จ:', error.code ?? error.name);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
