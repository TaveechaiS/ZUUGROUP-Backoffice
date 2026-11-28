# แผนย่อย TASK-076

สถานะ: APPROVED — เจ้าของอนุมัติ “ทำได้เลย” 2026-10-02

## ลำดับ

1. ตรวจ seed/registry/schema และอ่าน DB เฉพาะข้อมูลที่ต้องระบุรายการตั้งต้น (อ่านแล้ว: 14×15 records, 16 products, 18 warehouses)
2. จัด catalog ชื่อและรายละเอียดสมจริงทุกโมดูลตาม Specs ให้ครบฟิลด์เดิม และอ้างลูกค้า/ผู้ขาย/คลังสัมพันธ์กัน
3. เตรียม snapshot และแผน UPDATE รายฟิลด์ ตรวจชื่อเดิม/ค่าเดิมและ provenance แยกข้อมูลผู้ใช้แก้ไว้ ไม่ลบแถวหรือเปลี่ยน code/ID
4. ปรับ seed-operational-data.mjs/SQL และ product seed ให้ใช้ catalog นี้สำหรับฐานใหม่และรันซ้ำได้ ตรวจ offline ว่าครบฟิลด์ ไม่มีชื่อรันเลข/ชื่อซ้ำ ไม่ใส่ลิงก์เอกสารที่ไม่มีไฟล์
5. ลงข้อมูลธุรกิจใน project ปัจจุบันด้วย transaction หลังอนุมัติ บันทึก Audit งานจริง; หากเกิดข้อผิดพลาด rollback ทั้งชุด
6. อ่านกลับสรุปจำนวน/ชื่อรันเลข/ความสัมพันธ์/รายการข้าม ตรวจ snapshot/แผนย้อนกลับ ส่งคู่มือ UAT ให้เจ้าของ โดยไม่ login/Send API อัตโนมัติ

## ไฟล์ที่จะเปลี่ยน

- docs/specs/2026-10-02-realistic-data.md, แผนนี้, Specs/Plan หลัก, tasks/ACTIVE.md และ TASK-076
- scripts/seed-operational-data.mjs, scripts/seed-operational-data.sql, scripts/seed-product-master.sql และ runner เท่าที่จำเป็น
- ไฟล์ catalog ภายใน scripts สำหรับ seed ที่รันจริง ไม่สร้าง mock frontend หรือ data.ts
- .gitignore เพื่อเก็บ snapshot/refresh SQL ที่มีข้อมูล DB จริงเป็นไฟล์เฉพาะเครื่อง ไม่ปนกับ seed catalog ใน Git
- scripts สำหรับ refresh ที่ตรวจค่าเดิม/snapshot/rollback และ offline checks; คู่มือผล/ทดสอบใน docs
- ไม่เปลี่ยน prisma/schema.prisma, migration, API, types หรือ page.tsx

## ผลลัพธ์และตรวจรับ

ชุดข้อมูลใช้งาน DB ครบทุกโมดูลอย่างน้อย 15 รายการ ชื่อ/รายละเอียด/ผู้ดูแลอ่านรู้เรื่อง ไม่มีชื่อเลขลำดับของ seed ที่ยังไม่ได้แก้โดยเจ้าของ รหัส/ID คงเดิม มีรายงานก่อน/หลังและรายการข้าม รันซ้ำไม่เกิดสำเนาใหม่

เจ้าของ Refresh รายการ/รายงาน ดูหน้า 1/2 เลือกตัวกรอง เปิดรายละเอียด และตรวจลูกค้า/ผู้ขาย/คลังสัมพันธ์กัน ระบบยังใช้ API เดิม รายงานยอดเป็นหัวเอกสาร ไม่มีการเปลี่ยน stock

ผล: ทำครบและลง DB 240แถวไม่ซ้ำแล้ว ลูกค้ายังคง14ใช้งาน+1ลบแล้วตามการลบของเจ้าของ ไม่กู้คืนเพื่อเติมจำนวน ชื่อรันเลข/ชื่อซ้ำศูนย์ ตรวจlint/offline/SQLdryrollback/readbackผ่าน รอUAT ดู docs/REALISTIC-DATA-RESULT.md
