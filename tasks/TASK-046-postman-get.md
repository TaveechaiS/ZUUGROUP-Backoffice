# TASK-046 — Postman Collection ชื่อ Zuugroup เฉพาะ GET

- **สถานะ:** READY_FOR_USER_TEST
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ข้อกำหนด](../docs/specs/2026-10-01-postman-get.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-postman-get-plan.md)

## ขอบเขต

รวม GET API ที่มีอยู่จริงเป็น Collection สำหรับ Import ใน Postman; ไม่เปลี่ยนพฤติกรรม API, Auth, schema หรือข้อมูล DB

## ผลตรวจ

- JSON อ่านได้, Collection ชื่อ `Zuugroup` และมี 4 คำขอ GET ตรงกับ route ที่มีจริง
- GET `/api/products` และ `/api/users` แบบไม่ส่ง session ตอบ 401 ตามข้อกำหนด
- ไม่มีรหัสผ่าน Cookie หรือ Token ในไฟล์; รอทดสอบผ่าน Postman ด้วย session ของผู้ใช้จริง
- สร้าง Collection `Zuugroup` ใน Postman Workspace แล้ว (ID `56ce2cc3-c4bc-4d0b-b84d-0f17bc254c64`); อ่านกลับพบ 4 GET ครบ. Connector ไม่รับสคริปต์ในคำขอ จึงต้องกรอก `categoryId` และ `dosageFormId` เองใน Collection ที่อยู่บน Workspace หรือ Import ไฟล์ต้นฉบับเพื่อใช้สคริปต์

## ⚠️ ต้องทดสอบโดยคุณ

Import Collection, ล็อกอินเว็บและ sync cookie โดเมนเดียวกันใน Postman แล้วส่ง GET ข้อมูลแม่สินค้าและ GET สินค้า; ควรได้ 200 พร้อมข้อมูลจริง. GET ผู้ใช้งานต้องใช้ Admin. GET เลขลำดับต้องใช้ ID จากข้อมูลแม่
