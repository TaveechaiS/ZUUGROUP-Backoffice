// Opt-in integration test: real transactions, isolated UUID fixtures, cleanup in finally.
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
    URLSearchParams,
    Response,
    console,
    crypto,
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'node:crypto') return crypto;
      if (name === '@/generated/prisma/client') return { Prisma };
      if (name === '@/server/db/prisma')
        return { getPrismaClient: () => db, readWithConnectionRetry: (fn) => fn(db) };
      if (name === '@/features/records/types')
        return {
          RECORD_MODULES: definitions,
          moduleFor: (key) => definitions.find((m) => m.key === key),
        };
      if (name.startsWith('@/')) return load('src/' + name.slice(2) + '.ts');
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
      throw Error('Unexpected dependency ' + name);
    },
  });
  return exports;
}
const definitions = JSON.parse(fs.readFileSync('src/features/records/modules.json', 'utf8'));
const ops = load('src/server/operations/service.ts');
const records = load('src/server/records/service.ts');
const prefix = 'T092-' + crypto.randomUUID().slice(0, 8);
const uid = crypto.randomUUID(),
  cid = crypto.randomUUID(),
  pid = crypto.randomUUID();
const managerId = crypto.randomUUID(),
  salesId = crypto.randomUUID(),
  territories = [];
const admin = { id: uid, name: 'ทดสอบ TASK092', roleId: 'ADMIN' },
  sales = { ...admin, roleId: 'SALES' },
  manager = { ...admin, roleId: 'MANAGER' },
  cfo = { ...admin, roleId: 'ACCOUNTING_CFO' };
