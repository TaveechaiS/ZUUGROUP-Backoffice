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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM expenses) AS expenses,(SELECT count(*)::int FROM expense_files) AS files,(SELECT count(*)::int FROM users) AS users`;
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
            if (name === '@/server/customers/storage')
              return {
                customerStorage: () => ({
                  upload: async (key) => {
                    stored.add(key);
                    return { error: null };
                  },
                  remove: async (keys) => {
                    for (const key of keys) stored.delete(key);
                    return { error: null };
                  },
                  download: async (key) =>
                    stored.has(key)
                      ? { data: new Blob(['%PDF-1.4 test']), error: null }
                      : { data: null, error: Error('missing') },
                }),
                inspectCustomerFile: (bytes) => {
                  if (Buffer.from(bytes.subarray(0, 5)).toString('ascii') !== '%PDF-')
                    throw Error('ชนิดไฟล์ไม่รองรับ');
                  return 'application/pdf';
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
      const stored = new Set();
      const exp = load('src/server/expenses/service.ts');
      const { expensesHandler } = load('src/server/expenses/handler.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T282-' + key().slice(0, 8);
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
      const cfo = await user('ACCOUNTING_CFO', 'CFO');
      const [category] =
        await tx.$queryRaw`SELECT id FROM customer_options WHERE kind='expenseCategory' AND active ORDER BY name LIMIT 1`;
      const base = (extra = {}) => ({
        idempotencyKey: key(),
        name: 'ค่าน้ำมัน ' + prefix,
        expenseDate: today,
        categoryId: category.id,
        amount: '1250.50',
        payee: 'ปั๊ม ' + prefix,
        ...extra,
      });
      const read = async (id) => (await exp.expenseRead(admin, new URLSearchParams(), id)).data;
      const list = (params = {}) =>
        exp.expenseRead(admin, new URLSearchParams({ search: prefix, ...params }));

      let expenseId;
      await test('Admin/CFO บันทึกได้ EX ปี พ.ศ.; Sales บันทึกไม่ได้', async () => {
        const created = await exp.expenseWrite(admin, base());
        expenseId = created.data.id;
        assert.match(created.data.code, /^EX-25\d\d-\d{4}$/);
        const row = await read(expenseId);
        assert.equal(row.status, 'บันทึกแล้ว');
        assert.equal(row.amount, '1250.50');
        assert.equal(row.createdByName, admin.name);
        await exp.expenseWrite(cfo, base({ amount: '100' }));
        await rejects(() => exp.expenseWrite(sales, base()), 403);
      });

      await test('ตรวจข้อมูล: วันที่อนาคต, จำนวนเงิน 0, หมวดไม่ใช่ค่าใช้จ่าย, ไม่มีรายการ', async () => {
        await rejects(() => exp.expenseWrite(admin, base({ expenseDate: addDays(today, 1) })), 400);
        await rejects(() => exp.expenseWrite(admin, base({ amount: '0' })), 400);
        const [other] =
          await tx.$queryRaw`SELECT id FROM customer_options WHERE kind<>'expenseCategory' LIMIT 1`;
        await rejects(() => exp.expenseWrite(admin, base({ categoryId: other.id })), 400);
        await rejects(() => exp.expenseWrite(admin, base({ name: '' })), 400);
      });

      await test('รายการกรองช่วงวันที่/หมวด/สถานะ และรวมยอดเฉพาะที่บันทึกแล้ว', async () => {
        const all = await list();
        assert.equal(all.pagination.total, 2);
        assert.equal(all.totalAmount, '1350.50');
        assert.ok(all.categories.some((item) => item.id === category.id));
        const past = await list({ from: addDays(today, -30), to: addDays(today, -1) });
        assert.equal(past.pagination.total, 0);
        await rejects(() => list({ status: 'มั่ว' }), 400);
      });

      await test('แก้ไขได้; ข้อมูลเก่า 409; ยกเลิกต้องมีเหตุผลและไม่นับยอด; ยกเลิกแล้วแก้ไม่ได้', async () => {
        const before = await read(expenseId);
        await exp.expenseWrite(
          admin,
          base({
            action: 'edit',
            amount: '900',
            expectedUpdatedAt: before.updatedAt.toISOString?.() ?? before.updatedAt,
          }),
          expenseId,
        );
        assert.equal((await read(expenseId)).amount, '900.00');
        await rejects(
          () =>
            exp.expenseWrite(
              admin,
              base({ action: 'edit', expectedUpdatedAt: '2000-01-01T00:00:00.000Z' }),
              expenseId,
            ),
          409,
        );
        const cancel = (extra) =>
          exp.expenseWrite(admin, { idempotencyKey: key(), action: 'cancel', ...extra }, expenseId);
        await rejects(() => cancel({}), 400);
        await cancel({ reason: 'บันทึกซ้ำ' });
        assert.equal((await read(expenseId)).status, 'ยกเลิก');
        assert.equal((await list()).totalAmount, '100.00');
        await rejects(() => exp.expenseWrite(admin, base({ action: 'edit' }), expenseId), 409);
      });

      await test('แนบไฟล์ PDF ได้ อ่านกลับได้; ไฟล์ผิดชนิด 400; ค่าใช้จ่ายยกเลิกแล้วแนบไม่ได้', async () => {
        const id = (await exp.expenseWrite(admin, base())).data.id;
        const pdf = new File(['%PDF-1.4 test'], 'receipt.pdf', { type: 'application/pdf' });
        const uploaded = await exp.uploadExpenseFile(admin, id, pdf);
        assert.equal(uploaded.data.name, 'receipt.pdf');
        assert.equal((await read(id)).files.length, 1);
        const file = await exp.readExpenseFile(uploaded.data.id);
        assert.equal(file.file.type, 'application/pdf');
        await rejects(
          () =>
            exp.uploadExpenseFile(admin, id, new File(['hello'], 'a.txt', { type: 'text/plain' })),
          400,
        );
        await rejects(() => exp.uploadExpenseFile(sales, id, pdf), 403);
        await rejects(() => exp.uploadExpenseFile(admin, expenseId, pdf), 409);
      });

      await test('Handler: 401 ไม่ login, Sales อ่านไม่ได้ (TASK-290), DELETE = ยกเลิก', async () => {
        const request = (method, body, params = {}) => ({
          method,
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        identity = null;
        assert.equal((await expensesHandler(request('GET'))).status, 401);
        identity = await tx.user.findUnique({
          where: { id: sales.id },
          include: { userRole: true },
        });
        assert.equal(
          (await expensesHandler(request('GET', undefined, { search: prefix }))).status,
          403,
        );
        identity = await tx.user.findUnique({
          where: { id: admin.id },
          include: { userRole: true },
        });
        const id = (await exp.expenseWrite(admin, base())).data.id;
        const ok = await expensesHandler(
          request('DELETE', { idempotencyKey: key(), reason: 'ทดสอบ' }),
          { expenseId: id },
        );
        assert.equal(ok.status, 200);
        assert.equal((await read(id)).status, 'ยกเลิก');
      });

      await test('expense_files เปิด RLS และ client ไม่มีสิทธิ์', async () => {
        const [row] =
          await tx.$queryRaw`SELECT relrowsecurity AS rls, has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT') AS client FROM pg_class WHERE oid='public.expense_files'::regclass`;
        assert.equal(row.rls, true);
        assert.equal(row.client, false);
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
