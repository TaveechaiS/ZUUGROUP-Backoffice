# TASK-098 — Side รองสินค้าและสต็อก

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติ “ปรับ” 5 ตุลาคม 2569.

ผลตรวจ: ESLint 4 ไฟล์, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ยังติดข้อผิดพลาดเดิม 3 จุด managerId/salesId/productLot จาก generated Prisma Client ไม่ตรง schema; ไม่แก้ในรอบนี้. ยังไม่ได้ตรวจหน้าจอหลัง login; รอเจ้าของตรวจคอม/มือถือ. คง filter/ตาราง/ฟอร์ม/API/DB; ไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. บันทึกข้อยืนยันใน tasks/ACTIVE.md, เอกสารนี้, docs/specs/2026-09-23-1550-project-specs.md และ docs/plans/2026-09-23-1635-project-plan.md.
2. src/config/navigation.ts: เพิ่ม parent ให้รับสินค้าเข้าเดิม และรายการเพิ่มสินค้าต่อท้าย.
3. src/components/layout/product-secondary-sidebar.tsx: แสดง 7 รายการตามลำดับ แสดงเพิ่มสินค้าสำหรับ Admin และเลือกสถานะหน้าอย่างถูกต้อง.
4. src/components/layout/admin-shell.tsx และ sidebar.tsx: Header/Side รอง/Side หลักของหน้ารับเข้าอยู่หมวดสินค้าแม้ URL เป็น /purchases/receipts.
5. ตรวจ ESLint เฉพาะไฟล์/TypeScript/routes/diff; ไม่แก้ filter/ตาราง/ฟอร์ม/API/DB/สิทธิ์/OPEN Design ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- Admin เปิดสินค้าและสต็อก: เห็นสินค้าทั้งหมด/คลังหลัก/คลังการตลาด/คลังรอทำลาย/ล็อตสินค้า/รับสินค้าเข้า/เพิ่มสินค้าตามลำดับ.
- กดรับสินค้าเข้า: เปิดหน้าเดิมพร้อมปุ่มรับเข้า; Header และ Side หลักยังเป็นสินค้าและสต็อก, Side รองเลือกรับสินค้าเข้า.
- กดเพิ่มสินค้า: เปิดฟอร์มเดิม Side รองเลือกเพิ่มสินค้าเพียงรายการเดียว.
- กลับสินค้าทั้งหมด/แต่ละคลัง/ล็อต: สถานะที่เลือกถูกต้อง filter และตารางเดิม.
- ย่อ Side หลักหรือเปิดมือถือ: เมนูยังเข้าถึงได้. ผู้ใช้ที่ไม่ใช่ Admin ไม่เห็นเพิ่มสินค้า.
