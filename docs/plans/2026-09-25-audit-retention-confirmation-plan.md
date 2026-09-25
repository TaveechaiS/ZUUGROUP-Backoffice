# แผนย่อย — TASK-027 ยืนยันอายุ Audit Log

**วันที่:** 2026-09-25 (Asia/Bangkok)
**ขอบเขต:** บันทึกคำยืนยันว่าเก็บ Audit Log 5 ปีในเอกสารโครงการ; ไม่เปลี่ยนโค้ด, schema, retention job, archive policy หรือฐานข้อมูล.

## ลำดับงาน

1. อ่าน `tasks/ACTIVE.md` และลงทะเบียนขอบเขต TASK-027.
2. ปรับข้อบันทึก OPEN-10 ให้ระบุอายุ Audit 5 ปีเป็นข้อยืนยัน และแก้ DECISIONS/Plan/Handoff ให้ตรงกัน.
3. คง OPEN-10 ไว้สำหรับขนาดไฟล์, เอกสารที่ต้องแนบ, จุดเริ่มนับ, และวิธี Archive/restore/delete.
4. ตรวจความสอดคล้องของ Task/status/เอกสาร และ `git diff --check`.

## ไฟล์ที่คาดว่าจะเปลี่ยน

- `docs/specs/2026-09-25-open10-open14-preliminary-amendment.md`
- `docs/DECISIONS.md`, `docs/plans/2026-09-23-1635-project-plan.md`, `docs/HANDOFF.md`
- `tasks/TASK-027-confirm-audit-retention.md`, `tasks/ACTIVE.md`, `tasks/COMPLETED.md`

## วิธีตรวจรับ

- อายุ Audit Log 5 ปีแสดงเป็นค่าที่ยืนยันแล้ว; ไม่มีการตีความจุดเริ่มนับหรือรายละเอียดอื่นเพิ่ม.
- OPEN-10/G-10 ยังคงรอในส่วนที่ยังไม่ตอบ; ไม่มีไฟล์โค้ด/ฐานข้อมูลเปลี่ยน.
- `git diff --check` ผ่าน.
