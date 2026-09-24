# งานที่รอคำตอบหรือเงื่อนไข

| กลุ่มงาน | สถานะ | สิ่งที่ต้องรอ | อ้างอิง |
|---|---|---|---|
| Phase 1 — พื้นฐานโครงการ | READY_FOR_USER_TEST | TASK-006 พร้อมให้ผู้ใช้ตรวจรับ; G-01/G-02 ผ่านแล้ว; Supabase Cloud project `zuugroup-web` พร้อมใช้งาน; ห้ามใส่ password, Secret key หรือ connection string ที่มีรหัสผ่านใน Git | [ACTIVE.md](ACTIVE.md), [DECISIONS.md](../docs/DECISIONS.md), [HANDOFF.md](../docs/HANDOFF.md) |
| Phase 2 — UI และ Design foundation | READY_FOR_USER_TEST | TASK-007–014 และ TASK-017–023 รอผู้ใช้ตรวจรับตามรายการใน `tasks/ACTIVE.md`; TASK-015/016 เสร็จแล้ว. ตรวจ Desktop ก่อน; Responsive เลื่อนไว้หลังงานหลักตามผู้ใช้ | [ACTIVE.md](ACTIVE.md), [COMPLETED.md](COMPLETED.md), OPEN-08 |
| Phase 3–4 — Auth/RBAC/Audit/จัดการระบบ | BLOCKED | G-04/G-10: รอคำตอบเรื่องบัญชีผู้ใช้, Role, Admin คนสุดท้าย, ไฟล์แนบ, Audit และ Archive | OPEN-14, OPEN-10, [DECISIONS.md](../docs/DECISIONS.md) |
| Phase 5–10 — โมดูลธุรกิจ | BLOCKED ตาม Gate | รอคำตอบ OPEN ที่เกี่ยวข้องก่อนเปิดงานพฤติกรรม; OPEN-16 ต้องยืนยันตำแหน่งเมนูที่ยังไม่มีในรายการล่าสุดก่อนเพิ่ม Sidebar | OPEN-01–07, OPEN-10–16, [DECISIONS.md](../docs/DECISIONS.md) |

> G-01 ผ่านสำหรับ Specs รุ่น 0.2 และ Plan รุ่น 0.1 เมื่อ 2026-09-23; Project Specs รุ่น 0.3 และ Project Plan รุ่น 0.2 ได้รับอนุมัติเมื่อ 2026-09-24. OPEN-09 ปิดแล้ว.
