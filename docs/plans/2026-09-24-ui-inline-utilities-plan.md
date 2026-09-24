# แผนสั้น — TASK-013

1. ตรวจข้อความ CSS ที่แนบและตำแหน่งใช้งานใน JSX; บันทึก TASK-013 ใน `tasks/ACTIVE.md`.
2. ย้ายสไตล์ของ Sidebar และสถานะย่อ/ขยายไป `src/components/layout/sidebar.tsx`.
3. ย้ายสไตล์ของ Topbar, เนื้อหา, Dashboard/Module placeholder ไป `src/components/layout/admin-shell.tsx`; ลบกฎ component และ responsive ที่ย้ายแล้วจาก `src/app/globals.css`.
4. ปรับแนวทางใน `AGENTS.md` และเอกสารอ้างอิง; ตรวจ static checks และให้เจ้าของโครงการตรวจหน้าจอ Desktop/Mobile.

ผลลัพธ์: สไตล์ UI ที่แนบอยู่ที่ `className` ของ component; `globals.css` เหลือเฉพาะพื้นฐานส่วนกลาง. ไฟล์ที่แก้: `sidebar.tsx`, `admin-shell.tsx`, `globals.css`, `AGENTS.md`, Specs/Plan/Task ที่เกี่ยวข้อง.
