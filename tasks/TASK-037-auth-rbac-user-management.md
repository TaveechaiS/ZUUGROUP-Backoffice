# TASK-037 — Auth, RBAC และจัดการผู้ใช้

- **สถานะ:** IN_PROGRESS (เจ้าของโครงการให้เดินหน้าหลังสรุป OPEN-17 ขั้นต่ำ 8 ตัวอักษร)
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Phase:** Phase 3 Auth/RBAC และส่วนผู้ใช้งานของ Phase 4
- **Specs:** [Specs รายโมดูล](../docs/specs/modules/2026-09-30-auth-rbac-user-management.md)
- **Plan:** [แผนย่อย TASK-037](../docs/plans/2026-09-30-auth-rbac-user-management-plan.md)
- **Commit ตั้งต้น:** `a593513`

## ขอบเขต

เข้าสู่ระบบด้วย Supabase Auth, ตรวจ Role/สถานะที่ Server, เชื่อม `/users` กับบัญชีจริง, Admin จัดการบัญชี/Role/รหัสผ่าน, ป้องกัน Admin คนสุดท้าย และทำ owner-only recovery utility ตาม Runbook.

ไม่รวม Storage, Archive, Audit Logs UI/retention automation, โมดูลธุรกิจที่ยัง OPEN, public sign-up หรืออีเมล/ลิงก์เชิญและรีเซ็ตรหัสผ่าน.

## Definition of Ready

- OPEN-17 ได้ข้อสรุปจากเจ้าของโครงการ: รหัสผ่านขั้นต่ำ 8 ตัวอักษร
- เจ้าของโครงการสั่งให้เดินหน้า Specs/Task หลังสรุป OPEN-17
- ก่อนตรวจรับ ต้องมี Supabase Publishable key และ Server secret key ใน `.env.local` และบัญชีทดสอบ; ห้ามส่ง Secret ในแชตหรือ Git

## ความคืบหน้า

