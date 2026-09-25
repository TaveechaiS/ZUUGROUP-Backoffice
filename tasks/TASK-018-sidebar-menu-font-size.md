# TASK-018 — ขนาดตัวอักษรเมนูหลัก Sidebar

**สถานะ:** DONE

**Specs:** [ขนาดเมนูหลัก Sidebar](../docs/specs/2026-09-24-sidebar-menu-font-size.md)

**Plan:** [แผนสั้น](../docs/plans/2026-09-24-sidebar-menu-font-size-plan.md)

**Branch / Commit ตั้งต้น:** `AI` / `846c251`

**ขอบเขต:** เปลี่ยนเฉพาะชื่อเมนูหลัก Sidebar เป็น 14px บน Desktop. จอแคบปรับเป็น 12px ตาม TASK-023, Poppins Regular 400, spacing, color, icon, menu group headers, submenu และ behavior เดิม.

**ไฟล์:** `src/components/layout/sidebar.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดหน้า Admin บน Desktop แล้วตรวจชื่อเมนูหลักทุกกลุ่มทั้ง Sidebar ขยายและย่อ: ตัวอักษรควรเป็น 14px และอ่านง่าย.
- ตรวจว่าหัวข้อกลุ่มและเมนูย่อยไม่เปลี่ยนขนาด.
- การตรวจ Responsive/Mobile เลื่อนไปหลังงานหลักตามคำขอ.

**ผล UAT:** เจ้าของโครงการยืนยันว่าผ่านทั้งหมดเมื่อ 2026-09-25.
