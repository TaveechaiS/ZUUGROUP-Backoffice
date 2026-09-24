# TASK-022 — ใช้คลาสขนาด Tailwind เมื่อค่าเท่ากัน

**สถานะ:** READY_FOR_USER_TEST

**Specs:** [คลาสขนาด Tailwind](../docs/specs/2026-09-24-tailwind-sizing-utilities.md)

**Plan:** [แผนย่อย](../docs/plans/2026-09-24-tailwind-sizing-utilities-plan.md)

**ขอบเขต:** ปรับคลาสขนาดใน Sidebar และ Topbar ให้ใช้ชื่อ utility ของ Tailwind เมื่อได้ค่าเดิม; ไม่เปลี่ยนขนาดที่แสดง.

**ไฟล์:** `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

**ผลตรวจ:** คลาสที่แปลงสร้าง CSS ได้ใน Tailwind 4.3.3; `git diff --check` ผ่าน; วันที่ใช้ `md:text-sm` โดยไม่มีคลาส line-height เพิ่ม.

## ⚠️ ต้องทดสอบโดยคุณ

- รีเฟรชหน้าบน Desktop: ตรวจ Sidebar และ Topbar ว่าขนาดตัวหนังสือ ไอคอน ระยะห่าง และตำแหน่งเหมือนก่อนปรับ.
- ทดลองย่อ/ขยาย Sidebar; ตรวจว่าตำแหน่งเนื้อหายังถูกต้อง.
- ตรวจจอแคบภายหลังในรอบ Responsive.