# TASK-019 — ความกว้าง Sidebar หลัก

**สถานะ:** READY_FOR_USER_TEST

**Specs:** [ความกว้าง Sidebar หลัก](../docs/specs/2026-09-24-sidebar-main-width.md)

**Plan:** [แผนสั้น](../docs/plans/2026-09-24-sidebar-main-width-plan.md)

**Branch / Commit ตั้งต้น:** `AI` / `846c251`

**ขอบเขต:** ตั้ง Sidebar หลักตอนขยายบน Desktop เป็น 300px, ตอนย่อ 104px และ Sidebar ย่อยลูกค้าเป็น 250px. คง layout อื่น.

**ไฟล์:** `src/app/globals.css`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดหน้า Admin บน Desktop: Sidebar หลักแบบขยายควรกว้าง 300px.
- ย่อ Sidebar: ความกว้างยัง 104px และพื้นที่เนื้อหาขยับตาม.
- เปิดหน้าลูกค้า: Sidebar ย่อยยังกว้าง 250px.
- ตรวจ Responsive/Mobile ภายหลังตามคำขอ.