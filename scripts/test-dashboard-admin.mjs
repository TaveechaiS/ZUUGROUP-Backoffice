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
let passed = 0;
try {
  await db.$transaction(
    async (tx) => {
      const cache = new Map();
      let identity = null;
      const client = new Proxy(tx, {
        get: (target, key) =>
          key === '$transaction'
            ? (fn) => fn(tx)
            : typeof target[key] === 'function'
              ? target[key].bind(target)
              : target[key],
      });
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
          URL,
          URLSearchParams,
          Response,
          Headers,
          Buffer,
          console,
          process,
          require(name) {
            if (name === 'server-only') return {};
            if (name === 'node:crypto') return crypto;
            if (name === '@/generated/prisma/client') return { Prisma };
            if (name === '@/server/db/prisma')
              return {
                getPrismaClient: () => client,
                readWithConnectionRetry: (fn) => fn(client),
              };
            if (name === '@/server/auth/current-user')
              return { getCurrentApiUser: async () => identity };
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
      const { adminDashboard, adminRange } = load('src/server/dashboard/admin.ts');
      const { salesReport } = load('src/server/reports/sales.ts');
      const { financeReport } = load('src/server/reports/finance.ts');
      const { billingRead } = load('src/server/billing/service.ts');
      const { GET } = load('src/app/api/dashboard/admin/route.ts');
      const { bangkokDay } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      async function test(name, fn) {
        await fn();
        passed++;
        console.log('PASS: ' + name);
      }
      const [admin] =
        await tx.$queryRaw`SELECT u.id,u.name FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role_id='ADMIN' LIMIT 1`;
      const adminActor = { ...admin, roleId: 'ADMIN' };
      const params = (extra = {}) =>
        new URLSearchParams({ from: '2026-01-01', to: today, ...extra });

      await test('range: previous period has same length and unit switches to month', () => {
        const short = adminRange(new URLSearchParams({ from: '2026-10-01', to: '2026-10-19' }));
        assert.equal(short.prevTo, '2026-09-30');
        assert.equal(short.prevFrom, '2026-09-12');
        assert.equal(short.unit, 'day');
        assert.equal(adminRange(params()).unit, 'month');
        assert.throws(
          () => adminRange(new URLSearchParams({ from: '2026-10-19', to: '2026-10-01' })),
          (e) => e.status === 400,
        );
      });

      await test('summary numbers match sales, finance and billing reports', async () => {
        const { data } = await adminDashboard(params());
        const sales = await salesReport(adminActor, 'summary', params());
        assert.equal(data.sales.total, sales.summary.total);
        assert.equal(data.sales.orders, sales.summary.orders);
        const trendTotal = data.sales.trend.reduce((s, r) => s + Number(r.total), 0);
        assert.equal(trendTotal.toFixed(2), Number(data.sales.total).toFixed(2));
        const aging = await financeReport(adminActor, 'aging', new URLSearchParams());
        assert.equal(data.finance.outstanding, aging.totalAmount);
        const payments = await financeReport(adminActor, 'payments', params());
        assert.equal(data.finance.received, payments.totalAmount);
        const expenses = await financeReport(adminActor, 'expenses', params());
        assert.equal(data.finance.expenses, expenses.totalAmount);
        const pending = await billingRead(adminActor, new URLSearchParams({ view: 'uninvoiced' }));
        if (pending.data.length < 200) assert.equal(data.finance.uninvoiced, pending.data.length);
        const buckets = Object.values(data.finance.aging).reduce((s, v) => s + Number(v), 0);
        assert.equal(buckets.toFixed(2), Number(data.finance.outstanding).toFixed(2));
        assert.equal(
          data.customers.statuses.reduce((s, r) => s + r.count, 0),
          data.customers.total,
        );
        assert.equal(
          data.products.statuses.reduce((s, r) => s + r.count, 0),
          data.products.total,
        );
        assert.equal(data.stock.warehouses.length, 3);
        assert.equal(
          (
            Number(data.sales.gross) -
            Number(data.sales.lineDiscount) -
            Number(data.sales.billDiscount)
          ).toFixed(2),
          Number(data.sales.total).toFixed(2),
        );
        assert.equal(
          data.sales.newCustomers + data.sales.repeatCustomers,
          data.sales.customersBuying,
        );
        assert.ok(data.finance.dso === null || Number.isInteger(data.finance.dso));
        assert.equal(
          (Number(data.sales.net) - Number(data.sales.cost) - Number(data.sales.giftCost)).toFixed(
            2,
          ),
          data.sales.profit,
        );
        const [cogs] =
          await tx.$queryRaw`SELECT COALESCE(round(sum(r.quantity*r.unit_cost),2),0)::numeric(14,2)::text AS cost FROM stock_reservations r JOIN sales_order_lines li ON li.id=r.order_line_id AND NOT li.is_gift JOIN sales_orders o ON o.id=li.order_id WHERE r.status='จ่ายแล้ว' AND o.deleted_at IS NULL AND o.workflow_managed AND o.status='เสร็จสิ้น' AND (SELECT (max(m.occurred_at) AT TIME ZONE 'Asia/Bangkok')::date FROM stock_movements m WHERE m.source_id=o.id AND m.kind='ขาย') BETWEEN '2026-01-01'::date AND ${today}::date`;
        assert.equal(data.sales.cost, cogs.cost);
        assert.ok(data.stock.lateReceipts <= data.stock.receivedPurchases);
        assert.ok(data.customers.quotesExpiring >= 0 && data.customers.quotesPending >= 0);
        const [dead] =
          await tx.$queryRaw`SELECT count(*)::int AS n FROM products p WHERE p.deleted_at IS NULL AND p.status='ACTIVE' AND EXISTS (SELECT 1 FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id WHERE l.product_id=p.id AND b.quantity>0 AND l.created_at<=now()-interval '90 days') AND NOT EXISTS (SELECT 1 FROM stock_movements m JOIN product_lots l ON l.id=m.lot_id WHERE l.product_id=p.id AND m.kind='ขาย' AND m.occurred_at>=now()-interval '90 days')`;
        assert.ok(Math.abs(dead.n - data.stock.deadStock) <= 1);
      });

      await test('every detail section loads with at most 20 rows per list', async () => {
        for (const section of ['sales', 'finance', 'stock', 'customers', 'products', 'system']) {
          const result = await adminDashboard(params({ section }));
          assert.equal(result.section, section);
          for (const rows of Object.values(result.data))
            assert.ok(Array.isArray(rows) && rows.length <= 20, section);
        }
        await assert.rejects(
          () => adminDashboard(params({ section: 'secret' })),
          (e) => e.status === 400,
        );
      });

      await test('route: 401 without login, 403 for non-Admin, 200 for Admin', async () => {
        identity = null;
        assert.equal((await GET(new Request('http://x/api/dashboard/admin'))).status, 401);
        for (const roleId of ['SALES', 'MANAGER', 'ACCOUNTING_CFO']) {
          identity = { id: admin.id, name: admin.name, userRole: { roleId } };
          assert.equal((await GET(new Request('http://x/api/dashboard/admin'))).status, 403);
        }
        identity = { id: admin.id, name: admin.name, userRole: { roleId: 'ADMIN' } };
        const ok = await GET(new Request('http://x/api/dashboard/admin'));
        assert.equal(ok.status, 200);
        assert.equal(ok.headers.get('Cache-Control'), 'private, no-store');
        assert.equal((await ok.json()).data.today, today);
      });
      throw rollback;
    },
    { timeout: 60000, maxWait: 20000 },
  );
} catch (error) {
  if (error !== rollback) throw error;
} finally {
  await db.$disconnect();
}
console.log(`PASS: ${passed} admin dashboard tests`);
