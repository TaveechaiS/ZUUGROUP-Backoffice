# แผนย่อย TASK-037 — Auth, RBAC และจัดการผู้ใช้

**วันที่:** 2026-09-30 (Asia/Bangkok)
**สถานะ:** เริ่ม implementation ตามคำสั่งเจ้าของโครงการให้เดินหน้าหลังสรุป OPEN-17 ขั้นต่ำ 8 ตัวอักษร
**ขอบเขต:** Phase 3 Auth/RBAC และส่วนจัดการผู้ใช้ของ Phase 4; ไม่รวม Storage, Archive, Audit Logs UI/retention automation และกฎธุรกิจที่ยัง OPEN

## ลำดับงาน

1. จัดทำ Specs รายโมดูลจาก Project Specs §7, §8.1, §18.3, §27 และ amendments ที่อนุมัติ; ระบุข้อที่ยัง OPEN แยกชัด
2. ให้เจ้าของโครงการทบทวน Specs/Task และตัดสินนโยบายความยาวรหัสผ่านก่อนเริ่ม implementation
3. หลังอนุมัติ ตรวจ Environment โดยแสดงเฉพาะว่าตัวแปรมี/ไม่มี ห้ามอ่านหรือพิมพ์ Secret; เตรียมบัญชีทดสอบใน Supabase Cloud
4. ออกแบบ `users`, `auth_accounts`, Role และสถานะบัญชีใน Prisma; Migration ต้องเพิ่มซ้ำ/ตรวจย้อนกลับได้ และไม่แก้ข้อมูลจริงโดยไม่ทดสอบ
5. ทำ Supabase Auth server client/Admin client, sign-in/sign-out, cookie/session handling และผู้ใช้ปัจจุบัน
6. ทำ server-side authorization สำหรับ protected routes และทุก API/Server Action; Role มาจากฐานข้อมูลธุรกิจ ไม่เชื่อ Browser หรือ `user_metadata`; การเข้าถึงที่ยังไม่มีข้อสรุปให้ปฏิเสธ
7. เชื่อมหน้า Login และ `/users` Mock เข้ากับข้อมูลจริง; เพิ่ม/แก้/ระงับ/กู้คืน/เปลี่ยน Role/ตั้งรหัสโดย Admin และยืนยันอีเมลผ่าน trusted server flow โดยไม่ส่งอีเมล/ลิงก์
8. ทำ transactional guard ที่ป้องกันการระงับ/ลบ/ลด Role ของ Admin คนสุดท้าย รวมถึงคำขอพร้อมกัน; ทำ owner-only break-glass recovery ตาม Runbook และห้ามเผย Secret ใน client
9. บันทึก Audit event สำหรับการเปลี่ยนบัญชีโดยไม่เก็บรหัสผ่าน/Token; ไม่ทำหน้า Audit, Archive หรือ purge policy ใน Task นี้
10. ตรวจ `lint`, `type-check`, `build`, migration/reset flow และ test ที่จำเป็น; เปิดเว็บให้ผู้ใช้ UAT ตาม Scenario ใน Task

### งานย่อย: สร้างรหัสพนักงานอัตโนมัติ (เจ้าของโครงการยืนยัน)

1. ปรับ Specs และ TASK-037 ให้ฟอร์มเพิ่มผู้ใช้ไม่ถามรหัสพนักงาน; ยังเก็บรหัสที่ไม่ซ้ำในฐานข้อมูลและให้ Admin เปลี่ยนภายหลังได้.
2. แก้ `src/app/users/users-live-content.tsx` ให้ตัดช่องรหัสจากฟอร์มเพิ่ม แต่คงการแสดงและช่องแก้รหัสไว้.
3. แก้ `src/app/api/users/route.ts` ให้ Server สร้างรหัสรูปแบบ `EMP-` ตามด้วยเลขฐานสิบหกสุ่ม 16 ตัวจาก UUID; ไม่รับรหัสจากคำขอสร้างบัญชี. ตรวจอีเมลซ้ำเหมือนเดิมและคง unique index ของรหัส.
4. ตรวจ `lint`, `type-check`, `build` และกรณี API ที่ไม่ส่งรหัสพนักงาน; ให้เจ้าของโครงการเพิ่มผู้ใช้จริงเพื่อยืนยันว่ารหัสแสดงและแก้ได้.

