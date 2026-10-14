# TASK-277 — ถอดผู้ขายออกจากจัดซื้อ — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 เลือก "ถอดทั้งระบบ" + "ok ลงมือทำได้"). แผนรวม .jarvis/PLAN.md Phase 1.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_purchase_without_supplier/migration.sql ถอด `supplier_id IS NOT NULL` ใน CHECK purchase_orders_status; scripts/setup-purchase-without-supplier.mjs (dry-run → apply). คงตาราง suppliers และคอลัมน์ supplier_id.
2. Server: src/server/purchasing/{service,handler}.ts ตัดผู้ขาย; src/server/operations/service.ts receive ไม่รับ supplierId, options ไม่มี suppliers.
3. ลบ src/app/api/suppliers/**, src/app/suppliers/**, src/components/purchasing/supplier-form.tsx; ตัด suppliers ใน modules.json, proxy, navigation, purchasing-secondary-sidebar, admin-shell, types, config.
4. หน้า: purchase-form, /purchases (ค้นหาเลขที่/ชื่อสินค้า/หมายเหตุ), /purchases/[id], /products/stock/create ตัดผู้ขาย.
5. scripts/test-purchasing.mjs, scripts/build-postman-purchasing.mjs (ลบโฟลเดอร์ผู้ขาย), scripts/test-route-pages.mjs.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- DB apply แล้ว: suppliers 0, purchase_orders 0, stock_receipts 2 ไม่เปลี่ยน; CHECK ใหม่ไม่มี supplier_id.
- test-purchasing 8 ผ่าน (rolled back), route test ผ่าน, tsc (ยกเว้น type ค้างใน .next) และ eslint ผ่าน. Postman local: ใบสั่งซื้อ 8 คำขอ ไม่มีโฟลเดอร์ผู้ขาย.

⚠️ ต้องทดสอบโดยคุณ: Login Admin → เมนู จัดซื้อ → Side รองเหลือ รายการใบสั่งซื้อ / สร้างใบสั่งซื้อ → สร้างใบสั่งซื้อไม่มีช่องผู้ขาย บันทึกได้ PO-2569-xxxx → ตารางไม่มีคอลัมน์ผู้ขาย ค้นหาด้วยชื่อสินค้าเจอ → รายละเอียดหัวเป็น "ใบสั่งซื้อ PO-..." → รับสินค้า → หน้าเพิ่มสต็อกไม่มีช่องผู้ขาย รับบางส่วนแล้วสถานะ รับบางส่วน → เปิด /suppliers ต้องได้ 404.
