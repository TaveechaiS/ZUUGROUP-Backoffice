# Postman — Zuugroup

คู่มือชื่อโฟลเดอร์ API ภาษาไทย/อังกฤษและหน้าที่: [API-NAME-GUIDE](../docs/API-NAME-GUIDE.md)

Collection [Zuugroup ใน Workspace](https://sir34771-498818.postman.co/workspace/7734105b-3c13-40b1-8adc-cfa12f7e7db8/collection/55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903) และไฟล์ Zuugroup.postman_collection.json ใช้ API ของเว็บที่อ่าน DB จริง. มี 167 คำขอ แบ่ง 23 กลุ่ม ไม่มีโฟลเดอร์ Demo.

## เริ่มใช้งาน

1. รัน npm run dev แล้วตั้ง Collection Variable baseUrl เป็น http://localhost:5000. เมื่อ Deploy แล้วเปลี่ยนเป็น URL เว็บ.
2. GET รายการ/รายละเอียด/filters/options ใช้ No Auth ตามฟิลด์สาธารณะที่อนุมัติ. ไม่ต้องใส่ Supabase secret key.
3. รายการใช้ limit=10 และ offset=0; หน้าถัดไป offset=10. รองรับ search และ filters ตามโมดูล, limit สูงสุด 50.
4. สำหรับเขียน ให้สร้าง Environment ส่วนตัวและตั้ง loginPassword เป็นรหัสของบัญชี. เลือก POST Login Admin; script เก็บ adminToken ใน Environment. ไม่มีรหัสหรือ token จริงในไฟล์ Collection.
5. เลือกโมดูลและใส่ newCode/newName รวมถึงฟิลด์ที่ต้องการใน Body แล้ว Send POST Create. เมื่อสำเร็จ script จะเก็บ UUID ของรายการใหม่ใน Variable ของโมดูลเพื่อใช้ PATCH/DELETE/restore ต่อ.
6. DELETE เป็นการซ่อนพร้อม deleteReason; GET Deleted และ POST Restore ใช้ Admin token. Role อื่นเขียนไม่ได้.

## กลุ่มข้อมูล

ข้อมูลหลัก/หัวเอกสาร 14 กลุ่ม: customers, customer-groups, sales-territories, customer-documents, customer-follow-ups, suppliers, expenses, purchases, quotes, orders, billing, promotions, stock-counts, settings. แต่ละกลุ่มมี list/detail/filters/options/config และ create/update/delete/restore. ข้อมูลสินค้า/หมวด/รูปแบบ/ตัวยา/คลังใช้ endpoint ของตัวเอง.

Dashboard และรายงานอ่านข้อมูลต้นทาง. Sales เป็นหัวคำสั่งซื้อ, Finance เป็นหัววางบิล, Inventory เป็นรายการสินค้า; ยังไม่ใช่ยอดรับรู้รายได้/หนี้สุทธิ/ยอดคลัง. ฟิลด์เงินใหม่ว่าง และสินค้าใหม่ราคา 0 รอกรอกจริง. Settings เป็นข้อมูลรายการ ไม่เปลี่ยนการตั้งค่า Auth อัตโนมัติ.

## ข้อมูลตั้งต้น

ลง DB แล้วโมดูลละ 15 รายการและสินค้า 15 รายการ; หมวด 15, รูปแบบยา 15, ตัวยา 17, คลัง 18. ใช้บัญชี 4 Role เดิม. รัน npm run seed:records เพื่อเติมให้ครบเป้าหมายโดยไม่ทับข้อมูลเดิม. Script migrate-operational-data.mjs/operational-import.sql เป็นประวัติการย้ายครั้งเดียว ห้ามรันหลังถอนตารางเดิม.

รอบนี้ตรวจโครงสร้าง Collection และ static checks เท่านั้น ไม่ส่งคำขอ API/ล็อกอินตามคำสั่งผู้ใช้. localhost ต้องเปิดเว็บและใช้ Postman Desktop หรือ Desktop Agent.
