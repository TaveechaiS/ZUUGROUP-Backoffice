# TASK-059 — Loading เต็มหน้าจอ

สถานะ: READY_FOR_USER_TEST

เจ้าของโครงการขอ 2026-10-01 ให้ Loading ขึ้นกลางหน้าจอระหว่างเปลี่ยนหน้าและโหลดข้อมูล พร้อม icon และ motion ที่ดูนุ่มขึ้น.

ขอบเขตและลำดับ: [Specs](../docs/specs/2026-10-01-fullscreen-loading.md) และ [Plan](../docs/plans/2026-10-01-fullscreen-loading-plan.md).

ผลดำเนินการ: ปรับ LoadingComponent ให้เป็น overlay กลาง viewport พร้อม LoadingIcon วงแหวนหมุนและจุดสถานะที่เปลี่ยนความเข้มอย่างนุ่มนวล; แอนิเมชันทำงานเฉพาะเมื่อไม่ได้ตั้ง reduced motion. เพิ่ม `src/app/loading.tsx` สำหรับการเปลี่ยนหน้า, Suspense รอบการอ่าน session ใน `src/app/layout.tsx` สำหรับหน้าแรก และใช้ component เดียวกันใน Dashboard, รายการโมดูล และรายละเอียดโมดูล. เมื่อ GET ล้มเหลว overlay หายและแสดงข้อความ error เดิม.

ผลตรวจ: หลังแก้ layout รัน `npm run lint`, `npm run type-check`, `npm run build` ผ่าน; Prettier check และ `git diff --check` ผ่าน; CSS motion ปรากฏใน build. เครื่องมือ browser สำหรับดูภาพเริ่มทำงานไม่ได้ในรอบนี้ จึงรอเจ้าของตรวจจังหวะ/ภาพจริงบนหน้าจอ.
