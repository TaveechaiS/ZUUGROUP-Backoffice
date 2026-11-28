# Checkpoint — 2026-10-01

เจ้าของสั่งหยุดงานเพื่อ commit/push และทำต่อในรอบถัดไป. Branch AI; ห้าม force push/สร้าง branch ใหม่.

## ทำแล้ว

- TASK-052 อนุมัติแล้ว: ตารางธุรกิจจริง 14 โมดูล, CRUD พื้นฐาน, soft delete/restore, Admin เขียน/Role อื่นอ่าน, audit, public GET เฉพาะฟิลด์ที่อนุมัติ.
- ย้ายข้อมูลเดิมและเก็บ mapping 48 แถว; สำรองต้นฉบับ 57 แถว/19 ชุดใน scripts/fixtures/operational-migration-backup.json. ถอน demo_rows/demo_datasets และ /api/demo แล้ว.
- Migration 20261001095320_operational_data และ 20261001101152_retire_demo_storage ลง Supabase และบันทึก _prisma_migrations แล้ว; Prisma generate ผ่าน.
- Seed ลง DB และรันซ้ำตรวจแล้ว: 14 โมดูลโมดูลละ 15 รายการ, products15, categories15, dosage_forms15, drugs17, warehouses18. ไม่ทับข้อมูลเดิม; บัญชี 4 Role เดิม. Script scripts/seed-operational-data.mjs และ SQL, package seed:records พร้อม.
- Postman Zuugroup UID 55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903 มี 167 requests/23 folders (GET107/POST32/PATCH14/DELETE14), body60, scripts32, create scripts14 จำ UUID ใหม่, ไม่มี URL demo. ไม่มีรหัสผ่าน/token/secret จริงใน Collection.
- UI create/detail/edit/list ใช้ DB/API จริง. รายการใหม่ default10/max50; filters/options แยกเส้น. Dashboard/รายงานอ่านต้นทาง.
- Build/lint/type-check ผ่านก่อนปรับข้อความปุ่มและ reset หน้าเมื่อ restore รอบสุดท้าย. git diff --check ผ่านก่อน checkpoint. ไม่ยิง HTTP/ล็อกอิน ตามคำสั่งผู้ใช้เดิม.

## ข้อจำกัด / งานค้างที่ต้องอ่านก่อนต่อ

- ยังไม่ได้ UAT CRUD/Auth/RBAC ผ่าน HTTP หรือ browser. ต้องให้เจ้าของตรวจจริง.
- สินค้าหน้าเดิมและ authenticated /api/products ยังอ่านชุดเต็ม; public-service default20 (Postman ระบุ limit10). รอบถัดไปประเมินให้ pagination/filter ฝั่ง DB สอดคล้องทุกเส้น.
- Seed รันซ้ำไม่เพิ่มรายการซ้ำ แต่เพิ่ม audit system.seed.initial_records ทุกครั้ง.
- เอกสารใหม่เป็นร่าง/amount NULL; สินค้าใหม่ราคา0 ต้องใส่จริง. ไม่มี Ledger/Lot/ยอดสต็อก/ชำระ/ภาษี/อนุมัติที่เดากฎธุรกิจ.
- scripts/migrate-operational-data.mjs และ operational-import.sql เป็นประวัติย้ายครั้งเดียว อ้างตารางที่ถอนแล้ว ห้ามรันเป็น seed ใหม่.
- TASK-051 เป็นประวัติและถูกแทนที่ด้วย TASK-052; เอกสารเก่าบางส่วนยังบรรยายระบบ demo ที่เลิกใช้.

## คำขอรอบถัดไปจากเจ้าของ

“ปรับจาก route มาเป็น types/api.ts จะดีกว่าไหมและทำ Schema กับ Seed ไว้”

ข้อเสนอ: route.ts ยังคงเป็น HTTP entry point ของ Next.js; แยก request/response types ไป src/types/api.ts หรือไฟล์รายโมดูล, แยก validation schema และ service ให้ route บางลง. TypeScript types ไม่ตรวจ runtime จึงควรทบทวน validation schema แยก. Prisma schema/migrations/seed มีแล้ว ให้ตรวจความสอดคล้องและทำคู่มือการใช้ซ้ำ.

ก่อนโค้ดรอบถัดไป: อ่าน ACTIVE/Specs/Plan และ Next.js local docs, จัดแผนย่อย/Specs/Task สำหรับขอบเขต types/validation/pagination ที่จะเปลี่ยนและให้เจ้าของอนุมัติ. ยังไม่เริ่ม refactor ตามคำขอนี้.

## ⚠️ ต้องทดสอบโดยคุณ

1. เปิดรายการลูกค้า/ผู้ขาย/เอกสาร: 15 รายการ แสดงหน้าแรก10 และหน้าถัดไป5; search/filter ตรง DB.
2. Admin เพิ่ม/แก้/ลบ/กู้คืนรายการ: list/detail/Postman ใช้ UUID เดียวกัน, รายการลบซ่อนและกลับมาได้.
3. Role อื่น POST/PATCH/DELETE/restore ต้องถูกปฏิเสธ403; GET สาธารณะยังอ่านเฉพาะฟิลด์ที่อนุมัติ.
4. Dashboard/รายงานไม่มีเลขยอดสต็อก/หนี้/รายได้ที่ไม่มีต้นทาง.
