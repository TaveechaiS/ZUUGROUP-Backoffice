# TASK-276 — จัดซื้อ: ผู้ขาย + ใบสั่งซื้อ + ผูกรับเข้า — 8 ตุลาคม 2569

OWNER_APPROVED. เจ้าของสั่ง "ทำที่แนะนำไปก่อน" (8 ต.ค. 2569) = ใช้ค่าแนะนำทั้ง 8 ข้อ:

1. ผู้ขาย: รหัส SUP-0001 ระบบออกเอง (ไม่แยกปี), ชื่อ, เลขผู้เสียภาษี, ที่อยู่, ผู้ติดต่อ, โทร, อีเมล, เงื่อนไขชำระ (เงินสด/30/60/90 วัน), สถานะ ใช้งาน/ระงับ, หมายเหตุ. ลบแบบกู้คืนได้ (เหตุผลบังคับ).
2. ใบสั่งซื้อ: Admin สร้างแล้วมีผลทันที ไม่มีขั้นอนุมัติแยก (เหมือนรับเข้า).
3. ต้นทุนต่อหน่วยรวม VAT + ส่วนลดบาทต่อรายการ (เหมือนใบเสนอราคา).
4. รับบางส่วนได้หลายรอบ แสดง สั่ง/รับแล้ว/ค้างรับ.
5. รับเกินจำนวนสั่งไม่ได้ (ทั้งตอนรับและตอนแก้รับเข้า).
6. รับเข้าแบบไม่มีใบสั่งซื้อยังทำได้; เลือกผู้ขายได้ (ไม่บังคับ).
7. ปิดใบที่ค้างรับได้พร้อมเหตุผล ("ปิดแล้ว"); ใบที่ยังไม่รับเลยใช้ "ยกเลิก" พร้อมเหตุผล.
8. รอบนี้ทุก Role อ่านได้ (ทำสิทธิ์รอบหลังตามเจ้าของ); เขียนเฉพาะ Admin. รอบสิทธิ์: ต้นทุนในใบสั่งซื้อเห็นเฉพาะ Admin/CFO.

ข้อกำหนดเพิ่มที่ใช้ (อนุมานจากค่าแนะนำ ไม่ใช่กฎธุรกิจใหม่):
- เลขใบสั่งซื้อ PO-ปีพ.ศ.-0001 ระบบออกเอง เริ่มใหม่ทุกปี (เหมือน QT/SO).
- แก้ใบสั่งซื้อได้เฉพาะก่อนรับของครั้งแรก; หลังรับแล้วใช้ "ปิดแล้ว" แทนการแก้.
- สถานะ: รอรับสินค้า → รับบางส่วน → รับครบ (คำนวณจากรับเข้าจริง), ปิดแล้ว, ยกเลิก.
- หนึ่งใบรับเข้า = หนึ่งล็อต (เดิม) อ้างหนึ่งบรรทัดใบสั่งซื้อ; ผู้ขายของใบรับเข้ามาจากใบสั่งซื้อ.
- ต้นทุนรวมล็อตเติมให้จาก ต้นทุน/หน่วย × จำนวน − ส่วนลดตามสัดส่วน แก้ได้.
- ข้อมูลเดิม suppliers/purchase_orders = 0 แถว (ตรวจ 8 ต.ค. 2569) ไม่ต้องย้ายข้อมูล.

## ลำดับ / ไฟล์

1. เอกสาร: tasks/ACTIVE.md, Specs (ข้อ 11.1), Plan (Phase 6), ไฟล์นี้.
2. DB: prisma/migrations/20261008_purchasing/migration.sql — suppliers เพิ่ม tax_id/address/phone/email/created_by_id; purchase_orders เพิ่ม order_date/expected_on/created_by_id/close_reason + CHECK สถานะ; ตาราง purchase_order_lines (RLS + REVOKE); stock_receipts เพิ่ม supplier_id, purchase_order_line_id. prisma/schema.prisma + generate. scripts/setup-purchasing.mjs (dry-run ก่อน apply).
3. Server: src/server/purchasing/{service,handler}.ts (ผู้ขาย create/edit/delete/restore, ใบสั่งซื้อ create/edit/close/cancel, list/detail, open-lines). src/server/operations/service.ts — receive/correct ตรวจยอดค้างรับและอัปเดตสถานะใบสั่งซื้อ, options รับเข้าเพิ่มผู้ขาย.
4. API: /api/suppliers, /api/suppliers/[id], /api/purchases, /api/purchases/[id] แทน records handler.
5. หน้า: /suppliers รายการ/สร้าง/รายละเอียด(แก้ไข/ลบ/กู้คืน), /purchases รายการ/สร้าง/รายละเอียด(แก้ไข/ปิด/ยกเลิก/รับสินค้า), /products/stock/create เพิ่มเลือกใบสั่งซื้อ/ผู้ขาย. เมนู "จัดซื้อ" + Side รอง, admin-shell เปิดเนื้อหา.
6. ตรวจ: scripts/test-purchasing.mjs (rolled back), route test, Postman local, lint/tsc/build.

