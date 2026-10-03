# TASK-080 — Loading ในพื้นที่ตารางรายการ

สถานะ: COMPLETE

เจ้าของขอ 2026-10-02 ให้ Loading ระหว่างพิมพ์ค้นหาแสดงในตารางหรือส่วนข้อมูล แทนการคลุมทั้งหน้าจอ. ขอบเขตและลำดับอยู่ใน [Specs TASK-059](../docs/specs/2026-10-01-fullscreen-loading.md) และ [Plan TASK-059](../docs/plans/2026-10-01-fullscreen-loading-plan.md) หัวข้องานติดตาม TASK-080.

ไฟล์ที่จะเปลี่ยน: `src/components/ui/loading-component.tsx`, `src/components/ui/list-request-state.tsx`, หน้ารายการโมดูล 18 หน้าใน `src/app/**/page.tsx`, `src/app/products/page.tsx`, `src/app/users/page.tsx`, `src/app/audit-logs/page.tsx`, Specs/Plan/Task/ACTIVE. ไม่เปลี่ยน detail/create pages, API, DB หรือกฎธุรกิจ.

ผลลัพธ์: ระหว่าง GET รายการเห็นสถานะกำลังโหลดในกรอบตาราง โดยช่องค้นหาและตัวกรองไม่ถูกบัง; error แสดงแทน Loading; route/session loading เต็มจอเหมือนเดิม.

ตรวจรับ: lint/type-check/build/diff-check ผ่าน; ตรวจว่าทั้ง 21 หน้ารายการไม่มี Loading แบบ fixed ที่บนสุด; เจ้าของลองค้นหา เปลี่ยน filter และหน้า 2 บน desktop/mobile.

ผลดำเนินการ: `LoadingComponent` มี variant `content` แบบอยู่ในกรอบข้อมูล; หน้ารายการโมดูล 18 หน้าและสินค้า/ผู้ใช้/Audit อีก 3 หน้าแสดง Loading ภายในกรอบตาราง. `ListRequestState` เหลือการแสดง error/retry. หน้ารายละเอียด, Dashboard, route/session fallback ยังใช้ Loading เต็มจอ.

ผลตรวจ: lint, type-check, production build, offline route check 59 routes และ `git diff --check` ผ่าน; ตรวจพบป้าย Loading ในหน้ารายการครบ 21 หน้า. ยังรอทดสอบการพิมพ์ค้นหา/ตัวกรอง/เปลี่ยนหน้าจริงใน browser.


ตรวจรับ 2026-10-03: เจ้าของยืนยัน “ok แล้ว” กับรายการ UI และการใช้งานจริงที่สรุปให้ รวมขอบเขตงานนี้ตามผลล่าสุด. รายงานที่ระบุรอ UAT ด้านบนเป็นประวัติก่อนคำยืนยันนี้; กรณีพิเศษที่ไม่ได้ระบุในรายการตรวจรับไม่ถือว่ามีผลทดสอบแยก. ดู CHECKPOINT-2026-10-03.md.
