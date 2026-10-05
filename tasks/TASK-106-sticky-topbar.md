# TASK-106 — ล็อก Topbar

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569.

ผลตรวจ: ESLint 2 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหาเดิม managerId/salesId/productLot 3 จุดจาก generated Prisma Client. ยังไม่ได้ตรวจเลื่อนจริงหลัง login; เจ้าของตรวจตามด้านล่าง. ไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan: บันทึกล็อก Topbar แทนกฎไม่ล็อก TASK-082/105.
2. src/components/layout/admin-shell.tsx: Topbar wrapper sticky ด้านบนบนคอม/ใต้ Side หลักบนมือถือ; ref และ ResizeObserver วัดความสูงจริง --topbar-height.
3. src/components/layout/secondary-sidebar-frame.tsx: sticky ใต้ Topbar ทั้งคอม/มือถือ คอมสูง viewport ลบ Topbar และเลื่อนเมนูภายในได้.
4. ตรวจ ESLint/types/routes/diff; ไม่เปลี่ยนขนาด สี ฟังก์ชัน ข้อมูล filter/ตาราง ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- เลื่อนหน้ายาวบนคอม: Topbar/แถบสีค้างด้านบน Side รองอยู่ด้านล่าง ไม่ซ้อนกัน.
- ย่อ/ขยาย Side หลัก: ทั้ง Topbar และ Side รองวางถูกตำแหน่ง.
- มือถือ/หมุนจอ: Side หลัก → Topbar → Side รองค้างตามลำดับ ไม่ทับกัน ปุ่มใน Topbar/เมนูยังกดได้.
- หน้าจอเตี้ย: Side รองเลื่อนภายในจนถึงเมนูสุดท้ายได้.
