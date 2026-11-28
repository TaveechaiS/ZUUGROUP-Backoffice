# TASK-192 — ลบคำอธิบายใต้ปุ่มเพิ่มสต็อก

สถานะ: COMPLETED

1. บันทึกข้อกำหนดใน ACTIVE/Specs/Plan และแผนย่อยนี้.
2. ลบเฉพาะสอง p ใต้ปุ่มยกเลิก/บันทึกใน src/app/products/stock/create/page.tsx.
3. ตรวจ scoped ESLint และ diff; ผลรับงานคือไม่แสดงสองข้อความและยังมีปุ่มเดิม ไม่แก้ handlers/API/DB.

ผล: ลบสองข้อความแล้ว scoped ESLint และ diff check ผ่าน. ไม่เปลี่ยนพฤติกรรม ไม่เขียน DB และยังไม่ได้ตรวจเบราว์เซอร์.
