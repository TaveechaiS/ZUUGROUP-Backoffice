# แผนย่อย TASK-039 — จำกัดสิทธิ์ฟังก์ชัน RLS

1. ตรวจนิยาม ฟังก์ชันเจ้าของ สิทธิ์ `EXECUTE` และ event trigger ที่อ้างอิง; บันทึกใน Specs/Task.
2. สร้าง migration เงื่อนไขใน `prisma/migrations/20260930_restrict_rls_auto_enable_execute/migration.sql` เพื่อ `REVOKE EXECUTE` จาก `PUBLIC` และ Role API ที่มีอยู่ โดยไม่ลบฟังก์ชันหรือ trigger.
3. Deploy migration ไป Supabase Cloud ด้วย workflow Prisma ที่โครงการใช้. ไฟล์อื่นที่แก้: `docs/SECURITY.md`, `tasks/ACTIVE.md`, `tasks/TASK-039-restrict-rls-trigger-execute.md`, `docs/HANDOFF.md`.
4. ตรวจสิทธิ์ของ `anon`/`authenticated`, สถานะ event trigger, Security Advisor และ `git diff --check`; ทดสอบพฤติกรรม trigger เมื่อมีตารางทดสอบในสภาพแวดล้อมที่เหมาะสม.

ผลลัพธ์: ผู้ใช้ API ไม่สามารถเรียกฟังก์ชัน `SECURITY DEFINER` นี้ได้ แต่กลไกเปิด RLS อัตโนมัติยังอยู่.