- Migration Auth/RBAC/ผู้ใช้ลง Supabase แล้ว; ตรวจ Role 4 รายการ, Permission 1 รายการ และ RLS
- หน้า Login, Session, API/หน้าจัดการผู้ใช้ และ recovery utility เขียนแล้ว; `type-check`, `lint`, `build` ผ่าน
- เติม Publishable key และ Server secret key แล้ว; ตรวจ Admin API ผ่าน และสร้าง Admin คนแรกใน Supabase Auth พร้อมข้อมูลธุรกิจสำเร็จ
- Admin คนแรก: รหัสพนักงาน `admin`, อีเมล `admin@zuugroup.com`, ชื่อแสดง `Admin`, สถานะ `ACTIVE`, Role `ADMIN`; ไม่บันทึกรหัสผ่านในเอกสารหรือ Git
- เจ้าของโครงการยืนยันว่า Login ด้วย Admin คนแรกใช้งานได้
- ตรวจ endpoint ตั้งค่า Supabase Auth แล้วพบ `disable_signup=false` จึงต้องปิด public sign-up ใน Dashboard และตรวจซ้ำก่อนปิด Task
- รอตรวจ Anonymous sign-ins, Minimum password length และ Scenario integration/UAT ที่เหลือ
- เจ้าของโครงการกำหนดเพิ่ม: ฟอร์มเพิ่มผู้ใช้ไม่ต้องกรอกรหัสพนักงาน; Server สร้างให้อัตโนมัติและ Admin แก้รหัสภายหลังได้ โดยยังต้องไม่ซ้ำ
- งานย่อยรหัสพนักงาน: ตัดช่องจากฟอร์มเพิ่ม; API สร้างรหัส `EMP-` ตามด้วยเลขฐานสิบหก 16 ตัวจาก UUID ฝั่ง Server และไม่อ่านค่ารหัสจากคำขอ; ฟอร์มแก้รหัสและ unique index ยังทำงานตามเดิม. `lint`, `type-check`, `build`, `git diff --check` ผ่าน; รอ UAT เพิ่ม/แก้ผู้ใช้จริง
- เจ้าของโครงการขอให้หน้าเพิ่มบัญชีและหน้าผู้ใช้แต่ละคนเป็น page: `/users/create` และ `/users/<รหัสพนักงาน>` เช่น `/users/admin`; ย้ายฟอร์มเพิ่ม/แก้/ตั้งรหัสและการเปลี่ยน Role/สถานะจาก modal หรือคำสั่งในตารางไปหน้าแยก โดยสงวนรหัส `create`
- หน้าแยกและการนำทางเสร็จแล้ว; แก้รหัสพนักงานแล้วไป URL ใหม่; หน้าและ API ยังตรวจสิทธิ์ Admin ฝั่ง Server. `lint`, `type-check`, `build`, `node --check` ของ recovery และ `git diff --check` ผ่าน; เมื่อไม่ login ทั้ง `/users/create` และ `/users/admin` redirect ไป Login. รอผู้ใช้ UAT การเพิ่ม/แก้บัญชีบนหน้าใหม่
- เจ้าของโครงการส่งภาพแจ้งว่า Create ตอบ “คำขอไม่ถูกต้อง”; ทำซ้ำได้ด้วย POST ที่มี Origin เดียวกับ `localhost:5000` แต่ API ตอบ 403 ก่อนตรวจ session. งานแก้ครอบคลุม `src/server/auth/api-authorization.ts` และการตรวจ same-origin/cross-origin หลังแก้
- แก้ Origin guard ให้เทียบกับ Host ที่คำขอมาถึง (รวม forwarded protocol/host เมื่อมี) แทน `request.nextUrl.origin`; หลังแก้ POST/PATCH same-origin แบบไม่มี session ตอบ 401 ตามขั้นตรวจถัดไป และ cross-origin ตอบ 403. `lint`, `type-check`, `build`, `git diff --check` ผ่าน; รอเจ้าของโครงการลองสร้างบัญชีจริง
- เจ้าของโครงการยืนยันว่าหน้าเพิ่มผู้ใช้ใช้งานได้แล้วหลังแก้ Origin guard. ตรวจ `/auth/v1/settings` ซ้ำได้ HTTP 200 และ `disable_signup=false`; public sign-up ยังต้องปิดใน Supabase Dashboard. การแก้รหัสพนักงาน, Role, สถานะ, guard Admin คนสุดท้าย และ recovery ยังรอ UAT
- เจ้าของโครงการปิด **Allow new users to sign up** ใน Supabase Dashboard แล้ว; ตรวจ `/auth/v1/settings` ได้ HTTP 200 และ `disable_signup=true`. ตรวจ Admin API แบบอ่านอย่างเดียวด้วย `listUsers` ได้ HTTP 200; โค้ดสร้างบัญชีใช้ `admin.auth.admin.createUser({ email, password, email_confirm: true })`. ยังต้องให้เจ้าของโครงการลองสร้างบัญชีหลังปิด signup เพื่อยืนยัน flow ครบปลายทาง
- ทดสอบ Admin API หลังปิด public sign-up ด้วยบัญชีชั่วคราวที่สุ่มอีเมลโดเมน `example.invalid` และรหัสผ่านสุ่ม: `createUser` สำเร็จ, `deleteUser` ล้างบัญชีทดสอบสำเร็จ; ไม่บันทึกรหัสผ่านหรืออีเมลทดสอบ. ยังรอ UAT ผ่านหน้าเว็บและ Scenario สิทธิ์/Recovery
- เจ้าของโครงการยืนยันว่าการสร้างผู้ใช้ผ่านเว็บหลังปิด public sign-up และการแก้รหัสพนักงานใช้งานได้. รายละเอียดข้อมูลผู้ใช้เพิ่มเติมจะกำหนดภายหลัง; รอบนี้ไม่เพิ่มฟิลด์ใหม่. UAT Role, สถานะ, guard Admin คนสุดท้าย และ recovery ยังไม่ยืนยัน
- เจ้าของโครงการพบว่ายังไม่มีปุ่มลบผู้ใช้ และยืนยันให้ทำลบเชิงตรรกะ ซ่อนจากรายชื่อปกติ กู้คืนได้. ขอบเขต/ลำดับ/ไฟล์/เกณฑ์ตรวจรับอยู่ใน Specs §4 และงานย่อยใน Plan; งานนี้รวม migration, API, UI, Audit และ guard Admin คนสุดท้าย โดยไม่ลบ Auth user
- เพิ่ม `deleted_at`, `deleted_by`, `delete_reason` และความสัมพันธ์ผู้ลบผ่าน migration `20260930_user_soft_delete` ใน Supabase Cloud. หน้ารายชื่อมีมุมมอง “ลบแล้ว” พร้อมค้นหา/กรอง, หน้ารายละเอียดลบ/กู้คืนพร้อมเหตุผล, API บันทึก Audit และใช้ advisory lock กันลบ Admin คนสุดท้าย; Server ปฏิเสธผู้ใช้ที่ลบแม้มี Session เดิม. `prisma generate`, `type-check`, `lint`, `build` ผ่าน; ตรวจคอลัมน์/foreign key และ Security Advisor หลัง deploy แล้ว. รอ UAT ผ่านหน้าเว็บ
- เจ้าของโครงการพบ Runtime `PrismaClientValidationError` ว่า Client ใน dev server ไม่รู้จัก relation `deletedByUser`; ตรวจ generated Prisma Client ในไฟล์แล้วมี relation นี้ แต่ process dev server เริ่มก่อน generate. รีสตาร์ตเฉพาะ dev server พอร์ต 5000 แล้ว `/login` ตอบ 200 และ log ยืนยัน `/users` ตอบ 200 โดยไม่มี error เดิม; รอเจ้าของโครงการลองลบ/กู้คืนต่อ
- เจ้าของโครงการยืนยันว่าลบ/กู้คืนใช้งานได้ และขอให้ “รายการปกติ / ลบแล้ว” แสดงเป็นแท็บตามรูปแบบเดิมของหน้าโมดูล; บันทึกงานย่อยใน Specs/Plan แล้ว
- เปลี่ยนปุ่มเลือกมุมมองใน `/users` เป็นแท็บเส้นใต้ตาม `ModuleListPage` พร้อม `role=tablist/tab`, `aria-selected`; คง filter, CSV และรีเซ็ตหน้าตารางเมื่อเปลี่ยนแท็บ. `lint`, `type-check`, `build`, `git diff --check` ผ่าน; รอเจ้าของโครงการตรวจรูปแบบจริง
- เจ้าของโครงการรับรูปแบบแท็บแล้วและยืนยันว่าข้อมูลจริงยังไม่พร้อมกำหนดสิทธิ์รายโมดูล/รายข้อมูล; หน้าต่างกันตาม Role เป็น Mock ชั่วคราว. เลื่อนการจำกัดสิทธิ์ละเอียดไปหลังได้ Specs จริง โดยคงการป้องกัน `/users`/API ฝั่ง Server และงาน guard/recovery ที่ยืนยันไว้
- ตรวจ recovery utility พบว่าบัญชี Admin ที่ถูกลบเชิงตรรกะจะยังมี `deleted_at` หลัง utility ตั้ง Active/Role Admin จึงยังเข้าแอปไม่ได้; บันทึกแผนแก้ script/runbook และตรวจ guard โดยไม่เปลี่ยนบัญชี Admin หลัก
- แก้ `scripts/recover-admin.mjs` ให้ล้าง `deleted_at`, `deleted_by`, `delete_reason` เมื่อกู้คืนบัญชีเดิมภายในธุรกรรมเดียวกับการคืน Active/Role Admin; Audit เก็บสถานะก่อน/หลังและไม่เก็บรหัสผ่าน. ปรับ Runbook แล้ว. `node --check`, `lint`, `type-check`, `build`, `git diff --check` ผ่าน. ตรวจฐานข้อมูลแบบอ่านอย่างเดียวพบ Admin ที่ใช้งานได้ 4 บัญชี; จึงยังไม่ทดสอบเงื่อนไข “Admin คนสุดท้าย” บนข้อมูลจริง และไม่ได้เรียก recovery utility ที่สงวนให้เจ้าของโครงการ
- เจ้าของโครงการพบว่าระงับและลบผู้ใช้ตอบ 500. ทำซ้ำ transaction แบบอ่านอย่างเดียวพบ Prisma `P2010`: `$queryRaw` อ่านคอลัมน์ `void` จาก `SELECT pg_advisory_xact_lock(...)` ไม่ได้; คำสั่งหยุดก่อน update. บันทึกแผนแก้การเรียก lock โดยคงการล็อกธุรกรรม
- เปลี่ยนผล advisory lock ใน `src/app/api/users/[id]/route.ts` เป็น `::text` เพื่อให้ Prisma deserialize ได้ โดย lock ยังอยู่ตลอด transaction. ทดสอบคำสั่ง tagged `$queryRaw` และนับ Admin แบบอ่านอย่างเดียวใน transaction จริงผ่าน; `lint`, `type-check`, `build`, `git diff --check` ผ่าน. API บน dev server ตอบ 401 ตามคาดเมื่อไม่มี Session; รอเจ้าของโครงการลองระงับ/ลบผ่านหน้าเว็บอีกครั้ง
- เจ้าของโครงการลบ `admin` หลักขณะล็อกอินได้และพบ `Failed to fetch` ระหว่างนำทาง. Audit ยืนยันเป็นการลบบัญชีตนเอง; ฐานข้อมูลยังมี Admin Role อีก 2 บัญชี จึงไม่เข้าเงื่อนไข “Admin คนสุดท้าย” แบบนับจำนวน. คืน `admin` หลักเป็น Active/ไม่ถูกลบโดยไม่เปลี่ยนรหัสผ่าน และบันทึก `USER_RESTORED_AFTER_GUARD_FAILURE` ใน Audit แล้ว. เพิ่มแผน self-guard และตรวจ Login ของบัญชีที่ลบ
- เพิ่มการป้องกันฝั่ง API ไม่ให้ Admin ลบ ระงับ หรือเปลี่ยน Role ของบัญชีตนเอง, ปิดปุ่มที่เกี่ยวข้องบนหน้า `/users/<รหัสพนักงาน>`, และให้ Login ปฏิเสธบัญชีที่ถูกลบพร้อม sign out. ทดสอบ API ด้วย Admin ชั่วคราว: ทั้ง 3 คำสั่งตอบ HTTP 409, ฐานข้อมูลยัง ACTIVE/ADMIN/ไม่ถูกลบ และล้างบัญชี Auth/ธุรกิจหลังทดสอบ. `lint`, `type-check`, `build` ผ่าน; รอเจ้าของโครงการตรวจหน้าเว็บและอาการ console อีกครั้ง

## ไฟล์ที่คาดว่าจะเปลี่ยน

ดูรายการใน [แผนย่อย TASK-037](../docs/plans/2026-09-30-auth-rbac-user-management-plan.md)

## ⚠️ ต้องทดสอบโดยคุณ

ดู Scenario ใน Specs รายโมดูล §8–9. ใช้บัญชีทดสอบที่ไม่ใช่ Admin หลัก: ลบพร้อมเหตุผล แล้วตรวจว่าหายจากรายการปกติ, อยู่ใน “ลบแล้ว” พร้อมผู้ลบ/เวลา/เหตุผล และเข้าใช้ไม่ได้แม้ถือ Session เดิม; กู้คืนพร้อมเหตุผลแล้วกลับสู่รายการปกติ. ทดสอบว่าลบ Admin ที่เข้าใช้ได้คนสุดท้ายถูกปฏิเสธ. ยังต้องตรวจ Role ทั้งสี่, การระงับ session เดิม, ไม่ส่งอีเมล/ลิงก์ และการกู้คืนโดยเจ้าของโครงการ.
