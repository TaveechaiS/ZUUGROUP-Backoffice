# TASK-092 แผนย่อยลงมือรวม

1. ลง contract ตาม Specs และ ACTIVE. สร้าง migration เพิ่มสัมพันธ์เขต/ผู้ใช้และตารางล็อต/รับเข้า/คลัง/movement/รายการขาย/จอง; รักษา records เดิม.
2. service transaction ล็อกตาม product ID ลำดับคงที่เพื่อกันสร้าง Order พร้อมกัน/ยอดซ้ำ; API auth/validation/idempotency/audit และ cost projection.
3. หน้าเขต/ลูกค้าใช้ชื่อสัมพันธ์; รับเข้า/แก้รับ/โอน/ปรับ/แจก/ยอดคลังและ Orders workflow ใช้ http กลาง, loading ในเนื้อหา, confirmation และ SuccessAlert. StatusBadge กลาง/ภาษาไทย/พ.ศ./Asia Bangkok.
4. apply migration ด้วย connection ที่ตั้งไว้โดยไม่แสดง credentials แล้วตรวจ schema/constraints/readback. ไม่ seed stock สมมติ; เพิ่มเฉพาะ 4 เขตเริ่มต้นแบบไม่ทับเดิม.
5. tests เรียก service จริงบน DB ด้วย fixture UUID ที่แยกแล้ว cleanup ใน finally สำหรับรับหลายล็อต/จองพร้อมกัน/ของไม่พอ/approve/return/edit/completeซ้ำ/แก้รับ7วัน/โอน/ปรับ/cost permissions; verify เดิมและ build. UI ตรวจ desktop/mobile ถ้าเข้าได้.
6. ส่ง UAT รวมและบันทึกผล/ข้อจำกัด. ไม่ commit/push/Deploy จนเจ้าของทดสอบตามคำสั่งรวมเดิม.

ไฟล์: prisma/schema.prisma+migration; src/server/operations/*; src/types/api/operations.ts; API orders/inventory; components/operations/*; pages เขต/Orders/receipts/stock; registry/service/ลูกค้า/nav/status; scripts/tests และคู่มือ. อ่าน ACTIVE และอัปเดตขอบเขตเมื่อเริ่มแต่ละ batch.
