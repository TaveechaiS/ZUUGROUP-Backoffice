# แผนย่อย TASK-049 — Supabase Data API ใน Postman

## ลำดับและผลลัพธ์

1. อ่าน `tasks/ACTIVE.md`, สถานะ Collection, migration RLS และเอกสาร Supabase ล่าสุด
2. บันทึกขอบเขตใน Specs/Plan/Task และระบุข้อจำกัดสิทธิ์ของ DB
3. เพิ่ม GET แบบอ่านอย่างเดียวใน Collection ใน repository และ Workspace `Zuugroup`; ใช้ publishable key และ Bearer ของผู้ใช้ ไม่บันทึก secret key
4. ปรับคู่มือการใช้งานและส่งต่อวิธีตรวจด้วย Postman โดยไม่ส่งคำขอทดสอบตามคำสั่งผู้ใช้

## ไฟล์ที่จะเปลี่ยน

- `docs/specs/2026-10-01-postman-supabase-data-api.md`
- `docs/plans/2026-10-01-postman-supabase-data-api-plan.md`
- `postman/Zuugroup.postman_collection.json`, `postman/README.md`
- `tasks/TASK-049-postman-supabase-data-api.md`, `tasks/ACTIVE.md`

## วิธีตรวจรับโดยเจ้าของโครงการ

เลือก Environment ส่วนตัวที่มี `activeToken`, เปิด GET ในกลุ่ม Supabase Data API แล้วส่งคำขอ ตรวจว่า Postman ชี้ project ปัจจุบันและใช้ publishable key; หากได้ 403/42501 ให้ถือว่า DB ยังไม่เปิดสิทธิ์ตามที่กำหนด ไม่เปลี่ยนไปใช้ secret key แก้ชั่วคราว
