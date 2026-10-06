// TASK-264: sample territories ออก/ตก/ใต้ and 15 fictional customers, written through the real
// service code (validation, code numbering, audit). Safe to re-run: existing rows are skipped.
// Run: node --loader ./scripts/ts-test-loader.mjs scripts/seed-customer-demo.mjs [--dry-run]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';
dotenv.config({ path: '.env.local', quiet: true });
const dryRun = process.argv.includes('--dry-run');
const marker = 'ข้อมูลตัวอย่าง TASK-264';
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    Buffer,
    crypto,
    Date,
    Error,
    File,
    Intl,
    JSON,
    URLSearchParams,
    Uint8Array,
    console,
    process,
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return crypto;
      if (name === '@/generated/prisma/client') return { Prisma };
      if (name === '@/server/db/prisma')
        return { getPrismaClient: () => db, readWithConnectionRetry: (read) => read(db) };
      if (name === './storage')
        return {
          customerStorage: () => {
            throw Error('Seed has no files');
          },
          inspectCustomerFile: () => {
            throw Error('Seed has no files');
          },
        };
      if (name.startsWith('@/')) {
        const base = 'src/' + name.slice(2);
        return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
      }
      if (name.endsWith('.json'))
        return {
          __esModule: true,
          default: JSON.parse(fs.readFileSync(path.resolve(path.dirname(file), name), 'utf8')),
        };
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      throw Error('Unexpected dependency ' + name);
    },
  });
  return exports;
}

const regions = {
  ภาคตะวันออก: ['ชลบุรี', 'ระยอง', 'จันทบุรี', 'ฉะเชิงเทรา', 'ตราด'],
  ภาคตะวันตก: ['กาญจนบุรี', 'ราชบุรี', 'เพชรบุรี', 'ประจวบคีรีขันธ์', 'ตาก'],
  ภาคใต้: ['สงขลา', 'ภูเก็ต', 'สุราษฎร์ธานี', 'นครศรีธรรมราช', 'ตรัง'],
};
// TASK-267: territories first created as ออก/ตก/ใต้ are renamed to the full names.
const previousNames = { ภาคตะวันออก: 'ออก', ภาคตะวันตก: 'ตก', ภาคใต้: 'ใต้' };
const groups = ['PHA', 'PHA', 'CLN', 'HOS', 'WSL', 'GOV'];
const groupNames = {
  PHA: 'ร้านขายยาตัวอย่าง',
  CLN: 'คลินิกตัวอย่าง',
  HOS: 'โรงพยาบาลตัวอย่าง',
  WSL: 'ผู้ค้าส่งตัวอย่าง',
  GOV: 'โรงพยาบาลรัฐตัวอย่าง',
};
const licenseStatuses = ['ผ่าน', 'รอตรวจ', 'ผ่าน', '', 'ต้องแก้เอกสาร'];
const creditLimits = ['', '30000', '50000', '100000', '250000'];

