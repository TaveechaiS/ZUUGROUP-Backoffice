# TASK-025 — ตรวจ Responsive ของ App Shell

**สถานะ:** DONE

**Phase:** 2 — Design Foundation

**Specs:** [Project Specs รุ่น 0.3](../docs/specs/2026-09-23-1550-project-specs.md), UAT-22 และ OPEN-08; [ข้อกำหนด Tailwind inline utilities](../docs/specs/2026-09-24-ui-inline-utilities.md)

**Plan:** [แผนย่อย Responsive App Shell](../docs/plans/2026-09-25-responsive-shell-plan.md)

**ขอบเขต:** ตรวจและปรับ responsive presentation ของ Sidebar, Topbar, customer secondary navigation, content และ placeholders ที่มีอยู่ ตาม breakpoint/class patterns ปัจจุบันเท่านั้น. ไม่เพิ่ม route, module UI, business logic, data, หรือสมมติแบบ Responsive ใหม่ใน OPEN-08.

**ไฟล์:** `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Task นี้, `tasks/ACTIVE.md`, `tasks/COMPLETED.md`, `docs/HANDOFF.md` และแผนย่อย.

**Definition of Ready:** มีขอบเขตและแผนย่อยบันทึกแล้ว; TASK-023 มีสเกลอักษรปัจจุบันเป็น baseline; ไม่มีการแก้ไฟล์จากงานอื่นใน scope เดียวกันโดยไม่ตรวจ diff.

**ผลตรวจ AI:** ปรับ Topbar ให้ title flex และตัดคำได้ โดยสงวนกลุ่มวันที่/แจ้งเตือน/โปรไฟล์ไม่ให้ถูกบีบ และลดช่องว่างบนจอแคบ (ไฟล์ `src/components/layout/admin-shell.tsx`). `npm run type-check` ผ่าน; `npm run build` ผ่าน; `git diff --check` ผ่าน. `npm run lint` และ lint เฉพาะไฟล์ใช้เวลาค้างโดยไม่มีผลลัพธ์ จึงหยุดก่อนจบ — lint ยังไม่ยืนยัน. ไม่สามารถเปิด Browser UI ผ่านเครื่องมือนี้เพื่อตรวจภาพจริงได้; ต้องทำ UAT โดยผู้ใช้.

**ผล UAT:** เจ้าของโครงการแจ้งว่า “ผ่านครับ” เมื่อ 2026-09-25; บันทึกเป็น `DONE`.

## ⚠️ ต้องทดสอบโดยคุณ

- ที่ viewport ราว 390px, 768–1024px และ desktop ให้เปิด Dashboard, หน้า placeholder และหน้าลูกค้า.
- ตรวจว่าไม่มี page-level horizontal overflow ที่ไม่ตั้งใจ, Topbar ไม่ซ้อน/ตัดชื่อหน้าและวันที่, เมนู/secondary navigation เลื่อนถึงรายการท้ายได้ และ placeholder อ่านได้.
- บน Desktop ให้คลิกโลโก้ย่อ/ขยาย Sidebar แล้วตรวจว่า content ปรับตำแหน่งและขนาดตามเดิม.
- ผลที่ควรเห็น: เนื้อหาอ่านและเข้าถึง navigation ได้ทุกขนาดจอ; Desktop คง Sidebar ขยาย/ย่อ; ไม่มีข้อความหรือ control ซ้อนกัน.

**สถานะหลังตรวจรับ:** `DONE` ตามผล UAT ที่เจ้าของโครงการยืนยัน.
