# ข้อกำหนดสั้น — ย้ายสไตล์ UI ไปที่ className

**สถานะ:** อนุมัติจากคำขอของเจ้าของโครงการ 2026-09-24

**Task:** TASK-013

ย้ายกฎ CSS ทั้งหมดที่เจ้าของโครงการแนบ ตั้งแต่ `.brand-logo` ผ่านกฎ responsive สำหรับมือถือ ไปเขียนเป็น Tailwind utility ใน `className` ขององค์ประกอบที่เกี่ยวข้อง ได้แก่ Sidebar, Topbar, พื้นที่เนื้อหา, Dashboard placeholder และหน้า placeholder ของโมดูล รวมกฎก่อน `.brand-logo` ที่เป็นโครงของ Sidebar เพื่อไม่ให้เหลือสไตล์ของ component แยกอยู่ใน `globals.css`.

ใช้ `md:` สำหรับจอ ≥768px และใช้ค่า arbitrary เช่น `w-[70px]` เฉพาะค่าที่ไม่มี utility มาตรฐาน เพื่อรักษาขนาด สี ระยะ และสถานะเดิม. สถานะย่อ/ขยายใช้เงื่อนไข `className` จากตัวแปร `collapsed`. CSS ส่วนกลางเก็บได้เฉพาะ imports, design tokens ที่ `:root`, การตั้งค่าพื้นฐานของ `body`/ลิงก์ และกฎลดการเคลื่อนไหวระดับทั้งแอป. ไม่แก้ business logic, route หรือข้อมูล.

ตัวอย่าง: `<div className="flex min-h-[43px] items-center gap-[13px] md:px-3">...</div>`. Pseudo element ใช้ Tailwind `after:*`; element ที่มี child styling ให้กำหนด class บน child โดยตรง.
