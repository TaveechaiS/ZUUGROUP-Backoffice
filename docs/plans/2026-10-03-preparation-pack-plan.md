# แผนย่อย TASK-090

1. อ่าน ACTIVE/registry/หน้าจอจริง/Specs OPEN และผล TASK-089; บันทึกขอบเขตก่อนแก้.
2. สร้าง docs/BUSINESS-REQUIREMENTS-WORKBOOK.md: 14 โมดูลพร้อม field ไทย/อังกฤษ/ชนิด/required/relation ปัจจุบัน, ช่องข้อมูลจริง/สถานะ/filter/permission; เพิ่มสินค้า/ผู้ใช้/คลัง/Dashboard/reports/audit/import/PDF และรายการคำถาม OPEN.
3. สร้าง docs/USER-MANUAL.md: ขั้นตอนตาม UI ปัจจุบันและข้อจำกัดที่ตรวจพบ; ภาษาไทยไม่ใส่ secrets/บัญชีจริง.
4. สร้าง docs/UAT-PREPARATION.md: ตรวจรับครั้งเดียว มีขั้นตอน/ผลคาดหวัง/ช่องผล และเกณฑ์ commit ทั้งชุด.
5. เชื่อม README และ Specs/Plan หลัก; ตรวจ coverage/links/required จาก registry และรูปแบบเอกสาร; ใช้ผล verify TASK-089 ล่าสุดเพราะไม่เปลี่ยน executable code.
6. ส่งรายการตรวจเดียว รอผลเจ้าของแล้ว commit ครั้งเดียว. ไม่ push/Deploy.

ไฟล์: เอกสารข้างต้น, README, Specs/Plan หลักและย่อย, tasks/TASK-090-preparation-pack.md/ACTIVE, TASK-089 สถานะตรวจรับ.

ตรวจรับ: ทุกโมดูลมีแบบฟอร์มครบและคู่มือไม่อ้างฟีเจอร์ที่ไม่มี; owner ใช้ UAT-PREPARATION เพียงชุดเดียว. ผลอัตโนมัติเดิม 14/14 และ verify 10/10 ไม่ต้องรันซ้ำเพียงเพราะเปลี่ยนเอกสาร.
