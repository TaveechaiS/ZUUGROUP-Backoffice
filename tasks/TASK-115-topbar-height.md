# TASK-115 — Topbar คอมรวม 82px

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569. ESLint 2 ไฟล์และ diff whitespace ผ่าน; ยังไม่ตรวจภาพหลัง login.

1. tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan บันทึกคอมรวม 82px.
2. src/components/layout/admin-shell.tsx: md:min-h-18 (72px) รวมแถบบน 10px และ min-height เนื้อหาลบ 82px.
3. src/components/layout/secondary-sidebar-frame.tsx: fallback คอม --topbar-height 82px; ยังคำนวณจากความสูงจริงหลัง mount. มือถือคง 90px.
4. ตรวจ ESLint 2 ไฟล์และ diff whitespace; ไม่แก้สี/ข้อมูล/เมนู ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

คอม: Topbar รวมแถบบนสูงขั้นต่ำ 82px ข้อความ/บัญชี/ปุ่มไม่ถูกตัด. เลื่อนแล้ว Topbar/Side รองค้างและไม่ทับกัน. มือถือคงขนาดเดิมและยังกดปุ่มได้.