ผลลัพธ์: เพิ่มผู้ใช้ได้โดยกรอกชื่อ อีเมล Role และรหัสผ่าน; บัญชีใหม่มีรหัสพนักงานอัตโนมัติที่แก้ไขได้ โดยไม่เปลี่ยนข้อมูลบัญชีเดิมหรือ schema.

### งานย่อย: แยกหน้าจัดการผู้ใช้เป็น URL (เจ้าของโครงการยืนยัน)

1. ปรับ Specs/TASK ให้ `/users` เป็นรายชื่อ, `/users/create` เป็นหน้าเพิ่ม และ `/users/[employeeCode]` เป็นหน้ารายละเอียด; สงวน `create` และเปลี่ยน URL ตามรหัสพนักงานที่แก้.
2. ปรับ `src/app/users/users-live-content.tsx` ให้ลิงก์ไปหน้าดังกล่าวและคงค้นหา กรอง ตาราง ส่งออก CSV; ย้ายคำสั่ง Role/สถานะ/แก้ข้อมูล/ตั้งรหัสจากตารางและ modal.
3. สร้าง `src/app/users/create/page.tsx` กับ client form และ `src/app/users/[employeeCode]/page.tsx` กับ client detail; ทุกหน้าเรียก `requireAdmin` ฝั่ง Server. หลัง POST สำเร็จ API ตอบรหัสใหม่เพื่อไปหน้ารายละเอียด.
4. แก้ `src/app/api/users/[id]/route.ts` ให้ปฏิเสธรหัสพนักงาน `create` และยังป้องกันค่าซ้ำ; หลังเปลี่ยนรหัสให้ client ไป URL ใหม่. ปรับเอกสาร route ใน `src/app/README.md`.
5. ตรวจ lint, type-check, build, diff-check และ UAT เปิด URL โดยตรง เพิ่มบัญชี แก้รหัส ตั้งรหัส เปลี่ยน Role/สถานะ และตรวจ Role อื่นเข้าไม่ได้.

ผลลัพธ์: การเพิ่มและจัดการบัญชีอยู่บน page ที่มี URL ของตนเอง โดยคง API/สิทธิ์/ข้อมูลเดิม.

ผลตรวจรับ 2026-09-30: เจ้าของโครงการยืนยันว่าการสร้างผู้ใช้หลังปิด public sign-up และการแก้รหัสพนักงานผ่านหน้าเว็บใช้งานได้. รายละเอียดข้อมูลผู้ใช้เพิ่มเติมให้รอข้อกำหนดภายหลัง; ไม่เพิ่มช่องข้อมูลในงานย่อยนี้. งาน Role, สถานะ, guard Admin คนสุดท้าย และ recovery ยังต้องตรวจตาม Scenario เดิม.

### งานย่อย: แก้ Create ถูกปฏิเสธที่ Origin check

1. ทำซ้ำ POST `/api/users` จาก `Origin` เดียวกับเว็บและจากต่างเว็บไซต์; ยืนยันจุดที่ตอบ 403 ก่อนเข้าการตรวจฟอร์ม.
2. ปรับ `src/server/auth/api-authorization.ts` ให้เทียบ Origin ของคำขอกับ Host/โปรโตคอลที่ผู้ใช้เรียกจริง โดยคงการปฏิเสธ Origin ต่างเว็บไซต์และคงการตรวจ Session/Role ฝั่ง Server.
3. ตรวจ POST/PATCH same-origin ให้ผ่าน Origin guard (เมื่อไม่มี session ต้องตอบ 401), cross-origin ต้องตอบ 403; ตรวจ `lint`, `type-check`, `build` และให้เจ้าของโครงการลองเพิ่มผู้ใช้จริงอีกครั้ง.

ผลลัพธ์: ฟอร์มเพิ่มและคำสั่งจัดการผู้ใช้ส่งจากหน้าเว็บเดียวกันได้ โดย CSRF guard ยังทำงาน.

