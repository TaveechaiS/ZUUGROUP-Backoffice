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
      const { dashboardData } = load('src/server/dashboard/service.ts');
      const { dashboardSections } = load('src/server/dashboard/sections.ts');
      const { salesReport } = load('src/server/reports/sales.ts');
      const { financeReport } = load('src/server/reports/finance.ts');
      const { billingRead } = load('src/server/billing/service.ts');
      const { GET } = load('src/app/api/dashboard/route.ts');
      const { bangkokDay } = load('src/server/operations/domain.ts');
      const today = bangkokDay();
      const month = new URLSearchParams({ from: today.slice(0, 8) + '01', to: today });
      async function test(name, fn) {
        await fn();
        passed++;
        console.log('PASS: ' + name);
      }
      const [admin] =
        await tx.$queryRaw`SELECT u.id,u.name FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role_id='ADMIN' LIMIT 1`;
      const [sales] =
        await tx.$queryRaw`SELECT u.id,u.name FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role_id='SALES' ORDER BY (SELECT count(*) FROM sales_territory_sales m WHERE m.user_id=u.id) DESC LIMIT 1`;
      const adminActor = { ...admin, roleId: 'ADMIN' };
      const salesActor = sales
        ? { ...sales, roleId: 'SALES' }
        : { id: crypto.randomUUID(), name: 'T301', roleId: 'SALES' };

      await test('sections follow role rules', () => {
        assert.deepEqual(
          { ...dashboardSections('ADMIN') },
          {
            finance: true,
            purchases: true,
            inventory: true,
            customerRequests: true,
          },
        );
        assert.deepEqual(
          { ...dashboardSections('SALES') },
          {
            finance: false,
            purchases: false,
            inventory: false,
            customerRequests: false,
          },
        );
        assert.equal(dashboardSections('ACCOUNTING_CFO').finance, true);
        assert.equal(dashboardSections('ACCOUNTING_CFO').inventory, false);
        assert.equal(dashboardSections('MANAGER').purchases, false);
      });

      await test('admin dashboard matches sales and finance reports', async () => {
        const data = await dashboardData(adminActor);
        assert.equal(data.today, today);
        assert.equal(data.sales.trend.length, 12);
        assert.equal(data.sales.trend.at(-1).month, today.slice(0, 7));
        assert.equal(data.sales.trend.at(-1).total, data.sales.total);
        const report = await salesReport(adminActor, 'summary', month);
        assert.equal(data.sales.total, report.summary.total);
        assert.equal(data.sales.orders, report.summary.orders);
        const aging = await financeReport(adminActor, 'aging', new URLSearchParams());
        assert.equal(data.finance.outstanding, aging.totalAmount);
        const buckets = Object.values(data.finance.aging).reduce((s, v) => s + Number(v), 0);
        assert.equal(buckets.toFixed(2), Number(data.finance.outstanding).toFixed(2));
        assert.ok(data.inventory);
        assert.ok(data.inventory.expiring.length <= 5 && data.inventory.lowStock.length <= 5);
        assert.ok(data.tasks.some((t) => t.key === 'requests'));
        assert.ok(data.tasks.some((t) => t.key === 'overdue'));
        assert.ok(data.sales.topProducts.length <= 5 && data.sales.topCustomers.length <= 5);
      });

      await test('sales dashboard shows own sales and own work, hides finance/stock', async () => {
        const data = await dashboardData(salesActor);
        assert.equal(data.mine, true);
        assert.equal(data.finance, null);
        assert.equal(data.inventory, null);
        assert.ok(!data.tasks.some((t) => t.key === 'requests'));
        assert.deepEqual(
          [...data.tasks.map((t) => t.key)],
          [
            'quotes',
            'followToday',
            'followLate',
            'quotesReturned',
            'quotesExpiring',
            'ordersWaiting',
            'ordersReturned',
            'requestsReturned',
            'overdue',
          ],
        );
        assert.ok(data.activity.every((row) => row.module === 'quotes'));
        const params = new URLSearchParams(month);
        params.set('sellerId', salesActor.id);
        const report = await salesReport(salesActor, 'summary', params);
        assert.equal(data.sales.total, report.summary.total);
        const [own] =
          await tx.$queryRaw`SELECT count(*)::int AS n FROM sales_orders o WHERE o.deleted_at IS NULL AND o.workflow_managed AND o.status='รอตรวจ' AND o.created_by_id=${salesActor.id}::uuid`;
        assert.equal(data.tasks.find((t) => t.key === 'ordersWaiting').count, own.n);
        assert.equal((await dashboardData(adminActor)).mine, false);
      });

      await test('manager dashboard shows approvals and team sales matching sellers report', async () => {
        const managerActor = { ...adminActor, roleId: 'MANAGER' };
        const data = await dashboardData(managerActor);
        assert.equal(data.mine, false);
        assert.ok(data.team);
        assert.equal(data.tasks[0].key, 'ordersPending');
        assert.ok(data.tasks[0].href.startsWith('/orders?status='));
        const [waiting] =
          await tx.$queryRaw`SELECT count(*)::int AS n FROM sales_orders o WHERE o.deleted_at IS NULL AND o.workflow_managed AND o.status='รอตรวจ'`;
        assert.equal(data.tasks[0].count, waiting.n);
        const [quotes] =
          await tx.$queryRaw`SELECT count(*)::int AS n FROM quotations q WHERE q.deleted_at IS NULL AND q.status='รออนุมัติ'`;
        assert.equal(data.tasks.find((t) => t.key === 'quotes').count, quotes.n);
        const sellers = await salesReport(managerActor, 'sellers', month);
        const top = [...sellers.data].sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 5);
        assert.deepEqual(
          data.team.sellers.map((r) => r.total),
          top.map((r) => r.total),
        );
        assert.equal(
          data.team.territories.reduce((n, r) => n + Number(r.total), 0).toFixed(2),
          Number(data.sales.total).toFixed(2),
        );
        assert.ok(data.tasks.some((t) => t.key === 'requestsReturned'));
        assert.ok(!data.tasks.some((t) => t.key === 'requests'));
        assert.equal((await dashboardData(salesActor)).team, null);
      });

      await test('cfo dashboard shows billing work, expenses and no sales approvals', async () => {
        const cfoActor = { ...adminActor, roleId: 'ACCOUNTING_CFO' };
        const data = await dashboardData(cfoActor);
        assert.equal(data.cfo, true);
        assert.equal(data.team, null);
        assert.deepEqual([...data.tasks.map((t) => t.key)], ['uninvoiced', 'overdue', 'dueSoon']);
        const pending = await billingRead(cfoActor, new URLSearchParams({ view: 'uninvoiced' }));
        if (pending.data.length < 200) assert.equal(data.tasks[0].count, pending.data.length);
        assert.equal(data.tasks[1].count, data.finance.overdueInvoices);
        const expenses = await financeReport(cfoActor, 'expenses', month);
        assert.equal(data.finance.expensesThisMonth, expenses.totalAmount);
        assert.equal((await dashboardData(adminActor)).cfo, false);
      });

      await test('route returns 401 without login and data with login', async () => {
        identity = null;
        const denied = await GET(new Request('http://x/api/dashboard'));
        assert.equal(denied.status, 401);
        identity = { id: admin.id, name: admin.name, userRole: { roleId: 'ADMIN' } };
        const ok = await GET(new Request('http://x/api/dashboard'));
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
console.log(`PASS: ${passed} dashboard tests`);
