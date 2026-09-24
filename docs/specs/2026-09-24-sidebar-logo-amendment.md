# ข้อแก้ไขสั้น — Logo และโปรไฟล์ Sidebar

**สถานะ:** ยืนยันจากคำขอเจ้าของโครงการ 2026-09-24

**ขอบเขต:** TASK-010; ต่อจาก [ข้อกำหนด Sidebar เดิม](2026-09-24-sidebar-amendment.md)

1. ใช้ภาพ `Logo.png` ขนาดจริง 70 × 70 พิกเซล พื้นหลังโปร่งใส ที่เจ้าของโครงการส่งเป็น Logo ใน Sidebar ทั้งแบบขยายและย่อ
2. แบบขยายแสดง Logo คู่กับข้อความ `Zuugroup` และคำบรรยายเดิม; แบบย่อแสดง Logo ในแถบไอคอน
3. ลบบล็อกโปรไฟล์ท้าย Sidebar ออกทั้งหมด ขอบเขตนี้ไม่รวมโปรไฟล์ใน Topbar
4. บอกขนาดตัวอักษรและตำแหน่ง CSS ของ Sidebar ในผลส่งมอบ เพื่อให้เจ้าของโครงการแก้ได้ตรงจุด

## ขนาดตัวอักษรใน Sidebar ปัจจุบัน

| ส่วน | Desktop | Mobile (`≤767px`) | JSX element / className |
|---|---|---|---|
| ชื่อ Zuugroup | 30px / 700 | 18px / 700 | `.brand-copy strong` |
| คำบรรยายใต้ชื่อ | 14px / 400 | 10px / 400 | `.brand-copy small` |
| หัวข้อกลุ่มเมนู | 14px / 600 | ซ่อน | `.nav-section h2` |
| ชื่อเมนูหลัก | 16px / 600 | 11px / 600 | `.nav-item` |
| หัวข้อเมนูรอง | 19px / 650 | ซ่อน | `.secondary-heading h2` |
| คำอธิบายหัวข้อเมนูรอง | 12px / 400 | ซ่อน | `.secondary-heading p` |
| ช่องค้นหาเมนูรอง | 13px / 400 | ซ่อน | `.secondary-search input` |
| ชื่อเมนูรอง | 14px / 400; เลือกอยู่ 600 | ซ่อน | `.secondary-link` |
| ข้อความไม่พบเมนู | 12px / 400 | ซ่อน | `.secondary-empty` |

ตัวเลขข้างต้นย้ายไปเป็น Tailwind utility ใน `src/components/layout/sidebar.tsx` ตาม [ข้อแก้ไขสั้น — Typography ของ Sidebar](2026-09-24-sidebar-typography-utilities.md); เมนูรองแสดงเมื่อ Sidebar ย่อบนจอ Desktop
Wordmark ซ่อนเมื่อ Sidebar ย่อบนจอ Desktop และแสดง Logo เพียงภาพเดียว; บน Mobile ใช้ Logo 42 × 42 พิกเซล
