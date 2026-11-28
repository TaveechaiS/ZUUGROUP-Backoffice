# TASK-087 — รวมชุดตรวจโครงการ

สถานะ: COMPLETE

เจ้าของตรวจรับเมื่อ 2026-10-03: “ok ครับ ผ่าน 9/9”. ปิดงานหลังผู้ใช้รันคำสั่งสำเร็จครบทุกขั้นตอน; ยังไม่ได้ commit รอบนี้.

เจ้าของอนุมัติข้อ 1 เมื่อ 2026-10-03. ขอบเขต/ลำดับ/ตรวจรับตาม [Specs](../docs/specs/2026-10-03-project-verify.md) และ [Plan](../docs/plans/2026-10-03-project-verify-plan.md).

ตรวจแล้ว: มี offline API contract/pagination/route-page/resource-API/field-name tests 5 ชุด; business-seed test ต้องใช้ snapshot เฉพาะเครื่อง. ใช้ runner เดียวและคำสั่งเสริมสำหรับ seed โดยไม่เพิ่ม dependencies/เปลี่ยน tests เดิม.

## ผลตรวจ 2026-10-03

- `npm run verify`: ผ่าน 9/9 ใช้เวลารวม 33.0 วินาที รวม production build
- จำลอง child exit 17: runner คืน 17 และไม่เริ่มขั้นถัดไป
- จำลอง SIGINT ระหว่าง child รอ: runner หยุด child, คืน 130 และถอด signal handlers โดยไม่เริ่มขั้นถัดไป
- เรียก precondition seed ด้วยโฟลเดอร์ที่ไม่มี snapshot: ปฏิเสธพร้อมชื่อ snapshot; ไม่แก้ snapshot จริงและไม่รัน seed กับ DB
- จัดรูปแบบไฟล์แล้ว; `git diff --check` ผ่าน
- ไม่เพิ่ม dependencies, ไม่เปลี่ยน UI/API/ข้อมูล, ไม่ commit/push/Deploy

## ⚠️ ต้องทดสอบโดยคุณ

หยุด dev/build ที่ใช้โครงการเดียวกันก่อน แล้วรัน `npm run verify` ควรเห็น `ผ่าน 9/9 ขั้นตอน` หากตรวจพบข้อผิดพลาดจะระบุขั้นและหยุดก่อนขั้นถัดไป ดู [คู่มือ](../docs/VERIFY-GUIDE.md).
