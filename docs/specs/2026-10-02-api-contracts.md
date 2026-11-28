# API types, validation และ Postman — TASK-073

สถานะ: APPROVED 2026-10-02 เจ้าของสั่ง “ทำ TASK-073 ก่อน อนุมัติเอกสาร” พักงาน Deploy

## ข้อกำหนดล่าสุด

เจ้าของยืนยันสิทธิ์ 4 Role ใช้ได้แล้ว รายละเอียดข้อมูล/กฎธุรกิจ/สิทธิ์รายฟังก์ชัน/ขอบเขตข้อมูลและตัวกรองรอข้อมูลจริง รอบนี้จัดโครงสร้างของ API ปัจจุบันให้แก้ต่อได้ ไม่กำหนดสิทธิ์หรือฟิลด์ใหม่

## ผลตรวจปัจจุบัน

- src/types/api.ts มีเฉพาะ Pagination; Record types อยู่ features/records/types.ts, ProductView อยู่ app/products/product-ui.ts, UserRow อยู่ users service, LoginResult อยู่ auth service
- records validate ด้วย cleanBody ใน service; products มี productInput; users/auth validate บางส่วนใน route
- response ใช้หลายแบบที่หน้าเว็บรู้จักแล้ว: records `{data,pagination}`, products `{products,pagination}`, users `{users,pagination}` และ error string/มี message ตาม endpoint
- Collections local v2.1: Zuugroup 167 คำขอ และ Zuugroup-authenticated 17 คำขอ มี pagination/filters/users/audit/export

## ขอบเขตที่จะทำ

1. types/api.ts เก็บชนิด envelope/error/pagination ที่ใช้จริง แยกชนิดรายกลุ่มใน src/types/api/records.ts, products.ts, users.ts, auth.ts, audit.ts, reports.ts ตามจำเป็น TypeScript types ไม่มี runtime validation หรือ endpoint functions
2. ย้ายเฉพาะ types ให้ client import จาก types; features/records คง definitions และ lookup ที่ server/seed/Dashboard ใช้ ไม่ลบ modules.json หน้าแต่ละ route ยังคง JSX/ข้อความ/state/API functions ของตัวเอง
3. แยก pure runtime validators ไป server/validation ตามกลุ่มเดิม ไม่เพิ่ม library หากไม่จำเป็น ไม่เปลี่ยนขอบเขตค่าที่รับ ชื่อ field/ข้อความผิดพลาด/HTTP status/default รวม password ขั้นต่ำ8, relation UUID, expectedUpdatedAt และpagination10/max50
4. บันทึกตาราง endpoint/method/query/body/response/error/auth จากโค้ดจริง ปรับ Postman local ให้ตรง ไม่เพิ่ม business endpoints
5. ใช้ Collection v2.1 เดิม ไม่สร้าง workspace/collection ซ้ำ ไม่ sync Cloud ใน Task นี้ ตัวอย่างใช้ variables ไม่บันทึก secret/token/passwordจริง
6. ตรวจ type-check/lint/build และ offline contract cases สำหรับ validators/รูปแบบ collection/เส้น API ที่มีในโค้ด ไม่มี live HTTP/login/DB mutation

## สิ่งที่คงเดิม

- URL และ method, route.ts เป็น HTTP entry point; ไม่ย้าย handler ไป types
- Response แต่ละกลุ่มยังใช้ชื่อเดิม ไม่เปลี่ยนทุก endpoint เป็น envelope ใหม่ในงานนี้
- Auth/RBAC/public allowlists/same-origin, transaction/audit/soft delete/last Admin guard
- DB schema/migrations/seed และข้อมูลปัจจุบันทั้งหมด
- รายละเอียดใหม่/ฟิลเตอร์/กฎที่ OPEN รอเจ้าของให้ข้อมูล

## เกณฑ์ตรวจรับ

ข้อชี้แจงจาก inventory: คง pagination สองรูปร่างจริง `{offset,limit,total,hasMore}` และ `{offset,limit,total,page,pageSize,totalPages}` ไม่แปลง envelope; validators มีความต่างการรับค่าว่างและการแปลงเลขตามเดิม ปัญหา malformed null body ที่ handler เดิมยังตอบข้อผิดพลาดทั่วไปไม่เปลี่ยนใน refactor นี้ รายละเอียด docs/API-CONTRACTS.md

types ไม่ import server/Prisma/Supabase/secret ใน runtime; validators pure ตรวจ unknown input; body/query ถูก normalize และถูก reject เหมือนก่อนแยก; Postman query/body ตัวอย่างสอดคล้อง handler และไม่มีคำขอไป endpoint ที่ลบ; หน้าเว็บไม่เปลี่ยน behavior
