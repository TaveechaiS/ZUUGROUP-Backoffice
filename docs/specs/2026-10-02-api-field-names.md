# TASK-075 ชื่อฟิลด์ API ตรงกับต้นทาง

อนุมัติ: เจ้าของตอบ “ok ปรับ” หลังผลตรวจ docs/API-FIELD-NAMING-REVIEW.md

- Records ส่ง code/name และฟิลด์ของโมดูลที่ระดับ data โดยตรง ถอน ref/title/subtitle/value/fields ที่เป็นตัวแปลงเพื่อแสดงผล คง memberCount เป็นค่าคำนวณที่มีชื่อชัดเจน
- Filters ใช้ชื่อฟิลด์ต้นทาง เช่น status/customerType/province/owner และ query ใช้ชื่อเดียวกัน รายงานสินค้าที่กรองชื่อ relation ใช้ category.name/dosageForm.name
- สินค้าเก็บ category/dosageForm/drug/defaultWarehouse เป็น object ใช้ .name/.code ตามต้นทาง ไม่ยุบ relation เป็นชื่อใหม่ คง public allowlist เดิม
- ผู้ใช้ใช้ userRole.roleId/userRole.role.name, lastLoginAt, deletedByUser.name/employeeCode; Audit ใช้ actor/target object
- วันที่ส่ง ISO; รูปแบบ พ.ศ./Asia/Bangkok ราคา และข้อความสถานะจัดในหน้าเว็บหรือ CSV ไม่เปลี่ยนชื่อข้อมูล
- state สินค้าใช้ defaultWarehouseId; ย้ายผู้เรียกทุกหน้า/types/options/reports/Postman พร้อมกัน ไม่คง alias เก่า
- ไม่เปลี่ยน Schema/Seed/ข้อมูล DB, สิทธิ์, transaction, audit guard หรือ contract Supabase login ภายนอก
- ไม่มี live HTTP/login/DB test; ผู้ใช้ตรวจหน้าจอและ Send API เอง
