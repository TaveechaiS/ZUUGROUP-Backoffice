# TASK-052 — ข้อมูลตั้งต้นในตารางธุรกิจจริง

- สถานะ: PAUSED_BY_OWNER — เจ้าของอนุมัติ 2026-10-01 และสั่ง checkpoint/commit/push
- Branch: AI
- ผู้รับผิดชอบ: AI
- Specs: [ข้อกำหนด](../docs/specs/2026-10-01-operational-data.md)
- Plan: [แผนย่อย](../docs/plans/2026-10-01-operational-data-plan.md)

เจ้าของอนุมัติและทำ schema/API/UI/seed/Postman แล้ว. หยุดตามคำสั่งเจ้าของ; ผลงานและงานค้างอยู่ใน [Checkpoint](CHECKPOINT-2026-10-01.md). ยังไม่เริ่ม refactor types/api.ts รอบถัดไป.

## ⚠️ ต้องทดสอบโดยคุณ

หลังทำ: เพิ่มลูกค้าในหน้า create แล้วเปิด list/detail/Postman ควรพบ UUID เดียวกันและข้อมูลจาก DB; แก้ข้อมูลแล้วเห็นทุกหน้าเปลี่ยนตาม; ลบหายจากรายการและกู้คืนได้; Role ที่ไม่มีสิทธิ์เขียนควรได้ 403. Dashboard/รายงานต้องไม่มีตัวเลขเดิมที่ไม่ตรงต้นทาง และไม่มีโฟลเดอร์ Demo ใน Postman
