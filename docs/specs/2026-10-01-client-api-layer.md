# TASK-053 — ชั้นเรียก API ฝั่ง Client ส่วนกลาง

เจ้าของอนุมัติ 2026-10-01 และให้ตัวอย่าง Axios ที่ทุกหน้าเรียกผ่านฟังก์ชันส่วนกลาง พร้อม try/catch.

- Client Component เรียก API ผ่าน `src/service/http.ts` สำหรับ GET, POST, PATCH, DELETE; มีฟังก์ชัน Login สำหรับ API login แต่หน้า Login ปัจจุบันยังใช้ Server Action ที่จัดการ cookie หลังตรวจบัญชี.
- `Update` ใช้ PATCH สำหรับแก้ข้อมูลบางฟิลด์ตามคำตอบเรื่อง HTTP Method. คง URL และ `route.ts` ของ Next.js เดิม เพราะตัวอย่างเป็นชั้น HTTP Client ไม่ใช่ตัวแทน Route Handler.
- ใช้ Axios ในชั้น service ตาม Project Specs §22; หน้าเว็บไม่ import Axios หรือเรียก fetch API ตรง. ส่ง cookie แบบ same-origin ให้ server ตรวจ session. ไม่อ่าน Supabase session cookie ใน JavaScript, ไม่ส่ง secret key หรือ `x-api-key` จาก browser.
- ชั้น service มี try/catch, คืนข้อมูลตาม response เดิม, อ่านข้อความ error ทั้งแบบ string และ `{error:{message}}`, แยก status ของ error. เมื่อ API ตอบ 401 ให้ไป `/login`; 403 แสดงข้อผิดพลาดสิทธิ์เดิมโดยไม่ล้าง session.
- รองรับ AbortSignal สำหรับ GET ที่ยกเลิกเมื่อ component unmount และ body ของ DELETE สำหรับเหตุผลลบ. คง No Store ของคำขออ่าน.
- ไม่เปลี่ยน Auth/RBAC, schema, seed, Postman หรือกฎธุรกิจ.