### งานย่อย: ลบเชิงตรรกะและกู้คืนผู้ใช้ (เจ้าของโครงการยืนยัน)

1. บันทึกข้อกำหนดใน Specs/Task และขอบเขตใน `tasks/ACTIVE.md`; ไม่ตีความปุ่มลบเป็นการลบถาวร.
2. เพิ่ม `deleted_at`, `deleted_by`, `delete_reason` ใน `prisma/schema.prisma` และ migration แบบเพิ่มคอลัมน์; Generate Prisma client โดยไม่แตะข้อมูลเดิม.
3. ปรับ `src/server/auth/current-user.ts` ให้ปฏิเสธผู้ใช้ที่ลบ; ปรับ `src/server/users/service.ts` ให้รายชื่อปกติซ่อนผู้ใช้ที่ลบและให้ Admin เรียกรายชื่อที่ลบพร้อมข้อมูลผู้ลบ/เวลา/เหตุผล.
4. เพิ่มคำสั่งลบ/กู้คืนใน `src/app/api/users/[id]/route.ts`: ตรวจ Admin, เหตุผล, สถานะ, ค่าซ้ำก่อนกู้คืน, guard Admin คนสุดท้ายด้วย advisory lock, transaction และ Audit; ห้ามเปลี่ยนข้อมูลอื่นของบัญชีที่ลบ.
5. เพิ่มมุมมอง “ลบแล้ว” ใน `src/app/users/users-list-content.tsx` และปุ่มลบ/กู้คืนพร้อมข้อความยืนยันใน `src/app/users/[employeeCode]/user-detail-content.tsx`; ปรับชนิดข้อมูล `src/app/users/user-ui.ts` และหน้าที่ส่งข้อมูลตามจำเป็น.
6. ตรวจ lint/type-check/build/diff-check และทดสอบข้อมูลจริงในฐานทดสอบ; ให้เจ้าของโครงการลองลบ/กู้คืนบัญชีทดสอบและตรวจ Admin คนสุดท้าย.

ผลลัพธ์: Admin ซ่อนและกู้คืนบัญชีได้โดยรักษาประวัติ; บัญชีที่ลบเข้าใช้ไม่ได้ และไม่มีการลบ Supabase Auth.

### งานย่อย: ปรับมุมมองรายการปกติ/ลบแล้วเป็นแท็บ

1. บันทึกคำยืนยันเรื่องรูปแบบแท็บใน Specs, Plan และ TASK-037.
2. แก้เฉพาะ `src/app/users/users-list-content.tsx` ให้ใช้เส้นคั่นและเส้นใต้แท็บที่เลือก พร้อม `role=tablist/tab` และ `aria-selected` ตาม `src/components/pages/module-list-page.tsx`; คงการกรอง ค้นหา CSV และการรีเซ็ตหน้าเมื่อเปลี่ยนแท็บ.
3. ตรวจ `lint`, `type-check`, `build`, `git diff --check`; ให้เจ้าของโครงการตรวจหน้าจอและการสลับแท็บ.

### ขอบเขตสิทธิ์ระหว่างรอข้อมูลจริง

เจ้าของโครงการยังไม่มีข้อมูลจริงสำหรับสรุปสิทธิ์รายโมดูล/รายข้อมูล. ตรวจรับเฉพาะฐาน Auth ที่กำหนดแล้ว: Admin จัดการผู้ใช้ผ่าน Server, ผู้ถูกระงับ/ลบเข้าใช้ไม่ได้, guard Admin คนสุดท้าย และ recovery. การแสดงหน้า Mock ที่ต่างกันตาม Role เป็นแนวทาง UI ชั่วคราว; ห้ามปิดงานสิทธิ์ละเอียดหรือเปิด backend ของโมดูลอื่นจน Specs/Gate ที่เกี่ยวข้องพร้อม.

### งานย่อย: ตรวจ guard Admin คนสุดท้ายและ recovery

