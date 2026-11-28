# TASK-097 — Side รองลูกค้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติทดลองเมนู 5 ตุลาคม 2569.

ผลตรวจ: ESLint เฉพาะ 3 ไฟล์ที่แก้, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหาเดิม 3 จุดจาก generated Prisma Client ไม่ตรง schema (managerId/salesId ใน users API, productLot ใน prisma.ts); ยังไม่แก้ generated หรือฐานข้อมูล. ไม่ได้ตรวจภาพหลัง login; รอเจ้าของตรวจคอม/มือถือ. ไม่มีการแก้ filter/ตารางหรือ commit/deploy.

## ลำดับและผลลัพธ์

1. บันทึกข้อยืนยันใน Specs/Plan/ACTIVE ก่อนแก้โค้ด.
2. เพิ่ม Side รองใต้ Header: รายชื่อลูกค้า (/customers), เพิ่มลูกค้า (/customers/create) เป็นรายการสุดท้าย. แสดงเพิ่มลูกค้าเฉพาะ Admin ตาม guard เดิม.
3. ติดตั้งใน AdminShell เฉพาะหมวด /customers; Header ชื่อ “ลูกค้า”. รูปแบบ/สี/ฟอนต์เหมือน Side รองสินค้าเดิม. มือถือใช้แถบแนวนอนเดิมเพื่อทดลอง.
4. คง filter/ตาราง/ฟอร์ม/รายละเอียด/ข้อมูล/สิทธิ์; ไม่เพิ่มเมนูเขต เอกสาร ภาพรวม และไม่ลบ routes เดิม. การกด ID และดูเอกสารในรายละเอียดเป็นข้อยืนยันสำหรับรอบต่อไป.
5. ตรวจ ESLint, TypeScript, routes และ whitespace แล้วส่งเจ้าของตรวจ.

## ไฟล์ที่จะเปลี่ยน

- tasks/ACTIVE.md และไฟล์นี้
- docs/specs/2026-09-23-1550-project-specs.md
- docs/plans/2026-09-23-1635-project-plan.md
- src/config/navigation.ts
- src/components/layout/admin-shell.tsx
- src/components/layout/customer-secondary-sidebar.tsx

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดลูกค้า: Header ลูกค้า และ Side รองมีรายชื่อลูกค้า/เพิ่มลูกค้าเท่านั้นสำหรับ Admin.
- กดเพิ่มลูกค้า: เปิดฟอร์มเดิม เมนูเพิ่มลูกค้าถูกเลือก; กลับรายชื่อลูกค้าได้.
- เปิดรายละเอียดลูกค้า: รายชื่อลูกค้ายังเป็นเมนูที่เลือก.
- ย่อ Side หลัก: Side รองยังอยู่; มือถือเห็นและกดสองเมนูได้.
- ผู้ใช้ที่ไม่ใช่ Admin ไม่เห็นเพิ่มลูกค้า; guard เดิมยังคงอยู่.
- filter และตารางทำงานและแสดงแบบเดิม.
