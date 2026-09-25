# TASK-014 — โลโก้ควบคุม Sidebar และชื่อเมนู regular

**สถานะ:** DONE

**Specs:** [ข้อกำหนดสั้น](../docs/specs/2026-09-24-sidebar-logo-toggle-regular.md)

**Plan:** [แผนสั้น](../docs/plans/2026-09-24-sidebar-logo-toggle-regular-plan.md)

ไฟล์โค้ดที่แก้: `src/components/layout/sidebar.tsx` และ `src/components/layout/admin-shell.tsx` เฉพาะความสูง mobile เมื่อซ่อนเมนู. ตรวจว่าปุ่มโลโก้กดย่อ/ขยายได้, ปุ่มสามขีดหาย, ชื่อเมนูหลัก/รองเป็น regular และหัวข้อกลุ่มยังหนา.

ผลตรวจโดย AI: ESLint, TypeScript, production build และ `git diff --check` ผ่าน 2026-09-24. รอผู้ใช้ตรวจ UI/การคลิก.

**ผล UAT:** เจ้าของโครงการยืนยันว่าผ่านทั้งหมดเมื่อ 2026-09-25.
