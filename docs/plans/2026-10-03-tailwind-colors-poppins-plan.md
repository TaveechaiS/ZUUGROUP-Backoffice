# แผนย่อย TASK-083

1. ตรวจ ACTIVE, คลาสสี/น้ำหนักใน `src/**/*.tsx`, globals.css และคู่มือ Next.js CSS; ลง Specs/Plan/Task และกติกา AGENTS ก่อน source changes.
2. เปลี่ยนเฉพาะคลาสสี var เป็นชื่อ Tailwind; คลาส hex คงค่าเดิม. งานแก้ไขตามคำยืนยันเจ้าของให้เทียบ source เดิมจาก Git และคืน hex เฉพาะจุด โดยรักษางานฟอนต์/Loading/Header/fallback ปัจจุบัน.
3. ใน `src/app/globals.css` กำหนด blue theme tokens ตามสีแบรนด์เดิม และคืนสีพื้นฐาน body ตามเดิม. คงคลาส Poppins และตัวแปรขนาด layout.
4. ตรวจสี hex ครบตาม source เดิม และไม่เหลือ color-var classes, lint/type-check/build และ diff-check. บันทึกผลใน TASK-083; เจ้าของตรวจภาพ desktop/mobile.

ไฟล์: ทุกไฟล์ `src/**/*.tsx` ที่มีคลาสเข้าข่าย, ค่าคลาสใน `src/app/products/product-ui.ts`/`src/app/users/user-ui.ts`, `src/app/globals.css`, AGENTS, คู่มือ UI/StatusBadge, Specs/Plan หลักและย่อย, TASK-083/ACTIVE.

ผลลัพธ์: รูปแบบสีและฟอนต์เดียวกันทั้ง UI และมีกติกาสำหรับงานใหม่. ตรวจรับด้วยการเปิด Login/Dashboard/รายการ/ฟอร์ม/รายละเอียด และทดสอบ Loading/dialog/status badge.
