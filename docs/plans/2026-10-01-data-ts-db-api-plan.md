# แผนย่อย TASK-051 — ย้าย data.ts เข้า DB/API

สถานะ: อนุมัติแล้ว 2026-10-01 ใช้ข้อมูลเดิมและฟิลด์หลักก่อน

## ลำดับ ผลลัพธ์ และไฟล์

1. สำรวจ data.ts และผู้อ้างอิง: พบ 19 ชุด 57 แถวต้นฉบับ; อ่าน schema และข้อกำหนด DB-first เพื่อไม่สร้างกฎ OPEN
2. ยืนยันวิธีเก็บตาม Specs แล้วปรับ Specs/Plan หลักและ tasks/ACTIVE.md ก่อนเริ่มโค้ด
3. หากเลือกชุดตัวอย่าง: สร้าง schema/migration สำหรับชุดและแถวตัวอย่าง แยกจากตารางธุรกิจ พร้อม RLS/ถอน grant ของ anon/authenticated; ไฟล์ prisma/schema.prisma, prisma/migrations/*
4. ย้ายข้อมูลต้นฉบับไป scripts/fixtures และทำ seed ที่รันซ้ำได้; deploy ลง project ทดสอบปัจจุบัน; ไม่ใช้แถวที่ helper ทำซ้ำเพื่อเติมจำนวน
5. ทำ service และ GET list/getbyid/filters/dashboard จาก DB พร้อม validation/pagination ค่าเริ่มต้น 10; ไฟล์ src/server/demo/*, src/app/api/demo/*
6. ย้ายหน้าที่อ้าง data.ts ไป API ทีละชุดผ่าน component กลาง; แยก UI config ออกจาก rows/metrics; อ่านคู่มือ Next.js ก่อนโค้ด; ไฟล์ src/app/**/page.tsx, src/app/dashboard-page-content.tsx, src/components/pages/*, src/features/*
7. หน้าเพิ่มของชุดตัวอย่างแสดงข้อความรอเปิดการบันทึก DB และปุ่มกลับรายการ; ยกเลิกการบันทึก sessionStorage ไม่ย้าย draft ของ browser อัตโนมัติ; ข้อมูลสินค้าและผู้ใช้จริงยังใช้ฟอร์มเดิม
8. เพิ่มโฟลเดอร์ GET ใน postman/Zuugroup.postman_collection.json และ Workspace เดิม; อัปเดตคู่มือ, Task, ACTIVE และผลตรวจ

## วิธีตรวจรับ

รายการ UI/API อ่านจาก DB และตอบครั้งละ 10; Filter/ค้นหา/pagination ที่ฝั่ง DB; list/getbyid/filters ครบทุกชุดและติดป้าย isSample. Seed ซ้ำไม่เพิ่มจำนวนหรือทับข้อมูลจริง. โค้ดผ่าน lint/TypeScript/build. การยิง API จริงงดตามคำสั่งเดิมจนเจ้าของโครงการระบุให้ทดสอบ

## ผลรอบนี้

ทำครบลำดับ schema/seed/API/UI/Postman และรอ UAT; 19 ชุด/57 แถว, seed ซ้ำจำนวนเดิม, RLS เปิด/ถอน SELECT ของ anon/authenticated, Collection 87 GET และ 23 list scripts, ลบ data.ts และ helper Mock. Prisma schema engine เชื่อมไม่ได้จึงบันทึก migration checksum ผ่าน SQL; local seed ซ้ำพบ ECONNRESET จึงตรวจนำเข้าซ้ำผ่าน Supabase MCP. Static checks ผ่าน ไม่ยิง HTTP ตามผู้ใช้
