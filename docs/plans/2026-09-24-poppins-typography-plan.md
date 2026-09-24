# แผนสั้น — TASK-017

1. บันทึกข้อกำหนด Poppins/Noto Sans Thai, รายการ weight class, ขอบเขตการใช้ และเกณฑ์ตรวจใน Specs นี้.
2. โหลด Poppins และ Noto Sans Thai ผ่าน `next/font/google` ที่ root layout โดยระบุน้ำหนัก 100–900 ชัดเจน เพื่อให้ Next.js resolve font weights ได้และ bundle แบบอักษรกับแอป.
3. เพิ่มคลาสน้ำหนักทั้งเก้าใน `src/app/globals.css` และตั้ง font stack พื้นฐานโดยไม่เปลี่ยนขนาดตัวอักษร.
4. เปลี่ยน utility น้ำหนักตัวอักษรใน Sidebar และ AdminShell เป็นคลาส `poppins-*` ที่ตรงกับน้ำหนักเดิม; คง custom weight 650 และ font inheritance เดิม.
5. ส่งให้เจ้าของโครงการตรวจ UI บน Desktop; ไม่รวม UAT Responsive/Mobile ในรอบนี้.

**ไฟล์:** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/layout/sidebar.tsx`, `src/components/layout/admin-shell.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

**ผลลัพธ์:** UI ปัจจุบันใช้ Poppins เป็นหลักพร้อม Noto Sans Thai fallback และเลือกน้ำหนักได้ครบตามคลาสที่กำหนด; ขนาดและ layout คงเดิม.