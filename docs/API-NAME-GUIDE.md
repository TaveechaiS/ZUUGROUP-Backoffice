# คู่มือชื่อ API — Zuugroup / API Folder Guide

**ปัจจุบัน TASK-117 (5 ตุลาคม 2569):** Zuugroup เหลือ 115 คำขอใน 21 โฟลเดอร์ ทั้ง local/Cloud. ลบโฟลเดอร์ customer-groups (ใช้ customer.category แทน) และ billing (พักตามแผนการชำระในเอกสารขาย) รวม 16 คำขอ; ถอด orders deleted/restore เดิมอีก 2. ตารางด้านล่างเป็นประวัติเดิม รายการที่ถอดไม่อยู่ใน Collection ปัจจุบัน. customer-documents ยังใช้สำหรับรายละเอียดในลูกค้า. ชุด authenticated 24 คำขอคงเดิม. [รายการล่าสุด](../postman/README.md).

**TASK-094:** [ชื่อและหน้าที่ API สินค้า/คลัง/ล็อต](STOCK-SCREEN-API-GUIDE.md) มี view `products` (สรุปสินค้า / Product stock summary) และ `lots` (รายการล็อต / Product lots) สำหรับ5หน้าสินค้าและสต็อก.

**อัปเดต TASK-092:** ดู [ชื่อ API ไทย/อังกฤษและขั้นตอนใช้งานล่าสุด](LINKED-OPERATIONS-GUIDE.md#ชื่อ-api-ไทย--english) สำหรับเขต ทีมขาย ล็อตรับเข้า ยอดคลัง และ Orders. รายละเอียด collection ด้านล่างเป็นประวัติเดิม; หน้ากลุ่มลูกค้าแยกเลิกใช้แล้ว.

คู่มือนี้อธิบาย **ชื่อโฟลเดอร์ใน Postman Collection `Zuugroup`** ตามลำดับที่เห็นในหน้าจอ ไม่ใช่รายชื่อตารางฐานข้อมูลหรือ URL ทั้งหมดของระบบ อ้างอิงไฟล์ [`Zuugroup.postman_collection.json`](../postman/Zuugroup.postman_collection.json) ณ วันที่ 1 ตุลาคม 2569: 23 โฟลเดอร์ รวม 133 คำขอ. `{{baseUrl}}` คือ URL ของเว็บ เช่น `http://localhost:5000`.

## ชื่อโฟลเดอร์: ไทย / English / หน้าที่

| # | ชื่อโฟลเดอร์ใน Postman | ชื่อไทย | English name | ใช้ทำอะไรและ URL ตัวอย่าง |
|---|---|---|---|---|
| 1 | `api` | สารบัญ API | API directory | ดูรายการ API ที่เปิดให้ใช้ (`GET /api/public`), ข้อมูลแม่สินค้ารวม (`GET /api/public/products/masters`) และรายการโมดูล (`GET /api`). เป็นโฟลเดอร์นำทาง ไม่ใช่ข้อมูลธุรกิจอีกชุด. |
| 2 | `products` | สินค้า | Products | ดูรายการสินค้าที่ใช้งานและรายละเอียดสินค้าแบบสาธารณะ: `GET /api/public/products`, `GET /api/public/products/{id}`. โฟลเดอร์นี้ใน Collection หลักมีคำขออ่านเท่านั้น. |
| 3 | `product_categories` | หมวดหมู่สินค้า | Product categories | ดูหมวดที่ใช้จัดกลุ่มสินค้า: `GET /api/public/masters/categories` และ `/{id}`. ชื่อโฟลเดอร์ตรงกับแนวคิดข้อมูลแม่ ไม่ใช่ path `/api/product_categories`. |
| 4 | `dosage_forms` | รูปแบบยา | Dosage forms | ดูรูปแบบยา เช่น รูปแบบที่ใช้กับสินค้า: `GET /api/public/masters/dosage-forms` และ `/{id}`. Path API ใช้ขีดกลาง `dosage-forms`. |
| 5 | `drugs` | ตัวยา | Drugs / active ingredients | ดูรายชื่อตัวยาที่สินค้าอ้างอิง: `GET /api/public/masters/drugs` และ `/{id}`. เป็นข้อมูลแม่ ไม่ใช่รายการสินค้าแต่ละตัว. |
| 6 | `auth` | การเข้าสู่ระบบ | Authentication | `POST /api/auth/login` เพื่อรับ token สำหรับคำขอที่ต้องยืนยันตัวตน. มีตัวอย่างแยก Admin, Manager, Sales และ CFO แต่ใช้ endpoint เดียวกัน. |
| 7 | `customers` | ลูกค้า | Customers | ข้อมูลลูกค้า ประเภท จังหวัด ผู้ดูแล เงื่อนไขชำระเงิน และความสัมพันธ์กับกลุ่ม/เขตขาย: `/api/customers`. |
| 8 | `customer-groups` | กลุ่มลูกค้า | Customer groups | จัดหมวดหรือกลุ่มของลูกค้าเพื่อใช้อ้างอิง: `/api/customer-groups`. |
| 9 | `sales-territories` | เขตและผู้แทนขาย | Sales territories | เก็บชื่อเขต พื้นที่ดูแล และผู้รับผิดชอบงานขาย: `/api/sales-territories`. |
| 10 | `customer-documents` | เอกสารลูกค้า | Customer documents | บันทึกข้อมูลเอกสารที่เกี่ยวกับลูกค้า เช่น ประเภท วันที่ และลิงก์ไฟล์: `/api/customer-documents`. |
| 11 | `customer-follow-ups` | ภาพรวมและงานติดตามลูกค้า | Customer follow-ups | บันทึกข้อมูลภาพรวมลูกค้าและงานที่ต้องติดตาม: `/api/customer-follow-ups`. |
| 12 | `suppliers` | ผู้ขาย | Suppliers | ข้อมูลผู้ขาย ผู้ติดต่อ พื้นที่ และเงื่อนไขชำระเงิน: `/api/suppliers`. |
| 13 | `expenses` | ค่าใช้จ่าย | Expenses | บันทึกหัวรายการค่าใช้จ่าย หมวด รายละเอียด และจำนวนเงิน: `/api/expenses`. |
| 14 | `purchases` | จัดซื้อและรับเข้าสินค้า | Purchases | บันทึกหัวรายการจัดซื้อ ผู้ขาย และรายละเอียดการรับเข้า: `/api/purchases`. การบันทึกนี้ยังไม่ปรับยอดคลังอัตโนมัติ. |
| 15 | `quotes` | ใบเสนอราคา | Quotations | บันทึกหัวใบเสนอราคา ลูกค้า และรายละเอียดที่เกี่ยวข้อง: `/api/quotes`. |
| 16 | `orders` | คำสั่งซื้อและจัดส่ง | Orders | บันทึกหัวคำสั่งซื้อ ลูกค้า และสถานะงานจัดส่ง: `/api/orders`. |
| 17 | `billing` | วางบิลและลูกหนี้ | Billing & receivables | บันทึกหัวรายการวางบิลและข้อความครบกำหนด: `/api/billing`. ยังไม่ใช่ยอดลูกหนี้สุทธิที่คำนวณจากการรับชำระ. |
| 18 | `promotions` | โปรโมชันและของแถม | Promotions | บันทึกชื่อ ประเภท และเงื่อนไขโปรโมชัน: `/api/promotions`. |
| 19 | `stock-counts` | ตรวจนับสินค้า | Stock counts | คีย์ผลการตรวจนับที่ทำ Manual เพื่อเทียบข้อมูล: `/api/stock-counts`. ไม่ปรับยอดสินค้าและไม่สร้าง Ledger อัตโนมัติ. |
| 20 | `settings` | รายการตั้งค่า | Settings records | เก็บรายการหมวดตั้งค่า คำอธิบาย และค่า: `/api/settings`. การแก้รายการนี้ไม่เปลี่ยนการตั้งค่า Auth อัตโนมัติ. |
| 21 | `dashboard` | ภาพรวมระบบ | Dashboard overview | อ่านจำนวนรายการและกิจกรรมที่ใช้แสดงหน้า Dashboard: `GET /api/dashboard`. |
| 22 | `reports` | รายงาน | Reports | อ่านรายงานสามกลุ่ม: ยอดขาย (`/api/reports/sales`), สินค้า/คลัง (`/api/reports/inventory`) และการเงิน (`/api/reports/finance`). เป็นข้อมูลจากต้นทางตามที่มี ไม่ใช่การคำนวณยอดคลังหรือการเงินจากกฎที่ยังไม่กำหนด. |
| 23 | `warehouses` | คลังสินค้า | Warehouses | ดูตัวเลือกคลังและรายละเอียดคลัง: `GET /api/warehouses?view=options`, `GET /api/warehouses/{id}`. ใน Collection นี้ไม่มีคำขอสร้าง/แก้ไข/ลบคลัง. |

ชื่อที่ใช้ขีดล่าง (`product_categories`, `dosage_forms`) เป็น **ชื่อโฟลเดอร์ Postman**; URL จริงแสดงในคอลัมน์สุดท้าย. `/{id}` หมายถึง UUID ของข้อมูลรายการนั้น ไม่ใช่ข้อความ `{id}` ที่ส่งตรงไปยัง API.

## ชื่อคำขอที่พบบ่อยในหนึ่งโฟลเดอร์

โฟลเดอร์ข้อมูลหลัก 14 กลุ่ม ตั้งแต่ `customers` ถึง `settings` มีรูปแบบคำขอเหมือนกัน โดยแทน `{module}` ด้วยชื่อโฟลเดอร์ เช่น `customers` หรือ `billing`:

| ชื่อใน Postman | HTTP method และ path | ความหมายภาษาไทย / English |
|---|---|---|
| `list` | `GET /api/{module}` | รายการข้อมูล / List records; ใช้ `offset`, `limit`, `search` และ `include=filters,config` ตามโมดูล |
| `getbyid` | `GET /api/{module}/{id}` | รายละเอียดหนึ่งรายการ / Get one record |
| `options` | `GET /api/{module}?view=options` | ตัวเลือกสำหรับฟอร์มหรือการอ้างอิง / Form options |
| `deleted` | `GET /api/{module}?deleted=true` | รายการที่ลบเชิงตรรกะ / Soft-deleted records |
| `create` | `POST /api/{module}` | สร้างรายการ / Create record |
| `update` | `PATCH /api/{module}/{id}` | แก้ข้อมูลบางส่วน / Update record |
| `delete` | `DELETE /api/{module}/{id}` | ลบเชิงตรรกะ / Soft delete record |
| `restore` | `PATCH /api/{module}/{id} — body action=restore` | กู้คืนรายการ / Restore record |

ตัวอย่าง: หากต้องการดูรายการลูกค้า ให้เปิด `customers` → `list` (`GET /api/customers`). หากต้องการแก้ลูกค้ารายหนึ่ง ให้ใช้ `customers` → `update` (`PATCH /api/customers/{id}`) และใส่ข้อมูลที่จะแก้ใน Body.

## การใช้งานและขอบเขต

- คำขอ GET ใน Collection นี้เปิดเฉพาะฟิลด์ที่ระบบอนุญาตให้อ่านตามปัจจุบัน; คำขอ `create`, `update`, `delete`, `restore` ใช้ token ของ Admin ตามตัวอย่าง Collection. ตั้ง `baseUrl` และตัวแปร ID ก่อนส่งคำขอ.
- `products` ในตารางด้านบนเป็น **สินค้าแบบสาธารณะ** (`/api/public/products`). ระบบยังมี API สินค้าที่ต้องยืนยันตัวตน (`/api/products`) ซึ่งแยกจากสองคำขอในโฟลเดอร์นี้.
- โฟลเดอร์ `reports` มีคำขอ `list` พร้อม `include=filters,config` สำหรับ `sales`, `inventory`, `finance`; ไม่มีคำขอเขียนรายงาน. `dashboard` มี `overview` อย่างเดียว.
- ดูขั้นตอนตั้งค่า Postman และ token ใน [Postman README](../postman/README.md). คู่มือนี้อธิบายชื่อและหน้าที่ของ API; ตัวอย่าง Body/Response ให้ดูในแต่ละคำขอของ Collection.


## Pagination TASK-064 — 2026-10-02

สินค้าและผู้ใช้ GET เดิมเพิ่ม pagination ค่าเริ่มต้น10; เพิ่ม GET /api/products?view=filters, /api/users/export, /api/audit-logs และ /api/audit-logs?view=filters สิทธิ์ authenticated/Admin ตาม [คู่มือ](TEST-API-PAGINATION.md) ข้อมูล users/audit ไม่ใช่ public API
# สัญญาข้อมูลปัจจุบัน TASK-073

ดู [API-CONTRACTS](API-CONTRACTS.md) สำหรับ request/response/query/body/validation/auth และรายชื่อเส้นทางจากโค้ด Collection local ปรับแล้ว ไม่ sync Cloud และไม่เปลี่ยน URL/สิทธิ์


## TASK-074 รวม API ตามโมดูล (อนุมัติ 2026-10-02)

เส้นประกอบ filters/options/config ย้ายเป็น query view=filters/options/config ที่ GET collection; include ขอ metadata พร้อมรายการตามที่โมดูลรองรับ DELETE ลบเชิงตรรกะ PATCH action restore กู้คืน เส้น restore เดิมถอนแล้ว ตัวอย่างการกู้คืนใช้ PATCH detail พร้อม action=restore รายการทั้งหมดและสิทธิ์จริงดู [API-CONTRACTS](API-CONTRACTS.md)

Import Collection local ใหม่โดยใช้ collection ID เดิม ไม่มี Cloud sync ไม่มี live HTTP/login/DB ในรอบนี้ ชุด Zuugroup133คำขอและ authenticated24คำขอ รวม app157คำขอ ถอน Supabase Data API5คำขอแล้ว

คำขอ filters/config แยกลบออกแล้ว options ยังใช้สำหรับฟอร์มค้นหา ตัวกรอง/config ใช้ include ที่ list ได้ รองรับ view ใน API ต่อไปแต่ไม่มีคำขอแยกที่ซ้ำในCollection


## ชื่อฟิลด์ API (TASK-075)

ใช้ชื่อข้อมูลต้นทางโดยตรง: records code/name และฟิลด์ของโมดูล สินค้า category.name/dosageForm.name/drug.name/defaultWarehouse.name ผู้ใช้ lastLoginAt/userRole/deletedByUser และ Audit actor/target รายละเอียด [API Contracts](API-CONTRACTS.md) วันที่ใน JSON เป็น ISO; เว็บแสดง พ.ศ.
