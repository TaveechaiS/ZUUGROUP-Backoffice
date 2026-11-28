# TASK-243 — รหัสลูกค้า — 6 ตุลาคม 2569

OWNER_APPROVED_UI_PREVIEW: combobox1ช่องเลือกรหัสกลุ่ม + เลขรันแก้ได้1ช่อง + ช่องรหัสรวมอ่านอย่างเดียวตามสินค้า.

IMPLEMENTED / WAITING_FOR_UAT: componentclientแยกจากfieldsetdisabledแล้ว ใช้SearchComboboxกลางlocal ค้น/เลือก5กลุ่ม เลขรับเฉพาะตัวเลข/เติม0และรหัสรวมเปลี่ยนตามinput. ไม่ใส่เลขถัดไปหรือdefaultกลุ่มเอง. ScopedESLint/TypeScript/route77/diffผ่าน ไม่มีbrowserQA/DB/API.

ค่าที่ตกลง: PHAร้านขายยา, CLNคลินิกเวชกรรม/ทันตกรรม, HOSโรงพยาบาล (ตัวอย่างเอกชน), WSLยี่ปั๊ว/ผู้ค้าส่ง, GOVหน่วยงานราชการ/โรงพยาบาลรัฐ. ตัวอย่างPHA-0001, CLN-0015, HOS-0005, GOV-0002. แสดงอย่างน้อย4หลักตามตัวอย่าง ไม่กำหนดเพดานเลขรันโดยเดา.

ลำดับ: Specs/Plan → componentclientเฉพาะรหัสใช้SearchComboboxแบบlocal → เลขรันตัวเลข/เติม0/รหัสรวม → หน้าserverวางก่อนfieldsetdisabledข้อมูลทั่วไป → scopedlint/type/route → UAT.

ไฟล์: src/app/customers/create/page.tsx, src/app/customers/create/customer-code-preview.tsx, ACTIVE/Specs/Plan/taskนี้. ไม่DB/API/เลขถัดไปจริงหรือsave. Prefixยังไม่autoเปลี่ยนประเภท/ราคา/สิทธิ์.

OPENก่อนbackend: เลขรันแยกต่อกลุ่มหรือรวม, ช่วงเลข/เกิน4หลัก, เลขเริ่มต้น/เสนอเลขถัดไป, การเปลี่ยนรหัสเดิม. ไม่ติดตั้งระบบsequenceจากตัวอย่าง.

⚠️ ต้องทดสอบโดยคุณ: เปิด /customers/create เลือกPHAและกรอก1ต้องเห็นPHA-0001; CLN+15=CLN-0015, HOS+5=HOS-0005, GOV+2=GOV-0002; ค้นกลุ่มในcombobox/เลือกด้วยลูกศรEnterได้. เปลี่ยนเลขแล้วรหัสรวมเปลี่ยน ล้างกลุ่มหรือเลข/กรอก0ต้องไม่แสดงรหัสสมบูรณ์. พับหมวดอื่นและsave disabledคงเดิม.
