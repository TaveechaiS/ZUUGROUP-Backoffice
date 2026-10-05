# TASK-108 — Side หลักขยาย 275px

คำสั่งล่าสุดเจ้าของเปลี่ยนเป็น 275px แทน 250px. FOLLOWUP IMPLEMENTED / WAITING_FOR_UAT: เปลี่ยน token แล้ว ตรวจ 275px/104px และ diff whitespace ผ่าน. ข้อความ 250px ด้านล่างเป็นประวัติรอบก่อน; ตรวจรับรอบล่าสุดใช้ 275px.

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569. ตรวจค่า 250px/104px และ Sidebar/AdminShell ใช้ token เดียวกัน; diff whitespace ผ่าน. ยังไม่ตรวจภาพหลัง login.

1. บันทึก tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan.
2. src/app/globals.css: เปลี่ยนเฉพาะ --expanded-sidebar-width เป็น 250px; คง collapsed 104px.
3. ตรวจ token ใน Sidebar/AdminShell และ diff whitespace. ไม่แก้ Side รอง/เนื้อหา/ข้อมูล ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

คอมขยาย Side หลัก: กว้าง 250px และเนื้อหาเริ่มตรงขอบเมนู ไม่ซ้อนหรือเว้นช่องเดิม 300px. ย่อ: ยัง 104px. มือถือ: เมนูยังเต็มจอเดิม. ตรวจชื่อเมนูและโลโก้ไม่ถูกตัด.
