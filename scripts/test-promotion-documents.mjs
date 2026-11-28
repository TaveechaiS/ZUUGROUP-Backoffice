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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM quotations) AS quotes,(SELECT count(*)::int FROM promotions) AS promotions,(SELECT count(*)::int FROM users) AS users`;
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
      const promo = load('src/server/promotions/service.ts');
      const quotes = load('src/server/quotes/service.ts');
      const sales = load('src/server/reports/sales.ts');
      const ops = load('src/server/operations/service.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T285-' + key().slice(0, 8);
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
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZD-ZD-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZD-ZD-${String(free[n - 1]).padStart(4, '0')}`,
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
      const marketing = (await tx.warehouse.findUnique({ where: { code: 'MARKETING' } })).id;
      await receive(p1, 50);
      await receive(p1, 5, marketing);
      await receive(p2, 20, marketing);
      await receive(p2, 20);
      const promotion = async (extra) =>
        (
          await promo.promotionWrite(admin, {
            idempotencyKey: key(),
            name: 'โปร ' + prefix,
            startsOn: today,
            endsOn: addDays(today, 10),
            minType: 'จำนวน',
            minValue: '3',
            rewardType: 'ของแถม',
            productIds: [p1],
            gifts: [{ productId: p1, quantity: 1, warehouseId: marketing }],
            ...extra,
          })
        ).data.id;
      const giftPromo = await promotion();
      const discountPromo = await promotion({
        rewardType: 'ส่วนลด%',
        discountValue: '10',
        gifts: [],
      });
      const readOrder = async (id) => (await ops.orderRead(admin, new URLSearchParams(), id)).data;
      const createOrder = (lines, promotionId) =>
        ops.orderWrite(admin, { idempotencyKey: key(), customerId, lines, promotionId });

      let giftOrder;
      await test('SO ใช้โปรของแถม: บรรทัดของแถมสินค้าเดียวกัน ราคา 0 จองจากคลังการตลาด ยอดไม่เปลี่ยน', async () => {
        giftOrder = (await createOrder([{ productId: p1, quantity: 3 }], giftPromo)).data.id;
        const order = await readOrder(giftOrder);
        assert.equal(order.lines.length, 2);
        const gift = order.lines.find((line) => line.isGift);
        assert.equal(gift.productId, p1);
        assert.equal(gift.unitPrice, '0.00');
        assert.equal(order.amount, '300.00');
        assert.equal(order.promotionId, giftPromo);
        assert.equal(order.promotion.rewardType, 'ของแถม');
        const [reservation] =
          await tx.$queryRaw`SELECT r.warehouse_id AS "warehouseId",r.quantity FROM stock_reservations r WHERE r.order_line_id=${gift.id}::uuid`;
        assert.equal(reservation.warehouseId, marketing);
        assert.equal(reservation.quantity, 1);
      });

      await test('ไม่ถึงขั้นต่ำ 409; โปรหมดช่วง 409; ของแถมในคลังไม่พอ 409', async () => {
        await rejects(() => createOrder([{ productId: p1, quantity: 2 }], giftPromo), 409);
        const expired = await promotion({
          startsOn: addDays(today, -10),
          endsOn: addDays(today, -1),
        });
        await rejects(() => createOrder([{ productId: p1, quantity: 3 }], expired), 409);
        const big = await promotion({
          gifts: [{ productId: p1, quantity: 99, warehouseId: marketing }],
        });
        await rejects(() => createOrder([{ productId: p1, quantity: 3 }], big), 409);
      });

      await test('โปรส่วนลด% หักท้ายบิลจากสินค้าที่ร่วม; แก้ SO แล้วคำนวณใหม่; เอาโปรออกได้', async () => {
        const id = (
          await createOrder(
            [
              { productId: p1, quantity: 4 },
              { productId: p2, quantity: 1 },
            ],
            discountPromo,
          )
        ).data.id;
        let order = await readOrder(id);
        assert.equal(order.billDiscount, '40.00');
        assert.equal(order.amount, '460.00');
        await ops.orderWrite(
          admin,
          {
            idempotencyKey: key(),
            action: 'edit',
            expectedUpdatedAt: new Date(order.updatedAt).toISOString(),
            lines: [{ productId: p1, quantity: 5 }],
          },
          id,
        );
        order = await readOrder(id);
        assert.equal(order.billDiscount, '50.00');
        assert.equal(order.amount, '450.00');
        await ops.orderWrite(
          admin,
          {
            idempotencyKey: key(),
            action: 'edit',
            expectedUpdatedAt: new Date(order.updatedAt).toISOString(),
            lines: [{ productId: p1, quantity: 5 }],
            promotionId: '',
          },
          id,
        );
        order = await readOrder(id);
        assert.equal(order.promotionId, null);
        assert.equal(order.amount, '500.00');
      });

      await test('ใบเสนอราคาใช้โปร → แปลงเป็น SO พาของแถมและส่วนลดตามที่ตกลง', async () => {
        const quote = (
          await quotes.quoteWrite(admin, {
            idempotencyKey: key(),
            customerId,
            lines: [{ productId: p1, quantity: 3 }],
            promotionId: giftPromo,
          })
        ).data.id;
        const row = (await quotes.quoteRead(admin, new URLSearchParams(), quote)).data;
        assert.equal(row.lines.filter((line) => line.isGift).length, 1);
        assert.equal(row.amount, '300.00');
        const converted = await quotes.quoteWrite(
          admin,
          {
            idempotencyKey: key(),
            action: 'convert',
            expectedUpdatedAt: new Date(row.updatedAt).toISOString(),
          },
          quote,
        );
        const order = await readOrder(converted.data.orderId);
        assert.equal(order.lines.filter((line) => line.isGift).length, 1);
        assert.equal(order.promotionId, giftPromo);
      });

      await test('ปิด SO ตัดของแถมจากคลังการตลาด; รายงานยอดขายไม่นับบรรทัดของแถม', async () => {
        const updatedAt = async (id) => new Date((await readOrder(id)).updatedAt).toISOString();
        await ops.orderWrite(
          manager,
          {
            idempotencyKey: key(),
            action: 'approve',
            expectedUpdatedAt: await updatedAt(giftOrder),
          },
          giftOrder,
        );
        await ops.orderWrite(
          admin,
          {
            idempotencyKey: key(),
            action: 'complete',
            expectedUpdatedAt: await updatedAt(giftOrder),
          },
          giftOrder,
        );
        const [moved] =
          await tx.$queryRaw`SELECT sum(m.quantity)::int AS quantity FROM stock_movements m WHERE m.source_id=${giftOrder}::uuid AND m.warehouse_id=${marketing}::uuid`;
        assert.equal(moved.quantity, -1);
        const report = await sales.salesReport(
          admin,
          'details',
          new URLSearchParams({ search: prefix }),
        );
        const mine = report.data.filter((row) => row.orderId === giftOrder);
        assert.equal(mine.length, 1);
        assert.equal(mine[0].quantity, 3);
        assert.equal(mine[0].total, '300.00');
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
