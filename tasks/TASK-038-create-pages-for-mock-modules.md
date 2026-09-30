# TASK-038 — หน้า Create สำหรับโมดูลตัวอย่าง

- **สถานะ:** READY_FOR_USER_TEST
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** [ข้อแก้ไขหน้า Create](../docs/specs/2026-09-30-create-pages-amendment.md)
- **Plan:** [แผนย่อย](../docs/plans/2026-09-30-create-pages-plan.md)
- **Commit ตั้งต้น:** `a593513` (มีงาน TASK-037 และเอกสารก่อนหน้าใน working tree)

## ขอบเขต

ย้ายฟอร์มเพิ่มรายการตัวอย่างจาก drawer ใน `ModuleListPage` ไป URL `<หน้ารายการ>/create` สำหรับ 20 หน้าที่ใช้ component นี้. หน้าผู้ใช้งานมี `/users/create` แล้ว. คงรูปแบบฟอร์มเดิมที่กรอกชื่อรายการเดียวและแสดงรายการใหม่ชั่วคราวในแท็บ. ไม่เพิ่ม schema, API, ฐานข้อมูลจริง หรือกฎธุรกิจของโมดูลที่ยัง OPEN.

## ไฟล์ที่คาดว่าจะเปลี่ยน

`src/components/pages/module-list-page.tsx`, `src/components/pages/mock-create-page.tsx`, `src/features/mock/mock-create-storage.ts`, `src/app/**/create/page.tsx` เฉพาะ 20 หน้า, `src/app/README.md`, Specs/Plan/Task/Handoff ที่เกี่ยวข้อง.

## วิธีตรวจรับ

- ทุกปุ่มเพิ่มบนหน้า Mock เปิด URL ของหน้านั้นตามด้วย `/create` และปุ่มกลับไปหน้ารายการทำงาน.
- ส่งฟอร์มชื่อรายการแล้วกลับหน้ารายการ เห็นแถวตัวอย่างใหม่ในแท็บเดิม; แสดงชัดว่าไม่บันทึกฐานข้อมูลจริง.
- เปิด URL `/create` โดยตรงได้เมื่อเข้าสู่ระบบ; ผู้ไม่เข้าสู่ระบบถูกพาไป Login.
- `lint`, `type-check`, `build`, `git diff --check` ผ่าน.

## ผลตรวจจาก AI

- มี route `/create` ครบ 20 จาก 20 หน้าที่ใช้ `ModuleListPage`; build แสดง route ทั้งหมด.
- `lint`, `type-check`, `build`, `git diff --check` ผ่าน; ทดสอบตัวช่วยเก็บข้อมูลตัวอย่างแยกตามโมดูลผ่าน.
- ทดสอบเปิด `/customers/create`, `/products/create`, `/quotes/create` โดยไม่ Login แล้วได้ redirect 307 ไป Login.
- รอตรวจการแสดงผลและการส่งฟอร์มใน Browser ที่เข้าสู่ระบบโดยเจ้าของโครงการ.

## ⚠️ ต้องทดสอบโดยคุณ

ลองจากหน้าอย่างน้อยลูกค้า สินค้า และใบเสนอราคา: กดเพิ่ม, ตรวจ URL `/create`, กรอกชื่อรายการ, กลับหน้ารายการและเห็นข้อมูลตัวอย่าง. หน้าอื่นที่ใช้ปุ่มเพิ่มต้องทำแบบเดียวกัน.
