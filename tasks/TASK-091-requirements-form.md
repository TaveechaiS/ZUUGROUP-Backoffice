# TASK-091 แบบฟอร์มกรอกข้อกำหนด

สถานะ: READY_FOR_USER_TEST

อ้างอิง [Specs](../docs/specs/2026-10-03-requirements-form.md) / [แผน](../docs/plans/2026-10-03-requirements-form-plan.md). เจ้าของขอแบบฟอร์มกรอกได้; Google Form เป็นทางเลือก. รวม commit กับ TASK-089/090 หลังตรวจรับ.

## ผลตรวจ

### คำอธิบายสำหรับผู้ใช้ทั่วไป

- ทุกช่องมีคำอธิบายไทย/ตัวอย่าง: ใช้ช่องข้อมูล≠บังคับกรอก, ค้นหา≠ตัวกรอง, ห้ามซ้ำ/ล็อกหลังอนุมัติ, สถานะ/ขั้นตอน, สิทธิ์/ขอบเขต, รหัส/ภาษี/ปัดเศษและการเก็บไฟล์
- ป้ายหน้าใช้“ส่วนงาน/ช่องข้อมูล”และRoleไทย; referenceแปลชนิด/สัมพันธ์เป็นไทย, รหัสภายในเก็บไว้เฉพาะตารางข้อมูลประกอบ
- เชื่อมคำอธิบายกับcontrolด้วยaria-describedbyและชื่อสั้นaria-label; ตัวอย่างเป็นข้อความช่วย ไม่ใส่ในค่าinput
- VMตรวจ2438control instancesครอบคลุม22หัวข้อมีhelpทุกช่อง และร่างเดิม/legacy/สิทธิ์เริ่มว่างคงอยู่ ผ่าน
- Browserเปิดคำอธิบายuse/requiredได้จริง missinghelp0; มือถือ390px page375ไม่ล้น, resetviewportแล้ว. ไม่แก้คำตอบผู้ใช้ในการตรวจ
- JSsyntax/Prettier/diffผ่าน; ยังรอcommitรวมหลังตรวจรับ

### ปรับ input รายจุดตามคำขอล่าสุด

- ตัวอย่างแยกต่อfield, dropdownใช้งาน/บังคับ/ซ้ำ/ค้นหา/filter/locked, รหัส/สถานะเริ่มต้น/เรียง/ภาษี, status/stepเพิ่มได้สูงสุด20, permissionรายคำสั่ง/scope4Role
- คงJSONv1/draftเดิม; แสดงคำตอบเก่าในรายละเอียดพับได้ ไม่แปลงคำตอบอธิบายเป็นกฎโดยเดา
- Browserทดสอบแยก origin localhostจากร่างผู้ใช้127.0.0.1: กรอกตัวอย่าง/สิทธิ์/เพิ่มstatusแถว3/stepแถว3 → switch → reload ค่าเดิมครบ
- มือถือ390×844 pageWidth375ไม่ล้น, resetviewportและปิดแท็บทดสอบ
- VM: legacyยังอยู่, สิทธิ์เริ่มว่าง, atomic save/switch/export-import/print/invalidimportไม่ทำร่างหาย ผ่าน
- JSsyntax/Prettier/diffผ่าน; ไม่รันverifyแอปซ้ำเพราะstandalone artifactไม่เปลี่ยนapp
- ต้องตรวจรับช่องย่อยและdownloadจริงรวมกับUATเดิม แล้วcommit89–91ครั้งเดียว

- JS syntax ผ่าน; ข้อมูลฝัง22หัวข้อ/113ฟิลด์อ้างอิง
- Browser: กรอก2โมดูล เปลี่ยนกลับ/reloadแล้วคำตอบยังอยู่; ส่งออกแสดงsuccess แต่download eventของautomation timeout จึงไม่อ้างตรวจไฟล์ดาวน์โหลดจริงผ่าน
- VMพร้อมDOM/storage stubs: save/สลับ/export-import roundtrip/printรวม2โมดูล/invalid importรักษาร่าง ผ่าน; รอบแรกharnessใช้awaitในCommonJSผิด แก้ให้asyncแล้วผ่าน ไม่แก้productionเพื่อหลบtest
- มือถือ390×844: grid1คอลัมน์/pageWidth375ไม่ล้นviewport390; resetviewportแล้ว
- ล้างคำตอบทดสอบในpreviewแล้ว ไม่รวมคำตอบลงไฟล์HTML
- Prettier/JS syntax/diffผ่าน; ไม่แก้แอป/DB ไม่ส่งคำตอบออกnetwork
- GoogleFormsเปิดแล้วอยู่หน้าsign-in; ไม่ได้สร้างฟอร์มออนไลน์

## ⚠️ ต้องทดสอบโดยคุณ

เปิด docs/forms/business-requirements.html ด้วยChrome/Edge กรอก→สลับโมดูล→ส่งออก JSON→นำเข้ากลับ คำตอบควรครบ แล้วลองพิมพ์/Save as PDF. หากstorageใช้ไม่ได้ให้ส่งออกสำรอง. ใช้UATรวมเดิมและcommit89–91ครั้งเดียวหลังตรวจรับ.
