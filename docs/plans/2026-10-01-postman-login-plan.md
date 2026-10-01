# แผนย่อย TASK-048 — POST เข้าสู่ระบบใน Postman

**สถานะ:** READY_FOR_USER_TEST — POST แยก 4 บัญชีและ Bearer GET ทดสอบผ่านกับ DB จริง; รอเจ้าของโครงการลองใน Postman Desktop

## ลำดับและผลลัพธ์

1. ลงทะเบียนขอบเขตใน ACTIVE และจัดสัญญา `POST /api/auth/login` ให้เจ้าของโครงการตรวจรับ
2. หลังอนุมัติ อ่านคู่มือ Route Handler/cookies ของ Next.js ที่ติดตั้งและเอกสาร Supabase ปัจจุบัน; แยก Auth service กลางจาก Login Server Action โดยคงการตรวจบัญชีและการนำทางเดิม
3. สร้าง Route Handler รับ JSON, ตรวจ Origin/ข้อมูล, เรียก service กลาง, คืนผลและ session cookie ตาม Specs พร้อม no-store
4. เพิ่ม POST ในไฟล์ Collection, คู่มือใช้ Environment ส่วนตัว และ Collection Zuugroup เดิมใน Postman Workspace; ตรวจรายการเดิมก่อนแก้เพื่อไม่เขียนทับงานผู้ใช้
5. ตรวจ type-check/lint/build และกรณี auth สำเร็จ/ผิดพลาดด้วย dependency ที่ควบคุมได้; ตรวจ HTTP จริงสำหรับ JSON ผิด/ไม่มีข้อมูล/Origin ผิด และส่งรายการ UAT สำหรับ login จริงกับ GET
6. อัปเดต Specs/Plan/Task พร้อมผลทดสอบและข้อจำกัด ใช้ READY_FOR_USER_TEST ก่อนผู้ใช้ตรวจรับ
7. เพิ่ม access token ในผลสำเร็จของ Login API, ตรวจ Bearer token กับ Supabase Auth และบัญชีภายในใน API ธุรกิจ; Bearer ไม่ถูกต้องไม่ใช้ cookie สำรอง
8. เพิ่ม POST แยก 4 บัญชีใน Postman พร้อมสคริปต์เก็บ token ตามบัญชีและ `activeToken` ใน Environment ส่วนตัว และตั้ง Bearer ให้ GET ทั้ง 4 คำขอ; อ่าน Collection กลับและตรวจว่าไม่มีค่าจริง

## ไฟล์ที่จะเปลี่ยนหลังอนุมัติ

- `src/server/auth/login.ts`, `src/app/login/actions.ts`
- `src/lib/supabase/server.ts`: เก็บ cookie ของ login ระหว่างคำขอและส่งออกหลังตรวจบัญชีใน DB สำเร็จเท่านั้น
- `src/app/api/auth/login/route.ts`
- `src/server/auth/api-authorization.ts` เฉพาะ helper ตรวจ Origin ที่แชร์กับ API เดิม หากจำเป็น
- `src/server/auth/current-user.ts`, `src/app/api/products/route.ts`, `src/app/api/products/masters/route.ts`, `src/app/api/products/next-sequence/route.ts`: ตรวจ Bearer ใน API
- `postman/Zuugroup.postman_collection.json`, `postman/README.md`
- เอกสาร TASK-048, Specs/Plan หลัก และ `tasks/ACTIVE.md`
- ไฟล์ทดสอบเฉพาะ auth หากจำเป็นสำหรับตรวจ session/error paths

## วิธีตรวจรับ

POST ด้วยบัญชี Active ตอบ 200 พร้อม access token และ GET ที่ใช้ Bearer ได้ตาม Role; Bearer ผิดตอบ 401, รหัสผิด 401, บัญชีไม่พร้อมใช้ 403, JSON ผิด 400, Origin ต่างแอป 403; หน้า Login เดิมยังใช้งานได้; ไม่มี credential/token จริงใน repository หรือ Collection ที่แชร์
