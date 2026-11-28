# แผนย่อย TASK-042 — ข้อมูลหลักสินค้าใน DB

**สถานะ:** APPROVED — เจ้าของโครงการอนุมัติ 2026-10-01
**อ้างอิง:** [ข้อกำหนดสินค้า](../specs/2026-10-01-product-master.md), [แผนหลัก](2026-09-23-1635-project-plan.md) Phase 5

## ลำดับและผลลัพธ์

1. เจ้าของโครงการตรวจรับ Specs/Plan/Task ตาม AGENTS.md; บันทึกคำแก้ก่อนเริ่มโค้ด
2. เพิ่ม schema และ migration ของข้อมูลหลักสินค้า รวมรายการแม่หมวด รูปแบบยา ตัวยา และคลังอ้างด้วย ID; มี unique code, index สำหรับรายการ/ค้นหา และ RLS ของตารางใน `public`; ตรวจ migration กับ DB ทดสอบ
3. ทำ service ฝั่ง Server สำหรับรายการ/รายละเอียด/เพิ่ม/แก้/สถานะ/ลบ ตามคำตอบ; ตรวจข้อมูลและสิทธิ์ที่ Server, บันทึก Audit ของการเปลี่ยน
4. เปลี่ยนหน้า `/products`, `/products/create`, `/products/[ref]` จาก Mock เป็นข้อมูลจริง โดยยังไม่แสดง Stock/Lot/สถานะหมดอายุที่ไม่มีข้อมูลจริง
5. เพิ่ม seed ตัวอย่างแบบ idempotent และติดป้ายตัวอย่างใน DB/UI; ไม่ลบหรือเขียนทับข้อมูลที่ผู้ใช้แก้
6. ตรวจ migration, RLS, กรณีรหัสซ้ำ/คำขอพร้อมกัน, ID ที่ไม่มีจริง, validation, สิทธิ์, seed ซ้ำ, lint/type-check/build และ UAT

## ไฟล์ที่คาดว่าจะเปลี่ยน

- `prisma/schema.prisma`, `prisma/migrations/*`, `src/generated/prisma/*` (generated)
- `src/server/products/*`, `src/app/products/page.tsx`, `src/app/products/create/*`, `src/app/products/[ref]/*`, และ component ที่ใช้เฉพาะหน้าสินค้า
- `scripts/*` สำหรับ seed ที่รันซ้ำได้; `docs/specs/2026-10-01-product-master.md`, `docs/plans/2026-10-01-product-master-plan.md`, `tasks/TASK-042-product-master.md`, `tasks/ACTIVE.md`

ไฟล์จริงอาจลดลงเมื่อสำรวจโค้ด; หากต้องแก้ไฟล์ร่วมของโมดูลอื่น ให้ปรับขอบเขต Task ก่อนแก้

## วิธีตรวจรับ

หน้า `/products` ใช้ข้อมูล DB จริง; สร้าง/แก้/กรอง/ดูรายละเอียดทำงานตามสิทธิ์; รหัสไม่ซ้ำแม้กดพร้อมกัน; seed ซ้ำไม่เพิ่มแถวและไม่ทับงานผู้ใช้; ตารางเปิด RLS; ไม่มีคำสั่งสต็อกหรือ Ledger เพิ่ม; เจ้าของโครงการทดสอบใน Cloud project ปัจจุบัน
