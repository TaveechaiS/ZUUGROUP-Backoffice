# ข้อกำหนดสั้น — ย้ายสไตล์ UI ไปที่ className

## สถานะ Combobox — TASK-070

เจ้าของขอ 2026-10-02 ให้ status ในฟอร์มรายโมดูลเป็น combobox เลือกได้ ใช้สถานะจริงผ่าน filters API รวมค่าเดิมและค่าเริ่มต้นเดิม ไม่ส่งคำค้นเป็นสถานะ ตาม tasks/TASK-070-status-combobox.md

## การตรวจฟอร์ม — TASK-069

เจ้าของขอ 2026-10-02 ให้ฟอร์มตามภาพใช้ข้อความไทยสีแดงใต้ช่อง “กรุณากรอก...” แทน browser tooltip และ * สีแดงสำหรับ required ตามจริง ปรับ shared record form ตาม tasks/TASK-069-inline-form-validation.md โดยคง API validation

## Combobox ข้อมูลสัมพันธ์ — TASK-068

เจ้าของขอ 2026-10-02 ให้พิมพ์ค้นหาและเลือกรายการในช่องเดียว เช่น ลูกค้าในฟอร์ม ใช้พื้นขาว คง options API/ID และ pagination เดิม ตาม tasks/TASK-068-relation-combobox.md

## พื้นหลัง Filter — TASK-067

เจ้าของกำหนด 2026-10-02 ให้พื้นที่ค้นหาและ filter ใช้พื้นหลังสีขาวทุกหน้ารายการ คงเส้นขอบ ระยะและพฤติกรรมกรองเดิม ใช้ Tailwind bg-white ใน className

**สถานะ:** อนุมัติจากคำขอของเจ้าของโครงการ 2026-09-24

**Task:** TASK-013

ย้ายกฎ CSS ทั้งหมดที่เจ้าของโครงการแนบ ตั้งแต่ `.brand-logo` ผ่านกฎ responsive สำหรับมือถือ ไปเขียนเป็น Tailwind utility ใน `className` ขององค์ประกอบที่เกี่ยวข้อง ได้แก่ Sidebar, Topbar, พื้นที่เนื้อหา, Dashboard placeholder และหน้า placeholder ของโมดูล รวมกฎก่อน `.brand-logo` ที่เป็นโครงของ Sidebar เพื่อไม่ให้เหลือสไตล์ของ component แยกอยู่ใน `globals.css`.

ใช้ `md:` สำหรับจอ ≥768px และใช้ค่า arbitrary เช่น `w-[70px]` เฉพาะค่าที่ไม่มี utility มาตรฐาน เพื่อรักษาขนาด สี ระยะ และสถานะเดิม. สถานะย่อ/ขยายใช้เงื่อนไข `className` จากตัวแปร `collapsed`. CSS ส่วนกลางเก็บได้เฉพาะ imports, design tokens ที่ `:root`, การตั้งค่าพื้นฐานของ `body`/ลิงก์ และกฎลดการเคลื่อนไหวระดับทั้งแอป. ไม่แก้ business logic, route หรือข้อมูล.

ตัวอย่าง: `<div className="flex min-h-[43px] items-center gap-[13px] md:px-3">...</div>`. Pseudo element ใช้ Tailwind `after:*`; element ที่มี child styling ให้กำหนด class บน child โดยตรง.


## ตัวหนังสือปุ่มเพิ่มข้อมูล — 2026-10-02 (TASK-066)

เจ้าของขอข้อความสีขาว ปรับ text-white! ในปุ่มเพิ่ม shared list/users/products และพื้นน้ำเงินข้อความขาวในปุ่มเพิ่มรายการแม่แล้ว lint/diff ผ่าน รอเจ้าของตรวจหน้าจอ ปลายทางและพฤติกรรมเดิม
