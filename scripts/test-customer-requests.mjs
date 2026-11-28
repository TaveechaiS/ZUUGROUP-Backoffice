import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';
dotenv.config({ path: '.env.local', quiet: true });
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const rollback = Error('ROLLBACK_TEST');
const counts = () =>
  db.$queryRaw`SELECT (SELECT count(*)::int FROM customer_create_requests) AS requests,(SELECT count(*)::int FROM customers) AS customers,(SELECT count(*)::int FROM users) AS users`;
const baseline = (await counts())[0];
let passed = 0;
try {
  await db.$transaction(
    async (tx) => {
      const cache = new Map();
      let identity = null;
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
          Date,
          Error,
          Intl,
          JSON,
          URLSearchParams,
          Response,
          Headers,
          File,
          Blob,
          Buffer,
          console,
          process,
          require(name) {
            if (name === 'server-only') return {};
            if (name === 'node:crypto') return crypto;
            if (name === '@/generated/prisma/client') return { Prisma };
            if (name === '@/server/db/prisma')
              return {
                getPrismaClient: () =>
                  new Proxy(tx, {
                    get: (target, key) =>
                      key === '$transaction'
                        ? (fn) => fn(tx)
                        : typeof target[key] === 'function'
                          ? target[key].bind(target)
                          : target[key],
                  }),
              };
            if (name === '@/server/auth/current-user')
              return { getCurrentApiUser: async () => identity };
            if (name === '@/server/auth/api-authorization') return { hasSameOrigin: () => true };
            if (name === '@supabase/supabase-js')
              return {
                createClient: () => {
                  throw Error('storage not used');
                },
              };
            if (name.startsWith('@/')) {
              const base = 'src/' + name.slice(2);
              return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
            }
            if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
            throw Error('Unexpected dependency ' + name);
          },
        });
        return exports;
      }
      const full = load('src/server/customers/full.ts');
      const req = load('src/server/customers/requests.ts');
      const { customerRequestsHandler } = load('src/server/customers/request-handler.ts');
      const key = () => crypto.randomUUID();
      const prefix = 'T288-' + key().slice(0, 8);
      async function savepoint(fn) {
        await tx.$executeRawUnsafe('SAVEPOINT module_test');
        try {
          return await fn();
        } finally {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT module_test');
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT module_test');
        }
      }
      const rejects = (fn, status) =>
        savepoint(() => assert.rejects(fn, (e) => e.status === status || assert.fail(e.message)));
      async function test(name, fn) {
        await fn();
        passed++;
        console.log('PASS: ' + name);
      }

      const user = async (role, tag = role) => {
        const id = key();
        await tx.user.create({
          data: {
            id,
            employeeCode: prefix + tag,
            email: `${prefix}${tag}@example.invalid`,
            name: `${tag} ทดสอบ ${prefix}`,
            userRole: { create: { roleId: role } },
          },
        });
        return { id, name: `${tag} ทดสอบ ${prefix}`, roleId: role };
      };
      const admin = await user('ADMIN'),
        sales = await user('SALES');
      const manager = await user('MANAGER');
      const [group] =
        await tx.$queryRaw`SELECT id FROM customer_options WHERE kind='codeGroup' AND active ORDER BY name LIMIT 1`;
      const draft = (name, taxId) => ({
        codeGroupId: group.id,
        sequence: '',
        fields: {
          name,
          contactName: 'ผู้ติดต่อ',
          phone: '02-111-' + taxId.slice(-4),
          email: 'req@example.com',
          accountingContactName: 'บัญชี',
          accountingPhone: '02-111-0001',
          accountingEmail: 'acc@example.com',
          taxId,
          vatStatus: 'จดทะเบียน',
          branchType: 'สำนักงานใหญ่',
          billingAddress: '1 ถนนทดสอบ',
          billingSubdistrict: 'แขวง',
          billingDistrict: 'เขต',
          billingProvince: 'จังหวัด',
          billingPostcode: '10000',
        },
        shippingAddresses: [],
        files: [],
      });
      const start = async (actor, name, taxId) => {
        const id = key();
        await full.beginCustomerRequest(id, draft(name, taxId), actor.id);
        return id;
      };
      const read = async (actor, id) => (await req.customerRequestDetail(actor, id)).data;

      let approvedId;
      await test('Sales/Manager ส่งคำขอได้ → รอตรวจสอบ; Admin ส่งคำขอแบบนี้ไม่ได้', async () => {
        approvedId = await start(
          sales,
          prefix + ' ร้านขอ',
          '0105559' + prefix.slice(-6).replace(/\D/g, '1').padEnd(6, '1'),
        );
        const sent = await req.submitCustomerRequest(approvedId, sales);
        assert.equal(sent.status, 'รอตรวจสอบ');
        assert.equal((await read(sales, approvedId)).status, 'รอตรวจสอบ');
        const byManager = await start(manager, prefix + ' ร้าน Manager', '0105559222222');
        await req.submitCustomerRequest(byManager, manager);
        await rejects(() => req.submitCustomerRequest(byManager, admin), 403);
      });

      await test('รายการ: Sales เห็นเฉพาะของตน; Admin เห็นทั้งหมด; คำขอที่ Admin สร้างตรงไม่อยู่ในรายการ', async () => {
        const mine = await req.customerRequestList(sales, new URLSearchParams({ search: prefix }));
        assert.equal(mine.pagination.total, 1);
        const all = await req.customerRequestList(admin, new URLSearchParams({ search: prefix }));
        assert.equal(all.pagination.total, 2);
        await rejects(() => req.customerRequestDetail(manager, approvedId), 404);
      });

      await test('Admin อนุมัติ → สร้างลูกค้า สถานะอนุมัติแล้ว; อนุมัติซ้ำไม่ได้', async () => {
        const result = await req.reviewCustomerRequest(approvedId, admin, { action: 'approve' });
        assert.equal(result.status, 'อนุมัติแล้ว');
        const row = await read(admin, approvedId);
        assert.equal(row.status, 'อนุมัติแล้ว');
        assert.ok(row.customerCode);
        const [customer] =
          await tx.$queryRaw`SELECT name FROM customers WHERE id=${row.customerId}::uuid`;
        assert.equal(customer.name, prefix + ' ร้านขอ');
        await rejects(
          () => req.reviewCustomerRequest(approvedId, admin, { action: 'approve' }),
          409,
        );
        await rejects(
          () => req.reviewCustomerRequest(approvedId, sales, { action: 'approve' }),
          403,
        );
      });

      await test('ส่งกลับ/ไม่อนุมัติต้องมีเหตุผล และไม่สร้างลูกค้า', async () => {
        const back = await start(sales, prefix + ' ร้านส่งกลับ', '0105559333333');
        await req.submitCustomerRequest(back, sales);
        await rejects(() => req.reviewCustomerRequest(back, admin, { action: 'return' }), 400);
        await req.reviewCustomerRequest(back, admin, { action: 'return', reason: 'เลขภาษีไม่ครบ' });
        const returned = await read(sales, back);
        assert.equal(returned.status, 'ส่งกลับแก้ไข');
        assert.equal(returned.reviewReason, 'เลขภาษีไม่ครบ');
        assert.equal(returned.customerCode, null);
        const no = await start(sales, prefix + ' ร้านไม่อนุมัติ', '0105559444444');
        await req.submitCustomerRequest(no, sales);
        await req.reviewCustomerRequest(no, admin, { action: 'reject', reason: 'ซ้ำ' });
        assert.equal((await read(admin, no)).status, 'ไม่อนุมัติ');
      });

      await test('Handler: 401, Sales PATCH submit ได้ แต่ approve ไม่ได้', async () => {
        const request = (method, body, params = {}) => ({
          method,
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        identity = null;
        assert.equal((await customerRequestsHandler(request('GET'))).status, 401);
        identity = await tx.user.findUnique({
          where: { id: sales.id },
          include: { userRole: true },
        });
        const id = await start(sales, prefix + ' ร้าน API', '0105559555555');
        assert.equal(
          (await customerRequestsHandler(request('PATCH', { action: 'submit' }), id)).status,
          200,
        );
        assert.equal(
          (await customerRequestsHandler(request('PATCH', { action: 'approve' }), id)).status,
          403,
        );
      });
      await test('TASK-296 คำขอลูกค้า: ช่วงวันที่ส่งคำขอ (เวลาไทย) และช่วงผิด 400', async () => {
        const day = (offset) => {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() + offset);
          return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(d);
        };
        const today = day(0);
        const read = (p) =>
          req.customerRequestList(admin, new URLSearchParams({ search: prefix, ...p }));
        const total = (await read({})).pagination.total;
        assert.ok(total >= 2);
        assert.equal((await read({ from: today, to: today })).pagination.total, total);
        assert.equal((await read({ from: day(1) })).pagination.total, 0);
        assert.equal((await read({ to: day(-1) })).pagination.total, 0);
        await rejects(() => read({ from: today, to: day(-1) }), 400);
        await rejects(() => read({ to: '2026-99-01' }), 400);
      });

      throw rollback;
    },
    { timeout: 180000, maxWait: 10000 },
  );
} catch (error) {
  if (error !== rollback) {
    console.error('Test failed:', error.stack ?? error.message);
    process.exitCode = 1;
  } else console.log(`Completed ${passed} checks; database changes rolled back.`);
} finally {
  const after = (await counts())[0];
  assert.deepEqual(after, baseline);
  console.log('Row counts unchanged:', JSON.stringify(after));
  await db.$disconnect();
}
