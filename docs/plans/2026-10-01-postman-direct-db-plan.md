# แผนย่อย TASK-047 — Postman Data requests สำหรับ Supabase DB

## ลำดับและผลลัพธ์

1. ตรวจ `tasks/ACTIVE.md`, schema ปัจจุบันและวิธีเชื่อม PostgreSQL ใน Postman Desktop
2. เขียน SQL แบบ `SELECT` ที่จำกัดแถวและเลือกเฉพาะฟิลด์ตรวจสอบสำหรับ 4 ชุดข้อมูล
3. ทดสอบ SQL แบบ read-only กับ Supabase project ปัจจุบัน; ปรับ `postman/README.md` แยกขั้นตอน API กับ DB
4. สร้าง Data requests ใน Postman Desktop จากไฟล์ SQL และทดสอบ connection/query โดยไม่บันทึก credential ใน repo; Postman connector ที่เชื่อม Workspace ยังไม่มีคำสั่งสร้าง Data request จึงต้องทำส่วนนี้ใน Desktop

## ไฟล์ที่จะเปลี่ยน

- `docs/specs/2026-10-01-postman-direct-db.md`
- `docs/plans/2026-10-01-postman-direct-db-plan.md`
- `postman/README.md`, `postman/sql/*.sql`
- `tasks/TASK-047-postman-direct-db.md`, `tasks/ACTIVE.md`

## วิธีตรวจรับ

Postman Data request เชื่อมด้วย Session pooler และรันแต่ละ `SELECT` ได้; ผลลัพธ์ตรงกับ DB และ Read-only เปิดอยู่; ไม่มี Credential ในไฟล์ที่ commit
