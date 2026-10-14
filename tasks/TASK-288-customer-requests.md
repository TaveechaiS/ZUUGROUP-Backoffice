# TASK-288 — คำขอเพิ่มลูกค้า (Sales/Manager → Admin) — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ C3). ต่อจาก TASK-272 (PARKED). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_customer_requests/migration.sql — customer_create_requests สถานะเพิ่ม submitted/returned/rejected + submitted_at/reviewed_by_id/reviewed_at/review_reason. scripts/setup-customer-requests.mjs. prisma/schema.prisma.
2. Server: src/server/customers/requests.ts (ส่งคำขอ, ตรวจ approve/return/reject, รายการ, รายละเอียด + ลูกค้าที่อาจซ้ำ), request-handler.ts. Approve ใช้ commitCustomerRequest เดิม (สร้างลูกค้าเหมือน Admin บันทึกเอง) + audit CUSTOMER_REQUEST_APPROVED; ถ้าสร้างไม่สำเร็จคืนสถานะรอตรวจสอบ. customerHandler เปิด begin/upload/status/cancel/next ให้ Sales/Manager (commit ยังเฉพาะ Admin).
3. API: /api/customer-requests (GET), /api/customer-requests/[id] (GET, PATCH submit | approve/return/reject).
4. หน้า: /customers/create เปิดให้ Admin/Sales/Manager — Sales/Manager ปุ่ม "ส่งคำขอ" (ไม่บันทึกลูกค้าตรง); /customers/requests รายการ (Admin ทั้งหมด / ผู้ขอเห็นคำขอของฉัน) แท็บตามสถานะ; /customers/requests/[id] ข้อมูลเต็ม ลูกค้าที่อาจซ้ำ และปุ่ม อนุมัติและเพิ่มลูกค้า/ส่งกลับแก้ไข/ไม่อนุมัติ (Admin). ลบข้อมูลตัวอย่าง request-data.ts.
5. ตรวจ: scripts/test-customer-requests.mjs 5 ผ่าน; test-customer-full 12 ผ่าน (ปรับข้อ Roles: Sales ขอเลขรันได้แต่ commit/restore ไม่ได้); route test.

## ข้อกำหนดที่ใช้

- ส่งกลับแก้ไข: ผู้ขอเห็นเหตุผลและส่งคำขอใหม่ (ยังไม่เติมข้อมูลเดิมให้อัตโนมัติ). ไม่มีแจ้งเตือนภายนอก.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

⚠️ ต้องทดสอบโดยคุณ: Login Sales → ลูกค้า → เพิ่มลูกค้า กรอกข้อมูลครบ แนบเอกสาร → ปุ่ม ส่งคำขอ → เห็น "ส่งคำขอเพิ่มลูกค้าแล้ว" เปิดคำขอสถานะ รอตรวจสอบ → Login Admin → คำขอเพิ่มลูกค้า แท็บ รอตรวจสอบ เห็นคำขอ → เปิด ตรวจลูกค้าที่อาจซ้ำ → อนุมัติและเพิ่มลูกค้า → สถานะ อนุมัติแล้ว มีลิงก์รหัสลูกค้าใหม่; ทดลองอีกคำขอ ส่งกลับแก้ไข (ใส่เหตุผล) → Sales เห็นเหตุผลในคำขอของฉัน.
