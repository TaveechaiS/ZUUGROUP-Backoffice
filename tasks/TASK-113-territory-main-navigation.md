# TASK-113 — เขตเป็น Side หลัก

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569.

ผลตรวจ: ESLint 5 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติด Prisma เดิม managerId/salesId/productLot 3 จุด. ยังไม่ได้ตรวจภาพหลัง login; รายงานเขตใช้รายการเขตเดิม ไม่เพิ่มสูตร/ตัวเลข. ไม่ commit/deploy.

1. บันทึก tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan แทนตำแหน่งเขตใน TASK-107.
2. src/config/navigation.ts: เขตเป็นรายการหลักต่อจากโปรโมชัน; เพิ่มเขต parentHref /customers/territories.
3. src/components/layout/territory-secondary-sidebar.tsx: รายงานเขต/เพิ่มเขต ตามสิทธิ์สร้าง Admin ใช้กรอบ sticky กลาง.
4. admin-shell.tsx แยกหมวดเขต/ชื่อ Header; sidebar.tsx เลือกหมวดตรงจาก getAdminPage แทน prefix หลายเมนู; user-secondary-sidebar.tsx ลบเงื่อนไขเขตที่ย้ายออก.
5. ตรวจ lint/types/routes/diff. รายงานเขตเป็นทางเข้ารายการเขตเดิม ไม่เพิ่มตัวเลข/สูตร/API/DB/filter/ตาราง/ฟอร์ม/สิทธิ์ backend ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- Side หลักหมวดจัดการข้อมูลมีเขตต่อจากโปรโมชัน & ของแถม.
- กดเขต: Header เขต, Side รองรายงานเขต/เพิ่มเขตตามสิทธิ์ และ Side หลักเลือกเขตเพียงรายการเดียว.
- รายละเอียดเลือกเมนูรายงานเขต; สร้างเลือกเพิ่มเขต เปิดหน้าเดิม.
- ผู้ใช้งานเหลือรายชื่อ/เพิ่มผู้ใช้งาน ไม่เห็นเขตใน Side รอง.
- คอม/มือถือ/ย่อเมนู/เลื่อน: ลิงก์และ sticky ทำงานเดิม; ตรวจหมวดลูกค้า/สินค้ายังเลือกถูกต้อง.
