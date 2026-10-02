# แผนเก็บกวาดโค้ด — TASK-072

สถานะ: READY_FOR_USER_TEST เจ้าของอนุมัติ “ok” 2026-10-02 ทำครบตามแผน ผลใน [CODE-CLEANUP-RESULT](../CODE-CLEANUP-RESULT.md)

| ลำดับ | งานและผลลัพธ์ | ไฟล์ | วิธีตรวจรับ |
|---|---|---|---|
| 1 | บันทึกขอบเขตและรายการลบ ตรวจ import/exports/scripts/config แบบรายไฟล์ก่อนลบ | ACTIVE, Specs, Task; src/scripts/package | มีหลักฐาน consumer ก่อนตัดสิน; ไม่ถือชื่อ data.ts หรือคำว่า mock ว่าไม่ใช้โดยอัตโนมัติ |
| 2 | ลบ dead components/export/fixture และเครื่องมือย้ายเก่า | admin-shell.tsx, records/types.ts, initial-records.json, migrate-operational-data.mjs, operational-import.sql | ไม่มีจุดเรียกใช้เหลือ คง backup และ migrations |
| 3 | ถอนหน้ารวม preview เก่าและลิงก์ที่พบ | design-preview/page.tsx, consumer ที่ยืนยันพบ, test-route-pages หากผูกจำนวน route | หน้าที่ใช้งานจริงครบ; preview เป็น404; integrity script นับ routes ที่มีจริง |
| 4 | ปรับ seed สินค้าให้ชื่อข้อมูลปกติ และตัด internal field ไม่ใช้ | seed-product-master.mjs/.sql, product-ui.ts, products/service.ts | ไม่ทับแถวเก่า คงคำสั่ง seed; ไม่รัน DB; response หลักไม่เปลี่ยน |
| 5 | ตรวจ dependency และเอกสารปัจจุบัน | package/lock เฉพาะ dependency ที่พิสูจน์ไม่ใช้, app README, Postman README/คู่มือ seed | ไม่ลบ CSS/runtime/config dependency; ไม่เปลี่ยนประวัติ migration |
| 6 | ตรวจ static/build/offline แล้วสรุปไฟล์ที่ลบจริง | source ที่เปลี่ยนและ Task/ACTIVE | next typegen, type-check, lint, build, test-route-pages, test-pagination, diff-check ผ่าน |

ไม่ refactor หน้าให้กลับไปใช้ shared whole-page ไม่แตะ business rules OPEN ไม่รัน live HTTP/login/seed ไม่ commit/push

## ⚠️ ต้องทดสอบโดยคุณ หลัง implementation

เปิด Dashboard/users/products/customers/orders/audit ตรวจข้อมูลจาก DB เดิมยังอยู่ ฟอร์มเพิ่ม/แก้/ลบ/กู้คืนและ pagination/Combobox ทำงานเหมือนเดิม เปิด /design-preview ควร404หลังถอน ดู package scripts ว่ายังมี seed:products/seed:records/recover:admin (ไม่ต้องรันเพื่อทดสอบ)
