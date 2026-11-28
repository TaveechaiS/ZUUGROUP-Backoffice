# TASK-224 — หลาย Sales ต่อเขต / Sales หนึ่งคนต่อหนึ่งเขต

IN_PROGRESS / OWNER_RULE_APPROVED — 6 ตุลาคม 2569

## กฎที่อนุมัติ

เขตมีSalesได้หลายคนไม่จำกัดจำนวนเอง แต่Salesแต่ละคนผูกได้เขตเดียว. Manager1ต่อเขตคงเดิม. ไม่ย้ายSalesจากอีกเขตโดยอัตโนมัติ; ถ้าชนให้409และเก็บdraft. เลือก/ถอนสมาชิกจากฟอร์มเพิ่มและแก้ไขได้ บันทึกทั้งหมดในtransactionเดียว. กฎOPENการย้ายข้ามเขต/เอกสารเดิมอื่นไม่เดาเพิ่ม.

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Taskนี้บันทึกกฎแทน1Salesเดิมก่อนลงมือ.
2. prisma/schema.prisma และ migrationใหม่: sales_territory_sales (territory_id,user_id unique,FK/index/createdAt); RLSและrevokeclientตามserver-onlyเดิม. Backfill sales_idเดิมครบ ไม่ลบcolumnเดิม. Baselinebackup/readbackและdryrollbackก่อนใช้จริง.
3. records validation/service/types: salesIds[] UUID/duplicate/bodyconflict, sorteduserlocks/roles/one-territoryunique/atomicreplace/version/audit. Countและsortใช้membershipจริง. Legacy salesIdread/writeยังรองรับ; คงไว้เป็นcompatibilitymirrorสมาชิกคนแรกและไม่ให้partialeditล้างคนอื่น.
4. records customer projection และoperations order projectionแสดงSalesทุกคนโดยไม่ทำแถวเอกสารซ้ำ/เปลี่ยนownerหรือscopeสิทธิ์.
5. territories create/detail/list: pickerเลือกSalesหลายคนเป็นรายชื่อพร้อมนำออกdraftได้, prefillเดิมครบ, ตารางจำนวนจริง, รายละเอียดรายชื่อทั้งหมด. ใช้combobox/UIเดิม ฟอร์มยังไม่มีstatus/area/owner.
6. testsvalidation/DBrollback/multiplecreate-edit/remove/duplicateotherterritory/concurrentrequests/version/role/oldcustomer-orderprojection/backfillpreserve/RLS และactualUI/payload. Prisma generate, scopedlint/type/build/diff. ไม่seedข้อมูลจริง/commit/push/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- เพิ่มเขต เลือกSalesหลายคน บันทึกแล้วเปิดรายละเอียด/รีเฟรชต้องรายชื่อครบ ตารางนับเท่าจำนวนSalesจริง.
- แก้ไขเขตต้องเลือกเดิมครบ เพิ่มหรือนำคนออกแล้วบันทึกต้องตรงกับรายการใหม่.
- เลือกSalesที่อยู่เขตอื่นแล้วบันทึกต้องแจ้งไม่สำเร็จ ไม่ย้ายคนหรือทับเขตเดิม.
- เปิดสองแท็บเพิ่มSalesคนเดียวกันเข้าคนละเขตพร้อมกัน ต้องสำเร็จได้เขตเดียว.
- Managerยังเลือกหนึ่งคน ลูกค้า/เอกสารที่ผูกเขตยังเปิดได้และแสดงชื่อSalesครบ.
