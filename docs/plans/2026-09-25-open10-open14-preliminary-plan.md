# แผนย่อย — TASK-026 บันทึกคำตอบเบื้องต้น OPEN-10/OPEN-14

**วันที่:** 2026-09-25 (Asia/Bangkok)
**ขอบเขต:** งานเอกสารเท่านั้น; ไม่เปลี่ยนโค้ด, schema, migration, database, auth, storage policy หรือ behavior.

## ลำดับงาน

1. อ่าน ACTIVE และลงทะเบียน TASK-026 ก่อนแก้เอกสาร.
2. บันทึกคำตอบของเจ้าของโครงการเป็นข้อสรุปเบื้องต้นใน Specs amendment; แยกสิ่งที่ยืนยันได้กับจุดที่ยังไม่ชัด.
3. ปรับ DECISIONS ให้แสดงว่ามีคำตอบบางส่วนแต่ OPEN-10/OPEN-14 และ Gate G-04/G-10 ยังรอการยืนยัน.
4. เพิ่มอ้างอิงใน Project Specs/Plan และ Handoff เพื่อไม่ให้ผู้รับงานเข้าใจว่าคำตอบชั่วคราวอนุญาตให้พัฒนาได้.
5. ตรวจ Task/ACTIVE/COMPLETED/Handoff/DECISIONS ให้สถานะตรงกัน และรัน `git diff --check`.

## ไฟล์ที่คาดว่าจะเปลี่ยน

- `docs/specs/2026-09-25-open10-open14-preliminary-amendment.md`
- `docs/specs/2026-09-23-1550-project-specs.md`
- `docs/plans/2026-09-25-open10-open14-preliminary-plan.md`
- `docs/plans/2026-09-23-1635-project-plan.md`
- `docs/DECISIONS.md`
- `docs/HANDOFF.md`
- `tasks/TASK-026-record-preliminary-decisions.md`
- `tasks/ACTIVE.md`, `tasks/COMPLETED.md`

## วิธีตรวจรับ

- คำตอบเบื้องต้นถูกบันทึกตามถ้อยคำโดยไม่แต่งเติมเป็นนโยบาย
- คำถามที่ยังไม่ชัดระบุครบ และ Gate ไม่ถูกปิด
- ไม่มีไฟล์โค้ด/ฐานข้อมูลเปลี่ยน; `git diff --check` ผ่าน.
