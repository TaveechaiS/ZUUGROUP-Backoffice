# แผนย่อย TASK-082 — ล็อกแถบสีและ Header

1. อ่าน ACTIVE, Specs แถบสีเดิม, AdminShell, Sidebar และคู่มือ CSS ของ Next.js; บันทึกขอบเขตก่อนแก้โค้ด.
2. แก้ `src/components/layout/admin-shell.tsx` ตามคำยืนยันล่าสุด: ถอน sticky/top/z-index จาก wrapper ที่ครอบ Header พร้อม border สี 10px เพื่อให้เลื่อนตาม flow ปกติทั้ง desktop/mobile.
3. ตรวจรูปแบบโค้ด, lint เฉพาะไฟล์, type-check และ diff-check; บันทึกผลใน `tasks/TASK-082-sticky-header.md` และ ACTIVE.

ไฟล์เอกสาร: Specs/Plan นี้, ลิงก์จาก Project Specs/Plan, TASK-082 และ ACTIVE.

ผลลัพธ์: Header พร้อมแถบสีน้ำเงินเลื่อนตามหน้า. วิธีตรวจรับ: เปิดหน้าที่ยาวและเลื่อนทั้ง desktop/mobile รวมย่อ/ขยาย Sidebar; Header/แถบสีเลื่อนพ้นจอ และกลับต้นหน้าแล้วใช้ปุ่มได้.
