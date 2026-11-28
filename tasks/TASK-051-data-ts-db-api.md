# TASK-051 — ย้าย data.ts เข้า DB และ GET API

- สถานะ: READY_FOR_USER_TEST (เจ้าของอนุมัติ 2026-10-01 ให้ใช้ข้อมูลเดิมและข้อหลักก่อน)
- ผู้รับผิดชอบ: AI
- Branch: AI
- Specs: [ร่าง](../docs/specs/2026-10-01-data-ts-db-api.md)
- Plan: [แผนย่อย](../docs/plans/2026-10-01-data-ts-db-api-plan.md)

## ผลสำรวจ

พบ data.ts 19 ชุด 57 แถวต้นฉบับ; มีการทำซ้ำเป็น 30 แถวต่อหน้ารายการ. หลายแถวมีเพียงข้อความสาธิต ไม่มีข้อมูลบังคับและ FK ของเอกสารธุรกิจจริง

ย้ายต้นฉบับเป็นชุดตัวอย่างใน DB พร้อม GET แยก module, detail, config, filters และ pagination 10 ตามขอบเขตที่อนุมัติ; หน้าเพิ่มชุดตัวอย่างแจ้งว่ายังไม่เปิดบันทึก DB และไม่บันทึก sessionStorage เพื่อไม่แสดงผลสำเร็จลวง

## ⚠️ ต้องทดสอบโดยคุณ

หลังทำตามขอบเขตที่อนุมัติ: เปิดแต่ละกลุ่มใน Postman ส่ง list/getbyid/filters; ควรเห็นข้อมูลจาก DB ครั้งละ 10 พร้อม pagination และ isSample. เปลี่ยน Filter/หน้าในเว็บแล้วควรโหลดเฉพาะข้อมูลที่ใช้

## ผลดำเนินงาน

- สร้าง demo_datasets/demo_rows พร้อม RLS และถอน grant ของ anon/authenticated; Supabase migration 20261001092733_demo_datasets และ Prisma history บันทึกแล้ว (ใช้ checksum ไฟล์ผ่าน SQL เพราะ schema engine เข้า connection ไม่ได้)
- นำข้อมูลเดิม 19 ชุด/57 แถวเข้า DB; ไม่มีการเติมแถวซ้ำ; fixture สำหรับ seed อยู่ scripts/fixtures/demo-datasets.json
- GET แยก list/detail/config/filters สำหรับทั้ง 19 ชุด และ catalog; default 10/max50, ค้นหา/Filter/pagination ฝั่ง DB, error 400/404/503
- หน้ารายการ 18 หน้า, Dashboard และรายละเอียดลูกค้าอ่าน API; ลบ data.ts 19 ไฟล์และ helper Mock; Create ของชุดตัวอย่างหยุดบันทึกชั่วคราวใน browser
- Postman Collection Zuugroup มี 87 GET (เพิ่ม 77); list scripts 23 เก็บ ID ลง Variables; ไม่ยิง HTTP ตามคำสั่งผู้ใช้
- Prisma generate, TypeScript, ESLint, build และ diff-check ผ่าน; รอผู้ใช้ตรวจหน้าและ GET จริง
- ตรวจ seed ซ้ำผ่าน Supabase SQL แล้วจำนวนคงเดิม 19 ชุด/57 แถว; local seed รอบตรวจซ้ำพบ ECONNRESET จึงใช้ MCP แทน ไม่ยิง HTTP. ตรวจ RLS=true และ anon/authenticated SELECT=false ทั้งสองตาราง
