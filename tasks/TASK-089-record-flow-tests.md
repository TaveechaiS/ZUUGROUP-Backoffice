# TASK-089 ทดสอบ flow ด้วยข้อมูลจำลอง

สถานะ: COMPLETE

เจ้าของยืนยัน “ผ่านหมด” แล้ว; รอรวม commit พร้อม TASK-090 ครั้งเดียวหลังตรวจรับชุดเตรียมตามคำสั่งล่าสุด.

เจ้าของอนุมัติให้ทำต่อหลัง checkpoint 6c7916a. ขอบเขต/ลำดับ/ไฟล์/ตรวจรับตาม [Specs](../docs/specs/2026-10-03-record-flow-tests.md) และ [Plan](../docs/plans/2026-10-03-record-flow-tests-plan.md).

## ผลตรวจ

- npm run test:flows ผ่าน 14/14 กรณี exit 0
- npm run verify ผ่าน 10/10 ใน 29.8 วินาที exit 0 รวม lint/typegen/types/tests/build
- git diff --check ผ่าน; production code/DB/กฎธุรกิจเดิมไม่เปลี่ยน
- ทดสอบ shared record engine ผ่าน customer-groups; ใช้ runtime SQL template เดิมและ adapter ในหน่วยความจำ ไม่จำลองทั้ง PostgreSQL/locking และไม่ทดสอบ UI ผ่าน browser
- checkpoint ก่อนหน้า 6c7916a บน AI; งาน TASK-089 ยังไม่ commit/push/Deploy

## ⚠️ ต้องทดสอบโดยคุณ

หยุด dev/build ที่ใช้ .next เดียวกันก่อน รัน npm run test:flows ควรเห็น 14/14 และ npm run verify ควรเห็น 10/10. การตรวจหน้าจอ/Loading/SuccessAlert ยังใช้รายการตรวจรับเดิม.
