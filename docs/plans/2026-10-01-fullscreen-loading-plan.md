# แผนย่อย TASK-059: Loading เต็มหน้าจอ

1. อ่าน `tasks/ACTIVE.md`, UI เดิม และคู่มือ Next.js `loading.tsx`; ลง Specs/Plan/Task ก่อนแก้โค้ด.
2. เพิ่ม `LoadingIcon` ใน `src/components/icons/status-icons.tsx` และปรับ `src/components/ui/loading-component.tsx` ให้เต็ม viewport, กลางจอ, ข้อความไทย, Tailwind motion และ reduced motion.
3. เพิ่ม `src/app/loading.tsx`, ครอบการอ่าน session ใน `src/app/layout.tsx` ด้วย Suspense และเปลี่ยนจุดโหลดหลักใน `src/app/dashboard-page-content.tsx`, `src/components/pages/module-list-page.tsx`, `src/components/pages/record-detail-page.tsx` ให้ใช้ component เดียวกัน.
4. ตรวจ lint/type-check/build, `git diff --check` และหน้าจอ; บันทึกผลใน `tasks/TASK-059-fullscreen-loading.md` กับ `tasks/ACTIVE.md`.

ผลลัพธ์: Loading เต็มจอรูปแบบเดียวกันระหว่าง route transition และ GET ข้อมูลหลัก.

วิธีตรวจรับ: เปิด Dashboard/หน้ารายการ/หน้ารายละเอียดบนเน็ตช้า หรือเปลี่ยนหน้า; ดู overlay และตรวจว่าหายเมื่อเสร็จหรือเกิด error. เปิด reduced motion แล้วดูว่าวงแหวนหยุดเคลื่อนไหว.

## งานติดตาม TASK-078 — Dashboard retry

1. อ่าน `tasks/ACTIVE.md`, Dashboard ใน `src/app/page.tsx`, Specs/Plan นี้ และคู่มือ Client Component ของ Next.js; บันทึก TASK-078 ก่อนแก้โค้ด.
2. แก้ handler ปุ่ม “ลองใหม่” ใน `src/app/page.tsx` ให้ล้าง error ก่อนเพิ่ม retry; Loading เดิมจึงแสดงระหว่าง GET ใหม่.
3. ตรวจ `npm run lint`, `npm run type-check`, `git diff --check`; บันทึกผลใน `tasks/TASK-078-dashboard-retry-loading.md` และ `tasks/ACTIVE.md`.

ผลลัพธ์: retry หลัง error แสดง Loading แล้วเปลี่ยนเป็น Dashboard เมื่อสำเร็จหรือ error ใหม่เมื่อล้มเหลว. ไม่เปลี่ยน API/DB หรือกฎธุรกิจ.

## งานติดตาม TASK-080 — Loading ในพื้นที่ตาราง

1. อ่าน ACTIVE, หน้ารายการและคู่มือ Next.js loading; บันทึก Specs/Plan/Task ก่อนแก้โค้ด.
2. เพิ่ม variant แบบอยู่ในกรอบข้อมูลให้ `src/components/ui/loading-component.tsx`; ให้ `src/components/ui/list-request-state.tsx` รับผิดชอบ error เท่านั้น.
3. ย้าย Loading จากบนสุดของหน้าเข้าในกรอบตารางของหน้ารายการ 18 หน้า และเพิ่มในกรอบข้อมูลของ `src/app/products/page.tsx`, `src/app/users/page.tsx`, `src/app/audit-logs/page.tsx`. คง search/filter/pagination/API เดิม.
4. ตรวจ lint, type-check, build, diff-check และจำนวนหน้าที่เปลี่ยนครบ; บันทึกผลใน `tasks/TASK-080-table-loading.md` กับ ACTIVE. เจ้าของตรวจ desktop/mobile ระหว่างพิมพ์ค้นหาและเปลี่ยนหน้า.

ผลลัพธ์: Loading เฉพาะบริเวณตาราง โดยช่องค้นหา/ตัวกรองไม่ถูกบัง; route/session loading ยังเต็มจอ.

## งานติดตาม TASK-081 — โลโก้ Loading

1. อ่าน ACTIVE/Specs/Plan และตรวจ `public/Logoloading.png` ที่เจ้าของระบุเทียบกับ `public/logo.png` เดิม; บันทึก TASK-081 ก่อนแก้ source.
2. ตรวจ alpha/ขอบภาพของไฟล์เดิมโดยไม่แก้ไฟล์; ใช้ CSS ใน component แสดงตัวโลโก้ให้ได้ขนาดเหมาะสม.
3. ปรับ `src/components/ui/loading-component.tsx` ให้ใช้ `public/Logoloading.png` ทั้ง variant `screen` และ `content` โดยคงข้อความ/ขนาดตามพื้นที่และ reduced motion.
4. ตรวจ lint/type-check/build/diff-check และให้เจ้าของดูหน้าจอจริง.

ผลลัพธ์: Loading ใช้ไฟล์โลโก้ที่เจ้าของวางไว้; asset สีขาวเดิมไม่ถูกแทนที่.

## งานติดตาม TASK-081 — ปรับขนาดและคืนวงแหวน 2026-10-03

1. อ่าน `tasks/ACTIVE.md` และบันทึกขอบเขตใน ACTIVE/TASK-081; ปรับ Specs และแผนนี้ก่อนแก้ component.
2. แก้ `src/components/ui/loading-component.tsx`: ลดขนาดภาพตามพื้นที่โปร่งใสในไฟล์ให้เห็นโลโก้ใกล้ไอคอนเดิม และคืนวงแหวนสองชั้นทั้ง `screen`/`content` โดยใช้ Tailwind utility และรองรับ reduced motion.
3. ตรวจ lint, type-check, build, diff-check; บันทึกผลใน TASK-081/ACTIVE. เจ้าของตรวจ Loading เต็มจอและในตารางบน desktop/mobile รวมถึง reduced motion.

ผลลัพธ์: โลโก้ขนาดเดิมภายในวงแหวน โดยยังใช้ `public/Logoloading.png` ไฟล์เดิม.
