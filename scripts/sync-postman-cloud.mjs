// Push postman/Zuugroup.postman_collection.json to the existing Zuugroup Cloud collection.
// Needs POSTMAN_API_KEY in .env.local (never printed). `--dry-run` only compares local vs Cloud.
// Before writing, the current Cloud copy is saved to local-backups/ (not tracked by Git).
import fs from 'node:fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ path: '.env', quiet: true });

const dryRun = process.argv.includes('--dry-run');
const key = process.env.POSTMAN_API_KEY;
if (!key) {
  console.error('ยังไม่มี POSTMAN_API_KEY ใน .env.local');
  process.exit(1);
}
const remote = JSON.parse(fs.readFileSync('postman/Zuugroup.remote.json', 'utf8'));
const local = JSON.parse(fs.readFileSync('postman/Zuugroup.postman_collection.json', 'utf8'));
const url = `https://api.getpostman.com/collections/${remote.uid}`;
const headers = { 'X-Api-Key': key, 'Content-Type': 'application/json' };

async function call(method, body) {
  const response = await fetch(url, { method, headers, body: body && JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      `Postman ${method} ${response.status}: ${data?.error?.message ?? 'ไม่ทราบสาเหตุ'}`,
    );
  return data;
}
// Folder name → request count, for a quick local/Cloud comparison.
const summary = (collection) =>
  Object.fromEntries(collection.item.map((entry) => [entry.name, entry.item?.length ?? 0]));

const before = (await call('GET')).collection;
console.log('Cloud ก่อน:', JSON.stringify(summary(before)));
console.log('Local     :', JSON.stringify(summary(local)));
if (dryRun) process.exit(0);

fs.mkdirSync('local-backups', { recursive: true });
const backup = `local-backups/postman-cloud-before-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
fs.writeFileSync(backup, JSON.stringify(before, null, 2));
console.log('สำรอง Cloud เดิม:', backup);

// Keep the Cloud identity; everything else comes from the local file.
await call('PUT', {
  collection: { ...local, info: { ...local.info, _postman_id: before.info._postman_id } },
});
const after = (await call('GET')).collection;
const expected = JSON.stringify(summary(local));
console.log('Cloud หลัง:', JSON.stringify(summary(after)));
if (JSON.stringify(summary(after)) !== expected) {
  console.error('จำนวนโฟลเดอร์/คำขอบน Cloud ไม่ตรงกับไฟล์ local');
  process.exit(1);
}
console.log('Sync สำเร็จ: Cloud ตรงกับไฟล์ local');
