# TASK-040 — ภาพรวมหน้าระบบและ Detail ตัวอย่าง

- **สถานะ:** IN_PROGRESS
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ข้อกำหนด Mock](../docs/specs/2026-10-01-design-preview-amendment.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-design-preview-plan.md)

## ขอบเขต

เพิ่มหน้าภาพรวมเส้นทางของระบบ และ Detail ตัวอย่างของลูกค้า/สินค้าเพื่อให้เจ้าของโครงการตรวจดีไซน์ก่อนข้อมูลจริง โดยเชื่อมกับ Mock ปัจจุบันเท่านั้น

## ไฟล์ที่รับผิดชอบ

`src/app/design-preview/page.tsx`, `src/app/customers/[ref]/page.tsx`, `src/app/products/[ref]/page.tsx`, `src/components/pages/mock-detail-page.tsx`, `src/components/pages/module-list-page.tsx` และเอกสาร Specs/Plan/Task ของงานนี้

## ผลงานและการตรวจ

- เพิ่ม `/design-preview`, `/customers/[ref]`, `/products/[ref]`; ชื่อรายการบนตาราง desktop/mobile เชื่อม Detail เฉพาะสองโมดูลนี้
- Detail อ่านแถว Mock เดิมและรายการชั่วคราวของแท็บ; ref ที่ไม่พบแสดงข้อความและลิงก์กลับ
- `lint`, `type-check`, `build`, `git diff --check` ผ่าน; build พบ route ใหม่ครบ; เมื่อไม่มี Session route ใหม่ redirect ไป Login
- รอเจ้าของโครงการตรวจภาพและการคลิกจริงบน desktop/mobile ก่อนถือว่าเสร็จ

## ⚠️ ต้องทดสอบโดยคุณ

เปิด `/design-preview` แล้วเลือกหน้าลูกค้า/สินค้า; จากรายการคลิกแถวเข้า Detail และกลับรายการ. ตรวจรูปแบบบน desktop/mobile และแจ้งจุดที่ต้องเปลี่ยนก่อนขยายไปโมดูลอื่น. ผลที่ควรเห็นคือทุกหน้ามีป้ายข้อมูลจำลองและไม่มีการเปลี่ยนข้อมูลจริง
