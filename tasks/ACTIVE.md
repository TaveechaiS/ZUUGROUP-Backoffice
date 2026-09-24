# งานที่กำลังทำ

| Task | ผู้รับผิดชอบ | สถานะ | ขอบเขต | หมายเหตุ |
|---|---|---|---|---|
| TASK-006 | AI | READY_FOR_USER_TEST | Phase 1: ตั้งโครง Next.js/TypeScript/Tailwind/HeroUI, Prisma 7, Docker, Environment template และ server-side Supabase connection pattern | G-01/G-02 ผ่าน; ไม่ใส่ secret จริงลง repo; ไม่เพิ่มกฎธุรกิจ |
| TASK-007 | AI | READY_FOR_USER_TEST | Phase 2: Desktop app shell, design tokens, responsive navigation presentation และ Dashboard placeholder ตาม Figma | G-03 ผ่านสำหรับ foundation; lint/type-check/build ผ่าน; ไม่มี KPI/CRUD/Auth/RBAC/Schema |
| TASK-008 | AI | READY_FOR_USER_TEST | Phase 2: แยก Sidebar component และสร้างหน้า placeholder เชื่อมตามเมนู Admin | lint/type-check/build ผ่าน; ไม่มี CRUD/API/Auth/RBAC/Schema/ข้อมูลจำลอง |
| TASK-009 | AI | READY_FOR_USER_TEST | Phase 2: ใช้ SVG/เมนูที่ผู้ใช้ส่งใน Sidebar และ Wordmark ข้อความ | SVG ตรงต้นฉบับ 13/13; lint/type-check/build ผ่าน; ลิงก์ตั้งค่าระบบเปิดได้; รอผู้ใช้ตรวจภาพ Desktop และสถานะย่อ/ขยาย |
| TASK-010 | AI | READY_FOR_USER_TEST | Phase 2: ใส่ `Logo.png` ใน Sidebar, ลบโปรไฟล์ท้าย Sidebar และบันทึกตำแหน่ง CSS ของขนาดตัวอักษร | Logo ตรงต้นฉบับ; lint/type-check/build ผ่าน; ตรวจภาพ Desktop แบบขยาย/ย่อแล้ว; รอผู้ใช้ตรวจรับ |
| TASK-011 | AI | READY_FOR_USER_TEST | Phase 2: ปรับขอบสีน้ำเงินและมุมโค้งของ Topbar ให้ตรงภาพตัวอย่าง | แก้พื้นสีน้ำเงินด้านหลังมุมโค้งและคงเนื้อหาสีขาว; ตรวจภาพ Desktop ทั้ง Sidebar ขยาย/ย่อแล้ว |
| TASK-012 | AI | READY_FOR_USER_TEST | Phase 2: ย้าย Typography ของ Sidebar จาก `globals.css` ไปเป็น Tailwind utility ใน `className` | lint/type-check/build ผ่าน; ตรวจภาพ Desktop ขยาย/ย่อแล้ว; [รูปแบบการเขียน](../docs/specs/2026-09-24-sidebar-typography-utilities.md) บันทึกแล้ว |
| TASK-013 | AI | READY_FOR_USER_TEST | Phase 2: ย้าย CSS ทุกกฎในข้อความที่แนบ (`.brand-logo` ถึง mobile `.dashboard-empty` และกฎต่อเนื่องของชุดเดียวกัน) ไปเป็น Tailwind utility ใน JSX ของ Sidebar, Topbar, เนื้อหาและ placeholder | `globals.css` เหลือเฉพาะพื้นฐานของทั้งแอป; lint/type-check/build ผ่าน; รอผู้ใช้ตรวจหน้าจอ Desktop/Mobile |
| TASK-014 | AI | READY_FOR_USER_TEST | Phase 2: เอาปุ่มสามขีดออก ใช้โลโก้กดย่อ/ขยาย Sidebar และปรับชื่อเมนูเป็น regular ยกเว้นหัวข้อกลุ่ม | แก้ `sidebar.tsx` และความสูง mobile ใน `admin-shell.tsx`; lint/type-check/build ผ่าน; รอผู้ใช้ตรวจภาพและคลิก |
| TASK-017 | AI | READY_FOR_USER_TEST | Phase 2: เพิ่ม Poppins และ utility น้ำหนักตัวอักษร 100–900 ให้ UI ปัจจุบัน | ใช้ Poppins สำหรับอักษร Latin และ Noto Sans Thai สำหรับภาษาไทย; production build ผ่าน; รอ Desktop UAT; เลื่อน Responsive ไปหลังงานหลัก |
| TASK-018 | AI | READY_FOR_USER_TEST | Phase 2: ปรับขนาดชื่อเมนูหลัก Sidebar เป็น 14px บน Desktop | Desktop 14px; จอแคบ 12px ตาม TASK-023 และ Poppins Regular 400; รอผู้ใช้ตรวจ; Responsive UAT ภายหลัง |
| TASK-019 | AI | READY_FOR_USER_TEST | Phase 2: ปรับความกว้าง Sidebar หลักและ Sidebar ย่อยบน Desktop | หลักขยาย 300px, ย่อ 104px, ย่อย 250px; Responsive UAT ภายหลัง |
| TASK-020 | AI | READY_FOR_USER_TEST | Phase 2: เอาหัวข้อและช่องค้นหาออกจาก Sidebar ย่อยลูกค้า | คงลิงก์และความกว้าง 250px; container padding X=0/Y=2; การนำทาง Responsive เดิม |
| TASK-021 | AI | READY_FOR_USER_TEST | Phase 2: ปรับชื่อหน้า วันที่ การแจ้งเตือน และโปรไฟล์ผู้ใช้ใน Topbar | ชื่อหน้า 20px/วันที่ 14px บน Desktop; วงกลมโปรไฟล์และแจ้งเตือน 36px Desktop/24px จอแคบ; จุดแดงและ SVG ลูกศร |
| TASK-022 | AI | READY_FOR_USER_TEST | Phase 2: ใช้คลาสขนาดของ Tailwind ใน Sidebar และ Topbar เมื่อค่าเท่ากัน | ตรวจ CSS ที่สร้างและ diff ผ่าน; รอ Desktop UAT |
| TASK-023 | AI | READY_FOR_USER_TEST | Phase 2: ปรับขนาดตัวอักษรใน src ให้ใช้ชื่อขนาด Tailwind | แปลง 15 จุด; ผู้ใช้พอใจกับสเกล; รอตรวจภาพรวม Desktop ก่อน Responsive |
