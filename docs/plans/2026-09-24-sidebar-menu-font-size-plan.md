# แผนสั้น — TASK-018

1. บันทึกขนาด 14px สำหรับชื่อเมนูหลักบน Desktop; ระบุว่าจอแคบเดิม 11px และปรับเป็น 12px ภายหลังตาม TASK-023.
2. ปรับ utility breakpoint Desktop ใน `src/components/layout/sidebar.tsx` โดยคง Poppins Regular 400 และ style ส่วนอื่นไว้.
3. ส่งให้เจ้าของโครงการตรวจ Desktop ทั้ง Sidebar แบบขยายและย่อ; การตรวจ Responsive/Mobile ทำภายหลัง.

**ไฟล์:** `src/components/layout/sidebar.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.

**ผลลัพธ์:** ชื่อเมนูหลักอ่านด้วยขนาด 14px บน Desktop โดยขนาดจอแคบเป็น 12px ตาม TASK-023; รูปแบบอื่นคงเดิม.