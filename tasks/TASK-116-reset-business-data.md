# TASK-116 — ล้างข้อมูลธุรกิจ ยกเว้นผู้ใช้

สถานะ COMPLETED / WAITING_FOR_UAT; เจ้าของสั่งล้างเพื่อเริ่มใหม่ 5 ตุลาคม 2569.

## ผลดำเนินการ

ล้างข้อมูล 30 ตารางธุรกิจด้วย transaction สำเร็จ 5 ตุลาคม 2569 เวลา 16:05 น. ตรวจหลัง commit ทุกตารางเป้าหมายเหลือ 0; users 5 คนคงเดิม พร้อม auth_accounts/user_roles/roles/permissions/role_permissions และ migrations โดย hash ทั้ง 7 ตารางที่เก็บตรงกับก่อนล้าง. ไม่แตะ auth/storage หรือโครงสร้าง DB และไม่เติม seed.

สำรองข้อมูล public ก่อนล้างที่ `local-backups/TASK-116-2026-10-05T09-05-00-573Z-before-reset.json`; SHA256 `4544c29e6b6a14b356344b5f254b71ef8b16d586eb61d99c9f4d3f08ba5a4770`. ผลตรวจที่ `local-backups/TASK-116-2026-10-05T09-05-00-573Z-result.json` ระบุ verified=true. node --check และ ESLint สคริปต์ผ่าน. ยังไม่ตรวจล็อกอินผ่าน UI; ไม่ commit/deploy.

## ขอบเขต/ไฟล์/ลำดับ

1. tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan บันทึกขอบเขต.
2. scripts/reset-business-data.mjs ตรวจ connection ปัจจุบันผ่าน env โดยไม่พิมพ์ credential; inspection รายการตาราง/จำนวน/FK และ manifest fingerprint.
3. local-backups/TASK-116-* ที่ ignore เก็บ manifest และ snapshot ข้อมูล public ก่อนล้าง รวมข้อมูลผู้ใช้/สิทธิ์เพื่อเทียบ hash.
4. เก็บ users/auth_accounts/user_roles/roles/permissions/role_permissions และ migration metadata; ตาราง public อื่นล้างตาม inspection. ไม่แตะ schema auth/storage และโครงสร้าง DB.
5. ใช้ transaction/locks; ตรวจ FK จากตารางที่เก็บหรือนอก public ว่าไม่ชี้ตารางที่จะล้าง. TRUNCATE แบบ explicit ไม่มี CASCADE. ตรวจศูนย์/hash ก่อน commit แล้ว readback.
6. บันทึกผล ไม่มี seed/commit Git/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

ล็อกอินด้วย user เดิมได้ บทบาทและสิทธิ์เดิมคงอยู่. ข้อมูลธุรกิจทุกตารางที่ล้างต้องเป็นศูนย์ พร้อมเริ่มสร้างใหม่. เนื้อหา UI ยังพักตาม TASK-114 จึงตรวจข้อมูลใหม่ผ่านหน้าจอหลังเปิดเนื้อหากลับในงานถัดไป. Backup เป็นข้อมูลส่วนตัวอยู่ local-backups ไม่เข้า Git.
