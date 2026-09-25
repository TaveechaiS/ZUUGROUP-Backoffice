# TASK-012 — Typography ของ Sidebar ใน className

| รายการ | รายละเอียด |
|---|---|
| Phase | 2 — UI และ Design foundation |
| ผู้รับผิดชอบ | AI |
| สถานะ | DONE |
| Branch | `ai` |
| ต้นทางคำขอ | เจ้าของโครงการขอให้ย้ายขนาดตัวอักษรจาก `globals.css` ไปเป็น Tailwind utility ใน `className` และบันทึกรูปแบบการเขียนใน MD |

## ขอบเขตและแผนย่อย

1. บันทึกข้อกำหนด/ตัวอย่างรูปแบบการเขียน และแผนย่อยใน MD พร้อมกติกาสำหรับงานต่อไป
2. ย้าย `font-size` และ `font-weight` ของข้อความใน Sidebar ไปยัง JSX `className` โดยคงขนาด Desktop/Mobile และสถานะ active เดิม
3. ลบค่า Typography ที่ย้ายแล้วออกจาก `src/app/globals.css`; เก็บ CSS layout, สี, และสถานะที่ไม่ใช่ Typography
4. ตรวจ lint, type-check, build และดู Sidebar แบบขยาย/ย่อบนหน้าเว็บ

## ผลที่ทำและตรวจแล้ว

- ย้ายขนาด/น้ำหนักของ Wordmark, กลุ่มเมนู, เมนูหลัก, เมนูรอง, ช่องค้นหา และข้อความว่าง ไปยัง Tailwind utility ใน `sidebar.tsx`
- ลบค่า Typography ของ Sidebar ที่ซ้ำจาก `globals.css`; CSS ส่วน layout/สี/สถานะยังอยู่ที่เดิม
- บันทึกรูปแบบ utility และตัวอย่างใน Specs ฉบับสั้นและกติกาใน `AGENTS.md`
- `npm run lint`, `npm run type-check` และ `npm run build` ผ่าน; ตรวจภาพ Desktop ทั้ง Sidebar ขยายและย่อแล้ว
- `prettier --check` ของ `sidebar.tsx` ผ่าน แต่ `globals.css` ยังไม่ผ่านเพราะรูปแบบบรรทัดเดียวเดิมของไฟล์; ไม่จัดรูปแบบทั้งไฟล์ใน Task นี้

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดหน้า Desktop และ Mobile: ขนาดและน้ำหนักข้อความใน Sidebar ต้องเหมือนก่อนแก้
- กดย่อ/ขยายและเลือกเมนู: ข้อความ active กับเมนูรองต้องยังอ่านได้ชัด

**ผล UAT:** เจ้าของโครงการยืนยันว่าผ่านทั้งหมดเมื่อ 2026-09-25.
