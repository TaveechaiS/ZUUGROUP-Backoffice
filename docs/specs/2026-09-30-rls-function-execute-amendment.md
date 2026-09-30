# ข้อกำหนดความปลอดภัย — RLS event trigger

**วันที่:** 2026-09-30 (Asia/Bangkok)
**สถานะ:** แก้คำเตือน Security Advisor ในขอบเขตงาน Auth/RBAC

ฟังก์ชัน `public.rls_auto_enable()` เป็น event trigger ฝั่งฐานข้อมูลที่สร้างไว้เพื่อเปิด RLS อัตโนมัติเมื่อสร้างตารางใหม่ใน `public`. ฟังก์ชันนี้ใช้ `SECURITY DEFINER` และไม่ใช่ API สำหรับผู้ใช้เว็บ. ต้องไม่ให้ Role `anon` หรือ `authenticated` เรียกด้วยสิทธิ์ `EXECUTE` ทั้งทางตรงและผ่านสิทธิ์ `PUBLIC` ปริยาย. Event trigger `ensure_rls` ต้องคงเปิดใช้งาน.

หากฟังก์ชันไม่มีอยู่ในฐานข้อมูลใหม่ Migration ต้องผ่านโดยไม่สร้างฟังก์ชันขึ้นเอง. การแก้นี้ไม่เพิ่ม Data API policy หรือสิทธิ์เข้าถึงตาราง.
