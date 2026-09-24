# งานที่รอคำตอบหรือเงื่อนไข

| กลุ่มงาน | สถานะ | สิ่งที่ต้องรอ | อ้างอิง |
|---|---|---|---|
| Phase 1 — พื้นฐานโครงการ | READY_FOR_USER_TEST | G-01/G-02 ผ่านแล้ว; Supabase Cloud project `zuugroup-web` พร้อมใช้งาน; ห้ามใส่ password, Secret key หรือ connection string ที่มีรหัสผ่านใน Git | [DECISIONS.md](../docs/DECISIONS.md), [HANDOFF.md](../docs/HANDOFF.md) |
| Phase 2 — UI และ Design foundation | IN_PROGRESS | TASK-007/008 ทำโครงแล้ว; TASK-009 ได้รับอนุมัติให้ใช้ SVG/เมนูที่ผู้ใช้ส่ง; รายละเอียด OPEN ที่อยู่นอกขอบเขตยังไม่เดา | OPEN-08, [DECISIONS.md](../docs/DECISIONS.md), [TASK-007](TASK-007-design-foundation.md), [TASK-008](TASK-008-sidebar-routes.md), [TASK-009](TASK-009-sidebar-assets.md) |
| Phase 3–4 — Auth/RBAC/Audit/จัดการระบบ | BLOCKED | G-04 และ G-10: กติกาบัญชีผู้ใช้/Role/Admin คนสุดท้าย และไฟล์แนบ/Audit/Archive | OPEN-14, OPEN-10, [DECISIONS.md](../docs/DECISIONS.md) |
| Phase 5–10 — โมดูลธุรกิจ | BLOCKED ตาม Gate | รอคำตอบ OPEN ที่เกี่ยวข้องก่อนเปิดงานพฤติกรรม | OPEN-01 ถึง OPEN-15, [DECISIONS.md](../docs/DECISIONS.md) |

> G-01 ผ่านสำหรับ Specs รุ่น 0.2 และ Plan รุ่น 0.1 เมื่อ 2026-09-23; ข้อแก้ไข Specs 0.3/Plan 0.2 สำหรับ TASK-009 อนุมัติเมื่อ 2026-09-24
