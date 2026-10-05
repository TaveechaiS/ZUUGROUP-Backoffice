# TASK-102 — Side รองโปรโมชันและของแถม

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติ 5 ตุลาคม 2569.

ผลตรวจ: ESLint 3 ไฟล์, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหาเดิม 3 จุด managerId/salesId/productLot จาก generated Prisma Client ไม่ตรง schema. ยังไม่ได้ตรวจภาพหลัง login; เจ้าของตรวจตามด้านล่าง. คง filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB และ OPEN; ไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. บันทึกใน tasks/ACTIVE.md, ไฟล์นี้, docs/specs/2026-09-23-1550-project-specs.md และ docs/plans/2026-09-23-1635-project-plan.md.
2. src/config/navigation.ts: เพิ่ม /promotions/create เป็น Side รอง.
3. src/components/layout/promotion-secondary-sidebar.tsx: รายการโปรโมชัน → เพิ่มโปรโมชัน (Admin) สุดท้าย แบบ Side รองเดิม.
4. src/components/layout/admin-shell.tsx: ติดตั้งเฉพาะหมวด /promotions และ Header โปรโมชัน & ของแถม.
5. ตรวจ ESLint/TypeScript/routes/diff. คง filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB และสิทธิ์เดิม; OPEN-01 ไม่เปลี่ยน. Tab เงื่อนไข/ของแถมเก็บสำหรับงานรายละเอียด ไม่เพิ่มเมนูของแถมแยก ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดโปรโมชัน & ของแถม: Side รองมีรายการโปรโมชัน/เพิ่มโปรโมชันตามลำดับสำหรับ Admin.
- กดเพิ่มโปรโมชัน: เปิดฟอร์มเดิมและไฮไลต์เพิ่ม; กลับรายการได้.
- เปิดรายละเอียด: เมนูรายการยังถูกเลือก Header คงชื่อหมวด.
- ย่อ Side หลัก/เปิดมือถือ: เมนูยังเข้าถึงได้; ผู้ที่ไม่ใช่ Admin ไม่เห็นเพิ่มโปรโมชัน.
- filter/ตาราง/ฟอร์ม/รายละเอียดคงเดิม ไม่มีเมนูของแถมแยก.
