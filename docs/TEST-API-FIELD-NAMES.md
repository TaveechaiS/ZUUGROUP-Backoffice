# ตรวจรับ TASK-075

ตรวจออฟไลน์ผ่าน: type-check, lint, build และ test-api-field-names/test-api-contracts/test-pagination/test-route-pages/test-resource-api ไม่มีการส่ง API/อ่าน DB จริงอัตโนมัติ

## ⚠️ ต้องทดสอบโดยคุณ

1. Refresh รายการลูกค้า/สินค้า/คำสั่งซื้อ/ผู้ใช้/Audit/รายงานสินค้า: ชื่อ รหัส คลัง บทบาทและรายละเอียดต้องแสดงครบเหมือนเดิม วันที่เป็น พ.ศ. เวลาไทย
2. เลือก filter และไปหน้า 2: ได้ข้อมูลตรง filter ครั้งละ 10 รายการ เปิดรายละเอียดแล้วข้อมูลต้องตรงกับรายการ
3. แก้ข้อมูลและยืนยัน: สำเร็จแล้วเปิดใหม่ยังแสดงค่าที่บันทึก ทดลองเพิ่ม/ลบ/กู้คืนด้วยรายการทดสอบของคุณ
4. Postman Send list/detail: Records ใช้ data[].code/name/ฟิลด์โมดูลโดยตรง ไม่มี ref/title/fields wrapper สินค้าใช้ category.name/dosageForm.name/drug.name/defaultWarehouse.name ผู้ใช้ lastLoginAt/userRole/deletedByUser และ Audit actor/target
5. GET /api/customers?limit=10&include=filters: filters ใช้ชื่อจริง เช่น status/category/province/owner นำค่านั้นกรองด้วย key เดียวกัน GET /api/reports/inventory?category.name=ชื่อหมวด&dosageForm.name=ชื่อรูปแบบ
6. ตรวจวันที่ใน JSON เป็น ISO หรือ null; เว็บแสดงวันที่ไทยหรือข้อความยังไม่เคยเข้าใช้ สำหรับ settings.value เป็นฟิลด์จริงจึงยังมีอยู่

Collection เดิมใช้ URL/Method เดิม response ได้รูปแบบใหม่จาก server หลังรันโค้ดใหม่ ไฟล์ local ใน postman มีคำอธิบาย contract ล่าสุด
