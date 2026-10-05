# TASK-105 — ตรึง Side รองเวลาเลื่อน

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติ 5 ตุลาคม 2569.

ผลตรวจ: ESLint layout, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ยังติดปัญหาเดิม managerId/salesId/productLot 3 จุดจาก generated Prisma Client. ยังไม่ได้ตรวจการเลื่อนจริงหลัง login; เจ้าของตรวจตามด้านล่าง. ไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. บันทึก tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan.
2. src/components/layout/secondary-sidebar-frame.tsx: กรอบกลาง sticky; คอมสูงตาม viewport เลื่อนเมนูภายใน และ self-start เพื่อ sticky ใน flex. มือถือใช้ความสูง Side หลักเป็น top.
3. src/components/layout/admin-shell.tsx: ResizeObserver วัดความสูง Side หลัก กำหนดตัวแปรขนาด --main-sidebar-height ให้กรอบลูก ไม่เปลี่ยน Header.
4. product/customer/user/promotion/report-secondary-sidebar.tsx: เปลี่ยนกรอบ aside มาใช้ component กลาง คง nav/ลิงก์/คลาสสี/สิทธิ์เดิม.
5. ตรวจ ESLint/TypeScript/routes/diff และตรวจรับหน้าจอ. ไม่เปลี่ยนเนื้อหา/filter/ตาราง/API/DB ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดหน้ารายการที่ยาวแล้วเลื่อน: Side รองยังค้างด้านบนบนคอม ขณะที่ Header เลื่อนตามเดิม.
- หน้าจอเตี้ย/เมนูยาว: เลื่อนภายใน Side รองเพื่อกดรายการสุดท้ายได้.
- ย่อ/ขยาย Side หลัก: Side รองยังอยู่ตำแหน่งถูกต้อง.
- มือถือ: Side รองค้างใต้ Side หลักไม่ซ้อนกัน เลื่อนเมนูแนวนอนและกดได้ รวมตอนย่อ/ขยายหรือหมุนจอ.
- ตรวจทุกหมวดลูกค้า/สินค้า/ผู้ใช้/โปรโมชัน/รายงาน.
