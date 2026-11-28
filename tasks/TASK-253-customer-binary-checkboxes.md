# TASK-253 — ช่องติ๊กสองตัวเลือก — 6 ตุลาคม 2569

เจ้าของให้ช่อง2ค่าคงที่ใช้ติ๊ก/ไม่ติ๊กแทนcombobox. Checkboxlocalpreview4ช่อง: จัดส่งเริ่มต้นติ๊กใช่/ไม่ติ๊กไม่ใช่, VATติ๊กจด/ไม่ติ๊กไม่จด, HQติ๊กสำนักงานใหญ่/ไม่ติ๊กสาขา, วิชาชีพติ๊กแพทย์/ไม่ติ๊กเภสัชกร. อธิบายmappingข้างcheckboxทุกช่อง; ค่าfalsevalidไม่ใช้requiredHTMLที่บังคับให้ติ๊ก. ไม่กำหนดdefaultbusinessลงDBจากinitialuncheckedของpreview.

IMPLEMENTED / WAITING_FOR_UAT: ปรับ4ช่องcheckboxพร้อมmappingและlabelidแล้ว actualcomponentcallbacksทั้ง4pairsติ๊ก/ไม่ติ๊กกับmastercombo/scopedlint/typeผ่าน ไม่มีbrowserQA/API/DB.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customer-choice-preview.tsx binarybranch/options2 → customer-billing-preview.tsxส่งinputIdให้labelตรง → lint/type/actualcheckboxstate → UAT. รหัส/เครดิต/masterยังcombo ไม่API/DB.

⚠️ ต้องทดสอบโดยคุณ: ทั้ง4ช่องเป็นcheckbox ข้างช่องระบุความหมายติ๊กและไม่ติ๊ก กดติ๊ก/Spaceเปลี่ยนได้ ไม่ติ๊กไม่ใช่errorบังคับต้องติ๊ก. กลุ่มรหัส/เครดิตยังcomboboxและฟอร์มยังไม่save.
