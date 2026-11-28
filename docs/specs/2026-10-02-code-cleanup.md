# เก็บกวาดโค้ดและ Mock — TASK-072

สถานะ: APPROVED เจ้าของอนุมัติ “ok” 2026-10-02

## ข้อกำหนดเจ้าของ

ไล่ลบข้อมูลที่ไม่ใช้และ Mock ในโค้ด โดยทำแผนก่อน ไม่ใช่คำสั่งลบข้อมูลที่ลง DB แล้ว รอบนี้สำรวจและบันทึกเอกสารเท่านั้น

## ผลตรวจและขอบเขตเสนอ

| รายการ | หลักฐาน | ข้อเสนอ |
|---|---|---|
| DashboardPlaceholder / ModulePlaceholder ใน admin-shell.tsx | พบเฉพาะ declaration ไม่มี consumer ใน src | ลบสองฟังก์ชันและ import ที่เหลือไม่ใช้ คง AdminShell |
| moduleForPage ใน features/records/types.ts | พบเฉพาะ declaration | ลบ export นี้ คง moduleFor/RECORD_MODULES/type ที่ server และ Dashboard ใช้ |
| scripts/fixtures/initial-records.json | ไม่พบ consumer ใน src/scripts | ตรวจจุดอ้างอิงทั้งหมดอีกรอบแล้วลบ fixture เก่าหากไม่มี consumer |
| scripts/migrate-operational-data.mjs และ operational-import.sql | อ้าง demo_rows ที่ migration ถอนแล้ว; README ระบุห้ามรัน | ลบเครื่องมือย้ายครั้งเดียว ปรับคู่มือให้ใช้ seed ปัจจุบัน |
| app/design-preview/page.tsx | เป็น route จริงแต่มีข้อความเก่าว่า Audit/ตั้งค่ายังเป็นตัวอย่าง ขณะที่หน้าใช้งานอ่าน DB แล้ว | เสนอถอนหน้ารวมตัวอย่างเก่า ตรวจลิงก์ปัจจุบันและเอาออก; URL นี้จะ 404 หลังถอน |
| seed-product-master.mjs/.sql | package.json ยังมี seed:products และใช้ชื่อสินค้า (ตัวอย่าง), is_sample=true | เก็บคำสั่ง seed แต่ปรับให้ข้อมูลเริ่มต้นใช้ชื่อปกติและไม่เพิ่มป้าย sample; ไม่ UPDATE/DELETE แถวเดิม ไม่รัน seed รอบนี้ |
| isSample ใน product-ui.ts / products/service.ts | type และ response mapping ยังส่งค่าแต่ไม่พบ UI ใช้ | ถอดจาก internal ProductView และ mapping หลังตรวจ consumer; คง Prisma field/DB column และ historical audit actions |
| package dependencies/exports อื่น | ตรวจ reference เพิ่มระหว่าง implementation | ลบเฉพาะที่ยืนยันไม่มีใช้ทั้ง import/runtime/config; @heroui/styles ใช้ใน globals.css ต้องเก็บ; dependency ที่ยังไม่พิสูจน์ให้เก็บและรายงาน |

## สิ่งที่ต้องรักษา

- ข้อมูล DB ปัจจุบันทั้งหมด รวมข้อมูลเริ่มต้นที่เจ้าของให้ใช้งานจริง ไม่เปลี่ยน schema หรือยิง DB
- Seed ปัจจุบัน, recover-admin, API, validation, RBAC, audit, pagination และ shared UI ที่ใช้งาน
- Prisma/Supabase migration history รวม migration ที่มีชื่อ demo: เป็นประวัติการสร้างและถอนตาราง ไม่ใช่ runtime Mock
- scripts/fixtures/operational-migration-backup.json: migration ทั้งสองชุดอ้างเป็น archive เก็บเพื่อย้อนตรวจข้อมูล
- test-pagination.mjs ที่มี DB stub: เป็นชุดตรวจออฟไลน์ ไม่ใช่แหล่งข้อมูลหน้าเว็บ
- modules.json: เป็น definition ของ schema/ฟิลด์/validation/server ไม่ใช่แถวข้อมูล Mock
- ข้อความ placeholder ของ input, loading fallback, empty state และหมายเหตุข้อจำกัดรายงาน เป็น UI ที่จำเป็น
- เอกสารประวัติเดิมไม่ไล่เปลี่ยนคำว่า Mock ทุกแห่ง อัปเดตเฉพาะคู่มือใช้งานปัจจุบันและใส่หมายเหตุเกษียณเครื่องมือ

## ตรวจรับ

ผลตรวจ exports ระหว่าง implementation: formatThaiDate (config/app), listProducts/getProductById (products service), listUsers (users service), Logins (service/http) ไม่มี consumer ใน src/scripts จึงอยู่ในรายการ dead exports ที่ลบ คง Next convention exports เช่น metadata/proxy/page/layout/loading ส่วน @heroui/react ไม่มี import หรือ config consumer ถอนจาก package/lock และคง @heroui/styles ที่ globals.css ใช้

ไม่มี import/คำสั่งชี้ไฟล์ที่ลบ ไม่มี fallback แถวข้อมูลแต่งขึ้นใน runtime หน้าใช้งานเดิมอ่าน API/DB ต่อได้ TypeScript/lint/build และชุดตรวจออฟไลน์ผ่าน รอเจ้าของเปิดหน้าจริง ไม่ทดสอบ live API/DB อัตโนมัติ
