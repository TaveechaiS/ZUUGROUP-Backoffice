# สัญญาข้อมูล API — ZUUGROUP

**TASK-094:** [สัญญาอ่านหน้าสินค้าและคลัง](STOCK-SCREEN-API-GUIDE.md) — GET `/api/inventory?view=products` สรุปต่อสินค้า และ `view=lots` สรุปต่อLot ID พร้อมตัวกรอง/paginationและสูตรเตือนMAIN.

## TASK-092 — เขต / รับเข้า / Orders

อ่าน [คู่มือ API และ workflow ใหม่](LINKED-OPERATIONS-GUIDE.md). Orders ใช้ line items, จอง FEFO และคำสั่งตามบทบาทแทน CRUD หัวเอกสารเก่า; เพิ่ม `/api/inventory`. ลูกค้าใช้ `category` เป็นกลุ่มลูกค้าและต้องเลือกเขตเมื่อสร้างใหม่. ตาราง/ข้อมูลกลุ่มเก่ายังเก็บไว้ แต่หน้ากลุ่มแยกเลิกใช้.

## มาตรฐานชื่อ Field ตามเจ้าของ 2026-10-02

ชื่อ field ใน types/client/form ต้องตรงกับ API response จริง เช่น product.name ให้ใช้อ้างอิงเป็น product.name ไม่ map เป็น field ชื่อใหม่เอง ชื่อ label ภาษาไทยบน UI แยกจาก key ข้อมูล การเปลี่ยน contract ต้องตกลงก่อนและปรับทุกผู้เรียกให้ตรงกัน TASK-075 ปรับ response/types/ผู้เรียกแล้วตาม docs/specs/2026-10-02-api-field-names.md ไม่เปลี่ยน DB

TASK-074 อนุมัติ 2026-10-02: รวม API ตาม resource และ Method; เปลี่ยนเส้นประกอบเป็น query view/include คง DB/สิทธิ์/กฎธุรกิจและชื่อข้อมูลรายการเดิม

## จุดแก้โค้ด

| ส่วน | ไฟล์ |
|---|---|
| รูปแบบกลางและ pagination | src/types/api.ts |
| Records 14 กลุ่ม/ฟิลด์/response | src/types/api/records.ts |
| สินค้า/ข้อมูลแม่/ข้อมูลสินค้าสาธารณะ | src/types/api/products.ts |
| ผู้ใช้/คำสั่งจัดการ/Role types | src/types/api/users.ts |
| Login request/response | src/types/api/auth.ts |
| Audit response | src/types/api/audit.ts |
| Dashboard/Report types | src/types/api/reports.ts |
| Runtime validation | src/server/validation/*.ts |
| HTTP entry point | src/app/api/**/route.ts |
| ตาราง/ฟิลด์ที่ API records ใช้ | src/features/records/modules.json |

types เป็นคำอธิบายข้อมูลสำหรับ TypeScript ไม่ตรวจ JSON ขณะรันและไม่มี endpoint function ส่วน validators ตรวจค่าขณะรันและไม่มี DB/HTTP/secret; การตรวจว่า ID มีจริง, ข้อมูลซ้ำ, สิทธิ์, transaction และ last Admin guard ยังอยู่ใน server เดิม แต่ละ page ยังมี JSX/ข้อความ/state/query/API functions ของตัวเอง

## กลุ่ม Endpoint และสิทธิ์ปัจจุบัน

