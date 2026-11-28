# Postman — Zuugroup

## ล่าสุด TASK-233 — 6 ตุลาคม 2569

Zuugroup local/Cloud Collection ID เดิมมี 47 คำขอใน 4 โฟลเดอร์หลัก: auth, products, stock และเขตขาย (Sales Territories). เพิ่มเขตขาย 4 คำขอพร้อมตัวอย่างและ tests แล้ว; จำนวน 115/133 ในหัวข้อเก่าด้านล่างเป็นประวัติรอบก่อน. Login Admin ใน Environment ส่วนตัว แล้ว POST เขตด้วย name/notes; ผลสำเร็จเก็บ territoryId สำหรับ GET รายละเอียดอัตโนมัติ. Refresh Postman เพื่อเห็นโฟลเดอร์ใหม่.

## ปัจจุบัน TASK-117 — 5 ตุลาคม 2569

Collection [Zuugroup](Zuugroup.postman_collection.json) เหลือ **115 คำขอ / 21 โฟลเดอร์** ทั้งไฟล์ local และ Cloud ID เดิม. ลบ customer-groups แยกเดิม 8, billing 8 และ orders deleted/restore เดิม 2. กลุ่มลูกค้าใช้ช่อง customer.category; การชำระในเอกสารขายยังพักตามเจ้าของ; workflow คำสั่งซื้อใช้ยกเลิก/ส่งกลับแก้ไขแทนกู้คืนแบบเดิม. Backend/DB ไม่ถูกแก้ในงานนี้. เอกสารลูกค้ายังเก็บสำหรับรายละเอียดด้านใน และชุด authenticated 24 คำขอคงเดิม.

สำรองก่อนแก้ไว้ local-backups/TASK-117-cloud-before.json และ TASK-117-local-before.json ที่ไม่เข้า Git. Refresh Postman ควรไม่เห็น customer-groups/billing และ orders deleted/restore เดิม. หัวข้อถัดไปบันทึกการปรับรอบก่อน; จำนวน 133/23 เป็นค่าเก่า.

## Collection ปัจจุบัน

- [Zuugroup](Zuugroup.postman_collection.json): 133คำขอ ใน23กลุ่ม ข้อมูลสาธารณะ/โมดูล/รายงาน/CRUD และ Login4Role
- [Zuugroup-authenticated](Zuugroup-authenticated.postman_collection.json): 24คำขอ ใน4กลุ่ม เข้าสู่ระบบ/สินค้า/ผู้ใช้งาน/ประวัติ สำหรับเส้นที่ต้องมีสิทธิ์
- คง collection IDs เดิม ลบ44คำขอที่ซ้ำหรือไม่ได้ใช้ รวมถึง Supabase Data API5คำขอ ไม่มี Cloud sync; ต้อง Import ไฟล์ใหม่และเลือก Replace/อัปเดต Collection เดิม

## เริ่มใช้งาน

1. รัน npm run dev ตั้ง baseUrl เป็น http://localhost:5000 หรือ URL เว็บที่ Deploy แล้ว
2. GET list ของ records/reports มี include=filters,config; products/audit มี include=filters ขอ metadata พร้อมรายการ ไม่ต้องมี request filters/config แยก หากต้องการเฉพาะรายการให้เอา include ออก
3. limit=10/offset=0; หน้าถัดไป offset=10 สูงสุด50รายการต่อหน้า ค่าตัวกรองอ่านจาก DB ไม่จำกัด10แถว
4. options ยังเก็บเพราะฟอร์มค้นหาตัวเลือกผ่าน view=options/search/limit/offset โดยไม่โหลด list พร้อม config
5. API public อ่านได้ตาม allowlist เดิม protected GET และ mutation ยังต้องมี session/token ตาม Role ตั้งรหัส/token ใน Environment ส่วนตัวแล้วเลือก Login Role ที่ต้องการ ไม่มีรหัส/tokenจริงในCollection
6. เขียนใช้ POST เพิ่ม PATCH แก้/สถานะ/role/password/profile DELETE ลบเชิงตรรกะ PATCH body action=restore กู้คืน ตั้ง ID/ข้อมูล/เหตุผลใน Variables ก่อนส่ง ข้อมูลที่บันทึกจะลง DB จริง

เก็บคำขอ public กับ protected ของสินค้าแยกเพราะข้อมูลและสิทธิ์ต่างกัน Login4Role เป็นตัวอย่างคนละบัญชี เก็บตามเดิม คำขอเพิ่ม/ลบ/กู้คืนไม่ถือเป็นรายการซ้ำแม้ path เดียวกัน

รายละเอียด method/query/body/response/auth: [API-CONTRACTS](../docs/API-CONTRACTS.md) และ [ชื่อ API ไทย/อังกฤษ](../docs/API-NAME-GUIDE.md)

