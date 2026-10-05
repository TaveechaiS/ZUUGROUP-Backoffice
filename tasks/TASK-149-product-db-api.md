# TASK-149 — ข้อมูลสินค้า DB และ API

สถานะ: IMPLEMENTED / WAITING_FOR_UAT; อนุมัติข้อ1จากเจ้าของ 5 ตุลาคม 2569

## ผลที่ทำจริง

- สินค้าตัวอย่าง12รายการ ล็อต28ล็อต รับเข้า/ยอด/ประวัติสอดคล้องกัน รวม950หน่วย. เติมเฉพาะรายการกลางสินค้า/3คลังและpolicyเดิม6/12/90ที่หาย. ไม่แก้ฟอร์ม/Schema/ผู้ใช้/โมดูลอื่น.
- หน้ารวม12รายการ950หน่วย; MAIN9รายการ835หน่วย; MARKETING11รายการ99หน่วย; DISPOSAL8รายการ16หน่วย. หน้าคลังไม่แสดงสินค้าไม่มีจำนวนในคลังตามAPIเดิม.
- ผ่านdry-run rollbackก่อนcommit, DB readback และ GET handlerจริงกับDB โดยstubเฉพาะidentity, product list service, แบ่งหน้า10+2, ค้นรหัส, กรองสถานะ, scopeยอดทั้งสี่, ยอดledgerเท่ากับbalance, ไม่มีต้นทุนในรายการ และresponse400/401/403. HTTPจริงสองendpointเมื่อไม่มีsessionคืน401. ยังไม่ตรวจlogin/browserจริง.
- รันseedซ้ำไม่เขียนข้อมูลเพิ่ม; ESLint/Prettier/git diff --checkผ่าน. APIเดิมและตารางเชื่อมแล้ว จึงไม่มีrouteซ้ำหรือAPIเขียนใหม่.

รันseed: `node scripts/seed-product-stock-demo.mjs` (ตรวจไม่บันทึกเพิ่ม `--dry-run`). ตรวจอ่าน: `node --loader ./scripts/ts-test-loader.mjs scripts/verify-product-stock-demo.mjs`.

## แผนย่อยที่อนุมัติล่าสุด

1. บันทึกขอบเขตตัวอย่างสินค้า12รายการและสัญญา GET ใน docs/API-PRODUCT-STOCK.md ก่อนโค้ด/DB.
2. สร้าง scripts/seed-product-stock-demo.mjs ใช้ pg parameterized queries ใน transaction เติมรายการกลางที่หายและ policy6/12/90ตาม migration คงค่าที่มีอยู่. สินค้าใช้รหัส4หลักเดิมช่วง9001–9012/is_sample=true ชื่อระบุข้อมูลตัวอย่าง รับเข้าแยกล็อต/ยอด/ประวัติสามคลังไม่มีจอง. Receipt SEED149-20261005 ใช้เป็น marker กันซ้ำ; หากรหัสสินค้าเดิมชนให้หยุด rollback ไม่เขียนทับ.
3. ทำ --dry-run rollback ตรวจจำนวน/ยอดก่อนลงจริง แล้วลงDBตาม .env.local และตรวจreadback. เลือกAdminที่มีอยู่เป็นFKเอกสารตัวอย่าง ไม่แก้บัญชีและ audit ระบุSYSTEM/seed.
4. สร้าง scripts/verify-product-stock-demo.mjs เรียก GET handler inventory จริงและ product service กับDBจริง โดย stub เฉพาะidentity ไม่ผ่านloginอัตโนมัติ ตรวจpagination/filter/warehouse/totals/ไม่ส่งcost และHTTP401จริง. รันseedซ้ำต้องไม่เปลี่ยนยอด/เพิ่มซ้ำ.
5. lint/scripts/diff และบันทึกผล. ตารางใช้APIเดิมอยู่แล้ว ไม่แก้ฟอร์ม/Schema/สิทธิ์/APIเขียน.

ไฟล์ที่จะเปลี่ยนรอบimplement: สองscriptข้างต้น, docs/API-PRODUCT-STOCK.md, ACTIVE/Specs/Plan/Taskนี้. ผลลัพธ์: ข้อมูลตัวอย่างอ่านจากDBผ่านAPIเดิมได้ทั้งสี่หน้า ไม่มีฟังก์ชันเพิ่มสินค้าใหม่.

## แผนย่อย

1. ตรวจ ACTIVE/Specs/Plan, schema สินค้าและ API เดิมแบบอ่านอย่างเดียว.
2. ยืนยันว่าต้องการเติมข้อมูลตัวอย่างตารางทั้งสี่ หรือให้หน้าเพิ่มสินค้าบันทึกทุกช่องใหม่ด้วย.
3. หากข้อมูลตัวอย่าง: จัดสัญญารายการ GET /api/inventory?view=products และชุดข้อมูลสินค้า/คลัง/ล็อตตัวอย่างแบบระบุชัด ไม่เขียนทับข้อมูลเดิม ไม่ seed โมดูลอื่น บันทึกไฟล์/วิธีตรวจรับก่อนลง DB.
4. หากฟอร์มใหม่: ทำ mapping รายช่อง/schema/API พร้อมรายการ OPEN และแผน migration/ไฟล์แนบก่อน implement ห้ามย่อข้อมูลใหม่ลงช่องเดิมจนข้อมูลสูญหาย.
5. เมื่อขอบเขตพร้อม ตรวจ transaction/readback/API validation/สิทธิ์และหน้าเว็บจริง ส่ง UAT.

ขอบเขตไฟล์รอบสำรวจ: ACTIVE/Specs/Plan และ Task นี้. ไฟล์ implement จะระบุหลังยืนยันขอบเขต. ผลสำรวจ: DB products และรายการกลาง/คลัง/ล็อตว่าง ผู้ใช้5บัญชี; API products/inventory ตอบ401เมื่อไม่มี session ตามสิทธิ์เดิม. ตารางสี่หน้าเชื่อม inventory อยู่แล้ว. ไม่เปลี่ยน DB/โค้ดในรอบสำรวจ.

## ⚠️ ต้องทดสอบโดยคุณ

หลัง implementation ตามขอบเขตที่ยืนยัน: เข้าสู่ระบบแล้วเปิดตารางทั้งสี่ ข้อมูลและยอดต้องตรง DB กรอง/ค้นหา/แบ่งหน้าตรงจริง. ถ้ามีการเชื่อมฟอร์ม บันทึกแล้ว refresh ยังพบข้อมูลครบตามช่อง และคำขอที่ไม่เข้าสู่ระบบต้องถูกปฏิเสธ.
