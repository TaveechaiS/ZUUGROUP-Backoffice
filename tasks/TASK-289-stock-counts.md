# TASK-289 — ตรวจนับรายล็อต — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ S1). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_stock_count_lines/migration.sql — stock_count_sessions เพิ่ม created_by_id/closed_at/cancel_reason + CHECK (กำลังนับ/ปิดแล้ว/ยกเลิก, ต้องมีคลัง); ตาราง stock_count_lines (ยอดระบบ ณ เริ่มรอบ, จำนวนนับ, หมายเหตุ; RLS+REVOKE). scripts/setup-stock-count-lines.mjs. prisma/schema.prisma.
2. Server: src/server/stock-counts/{service,handler}.ts; nextDocumentCode เพิ่ม SC. เขียนเฉพาะ Admin (กฎข้อ 7).
3. API: /api/stock-counts (GET list+คลัง, POST เริ่มรอบ), /api/stock-counts/[id] (GET, PATCH count/close/cancel, DELETE = ยกเลิก).
4. หน้า: /stock-counts (แท็บสถานะ, ล็อต/ต่าง, ผลตรวจนับ), /stock-counts/create (เลือกคลัง), /stock-counts/[id] (ตารางล็อต คีย์จำนวนนับ เห็นส่วนต่างทันที, บันทึก/ปิดรอบ/ยกเลิก). เมนูอยู่ใต้ สต็อก (Side รอง).
5. รายงานคลัง > ผลตรวจนับ ใช้ result_text สรุปจากรอบ (ตรงกัน/ขาด/เกิน).
6. ตรวจ: scripts/test-stock-counts.mjs 4 ผ่าน, route test.

## ข้อกำหนดที่ใช้

- ผลต่างเป็นข้อมูลเทียบยอด ไม่ปรับยอดสต็อกหรือสร้าง Ledger (OPEN-15 คงเดิม). ปิดรอบได้เมื่อคีย์ครบทุกล็อต.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

⚠️ ต้องทดสอบโดยคุณ: Login Admin → สต็อก → เริ่มรอบตรวจนับ → เลือกคลังหลัก → ได้ SC-2569-0001 พร้อมรายการล็อตและยอดระบบ → คีย์จำนวนนับบางล็อตให้ต่าง (เห็นตัวเลขต่างสีแดง/ส้ม) → บันทึกจำนวนนับ → ปิดรอบ (ถ้ายังคีย์ไม่ครบต้องขึ้นข้อความ) → สถานะ ปิดแล้ว; ตรวจหน้าสต็อกยอดไม่เปลี่ยน; รายงานคลัง > ผลตรวจนับ แสดงสรุปของรอบนี้.
