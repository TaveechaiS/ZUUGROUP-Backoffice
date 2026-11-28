# แผนย่อย TASK-046 — Postman GET Collection

## ลำดับและผลลัพธ์

1. ตรวจ `tasks/ACTIVE.md`, route `src/app/api/**/route.ts` และการตรวจสิทธิ์ เพื่อเลือกเฉพาะ GET ที่มีจริง
2. สร้าง `postman/Zuugroup.postman_collection.json` พร้อม `baseUrl`, กลุ่มสินค้า/ผู้ใช้งาน, คำอธิบายสิทธิ์ และตัวแปรจากข้อมูลแม่สำหรับเลขลำดับ
3. เขียน `postman/README.md` วิธี Import, ใช้ session cookie จากการล็อกอินเว็บผ่าน Postman Interceptor/cookie jar และผลที่ควรเห็น โดยไม่เก็บ Secret ในไฟล์
4. ตรวจ JSON และยืนยันว่า URL/method ทุกคำขอตรงกับ route; ส่งให้เจ้าของโครงการ Import และทดสอบด้วยบัญชีจริง

## ไฟล์ที่จะเปลี่ยน

- `docs/specs/2026-10-01-postman-get.md`
- `docs/plans/2026-10-01-postman-get-plan.md`
- `postman/Zuugroup.postman_collection.json`, `postman/README.md`
- `tasks/TASK-046-postman-get.md`, `tasks/ACTIVE.md`

## วิธีตรวจรับ

Import Collection ชื่อ Zuugroup ได้; มีเฉพาะ 4 คำขอ GET; หลังส่ง session cookie ของ Admin คำขอทั้งสี่ตอบสำเร็จ; หากไม่มี session API ตอบ 401 และผู้ใช้ที่ไม่ใช่ Admin เรียก `/api/users` ได้ 403