ไม่ทำ: PDF ใบสั่งซื้อ, ขั้นอนุมัติใบสั่งซื้อ, ตั้งหนี้เจ้าหนี้/จ่ายเงินผู้ขาย, ค่าใช้จ่าย, สิทธิ์อ่านตาม Role.

## วิธีตรวจรับ

- Admin สร้างผู้ขาย → ได้ SUP-0001; แก้/ระงับ/ลบ(เหตุผล)/กู้คืนได้.
- Admin สร้างใบสั่งซื้อ 2 สินค้า → PO-2569-0001 สถานะ รอรับสินค้า ยอดรวมถูก.
- รับเข้าจากใบสั่งซื้อบางส่วน → สถานะ รับบางส่วน ค้างรับลด; รับเกินไม่ได้; รับครบ → รับครบ.
- ปิดใบที่ค้างรับ (เหตุผล) → ปิดแล้ว รับต่อไม่ได้; ใบที่ยังไม่รับ → ยกเลิก.
- รับเข้าแบบไม่มีใบสั่งซื้อยังทำได้.

## ผล — IMPLEMENTED / WAITING_FOR_UAT (8 ตุลาคม 2569)

- DB: migration 20261008_purchasing apply ลง Supabase ผ่าน scripts/setup-purchasing.mjs (dry-run ก่อน; suppliers 0, purchase_orders 0, stock_receipts 2 ไม่เปลี่ยน; purchase_order_lines RLS เปิด client ไม่มีสิทธิ์). CHECK: สถานะผู้ขาย ใช้งาน/ระงับ; ใบสั่งซื้อ 5 สถานะ + ต้องมีผู้ขายและวันที่สั่งซื้อ. Prisma schema + generate.
- Server: src/server/purchasing/{service,handler}.ts. operations/service.ts: เลข PO ใช้ nextDocumentCode, receive รับ purchaseOrderLineId/supplierId (ล็อกใบสั่งซื้อ FOR UPDATE, ตรวจค้างรับ, ตั้ง source = ชื่อผู้ขาย), correct ห้ามเกินจำนวนสั่ง, สถานะใบสั่งซื้อคำนวณใหม่หลังรับ/แก้, options รับเข้ามี suppliers/openLines.
- API: /api/suppliers, /api/suppliers/[id], /api/purchases, /api/purchases/[id] แทน records handler. DELETE ผู้ขาย = ลบ, DELETE ใบสั่งซื้อ = ยกเลิก.
- หน้า: /suppliers (แท็บ ใช้งาน/ระงับ/ลบแล้ว), /suppliers/create, /suppliers/[id] (แก้ไข/ลบ/กู้คืน); /purchases (แท็บ 5 สถานะ, ?supplierId=), /purchases/create, /purchases/[id] (สั่ง/รับแล้ว/ค้างรับ, ประวัติรับเข้า, ปุ่มรับสินค้า → หน้าเพิ่มสต็อก, แก้ไข/ปิด/ยกเลิก). หน้าเพิ่มสต็อกมีช่อง ใบสั่งซื้อ/ผู้ขาย (ไม่บังคับ) เติมสินค้า/จำนวนค้างรับ/ต้นทุนให้. เมนูหลัก "จัดซื้อ" + Side รอง; ป้าย รอรับสินค้า/ปิดแล้ว เพิ่มใน status-badge กลาง. DateInput รับ required/max.
- Tests: scripts/test-purchasing.mjs 10 ผ่าน (rolled back). route test เพิ่มเงื่อนไข suppliers/purchases (81 ผ่าน). test-quotes 11 ผ่าน. eslint/tsc/next build ผ่าน.
- Postman local: scripts/build-postman-purchasing.mjs เพิ่ม ผู้ขาย 7 + ใบสั่งซื้อ 8 คำขอ (Cloud ยังไม่ sync).

ข้อสังเกต: สคริปต์ seed เก่า (seed-business-catalog / operational-seed / realistic-refresh) เขียนผู้ขาย/ใบสั่งซื้อรูปแบบหัวเอกสารเดิม จะไม่ผ่าน CHECK ใหม่ — ไม่ได้แก้รอบนี้.

⚠️ ต้องทดสอบโดยคุณ: Login Admin → เมนู จัดซื้อ → เพิ่มผู้ขาย (เลขภาษี 13 หลัก) ได้ SUP-0001 → สร้างใบสั่งซื้อ 2 สินค้า มีส่วนลด → ได้ PO-2569-0001 สถานะ รอรับสินค้า ยอดรวม/VAT ถูก → กด รับสินค้า ที่บรรทัดแรก → หน้าเพิ่มสต็อกเติมสินค้า/จำนวนค้างรับ/ต้นทุน ลดจำนวนลงแล้วบันทึก → กลับใบสั่งซื้อ สถานะ รับบางส่วน ค้างรับลด มีประวัติรับเข้า → ลองรับเกินค้างรับ ต้องขึ้นข้อความรับเกิน → ปิดใบพร้อมเหตุผล → ปิดแล้ว ปุ่มรับสินค้าหายไป; ใบใหม่ที่ยังไม่รับ ยกเลิกได้; หน้าเพิ่มสต็อกเลือก ไม่อ้างใบสั่งซื้อ ยังรับได้ตามเดิม.
