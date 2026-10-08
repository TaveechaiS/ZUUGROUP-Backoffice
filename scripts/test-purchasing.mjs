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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM suppliers) AS suppliers,(SELECT count(*)::int FROM purchase_orders) AS orders,(SELECT count(*)::int FROM stock_receipts) AS receipts,(SELECT count(*)::int FROM users) AS users`;
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
      const buy = load('src/server/purchasing/service.ts');
      const ops = load('src/server/operations/service.ts');
      const { purchasingHandler } = load('src/server/purchasing/handler.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T276-' + key().slice(0, 8);
      async function savepoint(fn) {
        await tx.$executeRawUnsafe('SAVEPOINT purchase_test');
        try {
          return await fn();
        } finally {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT purchase_test');
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT purchase_test');
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
        await tx.$queryRaw`SELECT s FROM generate_series(9999,1,-1) s WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.sequence=s OR p.code=${'ZP-ZP-'}||lpad(s::text,4,'0')) LIMIT 2`
      ).map((row) => row.s);
      const product = async (n) => {
        const id = key();
        await tx.product.create({
          data: {
            id,
            code: `ZP-ZP-${String(free[n - 1]).padStart(4, '0')}`,
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
      const main = (await tx.warehouse.findUnique({ where: { code: 'MAIN' } })).id;

      const supplier = (actor, extra = {}) =>
        buy.supplierWrite(actor, {
          idempotencyKey: key(),
          name: 'ผู้ขายทดสอบ ' + prefix,
          taxId: '0105551234567',
          phone: '021234567',
          email: 'buy@example.invalid',
          paymentTerms: '30 วัน',
          ...extra,
        });
      const supplierAct = (id, action, extra = {}) =>
        buy.supplierWrite(admin, { idempotencyKey: key(), action, ...extra }, id);
      const readSupplier = async (id) =>
        (await buy.supplierRead(admin, new URLSearchParams(), id)).data;
      const createPo = (actor, supplierId, lines, extra = {}) =>
        buy.purchaseWrite(actor, { idempotencyKey: key(), supplierId, lines, ...extra });
      const poAct = (id, action, extra = {}) =>
        buy.purchaseWrite(admin, { idempotencyKey: key(), action, ...extra }, id);
      const readPo = async (id) => (await buy.purchaseRead(admin, new URLSearchParams(), id)).data;
      const receive = async (quantity, extra = {}, productId = p1) =>
        ops.inventoryWrite(admin, {
          action: 'receive',
          idempotencyKey: key(),
          code: (await ops.operationOptions(admin, 'receive')).data.nextReceiptCode,
          ...extra,
          lots: [
            {
              productId,
              warehouseId: main,
              quantity,
              totalCost: '100',
              manufacturedOn: '2026-01-01',
              expiresOn: '2029-01-01',
            },
          ],
        });

      let supplierId;
      await test('ผู้ขาย: Admin สร้างได้รหัส SUP ต่อเนื่อง; Sales สร้างไม่ได้; ข้อมูลผิดถูกปฏิเสธ', async () => {
        const created = await supplier(admin);
        supplierId = created.data.id;
        assert.match(created.data.code, /^SUP-\d{4,6}$/);
        const next = await supplier(admin, { name: 'ผู้ขายสอง ' + prefix });
        assert.equal(Number(next.data.code.slice(4)), Number(created.data.code.slice(4)) + 1);
        const row = await readSupplier(supplierId);
        assert.equal(row.status, 'ใช้งาน');
        assert.equal(row.paymentTerms, '30 วัน');
        assert.equal(row.createdByName, admin.name);
        await rejects(() => supplier(sales), 403);
        await rejects(() => supplier(admin, { taxId: '123' }), 400);
        await rejects(() => supplier(admin, { email: 'bad' }), 400);
        await rejects(() => supplier(admin, { paymentTerms: '45 วัน' }), 400);
      });

      await test('ผู้ขาย: แก้ไข, ระงับใช้กับใบสั่งซื้อใหม่ไม่ได้, ลบต้องมีเหตุผล, กู้คืนได้', async () => {
        const id = (await supplier(admin, { name: 'ผู้ขายแก้ ' + prefix })).data.id;
        const before = await readSupplier(id);
        await supplierAct(id, 'edit', {
          name: 'ผู้ขายแก้แล้ว ' + prefix,
          status: 'ระงับ',
          paymentTerms: 'เงินสด',
          expectedUpdatedAt: before.updatedAt.toISOString?.() ?? before.updatedAt,
        });
        const edited = await readSupplier(id);
        assert.equal(edited.status, 'ระงับ');
        assert.equal(edited.name, 'ผู้ขายแก้แล้ว ' + prefix);
        await rejects(
          () => createPo(admin, id, [{ productId: p1, quantity: 1, unitCost: '1' }]),
          400,
        );
        await rejects(() => supplierAct(id, 'delete'), 400);
        await supplierAct(id, 'delete', { reason: 'ทดสอบลบ' });
        assert.ok((await readSupplier(id)).deletedAt);
        const deletedList = await buy.supplierRead(
          admin,
          new URLSearchParams({ status: 'ลบแล้ว', search: prefix }),
        );
        assert.ok(deletedList.data.some((row) => row.id === id));
        await supplierAct(id, 'restore');
        assert.equal((await readSupplier(id)).deletedAt, null);
      });

      let poId;
      await test('ใบสั่งซื้อ: Admin สร้าง → PO ปี พ.ศ. รอรับสินค้า ยอดหักส่วนลด; Sales สร้างไม่ได้', async () => {
        const created = await createPo(
          admin,
          supplierId,
          [
            { productId: p1, quantity: 10, unitCost: '50', discount: '20' },
            { productId: p2, quantity: 4, unitCost: '12.50' },
          ],
          { expectedOn: addDays(today, 7), notes: 'ทดสอบ' },
        );
        poId = created.data.id;
        assert.match(created.data.code, /^PO-25\d\d-\d{4}$/);
        assert.equal(created.data.status, 'รอรับสินค้า');
        const row = await readPo(poId);
        assert.equal(row.amount, '530.00');
        assert.equal(row.orderDate, today);
        assert.equal(row.ordered, 14);
        assert.equal(row.received, 0);
        assert.equal(row.lines.length, 2);
        assert.equal(row.supplierName, 'ผู้ขายทดสอบ ' + prefix);
        await rejects(
          () => createPo(sales, supplierId, [{ productId: p1, quantity: 1, unitCost: '1' }]),
          403,
        );
        await rejects(
          () =>
            createPo(admin, supplierId, [
              { productId: p1, quantity: 1, unitCost: '1', discount: '2' },
            ]),
          400,
        );
        await rejects(
          () =>
            createPo(admin, supplierId, [{ productId: p1, quantity: 1, unitCost: '1' }], {
              orderDate: addDays(today, 1),
            }),
          400,
        );
      });

      await test('ใบสั่งซื้อ: แก้ไขได้ก่อนรับของ ข้อมูลเก่าถูกปฏิเสธ', async () => {
        const before = await readPo(poId);
        await poAct(poId, 'edit', {
          supplierId,
          expectedUpdatedAt: before.updatedAt.toISOString?.() ?? before.updatedAt,
          lines: [
            { productId: p1, quantity: 10, unitCost: '50', discount: '20' },
            { productId: p2, quantity: 5, unitCost: '12.50' },
          ],
        });
        const after = await readPo(poId);
        assert.equal(after.amount, '542.50');
        assert.equal(after.ordered, 15);
        await rejects(
          () =>
            poAct(poId, 'edit', {
              supplierId,
              expectedUpdatedAt: '2000-01-01T00:00:00.000Z',
              lines: [{ productId: p1, quantity: 1, unitCost: '1' }],
            }),
          409,
        );
      });

      await test('รับเข้าจากใบสั่งซื้อ: บางส่วน → รับบางส่วน, รับเกินไม่ได้, สินค้าไม่ตรงไม่ได้, ผู้ขายติดใบรับเข้า', async () => {
        const lines = (await readPo(poId)).lines;
        const l1 = lines.find((l) => l.productId === p1),
          l2 = lines.find((l) => l.productId === p2);
        const options = (await ops.operationOptions(admin, 'receive')).data;
        assert.ok(options.openLines.some((l) => l.id === l1.id && l.remaining === 10));
        assert.ok(options.suppliers.some((s) => s.id === supplierId));
        const first = await receive(6, { purchaseOrderLineId: l1.id });
        assert.equal(first.data.purchaseOrderId, poId);
        const [receipt] =
          await tx.$queryRaw`SELECT supplier_id AS "supplierId",source FROM stock_receipts WHERE id=${first.data.id}::uuid`;
        assert.equal(receipt.supplierId, supplierId);
        assert.equal(receipt.source, 'ผู้ขายทดสอบ ' + prefix);
        let row = await readPo(poId);
        assert.equal(row.status, 'รับบางส่วน');
        assert.equal(row.received, 6);
        assert.equal(row.lines.find((l) => l.id === l1.id).remaining, 4);
        assert.equal(row.receipts.length, 1);
        await rejects(() => receive(5, { purchaseOrderLineId: l1.id }), 409);
        await rejects(() => receive(1, { purchaseOrderLineId: l2.id }), 400);
        await rejects(
          () =>
            poAct(poId, 'edit', {
              supplierId,
              lines: [{ productId: p1, quantity: 1, unitCost: '1' }],
            }),
          409,
        );
        await rejects(() => poAct(poId, 'cancel', { reason: 'x' }), 409);
        await receive(4, { purchaseOrderLineId: l1.id });
        await receive(5, { purchaseOrderLineId: l2.id }, p2);
        row = await readPo(poId);
        assert.equal(row.status, 'รับครบ');
        assert.equal(row.received, 15);
        await rejects(() => receive(1, { purchaseOrderLineId: l1.id }), 409);
        await rejects(() => poAct(poId, 'close', { reason: 'x' }), 409);
      });

      await test('แก้รับเข้าเกินจำนวนสั่งไม่ได้; ลดจำนวนแล้วสถานะกลับเป็นรับบางส่วน', async () => {
        const row = await readPo(poId);
        const r = row.receipts.find((item) => item.quantity === 6);
        const [lot] =
          await tx.$queryRaw`SELECT l.id FROM product_lots l WHERE l.receipt_id=${r.id}::uuid`;
        const correct = (quantity) =>
          ops.inventoryWrite(admin, {
            action: 'correct',
            idempotencyKey: key(),
            lotId: lot.id,
            reason: 'ทดสอบแก้',
            quantity,
            totalCost: '100',
            manufacturedOn: '2026-01-01',
            expiresOn: '2029-01-01',
            warehouseId: main,
          });
        await rejects(() => correct(7), 409);
        await correct(5);
        assert.equal((await readPo(poId)).status, 'รับบางส่วน');
      });

      await test('ปิดใบที่รับบางส่วน (เหตุผล) → ปิดแล้ว รับต่อไม่ได้; ใบที่ยังไม่รับ → ยกเลิก', async () => {
        await rejects(() => poAct(poId, 'close'), 400);
        await poAct(poId, 'close', { reason: 'ผู้ขายของหมด' });
        const row = await readPo(poId);
        assert.equal(row.status, 'ปิดแล้ว');
        assert.equal(row.closeReason, 'ผู้ขายของหมด');
        const l1 = row.lines.find((l) => l.productId === p1);
        await rejects(() => receive(1, { purchaseOrderLineId: l1.id }), 409);
        const other = (
          await createPo(admin, supplierId, [{ productId: p1, quantity: 2, unitCost: '1' }])
        ).data.id;
        await rejects(() => poAct(other, 'close', { reason: 'x' }), 409);
        await poAct(other, 'cancel', { reason: 'สั่งผิด' });
        assert.equal((await readPo(other)).status, 'ยกเลิก');
        const list = await buy.purchaseRead(
          admin,
          new URLSearchParams({ status: 'ยกเลิก', search: prefix }),
        );
        assert.ok(list.data.some((po) => po.id === other));
      });

      await test('รับเข้าแบบไม่มีใบสั่งซื้อยังได้ และเลือกผู้ขายได้', async () => {
        const plain = await receive(3);
        assert.equal(plain.data.purchaseOrderId, null);
        const withSupplier = await receive(2, { supplierId });
        const [receipt] =
          await tx.$queryRaw`SELECT supplier_id AS "supplierId",purchase_order_line_id AS "lineId" FROM stock_receipts WHERE id=${withSupplier.data.id}::uuid`;
        assert.equal(receipt.supplierId, supplierId);
        assert.equal(receipt.lineId, null);
      });

      await test('Handler: 401 ไม่ login, DELETE ผู้ขาย = ลบ (ต้องมีเหตุผล), Sales อ่านได้แต่เขียนไม่ได้', async () => {
        const request = (method, body, params = {}) => ({
          method,
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        identity = null;
        assert.equal((await purchasingHandler(request('GET'), 'suppliers')).status, 401);
        identity = await tx.user.findUnique({
          where: { id: sales.id },
          include: { userRole: true },
        });
        assert.equal(
          (await purchasingHandler(request('GET', undefined, { search: prefix }), 'purchases'))
            .status,
          200,
        );
        assert.equal(
          (await purchasingHandler(request('POST', { idempotencyKey: key() }), 'suppliers')).status,
          403,
        );
        identity = await tx.user.findUnique({
          where: { id: admin.id },
          include: { userRole: true },
        });
        const id = (await supplier(admin, { name: 'ผู้ขายลบ ' + prefix })).data.id;
        await savepoint(async () => {
          const missing = await purchasingHandler(
            request('DELETE', { idempotencyKey: key() }),
            'suppliers',
            id,
          );
          assert.equal(missing.status, 400);
        });
        const ok = await purchasingHandler(
          request('DELETE', { idempotencyKey: key(), reason: 'ทดสอบ' }),
          'suppliers',
          id,
        );
        assert.equal(ok.status, 200);
        assert.ok((await readSupplier(id)).deletedAt);
        const options = await (
          await purchasingHandler(request('GET', undefined, { view: 'options' }), 'suppliers')
        ).json();
        assert.ok(!options.data.some((s) => s.id === id));
      });

      await test('purchase_order_lines เปิด RLS และ client ไม่มีสิทธิ์', async () => {
        const [row] =
          await tx.$queryRaw`SELECT relrowsecurity AS rls, has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT') AS client FROM pg_class WHERE oid='public.purchase_order_lines'::regclass`;
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