1. ตรวจ `src/app/api/users/[id]/route.ts`, `scripts/recover-admin.mjs`, `docs/runbooks/admin-account-recovery.md` เทียบกับสถานะลบเชิงตรรกะและเงื่อนไข Admin ที่ยังเข้าใช้ได้.
2. แก้ `scripts/recover-admin.mjs` ให้การกู้คืนบัญชีเดิมล้างเครื่องหมายลบภายในธุรกรรมเดียวกับการคืน Active/Role; เก็บก่อน/หลังใน Audit และปรับคู่มือให้ตรง. ไม่เปลี่ยนบัญชี Admin หลักในการตรวจทางเทคนิค.
3. ตรวจ syntax, lint/type-check/build, `git diff --check` และตรวจฐานข้อมูลแบบอ่านอย่างเดียว; ให้เจ้าของโครงการทดสอบ flow recovery ในสภาพแวดล้อมทดสอบก่อนถือว่าปิดงาน.

### งานย่อย: แก้คำสั่งระงับ/ลบตอบ 500 จาก Prisma advisory lock

1. ทำซ้ำ transaction แบบอ่านอย่างเดียวและระบุ Prisma error ต้นทาง; ตรวจว่าคำสั่งยังไม่เปลี่ยนข้อมูลเมื่อ lock ล้มเหลว.
2. แก้ `src/app/api/users/[id]/route.ts` ให้ `pg_advisory_xact_lock` คืนชนิดที่ Prisma deserialize ได้ โดยยังล็อกตลอดธุรกรรมเดียวกันสำหรับ Role/สถานะ/ลบ/กู้คืน.
3. ทดสอบ transaction ที่มี lock และ count Admin แบบอ่านอย่างเดียว, ตรวจ `lint`, `type-check`, `build`, `git diff --check`, แล้วให้เจ้าของโครงการลองคำสั่งจาก UI ซ้ำ.

### งานย่อย: ป้องกัน Admin ตัดสิทธิ์บัญชีตนเอง

1. ตรวจ Audit/ฐานข้อมูลหลังรายงานการลบ Admin หลัก, คืนบัญชีที่ลบโดยไม่เปลี่ยนรหัสผ่าน และบันทึก Audit. ตรวจว่าเหตุการณ์นี้เกิดขณะยังมี Admin Role อื่นอยู่.
2. เพิ่ม guard ใน `src/app/api/users/[id]/route.ts` ให้ปฏิเสธ Admin ระงับ ลบ หรือเปลี่ยน Role ของตนเอง; คง guard Admin คนสุดท้ายสำหรับคำสั่งต่อบัญชีอื่น. ปรับ `src/app/users/[employeeCode]/page.tsx` และ `user-detail-content.tsx` ให้คำสั่งที่ห้ามทำกับตนเองไม่กดได้และมีคำอธิบาย.
3. แก้ `src/app/login/actions.ts` ให้ตรวจ `deletedAt` หลัง Supabase Auth Login แล้ว sign out/แจ้งบัญชีไม่พร้อม; ตรวจ dev server log สำหรับการนำทางเมื่อ Session ไม่พร้อม.
4. ตรวจ `lint`, `type-check`, `build`, `git diff --check`, guard ด้วยบัญชีทดสอบ และให้เจ้าของโครงการยืนยันหน้า Admin หลักกลับเข้าใช้ได้.

### งานย่อย: รับมือ connection ปิดระหว่าง Login

1. ตรวจ dev log, Prisma error code, `DATABASE_URL` โดยไม่แสดง Secret และ query ฐานข้อมูลแบบอ่านอย่างเดียว; รีสตาร์ตเฉพาะ dev server หาก connection pool ค้าง
2. เพิ่ม helper ใน `src/server/db/prisma.ts` ให้ retry หนึ่งครั้งเฉพาะ Prisma read ที่ตอบ `P1017`; ใช้กับ `src/app/login/actions.ts` และ `src/server/auth/current-user.ts`
3. หาก Login ยังอ่านบัญชีไม่ได้ ให้ sign out และแสดงข้อความชั่วคราวใน `src/app/login/page.tsx`; ไม่จัดเป็นรหัสผ่านผิด
4. ตรวจ Login Server Action ด้วยบัญชีชั่วคราวที่ล้างหลังทดสอบ, `lint`, `type-check`, `build` และ `git diff --check`

