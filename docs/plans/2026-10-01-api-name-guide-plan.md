# แผนย่อย TASK-058: คู่มือชื่อ API

1. อ่าน `tasks/ACTIVE.md`, Collection, route และ `modules.json` เพื่อยืนยันชื่อโฟลเดอร์/URL/หน้าที่.
2. บันทึกข้อกำหนดใน Specs, ลำดับงานใน Plan และขอบเขตใน Task ก่อนเขียนคู่มือ.
3. สร้าง `docs/API-NAME-GUIDE.md` ให้ครบ 23 กลุ่ม โดยใส่ชื่อไทย/อังกฤษ, หน้าที่, URL ตัวอย่าง, คำสั่งที่พบบ่อย และข้อจำกัดข้อมูล.
4. เพิ่มลิงก์จาก `postman/README.md`; ตรวจชื่อ/จำนวนเทียบ Collection และ `git diff --check`; บันทึกผลใน `tasks/TASK-058-api-name-guide.md` กับ `tasks/ACTIVE.md`.

ผลลัพธ์: ผู้ใช้เปิด Postman แล้วเทียบชื่อโฟลเดอร์กับคู่มือได้โดยตรง.

วิธีตรวจรับ: เปิด Collection `Zuugroup` และคู่มือพร้อมกัน แล้วไล่ชื่อจาก `api` ถึง `warehouses` ว่าตรงกันและเข้าใจว่าจะใช้คำขอใด.
