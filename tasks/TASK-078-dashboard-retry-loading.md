# TASK-078 — Loading เมื่อ Dashboard ลองโหลดใหม่

สถานะ: COMPLETE

งานติดตามใน TASK-059 ที่เจ้าของอนุมัติแล้ว. หลัง Dashboard โหลดข้อมูลผิดพลาด ปุ่ม “ลองใหม่” เพิ่ม retry แต่คงค่า error เดิมไว้ จึงไม่แสดง Loading ระหว่างคำขอใหม่.

ขอบเขตและลำดับ: [Specs](../docs/specs/2026-10-01-fullscreen-loading.md) และ [Plan](../docs/plans/2026-10-01-fullscreen-loading-plan.md) หัวข้องานติดตาม TASK-078. แก้เฉพาะ `src/app/page.tsx` และเอกสารสามไฟล์; ไม่เปลี่ยน API/DB.

ผลลัพธ์ที่ต้องได้: กด “ลองใหม่” แล้ว Loading ปรากฏทันที; สำเร็จแสดงข้อมูล; ล้มเหลวแสดง error ใหม่. คงข้อความและ API เดิม.

วิธีตรวจรับ: ตรวจ lint/type-check/diff-check; เจ้าของลองตัดเครือข่ายตอนเปิด Dashboard, กด “ลองใหม่” เมื่อเชื่อมต่อกลับ และสังเกต Loading ก่อนข้อมูล.

ผลตรวจ: `npm run lint`, `npm run type-check` และ `git diff --check` ผ่าน. ครั้งแรก type-check ติด Next route types ที่สร้างค้างจาก route เก่าและ cache เขียนไม่ได้ใน sandbox; สร้าง types ใหม่ด้วย `npx next typegen`, ลบเฉพาะ `.next/dev/types/validator.ts` ที่ค้าง แล้ว type-check ผ่าน. ยังรอเจ้าของทดสอบจังหวะ Loading ใน browser.


ตรวจรับ 2026-10-03: เจ้าของยืนยัน “ok แล้ว” กับรายการ UI และการใช้งานจริงที่สรุปให้ รวมขอบเขตงานนี้ตามผลล่าสุด. รายงานที่ระบุรอ UAT ด้านบนเป็นประวัติก่อนคำยืนยันนี้; กรณีพิเศษที่ไม่ได้ระบุในรายการตรวจรับไม่ถือว่ามีผลทดสอบแยก. ดู CHECKPOINT-2026-10-03.md.
