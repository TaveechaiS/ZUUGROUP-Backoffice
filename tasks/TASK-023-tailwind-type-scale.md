# TASK-023 — จัดขนาดตัวอักษรตามสเกล Tailwind

**สถานะ:** READY_FOR_USER_TEST

**Specs:** [ขนาดตัวอักษร Tailwind](../docs/specs/2026-09-24-tailwind-type-scale.md)

**Plan:** [แผนย่อย](../docs/plans/2026-09-24-tailwind-type-scale-plan.md)

**ขอบเขต:** ปรับขนาด `text-[...px]` ทั้งหมดใน `src` เป็นคลาสชื่อขนาด Tailwind โดยปัดขึ้นตาม Specs.

**ไฟล์:** `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

**ผลตรวจ:** แปลงคลาสขนาดตัวอักษร 15 จุด; ไม่เหลือ `text-[...px]` หรือ font-size inline ใน `src`; Tailwind สร้าง utility ทั้ง 5 ขนาดได้; TypeScript type-check และ `git diff --check` ผ่าน.

**คำยืนยันผู้ใช้:** เจ้าของโครงการยืนยันว่าพอใจกับสเกลตัวอักษรปัจจุบัน; งานยังรอตรวจภาพรวม Desktop ตามรายการด้านล่าง และ Responsive ตามรอบที่เลื่อนไว้.

## ⚠️ ต้องทดสอบโดยคุณ

- รีเฟรชหน้า Desktop แล้วตรวจ Sidebar, Topbar, footer และ placeholder โดยเฉพาะข้อความที่เดิมเล็กกว่า 12px.
- ตรวจว่าเมนูไม่ตัดคำหรือซ้อนกัน และชื่อหน้ากับวันที่ยังจัดวางได้ดี.
- ตรวจจอแคบภายหลังในรอบ Responsive.