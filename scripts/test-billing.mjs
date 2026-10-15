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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM invoices) AS invoices,(SELECT count(*)::int FROM invoice_payments) AS payments,(SELECT count(*)::int FROM sales_orders) AS orders,(SELECT count(*)::int FROM users) AS users`;
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
      const bill = load('src/server/billing/service.ts');
      const ops = load('src/server/operations/service.ts');
      const { billingHandler } = load('src/server/billing/handler.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T283-' + key().slice(0, 8);
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
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZB-ZB-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZB-ZB-${String(free[n - 1]).padStart(4, '0')}`,
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
      const cfo = await user('ACCOUNTING_CFO', 'CFO');
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
      const orderA = await completedOrder([{ productId: p1, quantity: 3 }]);
      const orderB = await completedOrder([{ productId: p1, quantity: 1 }]);
      const pending = (
        await ops.orderWrite(admin, {
          idempotencyKey: key(),
          customerId,
          lines: [{ productId: p1, quantity: 1 }],
        })
      ).data.id;
      const read = async (id) => (await bill.billingRead(admin, new URLSearchParams(), id)).data;
      const create = (actor, salesOrderId, extra = {}) =>
        bill.billingWrite(actor, { idempotencyKey: key(), salesOrderId, ...extra });
      const act =
        (id, action, extra = {}) =>
        async () =>
          bill.billingWrite(
            admin,
            {
              idempotencyKey: key(),
              action,
              expectedUpdatedAt:
                (await read(id)).updatedAt.toISOString?.() ?? (await read(id)).updatedAt,
              ...extra,
            },
            id,
          );

      let invoiceId;
      await test('วางบิลจาก SO เสร็จสิ้น: INV ปี พ.ศ., ยอดเท่า SO, ครบกำหนดตามเครดิต 30 วัน; ซ้ำไม่ได้; SO ยังไม่เสร็จไม่ได้', async () => {
        const uninvoiced = await bill.billingRead(
          admin,
          new URLSearchParams({ view: 'uninvoiced' }),
        );
        assert.ok(uninvoiced.data.some((o) => o.id === orderA));
        await rejects(
          () => bill.billingRead(sales, new URLSearchParams({ view: 'uninvoiced' })),
          403,
        );
        const created = await create(admin, orderA);
        invoiceId = created.data.id;
        assert.match(created.data.code, /^INV-25\d\d-\d{4}$/);
        const row = await read(invoiceId);
        assert.equal(row.amount, '300.00');
        assert.equal(row.outstanding, '300.00');
        assert.equal(row.status, 'ค้างชำระ');
        assert.equal(row.dueDate, addDays(today, 30));
        await rejects(() => create(admin, orderA), 409);
        await rejects(() => create(admin, pending), 400);
        await rejects(() => create(sales, orderB), 403);
        await create(cfo, orderB);
      });

      await test('รับชำระบางส่วน → ชำระบางส่วน; เกินยอดค้าง 409; ครบ → ชำระครบ', async () => {
        await act(invoiceId, 'pay', {
          paidOn: today,
          amount: '100',
          method: 'โอน',
          reference: 'TX1',
        })();
        let row = await read(invoiceId);
        assert.equal(row.status, 'ชำระบางส่วน');
        assert.equal(row.paid, '100.00');
        assert.equal(row.outstanding, '200.00');
        await rejects(
          act(invoiceId, 'pay', { paidOn: today, amount: '200.01', method: 'โอน' }),
          409,
        );
        await rejects(act(invoiceId, 'pay', { paidOn: today, amount: '10', method: 'บัตร' }), 400);
        await rejects(
          act(invoiceId, 'pay', { paidOn: addDays(today, 1), amount: '10', method: 'โอน' }),
          400,
        );
        await rejects(
          act(invoiceId, 'pay', { paidOn: addDays(today, -1), amount: '10', method: 'โอน' }),
          400,
        );
        await act(invoiceId, 'pay', { paidOn: today, amount: '200', method: 'เงินสด' })();
        row = await read(invoiceId);
        assert.equal(row.status, 'ชำระครบ');
        assert.equal(row.payments.length, 2);
      });

      await test('ยกเลิกรายการรับชำระต้องมีเหตุผล สถานะคำนวณใหม่; ยกเลิกบิลที่มีรับชำระไม่ได้', async () => {
        const payment = (await read(invoiceId)).payments.find((p) => p.amount === '200.00');
        await rejects(act(invoiceId, 'void-payment', { paymentId: payment.id }), 400);
        await act(invoiceId, 'void-payment', { paymentId: payment.id, reason: 'คีย์ผิด' })();
        const row = await read(invoiceId);
        assert.equal(row.status, 'ชำระบางส่วน');
        assert.equal(row.outstanding, '200.00');
        await rejects(act(invoiceId, 'cancel', { reason: 'x' }), 409);
      });

      await test('เกินกำหนดคำนวณจากวันครบกำหนด และกรองแท็บได้; ยกเลิกบิลแล้ววางบิลใหม่ได้', async () => {
        await tx.$executeRaw`UPDATE invoices SET issue_date=${addDays(today, -40)}::date,due_date=${addDays(today, -10)}::date WHERE id=${invoiceId}::uuid`;
        const row = await read(invoiceId);
        assert.equal(row.status, 'เกินกำหนด');
        assert.equal(row.daysOverdue, 10);
        const overdue = await bill.billingRead(
          admin,
          new URLSearchParams({ status: 'เกินกำหนด', search: prefix }),
        );
        assert.ok(overdue.data.some((r) => r.id === invoiceId));
        const other = (
          await bill.billingRead(admin, new URLSearchParams({ search: prefix }))
        ).data.find((r) => r.salesOrderId === orderB);
        await act(other.id, 'cancel', { reason: 'ออกผิด' })();
        assert.equal((await read(other.id)).status, 'ยกเลิก');
        const again = await create(admin, orderB);
        assert.ok(again.data.id);
      });

      await test('Handler: 401 ไม่ login, Sales อ่านได้แต่วางบิลไม่ได้, 404', async () => {
        const request = (method, body, params = {}) => ({
          method,
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        identity = null;
        assert.equal((await billingHandler(request('GET'))).status, 401);
        identity = await tx.user.findUnique({
          where: { id: sales.id },
          include: { userRole: true },
        });
        assert.equal(
          (await billingHandler(request('GET', undefined, { search: prefix }))).status,
          200,
        );
        assert.equal(
          (await billingHandler(request('POST', { idempotencyKey: key(), salesOrderId: orderA })))
            .status,
          403,
        );
        assert.equal((await billingHandler(request('GET'), 'INV-0000-0000')).status, 404);
      });

      await test('invoice_payments เปิด RLS และ client ไม่มีสิทธิ์', async () => {
        const [row] =
          await tx.$queryRaw`SELECT relrowsecurity AS rls, has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT') AS client FROM pg_class WHERE oid='public.invoice_payments'::regclass`;
        assert.equal(row.rls, true);
        assert.equal(row.client, false);
      });
      await test('TASK-296 ใบวางบิล: ช่วงวันที่ออกบิล เขตขาย ผู้ขาย ตัวเลือก และ Sales ขยายขอบเขตไม่ได้', async () => {
        const uuid = '00000000-0000-4000-8000-000000000001';
        const list = (actor, p) =>
          bill.billingRead(actor, new URLSearchParams({ search: prefix, ...p }));
        const total = (await list(admin, {})).pagination.total;
        assert.ok(total >= 1);
        const row = await read(invoiceId);
        await tx.$executeRaw`UPDATE invoices SET issue_date=${addDays(today, -20)}::date WHERE id=${invoiceId}::uuid`;
        const ids = async (p) => (await list(admin, p)).data.map((r) => r.id);
        assert.ok(
          (await ids({ from: addDays(today, -20), to: addDays(today, -20) })).includes(invoiceId),
        );
        assert.ok(!(await ids({ from: addDays(today, -19) })).includes(invoiceId));
        assert.ok(!(await ids({ to: addDays(today, -21) })).includes(invoiceId));
        await rejects(() => list(admin, { from: today, to: addDays(today, -1) }), 400);
        const [zone] =
          await tx.$queryRaw`INSERT INTO sales_territories(code,name) VALUES(${prefix + '-Z'},${prefix + '-Z'}) RETURNING id`;
        await tx.$executeRaw`UPDATE customers SET territory_id=${zone.id}::uuid WHERE id=${row.customerId}::uuid`;
        const [meta] =
          await tx.$queryRaw`SELECT o.created_by_id AS seller,c.territory_id AS territory FROM sales_orders o JOIN customers c ON c.id=o.customer_id WHERE o.id=${row.salesOrderId}::uuid`;
        assert.ok((await ids({ sellerId: meta.seller })).includes(invoiceId));
        assert.ok((await ids({ territoryId: meta.territory })).includes(invoiceId));
        assert.equal((await list(admin, { sellerId: uuid })).pagination.total, 0);
        assert.equal((await list(admin, { territoryId: uuid })).pagination.total, 0);
        await rejects(() => list(admin, { sellerId: 'x' }), 400);
        const listed = await list(admin, {});
        assert.ok(listed.filters.territories.some((x) => x.id === meta.territory));
        assert.ok(listed.filters.sellers.some((x) => x.id === meta.seller));
        const own = await list(sales, {});
        assert.equal(own.filters, undefined);
        assert.equal(
          (await list(sales, { sellerId: uuid, territoryId: uuid })).pagination.total,
          own.pagination.total,
        );
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
