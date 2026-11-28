# ความปลอดภัยของ Auth และข้อมูลผู้ใช้

- Supabase Auth เก็บรหัสผ่าน/Session; `users` และ `auth_accounts` เก็บข้อมูลพนักงานและความเชื่อมโยงโดยไม่เก็บ Password หรือ Hash
- `SUPABASE_SECRET_KEY` ใช้เฉพาะ Server และเครื่องของเจ้าของโครงการสำหรับ recovery; ห้ามใช้ชื่อ `NEXT_PUBLIC_` หรือส่ง Secret ไป Browser, แชต และ Git
- ตารางใหม่ใน `public` เปิด RLS ทุกตารางและยังไม่มี Data API policy; แอปใช้ Prisma connection ฝั่ง Server พร้อมตรวจ Session/Role ก่อนทำคำสั่ง
- `user_metadata` และข้อมูล Role จาก Browser ไม่ถูกใช้ตัดสินสิทธิ์; การระงับบัญชีและเปลี่ยน Role มีผลกับคำขอถัดไป
- การสร้างบัญชีใช้ Auth Admin API ด้วย `email_confirm: true` เพื่อไม่ส่งอีเมล; การตั้งรหัสใหม่ใช้ `updateUserById` ฝั่ง Server
- Audit event สำหรับบัญชีเก็บ actor, target, action, เวลา, request ID และ before/after เฉพาะข้อมูลไม่ลับ; ไม่เก็บรหัสผ่าน, Token หรือ Secret
- การกู้คืนกรณีไม่มี Admin เข้าเว็บทำผ่าน [คู่มือเจ้าของโครงการ](runbooks/admin-account-recovery.md) และต้องผ่านการทดสอบจริงก่อนเปิดใช้ Auth

## ตั้งค่า Supabase Auth ก่อนเปิดใช้

1. ใน Supabase Dashboard ปิด **Allow new users to sign up** และปิด Anonymous sign-ins; แอปไม่มีหน้า Sign-up แต่การปิดที่ Auth จะกันการสมัครผ่าน API โดยตรง
2. ตั้ง Minimum password length เป็น **8** และไม่บังคับชุดอักขระเพิ่มเติมตาม OPEN-17; ฟอร์มและ API ของแอปตรวจขั้นต่ำ 8 อยู่แล้ว
3. เติม `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` และ `SUPABASE_SECRET_KEY` ใน `.env.local` เฉพาะเครื่อง; Secret key ห้ามใช้ prefix `NEXT_PUBLIC_`
4. ทดสอบ Admin API `createUser` หลังปิด sign-up ว่ายังสร้างบัญชีจาก Server ได้โดยไม่ส่งอีเมล

ดู [การตั้งค่า Auth ทั่วไป](https://supabase.com/docs/guides/auth/general-configuration) และ [นโยบายรหัสผ่าน](https://supabase.com/docs/guides/auth/password-security) ของ Supabase

## ข้อจำกัดก่อนตรวจรับ

การ build และตรวจ schema ผ่านแล้ว มี Publishable/Server secret key ใน `.env.local` และ Admin คนแรก Login ได้ตามที่เจ้าของโครงการยืนยันแล้ว เจ้าของโครงการยืนยันว่าหน้าเพิ่มผู้ใช้ใช้งานได้แล้ว และปิด public sign-up ใน Dashboard แล้ว; ตรวจ `/auth/v1/settings` ได้ `disable_signup=true`. Admin API อ่านบัญชีและสร้าง/ลบบัญชีทดสอบชั่วคราวสำเร็จหลังปิด public sign-up. ยังต้องยืนยันการสร้างบัญชีผ่านหน้าเว็บหลังปิด signup, Minimum password length ฝั่ง Supabase, การจัดการผู้ใช้ส่วนที่เหลือ และ Scenario recovery ตาม TASK-037 ก่อนปิดงาน; ภาพ Dashboard จากเจ้าของโครงการแสดงว่า Anonymous sign-ins ปิดอยู่

## สิทธิ์ฟังก์ชัน RLS event trigger

2026-09-30 ใช้ Prisma migration `20260930_restrict_rls_auto_enable_execute` กับ Supabase Cloud เพื่อถอนสิทธิ์ `EXECUTE` ของ `public.rls_auto_enable()` จาก `PUBLIC`, `anon` และ `authenticated`. ตรวจแล้วสอง API role เรียกฟังก์ชันไม่ได้ เจ้าของฟังก์ชันยังเรียกได้ และ event trigger `ensure_rls` ยัง enabled. Security Advisor ไม่รายงานคำเตือน SECURITY DEFINER ของฟังก์ชันนี้แล้ว. การทดสอบว่าตารางใหม่เปิด RLS อัตโนมัติยังรอทำในสภาพแวดล้อมทดสอบ; ดู [TASK-039](../tasks/TASK-039-restrict-rls-trigger-execute.md).
