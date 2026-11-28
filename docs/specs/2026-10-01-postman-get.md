# ข้อกำหนด — Postman GET Collection: Zuugroup

**วันที่:** 2026-10-01 (Asia/Bangkok)
**สถานะ:** เจ้าของโครงการขอให้สร้าง GET ก่อน
**อ้างอิง:** คำขอ Postman ชื่อ Zuugroup และข้อกำหนด DB-first

- จัดไฟล์ Postman Collection ชื่อ `Zuugroup` สำหรับ Import โดยรวมเฉพาะ GET API ที่มีอยู่จริงและอ่านข้อมูลจาก DB: ผู้ใช้งาน สินค้า ข้อมูลแม่สินค้า และเลขลำดับสินค้าถัดไป
- ไม่สร้างคำขอ POST/PATCH/DELETE หรือ API สมมุติสำหรับโมดูลที่ยัง Mock
- ใช้ `{{baseUrl}}` ค่าเริ่มต้น `http://localhost:5000`; เก็บ ID หมวดและรูปแบบยาเป็นตัวแปร Collection ที่ได้จาก GET ข้อมูลแม่สินค้า
- API ปัจจุบันตรวจ session cookie ของ Supabase SSR; Collection ไม่บันทึกรหัสผ่าน, token หรือ cookie ให้ใช้ cookie jar/Interceptor ของ Postman กับโดเมนเดียวกับ `baseUrl`
- ระบุสิทธิ์: `GET /api/users` เฉพาะ Admin; GET สินค้าทั้งสามรายการต้องเป็นผู้ใช้ที่ Active
- ข้อมูลจาก GET เป็นข้อมูลจริงของสภาพแวดล้อมทดสอบ; การเปลี่ยนสถานะหรือสร้างข้อมูลไม่อยู่ในรอบนี้
