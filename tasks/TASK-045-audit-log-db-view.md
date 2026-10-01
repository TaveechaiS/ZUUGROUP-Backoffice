# TASK-045 — เปลี่ยนหน้า Audit Logs ไปอ่าน DB

- **สถานะ:** READY_FOR_USER_TEST — เจ้าของโครงการอนุมัติ 2026-10-01
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ร่างข้อกำหนด](../docs/specs/2026-10-01-audit-log-db-view.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-audit-log-db-view-plan.md)

## ขอบเขต

แทนรายการ Audit Mock ด้วย `audit_events` จริง เฉพาะอ่านโดย Admin; ไม่มี migration/seed และไม่มีคำสั่งสร้าง ลบ หรือส่งออก

## เงื่อนไขเริ่ม

เจ้าของโครงการอนุมัติ Specs/Task นี้ตาม AGENTS.md ข้อ 3 แล้วเมื่อ 2026-10-01

## ผลตรวจ

- DB มีเหตุการณ์จริง 12 รายการ; ทดสอบ query แบบ join กับผู้ทำ/ผู้เกี่ยวข้อง เรียงล่าสุดและจำกัด 20 แถวได้
- หน้า `/audit-logs` อ่าน DB ผ่าน Server โดยตรวจ Admin ก่อน query; ค้นหาและกรอง action ได้ แบ่งหน้าและแสดงเวลา พ.ศ./Asia/Bangkok
- เอา `data.ts` และหน้า `/audit-logs/create` แบบ Mock ออก; ไม่เพิ่ม schema หรือข้อมูลปลอม
- TypeScript, ESLint และ production build ผ่าน; build ไม่มี route `/audit-logs/create`
- รอเจ้าของโครงการตรวจหน้าและสิทธิ์ด้วยบัญชีจริง

## ⚠️ ต้องทดสอบโดยคุณ

หลัง implementation เปิด `/audit-logs` ด้วย Admin ควรเห็นเหตุการณ์จริงและไม่มีข้อมูล Mock; ลองเข้าด้วย Role อื่นต้องถูกปฏิเสธ; `/audit-logs/create` ต้องไม่เปิดฟอร์มเพิ่มเหตุการณ์
