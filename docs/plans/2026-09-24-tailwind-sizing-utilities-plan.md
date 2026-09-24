# แผน — TASK-022

1. ตรวจ `tasks/ACTIVE.md`, คลาสใน Sidebar และ Topbar และสเกลของ Tailwind ที่ติดตั้ง.
2. บันทึกกฎแปลงค่า: ตัวอักษรใช้ชื่อขนาดตรงตัว; spacing และ dimension ใช้ utility ตัวเลขเมื่อเท่าค่า pixel เดิมที่ root font 16px.
3. แก้เฉพาะคลาสใน `src/components/layout/sidebar.tsx` และส่วน Topbar ของ `src/components/layout/admin-shell.tsx`; เก็บส่วนภาพตกแต่ง placeholder ไว้.
4. ตรวจคลาสที่เปลี่ยน, diff และ CSS ที่ Tailwind สร้าง; ส่งให้เจ้าของโครงการตรวจภาพ Desktop. Responsive UAT ตามรอบที่เลื่อนไว้.

**ไฟล์:** `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.