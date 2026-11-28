# TASK-066 — ตัวหนังสือปุ่มเพิ่มข้อมูลสีขาว

สถานะ: READY_FOR_USER_TEST
อนุมัติจากคำขอเจ้าของโครงการ 2026-10-02
Specs: docs/specs/2026-09-24-ui-inline-utilities.md
Plan: docs/plans/2026-09-23-1635-project-plan.md


## ตัวหนังสือปุ่มเพิ่มข้อมูล — 2026-10-02 (TASK-066)

เจ้าของขอข้อความสีขาว ปรับ text-white! ในปุ่มเพิ่ม shared list/users/products และพื้นน้ำเงินข้อความขาวในปุ่มเพิ่มรายการแม่แล้ว lint/diff ผ่าน รอเจ้าของตรวจหน้าจอ ปลายทางและพฤติกรรมเดิม

แผน/ไฟล์: ตรวจ cascade → ปรับ module-list-page.tsx, products-list.tsx, users-list-content.tsx, create-product-form.tsx → lint/diff → เจ้าของตรวจ

## ⚠️ ต้องทดสอบโดยคุณ
เปิดหน้ารายการและเพิ่มสินค้า ตรวจปุ่มเพิ่มข้อความและเครื่องหมาย + สีขาวทั้งปกติ/hover
