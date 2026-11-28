# แผนย่อย TASK-089

1. ตรวจชุด tests เดิม/handler/service/validators/registry/คู่มือ Next route; บันทึก Specs/Plan และ ACTIVE.
2. เพิ่ม scripts/test-record-flows.mjs พร้อม isolated fixture, fail-closed loader และ SQL adapter สำหรับ shared record service; ใช้ SQL template runtime เดิมไม่เชื่อม DB.
3. เรียก handler/service จริงและ assert response/state/audit: search/page/CRUD/rejected changes/conflict/rollback. แต่ละกรณี invalid ต้องตรวจว่า state/audit ไม่เปลี่ยน.
4. เพิ่ม test:flows ใน package.json และเพิ่มขั้นใน scripts/verify.mjs; ปรับ docs/VERIFY-GUIDE.md/README จาก 9 เป็น 10.
5. รัน test:flows และ verify ครบ; ตรวจ diff บันทึกผล. ไม่ commit งานใหม่อัตโนมัติหลัง checkpoint ก่อนหน้า.

ไฟล์: script ใหม่, package.json, scripts/verify.mjs, README/docs/VERIFY-GUIDE.md, Specs/Plan หลักและย่อย, tasks/TASK-089-record-flow-tests.md/ACTIVE.

ตรวจรับ: npm run test:flows ผ่านทุกกรณี และ npm run verify ผ่าน 10/10; ไม่แก้ข้อมูลจริงหรือเดากฎ OPEN.