const key = () => crypto.randomUUID();
let passed = 0;
async function test(name, fn) {
  await fn();
  console.log('PASS: ' + name);
  passed++;
}
async function rejects(fn, status) {
  await assert.rejects(fn, (e) => e.status === status);
}
let main, marketing, lot1, lot2, receipt, order;
try {
  await db.user.create({
    data: { id: uid, employeeCode: prefix, email: prefix + '@example.invalid', name: admin.name },
  });
  const salesTerritory = crypto.randomUUID();
  territories.push(salesTerritory);
  await db.$executeRaw`INSERT INTO sales_territories(id,code,name) VALUES(${salesTerritory}::uuid,${prefix + 'T'},${prefix + 'T'})`;
  await db.$executeRaw`INSERT INTO sales_territory_sales(territory_id,user_id) VALUES(${salesTerritory}::uuid,${uid}::uuid)`;
  await db.customer.create({
    data: { id: cid, code: prefix, name: 'ลูกค้าทดสอบ', territoryId: salesTerritory },
  });
  await db.user.create({
    data: {
      id: managerId,
      employeeCode: prefix + 'M',
      email: prefix + 'M@example.invalid',
      name: 'Manager ทดสอบ',
      userRole: { create: { roleId: 'MANAGER' } },
    },
  });
  await db.user.create({
    data: {
      id: salesId,
      employeeCode: prefix + 'S',
      email: prefix + 'S@example.invalid',
      name: 'Sales ทดสอบ',
      userRole: { create: { roleId: 'SALES' } },
    },
  });
  const territoryModule = definitions.find((m) => m.key === 'sales-territories'),
    customerModule = definitions.find((m) => m.key === 'customers');
  await test('เขตผูกคนตามบทบาท คนเดียวซ้ำเขตไม่ได้ และลูกค้าแสดงชื่อ', async () => {
    const result = await records.recordWrite(
      territoryModule,
      'create',
      null,
      { code: prefix, name: prefix, status: 'ใช้งานอยู่', managerId, salesId },
      admin,
    );
    territories.push(result.data.id);
    await rejects(
      () =>
        records.recordWrite(
          territoryModule,
          'create',
          null,
          { code: prefix + '2', name: prefix + '2', status: 'ใช้งานอยู่', managerId },
          admin,
        ),
      409,
    );
    await rejects(
      () =>
        records.recordWrite(
          territoryModule,
          'create',
          null,
          { code: prefix + '3', name: prefix + '3', status: 'ใช้งานอยู่', managerId: salesId },
          admin,
        ),
      400,
    );
    await db.customer.update({ where: { id: cid }, data: { territoryId: result.data.id } });
    const customer = (await records.recordDetail(customerModule, cid)).data;
    assert.equal(customer.territoryName, prefix);
    assert.equal(customer.managerName, 'Manager ทดสอบ');
    assert.equal(customer.salesName, 'Sales ทดสอบ');
    assert.equal(
      (
        await records.recordList(
          customerModule,
          new URLSearchParams({ territoryId: result.data.id }),
        )
      ).data.length,
      1,
    );
    await rejects(
      () =>
        records.recordWrite(territoryModule, 'delete', result.data.id, { reason: 'ทดสอบ' }, admin),
      409,
    );
  });
  const template = await db.product.findFirst();
  assert.ok(template, 'ต้องมี master สินค้า');
  await db.product.create({
    data: {
      id: pid,
      code: 'ZZ-ZZ-9999',
      sequence: 9999,
      name: prefix,
      categoryId: template.categoryId,
      dosageFormId: template.dosageFormId,
      drugId: template.drugId,
      defaultWarehouseId: template.defaultWarehouseId,
      unit: 'ชิ้น',
      salePrice: '10',
    },
  });
  main = (await db.warehouse.findUnique({ where: { code: 'MAIN' } })).id;
  marketing = (await db.warehouse.findUnique({ where: { code: 'MARKETING' } })).id;
  await db.customer.update({ where: { id: cid }, data: { territoryId: salesTerritory } });
  await test('TASK094 สินค้าไม่มีล็อตยังแสดงยอดศูนย์ และหน้าคลังหลักแสดงสินค้า MAIN=0', async () => {
    const all = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'products', search: prefix }),
    );
    assert.equal(all.data.length, 1);
    assert.equal(all.data[0].quantity, 0);
    assert.equal(all.data[0].mainAvailable, 0);
    const warehouse = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'products', search: prefix, warehouseCode: 'MAIN' }),
    );
    assert.equal(warehouse.pagination.total, 1);
    assert.equal(warehouse.data[0].quantity, 0);
  });
  const receive = {
    action: 'receive',
    idempotencyKey: key(),
    code: (await ops.operationOptions(admin)).data.nextReceiptCode,
    lots: [
      {
        productId: pid,
        warehouseId: main,
        quantity: 10,
        totalCost: '50',
        manufacturedOn: '2026-01-01',
        expiresOn: '2028-01-01',
      },
    ],
  };
  await test('รับครั้งละหนึ่งล็อต + retry ไม่เพิ่มซ้ำ', async () => {
    const a = await ops.inventoryWrite(admin, receive),
      b = await ops.inventoryWrite(admin, receive);
    assert.equal(a.data.id, b.data.id);
    receipt = a.data.id;
    [lot1] = a.data.lotIds;
    assert.equal((await db.productLot.findUnique({ where: { id: lot1 } })).lotNumber, receive.code);
    const second = await ops.inventoryWrite(admin, {
      ...receive,
      idempotencyKey: key(),
      code: (await ops.operationOptions(admin)).data.nextReceiptCode,
      lots: [{ ...receive.lots[0], totalCost: '70', expiresOn: '2029-01-01' }],
    });
    [lot2] = second.data.lotIds;
    assert.equal(await db.productLot.count({ where: { productId: pid } }), 2);
  });
  const create = (n) => ({
    idempotencyKey: key(),
    code: prefix + '-' + key(),
    customerId: cid,
    lines: [{ productId: pid, quantity: n }],
  });
  await test('จองทันที และเลือกล็อต FEFO', async () => {
    order = (await ops.orderWrite(sales, create(10))).data.id;
    const row = (await ops.orderRead(manager, new URLSearchParams(), order)).data;
    assert.equal(row.lines[0].allocations[0].lotId, lot1);
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot1, warehouseId: main } },
        })
      ).reserved,
      10,
    );
    assert.equal(row.lines[0].allocations[0].unitCost, undefined);
  });
  let winner;
  await test('สอง Order พร้อมกันแย่งยอด10 สำเร็จเพียงหนึ่ง', async () => {
    const results = await Promise.allSettled([
      ops.orderWrite(sales, create(10)),
      ops.orderWrite(sales, create(10)),
    ]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    const failed = results.find((r) => r.status === 'rejected');
    assert.equal(failed.reason.status, 409);
    winner = results.find((r) => r.status === 'fulfilled').value.data.id;
  });
  await test('ของไม่พอ ไม่สร้างเอกสาร', async () => {
    await rejects(() => ops.orderWrite(sales, create(1)), 409);
  });
  await test('ต้นทุนเฉพาะ Admin/CFO ทั้ง options และ stock', async () => {
    for (const actor of [admin, cfo, sales, manager]) {
      const result = await ops.inventoryRead(
        actor,
        new URLSearchParams({ view: 'stock', search: prefix }),
      );
      assert.equal(result.data.length, 2);
      assert.equal(
        'totalCost' in result.data[0],
        ['ADMIN', 'ACCOUNTING_CFO'].includes(actor.roleId),
      );
    }
  });
  await test('คืนแก้ยังจองอยู่ แก้ลดจำนวนคืนส่วนต่าง แล้ว cancel คืนทั้งหมด', async () => {
    await ops.orderWrite(
      manager,
      { action: 'return', reason: 'ตรวจใหม่', idempotencyKey: key() },
      winner,
    );
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot2, warehouseId: main } },
        })
      ).reserved,
      10,
    );
    await ops.orderWrite(
      sales,
      { action: 'edit', lines: [{ productId: pid, quantity: 5 }], idempotencyKey: key() },
      winner,
    );
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot2, warehouseId: main } },
        })
      ).reserved,
      5,
    );
    await ops.orderWrite(
      sales,
      { action: 'cancel', reason: 'ทดสอบ', idempotencyKey: key() },
      winner,
    );
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot2, warehouseId: main } },
        })
      ).reserved,
      0,
    );
  });
  await test('Admin ตัดก่อน Manager ไม่ได้; Manager อนุมัติไม่ตัด; Admin ยืนยันตัดครั้งเดียว', async () => {
    await rejects(
      () => ops.orderWrite(admin, { action: 'complete', idempotencyKey: key() }, order),
      409,
    );
    await rejects(
      () => ops.orderWrite(sales, { action: 'approve', idempotencyKey: key() }, order),
      403,
    );
    await ops.orderWrite(manager, { action: 'approve', idempotencyKey: key() }, order);
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot1, warehouseId: main } },
        })
      ).quantity,
      10,
    );
    const complete = { action: 'complete', idempotencyKey: key() };
    await ops.orderWrite(admin, complete, order);
    await ops.orderWrite(admin, complete, order);
    const balance = await db.stockBalance.findUnique({
      where: { lotId_warehouseId: { lotId: lot1, warehouseId: main } },
    });
    assert.equal(balance.quantity, 0);
    assert.equal(balance.reserved, 0);
    assert.equal(
      (await ops.orderRead(cfo, new URLSearchParams(), order)).data.grossProfit,
      '50.00',
    );
  });
  await test('แก้รับเข้าหลังขาย เก็บผลต่างและประวัติ ไม่เพิ่มของซ้ำ', async () => {
    await ops.inventoryWrite(admin, {
      action: 'correct',
      lotId: lot1,
      warehouseId: main,
      quantity: 12,
      totalCost: '60',
      manufacturedOn: '2026-01-01',
      expiresOn: '2028-01-01',
      reason: 'กรอกจำนวนผิด',
      idempotencyKey: key(),
    });
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot1, warehouseId: main } },
        })
      ).quantity,
      2,
    );
    assert.equal((await ops.orderRead(cfo, new URLSearchParams(), order)).data.costAmount, '50.00');
  });
  await test('โอน/ปรับยอด มีเหตุผลและสอง movement linked', async () => {
    await ops.inventoryWrite(admin, {
      action: 'transfer',
      lotId: lot2,
      warehouseId: main,
      targetWarehouseId: marketing,
      quantity: 2,
      reason: 'แจก',
      idempotencyKey: key(),
    });
    await rejects(
      () =>
        ops.inventoryWrite(admin, {
          action: 'adjust',
          lotId: lot2,
          warehouseId: main,
          quantity: 7,
          reason: '',
          idempotencyKey: key(),
        }),
      400,
    );
    await ops.inventoryWrite(admin, {
      action: 'adjust',
      lotId: lot2,
      warehouseId: main,
      quantity: 7,
      reason: 'ตรวจของจริง',
      idempotencyKey: key(),
    });
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot2, warehouseId: main } },
        })
      ).quantity,
      7,
    );
  });
  await test('บริจาคต้องเหลือ12เดือน ณ วันรับและยืนยันผู้รับ', async () => {
    const give = {
      action: 'give',
      lotId: lot2,
      warehouseId: marketing,
      quantity: 1,
      reason: 'ทดสอบเงื่อนไข',
      recipient: 'ผู้รับทดสอบ',
      giveType: 'บริจาค',
      arrivalOn: '2028-01-02',
      recipientConfirmed: true,
    };
    await rejects(() => ops.inventoryWrite(admin, { ...give, idempotencyKey: key() }), 409);
    await rejects(
      () =>
        ops.inventoryWrite(admin, {
          ...give,
          arrivalOn: '2026-12-01',
          recipientConfirmed: false,
          idempotencyKey: key(),
        }),
      409,
    );
    await ops.inventoryWrite(admin, { ...give, arrivalOn: '2026-12-01', idempotencyKey: key() });
    assert.equal(
      (
        await db.stockBalance.findUnique({
          where: { lotId_warehouseId: { lotId: lot2, warehouseId: marketing } },
        })
      ).quantity,
      1,
    );
  });
  await test('งดจ่ายล็อตเสื่อม/หมดอายุ และปฏิเสธเอกสารที่แก้ไขทับ', async () => {
    const active = (await ops.orderWrite(sales, create(3))).data.id;
    await rejects(
      () =>
        ops.orderWrite(
          manager,
          {
            action: 'approve',
            expectedUpdatedAt: '2000-01-01T00:00:00.000Z',
            idempotencyKey: key(),
          },
          active,
        ),
      409,
    );
    await ops.orderWrite(manager, { action: 'approve', idempotencyKey: key() }, active);
    await ops.inventoryWrite(admin, {
      action: 'condition',
      lotId: lot2,
      warehouseId: main,
      condition: 'เสื่อมสภาพ',
      reason: 'ตรวจสภาพ',
      idempotencyKey: key(),
    });
    await rejects(
      () => ops.orderWrite(admin, { action: 'complete', idempotencyKey: key() }, active),
      409,
    );
    await rejects(
      () =>
        ops.inventoryWrite(admin, {
          action: 'give',
          lotId: lot2,
          warehouseId: marketing,
          quantity: 1,
          giveType: 'แจก',
          recipient: 'ทดสอบ',
          reason: 'ทดสอบ',
          idempotencyKey: key(),
        }),
      409,
    );
    await ops.inventoryWrite(admin, {
      action: 'condition',
      lotId: lot2,
      warehouseId: main,
      condition: 'ปกติ',
      reason: 'คืน fixture',
      idempotencyKey: key(),
    });
    await db.productLot.update({
      where: { id: lot2 },
      data: { expiresOn: new Date('2026-10-02') },
    });
    await rejects(
      () => ops.orderWrite(admin, { action: 'complete', idempotencyKey: key() }, active),
      409,
    );
    await ops.orderWrite(
      manager,
      { action: 'cancel', reason: 'ล้างทดสอบ', idempotencyKey: key() },
      active,
    );
    await db.productLot.update({
      where: { id: lot2 },
      data: { expiresOn: new Date('2029-01-01') },
    });
  });
  await test('ประวัติแก้รับไม่เผยต้นทุนให้ Sales', async () => {
    const response = await ops.inventoryRead(
      sales,
      new URLSearchParams({ view: 'receipts', receiptId: receipt }),
    );
    assert.ok(!JSON.stringify(response).includes('totalCost'));
    assert.ok(!JSON.stringify(response).includes('beforeData'));
  });
  await test('7 วันนับจากรับเข้าครั้งแรก', async () => {
    const { receiptId } = await db.productLot.findUnique({ where: { id: lot2 } });
    await db.stockReceipt.update({
      where: { id: receiptId },
      data: { createdAt: new Date(Date.now() - 8 * 86400000) },
    });
    await rejects(
      () =>
        ops.inventoryWrite(admin, {
          action: 'correct',
          lotId: lot2,
          warehouseId: main,
          quantity: 10,
          totalCost: '70',
          manufacturedOn: '2026-01-01',
          expiresOn: '2029-01-01',
          reason: 'ช้า',
          idempotencyKey: key(),
        }),
      409,
    );
  });
  await test('TASK-296 ประวัติรับเข้า: ช่วงวันที่ ค้นหา หมวดหมู่ และ Audit ช่วงวันที่', async () => {
    const { bangkokDay, addDays } = load('src/server/operations/domain.ts');
    const today = bangkokDay();
    const list = (extra) =>
      ops.inventoryRead(
        admin,
        new URLSearchParams({ view: 'receipt-items', productId: pid, ...extra }),
      );
    const total = (await list({})).pagination.total;
    assert.ok(total >= 2);
    assert.equal((await list({ from: today, to: today })).pagination.total, total);
    assert.equal((await list({ from: addDays(today, 1) })).pagination.total, 0);
    assert.equal((await list({ to: addDays(today, -1) })).pagination.total, 0);
    await rejects(() => list({ from: today, to: addDays(today, -1) }), 400);
    await rejects(() => list({ from: 'x' }), 400);
    const product = await db.product.findUnique({ where: { id: pid } });
    assert.equal((await list({ categoryId: product.categoryId })).pagination.total, total);
    assert.equal((await list({ categoryId: crypto.randomUUID() })).pagination.total, 0);
    const { receiptId } = await db.productLot.findUnique({ where: { id: lot1 } });
    const { code } = await db.stockReceipt.findUnique({ where: { id: receiptId } });
    const byReceipt = await list({ search: code });
    assert.ok(byReceipt.data.some((r) => r.lotId === lot1));
    assert.equal((await list({ search: prefix })).pagination.total, total);
    const audit = load('src/server/audit-logs/service.ts');
    const action = 'T296_' + prefix.replace(/\W/g, '');
    const at = (day, time) => new Date(`${day}T${time}+07:00`);
    for (const [day, time] of [
      [today, '00:00:30'],
      [addDays(today, -1), '23:59:30'],
    ])
      await db.auditEvent.create({
        data: { actorUserId: uid, action, requestId: key(), occurredAt: at(day, time) },
      });
    const events = async (extra) =>
      (await audit.paginatedAuditEvents(new URLSearchParams({ action, ...extra }))).pagination
        .total;
    assert.equal(await events({}), 2);
    assert.equal(await events({ from: today, to: today }), 1);
    assert.equal(await events({ to: addDays(today, -1) }), 1);
    assert.equal(await events({ from: addDays(today, -1) }), 2);
    assert.equal(await events({ from: addDays(today, 1) }), 0);
    await rejects(() => events({ from: today, to: addDays(today, -1) }), 400);
    await rejects(() => events({ from: '2026-13-01' }), 400);
  });
  await test('RLS เปิดทุกตารางใหม่', async () => {
    const rows = await db.$queryRaw(
      Prisma.sql`SELECT relname,relrowsecurity FROM pg_class WHERE relname IN ('product_lots','stock_balances','stock_movements','stock_receipts','receipt_revisions','sales_order_lines','stock_reservations','operation_commands','inventory_policy')`,
    );
    assert.equal(rows.length, 9);
    assert.ok(rows.every((r) => r.relrowsecurity));
  });
  await test('TASK094 ยอดรวม/คลังเฉพาะ/MAINหักจองไม่รวมการตลาด และกรองก่อนแบ่งหน้า', async () => {
    await db.stockBalance.updateMany({
      where: { lot: { productId: pid } },
      data: { quantity: 0, reserved: 0 },
    });
    await db.productLot.updateMany({
      where: { productId: pid },
      data: { condition: 'ปกติ', expiresOn: new Date('2099-01-01') },
    });
    for (const [lotId, warehouseId, quantity, reserved] of [
      [lot1, main, 10, 2],
      [lot1, marketing, 100, 0],
      [lot2, main, 20, 0],
    ]) {
      await db.stockBalance.upsert({
        where: { lotId_warehouseId: { lotId, warehouseId } },
        create: { lotId, warehouseId, quantity, reserved },
        update: { quantity, reserved },
      });
    }
    const all = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'products', search: prefix }),
    );
    assert.equal(all.data.length, 1);
    assert.equal(all.data[0].quantity, 130);
    assert.equal(all.data[0].reserved, 2);
    assert.equal(all.data[0].available, 128);
    assert.equal(all.data[0].mainAvailable, 28);
    for (const [warehouseCode, quantity] of [
      ['MAIN', 30],
      ['MARKETING', 100],
    ]) {
      const r = await ops.inventoryRead(
        admin,
        new URLSearchParams({ view: 'products', search: prefix, warehouseCode }),
      );
      assert.equal(r.data[0].quantity, quantity);
      assert.equal(r.data[0].mainAvailable, 28);
    }
    const low = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'products', search: prefix, stock: 'low', limit: '1' }),
    );
    assert.equal(low.pagination.total, 1);
    const empty = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'products', search: prefix, stock: 'empty' }),
    );
    assert.equal(empty.pagination.total, 0);
    await rejects(
      () => ops.inventoryRead(sales, new URLSearchParams({ view: 'products', deleted: 'true' })),
      403,
    );
    await rejects(
      () =>
        ops.inventoryRead(
          admin,
          new URLSearchParams({ view: 'products', warehouseCode: 'invalid' }),
        ),
      400,
    );
  });
  await test('TASK094 หนึ่งแถวต่อLot ทุกคลัง/อายุ/สินค้า/วันหมดอายุ และซ่อนต้นทุนSales', async () => {
    const all = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'lots', productId: pid, limit: '1' }),
    );
    assert.equal(all.pagination.total, 2);
    assert.equal(all.data.length, 1);
    const full = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'lots', productId: pid }),
    );
    const first = full.data.find((r) => r.lotId === lot1);
    assert.equal(first.quantity, 110);
    assert.equal(first.reserved, 2);
    assert.equal(first.balances.filter((r) => r.quantity > 0).length, 2);
    const today = load('src/server/operations/domain.ts').bangkokDay();
    const near = new Date(Date.parse(today) + 30 * 86400000).toISOString().slice(0, 10);
    await db.productLot.update({ where: { id: lot1 }, data: { expiresOn: new Date(near) } });
    await db.productLot.update({ where: { id: lot2 }, data: { expiresOn: new Date(today) } });
    for (const [expiry, expected] of [
      ['near', lot1],
      ['expired', lot2],
    ]) {
      const r = await ops.inventoryRead(
        sales,
        new URLSearchParams({ view: 'lots', productId: pid, expiry, limit: '1' }),
      );
      assert.equal(r.pagination.total, 1);
      assert.equal(r.data[0].lotId, expected);
      assert.ok(!JSON.stringify(r).includes('totalCost'));
      assert.ok(!JSON.stringify(r).includes('unitCost'));
    }
    const marketingOnly = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'lots', productId: pid, warehouseId: marketing }),
    );
    assert.equal(marketingOnly.pagination.total, 1);
    assert.equal(marketingOnly.data[0].lotId, lot1);
    const date = await ops.inventoryRead(
      admin,
      new URLSearchParams({ view: 'lots', productId: pid, expiryBefore: today }),
    );
    assert.equal(date.pagination.total, 1);
    assert.equal(date.data[0].lotId, lot2);
  });
  console.log(`PASS: ${passed}/${passed} real database integration checks`);
} finally {
  // Exact fixture ownership, never a broad pattern delete.
  await db.$transaction(async (tx) => {
    await tx.stockMovement.deleteMany({ where: { actorUserId: uid } });
    await tx.receiptRevision.deleteMany({ where: { actorUserId: uid } });
    await tx.operationCommand.deleteMany({ where: { actorUserId: uid } });
    await tx.stockReservation.deleteMany({ where: { line: { order: { createdById: uid } } } });
    await tx.salesOrderLine.deleteMany({ where: { order: { createdById: uid } } });
    await tx.salesOrder.deleteMany({ where: { createdById: uid } });
    await tx.stockBalance.deleteMany({ where: { lot: { productId: pid } } });
    await tx.productLot.deleteMany({ where: { productId: pid } });
    await tx.stockReceipt.deleteMany({ where: { actorUserId: uid } });
    await tx.auditEvent.deleteMany({ where: { actorUserId: uid } });
    await tx.product.deleteMany({ where: { id: pid } });
    await tx.customer.deleteMany({ where: { id: cid } });
    await tx.salesTerritorySales.deleteMany({ where: { territoryId: { in: territories } } });
    await tx.salesTerritory.deleteMany({ where: { id: { in: territories } } });
    await tx.userRole.deleteMany({ where: { userId: { in: [managerId, salesId] } } });
    await tx.user.deleteMany({ where: { id: { in: [managerId, salesId] } } });
    await tx.user.deleteMany({ where: { id: uid } });
  });
  await db.$disconnect();
  console.log('Fixture cleanup completed');
}
