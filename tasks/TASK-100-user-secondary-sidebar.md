# TASK-100 — Side รองผู้ใช้งาน

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติ “ปรับ” 5 ตุลาคม 2569.

ผลตรวจ: ESLint 3 ไฟล์, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ติดข้อผิดพลาดเดิม 3 จุด managerId/salesId/productLot จาก generated Prisma Client ไม่ตรง schema. ยังไม่ได้ตรวจภาพหลัง login; เจ้าของตรวจตามด้านล่าง. ไม่แก้ filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB และไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. บันทึกข้อยืนยันใน tasks/ACTIVE.md, เอกสารนี้, docs/specs/2026-09-23-1550-project-specs.md และ docs/plans/2026-09-23-1635-project-plan.md.
2. src/config/navigation.ts: เพิ่มรายการเพิ่มผู้ใช้งาน /users/create สำหรับ Side รอง.
3. src/components/layout/user-secondary-sidebar.tsx: เมนูรายชื่อผู้ใช้งาน → เพิ่มผู้ใช้งานสุดท้าย พร้อมสถานะที่เลือก รูปแบบเดียวกับ Side รองเดิม.
4. src/components/layout/admin-shell.tsx: Header ผู้ใช้งานและ Side รองเฉพาะ Admin ในหมวด /users.
5. ตรวจ ESLint/TypeScript/routes/diff; คง filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB/สิทธิ์และตำแหน่ง Side หลักเดิม. ไม่เพิ่ม Tab ประวัติ ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- Admin เปิดผู้ใช้งาน: Header ผู้ใช้งานและ Side รองรายชื่อผู้ใช้งาน/เพิ่มผู้ใช้งานตามลำดับ.
- กดเพิ่มผู้ใช้งาน: เปิดฟอร์มเดิมและเลือกเมนูเพิ่ม; กลับรายชื่อได้.
- เปิดรายละเอียดผู้ใช้: เลือกรายชื่อผู้ใช้งาน; ข้อมูลและเครื่องมือเดิม.
- ย่อ Side หลัก/เปิดมือถือ: Side รองยังเข้าถึงได้.
- ผู้ที่ไม่ใช่ Admin ไม่เห็นเมนูผู้ใช้งานตามเดิม; filter/ตารางคงเดิม.
