# แผน — TASK-023

1. ตรวจ `tasks/ACTIVE.md` และรายการขนาดตัวอักษรแบบ pixel ใน `src`; ยืนยันสเกลจาก Tailwind ที่ติดตั้ง.
2. บันทึกกฎปัดขึ้นและผลที่คาดว่าจะเปลี่ยนขนาด รวมถึงข้อความขนาดต่ำกว่า 12px.
3. แทน `text-[...px]` ใน `src/components/layout/sidebar.tsx` และ `src/components/layout/admin-shell.tsx` ด้วยคลาสชื่อขนาด Tailwind.
4. ตรวจว่าไม่มี `text-[...px]` เหลือใน `src`, ตรวจ CSS ที่สร้าง, type-check และ diff; ส่งให้เจ้าของโครงการตรวจภาพ Desktop. Responsive UAT ภายหลังตามลำดับงาน.

**ไฟล์:** `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.