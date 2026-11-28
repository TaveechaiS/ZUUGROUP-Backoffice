# ผลตรวจชื่อ Field API — 2026-10-02

ขอบเขต: ตรวจจากโค้ด adapters/services/types/ผู้เรียกและฟอร์ม ไม่ยิง API หรืออ่าน/แก้ DB จริง เจ้าของต้องการตามชื่อข้อมูลได้โดยไม่ต้องตาม alias หลายชั้น รอบนี้รายงานผล ไม่แก้ response ที่หน้าเว็บและ Postman ใช้อยู่

## จุดที่พบ

| กลุ่ม | ชื่อ/เส้นทางต้นทาง | ชื่อที่ใช้ต่อ | ตำแหน่ง |
|---|---|---|---|
| Records14โมดูล | code / name | ref / title | src/server/records/service.ts:59 |
| Records14โมดูล | ฟิลด์ display ที่เลือกตามโมดูล เช่น amount/owner | value / owner / subtitle ที่คำนวณ | src/server/records/service.ts:51 |
| ตัวเลือก Records | ref / title จาก list | code / name อีกครั้ง | src/server/records/service.ts:193 และ records/handlers.ts:61 |
| รายงานสินค้า | code / name / unit | ref / title / value | src/server/records/reports.ts:76 |
| สินค้า | category.name / category.code | category เป็น string / categoryCode | src/server/products/service.ts:32 |
| สินค้า | dosageForm.name / dosageForm.code | dosageForm เป็น string / dosageFormCode | src/server/products/service.ts:35 |
| สินค้า | drug.name / defaultWarehouse.name | drug เป็น string / warehouse | src/server/products/service.ts:38 |
| สินค้า public | category.name / dosageForm.name / drug.name | category / dosageForm / drug เป็น string | src/server/products/public-service.ts:26 |
| ผู้ใช้ | userRole.roleId / userRole.role.name | roleId / role | src/server/users/service.ts:38 |
| ผู้ใช้ | lastLoginAt | lastActive พร้อมวันที่ที่จัดรูปแบบแล้ว | src/server/users/service.ts:42 |
| ผู้ใช้ | deletedByUser.name + employeeCode | deletedBy เป็น stringรวม | src/server/users/service.ts:44 |
| Audit | actor.name / actor.employeeCode | actorName / actorCode | src/server/audit-logs/service.ts:56 |
| Audit | target.name / target.employeeCode | targetName / targetCode | src/server/audit-logs/service.ts:58 |
| หน้าเพิ่ม/แก้สินค้า | defaultWarehouseId ใน API | warehouseId ใน state แล้วส่งกลับ defaultWarehouseId | src/app/products/create/page.tsx:22 และ products/[id]/page.tsx:30 |

Records14โมดูลคือ customers, customer-groups, sales-territories, customer-documents, customer-follow-ups, suppliers, expenses, purchases, quotes, orders, billing, promotions, stock-counts, settings รายงาน sales/finance ใช้ records list ของ orders/billing จึงได้รับ aliases เดียวกันด้วย

## จุดที่ยังตรงและข้อจำกัด

- product.name → API name → product.name ในหน้าเว็บ ตรงกัน ไม่พบการเปลี่ยนเป็น productName ใน src/app/products
- ฟิลด์สินค้าหลัก id/code/name/categoryId/dosageFormId/drugId/defaultWarehouseId/unit/salePrice/status ใช้ key เดิมใน response และ request ส่วน warehouseId เป็นตัวแปร state ที่ตั้งต่างชื่อ ไม่ได้ส่ง key warehouseId ไปบันทึก
- Records ยังเก็บชื่อฟิลด์เดิมใน fields เช่น fields.code/fields.name แต่รายการใช้ ref/title ทำให้ตามชื่อยาก แม้ข้อมูลต้นทางไม่ได้ถูกเขียนทับด้วย alias
- rows/filtered/initialProduct เป็นชื่อตัวแปรหรือชุดรายการ ไม่ใช่ field ข้อมูลใหม่ ไม่ควรนับเท่ากับการเปลี่ยน key name เป็น title
- วันที่/ราคา/ข้อความสถานะที่จัดรูปแบบและ computed values แยกจากการเปลี่ยนชื่อ field ต้องระบุรูปแบบข้อมูลใน contract ก่อนเปลี่ยน
- Login แปลงชื่อจาก Supabase เช่น access_token → accessToken และ expires_in → expiresIn เป็น contract ภายนอกอีกชั้นใน src/server/auth/login.ts ไม่ควรเปลี่ยนพร้อม field ธุรกิจโดยอัตโนมัติ

## ลำดับแก้ที่เสนอสำหรับงานถัดไป

1. ใช้ชื่อฟิลด์เดิมของแต่ละโมดูลใน response/types/table/form/query ให้ตรงกัน แยกค่าที่ใช้แสดงผลออกจากข้อมูลต้นทางอย่างชัดเจน
2. ยกเลิกการยุบ relations เช่น defaultWarehouse.name → warehouse หากเจ้าของต้องการอ้างอิงชื่อ nested เดิมตลอด
3. ปรับทุกผู้เรียก, metadata options, report adapters, types และ Postman ตาม contract ที่อนุมัติพร้อมกัน ไม่แก้แค่ service จนหน้าเว็บเสีย
4. เปลี่ยน state warehouseId เป็น defaultWarehouseId ได้ในงานปรับชื่อของฟอร์ม ไม่จำเป็นต้องแก้ schema/DB

เจ้าของอนุมัติ “ok ปรับ” แล้ว ดำเนินการ TASK-075 ตาม docs/specs/2026-10-02-api-field-names.md และแผนย่อย ตารางด้านบนเป็นผลตรวจก่อนแก้ ไม่ใช่ contract ปัจจุบัน
