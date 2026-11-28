# TASK-074 — รวม API ตามโมดูล

- สถานะ: READY_FOR_USER_TEST เจ้าของอนุมัติเอกสารและ Task 2026-10-02
- Branch: AI
- Specs: docs/specs/2026-10-02-resource-api.md
- Plan: docs/plans/2026-10-02-resource-api-plan.md

เจ้าของตอบ “ok” กับแนวทางรวม resource ตรวจตัวอย่าง orders/products/users และ consumer แล้ว จัดข้อเสนอรวม filters/options/config ด้วย include/view, DELETE ลบเชิงตรรกะ, PATCH กู้คืน/เปลี่ยนสถานะ คง response/pagination/สิทธิ์/DBเดิม เส้นเฉพาะ Auth/export/masters/next-sequence คงเดิม

ขอบเขตหลังอนุมัติ: routes/handlers/services/validators/types/client pages/catalog/Postman local/docs/offline tests ตามแผนย่อย ไม่คืน generic whole-page components ไม่ยิง live HTTP/DB ไม่ sync Cloud/Deploy/commit/push

⚠️ ต้องทดสอบโดยคุณหลัง implementation: ตามแผนย่อย รอบเอกสารนี้ยังไม่เปลี่ยนพฤติกรรมเว็บ


## ผล implementation

ทำครบแล้ว: GET collection รองรับ include/view ตามโมดูล; DELETE users/products ใช้ transaction/guardsเดิม; PATCH restore; เพิ่ม GET detail users/products ตามสิทธิ์เดิม; ย้าย18หน้ารายการ+ฟอร์ม/รายละเอียด/Combobox ถอน65routesประกอบ; Postman local167+34คำขอ คง IDsเดิม; contracts/inventory/คู่มือครบ ตรวจ type-check/lint/build/offline contracts196app requests/pagination/59page integrity/resource dispatch+auth+last Admin/diff ผ่าน ไม่เปลี่ยน schema/DB ไม่ยิง live HTTP/login ไม่ syncCloud/Deploy/commit/push รอUAT

เส้นเฉพาะ Auth/export/masters/next-sequence/public allowlists คงเดิม ตัวกรองอ่านข้อมูล DB ตามขอบเขตเดิมไม่ได้จำกัด10แถว options ที่ include กับ list ใช้รายการหน้านั้นและ pagination เดิม ส่วน view options ค้นหาและแบ่งหน้าอิสระได้ ข้อมูลประกอบขอเฉพาะตอนใช้


## ติดตาม Postman 2026-10-02

READY_FOR_USER_TEST ติดตาม Postmanตามคำสั่งเจ้าของ: ลบ44คำขอ เหลือ Zuugroup133/Authenticated24 รวม157app requests; ถอนกลุ่ม Supabase Data API และ filters/configแยก/combined examplesซ้ำ รวมmetadataในlist เก็บoptionsที่ฟอร์มใช้/Login4Role/CRUD จัดกลุ่มAuthenticatedตามโมดูล ถอน2variablesไม่มีผู้ใช้ คงIDsเดิม offline contract157ผ่าน ไม่แก้API/DB ไม่HTTP/Cloudsync/commit/push

⚠️ ต้องทดสอบโดยคุณ: Importไฟล์ใหม่แบบReplace ควรเหลือ133/24คำขอ ไม่มีSupabase Data API/filters/configแยก listมีinclude และoptionsใช้view=options


## ผลแก้ Cloud ตามภาพเจ้าของ

READY_FOR_USER_TEST แก้ Cloud Collection Zuugroup เดิมแล้ว55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903: ลบ34requests อัปเดต46requests อ่านกลับ133คำขอ ไม่มีเส้น filters/config/options/restore เก่า restore14คำขอใช้PATCH action restore คงrequest IDs/auth/variables/scriptsครบ ใช้granular update/deleteหลังbulk connectorปฏิเสธschema ไม่สร้างCollectionใหม่ ไม่SendAPI/DB เติม_postman_idในไฟล์localเดิมเพื่อระบุCollectionตรงกัน

⚠️ ต้องทดสอบโดยคุณ: Refresh Postman/เปิดCollection Zuugroup เดิมใหม่ ต้องไม่เห็นfilters/configแยก และrestoreเป็นPATCH ไม่ต้องImportใหม่หรือSendAPIเพื่อเช็คการจัดรายการ
