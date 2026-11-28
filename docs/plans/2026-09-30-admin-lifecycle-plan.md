# แผนย่อย TASK-036 — ยืนยันวงจรบัญชี Admin และคู่มือกู้คืน

**วันที่:** 2026-09-30 (Asia/Bangkok)
**ขอบเขต:** บันทึกนโยบายที่เจ้าของโครงการอนุมัติและทำคู่มือกู้คืน; ไม่เปลี่ยนโค้ด, Auth, schema หรือฐานข้อมูล

## ลำดับงาน

1. อ่าน `tasks/ACTIVE.md`, OPEN-14, amendment รหัสผ่าน, Specs/Plan, BLOCKED และ Handoff
2. บันทึกขอบเขต TASK-036 ใน ACTIVE
3. เพิ่ม amendment ที่ปิด OPEN-14 และกำหนดการจัดการบัญชี, การป้องกัน Admin คนสุดท้าย และการกู้คืนโดยเจ้าของโครงการ
4. จัดทำ runbook พร้อมแยกขั้นตอนที่ใช้ได้เมื่อระบบจริงพร้อม กับสิ่งที่ต้อง implement/test ก่อนเปิด Auth
5. ปรับ Specs/Plan, DECISIONS, BLOCKED และ Handoff ให้ระบุ G-04 ผ่านและแยกงานที่ G-10 ยังบล็อก
6. ย้าย TASK-036 ไป COMPLETED; ตรวจลิงก์/สถานะและ `git diff --check`

## ไฟล์ที่เปลี่ยน

- `docs/specs/2026-09-30-admin-lifecycle-amendment.md`
- `docs/runbooks/admin-account-recovery.md`
- `docs/specs/2026-09-23-1550-project-specs.md` (รวม §7/§8 จัดการ Role/บัญชี)
- `docs/plans/2026-09-23-1635-project-plan.md`
- `docs/DECISIONS.md`, `docs/HANDOFF.md`, `tasks/BLOCKED.md`
- `tasks/TASK-036-admin-lifecycle-and-recovery.md`
- `tasks/ACTIVE.md`, `tasks/COMPLETED.md`

## เกณฑ์ตรวจรับ

- Admin จัดการบัญชีและ Role ผ่านเว็บได้; เพิ่ม Admin ได้
- ระบบห้ามระงับ/ลบ/ลดสิทธิ์ Admin หากทำให้ไม่มี Admin ที่ใช้งานได้เหลือ
- เจ้าของโครงการมีวิธีกู้คืนบัญชี/สิทธิ์นอกเว็บและมีคู่มือ
- ไม่เก็บ Role authorization ใน `user_metadata`; Secret key อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น
- G-04/OPEN-14 ปิด; G-10 คงสถานะบล็อกงาน Audit/Storage ที่ยังขาดข้อกำหนด
- ไม่แก้โค้ดหรือฐานข้อมูล; `git diff --check` ผ่าน
