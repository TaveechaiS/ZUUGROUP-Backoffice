# แผนย่อย TASK-059: Loading เต็มหน้าจอ

1. อ่าน `tasks/ACTIVE.md`, UI เดิม และคู่มือ Next.js `loading.tsx`; ลง Specs/Plan/Task ก่อนแก้โค้ด.
2. เพิ่ม `LoadingIcon` ใน `src/components/icons/status-icons.tsx` และปรับ `src/components/ui/loading-component.tsx` ให้เต็ม viewport, กลางจอ, ข้อความไทย, Tailwind motion และ reduced motion.
3. เพิ่ม `src/app/loading.tsx`, ครอบการอ่าน session ใน `src/app/layout.tsx` ด้วย Suspense และเปลี่ยนจุดโหลดหลักใน `src/app/dashboard-page-content.tsx`, `src/components/pages/module-list-page.tsx`, `src/components/pages/record-detail-page.tsx` ให้ใช้ component เดียวกัน.
4. ตรวจ lint/type-check/build, `git diff --check` และหน้าจอ; บันทึกผลใน `tasks/TASK-059-fullscreen-loading.md` กับ `tasks/ACTIVE.md`.

ผลลัพธ์: Loading เต็มจอรูปแบบเดียวกันระหว่าง route transition และ GET ข้อมูลหลัก.

วิธีตรวจรับ: เปิด Dashboard/หน้ารายการ/หน้ารายละเอียดบนเน็ตช้า หรือเปลี่ยนหน้า; ดู overlay และตรวจว่าหายเมื่อเสร็จหรือเกิด error. เปิด reduced motion แล้วดูว่าวงแหวนหยุดเคลื่อนไหว.
