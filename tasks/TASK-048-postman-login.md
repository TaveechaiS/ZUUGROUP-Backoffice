# TASK-048 — POST เข้าสู่ระบบสำหรับ Postman

- **สถานะ:** READY_FOR_USER_TEST — POST แยก 4 บัญชีคืน Bearer token และ GET ตาม Role ผ่านกับ DB จริง; รอทดสอบใน Postman Desktop
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Commit ตั้งต้น:** `a0e9d0a`
- **Specs:** [POST เข้าสู่ระบบ](../docs/specs/2026-10-01-postman-login.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-postman-login-plan.md)

## ขอบเขต

เพิ่ม JSON login API ที่ใช้ Auth service ของเว็บ คืน access token พร้อม session cookie; API ธุรกิจตรวจ Bearer token และ Role; Collection Zuugroup มี POST แยก 4 บัญชีและสคริปต์บันทึก token ใน Environment ส่วนตัว

## Definition of Ready

เจ้าของโครงการอนุมัติ Specs และ Task นี้ตาม AGENTS.md ข้อ 3; ขอบเขตนี้ไม่สร้าง schema หรือกฎธุรกิจใหม่ที่อยู่ใน OPEN

## ผลตรวจในขั้นเตรียม

ตรวจพบว่า Login ปัจจุบันเป็น Server Action และ API ธุรกิจใช้ Supabase SSR cookie จึงต้องเพิ่ม Route Handler สำหรับ Postman โดยไม่มีการใส่ credential จริงใน Collection

ตรวจบัญชีที่ผู้ใช้ให้แบบอ่านอย่างเดียวแล้ว: admin/manager/cfo มี Role ADMIN และ sales มี Role SALES; ทุกบัญชี Active, ไม่ถูกลบ และมี Auth link. Supabase Auth ยืนยันรหัสที่ผู้ใช้ให้สำหรับทั้ง 4 บัญชีสำเร็จโดยไม่เก็บ credential ในไฟล์

## ผลตรวจ implementation

- เพิ่ม Route Handler `POST /api/auth/login` และ Auth service กลางที่ใช้กับหน้า Login; cookie ของ login ส่งออกหลังตรวจบัญชีและบันทึก lastLoginAt สำเร็จเท่านั้น
- Collection เดิมใน Workspace มี 4 GET + 4 POST ครบ; อ่านกลับพบ body ใช้ `{{loginPassword}}`, สคริปต์ของแต่ละ POST เก็บ token ของบัญชีและ `activeToken`, GET ทุกคำขอใช้ Bearer `{{activeToken}}`
- HTTP จริง: JSON ผิด/ข้อมูลไม่ครบ/ชนิดข้อมูลผิด 400, Origin ต่างแอป 403, รหัสผิด 401, DB เชื่อมต่อไม่ได้ 503; ทุกกรณีล้มเหลวไม่ส่ง session cookie ใหม่ และ response ใช้ no-store. GET ไม่มี cookie ตอบ 401
- TypeScript, ESLint และ production build ผ่าน; ไฟล์ Collection มี 4 POST และ 4 GET, สคริปต์ทุกคำขอ parse ได้ และไม่มีรหัสผ่านจริง
- เมื่อ DB เชื่อมต่อได้ ทดสอบ HTTP จริงทั้ง 4 บัญชี: POST 200 คืน Bearer token อายุ 3600 วินาที, GET สินค้าและข้อมูลแม่สินค้า 200 ทุกบัญชี, GET ผู้ใช้งาน 200 สำหรับ admin/manager/cfo ที่มี Role ADMIN ใน DB และ 403 สำหรับ sales ที่มี Role SALES
- Token ผิด/Authorization ผิดรูปแบบ/ไม่มี Authorization ตอบ 401; ส่ง Bearer ผิดพร้อม cookie ที่ถูกต้องยังตอบ 401. Session cookie ของ Admin ยังใช้ GET ได้ 200
- GET เลขลำดับสินค้าถัดไปด้วย Bearer และ ID จากข้อมูลแม่ตอบ 200; ทดสอบรวมครบทั้ง 4 GET ใน Collection
- ระหว่างทดสอบซ้ำ POST มี 503 ชั่วคราวหนึ่งครั้ง; ตรวจ PostgreSQL แบบอ่านอย่างเดียวและส่ง POST ซ้ำแล้วได้ 200. หากเกิดซ้ำใน Postman ให้ตรวจการเชื่อมต่อ DB และลองอีกครั้งก่อนสรุปว่ารหัสผิด
- การทดสอบ Postman Desktop ต้องให้เจ้าของโครงการส่งคำขอใน Environment ส่วนตัวเพื่อยืนยันว่า Variables ถูกตั้งบนเครื่องตามสคริปต์; ไม่ใส่ token ที่ได้จริงใน Workspace
- เซิร์ฟเวอร์ production ทดสอบชั่วคราวพอร์ต 5001 ถูกปิดแล้ว

## ⚠️ ต้องทดสอบโดยคุณ

1. สร้าง Environment ส่วนตัว ตั้ง `loginPassword`, แล้วส่ง POST ของ Admin, Manager, Sales, CFO ทีละคำขอ: ควรได้ 200 และเห็น `adminToken`, `managerToken`, `salesToken`, `cfoToken` กับ `activeToken` ใน Variables ของ Environment ที่เลือก
2. ส่ง GET สินค้า: ควรได้ 200 โดย Bearer `activeToken`; หลังส่ง POST Sales แล้ว GET ผู้ใช้งานควรได้ 403. บัญชี Manager/CFO ปัจจุบันมี Role ADMIN ใน DB จึงได้ 200 จนกว่าจะปรับ Role
3. ใช้รหัสผิด: ควรได้ 401 และ `activeToken` ถูกลบ; บัญชีระงับ/ลบ: ควรได้ 403 และใช้ token เดิมเรียก GET ไม่ได้
4. ล็อกอินผ่านหน้าเว็บเดิม: ควรเข้าสู่หน้าแรกได้เหมือนเดิม
