# TASK-020 — ปรับ Sidebar ย่อยลูกค้า

**สถานะ:** READY_FOR_USER_TEST

**Specs:** [Sidebar ย่อยลูกค้า](../docs/specs/2026-09-24-customer-secondary-sidebar-cleanup.md)

**Plan:** [แผนสั้น](../docs/plans/2026-09-24-customer-secondary-sidebar-cleanup-plan.md)

**Branch / Commit ตั้งต้น:** `AI` / `846c251`

**ขอบเขต:** เอาหัวข้อ “ลูกค้า”, คำว่า “เมนูย่อย” และช่องค้นหาออกจาก Sidebar ย่อย; คงลิงก์ทุกหน้าและความกว้าง 250px. Container ไม่มี padding แนวนอนและใช้ `py-2`; padding ภายในลิงก์คงเดิม.

**ไฟล์:** `src/components/layout/sidebar.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดหน้าลูกค้าบน Desktop: ไม่เห็นหัวข้อ “ลูกค้า”, คำว่า “เมนูย่อย” หรือช่องค้นหา.
- รายการลิงก์ลูกค้ายังแสดงและเปิดหน้าต่างๆ ได้.
- ตรวจว่า container ไม่มี padding แนวนอนและมี padding แนวตั้ง `py-2`; padding ภายในลิงก์ยังช่วยให้คลิกได้สะดวก.
- ตรวจว่าพื้นที่ Sidebar ย่อยกว้าง 250px และไม่กระทบ Sidebar หลัก.