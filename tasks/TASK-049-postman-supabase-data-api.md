# TASK-049 — เชื่อม Postman กับ Supabase Data API โดยตรง

- **สถานะ:** READY_FOR_USER_TEST — คำขอพร้อม แต่ DB ยังไม่เปิด GRANT/RLS สำหรับ Data API
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ข้อกำหนด](../docs/specs/2026-10-01-postman-supabase-data-api.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-postman-supabase-data-api-plan.md)

## ขอบเขต

เพิ่ม GET สำหรับข้อมูลหลักสินค้าใน Collection เดิมด้วย publishable key และ Bearer token; ไม่แก้ DB หรือสิทธิ์ RLS และไม่ยิงคำขอทดสอบตามผู้ใช้

## ผลงาน

เพิ่ม GET 5 รายการในไฟล์ Collection และ Postman Workspace เดิม; `supabaseUrl` กับ `supabasePublishableKey` ชี้ project ปัจจุบัน. ยังไม่มีคำขอใดที่ยิงไปยัง Supabase ในรอบนี้ตามคำสั่งเจ้าของโครงการ. การอ่านตารางตรงจะติด GRANT/RLS ปัจจุบันจนกว่าจะมี Task อนุมัติเปิดสิทธิ์

## ⚠️ ต้องทดสอบโดยคุณ

ส่ง GET จาก Postman ด้วยบัญชีที่ล็อกอินแล้ว; ควรเห็นว่าคำขอไปยัง Supabase project ปัจจุบันโดยตรง หากได้ 403/42501 ถือว่าตารางยังไม่อนุญาต Data API ต้องอนุมัติ Task ด้าน GRANT/RLS แยกก่อนอ่านข้อมูลได้
