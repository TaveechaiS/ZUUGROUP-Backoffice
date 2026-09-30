# แผนย่อย TASK-035 — บันทึกนโยบายรหัสผ่านที่ Admin จัดการ

**วันที่:** 2026-09-30 (Asia/Bangkok)
**ขอบเขต:** งานเอกสารเท่านั้น; ไม่เปลี่ยน Auth, UI, API, schema, database หรือพฤติกรรมระบบ

## ลำดับงาน

1. อ่าน `tasks/ACTIVE.md`, OPEN-14, amendment เดิม, Specs, Plan และ Handoff
2. บันทึกขอบเขต TASK-035 ใน ACTIVE ก่อนปรับเอกสารข้อกำหนด
3. เพิ่มบันทึกแก้ไขใน Specs ว่า Admin ตั้งรหัสเริ่มต้นและรหัสใหม่ให้เอง ไม่มีอีเมล/ลิงก์เชิญหรือรีเซ็ตรหัสผ่าน
4. ปรับ OPEN-14, G-04, DECISIONS, Project Plan และ Handoff ให้สอดคล้อง โดยคงประเด็น Admin คนสุดท้ายที่ยังไม่สรุป
5. บันทึกผลและย้าย TASK-035 ไป COMPLETED; ตรวจเอกสารและ `git diff --check`

## ไฟล์ที่เปลี่ยน

- `docs/specs/2026-09-30-admin-managed-password-amendment.md`
- `docs/specs/2026-09-23-1550-project-specs.md`
- `docs/plans/2026-09-23-1635-project-plan.md`
- `docs/DECISIONS.md`, `docs/HANDOFF.md`, `tasks/BLOCKED.md`
- `tasks/TASK-035-admin-managed-password.md`
- `tasks/ACTIVE.md`, `tasks/COMPLETED.md`

## เกณฑ์ตรวจรับ

- ระบุชัดว่า Admin ตั้งรหัสเริ่มต้นและตั้งรหัสใหม่เอง
- ไม่มีการส่งลิงก์เชิญ ลิงก์รีเซ็ต หรือรหัสผ่านทางอีเมล
- ไม่แต่งเติมขั้นตอนเปลี่ยนรหัสผ่านครั้งแรกหรือข้อบังคับรูปแบบรหัสผ่าน
- G-04/OPEN-14 ยังคงเปิดสำหรับขอบเขตการจัดการ Admin คนสุดท้ายและสิทธิ์ที่เกี่ยวข้อง
- ไม่มีการแก้โค้ดหรือฐานข้อมูล; `git diff --check` ผ่าน
