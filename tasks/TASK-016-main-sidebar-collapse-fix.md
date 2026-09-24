# TASK-016 — แก้การย่อ Sidebar หลัก

**สถานะ:** DONE — ผู้ใช้ทดสอบและยืนยัน 2026-09-24

**Specs:** [ข้อกำหนดสั้น](../docs/specs/2026-09-24-main-sidebar-collapse-fix.md)

**Plan:** [แผนสั้น](../docs/plans/2026-09-24-main-sidebar-collapse-fix-plan.md)

แก้เฉพาะ `sidebar.tsx`, `admin-shell.tsx`, `globals.css` และเอกสารที่เกี่ยวข้อง. เกณฑ์รับ: ย่อ Sidebar หลักแล้วเหลือ 104px, ไอคอนครบ 13 เมนู, body/Top bar ขยับตาม, Sidebar ย่อยของลูกค้าอยู่ใน body และยังเข้าหน้าย่อยได้ทุกขนาดจอ.

ผลตรวจโดย AI: ESLint, TypeScript, production build ผ่าน. ตรวจ browser Desktop ที่ `/customers/dashboard` แล้ว: โลโก้ย่อ/ขยายได้, แถบย่อมีไอคอน 13 รายการ, Top bar ขยับตามและ Sidebar ย่อยลูกค้ายังอยู่ใน body. จอขนาดอื่นรอเจ้าของโครงการตรวจ.
