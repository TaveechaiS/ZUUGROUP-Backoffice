// TASK-275 integration tests: real PostgreSQL inside one rolled-back transaction.
// Run: node --no-warnings --loader ./scripts/ts-test-loader.mjs scripts/test-quotes.mjs
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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM quotations) AS quotes,(SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM users) AS users`;
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
      const quotes = load('src/server/quotes/service.ts');
      const ops = load('src/server/operations/service.ts');
      const { quotesHandler } = load('src/server/quotes/handler.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T275-' + key().slice(0, 8);
      async function savepoint(fn) {
        await tx.$executeRawUnsafe('SAVEPOINT quote_test');
        try {
          return await fn();
        } finally {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT quote_test');
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT quote_test');
        }
      }
      const rejects = (fn, status) =>
        savepoint(() => assert.rejects(fn, (e) => e.status === status || assert.fail(e.message)));
      async function test(name, fn) {
        await fn();
        passed++;
        console.log('PASS: ' + name);
      }

      // Fixtures: three role users, a territory, a customer, two products with stock in MAIN.
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
        sales = await user('SALES'),
        manager = await user('MANAGER'),
        otherSales = await user('SALES', 'SALES2');
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
      const template = await tx.product.findFirst({ where: { deletedAt: null } });
      assert.ok(template, 'ต้องมี master สินค้า');
      // Free legacy sequences/codes so the fixtures satisfy the product unique keys.
      const free = (
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZQ-ZQ-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n, price) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZQ-ZQ-${String(free[n - 1]).padStart(4, '0')}`,
            sequence: free[n - 1],
            name: `${prefix} สินค้า ${n}`,
            categoryId: template.categoryId,
            dosageFormId: template.dosageFormId,
            drugId: template.drugId,
            defaultWarehouseId: template.defaultWarehouseId,
            unit: 'กล่อง',
            salePrice: price,
          },
        });
        return id;
      };
      const p1 = await product(1, '120'),
        p2 = await product(2, '45.50');
      const main = (await tx.warehouse.findUnique({ where: { code: 'MAIN' } })).id;
      for (const productId of [p1, p2])
        await ops.inventoryWrite(admin, {
          action: 'receive',
          idempotencyKey: key(),
          code: (await ops.operationOptions(admin)).data.nextReceiptCode,
          lots: [
            {
              productId,
              warehouseId: main,
              quantity: 50,
              totalCost: '100',
              manufacturedOn: '2026-01-01',
              expiresOn: '2029-01-01',
            },
          ],
        });
      const create = (actor, lines, extra = {}) =>
        quotes.quoteWrite(actor, { idempotencyKey: key(), customerId, lines, ...extra });
      const act = (actor, id, action, extra = {}) =>
        quotes.quoteWrite(actor, { idempotencyKey: key(), action, ...extra }, id);
      const read = async (id) => (await quotes.quoteRead(admin, new URLSearchParams(), id)).data;

      await test('Admin สร้าง → อนุมัติทันที เลข QT ปี พ.ศ. ยอดหักส่วนลด อายุ 30 วัน', async () => {
        const created = await create(admin, [
          { productId: p1, quantity: 10, discount: '100' },
          { productId: p2, quantity: 2 },
        ]);
        assert.match(created.data.code, /^QT-25\d\d-\d{4}$/);
        assert.equal(created.data.status, 'อนุมัติ');
        const row = await read(created.data.id);
        assert.equal(row.amount, '1191.00');
        assert.equal(row.validUntil, addDays(today, 30));
        assert.equal(row.approvedByName, admin.name);
        assert.equal(row.lines.length, 2);
        assert.equal(row.territoryName, prefix);
        const next = await create(admin, [{ productId: p1, quantity: 1 }]);
        assert.equal(Number(next.data.code.slice(-4)), Number(created.data.code.slice(-4)) + 1);
      });

      let salesQuote;
      await test('Sales สร้าง → รออนุมัติ; Sales คนอื่นแตะไม่ได้; Manager อนุมัติ', async () => {
        salesQuote = (await create(sales, [{ productId: p1, quantity: 5, discount: '50' }])).data
          .id;
        assert.equal((await read(salesQuote)).status, 'รออนุมัติ');
        await rejects(() => act(otherSales, salesQuote, 'cancel', { reason: 'x' }), 403);
        await rejects(() => act(sales, salesQuote, 'approve'), 403);
        await rejects(() => act(sales, salesQuote, 'convert'), 409);
        await act(manager, salesQuote, 'approve');
        assert.equal((await read(salesQuote)).status, 'อนุมัติ');
        await rejects(() => act(manager, salesQuote, 'convert'), 403);
      });

      await test('แปลงเป็นคำสั่งซื้อครั้งเดียว อนุมัติตามใบเสนอราคา ราคา/ส่วนลดเดิม จองสต็อก', async () => {
        await tx.$executeRaw`UPDATE products SET sale_price=999 WHERE id=${p1}::uuid`;
        const converted = await act(sales, salesQuote, 'convert');
        assert.match(converted.data.orderCode, /^SO-25\d\d-\d{4}$/);
        const order = (await ops.orderRead(admin, new URLSearchParams(), converted.data.orderId))
          .data;
        assert.equal(order.quotationCode, (await read(salesQuote)).code);
        assert.equal(order.status, 'อนุมัติ');
        assert.equal(order.approvedByName, manager.name);
        assert.equal(order.lines[0].unitPrice, '120.00');
        assert.equal(order.lines[0].discount, '50.00');
        assert.equal(order.amount, '550.00');
        assert.equal(order.lines[0].allocations[0].quantity, 5);
        const quote = await read(salesQuote);
        assert.equal(quote.orderCode, converted.data.orderCode);
        await rejects(() => act(sales, salesQuote, 'convert'), 409);
        await rejects(() => act(manager, salesQuote, 'return', { reason: 'x' }), 409);
        await tx.$executeRaw`UPDATE products SET sale_price=120 WHERE id=${p1}::uuid`;
      });

      await test('แก้ไขคงราคาเดิมของสินค้าเดิม, สินค้าใหม่ใช้ราคาปัจจุบัน, Sales แก้แล้วกลับรออนุมัติ', async () => {
        const id = (await create(sales, [{ productId: p1, quantity: 1 }])).data.id;
        await tx.$executeRaw`UPDATE products SET sale_price=130 WHERE id=${p1}::uuid`;
        const before = await read(id);
        await quotes.quoteWrite(
          sales,
          {
            idempotencyKey: key(),
            action: 'edit',
            expectedUpdatedAt: new Date(before.updatedAt).toISOString(),
            validUntil: addDays(today, 10),
            lines: [
              { productId: p1, quantity: 2 },
              { productId: p2, quantity: 1, discount: '0.50' },
            ],
          },
          id,
        );
        const row = await read(id);
        const line = (pid) => row.lines.find((l) => l.productId === pid);
        assert.equal(line(p1).unitPrice, '120.00');
        assert.equal(line(p2).unitPrice, '45.50');
        assert.equal(row.amount, '285.00');
        assert.equal(row.validUntil, addDays(today, 10));
        assert.equal(row.status, 'รออนุมัติ');
        await rejects(
          () =>
            quotes.quoteWrite(
              sales,
              {
                idempotencyKey: key(),
                action: 'edit',
                expectedUpdatedAt: before.updatedAt,
                lines: [{ productId: p1, quantity: 1 }],
              },
              id,
            ),
          409,
        );
        await tx.$executeRaw`UPDATE products SET sale_price=120 WHERE id=${p1}::uuid`;
      });

      await test('ส่วนลดเกิน / วันที่ย้อนหลัง / ส่งกลับไม่มีเหตุผล ถูกปฏิเสธ', async () => {
        await rejects(
          () => create(admin, [{ productId: p1, quantity: 1, discount: '120.01' }]),
          400,
        );
        await rejects(
          () => create(admin, [{ productId: p1, quantity: 1 }], { validUntil: addDays(today, -1) }),
          400,
        );
        const id = (await create(sales, [{ productId: p1, quantity: 1 }])).data.id;
        await rejects(() => act(manager, id, 'return'), 400);
        await act(manager, id, 'return', { reason: 'ปรับจำนวน' });
        const row = await read(id);
        assert.equal(row.status, 'ส่งกลับแก้ไข');
        assert.equal(row.returnReason, 'ปรับจำนวน');
      });

      await test('ไม่อนุมัติ / ยกเลิก แล้วดำเนินการต่อไม่ได้', async () => {
        const rejected = (await create(sales, [{ productId: p1, quantity: 1 }])).data.id;
        await act(manager, rejected, 'reject', { reason: 'ราคาไม่ได้' });
        assert.equal((await read(rejected)).status, 'ไม่อนุมัติ');
        await rejects(() => act(manager, rejected, 'approve'), 409);
        const cancelled = (await create(sales, [{ productId: p1, quantity: 1 }])).data.id;
        await act(sales, cancelled, 'cancel', { reason: 'ลูกค้ายกเลิก' });
        assert.equal((await read(cancelled)).status, 'ยกเลิก');
        await rejects(() => act(admin, cancelled, 'convert'), 409);
      });

      await test('เลยวันใช้ได้ถึง → หมดอายุ กรองได้ และแปลง/อนุมัติไม่ได้', async () => {
        const id = (await create(admin, [{ productId: p1, quantity: 1 }])).data.id;
        await tx.$executeRaw`UPDATE quotations SET valid_until=${addDays(today, -1)}::date WHERE id=${id}::uuid`;
        assert.equal((await read(id)).displayStatus, 'หมดอายุ');
        const list = await quotes.quoteRead(
          admin,
          new URLSearchParams({ status: 'หมดอายุ', search: prefix }),
        );
        assert.ok(list.data.some((row) => row.id === id));
        await rejects(() => act(admin, id, 'convert'), 409);
      });

      await test('ของไม่พอ แปลงไม่ได้และไม่สร้างคำสั่งซื้อ', async () => {
        const id = (await create(admin, [{ productId: p2, quantity: 500 }])).data.id;
        await rejects(() => act(admin, id, 'convert'), 409);
        assert.equal((await read(id)).orderCode, null);
      });

      await test('คำสั่งซื้อรับส่วนลดบาทต่อรายการ และแก้แล้วคงราคาเดิม', async () => {
        const created = await ops.orderWrite(admin, {
          idempotencyKey: key(),
          customerId,
          lines: [{ productId: p2, quantity: 2, discount: '1' }],
        });
        let order = (await ops.orderRead(admin, new URLSearchParams(), created.data.id)).data;
        assert.equal(order.amount, '90.00');
        await rejects(
          () =>
            ops.orderWrite(admin, {
              idempotencyKey: key(),
              customerId,
              lines: [{ productId: p2, quantity: 1, discount: '46' }],
            }),
          400,
        );
        await tx.$executeRaw`UPDATE products SET sale_price=50 WHERE id=${p2}::uuid`;
        await ops.orderWrite(
          admin,
          {
            idempotencyKey: key(),
            action: 'edit',
            expectedUpdatedAt: new Date(order.updatedAt).toISOString(),
            lines: [{ productId: p2, quantity: 3 }],
          },
          created.data.id,
        );
        order = (await ops.orderRead(admin, new URLSearchParams(), created.data.id)).data;
        assert.equal(order.lines[0].unitPrice, '45.50');
        assert.equal(order.amount, '136.50');
      });

      await test('API: ไม่ login 401, DELETE = ยกเลิกต้องมีเหตุผล, รายการคืน actor', async () => {
        const request = (method, body, params = {}) => ({
          method,
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        identity = null;
        assert.equal((await quotesHandler(request('GET'))).status, 401);
        identity = await tx.user.findUnique({
          where: { id: admin.id },
          include: { userRole: true },
        });
        const list = await quotesHandler(request('GET', undefined, { search: prefix }));
        const listed = await list.json();
        assert.equal(list.status, 200);
        assert.equal(listed.actor.roleId, 'ADMIN');
        const id = (await create(admin, [{ productId: p1, quantity: 1 }])).data.id;
        await savepoint(async () => {
          const missing = await quotesHandler(request('DELETE', { idempotencyKey: key() }), id);
          assert.equal(missing.status, 400);
        });
        const ok = await quotesHandler(
          request('DELETE', { idempotencyKey: key(), reason: 'ทดสอบ' }),
          id,
        );
        assert.equal(ok.status, 200);
        assert.equal((await read(id)).status, 'ยกเลิก');
      });

      await test('quotation_lines เปิด RLS และ client ไม่มีสิทธิ์', async () => {
        const [row] =
          await tx.$queryRaw`SELECT relrowsecurity AS rls, has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT') AS client FROM pg_class WHERE oid='public.quotation_lines'::regclass`;
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
