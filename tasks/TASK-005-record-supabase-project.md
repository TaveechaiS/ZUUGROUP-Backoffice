# TASK-005 — บันทึก Supabase Cloud project

| รายการ | รายละเอียด |
|---|---|
| Phase | 0 — เตรียมงานและตัดสินใจ |
| ผู้รับผิดชอบ | AI |
| สถานะ | DONE |
| เอกสารอ้างอิง | `SPEC-PROJECT-001` รุ่น 0.2 และ `PLAN-PROJECT-001` รุ่น 0.1 |
| Commit ตั้งต้น | `HEAD` บน Branch `AI` |

## ขอบเขต

- บันทึกข้อมูลระบุตัว Supabase project ที่ผู้ใช้สร้างเมื่อ 2026-09-24
- ปิด G-02 และ OPEN-09 ตามค่าที่ผู้ใช้ยืนยันและข้อมูลหน้า Dashboard
- บันทึกข้อกำหนดว่ารหัสผ่าน/Secret ต้องเก็บเฉพาะ Environment ในเครื่อง ไม่ใส่ Git

## ไฟล์ที่กระทบ

- `docs/DECISIONS.md`
- `docs/HANDOFF.md`
- `tasks/ACTIVE.md`
- `tasks/BLOCKED.md`
- `tasks/COMPLETED.md`
- `tasks/TASK-005-record-supabase-project.md`

## Gate และ OPEN

- G-01 และ G-02 ผ่านแล้ว; Phase 1 พร้อมเริ่ม
- ไม่มีการอ่าน บันทึก หรือเผยแพร่ Password, Secret API Key หรือ connection string ที่มีรหัสผ่าน

## การตรวจ

- ตรวจชื่อองค์กร, project ref, URL, Region และสถานะ Healthy จากหน้า Supabase Dashboard
- งานเอกสารนี้ไม่เปลี่ยนพฤติกรรมระบบ จึงไม่มีหัวข้อ **⚠️ ต้องทดสอบโดยคุณ**
