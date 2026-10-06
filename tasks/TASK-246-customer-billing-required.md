# TASK-246 — ข้อมูลภาษีrequired — 6 ตุลาคม 2569

เจ้าของยืนยัน8ช่อง required: เลขผู้เสียภาษี, VAT, สำนักงานใหญ่/สาขา, ที่อยู่ออกบิล, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์. เลขผู้เสียภาษีต้องเป็นตัวเลขครบ13หลัก. เลขที่สาขายังไม่เพิ่มข้อบังคับ.

IMPLEMENTED / WAITING_FOR_UAT: หมวดภาษีlocalclientกรอกได้ ดาว8ช่องพร้อมnative required/aria-required. TaxIdpatternและinlineerrorหลังblur/เปลี่ยนหลังtouched ไม่trimหรือตัดข้อมูลให้ผ่านเอง. ตรวจactualcomponentcallbackด้วยmockhooks: ว่าง/12/14/อักษรไม่ผ่าน 13ตัวเลขผ่านและerrorหายเมื่อแก้. Scopedlint/type/route77/diffผ่าน. ไม่มีbrowserQA/API/DB/save.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customers/create/page.tsx ใช้customer-billing-preview.tsxclientเฉพาะหมวดภาษี → ดาวแดง/aria-requiredทุก8/ตรวจtaxIdonBlurและแก้ไขหลังerror → scopedlint/type/route → UAT.

เปิดกรอกหมวดภาษีเฉพาะlocalpreviewเพื่อทดสอบvalidation ไม่มีAPI/DB/save. ตรวจรูปแบบ13ตัวเลขเท่านั้น ไม่ตรวจchecksum/ยืนยันผู้เสียภาษีจริงหรือเดาเงื่อนไขภาษีเพิ่มเติม.

⚠️ ต้องทดสอบโดยคุณ: เปิดหมวดภาษีในcreate ต้องมีดาวแดง8ช่อง. กรอกเลขผู้เสียภาษี12หรือ14หลัก/ตัวอักษรแล้วออกจากช่องต้องเห็นerror; ครบ13ตัวเลขerrorหาย. ช่องว่างหลังออกจากช่องแจ้งต้องกรอก. กล่องอื่นยังพับและบันทึกปิดไว้.
