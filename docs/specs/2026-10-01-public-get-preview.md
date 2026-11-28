# ร่างข้อกำหนด — GET สำหรับดูข้อมูลก่อนล็อกอิน

**วันที่:** 2026-10-01 (Asia/Bangkok)
**สถานะ:** อนุมัติ 2026-10-01 ด้วยคำตอบ `ok` และคำสั่งให้นำรูปแบบ Restful API มาใช้และทำ Zuugroup

## สิ่งที่ตรวจพบ

- REST API ปัจจุบันมี GET `/api/products`, `/api/products/masters`, `/api/products/next-sequence` และ `/api/users`; ทุกเส้นทางตรวจบัญชีผู้ใช้ก่อนตอบข้อมูล
- Supabase Data API ของตารางสินค้าเปิด RLS และถอน GRANT จาก `authenticated`; publishable key เพียงอย่างเดียวไม่เปิดข้อมูล
- Specs สินค้าเดิมให้ Admin, Sales, Manager และ Accounting & CFO อ่านข้อมูลสินค้า; ยังไม่ระบุการเปิดข้อมูลให้บุคคลที่ไม่ล็อกอิน

## ข้อเสนอสำหรับยืนยัน

ขอบเขตนี้ได้รับอนุมัติแล้ว; คำสั่งล่าสุดเพิ่มรูปแบบ list/getbyid และ Params ตาม Collection ตัวอย่าง

- เพิ่ม `GET /api/public/products` ที่ไม่ต้องมี Cookie, Bearer token หรือ API key; ตอบเฉพาะสินค้าสถานะ ACTIVE และยังไม่ลบ จำกัด 50 รายการ เรียงตามรหัส
- ฟิลด์ที่เสนอให้ตอบ: `id`, `code`, `name`, `categoryId`, `category`, `dosageFormId`, `dosageForm`, `drugId`, `drug`, `unit`. ไม่ตอบราคา คลัง จำนวนคงเหลือ สถานะการลบ ข้อมูลผู้ใช้ หรือ Audit
- เพิ่ม `GET /api/public/products/masters` สำหรับหมวดสินค้า รูปแบบยา และตัวยา โดยตอบ `id`, `code` (ถ้ามี), `name`; ไม่ตอบรายชื่อคลัง
- เพิ่ม `GET /api/public` เป็นรายการเส้นทาง GET สาธารณะ พร้อมวิธีใช้และคำอธิบายฟิลด์ เพื่อให้ดูว่าควรต่อ API ใด
- Collection `Zuugroup` รุ่นใหม่ให้มีเฉพาะ GET สาธารณะข้างต้นและ `baseUrl` เดียว; ไม่ต้องมี login, token หรือ Supabase key. คำขอเดิมที่ใช้สิทธิ์ผู้ใช้จะเก็บเป็นไฟล์ Collection แยก ไม่ลบการทำงานของ API เดิม
- ใช้ Server route ผ่าน Prisma เพื่อเลือกฟิลด์ที่เปิดเผย; ไม่เปลี่ยน GRANT/RLS ของ Supabase Data API

## รูปแบบตาม Collection ตัวอย่าง

- GET รายการรับ `search` (ไม่เกิน 160 ตัวอักษร), `offset` (0–100000), `limit` (1–50 ค่าเริ่มต้น 20); สินค้ารับ `categoryId`, `dosageFormId` เป็น UUID เพิ่มได้
- ตอบรายการเป็น `{ data: [...], pagination: { offset, limit, total, hasMore } }`; รายละเอียดเป็น `{ data: {...} }`
- เพิ่ม `GET /api/public/products/[id]` และ `GET /api/public/masters/[type]`, `/api/public/masters/[type]/[id]`; type รับเฉพาะ `categories`, `dosage-forms`, `drugs`
- UUID/Params ผิดตอบ 400, ไม่พบหรือสินค้าไม่ Active/ลบแล้วตอบ 404, DB ไม่พร้อมตอบ 503 โดยไม่เปิดข้อความภายใน
- Collection แยก `api`, `products`, `product_categories`, `dosage_forms`, `drugs`; ใช้ `baseUrl` และ ID ตัวแปรสำหรับ getbyid; เก็บตัวอย่าง Response ที่ระบุว่าเป็นตัวอย่างโครงสร้าง
- Public API ข้ามการ refresh Auth ใน proxy และตอบ Cache-Control no-store

## จุดที่ต้องยืนยันก่อนทำ

การเปิด GET แบบไม่ล็อกอินทำให้บุคคลภายนอกที่รู้ URL เห็นข้อมูลที่ตอบได้ เจ้าของโครงการต้องยืนยันว่าข้อมูลสินค้าตามรายการข้างต้นเปิดเผยได้ รวมทั้งการแยก Collection เดิมออกจาก `Zuugroup` ใหม่
