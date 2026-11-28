import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not configured');
const connection = new URL(connectionString);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const target = hash(JSON.stringify([connection.hostname, connection.port, connection.pathname, connection.username]));
const protectedNames = new Set(['users', 'auth_accounts', 'user_roles', 'roles', 'permissions', 'role_permissions']);
const kept = (name) => protectedNames.has(name) || /(^_|schema_)?migrations$/.test(name);
const quote = (value) => '"' + value.replaceAll('"', '""') + '"';
const tableSql = (name) => `public.${quote(name)}`;
const backupRoot = path.resolve('local-backups');
const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const client = new pg.Client({ connectionString, connectionTimeoutMillis: 15000 });
let inTransaction = false;

async function tables() {
  return (await client.query("SELECT c.relname AS name FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname")).rows.map((row) => row.name);
}
async function counts(names) {
  const result = {};
  for (const name of names) result[name] = (await client.query(`SELECT count(*)::text AS count FROM ${tableSql(name)}`)).rows[0].count;
  return result;
}
async function snapshots(names) {
  const result = {};
  for (const name of names) {
    result[name] = (await client.query(`SELECT coalesce(json_agg(t ORDER BY to_jsonb(t)::text),'[]'::json)::text AS data FROM ${tableSql(name)} t`)).rows[0].data;
  }
  return result;
}
async function checkBoundaries(deleteNames) {
  const incoming = (await client.query(`SELECT sn.nspname AS source_schema, s.relname AS source_table, tn.nspname AS target_schema, t.relname AS target_table, c.conname
    FROM pg_constraint c JOIN pg_class s ON s.oid=c.conrelid JOIN pg_namespace sn ON sn.oid=s.relnamespace
    JOIN pg_class t ON t.oid=c.confrelid JOIN pg_namespace tn ON tn.oid=t.relnamespace WHERE c.contype='f' AND tn.nspname='public'`)).rows;
  const blocked = incoming.filter((fk) => deleteNames.includes(fk.target_table) && (fk.source_schema !== 'public' || !deleteNames.includes(fk.source_table)));
  if (blocked.length) throw new Error('Protected/external FK references reset tables: ' + blocked.map((row) => row.conname).join(','));
  const truncateTriggers = (await client.query("SELECT c.relname AS name FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal AND (t.tgtype::int & 32)<>0")).rows;
  if (truncateTriggers.some((row) => deleteNames.includes(row.name))) throw new Error('Unexpected TRUNCATE trigger');
  const externalChildren = (await client.query("SELECT p.relname AS parent FROM pg_inherits i JOIN pg_class p ON p.oid=i.inhparent JOIN pg_namespace pn ON pn.oid=p.relnamespace JOIN pg_class c ON c.oid=i.inhrelid JOIN pg_namespace cn ON cn.oid=c.relnamespace WHERE pn.nspname='public' AND cn.nspname<>'public'")).rows;
  if (externalChildren.some((row) => deleteNames.includes(row.parent))) throw new Error('External inherited table');
}

try {
  await client.connect();
  const names = await tables();
  if (!protectedNames.size || [...protectedNames].some((name) => !names.includes(name))) throw new Error('Expected user tables are missing');
  const preserveNames = names.filter(kept);
  const deleteNames = names.filter((name) => !kept(name));
  if (!deleteNames.length) throw new Error('No business tables found');
  await checkBoundaries(deleteNames);
  fs.mkdirSync(backupRoot, { recursive: true });
  const applyIndex = process.argv.indexOf('--apply');
  if (applyIndex < 0) {
    const manifest = { version: 1, target, host: connection.hostname, createdAt: new Date().toISOString(), preserveNames, deleteNames, counts: await counts(names) };
    const manifestPath = path.join(backupRoot, `TASK-116-${stamp}-inspection.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), { flag: 'wx' });
    console.log(JSON.stringify({ mode: 'READ_ONLY_INSPECTION', manifestPath, ...manifest }, null, 2));
  } else {
    const manifestPath = path.resolve(process.argv[applyIndex + 1] ?? '');
    if (!manifestPath.startsWith(backupRoot + path.sep)) throw new Error('Manifest must be inside local-backups');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.target !== target || JSON.stringify(manifest.deleteNames) !== JSON.stringify(deleteNames) || JSON.stringify(manifest.preserveNames) !== JSON.stringify(preserveNames)) throw new Error('Target or table list changed');
    await client.query('BEGIN');
    inTransaction = true;
    await client.query("SET LOCAL lock_timeout='10s'");
    await client.query("SET LOCAL statement_timeout='60s'");
    await client.query(`LOCK TABLE ${names.map(tableSql).join(', ')} IN ACCESS EXCLUSIVE MODE`);
    await checkBoundaries(deleteNames);
    const beforeCounts = await counts(names);
    const data = await snapshots(names);
    const sequences = (await client.query("SELECT * FROM pg_sequences WHERE schemaname='public' ORDER BY sequencename")).rows;
    const backup = JSON.stringify({ version: 1, target, createdAt: new Date().toISOString(), preserveNames, deleteNames, counts: beforeCounts, sequences, data });
    const backupPath = path.join(backupRoot, `TASK-116-${stamp}-before-reset.json`);
    fs.writeFileSync(backupPath, backup, { flag: 'wx' });
    if (hash(fs.readFileSync(backupPath)) !== hash(backup)) throw new Error('Backup verification failed');
    await client.query(`TRUNCATE TABLE ${deleteNames.map(tableSql).join(', ')} RESTART IDENTITY RESTRICT`);
    const afterCounts = await counts(names);
    if (deleteNames.some((name) => afterCounts[name] !== '0')) throw new Error('Business table is not empty');
    const afterProtected = await snapshots(preserveNames);
    if (preserveNames.some((name) => hash(data[name]) !== hash(afterProtected[name]))) throw new Error('Protected data changed');
    if (JSON.stringify(await tables()) !== JSON.stringify(names)) throw new Error('Table list changed during reset');
    await client.query('COMMIT');
    inTransaction = false;
    const readback = await counts(names);
    const protectedReadback = await snapshots(preserveNames);
    const verified = deleteNames.every((name) => readback[name] === '0') && preserveNames.every((name) => hash(data[name]) === hash(protectedReadback[name]));
    const result = { mode: 'RESET_COMMITTED', verified, backupPath, backupSha256: hash(backup), beforeCounts, afterCounts: readback, preservedHashes: Object.fromEntries(preserveNames.map((name) => [name, hash(data[name])])) };
    const resultPath = path.join(backupRoot, `TASK-116-${stamp}-result.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), { flag: 'wx' });
    console.log(JSON.stringify({ ...result, resultPath }, null, 2));
    if (!verified) process.exitCode = 2;
  }
} catch (error) {
  if (inTransaction) await client.query('ROLLBACK').catch(() => {});
  console.error('Reset failed:', error.code ?? error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
