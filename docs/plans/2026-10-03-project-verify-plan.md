# แผนย่อย TASK-087

1. อ่าน ACTIVE/package/scripts และคู่มือ Next CLI; ตรวจ dependencies ของ tests รวม snapshot เฉพาะเครื่อง แล้วลง Specs/Plan ก่อน code.
2. เพิ่ม `scripts/verify.mjs`: ใช้ process.execPath เรียก local binaries/test scripts แบบ arguments array, root cwd จากไฟล์ runner, stdio inherit, await ตามลำดับ, fail fast, รับสัญญาณหยุด. รองรับ --seed สำหรับชุด seed เสริมและตรวจไฟล์ก่อนรัน.
3. เพิ่ม scripts `verify`/`verify:seed` ใน package.json. เขียน `docs/VERIFY-GUIDE.md` และลิงก์ README เฉพาะส่วนวิธีตรวจ ไม่ขยายไปแก้คู่มือติดตั้งเก่า.
4. รัน `npm run verify` ครบจริง; ตรวจ failure/stop behavior ของ runner ด้วย process จำลองที่ fail และ marker ขั้นถัดไป. ตรวจ --seed แบบไม่มี snapshotด้วย precondition โดยไม่แก้ snapshot จริง.
5. ตรวจ diff และบันทึกผล Task/ACTIVE; ไม่ commit/push/Deploy ในงานนี้จนมีคำสั่ง.

ไฟล์: package.json, scripts/verify.mjs, README.md, docs/VERIFY-GUIDE.md, Specs/Plan หลักและย่อย, TASK-087/ACTIVE. Tests เดิมไม่แก้ assertion เพื่อทำให้ผ่าน.

ผลลัพธ์: คำสั่งเดียวตรวจ code/contracts/pages/build ที่ทำซ้ำได้; ข้อผิดพลาดระบุขั้นชัดเจน. วิธีตรวจรับ: เจ้าของรัน npm run verify ควรได้ผ่าน 9/9; กรณีไม่ผ่านแสดงขั้นและจบด้วย exit code ไม่เป็นศูนย์.
