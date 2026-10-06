# TASK-179 — ลดตารางที่ยังไม่ใช้

สถานะ: DISCOVERY / WAITING_FOR_SCOPE — 6 ตุลาคม 2569

## คำขอและแผนย่อย

เจ้าของขอลบtableในSupabaseที่ยังไม่ใช้เพื่อเห็นว่าขาดชุดใด. ตรวจpublic40ตารางจากprojectwiikzseotpjxssbcdayk พร้อมFKและsource. ยังไม่รันDROP/DELETEหรือเดาว่าไม่มีข้อมูลเท่ากับไม่ใช้. ถามว่าจะลบเฉพาะไม่มีโค้ดเรียกเลย หรือพักโมดูลที่หน้ายังซ่อนและปรับAPI/รายงานก่อนลบ.

1. รอบสำรวจแก้ACTIVE/Specs/Plan/Task179เท่านั้น พร้อมอ่านschema/server/module registry/ShellและDBmetadata.
2. เมื่อขอบเขตชัด ระบุรายชื่อตารางที่จะลบและไฟล์API/Prisma/schema/report/seedที่ต้องปรับก่อนเริ่มแต่ละส่วน.
3. สำรองDDL/data/FKของตารางที่ได้รับอนุญาต ตรวจcountsล่าสุด ลบแบบระบุชื่อในtransaction ไม่ใช้CASCADEข้ามขอบเขต. คงauth/storageและตารางระบบSupabase.
4. ตรวจschema/type/build/login/createพร้อมไฟล์/detail/tablestock และตรวจยอดเดิมคงตามขอบเขต.

## Inventory ณตรวจ

### ใช้กับการเข้าสู่ระบบ ผู้ใช้ และประวัติ

users5, auth_accounts5, roles4, user_roles5, audit_events2, _prisma_migrations9. คงไว้. permissions1และrole_permissions1ยังอยู่ในPrismaและscriptเก่า แต่ไม่พบruntimequeryในsrc/server/src/appจากการค้นชื่อ จัดเป็นlegacyที่ต้องตรวจแผนschema/seedก่อนตัดออก ไม่อนุมานลบโดยจำนวนแถว.

### ใช้กับสินค้าและไฟล์

products12, product_options41, product_create_requests0, product_files0. สองตาราง0แถวใช้โดยfull-createจริง ต้องคง. product_categories1/dosage_forms3/drugs11ยังถูกproductsอ้างและproductMasters/publiccatalogอ่าน; warehouses3ยังใช้stock/layout. คงlegacymastersจนแปลงreferencesโดยงานที่มีขอบเขตเฉพาะ.

### ใช้กับสต็อกและAPIปฏิบัติการ

stock_receipts1, product_lots28, stock_balances28, stock_movements28, inventory_policy1, receipt_revisions0, operation_commands0. APIปฏิบัติการยังใช้ รวมอ่านประวัติและกันคำสั่งซ้ำ; ตารางว่างไม่ใช่เหตุลบ. ยอดล่าสุดในงานก่อนหน้า950.

### หน้าถูกซ่อน แต่ API/รายงาน/registry ยังอ้าง — 17 ตารางว่าง

| กลุ่ม | ตาราง |
|---|---|
| ลูกค้า | customers, customer_groups, sales_territories, customer_documents, customer_follow_ups |
| ซื้อ/ค่าใช้จ่าย | suppliers, purchase_orders, expenses |
| ขาย/เอกสาร | quotations, sales_orders, sales_order_lines, stock_reservations, invoices |
| อื่น ๆ | promotions, stock_count_sessions, system_settings, record_import_map |

ทั้งหมด0แถวขณะตรวจ. ไม่สามารถDROPโดยยังอ้างว่าAPIเดิมครบได้: records/serviceใช้registrytableและcustomerjoins/importmap; records/reportsนับcustomer/order/quoteและunioninvoice/purchase; operations/serviceใช้sales_order_lines/stock_reservations. AdminShellปัจจุบันเปิดเนื้อหาจริงเฉพาะสินค้า/คลัง/ตั้งค่าพื้นฐานสินค้า ส่วนใหญ่เหลือnavigation-onlyแต่serverlayout/APIยังมีโค้ด.

## ผลและข้อจำกัด

ยังไม่ลบตารางใด. รายการนี้แยกตามการอ้างอิงstaticในrepo ไม่ใช่สถิติtrafficย้อนหลัง. รอคำตอบนิยามที่ต้องลบก่อนปรับAPIหรือschema. ข้อมูลใหม่แผนถอดตารางต้องบันทึกSpecs/Planก่อนโค้ดตามAGENTS.
