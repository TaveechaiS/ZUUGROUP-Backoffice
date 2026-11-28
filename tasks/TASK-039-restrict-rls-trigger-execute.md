# TASK-039 — จำกัดสิทธิ์ฟังก์ชัน RLS event trigger

- **สถานะ:** READY_FOR_USER_TEST
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ข้อกำหนดความปลอดภัย](../docs/specs/2026-09-30-rls-function-execute-amendment.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-09-30-rls-function-execute-plan.md)
- **Commit ตั้งต้น:** `a593513` (มีงานอื่นใน working tree)

## ขอบเขต

Security Advisor พบ `public.rls_auto_enable()` เป็น `SECURITY DEFINER` event trigger ที่ `anon` และ `authenticated` เรียกได้จากสิทธิ์ `PUBLIC` ปริยาย. จำกัด `EXECUTE` ของ PUBLIC และสอง Role นี้ โดยคง trigger `ensure_rls` และการทำงานเปิด RLS อัตโนมัติ. ไม่แก้ตาราง, policy, ฟังก์ชันเนื้อใน หรือ Auth settings.

## ไฟล์และการตรวจรับ

- Migration ใน `prisma/migrations/20260930_restrict_rls_auto_enable_execute/migration.sql` ต้องรันซ้ำได้ในโปรเจกต์ที่มีหรือไม่มีฟังก์ชันนี้.
- อัปเดต `docs/SECURITY.md` และบันทึกผลใน Task/Handoff.
- หลัง deploy ตรวจ `has_function_privilege` ของ `anon`/`authenticated` เป็น false, event trigger `ensure_rls` ยัง enabled, Security Advisor ไม่มีคำเตือนเดิม และ `git diff --check` ผ่าน.

## ⚠️ ต้องทดสอบโดยคุณ

เมื่อมีการสร้างตารางทดสอบในสภาพแวดล้อมที่เหมาะสม ให้ตรวจว่า event trigger ยังเปิด RLS ให้ตารางใหม่ตามเดิม. งานนี้ไม่เปลี่ยนขั้นตอนใช้งานหน้าเว็บ.

## ผลดำเนินการ 2026-09-30

- `prisma migrate status` พบ migration นี้รอใช้; `prisma migrate deploy` ใช้สำเร็จใน Supabase Cloud.
- ตรวจฐานข้อมูลแล้ว `anon_execute=false`, `authenticated_execute=false`, เจ้าของฟังก์ชันยังเรียกได้ และ event trigger `ensure_rls` มีสถานะ `O` (enabled).
- Security Advisor ไม่รายงาน `anon_security_definer_function_executable` หรือ `authenticated_security_definer_function_executable` แล้ว. ยังมี INFO เรื่องตารางที่เปิด RLS แต่ไม่มี policy ซึ่งเป็นการปฏิเสธ Data API ตามแบบระบบ และ WARN เรื่อง leaked password protection ที่ยังไม่ได้เปิด.
