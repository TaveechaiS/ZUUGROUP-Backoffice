# แผนย่อย TASK-091

## แผนติดตาม: คำอธิบายสำหรับผู้ใช้ทั่วไป

1. บันทึกคำขอในSpecs/ACTIVE. แก้HTML/READMEฟอร์ม/Taskและเอกสารแผนเท่านั้น.
2. เพิ่มคำอธิบายใต้controlทุกชนิดและตัวอย่างรายช่อง; เชื่อมaria-describedby. ปรับป้ายที่แสดงเป็นไทยและreference tableให้เข้าใจง่าย โดยคงJSONkey/valueและselecteddraftเดิม.
3. ตรวจ helpercoverageทุก22หัวข้อ/ทุกcontrolและblankdefaults/legacy; browserอ่านตัวอย่าง“ใช้ช่องข้อมูลนี้/บังคับกรอก”และมือถือ. ไม่รันverifyแอปซ้ำเพราะไม่แก้แอป.
4. ส่งฟอร์มปรับแล้วให้ผู้ใช้ตรวจรวมรอบเดียว; ไม่commitแยก.

## แผนติดตาม: กรอกทีละจุด

1. แก้Specs/ACTIVEก่อนลงมือ. ไฟล์เพิ่ม scope: HTML/READMEฟอร์ม/UAT/TASK091.
2. สร้างcontrolรายfieldจากregistryและpresetโมดูลเฉพาะ, state/stepแถวเพิ่มได้, permissionแบบสามค่า(รอสรุป/ได้/ไม่ได้). JSONflatเดิมเพิ่มkey whitelistและอ่านlegacyไว้ครบ.
3. ปรับcapture/refresh/count/validate/printให้บันทึกทุกcontrol; ไม่ถือค่าเริ่มต้นว่างว่าอนุมัติ. คำตอบเก่าเก็บในdetails.
4. ตรวจการสลับ/reload/save/export-import/printและlegacy, browserdesktop/mobile; ส่งผู้ใช้ตรวจรวมครั้งเดียวตามเดิม.

1. ตรวจ ACTIVE/workbook/Google Forms และบันทึก Specs/Plan ก่อนแก้.
2. สร้าง docs/forms/business-requirements.html แบบ self-contained: module selector, field reference, คำถามร่วม/เฉพาะ, 4 Role, save/export/import/print. ใช้ textContent สำหรับคำตอบที่นำเข้า, reject payload ผิด schema/version/เกินขนาด.
3. คู่มือ docs/forms/README.md และลิงก์ workbook/UAT/README. ไฟล์กระทบเฉพาะเอกสาร/Task/Specs/Plan.
4. ตรวจ JS syntax และ registry coverage; เปิดด้วย browser ผ่าน local static preview ตรวจเลือกโมดูล/กรอก/save/import/export/print/mobile. ใช้คำตอบทดสอบเท่านั้นและล้างก่อนส่งมอบ.
5. ส่งไฟล์เปิดกรอกได้ทันที พร้อมข้อจำกัด Google sign-in; ไม่ commit แยกก่อนเจ้าของตรวจรวม.

ภาพ: workspaceเรียบ สีหลัก #1a58a7, labelอ่านง่าย/ช่องกรอกกว้าง. เนื้อหา: ข้อมูลผู้ให้คำตอบ → เลือกโมดูล → กรอกข้อกำหนด/สิทธิ์ → ส่งออก. การเคลื่อนไหว: focusและhoverสั้น รองรับ reduced motion; ไม่ใช้ Header sticky.

ตรวจรับ: เปลี่ยนโมดูลแล้วคำตอบเดิมอยู่, reloadคืนร่างเมื่อ storageใช้ได้, JSONส่งออก/นำเข้าครบ, printรวมทุกโมดูลที่มีคำตอบ, ไม่เชื่อมDB/network.
