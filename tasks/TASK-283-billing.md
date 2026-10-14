# TASK-283 — วางบิล & รับชำระ — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ B1–B3). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_billing/migration.sql — invoices เพิ่ม sales_order_id/issue_date/due_date/created_by_id/cancel_reason + CHECK + unique SO ที่ใช้งาน; ตาราง invoice_payments (RLS+REVOKE). scripts/setup-billing.mjs. prisma/schema.prisma.
2. Server: src/server/billing/{service,handler}.ts; nextDocumentCode เพิ่ม INV. src/config/billing.ts, src/types/api/billing.ts.
3. API: /api/billing (GET list | view=uninvoiced, POST วางบิล), /api/billing/[id] (GET, PATCH pay/void-payment, DELETE = ยกเลิก).
4. หน้า: /billing (แท็บสถานะ + ยอดค้างรวม), /billing/create (เลือก SO เสร็จสิ้น, วันที่ออก, แสดงครบกำหนด), /billing/[id] (ข้อมูล, ประวัติรับชำระ, บันทึกรับชำระ, ยกเลิกรายการ/ใบ). เมนู "วางบิล & ลูกหนี้" กลับใน Side หลัก + Side รอง รายการใบแจ้งหนี้/วางบิล (Admin/CFO).
5. StatusBadge กลางเพิ่ม ค้างชำระ/ชำระบางส่วน/ชำระครบ.
6. แก้บั๊กรอบก่อน: admin-shell แสดงเนื้อหาหน้าโปรโมชัน รายงานยอดขาย รายงานคลัง และวางบิล (เดิมแสดงแท็บนำทางแทนหน้าใหม่).
7. ตรวจ: scripts/test-billing.mjs, route test, Postman.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- DB apply แล้ว (invoices 0). test-billing 6 ผ่าน, route test, tsc/eslint ผ่าน. Postman local วางบิล 7 คำขอ.

ไม่ทำ: แผนผ่อนรายเดือน, ใบลดหนี้/คืนสินค้า, วางบิลรวมหลาย SO.

⚠️ ต้องทดสอบโดยคุณ: Login Admin → วางบิล & ลูกหนี้ → วางบิล → เลือก SO ที่เสร็จสิ้น เห็นยอดและวันครบกำหนดตามเครดิตลูกค้า → ออกใบแจ้งหนี้ ได้ INV-2569-0001 สถานะ ค้างชำระ → บันทึกรับชำระบางส่วน (โอน) → สถานะ ชำระบางส่วน ยอดค้างลด → ใส่จำนวนเกินยอดค้างต้องขึ้นข้อความ → รับส่วนที่เหลือ → ชำระครบ → ใส่เหตุผลแล้วยกเลิกรายการรับชำระหนึ่งรายการ สถานะกลับ ชำระบางส่วน; หน้ารายการ แท็บ เกินกำหนด แสดงใบที่เลยวันครบกำหนด. ตรวจด้วยว่าหน้าโปรโมชันและรายงานแสดงตารางจริง (ไม่ใช่แท็บนำทาง).