### งานย่อย: Login temporary หลังตั้งค่า `.env.local` 2026-10-01

1. ตรวจ `.env.local` แบบไม่แสดง credential, ทดสอบ DB SELECT และ rollback update, ตรวจ public GET ผ่าน dev server; บันทึกผลใน TASK-037.
2. ปรับ `src/server/auth/login.ts` ให้ retry `lastLoginAt` เมื่อเป็น `P1017` ครั้งเดียวด้วย timestamp เดิม; log เฉพาะรหัส error ใน catch เพื่อแยกสาเหตุครั้งต่อไป.
3. ตรวจ `lint`, `type-check`, `build`, `git diff --check`; ให้เจ้าของลอง Login จริงอีกครั้ง. ไม่เปลี่ยน schema, seed, Auth provider หรือข้อมูลบัญชี.

การสร้าง Admin คนแรก: ใช้รหัสพนักงาน `admin`, อีเมล `admin@zuugroup.com`, ชื่อแสดง `Admin`; รอ Server secret key ใน `.env.local` จากเจ้าของโครงการ จากนั้นใช้ recovery utility ให้เจ้าของโครงการป้อนรหัสผ่านใหม่ที่ผ่านขั้นต่ำ 8 ตัวอักษรบนเครื่อง แล้วตรวจ Login/Role/Audit

## ไฟล์ที่คาดว่าจะเปลี่ยนหลังอนุมัติ

```text
prisma/schema.prisma
prisma/migrations/<generated-auth-rbac-migration>/...
src/lib/supabase/server.ts
src/lib/supabase/admin.ts
src/lib/auth/...
src/proxy.ts
src/app/login/page.tsx
src/app/api/auth/...
src/app/users/page.tsx
src/app/users/users-page-content.tsx
src/app/api/users/...
src/server/permissions/...
docs/PERMISSIONS.md
docs/SECURITY.md
docs/runbooks/admin-account-recovery.md
```

ชื่อไฟล์อาจปรับหลังตรวจโครงจริงก่อนแก้; ห้ามสร้าง branch ใหม่ ใช้เฉพาะ `AI`.

## นอกขอบเขต

- Auth provider นอก Supabase, MFA, passwordless, public sign-up, invitation email/link
- การเลือก Permission รายธุรกิจที่ยัง OPEN (OPEN-01/02 และ Specs รายโมดูล); ห้ามเปิดสิทธิ์ที่ยังไม่ยืนยัน
- Storage/file attachments, Archive, Audit Logs UI และ retention/deletion automation ที่ติด G-10
- CRUD/Workflow ของลูกค้า สินค้า คลัง การเงิน และ PDF

## เกณฑ์ตรวจรับก่อนเริ่มโค้ด

- เจ้าของโครงการอนุมัติ Specs รายโมดูลและ TASK-037
- เจ้าของโครงการเลือก/อนุมัตินโยบายความยาวรหัสผ่าน
- มี Supabase Auth test account และ Environment ที่จำเป็นพร้อมใช้โดยไม่เปิดเผย Secret

## เกณฑ์ตรวจรับ implementation

- ผู้ไม่เข้าสู่ระบบถูกปฏิเสธ protected page/API; logout/session expiry มีผล
- Role มาจากฐานข้อมูลและตรวจที่ Server; Client-supplied role หรือ `user_metadata` เปลี่ยนสิทธิ์ไม่ได้
- Admin จัดการบัญชี, Role, สถานะ และรหัสผ่าน; ไม่มีอีเมลหรือลิงก์เชิญ/ตั้ง/รีเซ็ต
- หนึ่งผู้ใช้มีหนึ่ง Role; ไม่มี Role Inventory
- การแก้หลายบัญชีพร้อมกันไม่สามารถทำให้ไม่มี Admin ที่เข้าใช้ได้
- Recovery ตาม runbook คืนทั้งการเข้าระบบและ Admin role; Secret ไม่อยู่ใน client/log/Git
- Audit event ไม่มีรหัสผ่าน/Token; ไม่ทำ retention/Archive ใน Task นี้
- Lint, type-check, build, migration verification และ `git diff --check` ผ่าน; ผู้ใช้ผ่าน UAT
