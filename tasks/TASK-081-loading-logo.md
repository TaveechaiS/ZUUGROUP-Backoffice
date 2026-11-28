# TASK-081 — ใช้โลโก้ที่เจ้าของส่งใน Loading

สถานะ: COMPLETE

เจ้าของส่งภาพโลโก้ Z สีน้ำเงินและระบุไฟล์ `public/Logoloading.png` ที่วางไว้แล้ว. `public/logo.png` ปัจจุบันเป็นสัญลักษณ์สีขาวคนละไฟล์. ตรวจภาพใหม่พบขนาด 594×420, RGBA และมุมภาพโปร่งใส; ใช้ไฟล์นี้ตรง ๆ. ภาพที่สร้างจากต้นแบบก่อนเจ้าของระบุไฟล์ไม่ถูกนำเข้าโครงการ.

ขอบเขตและลำดับ: [Specs TASK-059](../docs/specs/2026-10-01-fullscreen-loading.md) และ [Plan TASK-059](../docs/plans/2026-10-01-fullscreen-loading-plan.md) หัวข้องานติดตาม TASK-081. ไฟล์ที่เกี่ยวข้องคือ `public/Logoloading.png` ที่เจ้าของเพิ่ม, `src/components/ui/loading-component.tsx`, Specs/Plan/Task/ACTIVE. ไม่เปลี่ยน API/DB หรือ `public/logo.png`.

ผลลัพธ์: โลโก้สีของเจ้าของแสดงใน Loading เต็มจอและในตาราง ขนาดเหมาะกับแต่ละบริเวณ พื้นหลังไม่กลายเป็นกรอบดำ.

วิธีตรวจรับ: ตรวจภาพ asset, lint/type-check/build/diff-check; เจ้าของดู Loading สองรูปแบบบน desktop/mobile และ reduced motion.

ผลดำเนินการ: `LoadingComponent` ใช้ Next Image อ้าง `/Logoloading.png` แบบ eager/unoptimized ทั้ง variant เต็มจอและในตาราง. กรอบซ่อนเฉพาะพื้นที่ว่างโปร่งใสรอบโลโก้ด้วย CSS โดยไม่เปลี่ยนไฟล์รูป. คงข้อความ จุดสถานะ และ pulse ที่ปิดเมื่อระบบตั้ง reduced motion; เลิกใช้ไอคอนรายการเดิมใน Loading.

ผลตรวจ: ภาพต้นฉบับ RGBA 594×420, มุม alpha 0 และขอบตัวโลโก้ประมาณ 239×240 px; lint, type-check, build, Prettier เฉพาะ component และ diff-check ผ่าน. รอเจ้าของดูภาพจริงขณะ Loading บนหน้าและในตาราง.

งานติดตาม 2026-10-03: เจ้าของชอบภาพโลโก้ใหม่ แต่ขอให้เล็กเท่าไอคอนเดิมและมีวงแหวนล้อมอีกครั้ง. ขอบเขตและลำดับตาม Specs/Plan หัวข้อ 2026-10-03; แก้เฉพาะ `src/components/ui/loading-component.tsx` และเอกสารงาน. ตรวจรับโดยดูขนาดโลโก้กลางวงแหวนใน Loading เต็มจอ/ตาราง และตรวจ reduced motion.

ผลติดตาม: ลดกรอบในตารางกลับเป็น 64px และคงกรอบเต็มจอ 112px; ย่อภาพตามพื้นที่โปร่งใสให้โลโก้ที่มองเห็นประมาณ 32px/58px และคืนวงแหวนสองชั้นพร้อมการหมุนแบบ `motion-safe`. `npm run lint`, `npx tsc --noEmit --incremental false`, `npm run build`, Prettier และ `git diff --check` ผ่าน. คำสั่ง type-check ตาม package เขียน `tsconfig.tsbuildinfo` ไม่ได้ (EPERM) จึงใช้โหมดไม่เขียน cache; build ผ่านเมื่อให้สิทธิ์เขียน cache `.next`.


ตรวจรับ 2026-10-03: เจ้าของยืนยัน “ok แล้ว” กับรายการ UI และการใช้งานจริงที่สรุปให้ รวมขอบเขตงานนี้ตามผลล่าสุด. รายงานที่ระบุรอ UAT ด้านบนเป็นประวัติก่อนคำยืนยันนี้; กรณีพิเศษที่ไม่ได้ระบุในรายการตรวจรับไม่ถือว่ามีผลทดสอบแยก. ดู CHECKPOINT-2026-10-03.md.
