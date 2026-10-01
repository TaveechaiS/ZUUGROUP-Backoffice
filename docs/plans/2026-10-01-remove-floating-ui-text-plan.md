# แผนย่อย TASK-055 — ตัดข้อความประกอบ UI

| ลำดับ | ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | ตรวจรับ |
|---|---|---|---|
| 1 | บันทึกขอบเขตตามคำขอ | Project Specs/Plan, Specs/Plan/Task TASK-055, `tasks/ACTIVE.md` | ระบุข้อความที่จะตัดและสิ่งที่ต้องคง |
| 2 | ตัดข้อความประกอบที่ซ้ำ/ลอย โดยคงเนื้อหาที่มีผลต่อการใช้งาน | `src/components/layout/admin-shell.tsx`, `src/components/pages/module-list-page.tsx`, `src/app/products/products-list.tsx`, `src/app/products/[ref]/product-detail.tsx`, `src/app/products/create/create-product-form.tsx`, `src/app/audit-logs/audit-list.tsx` | ข้อความตัวอย่างไม่แสดง; ชื่อหน้า ตัวกรอง ตาราง pagination ยังอยู่ |
| 3 | ตรวจ static และให้เจ้าของดูหน้า | Task/ACTIVE | lint/type-check/build/diff-check; ดู Dashboard, สินค้า, Audit Logs และรายการอื่น |
