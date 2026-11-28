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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM customer_follow_ups) AS "followUps",(SELECT count(*)::int FROM customers) AS customers,(SELECT count(*)::int FROM users) AS users`;
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
      const fu = load('src/server/follow-ups/service.ts');
      const { followUpsHandler } = load('src/server/follow-ups/handler.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T286-' + key().slice(0, 8);
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
      const otherSales = await user('SALES', 'SALES2');
      const [territory] =
        await tx.$queryRaw`INSERT INTO sales_territories(code,name,manager_id) VALUES(${prefix},${prefix},${manager.id}::uuid) RETURNING id`;
      for (const member of [sales, otherSales])
        await tx.$executeRaw`INSERT INTO sales_territory_sales(territory_id,user_id) VALUES(${territory.id}::uuid,${member.id}::uuid)`;
      const customerId = key();
      await tx.customer.create({
        data: {
          id: customerId,
          code: prefix,
          name: 'ลูกค้าทดสอบ ' + prefix,
          territoryId: territory.id,
        },
      });
      const base = (extra = {}) => ({
        idempotencyKey: key(),
        customerId,
        name: 'เสนอสินค้า ' + prefix,
        contactedOn: today,
        channel: 'โทร',
        nextOn: addDays(today, 7),
        summary: 'สนใจ',
        ...extra,
      });
      const read = async (id) => (await fu.followUpRead(admin, new URLSearchParams(), id)).data;
      const list = (status) =>
        fu.followUpRead(admin, new URLSearchParams({ search: prefix, status }));
      const act = (actor, id, action, extra = {}) =>
        fu.followUpWrite(actor, { idempotencyKey: key(), action, ...extra }, id);

      let followUpId;
      await test('Sales/Manager/Admin บันทึกได้ FU ปี พ.ศ. สถานะรอติดตาม; CFO บันทึกไม่ได้', async () => {
        const created = await fu.followUpWrite(sales, base());
        followUpId = created.data.id;
        assert.match(created.data.code, /^FU-25\d\d-\d{4}$/);
        const row = await read(followUpId);
        assert.equal(row.status, 'รอติดตาม');
        assert.equal(row.customerName, 'ลูกค้าทดสอบ ' + prefix);
        await fu.followUpWrite(manager, base());
        const cfo = await user('ACCOUNTING_CFO', 'CFO');
        await rejects(() => fu.followUpWrite(cfo, base()), 403);
      });

      await test('ตรวจข้อมูล: วันติดต่ออนาคต, นัดก่อนวันติดต่อ, ช่องทางผิด', async () => {
        await rejects(() => fu.followUpWrite(admin, base({ contactedOn: addDays(today, 1) })), 400);
        await rejects(() => fu.followUpWrite(admin, base({ nextOn: addDays(today, -1) })), 400);
        await rejects(() => fu.followUpWrite(admin, base({ channel: 'แฟกซ์' })), 400);
      });

      await test('แท็บครบนัดวันนี้/เกินนัดคำนวณจากวันนัด', async () => {
        const dueToday = (await fu.followUpWrite(admin, base({ nextOn: today }))).data.id;
        const overdue = (
          await fu.followUpWrite(
            admin,
            base({ contactedOn: addDays(today, -5), nextOn: addDays(today, -1) }),
          )
        ).data.id;
        assert.equal((await read(dueToday)).status, 'ครบนัดวันนี้');
        assert.equal((await read(overdue)).status, 'เกินนัด');
        assert.ok((await list('เกินนัด')).data.some((r) => r.id === overdue));
        assert.ok((await list('ครบนัดวันนี้')).data.some((r) => r.id === dueToday));
        assert.ok((await list('รอติดตาม')).data.some((r) => r.id === overdue));
        await rejects(() => list('มั่ว'), 400);
      });

      await test('Sales คนอื่นแก้ไม่ได้; ปิดต้องมีผล; ปิดแล้วแก้ไม่ได้; ยกเลิกต้องมีเหตุผล', async () => {
        await rejects(() => act(otherSales, followUpId, 'done', { result: 'x' }), 403);
        await rejects(() => act(sales, followUpId, 'done'), 400);
        const before = await read(followUpId);
        await act(sales, followUpId, 'edit', {
          ...base({ name: 'แก้แล้ว ' + prefix }),
          expectedUpdatedAt: before.updatedAt.toISOString?.() ?? before.updatedAt,
        });
        assert.equal((await read(followUpId)).name, 'แก้แล้ว ' + prefix);
        await act(sales, followUpId, 'done', { result: 'สั่งซื้อแล้ว' });
        const done = await read(followUpId);
        assert.equal(done.status, 'เสร็จแล้ว');
        assert.equal(done.result, 'สั่งซื้อแล้ว');
        await rejects(() => act(admin, followUpId, 'edit', base()), 409);
        const other = (await fu.followUpWrite(admin, base())).data.id;
        await rejects(() => act(admin, other, 'cancel'), 400);
        await act(admin, other, 'cancel', { reason: 'ลูกค้าไม่สะดวก' });
        assert.equal((await read(other)).status, 'ยกเลิก');
      });

      await test('Handler: 401 ไม่ login, 200 เมื่อ login, 404', async () => {
        const request = (method, body, params = {}) => ({
          method,
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        identity = null;
        assert.equal((await followUpsHandler(request('GET'))).status, 401);
        identity = await tx.user.findUnique({
          where: { id: sales.id },
          include: { userRole: true },
        });
        assert.equal(
          (await followUpsHandler(request('GET', undefined, { search: prefix }))).status,
          200,
        );
        assert.equal((await followUpsHandler(request('GET'), 'FU-0000-0000')).status, 404);
      });
      await test('TASK-296 ติดตามลูกค้า: ช่องทาง ช่วงวันที่ติดต่อ และค่าผิด 400', async () => {
        const read = (p) => fu.followUpRead(admin, new URLSearchParams({ search: prefix, ...p }));
        const total = (await read({})).pagination.total;
        assert.ok(total >= 2);
        const first = (await read({})).data[0].id;
        const old = addDays(today, -4);
        await tx.$executeRaw`UPDATE customer_follow_ups SET channel='LINE',contacted_on=${old}::date WHERE id=${first}::uuid`;
        assert.deepEqual(
          (await read({ channel: 'LINE' })).data.map((r) => r.id),
          [first],
        );
        assert.equal((await read({ channel: 'โทร' })).pagination.total, total - 1);
        assert.equal((await read({ channel: '' })).pagination.total, total);
        await rejects(() => read({ channel: 'แฟกซ์' }), 400);
        assert.equal((await read({ from: old, to: old })).data[0].id, first);
        assert.equal((await read({ to: addDays(old, -1) })).pagination.total, 0);
        assert.equal((await read({ from: addDays(old, 1) })).pagination.total, total - 1);
        await rejects(() => read({ from: today, to: old }), 400);
        await rejects(() => read({ from: 'x' }), 400);
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
