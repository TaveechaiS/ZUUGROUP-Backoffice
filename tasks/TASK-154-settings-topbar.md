# TASK-154 — ชื่อ Topbar ตั้งค่าระบบ

สถานะ: COMPLETED

ผล: ใช้หัวข้อหมวดตั้งค่าระบบสำหรับหน้าหลักและหน้าย่อยแล้ว. ESLint/diff whitespace ผ่าน; ยังไม่ตรวจภาพในเบราว์เซอร์.

1. บันทึก ACTIVE/Specs/Plan ก่อนแก้.
2. แก้ src/components/layout/admin-shell.tsx ให้ /settings และ /settings/* แสดงหัวข้อ “ตั้งค่าระบบ”.
3. ตรวจ ESLint/diff และเงื่อนไขเส้นทาง. คงชื่อเมนูรอง/พฤติกรรม/ขนาดเดิม.

ไฟล์: admin-shell.tsx และ ACTIVE/Specs/Plan/Task นี้.

ตรวจรับ: เปิดหน้าตั้งค่าระบบและข้อมูลพื้นฐานสินค้า ควรเห็น Topbar “ตั้งค่าระบบ” ทั้งสองหน้า.