## ⚠️ ต้องทดสอบโดยคุณ

Import ไฟล์ใหม่แบบ Replace ควรเหลือ133และ24คำขอ ไม่มีโฟลเดอร์ Supabase Data API หรือ request filters/config แยก เปิด list ต้องเห็น include ใน Params และ options ต้องเห็น view=options; รอบนี้ตรวจ JSON/contract ออฟไลน์เท่านั้น ไม่ส่งคำขอ HTTP/login/DB

## อัปเดต Workspace ตามภาพเจ้าของ 2026-10-02

Collection Cloud Zuugroup เดิมอัปเดตเป็น133คำขอและตรวจอ่านกลับแล้ว คงID/auth/variables/scripts เติม_postman_idในไฟล์localเดิม Refresh Postmanเพื่อเห็นfilters/configแยกหายและrestoreเป็นPATCH ชุดAuthenticated24คำขอยังคงเป็นไฟล์localในรอบนี้ ไม่ได้สร้างCollectionใหม่ในCloud ไม่Sendเว็บ/DB


## ชื่อฟิลด์ API (TASK-075)

ใช้ชื่อข้อมูลต้นทางโดยตรง: records code/name และฟิลด์ของโมดูล สินค้า category.name/dosageForm.name/drug.name/defaultWarehouse.name ผู้ใช้ lastLoginAt/userRole/deletedByUser และ Audit actor/target รายละเอียด [API Contracts](../docs/API-CONTRACTS.md) วันที่ใน JSON เป็น ISO; เว็บแสดง พ.ศ.

## TASK-233 — เขตขายพร้อมทดลองเพิ่ม (6 ตุลาคม 2569)

เพิ่มโฟลเดอร์ เขตขาย (Sales Territories) ในZuugroup localและCloudCollectionเดิม 4คำขอ: GETรายการ, POSTเพิ่ม, GETรายละเอียดUUID, GETตัวเลือก. ทุกคำขอมีBearer/{{accessToken}}/ตัวอย่างresponseและtest. LoginบัญชีAdminในEnvironmentส่วนตัวก่อน POST แล้วแก้name/notesในBodyและSend; serverสร้างid UUID ไม่ส่งcode/status. POSTสำเร็จเก็บterritoryIdในEnvironmentอัตโนมัติให้GETรายละเอียด. ไม่มีtokenจริงในไฟล์. คำขอเก่าเก็บครบ ไม่สร้างCollectionใหม่.

⚠️ ต้องทดสอบโดยคุณ: Refresh Postmanเปิดโฟลเดอร์เขตขาย; LoginAdmin → POSTเพิ่มด้วยname/notes → ควร201และdata.id → GETรายละเอียดควร200ชื่อ/หมายเหตุตรง → GETรายการควรพบเขตใหม่. ทุกSendPOSTสร้างข้อมูลจริง อย่ารันCollectionทั้งหมดเพื่อทดสอบเฉพาะเขต.

## TASK-262 — ข้อมูลพื้นฐานลูกค้า (6 ตุลาคม 2569)

เพิ่มโฟลเดอร์ ข้อมูลพื้นฐานลูกค้า (Customer Options) 4 คำขอในไฟล์ local: GET ตัวเลือกสำหรับฟอร์ม, GET ตารางตั้งค่า, POST เพิ่ม, PATCH แก้/เปิดปิด. สร้างด้วย `node scripts/build-postman-customers.mjs` (รันซ้ำได้ ID คำขอคงเดิม). POST เก็บ customerOptionId/customerOptionVersion ให้ PATCH ใช้ต่อ. Postman Cloud ยังไม่ sync เพราะ session นี้ไม่มีเครื่องมือ Postman — Import ไฟล์แบบ Replace หรือ sync ภายหลัง. สำรองก่อนแก้ local-backups/TASK-262-postman-before.json.

## TASK-263 — ลูกค้า (7 ตุลาคม 2569)

เพิ่มโฟลเดอร์ ลูกค้า (Customers) 9 คำขอในไฟล์ local ด้วย `node scripts/build-postman-customers.mjs`. ลำดับทดลองเพิ่ม: Login Admin → ข้อมูลพื้นฐานลูกค้า/GET ตัวเลือก (เก็บ customerCodeGroupId/customerCreditTermId/customerDocumentTypeId) → ลูกค้า/POST 1) เริ่มคำขอ (สร้าง customerRequestId อัตโนมัติ) → POST 3) บันทึก (เก็บ customerId) → GET รายละเอียด. ขั้น 2) อัปโหลดไฟล์ใช้เมื่อประกาศ files ในขั้น 1 เท่านั้น. ทุก POST เขียน DB จริง. Cloud ยังไม่ sync (session ไม่มีเครื่องมือ Postman) — Import ไฟล์แบบ Replace.
