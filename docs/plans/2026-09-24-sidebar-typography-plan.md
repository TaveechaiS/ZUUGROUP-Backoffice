# แผนย่อย — ย้าย Typography ของ Sidebar ไป className

**สถานะ:** พร้อมทำตามคำขอเจ้าของโครงการ 2026-09-24

**Specs:** [ข้อแก้ไขสั้น](../specs/2026-09-24-sidebar-typography-utilities.md)

**Task:** [TASK-012](../../tasks/TASK-012-sidebar-typography-utilities.md)

1. เพิ่ม Tailwind utility ใน `src/components/layout/sidebar.tsx` สำหรับขนาด/น้ำหนักทุกข้อความ ทั้ง Mobile, Desktop และ active state
2. ลบค่า Typography ของ Sidebar ที่ย้ายแล้วออกจาก `src/app/globals.css` และเปลี่ยน `font: inherit` ของ input เป็น `font-family: inherit`
3. บันทึกกติกาใน `AGENTS.md` เพื่อให้งาน Sidebar ครั้งต่อไปใช้รูปแบบเดียวกัน
4. ตรวจ lint/type-check/build และภาพ Sidebar ทั้งสถานะขยาย/ย่อ
