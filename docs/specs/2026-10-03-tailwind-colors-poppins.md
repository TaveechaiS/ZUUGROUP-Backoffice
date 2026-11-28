# TASK-083 — คลาสสี Tailwind และน้ำหนัก Poppins

สถานะ: APPROVED จากคำขอเจ้าของ 2026-10-03

คำยืนยันแก้ไขของเจ้าของ: เปลี่ยนเฉพาะคลาสที่อ้าง `var(--สี)` เป็นชื่อ Tailwind เช่น `border-blue-100`, `border-gray-100`, `bg-blue-700`. คลาสสีที่เดิมเขียน `#hex` ต้องคงค่าเดิมทุกจุด รวม state/ไอคอน. ห้ามนำไปเทียบเฉด palette แล้วเปลี่ยนสีเอง. รักษาสีหลักเดิมโดยกำหนด blue theme tokens ของ Tailwind ตาม palette เดิม (#1a58a7 ที่ระดับ 700); ดังนั้นชื่อคลาสเป็น Tailwind แต่สีแบรนด์ยังตรงที่เจ้าของกำหนด. กติกานี้แทนข้อความเรื่องเปลี่ยนสีจริงเป็น palette มาตรฐานในรอบก่อน.

น้ำหนักข้อความทุกแบบใช้คลาสที่มีใน globals.css: `poppins-thin` 100, `poppins-extralight` 200, `poppins-light` 300, `poppins-regular` 400, `poppins-medium` 500, `poppins-semibold` 600, `poppins-bold` 700, `poppins-extrabold` 800, `poppins-black` 900. แทน `font-*` ที่กำหนดน้ำหนัก; ค่า 650 ให้ใช้ `poppins-semibold` ที่รองรับจริง. ใช้ Poppins พร้อม Noto Sans Thai fallback เดิม. ขนาดข้อความใช้ `text-*` ตามเดิม.

บันทึกกติกาใน AGENTS เพื่อใช้กับงานต่อไป. ถ้าต้องการ responsive/state ของน้ำหนัก ให้ทำคลาส Poppins เป็น Tailwind utility ก่อนใช้ modifier; ห้ามใส่ modifier กับ CSS selector ธรรมดาที่ไม่ได้รองรับ.

ตรวจรับ: Header/Sidebar, รายการ/รายละเอียด/ฟอร์ม, Login, Loading, dialog และป้ายสถานะใช้สี hex เดิมตามจุดที่กำหนด และสีหลักเดิม; ฟอนต์ Poppins ยังสม่ำเสมอ. สถานะใช้ component กลางและระดับพื้นหลัง 50/ข้อความ 600 ตามเดิม.
