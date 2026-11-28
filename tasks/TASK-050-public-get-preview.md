# TASK-050 — จัด REST GET สาธารณะและ Collection Zuugroup ใหม่

- **สถานะ:** READY_FOR_USER_TEST — อนุมัติแล้ว 2026-10-01
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ร่างข้อกำหนด](../docs/specs/2026-10-01-public-get-preview.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-public-get-preview-plan.md)

## ขอบเขตที่ทำแล้ว

สร้าง public GET catalog, สินค้า list/getbyid, ข้อมูลแม่รวมและ list/getbyid ของ categories/dosage-forms/drugs; ค้นหาและ pagination เลือกฟิลด์จาก Prisma; proxy ข้าม refresh Auth เฉพาะ public API

Collection ใหม่ `55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903` มี 5 โฟลเดอร์ 10 GET พร้อม No Auth, Params, คำอธิบายตัวอย่าง JSON และสคริปต์เก็บ ID. Collection เดิมเปลี่ยนชื่อ `Zuugroup — Authenticated` และสำรองไฟล์แล้ว

Lint และ production build รวม TypeScript ผ่าน; อ่าน Collection กลับยืนยัน 10 GET No Auth. ไม่ส่งคำขอ GET จริงตามคำสั่งเดิมของผู้ใช้. ยังไม่ commit/push รอบนี้

## ก่อนเริ่มทำต่อ

เจ้าของโครงการอนุมัติด้วย `ok` และคำสั่ง `ปรับใช้ Zuugroup และทำ` เมื่อ 2026-10-01

## ⚠️ ต้องทดสอบโดยคุณ

หลังอนุมัติและสร้าง API แล้ว เปิด Collection `Zuugroup` ใหม่โดยไม่เลือก Environment และส่ง GET; ควรเห็นข้อมูลสินค้าที่อนุมัติเท่านั้น ส่วน `/api/users` ที่ไม่ล็อกอินยังได้ 401
