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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM customers) AS customers,(SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM users) AS users`;
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
      const ops = load('src/server/operations/service.ts');
      const customers = load('src/server/customers/service.ts');
      const quotes = load('src/server/quotes/service.ts');
      const fu = load('src/server/follow-ups/service.ts');
      const bill = load('src/server/billing/service.ts');
      const buy = load('src/server/purchasing/service.ts');
      const exp = load('src/server/expenses/service.ts');
      const finance = load('src/server/reports/finance.ts');
      const sales = load('src/server/reports/sales.ts');
      const { bangkokDay } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T290-' + key().slice(0, 8);
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
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZA-ZA-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZA-ZA-${String(free[n - 1]).padStart(4, '0')}`,
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
      const salesUser = await user('SALES', 'S1');
      const manager = await user('MANAGER');
      const cfo = await user('ACCOUNTING_CFO', 'CFO');
      const territory = async (tag, members) => {
        const [row] =
          await tx.$queryRaw`INSERT INTO sales_territories(code,name) VALUES(${prefix + tag},${prefix + tag}) RETURNING id`;
        for (const member of members)
          await tx.$executeRaw`INSERT INTO sales_territory_sales(territory_id,user_id) VALUES(${row.id}::uuid,${member.id}::uuid)`;
        return row.id;
      };
      const mine = await territory('A', [salesUser]);
      const other = await territory('B', []);
      const [group] =
        await tx.$queryRaw`SELECT id FROM customer_options WHERE kind='codeGroup' AND active ORDER BY name LIMIT 1`;
      const customer = async (tag, territoryId) => {
        const requestId = key();
        await full.beginCustomerRequest(
          requestId,
          {
            codeGroupId: group.id,
            sequence: '',
            fields: {
              name: prefix + ' ลูกค้า ' + tag,
              territoryId,
              contactName: 'ผู้ติดต่อ',
              phone: '02-222-000' + tag,
              email: 'a@example.com',
              accountingContactName: 'บัญชี',
              accountingPhone: '02-222-0009',
              accountingEmail: 'b@example.com',
              taxId: '010555900000' + tag,
              vatStatus: 'จดทะเบียน',
              branchType: 'สำนักงานใหญ่',
              billingAddress: '1 ถนน',
              billingSubdistrict: 'แขวง',
              billingDistrict: 'เขต',
              billingProvince: 'จังหวัด',
              billingPostcode: '10000',
            },
            shippingAddresses: [],
            files: [],
          },
          admin.id,
        );
        return (await full.commitCustomerRequest(requestId, admin.id)).id;
      };
      const own = await customer('1', mine);
      const foreign = await customer('2', other);
      const main = (await tx.warehouse.findUnique({ where: { code: 'MAIN' } })).id;
      await tx.$executeRaw`UPDATE inventory_policy SET sale_months=0 WHERE id=1`;
      await ops.inventoryWrite(admin, {
        action: 'receive',
        idempotencyKey: key(),
        code: (await ops.operationOptions(admin)).data.nextReceiptCode,
        lots: [
          {
            productId: p1,
            warehouseId: main,
            quantity: 20,
            totalCost: '10',
            manufacturedOn: '2026-01-01',
            expiresOn: '2029-01-01',
          },
        ],
      });
      const orderFor = (actor, customerId) =>
        ops.orderWrite(actor, {
          idempotencyKey: key(),
          customerId,
          lines: [{ productId: p1, quantity: 1 }],
        });
      await orderFor(admin, own);
      await orderFor(admin, foreign);

      await test('Sales เห็นเฉพาะลูกค้าในเขตตน: รายชื่อ/รายละเอียด/ตัวเลือกในฟอร์ม', async () => {
        const list = await customers.listCustomers(
          new URLSearchParams({ search: prefix }),
          false,
          salesUser,
        );
        assert.deepEqual(
          list.data.map((c) => c.id),
          [own],
        );
        const all = await customers.listCustomers(
          new URLSearchParams({ search: prefix }),
          false,
          manager,
        );
        assert.equal(all.data.length, 2);
        await assert.rejects(
          () => customers.customerDetail(foreign, false, false, salesUser),
          (e) => e.status === 404,
        );
        const options = (await ops.operationOptions(salesUser)).data.customers.map((c) => c.id);
        assert.ok(options.includes(own) && !options.includes(foreign));
        const filters = (
          await customers.listCustomers(new URLSearchParams({ include: 'filters' }), false, salesUser)
        ).filters;
        const ids = filters.territories.map((t) => t.id);
        assert.ok(ids.includes(mine) && !ids.includes(other));
        const allIds = (
          await customers.listCustomers(new URLSearchParams({ include: 'filters' }), false, manager)
        ).filters.territories.map((t) => t.id);
        assert.ok(allIds.includes(mine) && allIds.includes(other));
      });

      await test('Sales: คำสั่งซื้อ/ใบเสนอราคา/ติดตาม เฉพาะเขต; สร้างให้ลูกค้านอกเขตไม่ได้', async () => {
        const orders = await ops.orderRead(salesUser, new URLSearchParams({ search: prefix }));
        assert.ok(orders.data.every((o) => o.customerId === own));
        await rejects(() => orderFor(salesUser, foreign), 403);
        await rejects(
          () =>
            quotes.quoteWrite(salesUser, {
              idempotencyKey: key(),
              customerId: foreign,
              lines: [{ productId: p1, quantity: 1 }],
            }),
          403,
        );
        await rejects(
          () =>
            fu.followUpWrite(salesUser, {
              idempotencyKey: key(),
              customerId: foreign,
              name: 'x',
              contactedOn: today,
              channel: 'โทร',
            }),
          403,
        );
        const managerOrders = await ops.orderRead(manager, new URLSearchParams({ search: prefix }));
        assert.equal(managerOrders.data.length, 2);
      });

      await test('ต้นทุน/การเงิน: Sales อ่านจัดซื้อ ค่าใช้จ่าย รายงานการเงินไม่ได้; CFO/Manager ตามสิทธิ์', async () => {
        await rejects(() => buy.purchaseRead(salesUser, new URLSearchParams()), 403);
        await rejects(() => buy.purchaseRead(manager, new URLSearchParams()), 403);
        await buy.purchaseRead(cfo, new URLSearchParams());
        await rejects(() => exp.expenseRead(salesUser, new URLSearchParams()), 403);
        await exp.expenseRead(manager, new URLSearchParams());
        await rejects(() => finance.financeReport(salesUser, 'aging', new URLSearchParams()), 403);
        await finance.financeReport(manager, 'aging', new URLSearchParams());
      });

      await test('Sales: ใบแจ้งหนี้และรายงานยอดขายเฉพาะลูกค้าในเขต', async () => {
        const billing = await bill.billingRead(salesUser, new URLSearchParams({ search: prefix }));
        assert.ok(billing.data.every((i) => i.customerId === own));
        const report = await sales.salesReport(
          salesUser,
          'customers',
          new URLSearchParams({ search: prefix }),
        );
        assert.ok(report.data.every((r) => r.id === own));
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
