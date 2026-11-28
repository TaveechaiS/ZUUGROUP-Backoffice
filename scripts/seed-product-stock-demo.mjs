import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local', quiet: true });
const receiptCode = 'SEED149-20261005';
const samples = [
  ['พาราเซตามอล 500 มก.', 'TAB', 'พาราเซตามอล', 'กล่อง', 120, 120, 12, 3],
  ['อะม็อกซีซิลลิน 500 มก.', 'CAP', 'อะม็อกซีซิลลิน', 'กล่อง', 240, 85, 10, 2],
  ['เซทิริซีน 10 มก.', 'TAB', 'เซทิริซีน', 'กล่อง', 95, 40, 8, 1],
  ['ลอราทาดีน 10 มก.', 'TAB', 'ลอราทาดีน', 'กล่อง', 110, 0, 6, 4],
  ['โอเมพราโซล 20 มก.', 'CAP', 'โอเมพราโซล', 'กล่อง', 180, 200, 20, 0],
  ['วิตามินซี 500 มก.', 'TAB', 'กรดแอสคอร์บิก', 'ขวด', 150, 65, 5, 1],
  ['พาราเซตามอลน้ำ 120 มก./5 มล.', 'SYR', 'พาราเซตามอล', 'ขวด', 45, 30, 10, 2],
  ['ไอบูโพรเฟน 200 มก.', 'TAB', 'ไอบูโพรเฟน', 'กล่อง', 135, 90, 4, 0],
  ['เมทฟอร์มิน 500 มก.', 'TAB', 'เมทฟอร์มิน', 'กล่อง', 160, 150, 15, 2],
  ['แอมโลดิปีน 5 มก.', 'TAB', 'แอมโลดิปีน', 'กล่อง', 145, 55, 6, 1],
  ['ไซเมทิโคน 80 มก.', 'TAB', 'ไซเมทิโคน', 'กล่อง', 105, 0, 3, 0],
  ['อะลูมิเนียมไฮดรอกไซด์ชนิดน้ำ', 'SYR', 'อะลูมิเนียมไฮดรอกไซด์', 'ขวด', 65, 0, 0, 0],
];
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const dryRun = process.argv.includes('--dry-run');
try {
  await db.connect();
  await db.query('BEGIN');
  await db.query("SELECT pg_advisory_xact_lock(hashtext('TASK149-product-demo'))");
  const existing = await db.query('SELECT id FROM stock_receipts WHERE code=$1', [receiptCode]);
  if (existing.rowCount) {
    await db.query('ROLLBACK');
    console.log('Demo already exists; no changes made.');
  } else {
    const admin = await db.query(
      "SELECT u.id FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.role_id='ADMIN' AND u.status='ACTIVE' AND u.deleted_at IS NULL ORDER BY u.created_at,u.id LIMIT 1",
    );
    assert.equal(admin.rowCount, 1, 'An existing active Admin is required.');
    const actorId = admin.rows[0].id;
    await db.query(
      'INSERT INTO inventory_policy(id,sale_months,donation_months,warning_days) VALUES(1,6,12,90) ON CONFLICT(id) DO NOTHING',
    );
    await db.query(
      "INSERT INTO product_categories(id,code,name) VALUES($1,'MED','ยาแผนปัจจุบัน') ON CONFLICT DO NOTHING",
      [randomUUID()],
    );
    const category = (await db.query("SELECT id FROM product_categories WHERE code='MED'")).rows[0];
    assert.ok(category, 'MED category code must be available.');
    const warehouseIds = {};
    for (const [code, name] of [
      ['MAIN', 'คลังหลัก'],
      ['MARKETING', 'คลังการตลาด'],
      ['DISPOSAL', 'คลังรอทำลาย'],
    ]) {
      await db.query(
        'INSERT INTO warehouses(id,code,name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [randomUUID(), code, name],
      );
      const row = (await db.query('SELECT id FROM warehouses WHERE code=$1', [code])).rows[0];
      assert.ok(row, `Warehouse ${code} must be available.`);
      warehouseIds[code] = row.id;
    }
    const formIds = {};
    for (const [code, name] of [
      ['TAB', 'ยาเม็ด'],
      ['CAP', 'แคปซูล'],
      ['SYR', 'น้ำเชื่อม'],
    ]) {
      await db.query(
        'INSERT INTO dosage_forms(id,code,name) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
        [randomUUID(), code, name],
      );
      const row = (await db.query('SELECT id FROM dosage_forms WHERE code=$1', [code])).rows[0];
      assert.ok(row, `Form ${code} must be available.`);
      formIds[code] = row.id;
    }
    const receiptId = randomUUID();
    const note =
      'ข้อมูลตัวอย่าง TASK-149 สร้างด้วย seed สำหรับตรวจตาราง ไม่ใช่การรับเข้าสินค้าจริง';
    await db.query(
      'INSERT INTO stock_receipts(id,code,source,notes,actor_user_id) VALUES($1,$2,$3,$4,$5)',
      [receiptId, receiptCode, 'SYSTEM DEMO SEED', note, actorId],
    );
    let lots = 0;
    let total = 0;
    for (const [index, sample] of samples.entries()) {
      const [name, form, drugName, unit, price, main, marketing, disposal] = sample;
      await db.query('INSERT INTO drugs(id,name) VALUES($1,$2) ON CONFLICT DO NOTHING', [
        randomUUID(),
        drugName,
      ]);
      const drugId = (await db.query('SELECT id FROM drugs WHERE name=$1', [drugName])).rows[0].id;
      const id = randomUUID();
      const sequence = 9001 + index;
      const code = `MED-${form}-${sequence}`;
      // No upsert: a conflicting product aborts the entire seed, preserving existing data.
      await db.query(
        'INSERT INTO products(id,code,sequence,name,category_id,dosage_form_id,drug_id,default_warehouse_id,unit,sale_price,status,is_sample,updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true,now())',
        [
          id,
          code,
          sequence,
          `${name} (ข้อมูลตัวอย่าง)`,
          category.id,
          formIds[form],
          drugId,
          warehouseIds.MAIN,
          unit,
          price,
          index === 11 ? 'INACTIVE' : 'ACTIVE',
        ],
      );
      for (const [warehouse, quantity] of [
        ['MAIN', main],
        ['MARKETING', marketing],
        ['DISPOSAL', disposal],
      ]) {
        if (!quantity) continue;
        const lotId = randomUUID();
        const expired = warehouse === 'DISPOSAL';
        const totalCost = (price * quantity * 0.6).toFixed(2);
        await db.query(
          'INSERT INTO product_lots(id,receipt_id,product_id,lot_number,received_quantity,total_cost,manufactured_on,expires_on,condition) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [
            lotId,
            receiptId,
            id,
            `DEMO149-${sequence}-${warehouse}`,
            quantity,
            totalCost,
            '2025-10-01',
            expired ? '2026-09-30' : '2028-10-05',
            expired ? 'เสื่อมสภาพ' : 'ปกติ',
          ],
        );
        await db.query(
          'INSERT INTO stock_balances(lot_id,warehouse_id,quantity,reserved) VALUES($1,$2,$3,0)',
          [lotId, warehouseIds[warehouse], quantity],
        );
        await db.query(
          'INSERT INTO stock_movements(id,lot_id,warehouse_id,quantity,kind,source_id,reason,actor_user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
          [
            randomUUID(),
            lotId,
            warehouseIds[warehouse],
            quantity,
            'รับเข้า',
            receiptId,
            note,
            actorId,
          ],
        );
        lots++;
        total += quantity;
      }
    }
    const readback = await db.query(
      'SELECT count(DISTINCT l.id)::int AS lots,COALESCE(sum(b.quantity),0)::int AS quantity FROM product_lots l JOIN stock_balances b ON b.lot_id=l.id WHERE l.receipt_id=$1',
      [receiptId],
    );
    assert.equal(readback.rows[0].lots, lots);
    assert.equal(readback.rows[0].quantity, total);
    const after = { receiptCode, products: samples.length, lots, quantity: total, sample: true };
    await db.query(
      'INSERT INTO audit_events(id,actor_role,action,request_id,after) VALUES($1,$2,$3,$4,$5::jsonb)',
      [randomUUID(), 'SYSTEM', 'PRODUCT_STOCK_DEMO_SEEDED', receiptCode, JSON.stringify(after)],
    );
    await db.query(dryRun ? 'ROLLBACK' : 'COMMIT');
    console.log(JSON.stringify({ mode: dryRun ? 'dry-run rolled back' : 'committed', ...after }));
  }
} catch (error) {
  await db.query('ROLLBACK').catch(() => {});
  console.error('Demo seed failed:', error.code ?? error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
