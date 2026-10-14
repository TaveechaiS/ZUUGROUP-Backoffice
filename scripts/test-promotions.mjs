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
  db.$queryRaw`SELECT (SELECT count(*)::int FROM promotions) AS promotions,(SELECT count(*)::int FROM promotion_products) AS "promotionProducts",(SELECT count(*)::int FROM promotion_gifts) AS gifts,(SELECT count(*)::int FROM users) AS users`;
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
      const promo = load('src/server/promotions/service.ts');
      const { promotionsHandler } = load('src/server/promotions/handler.ts');
      const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const key = () => crypto.randomUUID();
      const prefix = 'T278-' + key().slice(0, 8);
      async function savepoint(fn) {
        await tx.$executeRawUnsafe('SAVEPOINT promotion_test');
        try {
          return await fn();
        } finally {
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT promotion_test');
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT promotion_test');
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
      const marketing = (await tx.warehouse.findUnique({ where: { code: 'MARKETING' } })).id;
      const disposal = (await tx.warehouse.findUnique({ where: { code: 'DISPOSAL' } })).id;
      const base = (extra = {}) => ({
        idempotencyKey: key(),
        name: 'โปรทดสอบ ' + prefix,
        startsOn: today,
        endsOn: addDays(today, 30),
        minType: 'จำนวน',
        minValue: '10',
        rewardType: 'ของแถม',
        productIds: [p1],
        gifts: [{ productId: p2, quantity: 1, warehouseId: marketing }],
        ...extra,
      });
      const create = (actor, extra) => promo.promotionWrite(actor, base(extra));
      const read = async (id) => (await promo.promotionRead(admin, new URLSearchParams(), id)).data;
      const list = (params) =>
        promo.promotionRead(admin, new URLSearchParams({ search: prefix, ...params }));

      let promotionId;
      await test('Admin สร้างโปรของแถม → PR ปี พ.ศ. สถานะใช้งาน มีสินค้าที่ร่วมและของแถม; Sales สร้างไม่ได้', async () => {
        const created = await create(admin);
        promotionId = created.data.id;
        assert.match(created.data.code, /^PR-25\d\d-\d{4}$/);
        const row = await read(promotionId);
        assert.equal(row.status, 'ใช้งาน');
        assert.equal(row.products.length, 1);
        assert.equal(row.gifts.length, 1);
        assert.equal(row.gifts[0].warehouseName, 'คลังการตลาด');
        assert.equal(row.createdByName, admin.name);
        await rejects(() => create(sales), 403);
      });

      await test('ตรวจข้อมูล: วันสิ้นสุดก่อนเริ่ม, ไม่มีสินค้า, ของแถมว่าง, คลังทำลาย, % เกิน 100, สินค้าซ้ำ, จำนวนทศนิยม', async () => {
        await rejects(() => create(admin, { endsOn: addDays(today, -1) }), 400);
        await rejects(() => create(admin, { productIds: [] }), 400);
        await rejects(() => create(admin, { gifts: [] }), 400);
        await rejects(
          () => create(admin, { gifts: [{ productId: p2, quantity: 1, warehouseId: disposal }] }),
          400,
        );
        await rejects(
          () => create(admin, { rewardType: 'ส่วนลด%', discountValue: '101', gifts: [] }),
          400,
        );
        await rejects(() => create(admin, { productIds: [p1, p1] }), 400);
        await rejects(() => create(admin, { minValue: '1.5' }), 400);
      });

      await test('ส่วนลดบาท/% ไม่บันทึกของแถม; ขั้นต่ำมูลค่ารับทศนิยม', async () => {
        const baht = await create(admin, {
          rewardType: 'ส่วนลดบาท',
          discountValue: '150.50',
          minType: 'มูลค่า',
          minValue: '5000.25',
        });
        const row = await read(baht.data.id);
        assert.equal(row.gifts.length, 0);
        assert.equal(row.discountValue, '150.50');
        assert.equal(row.minValue, '5000.25');
        const percent = await create(admin, { rewardType: 'ส่วนลด%', discountValue: '10' });
        assert.equal((await read(percent.data.id)).giftCount, 0);
      });

      await test('แก้ไขแทนที่สินค้าและของแถม; ข้อมูลเก่าถูกปฏิเสธ (409)', async () => {
        const before = await read(promotionId);
        await promo.promotionWrite(
          admin,
          base({
            action: 'edit',
            name: 'โปรแก้แล้ว ' + prefix,
            productIds: [p1, p2],
            gifts: [{ productId: p1, quantity: 2, warehouseId: marketing }],
            expectedUpdatedAt: before.updatedAt.toISOString?.() ?? before.updatedAt,
          }),
          promotionId,
        );
        const after = await read(promotionId);
        assert.equal(after.name, 'โปรแก้แล้ว ' + prefix);
        assert.equal(after.productCount, 2);
        assert.equal(after.gifts[0].quantity, 2);
        await rejects(
          () =>
            promo.promotionWrite(
              admin,
              base({ action: 'edit', expectedUpdatedAt: '2000-01-01T00:00:00.000Z' }),
              promotionId,
            ),
          409,
        );
      });

      await test('สถานะคำนวณ: หมดอายุเมื่อวันสิ้นสุดผ่านไป, ร่างคงร่าง; กรองตามแท็บและประเภทรางวัล', async () => {
        const old = await create(admin, {
          startsOn: addDays(today, -10),
          endsOn: addDays(today, -1),
        });
        const draft = await create(admin, { status: 'ร่าง', endsOn: addDays(today, 5) });
        assert.equal((await read(old.data.id)).status, 'หมดอายุ');
        assert.equal((await read(draft.data.id)).status, 'ร่าง');
        assert.ok((await list({ status: 'หมดอายุ' })).data.some((r) => r.id === old.data.id));
        assert.ok(!(await list({ status: 'ใช้งาน' })).data.some((r) => r.id === old.data.id));
        assert.ok((await list({ status: 'ร่าง' })).data.some((r) => r.id === draft.data.id));
        const discounts = await list({ rewardType: 'ส่วนลดบาท' });
        assert.ok(
          discounts.data.length && discounts.data.every((r) => r.rewardType === 'ส่วนลดบาท'),
        );
        await rejects(() => list({ status: 'ไม่มี' }), 400);
      });

      await test('ยกเลิกต้องมีเหตุผล; ยกเลิกแล้วแก้ไขไม่ได้', async () => {
        const act = (extra) =>
          promo.promotionWrite(
            admin,
            { idempotencyKey: key(), action: 'cancel', ...extra },
            promotionId,
          );
        await rejects(() => act({}), 400);
        await act({ reason: 'ทดสอบยกเลิก' });
        const cancelled = await read(promotionId);
        assert.equal(cancelled.status, 'ยกเลิก');
        assert.equal(cancelled.cancelReason, 'ทดสอบยกเลิก');
        await rejects(
          () => promo.promotionWrite(admin, base({ action: 'edit' }), promotionId),
          409,
        );
      });

      await test('Handler: 401 ไม่ login, Sales อ่านได้แต่เขียนไม่ได้, 404, DELETE = ยกเลิก', async () => {
        const request = (method, body, params = {}) => ({
          method,
          headers: new Headers(),
          nextUrl: { searchParams: new URLSearchParams(params) },
          json: async () => body,
        });
        identity = null;
        assert.equal((await promotionsHandler(request('GET'))).status, 401);
        identity = await tx.user.findUnique({
          where: { id: sales.id },
          include: { userRole: true },
        });
        assert.equal(
          (await promotionsHandler(request('GET', undefined, { search: prefix }))).status,
          200,
        );
        assert.equal((await promotionsHandler(request('POST', base()))).status, 403);
        identity = await tx.user.findUnique({
          where: { id: admin.id },
          include: { userRole: true },
        });
        assert.equal((await promotionsHandler(request('GET'), 'PR-0000-0000')).status, 404);
        const id = (await create(admin)).data.id;
        const ok = await promotionsHandler(
          request('DELETE', { idempotencyKey: key(), reason: 'ทดสอบ' }),
          id,
        );
        assert.equal(ok.status, 200);
        assert.equal((await read(id)).status, 'ยกเลิก');
      });

      await test('promotion_products/promotion_gifts เปิด RLS และ client ไม่มีสิทธิ์', async () => {
        const rows =
          await tx.$queryRaw`SELECT relrowsecurity AS rls, has_table_privilege('anon',oid,'SELECT') OR has_table_privilege('authenticated',oid,'SELECT') AS client FROM pg_class WHERE oid IN ('public.promotion_products'::regclass,'public.promotion_gifts'::regclass)`;
        assert.equal(rows.length, 2);
        assert.ok(rows.every((row) => row.rls && !row.client));
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
