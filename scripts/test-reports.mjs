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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM stock_movements) AS movements,(SELECT count(*)::int FROM stock_count_sessions) AS counts,(SELECT count(*)::int FROM users) AS users`;
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
      const reports = load('src/server/reports/sales.ts');
      const reportsInventory = load('src/server/reports/inventory.ts');
      const ops = load('src/server/operations/service.ts');
      const { reportsHandler } = load('src/server/reports/handler.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T279-' + key().slice(0, 8);
      async function savepoint(fn) {
        await tx.$executeRawUnsafe('SAVEPOINT report_test');
        try {
          return await fn();
        } finally {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT report_test');
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT report_test');
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
        salesUser = await user('SALES');
      const template = await tx.product.findFirst({ where: { deletedAt: null } });
      assert.ok(template, 'ต้องมี master สินค้า');
      const free = (
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZR-ZR-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZR-ZR-${String(free[n - 1]).padStart(4, '0')}`,
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
      const manager = await user('MANAGER');
      const customerId = key();
      await tx.customer.create({
        data: { id: customerId, code: prefix, name: 'ลูกค้าทดสอบ ' + prefix },
      });
      const main = (await tx.warehouse.findUnique({ where: { code: 'MAIN' } })).id;
      const receive = async (productId, quantity, expiresOn) =>
        ops.inventoryWrite(admin, {
          action: 'receive',
          idempotencyKey: key(),
          code: (await ops.operationOptions(admin)).data.nextReceiptCode,
          lots: [
            {
              productId,
              warehouseId: main,
              quantity,
              totalCost: String(quantity * 10),
              manufacturedOn: '2026-01-01',
              expiresOn,
            },
          ],
        });
      await tx.$executeRaw`UPDATE inventory_policy SET sale_months=0 WHERE id=1`;
      await receive(p1, 50, addDays(today, 60));
      const order = async (lines) =>
        (await ops.orderWrite(admin, { idempotencyKey: key(), customerId, lines })).data.id;
      const sold = await order([{ productId: p1, quantity: 2, discount: '10' }]);
      const updatedAt = async (id) =>
        new Date(
          (await ops.orderRead(admin, new URLSearchParams(), id)).data.updatedAt,
        ).toISOString();
      await ops.orderWrite(
        manager,
        { idempotencyKey: key(), action: 'approve', expectedUpdatedAt: await updatedAt(sold) },
        sold,
      );
      await ops.orderWrite(
        admin,
        { idempotencyKey: key(), action: 'complete', expectedUpdatedAt: await updatedAt(sold) },
        sold,
      );
      const cancelled = await order([{ productId: p1, quantity: 1 }]);
      await ops.orderWrite(
        admin,
        { idempotencyKey: key(), action: 'cancel', reason: 'ทดสอบ' },
        cancelled,
      );
      const soldCode = (await ops.orderRead(admin, new URLSearchParams(), sold)).data.code;
      const sales = (view, params = {}) =>
        reports.salesReport(admin, view, new URLSearchParams({ search: prefix, ...params }));
      const inventory = (actor, view, params = {}) =>
        reportsInventory.inventoryReport(
          actor,
          view,
          new URLSearchParams({ search: prefix, ...params }),
        );

      await test('ยอดขาย: นับเฉพาะคำสั่งซื้อเสร็จสิ้น ยอดรวม VAT หักส่วนลด และยอดก่อน VAT', async () => {
        const result = await sales('products');
        assert.equal(result.data.length, 1);
        assert.equal(result.data[0].quantity, 2);
        assert.equal(result.data[0].orders, 1);
        assert.equal(result.data[0].total, '190.00');
        assert.equal(result.data[0].net, '177.57');
        assert.deepEqual(result.summary, {
          orders: 1,
          quantity: 2,
          total: '190.00',
          net: '177.57',
        });
        assert.equal(result.range.from, today.slice(0, 8) + '01');
        assert.equal(result.range.to, today);
      });

      await test('ยอดขาย: ลูกค้า/ผู้ขาย/รายละเอียด ตรงกัน และคำสั่งซื้อยกเลิกไม่อยู่ในรายละเอียด', async () => {
        const customers = await sales('customers');
        assert.equal(customers.data[0].id, customerId);
        assert.equal(customers.data[0].total, '190.00');
        const sellers = await reports.salesReport(
          admin,
          'sellers',
          new URLSearchParams({ search: admin.name }),
        );
        assert.equal(sellers.data[0].id, admin.id);
        assert.equal(sellers.data[0].customers, 1);
        const details = await sales('details');
        assert.equal(details.data.length, 1);
        assert.equal(details.data[0].orderCode, soldCode);
        assert.equal(details.data[0].soldOn, today);
        assert.equal(details.data[0].discount, '10.00');
        const day = await reports.salesReport(admin, 'summary', new URLSearchParams());
        assert.ok(day.data.some((row) => row.soldOn === today && row.orders >= 1));
      });

      await test('ยอดขาย: ช่วงวันที่นอกวันขายไม่พบ; ช่วงผิด/เกิน 366 วัน 400; รายงานไม่รู้จัก 404', async () => {
        const yesterday = addDays(today, -1);
        const empty = await sales('details', { from: addDays(today, -30), to: yesterday });
        assert.equal(empty.data.length, 0);
        assert.equal(empty.summary.total, '0.00');
        await rejects(() => sales('details', { from: today, to: yesterday }), 400);
        await rejects(() => sales('details', { from: addDays(today, -400), to: today }), 400);
        await rejects(() => sales('nope'), 404);
      });

      await test('คลัง สรุปคงเหลือ: MAIN หักขาย, มูลค่าเห็นเฉพาะ Admin/CFO', async () => {
        const forAdmin = await inventory(admin, 'summary');
        const row = forAdmin.data.find((item) => item.id === p1);
        assert.equal(row.main, 48);
        assert.equal(row.quantity, 48);
        assert.equal(row.value, '480.00');
        assert.equal(forAdmin.seesCost, true);
        const forSales = await inventory(salesUser, 'summary');
        assert.equal(forSales.data.find((item) => item.id === p1).value, null);
        assert.equal(forSales.seesCost, false);
      });

      await test('คลัง ความเคลื่อนไหว: มีรับเข้าและขายพร้อมเลขอ้างอิง กรองประเภทได้', async () => {
        const all = await inventory(admin, 'movements');
        assert.ok(all.data.some((m) => m.kind === 'รับเข้า' && m.quantity === 50));
        const out = await inventory(admin, 'movements', { kind: 'ขาย' });
        assert.equal(out.data.length, 1);
        assert.equal(out.data[0].quantity, -2);
        assert.equal(out.data[0].reference, soldCode);
        await rejects(() => inventory(admin, 'movements', { kind: 'มั่ว' }), 400);
      });

      await test('คลัง ใกล้หมดอายุ ≤90 วัน และคงเหลือต่ำ MAIN 0–50', async () => {
        const expiry = await inventory(admin, 'expiry');
        assert.equal(expiry.data.length, 1);
        assert.equal(expiry.data[0].daysLeft, 60);
        const low = await inventory(admin, 'low-stock');
        assert.equal(low.data.find((item) => item.id === p1).status, 'สินค้าใกล้หมด');
        assert.equal(low.data.find((item) => item.id === p2).status, 'สินค้าหมด');
        const empty = await inventory(admin, 'low-stock', { status: 'สินค้าหมด' });
        assert.ok(empty.data.every((item) => item.main === 0));
      });

      await test('คลัง ผลตรวจนับ: แสดงรอบตรวจนับในช่วงวันที่ ไม่เปลี่ยนยอด', async () => {
        await tx.$executeRaw`INSERT INTO stock_count_sessions(code,name,status,warehouse_id,result_text) VALUES(${prefix},${'ตรวจนับ ' + prefix},'ปิดแล้ว',${main}::uuid,'ขาด 1')`;
        const counts = await inventory(admin, 'counts');
        assert.equal(counts.data.length, 1);
        assert.equal(counts.data[0].resultText, 'ขาด 1');
        const after = await inventory(admin, 'summary');
        assert.equal(after.data.find((item) => item.id === p1).main, 48);
      });

      await test('Handler: 401 ไม่ login, 200 เมื่อ login, 404 รายงานไม่รู้จัก', async () => {
        const request = (params = {}) => ({
          method: 'GET',
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
        });
        identity = null;
        assert.equal((await reportsHandler(request(), 'sales', 'summary')).status, 401);
        identity = await tx.user.findUnique({
          where: { id: salesUser.id },
          include: { userRole: true },
        });
        assert.equal((await reportsHandler(request(), 'sales', 'summary')).status, 200);
        assert.equal((await reportsHandler(request(), 'inventory', 'expiry')).status, 200);
        assert.equal((await reportsHandler(request(), 'inventory', 'nope')).status, 404);
      });
      await test('TASK-296 รายงานยอดขายสรุป: search กรองตามลูกค้า/สินค้า ยังจัดกลุ่มรายวัน', async () => {
        const details = await sales('details');
        const row = details.data[0];
        const summary = (search) =>
          reports.salesReport(admin, 'summary', new URLSearchParams({ search }));
        const byCustomer = await summary(row.customerName);
        assert.ok(byCustomer.data.some((r) => r.soldOn === today && r.orders >= 1));
        assert.equal(byCustomer.summary.total, details.summary.total);
        const byProduct = await summary(row.productName);
        assert.ok(byProduct.data.some((r) => r.soldOn === today));
        const none = await summary('ไม่มีทางพบ-' + prefix);
        assert.equal(none.data.length, 0);
        assert.equal(none.summary.total, '0.00');
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
