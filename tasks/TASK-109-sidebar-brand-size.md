# TASK-109 — ชื่อบริษัท 2xl

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569. ESLint sidebar.tsx และ diff whitespace ผ่าน; ยังไม่ตรวจภาพหลัง login.

1. บันทึก tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan.
2. src/components/layout/sidebar.tsx เปลี่ยนเฉพาะชื่อบริษัท md:text-3xl เป็น md:text-2xl; คงมือถือ/ฟอนต์/สี/โลโก้/ความกว้าง.
3. ตรวจ ESLint sidebar.tsx และ diff whitespace. ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

คอมขยายเมนู: ชื่อ ZUUGROUP ขนาด 24px อ่านได้และไม่ถูกตัด. มือถือยัง 18px; ย่อเมนูชื่อซ่อนตามเดิม.
