# แผนย่อย — Logo และโปรไฟล์ Sidebar

**สถานะ:** พร้อมทำตามคำขอเจ้าของโครงการ 2026-09-24

**Task:** [TASK-010](../../tasks/TASK-010-sidebar-logo-profile.md)

**Specs:** [ข้อแก้ไขสั้น](../specs/2026-09-24-sidebar-logo-amendment.md)

1. ตรวจไฟล์ Logo ที่ได้รับและคัดลอกเป็น `public/logo.png`
2. แสดง Logo ใน `src/components/layout/sidebar.tsx` แบบขยาย/ย่อ และลบบล็อกโปรไฟล์ Sidebar
3. ปรับ `src/app/globals.css` สำหรับตำแหน่ง Logo; เก็บโปรไฟล์ Topbar ที่ใช้ CSS ร่วมกัน
4. ตรวจโค้ดและหน้าเว็บ แล้วส่งตำแหน่ง CSS ของขนาดตัวอักษรให้เจ้าของโครงการ

**ผลตรวจรับ:** Logo ตรงภาพที่ให้, แสดงทั้งสองสถานะ, ไม่มีโปรไฟล์ท้าย Sidebar, เมนูเดิมยังใช้ได้
