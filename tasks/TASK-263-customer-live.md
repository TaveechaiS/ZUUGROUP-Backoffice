# TASK-263 — ลูกค้า DB/API/Postman/เชื่อมหน้า — 6 ตุลาคม 2569

OWNER_APPROVED. คำตอบเจ้าของ: เลขรันแยกต่อกลุ่มรหัส; ข้อมูลลูกค้าเก่า=ล้าง (ตรวจแล้ว customers 0 แถว และไม่มีแถวอ้างอิง จึงไม่ต้องลบอะไร); เอกสารแนบทำแบบสินค้า (bucket private, ภาพ/PDF ≤10MB, begin→upload→commit); ช่องไม่มีตัวเลือก(ประเภท/ผลตรวจใบอนุญาต)เก็บข้อความ. ตัวเลือกกลุ่มรหัส/เครดิต/วันเริ่มนับ/รอบวางบิล/ประเภทเอกสาร มาจาก TASK-262.

ลำดับ/ไฟล์: migration 20261006_customer_full (customers เพิ่มคอลัมน์หลัก+details jsonb, customer_create_requests, customer_files; คงคอลัมน์legacyเพราะ relation options ของโมดูลอื่นใช้ name/code/province/status/territory_id) → src/server/customers/* + validation + types → API /api/customers (list ใหม่; ?view=options/filters/config คง legacy), /api/customers/[id] detail, next-sequence, requests/files → หน้า /customers live, /customers/create บันทึกจริง, /customers/[id] หน้าแสดง (backup legacy) → Postman Customers folder → ทดสอบ DB rollback/auth/lint/type/build.
ไม่ทำรอบนี้: แก้ไข/ลบลูกค้า (ทำงานถัดไป), กฎสถานะใบอนุญาต/สิทธิ์ซื้อยา, ยอดหนี้/วงเงินคงเหลือ.

ผล: IMPLEMENTED / WAITING_FOR_UAT (7 ตุลาคม 2569).
- DB: `node scripts/setup-customer-full.mjs` (--dry-run ได้) ลง Supabase แล้ว: customers เพิ่ม code_group_id/sequence/contact_name/phone/credit_term_id/credit_days/credit_limit/license_status/license_expires_at/details + check/unique (กลุ่ม,เลขรัน); ตาราง customer_create_requests/customer_files RLS+revoke; bucket private customer-attachments 10MB ภาพ/PDF. customers ก่อน/หลัง 0 แถว ไม่มีการลบข้อมูล. Prisma schema/generate แล้ว.
- Server/API: src/server/customers/{service,full,handler,storage}.ts, validation/customers.ts, config/customers.ts, routes /api/customers/** ตาม API-CONTRACTS. ?view= ของ records เดิมคงไว้แต่ต้อง login (เดิมเปิดอ่านได้โดยไม่ login).
- หน้า: /customers อ่าน API จริง (ค้นหา/เขต/จังหวัด/sort/page ฝั่ง server, คลิกแถวเปิด UUID, Loading/NotFound กลาง, ไม่มีปุ่มเพิ่มตาม TASK-261); /customers/create บันทึกจริง (ตัวเลือกจาก TASK-262, เลขรันถัดไปจาก API, ที่อยู่จัดส่งหลายแห่ง, ไฟล์ตามประเภทเอกสาร, รอบวางบิลเลือก/พิมพ์เอง); /customers/[id] หน้าแสดงอ่านอย่างเดียว (สำรองหน้าเดิม local-backups/TASK-263-customer-detail-before.tsx).
- Postman local: ลูกค้า 9 คำขอ.
- ทดสอบ: `node --loader ./scripts/ts-test-loader.mjs scripts/test-customer-full.mjs` 10 checks ผ่าน (DB จริง rollback + Storage จริงลบไฟล์ทดสอบ): เลขถัดไป, validation, begin/upload/manifest, commit+audit+อ่านไฟล์, ซ้ำในกลุ่ม/ข้ามกลุ่ม, list search/filter/sort/page, detail/404, cancel ลบไฟล์, สิทธิ์ Sales/anon/origin, RLS. test-customer-options 10 ผ่าน, test-route-pages ผ่าน (ปรับเงื่อนไขหน้าลูกค้าเป็นแบบเชื่อมจริง), test-territory-multiple-sales 17 ผ่าน, test-product-options ผ่าน. tsc/eslint/next build ผ่าน. HTTP anonymous: API ทุกเส้น 401, POST /api/customers 405, หน้า redirect /login.
- ล้มเหลวเดิมไม่เกี่ยวงานนี้: test-api-contracts (src/types/api/product-full.ts มี runtime code), test-api-field-names (validation/table-sort.ts import Prisma ใน loader).
- ไม่ได้ทดสอบ: หน้าจอจริงใน browser ด้วยบัญชี Admin (ไม่มี session/browser).

⚠️ ต้องทดสอบโดยคุณ:
1. Login Admin → ลูกค้า → เพิ่มลูกค้า (เมนูข้าง): เลือกกลุ่ม PHA ต้องได้เลขรัน 0001 อัตโนมัติและรหัสเต็ม PHA-0001; แก้เลขได้.
2. กรอกช่องดาวแดงครบ (ติดต่อ 6 ช่อง, ภาษี 13 หลัก, ที่อยู่ออกบิล), เลือกเครดิต/วันเริ่มนับ, รอบวางบิลลองพิมพ์เอง, เพิ่มที่อยู่จัดส่ง 2 แห่งและเลือกเริ่มต้น, แนบภาพหรือ PDF → บันทึก: ต้องขึ้นสำเร็จพร้อมรหัสและพาไปหน้าลูกค้า.
3. หน้าแสดงต้องเห็นข้อมูลครบทุกหมวด เปิดไฟล์แนบได้.
4. หน้ารายชื่อลูกค้าต้องเห็นแถวใหม่ 7 คอลัมน์; ค้นหา/กรองเขต/จังหวัด/เรียง/เปลี่ยนจำนวนต่อหน้าได้; คลิกแถวเปิดหน้าแสดง.
5. ลองเว้นช่องบังคับหรือเลขภาษีไม่ครบ ต้องขึ้นข้อความและไม่บันทึก; ลองบันทึกเลขรันซ้ำต้องขึ้นว่ารหัสซ้ำ.
6. บัญชี Sales ต้องดูรายการ/หน้าแสดงได้แต่เข้าเพิ่มไม่ได้.
