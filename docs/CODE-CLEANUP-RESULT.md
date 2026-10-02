# ผลเก็บกวาดโค้ด — TASK-072

เจ้าของอนุมัติ 2026-10-02 ทำตามแผนแล้ว ไม่เชื่อมต่อ DB/ส่ง live API/รัน seed ในงานนี้

## ลบแล้ว

- DashboardPlaceholder และ ModulePlaceholder พร้อม import เก่าใน admin-shell.tsx; คง AdminShell
- exports ที่ไม่มี consumer: moduleForPage, formatThaiDate, listProducts, getProductById, listUsers, Logins
- scripts/fixtures/initial-records.json ที่ไม่มี consumer
- scripts/migrate-operational-data.mjs และ scripts/operational-import.sql ที่อ้างตารางซึ่งถอนแล้ว
- src/app/design-preview/page.tsx; ไม่มี runtime link มายัง route นี้ หน้ารวมตัวอย่างเกษียณแล้ว /design-preview เป็น404
- internal ProductView.isSample และ productView response mapping; ไม่เปลี่ยน Prisma field/DB column
- @heroui/react จาก package.json และ lock ด้วย npm; ไม่มี source/config import คง @heroui/styles ที่ globals.css ใช้ ไม่มีการเปลี่ยนเวอร์ชัน package ที่เหลือ

## ปรับแล้ว

- seed:products ยังอยู่ ชื่อข้อมูลใหม่ไม่ลงท้าย (ตัวอย่าง) และ is_sample=false
- SQL ใช้ RETURNING ของสินค้าที่เพิ่มได้จริงเพื่อบันทึก PRODUCT_SEEDED; ข้ามแถวซ้ำโดยไม่ทับข้อมูลและไม่สร้าง audit เพิ่มเมื่อไม่มีสินค้าใหม่
- อ่านผลตามรหัสสองสินค้าที่ seed แทนการกรอง is_sample; audit UI รองรับชื่อเหตุการณ์ใหม่
- ปรับคู่มือ Postman/จุดแก้หน้า และเปลี่ยนชื่อ variable ใน offline integrity script ให้ผ่านกฎ Next lint

## เก็บไว้

- ข้อมูล DB ปัจจุบันทั้งหมด, Schema และ migration history ของ Prisma/Supabase
- scripts/fixtures/operational-migration-backup.json ที่ migrations อ้างเป็น archive
- modules.json เป็น definition/validation/server metadata ไม่ใช่แถวข้อมูลหน้าจอ
- seed:records, seed:products, recover:admin, API/auth/สิทธิ์/audit/pagination/shared UI
- offline DB stubs ใน test-pagination.mjs ใช้ตรวจ contract โดยไม่ยิง DB
- PRODUCT_SAMPLE_SEEDED ใน audit UI เพื่อแปลเหตุการณ์เก่าที่บันทึกอยู่จริง ไม่ใช่การสร้างข้อมูล Mock
- input placeholder, loading fallback, empty state และข้อจำกัดรายงาน เป็นส่วนใช้งานจริง

ตรวจ source หลังลบไม่พบแหล่งแถว Mock/sessionStorage/localStorage ใน src (ไม่รวม generated code); หน้า Dashboard/รายการอ่าน API/DB ตามเดิม ไม่ได้ทำสูตรหรือ business rules ที่ยัง OPEN เพิ่ม

## การตรวจ

- next typegen และ TypeScript ผ่าน
- lint ไม่มี error/warning และ diff-check ผ่าน
- build ผ่าน ไม่มี /design-preview ใน route manifest
- offline test-route-pages ผ่าน: 59 page routes, 14 create/edit field sets และ guards
- offline test-pagination ผ่าน
- node --check seed scripts และ static review seed ผ่าน ไม่มีคำสั่ง UPDATE/DELETE/DROP/TRUNCATE ใน SQL ที่แก้
- ไม่ได้ทดสอบ SQL กับ DB จริงหรือหน้าเว็บจริงในรอบนี้

## ⚠️ ต้องทดสอบโดยคุณ

1. หยุด dev เก่าแล้วเปิด npm run dev ใหม่
2. เปิด Dashboard/ลูกค้า/สินค้า/ผู้ใช้/ประวัติ ควรแสดงข้อมูล DB เดิมครบ
3. ลองค้นหาและ pagination หน้า orders/products/users ควรแสดงจำนวนตาม API และเปลี่ยนหน้าได้
4. ลองเพิ่ม/แก้/ลบ/กู้คืนรายการตามสิทธิ์ ควรมี validation/confirmation/SuccessAlert เหมือนเดิม
5. เปิด /design-preview ควร404; หน้าใช้งานจริงยังเปิดได้

ไม่ต้องรัน seed เพื่อทดสอบการเก็บกวาดนี้