| กลุ่ม | Method / URL | สิทธิ์ | Response สำเร็จ |
|---|---|---|---|
| Catalog | GET /api, GET /api/public | สาธารณะ | รายการเส้นทาง/metadata |
| Records 14โมดูล | GET /api/{module} และ /{id} | ปกติสาธารณะ; deleted=true ต้อง Admin | list {data,pagination}; detail {data} |
| ตัวกรอง/ตัวเลือก/config | GET /api/{module}?view=filters หรือ options หรือ config | สิทธิ์เดิม; config.canWrite เป็น true เฉพาะ Admin; deleted=true ต้อง Admin | view filters/config {data}; options {data,pagination} |
| เขียน Records | POST /api/{module}; PATCH/DELETE /api/{module}/{id} | Admin และ same-origin | create201 {data}; update/delete/restore200 {data} |
| สินค้า | GET /api/products และ /{id} | ผู้ใช้ active; รายการลบ/รายละเอียดที่ลบต้อง Admin | {products,pagination}; detail {product} |
| เขียนสินค้า | POST /api/products; PATCH/DELETE /api/products/{id} | Admin | create201 {product}; update/delete/restore200 {product} |
| ตัวกรองสินค้า | GET /api/products?view=filters | ผู้ใช้ active | {categories:[{id,name}]} |
| ข้อมูลแม่สินค้า | GET/POST /api/products/masters | อ่านผู้ใช้ active; เขียน Admin | GET {categories,dosageForms,drugs,warehouses}; POST201 {item} |
| เลขลำดับ | GET /api/products/next-sequence | ผู้ใช้ active | {sequence} |
| สินค้า/ข้อมูลแม่สาธารณะ | GET /api/public/products, /{id}, /masters; /api/public/masters/{type}, /{type}/{id} | allowlist เดิม | {data,pagination}; detail {data}; masters pagination แยกกลุ่ม |
| คลัง | GET /api/warehouses หรือ ?view=options และ /{id} | สาธารณะตามเดิม | {data,pagination}; detail {data} |
| ผู้ใช้ | GET /api/users และ /{id} | Admin | {users,pagination}; detail {user} |
| เขียนผู้ใช้ | POST /api/users; PATCH/DELETE /api/users/{id} | Admin พร้อม last Admin/self guards | create201 {ok:true,employeeCode}; mutation200 {ok:true} |
| ส่งออกผู้ใช้ | GET /api/users/export | Admin | text/csv ตามตัวกรองทั้งหมด |
| Login | POST /api/auth/login | ไม่ต้องมี token ก่อน Login | {ok:true,user,accessToken,tokenType,expiresIn} |
| Audit | GET /api/audit-logs หรือ ?view=filters | Admin | {rows,pagination}; filters {actions} |
| Dashboard | GET /api/dashboard | สาธารณะตามเดิม | {data} |
| Reports | GET /api/reports/{sales,inventory,finance} หรือ ?view=filters/config | อ่านตามเดิม; รายการไม่รวม deleted=true | {data,pagination}; view {data}; ไม่มี mutation |

module ทั้ง14: customers, customer-groups, sales-territories, customer-documents, customer-follow-ups, suppliers, expenses, purchases, quotes, orders, billing, promotions, stock-counts, settings

การเขียนยังตรวจ same-origin ตาม handler; Postman ส่ง Bearer adminToken ใน header ส่วนผู้ใช้/product/audit ที่ต้อง Auth ใช้ session cookie หรือ Bearer token ตามปัจจุบัน ไม่ได้เปลี่ยนทุก GET ให้เป็นสาธารณะ


## ข้อมูลประกอบ TASK-074

