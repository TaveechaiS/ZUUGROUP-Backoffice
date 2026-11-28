# TASK-278 — โปรโมชัน & ของแถม (DB จริง + design หน้าสินค้า) — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 "ok ลงมือทำได้"). แผนรวม .jarvis/PLAN.md Phase 2, ค่าแนะนำ R7–R9.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_promotions/migration.sql — promotions เพิ่ม starts_on/ends_on/min_type/min_value/reward_type/discount_value/created_by_id/cancel_reason + CHECK promotions_rules; ตาราง promotion_products, promotion_gifts (RLS + REVOKE). scripts/setup-promotions.mjs (dry-run → apply). prisma/schema.prisma + generate.
2. Server: src/server/promotions/{service,handler}.ts; nextDocumentCode เพิ่ม PR. src/config/promotions.ts, src/types/api/promotions.ts.
3. API: /api/promotions, /api/promotions/[id] แทน records handler (DELETE = ยกเลิก).
4. หน้า: /promotions (แท็บ ทั้งหมด/ใช้งาน/ร่าง/หมดอายุ/ยกเลิก, การ์ดตัวกรอง ค้นหา/ประเภทรางวัล, ตารางแบบหน้าสินค้า), /promotions/create, /promotions/[id] (ดู/แก้ไข/ยกเลิก). ฟอร์มกลาง src/components/promotions/promotion-form.tsx (Section Accordion: ข้อมูลโปรโมชัน / เงื่อนไข / ของแถม-ส่วนลด / หมายเหตุ).
5. ตรวจ: scripts/test-promotions.mjs (rolled back), route test, Postman scripts/build-postman-promotions-reports.mjs.

## ข้อกำหนดที่ใช้

- สถานะบันทึก ใช้งาน/ร่าง/ยกเลิก; หมดอายุ = ใช้งาน และ ends_on < วันนี้ Asia/Bangkok (คำนวณตอนอ่าน).
- ขั้นต่ำ จำนวน (จำนวนเต็ม) หรือ มูลค่า (บาท ทศนิยม 2). รางวัล ของแถม (1–20 รายการ ไม่ซ้ำ คลัง MAIN/MARKETING ค่าเริ่มต้น MARKETING) / ส่วนลดบาท / ส่วนลด% (≤100).
- แก้ไขได้จนกว่ายกเลิก (แทนที่สินค้าที่ร่วมและของแถมทั้งชุด, ตรวจ expectedUpdatedAt). ยังไม่ผูกกับเอกสารขาย จึงยังไม่เก็บรุ่นเงื่อนไข.
- ข้อมูลเดิม promotions = 0 แถว (ตรวจ 14 ต.ค. 2569) ไม่ต้องย้ายข้อมูล.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- DB apply แล้ว (promotions 0, products 13 ไม่เปลี่ยน; RLS เปิด client ไม่มีสิทธิ์).
- test-promotions 8 ผ่าน (rolled back), route test ผ่าน, tsc/eslint/prettier ผ่าน. Postman local: โปรโมชัน 5 คำขอ.

ไม่ทำ: ผูกโปรโมชันกับใบเสนอราคา/คำสั่งซื้อ, ขั้นอนุมัติ (OPEN-01), ประวัติการใช้, รุ่นเงื่อนไข.

⚠️ ต้องทดสอบโดยคุณ: Login Admin → โปรโมชัน & ของแถม → เพิ่มโปรโมชัน → ชื่อ "ซื้อครบ 10 แถม 1", ช่วง วันนี้–อีก 30 วัน, ขั้นต่ำ จำนวน 10, สินค้าที่ร่วม 1 ตัว, ประเภท ของแถม เลือกสินค้า 1 ชิ้น คลังการตลาด → บันทึก ยืนยัน → ได้ PR-2569-0001 เปิดหน้ารายละเอียด สถานะ ใช้งาน → กลับรายการ ตารางแสดงวันที่ พ.ศ. เงื่อนไข "ครบ 10 ชิ้น" และ "ของแถม 1 รายการ" → แก้ไขเปลี่ยนเป็น ส่วนลด% 10 บันทึกได้ ส่วนของแถมหายไป → ตั้งวันสิ้นสุดเป็นเมื่อวาน (วันเริ่มก่อนหน้านั้น) → แท็บ หมดอายุ แสดงรายการนี้ → ใส่เหตุผลแล้วยกเลิก → สถานะ ยกเลิก ปุ่มแก้ไขหายไป; Login Sales เปิดรายการได้แต่ไม่มีเมนูเพิ่มโปรโมชัน.
