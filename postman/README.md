# Postman — Zuugroup (GET)

1. เปิดโปรเจกต์ด้วย `npm run dev` แล้วล็อกอินเว็บที่ `http://localhost:5000/login` ด้วยบัญชีทดสอบที่มีสิทธิ์
2. ใน Postman กด **Import** แล้วเลือก `Zuugroup.postman_collection.json`; Collection จะชื่อ **Zuugroup** และ `baseUrl` เริ่มต้นเป็น `http://localhost:5000`
3. ใช้ Postman Interceptor เพื่อ sync cookies จากเบราว์เซอร์สำหรับ `localhost` เข้า Postman cookie jar หรือเพิ่ม session cookies ของโดเมนเดียวกันใน cookie manager. ต้องใช้ host เดียวกับ `baseUrl` ตลอด; Collection ไม่มี token หรือรหัสผ่าน
4. ส่ง **GET ข้อมูลแม่สินค้า** ก่อน เพื่อให้ Collection เติม `categoryId` และ `dosageFormId`; จากนั้นส่ง **GET เลขลำดับสินค้าถัดไป**, **GET รายการสินค้า** และ **GET รายการผู้ใช้งาน (Admin)**

GET สินค้าทั้งสามรายการต้องเป็นผู้ใช้ Active; GET ผู้ใช้งานต้องเป็น Admin. ถ้าไม่ส่ง session cookie จะได้ HTTP 401 และถ้า Role ไม่ใช่ Admin แล้วเรียกรายชื่อผู้ใช้ จะได้ HTTP 403. ถ้าเปลี่ยน `baseUrl` เป็น IP/host อื่น ต้อง sync cookie ของ host ใหม่นั้นด้วย

Collection นี้มีเฉพาะ GET route ที่มีในแอปและอ่าน DB จริง. หน้า Audit Logs ยังเป็น Server page `/audit-logs` โดยไม่มี JSON API; โมดูลที่ยัง Mock ไม่มี GET API ใน Collection นี้. อย่า Export หรือ commit Cookie/Token ของ Postman environment