- GET collection เพิ่ม include=filters,options,config ได้เฉพาะค่าที่โมดูลรองรับ records รองรับ3ค่า, reports รองรับfilters/config, products/audit รองรับfilters, warehouses รองรับoptions, users ไม่มี metadata ในรอบนี้
- ไม่ส่ง include ได้ response เดิม เมื่อขอ include จะเพิ่ม filters/config (ค่าข้างใน data ของ response เดิม) และ options (object มี data/pagination ของตัวเอง)
- ตัวอย่าง records: {data:[],pagination:{...},filters:{status,category,province,owner,...ชื่อฟิลด์จริงของโมดูล},config:{...canWrite,metrics},options:{data:[],pagination:{...}}; products.filters={categories}, audit.filters={actions}
- options ที่ขอพร้อม records list ใช้ id/code/name จากหน้ารายการเดียวกันและ pagination เดียวกัน ไม่อ่านรายการซ้ำ; view=options ค้นหา/แบ่งหน้าแยกได้ผ่าน search/offset/limit
- view=filters/config/options ส่ง response ของเส้นเดิมโดยไม่โหลด list ไม่ใช้ include ซ้อน view; ค่าที่ไม่รองรับ/ค่าว่าง/ซ้ำตอบ400
- filters อ่านจาก DB ตามขอบเขตเดิม ไม่ได้ derive จาก10แถวในหน้าปัจจุบัน
- หน้า records/reports ขอ filters/config พร้อม list ครั้งแรกหรือเมื่อ reload หลัง mutation หน้าถัดไปไม่ขอ metadata ซ้ำ สินค้า/Audit ทำเหมือนกันสำหรับfilters
- ถอน routes ประกอบ filters/options/config/restore จำนวน65ไฟล์แล้ว เส้นเดิมใช้งานไม่ได้ ต้อง Import Postman รุ่นใหม่ Auth/export/masters/next-sequence/public allowlists คงเดิม

## Pagination และ Query

- ค่าเริ่มต้นรายการคือ limit=10/offset=0, limit สูงสุด50, offset สูงสุด100000
- OffsetPagination: {offset,limit,total,hasMore} — records/public/reports/warehouse options
- Pagination: {offset,limit,total,page,pageSize,totalPages} — users/products/audit; totalPages ต่ำสุด1
- Records query: search/status/deleted และชื่อฟิลด์จริงตาม display เช่น category/province/owner/documentType/description และฟิลด์ relation ID ของโมดูล; search/filter strings ยาวไม่เกิน200
- Products query: search/status/categoryId/deleted/offset/limit; status ACTIVE/INACTIVE, categoryId UUID, searchไม่เกิน160
- Public products query: search/categoryId/dosageFormId/offset/limit; searchไม่เกิน160 code points, UUID สำหรับตัวกรอง IDs
- Users query: search/role/status/deleted/offset/limit; status ACTIVE/SUSPENDED, Role ID ตาม4Roleปัจจุบัน
- Audit query: q/action/offset/limit; q/actionไม่เกิน100, actionรับอักษรตัวเลขและ _ . : -
- Inventory report query: search/category.name/dosageForm.name/offset/limit; searchไม่เกิน200, อิงสินค้าสถานะACTIVEที่ไม่ลบ
- Warehouse options: search/offset/limit; searchไม่เกิน200

การย้าย validators คงวิธีแปลงค่าเดิม: public query ถือ limit/offset ว่างเป็นdefault; authenticated pagination ปฏิเสธค่าว่าง; warehouse options ใช้ Number จึง offset ว่างเป็น0 ยังไม่รวมกฎเหล่านี้ให้เปลี่ยน behavior

## Body และ Validation

### Records

POST ส่งฟิลด์ตาม modules.json; required มี code/name/status รวมฟิลด์บังคับของโมดูลนั้น PATCH ส่งเฉพาะฟิลด์ที่แก้ไขได้ ยอมรับ expectedUpdatedAt เป็น timestamp เพื่อตรวจคำขอพร้อมกัน ฟิลด์ไม่รู้จักถูกปฏิเสธ

- text ไม่เกิน500, textareaไม่เกิน4000 ตาม UTF-16 length เดิม
- number รับจำนวนไม่ติดลบไม่เกิน12หลักและทศนิยม2หลัก; ค่าว่างเป็นnull
- relation รับ UUID; ค่าว่างเป็นnull; serverตรวจว่าแถวอ้างอิงยังใช้งานได้
- fileUrl รับ http/https
- DELETE body {reason}; PATCH กู้คืน body {action:"restore",reason}; reasonไม่บังคับและไม่เกิน1000 คำสั่งลบ/กู้คืนไม่รับฟิลด์แก้ไขปะปน
- expectedUpdatedAt ว่างหรือ parse ไม่ได้ถูกปฏิเสธ; เวลาไม่ตรงแถวปัจจุบันตอบ409

### Products

สร้าง: name/categoryId/dosageFormId/drugId/defaultWarehouseId/unit/salePrice/status และ sequenceถ้าต้องการกำหนดก่อนบันทึก

- nameไม่เกิน160 code points, unitไม่เกิน80, ทุก ID เป็นUUID
- salePrice ตั้งแต่0ถึง9999999999.99 ทศนิยมไม่เกิน2 ไม่รับรูปแบบ exponent
- status ACTIVE/INACTIVE; sequenceเป็นstring4หลัก0001–9999 ถ้าไม่ส่ง/ว่าง/null ให้รันอัตโนมัติ
- PATCH action=update ส่งข้อมูลสินค้าเดิมครบ ยังคงหมวดและรูปแบบยาที่ใช้สร้างรหัส
- DELETE body {reason}; PATCH action=restore ส่ง reason บังคับไม่เกิน500 code points ไม่รับฟิลด์แก้ไขปะปน PATCH action=delete ตอบ400
- ข้อมูลแม่: type drug/category/dosageForm, nameบังคับ; category/dosageFormใช้code2–3หลัก A-Z/0-9 และแปลงเป็นตัวใหญ่

### Users และ Login

- POST users: name/email/password/roleId, teamไม่บังคับ; สร้างemployeeCodeอัตโนมัติ ไม่รับรหัสจากฟอร์มสร้างมาใช้
- Password สร้าง/ตั้งใหม่ขั้นต่ำ8 code points; Role ADMIN/SALES/MANAGER/ACCOUNTING_CFO
- PATCH users action role/status/password/profile/restore; DELETE body {reason} ลบเชิงตรรกะ โดย profileใช้employeeCode/name/email/team; reasonลบ/กู้บังคับไม่เกิน500 code points
- employeeCodeหลังแก้ต้องไม่เกิน40 code points ห้ามcreate, . , .. และ / \\ ? #/control characters
- Loginรับemail/passwordเป็นstring; signInตรวจค่าว่างและบัญชีจริง ไม่ได้นำกฎสร้างpasswordไปใช้ปฏิเสธการล็อกอิน

## Error response

คงรูปแบบเดิม: records/reports/warehouse/dashboardใช้ {error:{message}}; users/products/public/auth/auditใช้ {error:string} ตาม handler

400 validation, 401ต้องเข้าสู่ระบบ, 403ไม่มีสิทธิ์/คำขอorigin, 404ไม่พบ, 409ข้อมูลซ้ำ/สถานะเปลี่ยน/concurrency/last Admin, 500/502/503ตามความล้มเหลวของhandler, loginอาจ429 กรณีเรียกถี่ ไม่เพิ่ม status หรือerror envelopeใหม่เพื่อจัดโครงสร้าง

TASK-074 ตรวจ shape ของ PATCH/DELETE ให้ object เท่านั้น null/array ตอบ400 และคำสั่ง delete/restore มี allowlist reason/action ป้องกันทิ้งฟิลด์แก้ไขโดยเงียบ ส่วน POST/คำสั่ง update เดิมไม่ได้เพิ่ม strict field allowlist ให้ users/products กรณี malformed JSON ของ handler ที่ยังตอบ generic failure คงไว้ การทำให้ทุก endpoint ใช้400สม่ำเสมอเป็นงานแยก

## Postman และการตรวจ

Collection local v2.1 ใช้ URL/query/Method ใหม่ตาม TASK-074และ Environmentส่วนตัวสำหรับpassword/token ชุด authenticatedเพิ่มตัวอย่างคำสั่งสินค้า/ผู้ใช้ตามactionเดิม รูปแบบresponseตัวอย่างที่ไม่มีรายการเป็นเอกสารออฟไลน์ ไม่สร้างข้อมูลในDB

กลุ่ม Supabase Data API ที่ไม่ได้ใช้ถอนจาก Collection ตามคำสั่งเจ้าของแล้ว ไม่เปลี่ยน grant/RLS/DB ของ Supabase Collection ปัจจุบันรวม157app requests (133+24) ส่วน secret/password/tokenต้องไม่ฝังในCollection

ตรวจออฟไลน์: node scripts/test-api-contracts.mjs, node scripts/test-pagination.mjs, node scripts/test-route-pages.mjs, node scripts/test-resource-api.mjs, npm run type-check/lint/build ไม่มีHTTP/login/DB

## ⚠️ ต้องทดสอบโดยคุณ

Import Collection local แล้ว GET รายการlimit10/offset0 และoffset10 ควรได้ข้อมูล/จำนวนตามรูปแบบเดิม เปิดหน้ารายการ/เพิ่ม/แก้ไขในเว็บ ควรแสดงrequiredและยืนยันเหมือนเดิม ถ้าจะลองPOST/PATCHให้ใช้รายการที่ยอมให้เปลี่ยน เพราะคำขอบันทึกDBจริง

## รายการเส้นทางจากโค้ด

| Method | URL | ไฟล์ |
|---|---|---|
| GET | `/api/audit-logs` | `src/app/api/audit-logs/route.ts` |
| POST | `/api/auth/login` | `src/app/api/auth/login/route.ts` |
| GET | `/api/billing/{id}` | `src/app/api/billing/[id]/route.ts` |
| PATCH | `/api/billing/{id}` | `src/app/api/billing/[id]/route.ts` |
| DELETE | `/api/billing/{id}` | `src/app/api/billing/[id]/route.ts` |
| GET | `/api/billing` | `src/app/api/billing/route.ts` |
| POST | `/api/billing` | `src/app/api/billing/route.ts` |
| GET | `/api/customer-documents/{id}` | `src/app/api/customer-documents/[id]/route.ts` |
| PATCH | `/api/customer-documents/{id}` | `src/app/api/customer-documents/[id]/route.ts` |
| DELETE | `/api/customer-documents/{id}` | `src/app/api/customer-documents/[id]/route.ts` |
| GET | `/api/customer-documents` | `src/app/api/customer-documents/route.ts` |
| POST | `/api/customer-documents` | `src/app/api/customer-documents/route.ts` |
| GET | `/api/customer-follow-ups/{id}` | `src/app/api/customer-follow-ups/[id]/route.ts` |
| PATCH | `/api/customer-follow-ups/{id}` | `src/app/api/customer-follow-ups/[id]/route.ts` |
| DELETE | `/api/customer-follow-ups/{id}` | `src/app/api/customer-follow-ups/[id]/route.ts` |
| GET | `/api/customer-follow-ups` | `src/app/api/customer-follow-ups/route.ts` |
| POST | `/api/customer-follow-ups` | `src/app/api/customer-follow-ups/route.ts` |
| GET | `/api/customer-groups/{id}` | `src/app/api/customer-groups/[id]/route.ts` |
| PATCH | `/api/customer-groups/{id}` | `src/app/api/customer-groups/[id]/route.ts` |
| DELETE | `/api/customer-groups/{id}` | `src/app/api/customer-groups/[id]/route.ts` |
| GET | `/api/customer-groups` | `src/app/api/customer-groups/route.ts` |
| POST | `/api/customer-groups` | `src/app/api/customer-groups/route.ts` |
| GET | `/api/customers/{id}` | `src/app/api/customers/[id]/route.ts` |
| PATCH | `/api/customers/{id}` | `src/app/api/customers/[id]/route.ts` |
| DELETE | `/api/customers/{id}` | `src/app/api/customers/[id]/route.ts` |
| GET | `/api/customers` | `src/app/api/customers/route.ts` |
| POST | `/api/customers` | `src/app/api/customers/route.ts` |
| GET | `/api/dashboard` | `src/app/api/dashboard/route.ts` |
| GET | `/api/expenses/{id}` | `src/app/api/expenses/[id]/route.ts` |
| PATCH | `/api/expenses/{id}` | `src/app/api/expenses/[id]/route.ts` |
| DELETE | `/api/expenses/{id}` | `src/app/api/expenses/[id]/route.ts` |
| GET | `/api/expenses` | `src/app/api/expenses/route.ts` |
| POST | `/api/expenses` | `src/app/api/expenses/route.ts` |
| GET | `/api/orders/{id}` | `src/app/api/orders/[id]/route.ts` |
| PATCH | `/api/orders/{id}` | `src/app/api/orders/[id]/route.ts` |
| DELETE | `/api/orders/{id}` | `src/app/api/orders/[id]/route.ts` |
| GET | `/api/orders` | `src/app/api/orders/route.ts` |
| POST | `/api/orders` | `src/app/api/orders/route.ts` |
| PATCH | `/api/products/{id}` | `src/app/api/products/[id]/route.ts` |
| DELETE | `/api/products/{id}` | `src/app/api/products/[id]/route.ts` |
| GET | `/api/products/{id}` | `src/app/api/products/[id]/route.ts` |
| GET | `/api/products/masters` | `src/app/api/products/masters/route.ts` |
| POST | `/api/products/masters` | `src/app/api/products/masters/route.ts` |
| GET | `/api/products/next-sequence` | `src/app/api/products/next-sequence/route.ts` |
| GET | `/api/products` | `src/app/api/products/route.ts` |
| POST | `/api/products` | `src/app/api/products/route.ts` |
| GET | `/api/promotions/{id}` | `src/app/api/promotions/[id]/route.ts` |
| PATCH | `/api/promotions/{id}` | `src/app/api/promotions/[id]/route.ts` |
| DELETE | `/api/promotions/{id}` | `src/app/api/promotions/[id]/route.ts` |
| GET | `/api/promotions` | `src/app/api/promotions/route.ts` |
| POST | `/api/promotions` | `src/app/api/promotions/route.ts` |
| GET | `/api/public/masters/{type}/{id}` | `src/app/api/public/masters/[type]/[id]/route.ts` |
| GET | `/api/public/masters/{type}` | `src/app/api/public/masters/[type]/route.ts` |
| GET | `/api/public/products/{id}` | `src/app/api/public/products/[id]/route.ts` |
| GET | `/api/public/products/masters` | `src/app/api/public/products/masters/route.ts` |
| GET | `/api/public/products` | `src/app/api/public/products/route.ts` |
| GET | `/api/public` | `src/app/api/public/route.ts` |
| GET | `/api/purchases/{id}` | `src/app/api/purchases/[id]/route.ts` |
| PATCH | `/api/purchases/{id}` | `src/app/api/purchases/[id]/route.ts` |
| DELETE | `/api/purchases/{id}` | `src/app/api/purchases/[id]/route.ts` |
| GET | `/api/purchases` | `src/app/api/purchases/route.ts` |
| POST | `/api/purchases` | `src/app/api/purchases/route.ts` |
| GET | `/api/quotes/{id}` | `src/app/api/quotes/[id]/route.ts` |
| PATCH | `/api/quotes/{id}` | `src/app/api/quotes/[id]/route.ts` |
| DELETE | `/api/quotes/{id}` | `src/app/api/quotes/[id]/route.ts` |
| GET | `/api/quotes` | `src/app/api/quotes/route.ts` |
| POST | `/api/quotes` | `src/app/api/quotes/route.ts` |
| GET | `/api/reports/finance` | `src/app/api/reports/finance/route.ts` |
| GET | `/api/reports/inventory` | `src/app/api/reports/inventory/route.ts` |
| GET | `/api/reports/sales` | `src/app/api/reports/sales/route.ts` |
| GET | `/api` | `src/app/api/route.ts` |
| GET | `/api/sales-territories/{id}` | `src/app/api/sales-territories/[id]/route.ts` |
| PATCH | `/api/sales-territories/{id}` | `src/app/api/sales-territories/[id]/route.ts` |
| DELETE | `/api/sales-territories/{id}` | `src/app/api/sales-territories/[id]/route.ts` |
| GET | `/api/sales-territories` | `src/app/api/sales-territories/route.ts` |
| POST | `/api/sales-territories` | `src/app/api/sales-territories/route.ts` |
| GET | `/api/settings/{id}` | `src/app/api/settings/[id]/route.ts` |
| PATCH | `/api/settings/{id}` | `src/app/api/settings/[id]/route.ts` |
| DELETE | `/api/settings/{id}` | `src/app/api/settings/[id]/route.ts` |
| GET | `/api/settings` | `src/app/api/settings/route.ts` |
| POST | `/api/settings` | `src/app/api/settings/route.ts` |
| GET | `/api/stock-counts/{id}` | `src/app/api/stock-counts/[id]/route.ts` |
| PATCH | `/api/stock-counts/{id}` | `src/app/api/stock-counts/[id]/route.ts` |
| DELETE | `/api/stock-counts/{id}` | `src/app/api/stock-counts/[id]/route.ts` |
| GET | `/api/stock-counts` | `src/app/api/stock-counts/route.ts` |
| POST | `/api/stock-counts` | `src/app/api/stock-counts/route.ts` |
| GET | `/api/suppliers/{id}` | `src/app/api/suppliers/[id]/route.ts` |
| PATCH | `/api/suppliers/{id}` | `src/app/api/suppliers/[id]/route.ts` |
| DELETE | `/api/suppliers/{id}` | `src/app/api/suppliers/[id]/route.ts` |
| GET | `/api/suppliers` | `src/app/api/suppliers/route.ts` |
| POST | `/api/suppliers` | `src/app/api/suppliers/route.ts` |
| PATCH | `/api/users/{id}` | `src/app/api/users/[id]/route.ts` |
| DELETE | `/api/users/{id}` | `src/app/api/users/[id]/route.ts` |
| GET | `/api/users/{id}` | `src/app/api/users/[id]/route.ts` |
| GET | `/api/users/export` | `src/app/api/users/export/route.ts` |
| GET | `/api/users` | `src/app/api/users/route.ts` |
| POST | `/api/users` | `src/app/api/users/route.ts` |
| GET | `/api/warehouses/{id}` | `src/app/api/warehouses/[id]/route.ts` |
| GET | `/api/warehouses` | `src/app/api/warehouses/route.ts` |

ติดตาม TASK-074: ลบ requests filters/config แยกและ combined examples ซ้ำ รวมmetadataในlist เก็บ view options ที่ฟอร์มใช้ Collections133+24 ไม่มีCloudsync


## ชื่อฟิลด์ TASK-075

Records list/detail/write ส่ง code/name และฟิลด์ของโมดูลใน data โดยตรง ไม่มี ref/title/subtitle หรือ fields wrapper; memberCount เป็นตัวเลขคำนวณเฉพาะกลุ่มลูกค้า/เขตขาย ส่วน settings.value เป็นฟิลด์จริงจึงคงไว้

สินค้าใช้ category.name/category.code, dosageForm.name/dosageForm.code, drug.name, defaultWarehouse.name; public เก็บ relation เฉพาะ name ตาม allowlist เดิม ผู้ใช้ใช้ userRole.roleId/userRole.role.name, lastLoginAt, deletedByUser.name/employeeCode Audit ใช้ actor.name/employeeCode และ target.name/employeeCode วันที่ทั้งหมดเป็น ISO และจัดรูปแบบที่ UI/CSV

Filters key ตรงกับ query field เช่น /api/customers?category=...&province=... ส่วน inventory ใช้ category.name/dosageForm.name รูปแบบ endpoint/method/include/view/limit=10 เดิม
