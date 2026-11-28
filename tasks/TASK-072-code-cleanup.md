# TASK-072 — เก็บกวาดโค้ดและ Mock ที่ไม่ใช้

- สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติ “ok” 2026-10-02 ทำครบ ผลใน docs/CODE-CLEANUP-RESULT.md
- Branch: AI
- Specs: docs/specs/2026-10-02-code-cleanup.md
- Plan: docs/plans/2026-10-02-code-cleanup-plan.md
- ผล: ลบ dead code/fixture/import tools/preview/@heroui-react และปรับ Seed/ProductView ตาม Specs คง schema/DB/backup/migrations ไม่ยิง live API/seed ไม่ commit/push

เป้าหมายลบ dead placeholder/export, fixture ไม่มี consumer, เครื่องมือ import demo_rows ที่ถอนแล้ว และ preview เก่า ปรับ seed ให้ใช้ชื่อข้อมูลปกติ เก็บข้อมูล DB/seed/migrations/backup/test stubs และ definitions ที่ใช้งาน

ก่อน implementation ต้องได้อนุมัติ Specs/Plan/Task ตาม AGENTS.md ข้อ3 จากนั้นตรวจรายไฟล์ก่อนลบและอัปเดต ACTIVE ตามลำดับแผน

⚠️ ต้องทดสอบโดยคุณ: หลังทำตามแผน เปิดหน้ารายการ/เพิ่ม/รายละเอียดและตรวจข้อมูลเดิม, pagination/Combobox, confirmation/สิทธิ์ยังทำงาน ส่วน /design-preview ที่เสนอถอนจะ404
