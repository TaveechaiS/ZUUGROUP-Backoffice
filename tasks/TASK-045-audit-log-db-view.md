# TASK-045 — เปลี่ยนหน้า Audit Logs ไปอ่าน DB

- **สถานะ:** DRAFT — รอเจ้าของโครงการอนุมัติ
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ร่างข้อกำหนด](../docs/specs/2026-10-01-audit-log-db-view.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-audit-log-db-view-plan.md)

## ขอบเขต

แทนรายการ Audit Mock ด้วย `audit_events` จริง เฉพาะอ่านโดย Admin; ไม่มี migration/seed และไม่มีคำสั่งสร้าง ลบ หรือส่งออก

## เงื่อนไขเริ่ม

เจ้าของโครงการอนุมัติ Specs/Task นี้ตาม AGENTS.md ข้อ 3 ก่อนแก้หน้าเว็บหรือ Server

## ⚠️ ต้องทดสอบโดยคุณ

หลัง implementation เปิด `/audit-logs` ด้วย Admin ควรเห็นเหตุการณ์จริงและไม่มีข้อมูล Mock; ลองเข้าด้วย Role อื่นต้องถูกปฏิเสธ; `/audit-logs/create` ต้องไม่เปิดฟอร์มเพิ่มเหตุการณ์