try {
  const admin = await db.user.findFirst({
    where: { deletedAt: null, status: 'ACTIVE', userRole: { is: { roleId: 'ADMIN' } } },
    orderBy: { createdAt: 'asc' },
  });
  if (!admin) throw Error('No active admin to own the seed');
  const options = await db.$queryRaw`SELECT id,kind,code,name,days FROM customer_options WHERE active ORDER BY kind,days,name`;
  const terms = options.filter((o) => o.kind === 'creditTerm');
  const groupId = (code) => options.find((o) => o.kind === 'codeGroup' && o.code === code)?.id;
  const records = load('src/server/records/service.ts');
  const customers = load('src/server/customers/full.ts');

  const territories = {};
  for (const name of Object.keys(regions)) {
    let existing = await db.salesTerritory.findFirst({ where: { name, deletedAt: null } });
    const previous =
      !existing &&
      (await db.salesTerritory.findFirst({ where: { name: previousNames[name], deletedAt: null } }));
    if (previous && !dryRun) {
      await records.recordWrite(
        records.recordModule('sales-territories'),
        'update',
        previous.id,
        { name, expectedUpdatedAt: previous.updatedAt.toISOString() },
        { id: admin.id, roleId: 'ADMIN' },
      );
      console.log(`renamed ${previous.name} -> ${name}`);
      existing = previous;
    } else if (previous) existing = previous;
    if (existing) territories[name] = existing.id;
    else if (dryRun) territories[name] = null;
    else
      territories[name] = (
        await records.recordWrite(
          records.recordModule('sales-territories'),
          'create',
          null,
          { name, notes: marker },
          { id: admin.id, roleId: 'ADMIN' },
        )
      ).data.id;
  }

  const plan = Object.entries(regions).flatMap(([region, provinces], regionIndex) =>
    provinces.map((province, index) => {
      const n = regionIndex * 5 + index + 1;
      const group = groups[n % groups.length];
      return {
        n,
        region,
        group,
        name: `${groupNames[group]} ${province}`,
        province,
      };
    }),
  );
  let created = 0;
  let skipped = 0;
  for (const item of plan) {
    const exists = await db.customer.findFirst({ where: { name: item.name, deletedAt: null } });
    if (exists) {
      skipped++;
      continue;
    }
    if (dryRun) {
      created++;
      continue;
    }
    const pad = String(item.n).padStart(3, '0');
    const expires = new Date(Date.UTC(2025 + (item.n % 4), (item.n * 2) % 12, 15))
      .toISOString()
      .slice(0, 10);
    const data = {
      codeGroupId: groupId(item.group),
      sequence: '',
      fields: {
        name: item.name,
        notes: marker + ' — ไม่ใช่ข้อมูลลูกค้าจริง',
        territoryId: territories[item.region],
        contactName: `ผู้ติดต่อตัวอย่าง ${item.n}`,
        phone: `000-000-0${pad}`,
        email: `customer${pad}@example.com`,
        accountingContactName: `ฝ่ายบัญชีตัวอย่าง ${item.n}`,
        accountingPhone: `000-000-1${pad}`,
        accountingEmail: `account${pad}@example.com`,
        taxId: `0000000000${pad}`,
        vatStatus: item.n % 3 ? 'จดทะเบียน' : 'ไม่จดทะเบียน',
        branchType: item.n % 4 ? 'สำนักงานใหญ่' : 'สาขา',
        branchNumber: item.n % 4 ? '00000' : '00001',
        billingAddress: `${item.n} ถนนตัวอย่าง`,
        billingSubdistrict: 'ตำบลตัวอย่าง',
        billingDistrict: `อำเภอเมือง${item.province}`,
        billingProvince: item.province,
        billingPostcode: '00000',
        licenseType: item.group === 'PHA' ? 'ใบอนุญาตขายยา (ตัวอย่าง)' : 'ใบอนุญาตสถานพยาบาล (ตัวอย่าง)',
        licenseNumber: `ตัวอย่าง-${pad}`,
        licenseLocation: item.name,
        licenseExpiresAt: expires,
        licenseStatus: licenseStatuses[item.n % licenseStatuses.length],
        licenseVerifiedBy: '',
        licenseVerifiedAt: '',
        profession: item.group === 'PHA' || item.group === 'WSL' ? 'เภสัชกร' : 'แพทย์',
        professionalName: `ผู้ประกอบวิชาชีพตัวอย่าง ${item.n}`,
        professionalLicenseNumber: `ตัวอย่าง-ว-${pad}`,
        creditTermId: terms[item.n % terms.length]?.id ?? '',
        creditLimit: creditLimits[item.n % creditLimits.length],
        billingCycle: item.n % 2 ? 'ทุกสิ้นเดือน' : 'ทุกวันที่ 25',
        creditStartId: '',
      },
      shippingAddresses: [
        {
          id: crypto.randomUUID(),
          isDefault: true,
          name: `${item.name} (ส่งสินค้า)`,
          recipientName: `ผู้รับสินค้าตัวอย่าง ${item.n}`,
          recipientPhone: `000-000-2${pad}`,
          address: `${item.n} ถนนตัวอย่าง`,
          subdistrict: 'ตำบลตัวอย่าง',
          district: `อำเภอเมือง${item.province}`,
          province: item.province,
          postcode: '00000',
        },
      ],
      files: [],
    };
    const requestId = crypto.randomUUID();
    await customers.beginCustomerRequest(requestId, data, admin.id);
    const result = await customers.commitCustomerRequest(requestId, admin.id);
    console.log(`${result.code}  ${item.name}  (${item.region})`);
    created++;
  }
  console.log(
    JSON.stringify({
      mode: dryRun ? 'dry-run' : 'applied',
      territories,
      customersCreated: created,
      customersSkipped: skipped,
    }),
  );
} finally {
  await db.$disconnect();
}
