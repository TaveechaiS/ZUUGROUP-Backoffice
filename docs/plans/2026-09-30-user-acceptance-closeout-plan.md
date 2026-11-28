# แผนย่อย TASK-034 — ปิดรอบตรวจรับ TASK-029–033

## เป้าหมาย

บันทึกการยืนยันจากเจ้าของโครงการว่า TASK-029 ถึง TASK-033 ผ่านครบ และทำให้ทะเบียนงานกับ Handoff สอดคล้องกัน

## ลำดับงาน

1. ตรวจ `tasks/ACTIVE.md`, `tasks/COMPLETED.md`, `tasks/BLOCKED.md`, Task 029–033 และ `docs/HANDOFF.md` ก่อนแก้
2. บันทึก TASK-034 และผลตรวจรับของ TASK-029–033 ในเอกสาร Task
3. ย้าย TASK-029–033 จาก `ACTIVE.md` ไป `COMPLETED.md`; ปรับสถานะ Phase 1–2 ใน `BLOCKED.md` และอัปเดต Handoff
4. ตรวจลิงก์/สถานะด้วยการอ่านไฟล์ซ้ำ และรัน `git diff --check`

## ผลลัพธ์และไฟล์ที่เปลี่ยน

- `docs/plans/2026-09-30-user-acceptance-closeout-plan.md`
- `tasks/TASK-034-user-acceptance-closeout.md`
- `tasks/TASK-029-users-management-mock.md`
- `tasks/TASK-030-page-structure-and-sizing.md`
- `tasks/TASK-031-main-content-padding.md`
- `tasks/TASK-032-table-horizontal-lines.md`
- `tasks/TASK-033-table-full-text.md`
- `tasks/ACTIVE.md`, `tasks/COMPLETED.md`, `tasks/BLOCKED.md`, `docs/HANDOFF.md`

## เกณฑ์ตรวจรับ

- TASK-029–033 ระบุ `DONE` พร้อมบันทึกการยืนยันผ่านจากผู้ใช้วันที่ 2026-09-30
- `ACTIVE.md` ไม่มีงาน 029–033 ค้าง; `COMPLETED.md` แสดงงานครบ
- `BLOCKED.md` ระบุ Phase 1–2 เสร็จแล้ว และคง Gate G-04/G-10 กับ Gate โมดูลธุรกิจที่ยังไม่ผ่าน
- Handoff แสดงผลตรวจรับและสถานะ Gate ปัจจุบันตรงกับทะเบียน
- `git diff --check` ผ่าน; งานนี้เปลี่ยนเอกสารเท่านั้น
