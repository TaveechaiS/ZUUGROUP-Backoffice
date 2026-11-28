# แผนย่อย TASK-052 — ใช้ตารางจริงและข้อมูลชุดเดียว

สถานะ: เจ้าของอนุมัติแล้ว; ขอบเขตใหม่แทน TASK-051

| ลำดับ | งาน/ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | ตรวจรับ |
|---|---|---|---|
| 1 | อนุมัติฟิลด์หลักและขอบเขต CRUD/สิทธิ์ ตาม Specs | docs/specs/*operational-data*, docs/plans/*operational-data*, tasks/ACTIVE.md, TASK-052 | เจ้าของอนุมัติ |
| 2 | Schema ตารางข้อมูลหลักและหัวเอกสาร; migration/mapping ข้อมูลเดิม | prisma/schema.prisma, prisma/migrations/*, scripts/migrate-operational-data*, scripts/fixtures/* | ไม่มีรหัสซ้ำ; FK ไม่เดา; UUID/mapping ตรวจได้; RLS/GRANT |
| 3 | ข้อมูลหลักลูกค้า/กลุ่ม/เขต/เอกสาร/ติดตาม/ผู้ขาย และ CRUD | src/server/customers/*, src/server/suppliers/*, src/app/api/*, src/app/customers/*, src/app/suppliers/* | บันทึก แก้ ลบ กู้คืนใน DB จริง; API/UI ชุดเดียว |
| 4 | ข้อมูลพื้นฐานค่าใช้จ่าย/จัดซื้อ/ใบเสนอราคา/คำสั่งซื้อ/วางบิล/โปรโมชั่น/ตรวจนับ/ตั้งค่า | src/server/<module>/*, src/app/api/<module>/*, src/app/<module>/* | CRUD หัวรายการ; ไม่ทำ Ledger หรือสูตร OPEN |
| 5 | Dashboard/รายงานจากต้นทาง; เปลี่ยน component ให้ใช้ API รายโมดูล | src/app/dashboard-page-content.tsx, src/app/reports/*, src/components/pages/*, src/features/*, src/proxy.ts, src/server/db/prisma.ts | ไม่มีตัวเลขสรุปที่ไม่มีต้นทาง; list 10/search/filter ฝั่ง DB |
| 6 | Postman เป็นกลุ่มจริง เพิ่ม write/restore/token ตามสิทธิ์; เลิก demo routes หลังย้ายผู้ใช้งานครบ | postman/*, Workspace Zuugroup, src/app/api/demo/*, src/server/demo/*, src/features/demo/* | URL ตรง API; ไม่มีชุดข้อมูลกลางซ้ำ; ใช้ Variables เดิมได้ |
| 7 | ตรวจ migration/ข้อมูลและ static checks; บันทึก UAT/ข้อจำกัด | Specs/Plan/Task/คู่มือ | generate/type-check/lint/build; ไม่ยิง HTTP ตามคำสั่งเดิม |

ประกาศและบันทึกขอบเขตก่อนแต่ละขั้น; ไม่ถอนตารางเดิมก่อน migration/mapping และแหล่งอ่านครบ. บันทึกข้อมูลใหม่ใน Specs ก่อนเริ่มกฎที่ยัง OPEN

### งานย่อยเติมข้อมูลตามคำขอล่าสุด

ไฟล์ scripts/seed-operational-data.mjs และ scripts/seed-operational-data.sql: ตรวจชุดข้อมูลแม่และจำนวนปัจจุบัน เติมแบบไม่ซ้ำจนมีอย่างน้อย 15 รายการต่อโมดูล/สินค้า เชื่อม FK จริง ใช้หัวเอกสารร่างและไม่สร้าง Ledger. ลง DB ใน transaction และบันทึก audit ระบบ; ตรวจจำนวนและ seed ซ้ำไม่ทับข้อมูล; เพิ่มใน package/คู่มือ. บัญชี Auth รอคำตอบผู้ใช้และทำข้อมูลส่วนอื่นต่อ
