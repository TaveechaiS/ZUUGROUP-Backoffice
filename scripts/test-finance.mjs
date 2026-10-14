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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM invoices) AS invoices,(SELECT count(*)::int FROM expenses) AS expenses,(SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM users) AS users`;
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
      const fin = load('src/server/reports/finance.ts');
      const bill = load('src/server/billing/service.ts');
      const exp = load('src/server/expenses/service.ts');
      const ops = load('src/server/operations/service.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T284-' + key().slice(0, 8);
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
      const admin = await user('ADMIN');
      const template = await tx.product.findFirst({ where: { deletedAt: null } });
      assert.ok(template, 'ต้องมี master สินค้า');
      const free = (
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZF-ZF-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZF-ZF-${String(free[n - 1]).padStart(4, '0')}`,
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
      const p1 = await product(1);
      const manager = await user('MANAGER');

      const [term] =
        await tx.$queryRaw`SELECT id,days FROM customer_options WHERE kind='creditTerm' AND days=30 LIMIT 1`;
      const customerId = key();
      await tx.customer.create({
        data: {
          id: customerId,
          code: prefix,
          name: 'ลูกค้าทดสอบ ' + prefix,
          creditTermId: term?.id ?? null,
        },
      });
      const main = (await tx.warehouse.findUnique({ where: { code: 'MAIN' } })).id;
      await tx.$executeRaw`UPDATE inventory_policy SET sale_months=0 WHERE id=1`;
      const receive = async (productId, quantity, warehouseId = main) =>
        ops.inventoryWrite(admin, {
          action: 'receive',
          idempotencyKey: key(),
          code: (await ops.operationOptions(admin)).data.nextReceiptCode,
          lots: [
            {
              productId,
              warehouseId,
              quantity,
              totalCost: String(quantity * 10),
              manufacturedOn: '2026-01-01',
              expiresOn: addDays(today, 400),
            },
          ],
        });
      const updatedAt = async (id) =>
        new Date(
          (await ops.orderRead(admin, new URLSearchParams(), id)).data.updatedAt,
        ).toISOString();
      const completedOrder = async (lines) => {
        const id = (await ops.orderWrite(admin, { idempotencyKey: key(), customerId, lines })).data
          .id;
        await ops.orderWrite(
          manager,
          { idempotencyKey: key(), action: 'approve', expectedUpdatedAt: await updatedAt(id) },
          id,
        );
        await ops.orderWrite(
          admin,
          { idempotencyKey: key(), action: 'complete', expectedUpdatedAt: await updatedAt(id) },
          id,
        );
        return id;
      };
      await receive(p1, 50);
      const invoice = async (quantity) => {
        const orderId = await completedOrder([{ productId: p1, quantity }]);
        return (await bill.billingWrite(admin, { idempotencyKey: key(), salesOrderId: orderId }))
          .data.id;
      };
      const due = (id, days) =>
        tx.$executeRaw`UPDATE invoices SET issue_date=${addDays(today, -days - 30)}::date,due_date=${addDays(today, -days)}::date WHERE id=${id}::uuid`;
      const a = await invoice(1),
        b = await invoice(2),
        c = await invoice(3);
      await due(b, 15);
      await due(c, 100);
      const invoiceUpdatedAt = async (id) =>
        new Date(
          (await bill.billingRead(admin, new URLSearchParams(), id)).data.updatedAt,
        ).toISOString();
      await bill.billingWrite(
        admin,
        {
          idempotencyKey: key(),
          action: 'pay',
          expectedUpdatedAt: await invoiceUpdatedAt(c),
          paidOn: today,
          amount: '50',
          method: 'โอน',
          reference: prefix,
        },
        c,
      );
      const [category] =
        await tx.$queryRaw`SELECT id FROM customer_options WHERE kind='expenseCategory' AND name='ค่าขนส่ง'`;
      await exp.expenseWrite(admin, {
        idempotencyKey: key(),
        name: prefix,
        expenseDate: today,
        categoryId: category.id,
        amount: '75.25',
      });
      const report = (view, params = {}) =>
        fin.financeReport(admin, view, new URLSearchParams(params));

      await test('อายุลูกหนี้: แยกยังไม่ถึงกำหนด/1–30/เกิน 90 วัน หักรับชำระแล้ว', async () => {
        const result = await report('aging', { search: prefix });
        assert.equal(result.data.length, 1);
        const row = result.data[0];
        assert.equal(row.invoices, 3);
        assert.equal(row.current, '100.00');
        assert.equal(row.d30, '200.00');
        assert.equal(row.over90, '250.00');
        assert.equal(row.outstanding, '550.00');
        assert.equal(result.totalAmount, '550.00');
        assert.ok(a);
      });

      await test('รับชำระ: แสดงรายการในช่วงวันที่ ไม่นับที่ยกเลิก', async () => {
        const result = await report('payments', { search: prefix });
        assert.equal(result.data.length, 1);
        assert.equal(result.data[0].amount, '50.00');
        assert.equal(result.totalAmount, '50.00');
        const past = await report('payments', {
          search: prefix,
          from: addDays(today, -10),
          to: addDays(today, -1),
        });
        assert.equal(past.data.length, 0);
      });

      await test('ค่าใช้จ่ายตามหมวด: รวมเฉพาะบันทึกแล้วในช่วงวันที่; รายงานไม่รู้จัก 404', async () => {
        const result = await report('expenses', { search: 'ค่าขนส่ง' });
        const row = result.data.find((item) => item.id === category.id);
        assert.ok(row && Number(row.amount) >= 75.25);
        await rejects(() => report('nope'), 404);
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
