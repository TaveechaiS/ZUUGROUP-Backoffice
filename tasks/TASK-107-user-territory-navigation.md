# TASK-107 — เขต/เพิ่มเขตในผู้ใช้งาน

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569.

ผลตรวจ: ESLint 3 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหา Prisma เดิม 3 จุด managerId/salesId/productLot. ยังไม่ได้ตรวจภาพหลัง login. คง URL/ข้อมูล/ฟอร์ม/filter/ตาราง/สิทธิ์เดิม ไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan บันทึกข้อยืนยัน.
2. src/config/navigation.ts: เขตและเพิ่มเขตใช้ URL เดิมและ parentHref /users.
3. src/components/layout/admin-shell.tsx: หน้าเขตอยู่ใต้ Header/Side รองผู้ใช้งาน ไม่แสดง Side รองลูกค้าซ้ำ.
4. src/components/layout/user-secondary-sidebar.tsx: รายชื่อผู้ใช้งาน/เขต/เพิ่มเขต/เพิ่มผู้ใช้งานล่างสุด พร้อมสถานะที่เลือกสำหรับรายละเอียด/สร้าง.
5. ตรวจ lint/types/routes/diff; คงข้อมูล/สิทธิ์/ฟอร์ม/filter/ตาราง/API/DB ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- Admin เปิดผู้ใช้งาน: เห็น 4 เมนูตามลำดับ.
- กดเขต: เปิดรายการเขตเดิม Header ผู้ใช้งานและ Side หลักผู้ใช้งานถูกเลือก.
- เปิดรายละเอียดเขต: เลือกเมนูเขต; กดเพิ่มเขต: เปิดฟอร์มเดิมและเลือกเพิ่มเขตเพียงรายการเดียว.
- กลับรายชื่อ/เพิ่มผู้ใช้งาน: สถานะเมนูตรงหน้า ไม่ซ้อน Side รองลูกค้า.
- คอม/มือถือ/ย่อเมนู: ทุกลิงก์เข้าถึงได้ สิทธิ์เดิมยังคงอยู่.
