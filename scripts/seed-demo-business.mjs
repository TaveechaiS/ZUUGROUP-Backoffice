import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import ts from 'typescript';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../src/generated/prisma/client.ts';

dotenv.config({ path: '.env.local', quiet: true });
const rehearse = process.argv.includes('--rehearse');
const apply = rehearse || process.argv.includes('--apply');
const nodeRequire = createRequire(import.meta.url);
const MARK = 'DEMO TASK-304';
const MONTHS = 12;
const ORDERS_PER_MONTH = 8;
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

let client = db;
const cache = new Map();
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
    Buffer,
    console,
    process,
    setTimeout,
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return crypto;
      if (name === '@/generated/prisma/client') return { Prisma };
      if (name === '@/server/db/prisma')
        return {
          getPrismaClient: () => client,
          readWithConnectionRetry: (fn) => fn(client),
          isClosedDatabaseConnection: () => false,
        };
      if (name.startsWith('@/')) {
        const base = 'src/' + name.slice(2);
        return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
      }
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      return nodeRequire(name);
    },
  });
  return exports;
}

let seed = 304;
const random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const between = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (list) => list[Math.floor(random() * list.length)];
const key = () => crypto.randomUUID();
const at = (day, hour = 10) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00+07:00`);

const ops = load('src/server/operations/service.ts');
const buy = load('src/server/purchasing/service.ts');
const quotes = load('src/server/quotes/service.ts');
const bill = load('src/server/billing/service.ts');
const exp = load('src/server/expenses/service.ts');
const fu = load('src/server/follow-ups/service.ts');
const sc = load('src/server/stock-counts/service.ts');
const { addDays, addMonths, bangkokDay } = load('src/server/operations/domain.ts');
const today = bangkokDay();
const min = (a, b) => (a < b ? a : b);

const counts = {
  openingLots: 0,
  purchases: 0,
  receipts: 0,
  quotes: 0,
  orders: 0,
  invoices: 0,
  payments: 0,
  expenses: 0,
  followUps: 0,
  stockCounts: 0,
};

async function main() {
  const [existing] =
    await client.$queryRaw`SELECT count(*)::int AS n FROM sales_orders WHERE notes=${MARK}`;
  if (existing.n) throw new Error(`มีข้อมูล ${MARK} อยู่แล้ว ${existing.n} คำสั่งซื้อ ไม่สร้างซ้ำ`);
  const [admin] =
    await client.$queryRaw`SELECT u.id,u.name FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role_id='ADMIN' AND u.status='ACTIVE' AND u.deleted_at IS NULL ORDER BY u.created_at LIMIT 1`;
  const [salesUser] =
    await client.$queryRaw`SELECT u.id,u.name FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role_id='SALES' AND u.status='ACTIVE' AND u.deleted_at IS NULL ORDER BY u.created_at LIMIT 1`;
  if (!admin) throw new Error('ไม่พบ Admin ที่ใช้งานได้');
  const actor = { ...admin, roleId: 'ADMIN' };
  const sales = salesUser && { ...salesUser, roleId: 'SALES' };
  const customers =
    await client.$queryRaw`SELECT id,name FROM customers WHERE deleted_at IS NULL AND details IS NOT NULL AND status='ใช้งาน' ORDER BY code`;
  const salesCustomers = sales
    ? await client.$queryRaw`SELECT c.id FROM customers c JOIN sales_territory_sales m ON m.territory_id=c.territory_id WHERE m.user_id=${sales.id}::uuid AND c.deleted_at IS NULL AND c.details IS NOT NULL AND c.status='ใช้งาน'`
    : [];
  const products =
    await client.$queryRaw`SELECT id,name,sale_price::float8 AS price FROM products WHERE deleted_at IS NULL AND status='ACTIVE' ORDER BY code`;
  const [main] = await client.$queryRaw`SELECT id FROM warehouses WHERE code='MAIN'`;
  const categories =
    await client.$queryRaw`SELECT id,name FROM customer_options WHERE kind='expenseCategory' AND active ORDER BY name`;
  const [policy] =
    await client.$queryRaw`SELECT sale_months AS "saleMonths" FROM inventory_policy WHERE id=1`;
  if (customers.length < 3 || products.length < 4 || !categories.length)
    throw new Error('ข้อมูลหลักไม่พอ: ต้องมีลูกค้า ≥3, สินค้า ≥4, หมวดค่าใช้จ่าย ≥1');

  const dead = products.at(-1);
  const scarce = products.at(-2);
  const selling = products.slice(0, -1);
  const firstMonth = addMonths(today.slice(0, 8) + '01', -(MONTHS - 1));
  const sellable = addMonths(today, (policy?.saleMonths ?? 6) + 18);
  const plan = {
    target: new URL(process.env.DATABASE_URL).hostname.split('.')[0],
    from: firstMonth,
    to: today,
    customers: customers.length,
    products: products.length,
    orders: MONTHS * ORDERS_PER_MONTH,
    purchases: MONTHS * 3,
    expenses: MONTHS * 5,
    followUps: MONTHS * 4,
    actor: actor.name,
    pendingQuotesBy: sales?.name ?? '-',
  };
  console.log(apply ? 'APPLY' : 'DRY-RUN', JSON.stringify(plan));
  if (!apply) return;

  const receive = async (productId, quantity, unitCost, expiresOn, day, purchaseOrderLineId) => {
    const code = (await ops.operationOptions(actor, 'receive')).data.nextReceiptCode;
    const result = await ops.inventoryWrite(actor, {
      action: 'receive',
      idempotencyKey: key(),
      code,
      ...(purchaseOrderLineId ? { purchaseOrderLineId } : {}),
      lots: [
        {
          productId,
          warehouseId: main.id,
          quantity,
          totalCost: (unitCost * quantity).toFixed(2),
          manufacturedOn: min(addDays(day, -30), today),
          expiresOn,
        },
      ],
    });
    const receiptId = result.data?.receiptId ?? result.data?.id;
    const [receipt] = receiptId
      ? [{ id: receiptId }]
      : await client.$queryRaw`SELECT id FROM stock_receipts WHERE code=${code}`;
    await client.$executeRaw`UPDATE stock_receipts SET created_at=${at(day, 9)} WHERE id=${receipt.id}::uuid`;
    await client.$executeRaw`UPDATE product_lots SET created_at=${at(day, 9)} WHERE receipt_id=${receipt.id}::uuid`;
    await client.$executeRaw`UPDATE stock_movements SET occurred_at=${at(day, 9)} WHERE source_id=${receipt.id}::uuid`;
    counts.receipts++;
  };

  const opening = addDays(firstMonth, -3);
  for (const product of products) {
    const quantity = product === scarce ? 90 : product === dead ? 60 : between(500, 800);
    await receive(
      product.id,
      quantity,
      product.price * 0.6,
      addDays(sellable, between(0, 200)),
      opening,
    );
    counts.openingLots++;
  }
  for (const [product, days] of [
    [products[0], 45],
    [products[1], 75],
  ]) {
    await receive(product.id, 30, product.price * 0.6, addDays(today, days), opening);
    counts.openingLots++;
  }

  const orderUpdatedAt = async (id) =>
    new Date((await ops.orderRead(actor, new URLSearchParams(), id)).data.updatedAt).toISOString();
  const invoiceUpdatedAt = async (id) => {
    const value = (await bill.billingRead(actor, new URLSearchParams(), id)).data.updatedAt;
    return new Date(value).toISOString();
  };
  const lines = () =>
    Array.from(new Set(Array.from({ length: between(1, 3) }, () => pick(selling)))).map(
      (product) => ({
        productId: product.id,
        quantity: product === scarce ? between(2, 6) : between(5, 40),
        ...(random() < 0.25 ? { discount: (product.price * 0.05 * between(1, 4)).toFixed(2) } : {}),
      }),
    );

  for (let m = MONTHS - 1; m >= 0; m--) {
    const monthStart = addMonths(today.slice(0, 8) + '01', -m);
    const lastDay = min(addDays(addMonths(monthStart, 1), -1), today);
    const span = Math.max(0, Math.round((Date.parse(lastDay) - Date.parse(monthStart)) / 86400000));
    const dayIn = (from = 0) => addDays(monthStart, Math.min(span, between(from, span)));

    for (let p = 0; p < 3; p++) {
      const orderDate = dayIn(0);
      const expectedOn = addDays(orderDate, between(5, 12));
      const items = Array.from(new Set([pick(selling), pick(selling)])).map((product) => ({
        productId: product.id,
        quantity: between(80, 200),
        unitCost: (product.price * 0.6).toFixed(2),
      }));
      const created = await buy.purchaseWrite(actor, {
        idempotencyKey: key(),
        lines: items,
        orderDate,
        expectedOn,
        notes: MARK,
      });
      const poId = created.data.id;
      await client.$executeRaw`UPDATE purchase_orders SET created_at=${at(orderDate, 9)} WHERE id=${poId}::uuid`;
      counts.purchases++;
      const receivedOn = addDays(expectedOn, between(-2, 6));
      if (receivedOn > today || (m === 0 && p === 0)) continue;
      const poLines =
        await client.$queryRaw`SELECT id,product_id AS "productId",quantity,unit_cost::float8 AS "unitCost" FROM purchase_order_lines WHERE purchase_order_id=${poId}::uuid`;
      for (const line of poLines)
        await receive(
          line.productId,
          line.quantity,
          line.unitCost,
          addDays(sellable, between(200, 500)),
          receivedOn,
          line.id,
        );
    }

    for (let o = 0; o < ORDERS_PER_MONTH; o++) {
      const customer = pick(customers);
      const createdOn = dayIn(0);
      const soldOn = min(addDays(createdOn, between(0, 2)), today);
      let orderId;
      const quote = await quotes.quoteWrite(actor, {
        idempotencyKey: key(),
        customerId: customer.id,
        lines: lines(),
        notes: MARK,
      });
      const quoteId = quote.data.id;
      await quotes.quoteWrite(actor, { idempotencyKey: key(), action: 'convert' }, quoteId);
      const [order] =
        await client.$queryRaw`SELECT id FROM sales_orders WHERE quotation_id=${quoteId}::uuid`;
      orderId = order.id;
      await client.$executeRaw`UPDATE sales_orders SET notes=${MARK} WHERE id=${orderId}::uuid`;
      await client.$executeRaw`UPDATE quotations SET created_at=${at(createdOn, 9)},updated_at=${at(createdOn, 10)},valid_until=${addDays(createdOn, 30)}::date WHERE id=${quoteId}::uuid`;
      counts.quotes++;
      const cancelled = random() < 0.05;
      if (cancelled) {
        await ops.orderWrite(
          actor,
          { idempotencyKey: key(), action: 'cancel', reason: 'ลูกค้ายกเลิก' },
          orderId,
        );
      } else {
        await ops.orderWrite(
          actor,
          {
            idempotencyKey: key(),
            action: 'complete',
            expectedUpdatedAt: await orderUpdatedAt(orderId),
          },
          orderId,
        );
        await client.$executeRaw`UPDATE stock_movements SET occurred_at=${at(soldOn, 14)} WHERE source_id=${orderId}::uuid`;
      }
      await client.$executeRaw`UPDATE sales_orders SET created_at=${at(createdOn, 10)},updated_at=${at(soldOn, 14)} WHERE id=${orderId}::uuid`;
      counts.orders++;
      if (cancelled || (m === 0 && o >= ORDERS_PER_MONTH - 3)) continue;

      const issueDate = min(addDays(soldOn, between(0, 3)), today);
      const invoice = await bill.billingWrite(actor, {
        idempotencyKey: key(),
        salesOrderId: orderId,
        issueDate,
        notes: MARK,
      });
      const invoiceId = invoice.data.id;
      await client.$executeRaw`UPDATE invoices SET created_at=${at(issueDate, 11)} WHERE id=${invoiceId}::uuid`;
      counts.invoices++;
      const [row] =
        await client.$queryRaw`SELECT amount::float8 AS amount,due_date::text AS "dueDate" FROM invoices WHERE id=${invoiceId}::uuid`;
      const roll = random();
      const old = row.dueDate < addDays(today, -10);
      const payments =
        old && roll < 0.82
          ? [row.amount]
          : old && roll < 0.92
            ? [Math.floor(row.amount * 0.5)]
            : !old && roll < 0.35
              ? [row.amount]
              : [];
      let paidOn = issueDate;
      for (const amount of payments) {
        paidOn = min(addDays(row.dueDate, between(-15, 12)), today);
        if (paidOn < issueDate) paidOn = issueDate;
        await bill.billingWrite(
          actor,
          {
            idempotencyKey: key(),
            action: 'pay',
            expectedUpdatedAt: await invoiceUpdatedAt(invoiceId),
            paidOn,
            amount: amount.toFixed(2),
            method: pick(['โอน', 'โอน', 'เงินสด', 'เช็ค']),
            notes: MARK,
          },
          invoiceId,
        );
        await client.$executeRaw`UPDATE invoice_payments SET created_at=${at(paidOn, 15)} WHERE invoice_id=${invoiceId}::uuid AND created_at>${at(paidOn, 15)}`;
        counts.payments++;
      }
    }

    for (let q = 0; q < 2; q++) {
      const createdOn = dayIn(0);
      const quote = await quotes.quoteWrite(actor, {
        idempotencyKey: key(),
        customerId: pick(customers).id,
        lines: lines(),
        notes: MARK,
      });
      await client.$executeRaw`UPDATE quotations SET created_at=${at(createdOn, 9)},updated_at=${at(createdOn, 10)},valid_until=${addDays(createdOn, 30)}::date WHERE id=${quote.data.id}::uuid`;
      counts.quotes++;
    }

    for (let e = 0; e < 5; e++) {
      const category = pick(categories);
      const expenseDate = dayIn(0);
      const created = await exp.expenseWrite(actor, {
        idempotencyKey: key(),
        name: category.name,
        expenseDate,
        categoryId: category.id,
        amount: (between(5, 150) * 100).toFixed(2),
        payee: pick([
          'บริษัท ขนส่งด่วน จำกัด',
          'ร้านเครื่องเขียนไทย',
          'การไฟฟ้า',
          'ปั๊มน้ำมันพหลโยธิน',
        ]),
        notes: MARK,
      });
      await client.$executeRaw`UPDATE expenses SET created_at=${at(expenseDate, 16)} WHERE id=${created.data.id}::uuid`;
      counts.expenses++;
    }

    for (let f = 0; f < 4; f++) {
      const contactedOn = dayIn(0);
      const owner = sales && salesCustomers.length && random() < 0.5 ? sales : actor;
      const customer = owner === sales ? pick(salesCustomers) : pick(customers);
      const created = await fu.followUpWrite(owner, {
        idempotencyKey: key(),
        customerId: customer.id,
        name: pick(['เสนอสินค้าใหม่', 'ติดตามใบเสนอราคา', 'ทวงถามการชำระ', 'นัดเข้าพบ']),
        contactedOn,
        channel: pick(['โทร', 'เข้าพบ', 'LINE', 'อีเมล']),
        nextOn: addDays(contactedOn, between(3, 14)),
        summary: 'บันทึกตัวอย่างการติดตาม',
        notes: MARK,
      });
      const followUpId = created.data.id;
      const pending = m === 0 && f < 2;
      if (!pending)
        await fu.followUpWrite(
          actor,
          { idempotencyKey: key(), action: 'done', result: 'ลูกค้ารับทราบ' },
          followUpId,
        );
      await client.$executeRaw`UPDATE customer_follow_ups SET created_at=${at(contactedOn, 13)} WHERE id=${followUpId}::uuid`;
      counts.followUps++;
    }
  }

  if (sales && salesCustomers.length)
    for (let q = 0; q < 3; q++) {
      await quotes.quoteWrite(sales, {
        idempotencyKey: key(),
        customerId: pick(salesCustomers).id,
        lines: lines(),
        notes: MARK,
      });
      counts.quotes++;
    }

  const countSession = async (closedOn) => {
    const created = await sc.stockCountWrite(actor, {
      idempotencyKey: key(),
      warehouseId: main.id,
      name: 'ตรวจนับคลังหลัก',
      notes: MARK,
    });
    const id = created.data.id;
    const countLines =
      await client.$queryRaw`SELECT id,system_quantity AS "systemQuantity" FROM stock_count_lines WHERE session_id=${id}::uuid`;
    await sc.stockCountWrite(
      actor,
      {
        idempotencyKey: key(),
        action: 'count',
        lines: countLines.map((line, index) => ({
          id: line.id,
          countedQuantity: Math.max(0, line.systemQuantity - (index % 4 === 0 ? between(1, 3) : 0)),
          ...(index % 4 === 0 ? { note: 'ชำรุด' } : {}),
        })),
      },
      id,
    );
    if (closedOn) {
      await sc.stockCountWrite(actor, { idempotencyKey: key(), action: 'close' }, id);
      await client.$executeRaw`UPDATE stock_count_sessions SET created_at=${at(addDays(closedOn, -1), 9)},closed_at=${at(closedOn, 17)} WHERE id=${id}::uuid`;
    }
    counts.stockCounts++;
  };
  await countSession(addDays(today, -60));
  await countSession(null);
}

const rollback = Error('REHEARSAL_ROLLBACK');
try {
  if (apply)
    await db
      .$transaction(
        async (tx) => {
          client = new Proxy(tx, {
            get: (target, name) =>
              name === '$transaction'
                ? (fn) => fn(tx)
                : typeof target[name] === 'function'
                  ? target[name].bind(target)
                  : target[name],
          });
          await main();
          if (rehearse) throw rollback;
        },
        { timeout: 1800000, maxWait: 30000 },
      )
      .catch((error) => {
        if (error !== rollback) throw error;
      });
  else await main();
} finally {
  await db.$disconnect();
}
console.log(
  rehearse
    ? 'PASS: rehearsal rolled back ' + JSON.stringify(counts)
    : apply
      ? 'PASS: seeded ' + JSON.stringify(counts)
      : 'DRY-RUN only; run with --rehearse to test or --apply to write',
);
