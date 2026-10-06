// TASK-270: builds public/data/thai-address.json from kongvut/thai-province-data (MIT).
// Format: { source, provinces: [[name, [[district, [[subDistrict, zip], ...]], ...]], ...] }
// Run: node scripts/build-thai-address.mjs [localDir]  (downloads api/latest when no dir given)
import fs from 'node:fs';
import path from 'node:path';

const base = 'https://raw.githubusercontent.com/kongvut/thai-province-data/master';
const local = process.argv[2];
async function read(name) {
  if (local) return JSON.parse(fs.readFileSync(path.join(local, name), 'utf8'));
  const response = await fetch(`${base}/api/latest/${name}`);
  if (!response.ok) throw new Error(`Download ${name} failed: ${response.status}`);
  return response.json();
}
const [provinces, districts, subDistricts] = await Promise.all([
  read('province.json'),
  read('district.json'),
  read('sub_district.json'),
]);
const live = (rows) => rows.filter((row) => !row.deleted_at);
const byName = (a, b) => a[0].localeCompare(b[0], 'th');
const result = live(provinces)
  .map((province) => [
    province.name.th,
    live(districts)
      .filter((district) => district.province_id === province.id)
      .map((district) => [
        district.name.th,
        live(subDistricts)
          .filter((sub) => sub.district_id === district.id)
          .map((sub) => [sub.name.th, String(sub.zip_code).padStart(5, '0')])
          .sort(byName),
      ])
      .sort(byName),
  ])
  .sort(byName);
const counts = {
  provinces: result.length,
  districts: result.reduce((n, [, d]) => n + d.length, 0),
  subDistricts: result.reduce((n, [, d]) => n + d.reduce((m, [, s]) => m + s.length, 0), 0),
};
if (counts.provinces !== 77) throw new Error('Expected 77 provinces, got ' + counts.provinces);
fs.mkdirSync('public/data', { recursive: true });
fs.writeFileSync(
  'public/data/thai-address.json',
  JSON.stringify({
    source: 'kongvut/thai-province-data api/latest (MIT) ' + new Date().toISOString().slice(0, 10),
    provinces: result,
  }),
);
const license = local
  ? fs.readFileSync(path.join(local, 'LICENSE.txt'), 'utf8')
  : await (await fetch(`${base}/LICENSE`)).text();
fs.writeFileSync(
  'public/data/thai-address.LICENSE.txt',
  'Thai address data from https://github.com/kongvut/thai-province-data\n\n' + license,
);
console.log(JSON.stringify(counts), fs.statSync('public/data/thai-address.json').size + ' bytes');
