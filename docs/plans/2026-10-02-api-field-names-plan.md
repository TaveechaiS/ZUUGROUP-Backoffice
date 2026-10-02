# แผนย่อย TASK-075

อนุมัติตาม “ok ปรับ” 2026-10-02

1. บันทึก contract และขอบเขตใน Specs/Plan/ACTIVE
2. ปรับ types และ services records/products/public/users/audit/reports/handlers เป็นชื่อเดิมและ relations เดิม
3. ปรับรายการ/เพิ่ม/รายละเอียดแต่ละ page.tsx และ CSV ให้ใช้ชื่อเดียวกัน จัดรูปแบบเฉพาะแสดงผล
4. ปรับ Postman local เดิมและคู่มือ query/response ถอนตัวอย่างชื่อเก่า โดยไม่ส่ง request
5. ตรวจ offline contract/pagination/page/resource tests เพิ่มกรณี payload ไม่หลุด alias/null/relations; type-check/lint/build/diff

ไฟล์: src/types/api/*, src/server/records/*, src/server/products/*service.ts, src/server/users/service.ts, src/server/audit-logs/service.ts, src/app/**/page.tsx ที่อ่านข้อมูลดังกล่าว, src/app/api/users/export/route.ts, postman/*, docs API/Specs/Plan, scripts/test-*.mjs, tasks

ผลลัพธ์: code/name อยู่ต้นทางถึงหน้าและ Postman, filters ใช้ชื่อจริง, ไม่มี response alias เก่า UI รูปแบบเดิม

ตรวจรับ: ผู้ใช้เปิดรายการ/รายละเอียด/เพิ่ม/แก้/ลบ/กู้คืน กรอง/เปลี่ยนหน้า; Postman Send list/detail ตรวจ code/name และ nested relations วันที่ ISO พร้อม UI พ.ศ. ปุ่มบันทึกทำงานเดิม

ผล: implementation และ offline/type-check/lint/build/diff ผ่าน รอ UAT ตาม docs/TEST-API-FIELD-NAMES.md ไม่ยิง API/DB จริง
