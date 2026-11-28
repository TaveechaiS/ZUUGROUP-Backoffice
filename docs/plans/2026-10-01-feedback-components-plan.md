# แผนย่อย TASK-056: คอมโพเนนต์สถานะกลาง

1. อ่าน `tasks/ACTIVE.md`, ตัวอย่างเจ้าของ, UI ปัจจุบัน และคู่มือ Next.js ที่เกี่ยวข้อง; ลงขอบเขตใน Specs/Plan/Task.
2. สร้าง `src/components/icons/status-icons.tsx`, `src/components/ui/success-alert-component.tsx`, `src/components/ui/not-found-component.tsx`, `src/components/ui/loading-component.tsx` ให้ใช้ข้อความไทย, Tailwind `className` และ semantics สำหรับ accessibility.
3. แก้ `src/components/pages/module-list-page.tsx`, `src/app/products/[ref]/product-detail.tsx`, `src/app/dashboard-page-content.tsx` เพื่อใช้สถานะใหม่โดยไม่เปลี่ยนการเรียก API และข้อมูล.
4. ตรวจ lint, type-check, build และบันทึกผลใน `tasks/TASK-056-feedback-components.md` กับ `tasks/ACTIVE.md`.

ผลลัพธ์: ไอคอน SVG และคอมโพเนนต์ใช้ซ้ำได้; สถานะโหลด/ว่าง/สำเร็จในจุดที่ระบุสอดคล้องกัน.

วิธีตรวจรับโดยเจ้าของ: เปิด Dashboard/หน้ารายการช่วงโหลด, กรองรายการจนไม่พบข้อมูล, กู้คืนรายการหรือแก้ไขสินค้า; ตรวจภาษาไทย ปุ่มลองใหม่/ปิด และ dialog สำเร็จ.
