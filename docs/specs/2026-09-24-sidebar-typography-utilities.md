# ข้อแก้ไขสั้น — Typography ของ Sidebar

**สถานะ:** ยืนยันจากคำขอเจ้าของโครงการ 2026-09-24

**Task:** TASK-012

**หมายเหตุปัจจุบัน:** ตารางด้านล่างบันทึกค่าในช่วง TASK-012; ขนาดที่ใช้จริงภายหลังให้ยึด TASK-018 และ [TASK-023](2026-09-24-tailwind-type-scale.md).

ให้กำหนดขนาดและน้ำหนักตัวอักษรของ Sidebar ใน `className` ที่ `src/components/layout/sidebar.tsx` ด้วย Tailwind utility เช่น `<p className="text-sm font-bold">ตัวอย่าง</p>` ไม่กำหนดค่าเหล่านี้ซ้ำใน `src/app/globals.css`

| ส่วน | ตัวอย่าง utility | ผลที่ต้องได้ |
|---|---|---|
| ชื่อ Zuugroup | `text-lg font-bold md:text-3xl` | Mobile 18px; Desktop 30px / 700 |
| คำบรรยายใต้ชื่อ | `text-[10px] font-normal md:text-sm` | Mobile 10px; Desktop 14px / 400 |
| หัวข้อกลุ่มเมนู | `text-sm font-semibold` | Desktop 14px / 600 |
| ชื่อเมนูหลัก | `text-[11px] md:text-base font-semibold` | Mobile 11px; Desktop 16px / 600 |
| เมนูหลักที่เลือก | `font-[650]` | น้ำหนัก 650 เฉพาะรายการ active |
| หัวข้อเมนูรอง | `text-[19px] font-[650]` | Desktop 19px / 650 |
| คำอธิบาย/ข้อความไม่พบ | `text-xs font-normal` | 12px / 400 |
| ช่องค้นหาเมนูรอง | `text-[13px] font-normal` | 13px / 400 |
| ชื่อเมนูรอง | `text-sm font-normal`; active `font-semibold` | 14px / 400; active 600 |

`md:` ใช้กับจอ ≥768px ตรงกับ breakpoint ใน Specs; ใช้ค่าในวงเล็บเหลี่ยมเมื่อขนาดที่ออกแบบไว้ไม่มี utility มาตรฐาน. ข้อกำหนดเรื่อง layout, สี, ระยะ และการซ่อน/แสดงได้รับการขยายตาม [TASK-013](2026-09-24-ui-inline-utilities.md) ให้ย้ายไป `className` ด้วย

**ปรับล่าสุด:** ค่าน้ำหนักของชื่อเมนูหลัก/รองและ active ในตารางข้างต้นถูกแทนที่ด้วย `font-normal` ตาม [TASK-014](2026-09-24-sidebar-logo-toggle-regular.md); หัวข้อกลุ่มเมนูยังคงน้ำหนักเดิม.
