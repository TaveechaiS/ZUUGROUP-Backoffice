# Checkpoint — 5 ตุลาคม 2569 เวลา 17:35 น. Asia/Bangkok

Branch: AI. เจ้าของขอ checkpoint ก่อนพัก. จุดก่อนหน้า e843c77. เก็บงานปัจจุบันด้วย local commit; ไม่มี push/deploy. ดู commit checkpoint นี้ด้วย Git log.

## งานปัจจุบัน

- TASK097–115/118: จัด Side หลัก > Side รอง > Tab, เมนูลูกค้า/สินค้า/ผู้ใช้/โปรโมชัน/เขต/สต็อก/รายงาน/ใบเสนอราคา/คำสั่งซื้อ. Sidebar 275px, ชื่อแบรนด์ 2xl, logo คอม 60px, topbar 82px คอม และล็อก topbar/side รอง. ถอนวางบิลและลูกหนี้; แบบชำระเต็ม/ผ่อนเก็บไว้ทำภายหลัง.
- TASK114: ซ่อนเนื้อหาธุรกิจเดิมทุกหน้า เหลือ navigation; ข้อยกเว้นปัจจุบันคือหน้าเพิ่มสินค้า preview เฉพาะ Admin. โค้ดธุรกิจเดิมยังอยู่ ไม่เปิดใช้เอง.
- TASK116: ล้างข้อมูลธุรกิจ 30 ตารางตามคำสั่ง โดยเก็บผู้ใช้ 5 คนและข้อมูล Auth/Role/Permission. Backup/result อยู่ local-backups ที่ ignored. ไม่มีการล้างซ้ำใน checkpoint.
- TASK117: ถอน Postman request ที่ไม่ใช้ 18 รายการ เหลือ 115 requests/21 folders ทั้ง Cloud/local. ไม่ลบ backend routes. Backup ส่วนตัว ignored.
- TASK119–137: หน้าเพิ่มสินค้าแบบกล่อง/full-width flex, Combobox ว่าง, ดาวแดงเฉพาะบังคับ, ชื่อเต็มไทย/อังกฤษ และรหัสเต็มใช้ placeholder, โครงรหัสกลุ่ม/รูปแบบ/ลำดับ. ยี่ห้อและผู้ผลิตพิมพ์เพิ่ม/จำ localStorage แยกกัน. บริษัทผู้ผลิตอยู่ข้างหน่วยสินค้า. ถอนบริษัทเจ้าของสิทธิ์และหมวดหน่วย/บรรจุภัณฑ์อื่น. ราคาขาย/ภาษีเริ่ม 7% แก้ได้/สถานะเริ่มเปิดขาย. รูปและเอกสารหลายไฟล์มี preview/จำนวน/นำออก. ถอนคำอธิบายหัวหมวด. ปุ่มยกเลิก/บันทึกขวาล่างมีคำอธิบายและ SuccessAlert กลาง.

## ข้อจำกัดที่ต้องจำ

- ฟอร์มสินค้าเป็น preview: ไม่มีการบันทึกสินค้า/API/DB. Alert เป็นตัวอย่าง ไม่ได้บันทึกสำเร็จจริงหรือยกเลิก/ล้างข้อมูลจริง.
- กลุ่มรหัส/รูปแบบยังไม่มีตัวเลือก. ยังไม่รันลำดับ/ตรวจซ้ำกับ DB; งาน backend ต้องทำ master และ transaction/unique constraint ก่อนเปิดบันทึก. ห้ามนำ category เดิมมาแทนกลุ่มรหัสเอง.
- ยี่ห้อ/ผู้ผลิตจำเฉพาะเบราว์เซอร์นี้ ไม่ใช่ข้อมูลกลางทุกเครื่อง. รูปแนบอยู่ในหน่วยความจำ ออกจากหน้าหรือรีเฟรชจะหาย.
- กฎ OPEN และ UI preview ไม่ถือว่าอนุมัติงานธุรกิจเพิ่มเติม. ใช้ Specs/Plan และอ่าน ACTIVE ก่อนแก้.

## หลักฐานตรวจ

- รอบ checkpoint: ESLint ของ layout/products/navigation/reports ผ่าน; offline route checks 74 หน้าและ 14 field sets/server guards ผ่าน. Diff whitespace ผ่านก่อน commit.
- งานเดิม: ทดสอบ render ค่าเริ่มต้น/ช่อง/Alert ปิดเริ่มต้น, storage dedupe/แยก key/blocked storage และชนิดไฟล์แนบผ่านตาม Task ที่เกี่ยวข้อง.
- TypeScript มีปัญหา Prisma generated เดิม 3 จุดที่บันทึกไว้: managerId/salesId ใน SalesTerritoryWhereInput และ productLot บน PrismaClient. ยังไม่แก้หรือ generate ใหม่ในงาน UI นี้. ไม่อ้างว่า full build/type-check ผ่าน.
- ยังไม่ได้ตรวจคลิก/แนบไฟล์จริงหลัง login หรือภาพคอม/มือถือครบ.

## จุดเริ่มต่อครั้งหน้า

1. อ่าน checkpoint นี้, ACTIVE, Specs และ Plan.
2. ตรวจรับหน้าเพิ่มสินค้าหลัง login: layout/ขนาดหน้าจอ, Combobox, ชื่อผู้ผลิต/ยี่ห้อเดิมหลังรีเฟรช, แนบ/เพิ่ม/นำออกไฟล์, กดบันทึก/ยกเลิกและปิด Alert แล้วข้อมูลยังอยู่.
3. รอเจ้าของเลือกงานถัดไป; ไม่เริ่ม master/backend/บันทึกสินค้า หรือระบบผ่อนเอง.
4. ก่อนเปิดบันทึกจริง ต้องยืนยันกฎและเตรียม schema/API/validation/upload/unique code; แก้ Prisma generated ให้ตรง schema และตรวจระบบใหม่.
