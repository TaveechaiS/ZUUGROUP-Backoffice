# ข้อกำหนดสั้น — Poppins และ fallback ภาษาไทย

**ที่มา:** คำขอเจ้าของโครงการ 2026-09-24

**Task:** TASK-017

1. ใช้ Poppins เป็นฟอนต์หลักของ UI ปัจจุบัน และใช้ Noto Sans Thai เป็น fallback สำหรับภาษาไทย ตามลำดับ font stack ที่เจ้าของโครงการกำหนด.
2. เพิ่มคลาส `poppins-thin`, `poppins-extralight`, `poppins-light`, `poppins-regular`, `poppins-medium`, `poppins-semibold`, `poppins-bold`, `poppins-extrabold` และ `poppins-black` ซึ่งกำหนดน้ำหนัก 100–900 ตามลำดับ, `font-style: normal` และ font stack Poppins/Noto Sans Thai/sans-serif.
3. ใช้คลาสน้ำหนักเหล่านี้ใน Sidebar, Topbar, Dashboard และ module placeholders ที่มีอยู่. รักษาขนาด font, responsive layout, spacing, colors, routes และ behavior เดิม.
4. รอบตรวจรับนี้เน้น Desktop; การตรวจ responsive/mobile ให้ทำหลังงานหลักเสร็จ ตามคำยืนยันของเจ้าของโครงการ.

**ข้อจำกัด:** ไม่เพิ่มหรือเปลี่ยน workflow, data, หรือ business rules.