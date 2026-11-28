# Checkpoint — 2026-10-01 (รอบที่ 2)

เจ้าของสั่งทำ checkpoint และ commit ก่อนกลับไปเติม SuccessAlertComponent. Branch `AI`; รอบนี้ไม่ push.

## งานที่อยู่ใน checkpoint นี้

- TASK-037 งานย่อยแก้ Login ช่วง DB connection ปิด โดย retry แบบจำกัดและบันทึกรหัส error ฝั่ง server; เจ้าของยืนยัน Login ใช้ได้ แต่ UAT Auth/RBAC ทั้งระบบยังค้าง.
- TASK-053 Client API ผ่าน `src/service/http.ts` ด้วย Axios GET/POST/PATCH/DELETE/Login, การจัดการ error/401 และการย้ายจุดเรียก API ฝั่ง Client.
- TASK-054 ปรับชื่อและค่าที่จำเป็นใน `.env.local` ซึ่ง Git ignore; checkpoint ไม่เก็บ credential. `.env.example` เป็นช่องว่างให้กรอกเอง.
- TASK-055 ตัดข้อความประกอบ UI ที่ซ้ำ/ลอยจากหน้าที่ระบุ.
- TASK-056 เพิ่ม LoadingComponent, NotFoundComponent, SuccessAlertComponent และ SVG icon; SuccessAlert ใช้ในกู้คืนรายการโมดูลและรายละเอียดสินค้า แต่เจ้าของแจ้งว่ายังไม่เสร็จในมุมการใช้งานจริง จึงต้องตรวจและเติมต่อหลัง commit.
- TASK-057 ทำแถวรายการโมดูล/สินค้า/ผู้ใช้งานให้เปิดรายละเอียดจากทั้งแถวและคีย์บอร์ด.
- TASK-058 คู่มือชื่อ API ไทย/อังกฤษ 23 โฟลเดอร์ใน `docs/API-NAME-GUIDE.md`.
- TASK-059 Loading เต็มหน้าจอพร้อม icon/motion, route fallback, session fallback และจุดโหลดข้อมูลหลัก.

## การตรวจล่าสุด

- TASK-059 ตรวจ lint, type-check, production build และ diff-check ผ่านหลังแก้ layout.
- ตรวจไฟล์ที่เปลี่ยนแล้วไม่พบรูปแบบ secret key หรือ connection string จริง; `.env.local` ไม่ถูกติดตามโดย Git.
- ยังไม่ได้ตรวจ UI ด้วย browser ในรอบ Loading เพราะเครื่องมือ browser เริ่มทำงานไม่ได้; รอเจ้าของ UAT.

## งานถัดไปหลัง commit

1. ตรวจ SuccessAlertComponent ที่มีอยู่และจุดสำเร็จของการสร้าง/แก้ไข/ลบ/กู้คืนข้อมูล ว่าเหตุใดเจ้าของจึงยังไม่เห็นหรือถือว่ายังไม่ทำ.
2. บันทึก Specs/Plan/Task แยกก่อนแก้ไฟล์ แล้วเชื่อม SuccessAlert ให้ครอบคลุม flow ที่จำเป็นและทดสอบ.
3. ให้เจ้าของทดสอบพฤติกรรม UI และ Auth/RBAC/CRUD ที่ยังอยู่สถานะ READY_FOR_USER_TEST.
