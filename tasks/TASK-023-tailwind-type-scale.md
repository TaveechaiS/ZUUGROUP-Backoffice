# TASK-023 — จัดขนาดตัวอักษรตามสเกล Tailwind

**สถานะ:** DONE

**Specs:** [ขนาดตัวอักษร Tailwind](../docs/specs/2026-09-24-tailwind-type-scale.md)

**Plan:** [แผนย่อย](../docs/plans/2026-09-24-tailwind-type-scale-plan.md)

**ขอบเขต:** ปรับขนาด `text-[...px]` ทั้งหมดใน `src` เป็นคลาสชื่อขนาด Tailwind โดยปัดขึ้นตาม Specs.

**ไฟล์:** `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Specs/Plan/Task, `tasks/ACTIVE.md`, `tasks/COMPLETED.md` และ `docs/HANDOFF.md`.

**ผลตรวจ:** แปลงคลาสขนาดตัวอักษร 15 จุด; ไม่เหลือ `text-[...px]` หรือ font-size inline ใน `src`; Tailwind สร้าง utility ทั้ง 5 ขนาดได้; TypeScript type-check และ `git diff --check` ผ่าน.

**ผล UAT:** เจ้าของโครงการตรวจภาพรวม Desktop และยืนยันผ่านเมื่อ 2026-09-25. Responsive ของ shell ตรวจรับแยกใน TASK-025.

## ⚠️ ต้องทดสอบโดยคุณ

- รีเฟรชหน้า Desktop แล้วตรวจ Sidebar, Topbar, footer และ placeholder โดยเฉพาะข้อความที่เดิมเล็กกว่า 12px.
- ตรวจว่าเมนูไม่ตัดคำหรือซ้อนกัน และชื่อหน้ากับวันที่ยังจัดวางได้ดี.
- ตรวจจอแคบแยกใน TASK-025 (ผ่านการตรวจรับแล้ว).
