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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM stock_count_sessions) AS sessions,(SELECT count(*)::int FROM stock_count_lines) AS lines,(SELECT count(*)::int FROM users) AS users`;
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
      const sc = load('src/server/stock-counts/service.ts');
      const ops = load('src/server/operations/service.ts');
      const reportsInventory = load('src/server/reports/inventory.ts');
      const key = () => crypto.randomUUID();
      const prefix = 'T289-' + key().slice(0, 8);
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
      const template = await tx.product.findFirst({ where: { deletedAt: null } });
      assert.ok(template, 'ต้องมี master สินค้า');
      const free = (
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZS-ZS-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZS-ZS-${String(free[n - 1]).padStart(4, '0')}`,
            sequence: free[n - 1],
            name: `${prefix} สินค้า ${n}`,
            categoryId: template.categoryId,
            dosageFormId: template.dosageFormId,
            drugId: template.drugId,
            defaultWarehouseId: template.defaultWarehouseId,
            unit: 'กล่อง',
            salePrice: '100',
          },
        });
        return id;
      };
      const p1 = await product(1),
        p2 = await product(2);
      const marketing = (await tx.warehouse.findUnique({ where: { code: 'MARKETING' } })).id;
      const disposal = (await tx.warehouse.findUnique({ where: { code: 'DISPOSAL' } })).id;
      await tx.$executeRaw`UPDATE stock_balances SET quantity=0,reserved=0 WHERE warehouse_id=${disposal}::uuid`;
      const receive = async (productId, quantity) =>
        ops.inventoryWrite(admin, {
          action: 'receive',
          idempotencyKey: key(),
          code: (await ops.operationOptions(admin)).data.nextReceiptCode,
          lots: [
            {
              productId,
              warehouseId: disposal,
              quantity,
              totalCost: '10',
              manufacturedOn: '2026-01-01',
              expiresOn: '2029-01-01',
            },
          ],
        });
      await receive(p1, 10);
      await receive(p2, 5);
      const read = async (id) => (await sc.stockCountRead(admin, new URLSearchParams(), id)).data;
      const act = (id, action, extra = {}) =>
        sc.stockCountWrite(admin, { idempotencyKey: key(), action, ...extra }, id);

      let sessionId;
      await test('เริ่มรอบ: SC ปี พ.ศ. ดึงล็อตคงเหลือในคลังเป็นยอดระบบ; Sales เริ่มไม่ได้; คลังว่าง 409', async () => {
        const created = await sc.stockCountWrite(admin, {
          idempotencyKey: key(),
          warehouseId: disposal,
          name: prefix,
        });
        sessionId = created.data.id;
        assert.match(created.data.code, /^SC-25\d\d-\d{4}$/);
        assert.equal(created.data.lines, 2);
        const row = await read(sessionId);
        assert.equal(row.status, 'กำลังนับ');
        assert.deepEqual(
          row.lines.map((l) => l.systemQuantity).sort((a, b) => a - b),
          [5, 10],
        );
        await rejects(
          () => sc.stockCountWrite(sales, { idempotencyKey: key(), warehouseId: disposal }),
          403,
        );
        await tx.$executeRaw`UPDATE stock_balances SET quantity=0,reserved=0 WHERE warehouse_id=${marketing}::uuid`;
        await rejects(
          () => sc.stockCountWrite(admin, { idempotencyKey: key(), warehouseId: marketing }),
          409,
        );
      });

      await test('คีย์จำนวนนับ: สรุปตรง/ขาด/เกิน; ปิดไม่ได้ถ้ายังนับไม่ครบ; ยอดสต็อกไม่เปลี่ยน', async () => {
        const lines = (await read(sessionId)).lines;
        const ten = lines.find((l) => l.systemQuantity === 10);
        const five = lines.find((l) => l.systemQuantity === 5);
        await act(sessionId, 'count', {
          lines: [{ id: ten.id, countedQuantity: 8, note: 'แตก 2' }],
        });
        await rejects(() => act(sessionId, 'close'), 409);
        await act(sessionId, 'count', { lines: [{ id: five.id, countedQuantity: 6 }] });
        await act(sessionId, 'close');
        const row = await read(sessionId);
        assert.equal(row.status, 'ปิดแล้ว');
        assert.equal(row.diffCount, 2);
        assert.match(row.resultText, /ขาด 2 ชิ้น/);
        assert.match(row.resultText, /เกิน 1 ชิ้น/);
        const [balance] =
          await tx.$queryRaw`SELECT sum(quantity)::int AS q FROM stock_balances WHERE warehouse_id=${disposal}::uuid`;
        assert.equal(balance.q, 15);
        await rejects(
          () => act(sessionId, 'count', { lines: [{ id: ten.id, countedQuantity: 1 }] }),
          409,
        );
      });

      await test('ข้อมูลผิด: จำนวนติดลบ 400, รายการไม่ใช่ของรอบนี้ 400; ยกเลิกต้องมีเหตุผล', async () => {
        const other = (
          await sc.stockCountWrite(admin, { idempotencyKey: key(), warehouseId: disposal })
        ).data.id;
        const line = (await read(other)).lines[0];
        await rejects(
          () => act(other, 'count', { lines: [{ id: line.id, countedQuantity: -1 }] }),
          400,
        );
        await rejects(
          () => act(other, 'count', { lines: [{ id: key(), countedQuantity: 1 }] }),
          400,
        );
        await rejects(() => act(other, 'cancel'), 400);
        await act(other, 'cancel', { reason: 'เริ่มผิดคลัง' });
        assert.equal((await read(other)).status, 'ยกเลิก');
      });

      await test('รายงานผลตรวจนับแสดงสรุปจากรอบที่ปิด', async () => {
        const report = await reportsInventory.inventoryReport(
          admin,
          'counts',
          new URLSearchParams({ search: prefix }),
        );
        assert.equal(report.data.length, 1);
        assert.match(report.data[0].resultText, /ขาด 2 ชิ้น/);
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
