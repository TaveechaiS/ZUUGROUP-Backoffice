# แผนย่อย TASK-038 — หน้า Create ของโมดูลตัวอย่าง

**วันที่:** 2026-09-30 (Asia/Bangkok)
**ขอบเขต:** UI/route ของ 20 หน้า `ModuleListPage` เท่านั้น

## ลำดับ

1. บันทึกคำยืนยันใน Specs และ Task; ตรวจรายชื่อหน้า Mock ที่มีปุ่มเพิ่ม. ผลลัพธ์: รายชื่อ 20 URL ที่แน่นอน. ไฟล์: `docs/specs/2026-09-30-create-pages-amendment.md`, `tasks/TASK-038-create-pages-for-mock-modules.md`.
2. แยกฟอร์มหนึ่งช่องเป็น component Create ร่วม และจัดเก็บแถวตัวอย่างชั่วคราวใน session ของแท็บเพื่อกลับมาหน้ารายการได้. ไฟล์: `src/components/pages/mock-create-page.tsx`, `src/features/mock/mock-create-storage.ts`.
3. เปลี่ยนปุ่มเพิ่มใน `ModuleListPage` ให้ลิงก์ไป `<href>/create`, โหลดแถวตัวอย่างของแท็บ และลบ drawer เดิม. ไฟล์: `src/components/pages/module-list-page.tsx`.
4. เพิ่ม `page.tsx` ในโฟลเดอร์ `create` ของทั้ง 20 หน้า โดยใช้ config เดิมและตรวจ session ที่ Server. ไฟล์: `src/app/**/create/page.tsx` สำหรับหน้าที่ใช้ `ModuleListPage`.
5. อัปเดตแผนผังหน้าและตรวจ lint, type-check, build, diff-check; ทดลอง URL และการเพิ่มตัวอย่าง. ไฟล์: `src/app/README.md`, Task/Handoff.

## ตรวจรับ

ทุกหน้า Mock ที่มีปุ่มเพิ่มเปิด `/create`; ฟอร์มเดิมส่งได้และแถวใหม่แสดงเมื่อกลับรายการในแท็บนั้น. ไม่สร้างข้อมูลจริงหรือกฎธุรกิจใหม่. ผู้ใช้ตรวจภาพและการนำทางอย่างน้อยสามโมดูล และสุ่ม URL ที่เหลือ.
