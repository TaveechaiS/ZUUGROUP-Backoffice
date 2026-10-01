# TASK-047 — เตรียม Postman ต่อ PostgreSQL โดยตรง

- **สถานะ:** IN_PROGRESS — รอเชื่อม Postman Desktop
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ข้อกำหนด](../docs/specs/2026-10-01-postman-direct-db.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-postman-direct-db-plan.md)

## ขอบเขต

เตรียม SQL อ่านข้อมูลจริงและคู่มือสำหรับ Data requests ของ Postman; ไม่แก้ DB และไม่เก็บข้อมูลเชื่อมต่อ

## ผลตรวจ

ทดสอบ 4 คำสั่ง `SELECT` กับ Supabase project ปัจจุบันผ่านแล้ว. ยังไม่มี Postman connection ที่เครื่องมือของ AI เข้าถึงได้ จึงรอเจ้าของโครงการเชื่อมต่อก่อนตั้งค่า Data requests ในแอป

## ⚠️ ต้องทดสอบโดยคุณ

หลังเชื่อม Postman ให้สร้าง Data request แบบ PostgreSQL, เปิด Read-only แล้วรัน SQL จาก `postman/sql`. ควรเห็นข้อมูลจาก DB จริงและไม่มีการเปลี่ยนจำนวนแถว
