# ข้อกำหนด — POST เข้าสู่ระบบใน Postman

**วันที่:** 2026-10-01 (Asia/Bangkok)
**สถานะ:** APPROVED — เจ้าของโครงการยืนยันให้เพิ่ม POST login ใน Postman เพื่อใช้ API พร้อมบัญชีทดสอบ วันที่ 2026-10-01
**อ้างอิง:** คำขอเจ้าของโครงการ “เพิ่ม post เข้าสู่ระบบ”, Project Specs §18 และ Auth/RBAC TASK-037

## สัญญา API

- เพิ่ม `POST /api/auth/login` รับ `Content-Type: application/json` และ body `{ "email": "...", "password": "..." }`
- อีเมลและรหัสผ่านต้องเป็น string ที่ไม่ว่าง; trim อีเมล แต่รักษารหัสผ่านตามที่ส่งมา
- ตรวจรหัสผ่านด้วย Supabase Auth แล้วตรวจบัญชีภายในผ่าน `AuthAccount`: ต้องมี User ที่ `ACTIVE`, ไม่ถูกลบ และมี Role ตามกฎล็อกอินเดิม
- สำเร็จตอบ HTTP 200 `{ "ok": true, "user": { "id": "...", "name": "...", "employeeCode": "...", "roleId": "..." }, "accessToken": "...", "tokenType": "Bearer", "expiresIn": 3600 }`; ตั้ง session cookie และอัปเดต `lastLoginAt`. ไม่คืน refresh token
- ข้อมูลไม่ถูกต้องตอบ 400; อีเมล/รหัสผ่านผิดตอบ 401 ด้วยข้อความทั่วไป; บัญชีภายในไม่พร้อมใช้ตอบ 403 และยกเลิก session ที่เพิ่งสร้าง
- ข้อจำกัดจำนวนคำขอจาก Supabase ตอบ 429; การตั้งค่า/บริการ Auth/DB ใช้งานไม่ได้ตอบ 503; ข้อผิดพลาดอื่นตอบ 500 พร้อมข้อความทั่วไปโดยไม่เผยรายละเอียดภายใน
- ถ้ามี Origin header ต้องเป็น origin ของแอป; Postman ส่งโดยไม่มี Origin ได้ ข้าม origin ตอบ 403
- ทุก response ของ login ใช้ `Cache-Control: private, no-store`; ไม่คืนรหัสผ่านหรือ refresh token ใน JSON และไม่บันทึก credential ใน Log/Collection/repository. ตอบ access token เฉพาะบัญชีที่ผ่านการตรวจ DB แล้ว
- API ธุรกิจรับ `Authorization: Bearer <accessToken>` จาก Postman โดยตรวจ token กับ Supabase Auth และตรวจบัญชีภายในที่ Active/ไม่ลบ/มี Role ทุกคำขอ; bearer ที่ไม่ถูกต้องต้องตอบ 401 และไม่ตกกลับไปใช้ cookie ถ้าส่งมาด้วย. API ยังคงรับ session cookie เมื่อไม่มี Bearer
- Access token หมดอายุแล้วต้องส่ง POST เข้าสู่ระบบใหม่; ไม่เก็บ refresh token ใน Postman
- หน้า Login และ Route Handler ใช้ Auth service กลางเดียวกัน เพื่อให้การตรวจสถานะบัญชีเหมือนกัน

## Postman

- เพิ่ม POST แยก Admin, Manager, Sales และ CFO ในกลุ่ม “เข้าสู่ระบบ” ของ Collection `Zuugroup` ทั้งไฟล์ต้นฉบับและ Collection เดิมใน Workspace
- body ใช้อีเมลบัญชีทดสอบตามชื่อคำขอ และ `{{loginPassword}}` จาก Environment ส่วนตัวของผู้ใช้; ไม่เพิ่มรหัสผ่านจริงในไฟล์หรือค่าที่แชร์
- แต่ละ POST บันทึก token ลง `adminToken`, `managerToken`, `salesToken` หรือ `cfoToken` พร้อมตั้ง `activeToken` ให้บัญชีล่าสุด ใน Variables ของ Environment ส่วนตัว; ไม่บันทึก token ใน Collection หรือค่าที่แชร์กับทีม
- GET ใน Collection ใช้ `Authorization: Bearer {{activeToken}}`; ผู้ใช้เปลี่ยนบัญชีด้วยการส่ง POST ของบัญชีที่ต้องการอีกครั้ง
- ข้อกำหนดนี้เพิ่ม POST login ต่อจาก TASK-046 ที่เดิมจำกัดเฉพาะ GET; ไม่เกี่ยวกับ PostgreSQL Data requests ของ TASK-047

## ตรวจรับ

บัญชี Active ล็อกอินสำเร็จ ได้ access token เฉพาะใน response และ Environment ส่วนตัว แล้ว GET ตาม Role ได้; token ไม่ถูกต้อง/หมดอายุตอบ 401; บัญชีถูกระงับหรือถูกลบใช้ token เดิมไม่ได้; ไม่มี credential/token จริงในไฟล์ที่ส่งขึ้น Workspace

## บัญชีทดสอบที่เจ้าของโครงการให้

ผู้ใช้ให้บัญชี `admin@zuugroup.com`, `manager@zuugroup.com`, `sales@zuugroup.com`, `cfo@zuugroup.com` สำหรับทดสอบ; credential ที่ให้ใช้เฉพาะระหว่างทดสอบ ไม่บันทึกค่าจริงในเอกสารหรือ Collection

ผลตรวจ DB วันที่ 2026-10-01: ทั้ง 4 บัญชี Active, ไม่ถูกลบ และมี Supabase Auth link. Role ปัจจุบันตามลำดับคือ ADMIN, ADMIN, SALES, ADMIN. ชื่ออีเมลไม่ใช้ตัดสินสิทธิ์; การเปลี่ยน manager/cfo ให้ตรง Role ต้องให้เจ้าของโครงการยืนยันก่อน
