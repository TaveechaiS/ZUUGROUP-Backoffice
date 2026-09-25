# TASK-031 — Padding กรอบเนื้อหาหลัก

- **สถานะ:** READY_FOR_USER_TEST
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** Project Specs §22.10
**Plan:** [แผนย่อย](../docs/plans/2026-09-25-main-content-padding-plan.md)

## ขอบเขต

เปลี่ยนเฉพาะ padding ของ wrapper ใต้ Topbar ที่ผู้ใช้ชี้ในภาพเป็น `p-6`. ไม่แก้สี, Sidebar, Topbar, หน้าเฉพาะ, Footer หรือฟังก์ชัน.

## วิธีตรวจรับ

ดู [แผนย่อย](../docs/plans/2026-09-25-main-content-padding-plan.md).

## ผลดำเนินการ

- เปลี่ยน wrapper ใน `src/components/layout/admin-shell.tsx` จาก padding แยกตาม breakpoint เป็น `p-6` เท่านั้น; สี, layout และฟังก์ชันอื่นใน Task นี้ไม่เปลี่ยน.
- ตรวจ className ใหม่และ `git diff --check` ผ่าน. ไม่ได้รันชุดทดสอบหรือเปิดตรวจภาพใน Browser.

## ⚠️ ต้องทดสอบโดยคุณ

เปิด `/customers` บน Desktop และมือถือ: ระยะจากขอบพื้นที่สีขาวถึงเนื้อหาควรเป็น 24px ทุกด้าน; Topbar, Sidebar และการใช้งานเหมือนเดิม.
