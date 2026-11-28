# TASK-286 — ติดตามลูกค้า — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ C1). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_customer_follow_ups/migration.sql — customer_follow_ups เพิ่ม contacted_on/channel/next_on/result/created_by_id/cancel_reason + CHECK. scripts/setup-customer-follow-ups.mjs. prisma/schema.prisma.
2. Server: src/server/follow-ups/{service,handler}.ts; nextDocumentCode เพิ่ม FU. src/config/follow-ups.ts, src/types/api/follow-ups.ts.
3. API: /api/customer-follow-ups, /api/customer-follow-ups/[id] (PATCH edit/done/cancel, DELETE = ยกเลิก) แทน records handler.
4. หน้า (path เดิม /customers/dashboard): รายการ แท็บ ครบนัดวันนี้/เกินนัด/รอติดตาม/เสร็จแล้ว/ยกเลิก/ทั้งหมด, /customers/dashboard/create (Admin/Manager/Sales), /customers/dashboard/[id] (แก้ไข/ปิดพร้อมผล/ยกเลิกพร้อมเหตุผล). เมนูลูกค้า Side รองเพิ่ม ติดตามลูกค้า/บันทึกการติดตาม. admin-shell แสดงเนื้อหาหน้า. StatusBadge เพิ่ม เสร็จแล้ว/ครบนัดวันนี้/เกินนัด.
5. route test เปลี่ยนเป็นตารางตรวจหน้าที่มี API เฉพาะ (billing/expenses/promotions/customer-follow-ups).
6. ตรวจ: scripts/test-follow-ups.mjs 5 ผ่าน.

## ข้อกำหนดที่ใช้

- Sales แก้/ปิดได้เฉพาะรายการที่บันทึกเอง; Admin/Manager ได้ทุกรายการ (สิทธิ์ดูตามเขตทำใน TASK-290).

## ผล — IMPLEMENTED / WAITING_FOR_UAT

⚠️ ต้องทดสอบโดยคุณ: Login Sales → ลูกค้า → บันทึกการติดตาม → เลือกลูกค้า หัวข้อ ช่องทาง โทร นัดครั้งถัดไปวันนี้ → บันทึก ได้ FU-2569-0001 → รายการแท็บ ครบนัดวันนี้ แสดงรายการ → เปิดรายละเอียด ใส่ผลแล้ว ปิดการติดตาม → สถานะ เสร็จแล้ว ปุ่มดำเนินการหายไป; Login Sales อีกคนเปิดรายการเดียวกันไม่มีปุ่มแก้ไข.
