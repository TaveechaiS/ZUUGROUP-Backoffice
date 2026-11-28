# แผนย่อย TASK-045 — Audit Logs จาก DB

**สถานะ:** APPROVED — เจ้าของโครงการอนุมัติ TASK-045 วันที่ 2026-10-01

## ลำดับและผลลัพธ์

1. ตรวจ `tasks/ACTIVE.md` อีกครั้งและยืนยันว่าไม่มีงานทับไฟล์ Audit; ตรวจข้อมูลตัวอย่างจริงใน `audit_events` และรายการฟิลด์ที่บันทึก
2. สร้าง Server read แบบจำกัดหน้า/เรียงล่าสุดและตรวจ Admin ก่อน query; ไม่เปิด `before`/`after` JSON ดิบ
3. แทน `/audit-logs` Mock ด้วยรายการจริงและสถานะว่าง; ปิดฟอร์ม `/audit-logs/create`; เอา `src/app/audit-logs/data.ts` ออกเมื่อไม่มีผู้อ้างอิง
4. ตรวจ DB query, สิทธิ์ Admin/Role อื่น, หน้าไม่มีข้อมูล, การแบ่งหน้า, เวลา พ.ศ./Asia/Bangkok, lint/type-check/build และ UAT

## ไฟล์ที่จะเปลี่ยนหลังอนุมัติ

- `src/app/audit-logs/page.tsx`, `src/app/audit-logs/create/page.tsx`, `src/app/audit-logs/data.ts`
- `src/server/audit-logs/*` และ component หน้ารายการ Audit ที่จำเป็น
- `src/app/README.md`, `tasks/TASK-045-audit-log-db-view.md`, `tasks/ACTIVE.md`

## ข้อจำกัด

ใช้ schema `audit_events` ที่มีอยู่ ไม่สร้าง migration/seed และไม่เปลี่ยนการบันทึกเหตุการณ์. การส่งออก/เก็บรักษาและรายละเอียด JSON รอข้อกำหนดต่อไป
