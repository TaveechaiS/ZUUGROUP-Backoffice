# TASK-247 — ช่องเลือกและไอคอนV — 6 ตุลาคม 2569

เจ้าของให้ปรับช่องที่ควรเป็นcomboboxและใช้iconVถูกต้อง.

IMPLEMENTED / WAITING_FOR_UAT: fixedlocalเลือกได้ masterที่รอเป็นdisabledcomboมีSVG/ARIA. ไอคอนVกลางแทนตัวอักษร⌄และsummaryลงเมื่อปิดขึ้นเมื่อเปิด. ScopedESLint0warnings/TypeScript/route77/diffผ่าน พร้อมactualsharedcombo callbackfocus/ArrowDown/Enter/Escapeและtax13digitregression. ไม่มีbrowserQA/API/DB/save.

แผน: บันทึก → ตัวเลือกlocalที่ตกลงVAT/HQbranch/ที่อยู่เริ่มต้น/วิชาชีพ/เครดิตเงินสด30/60/90ตามSpecsเดิม → disabledcomboboxช่องที่รอข้อมูลภูมิศาสตร์และmaster/กฎ → SVGchevronกลางใช้sharedSearchComboboxกับdisabledpreview → summaryลูกค้าชี้ลงเมื่อปิดและขึ้นเมื่อเปิด → lint/type/route/statechecks.

ไฟล์: customers/create/page.tsx, customer-billing-preview.tsx, customer-choice-preview.tsx, components/ui/chevron-down.tsx, search-combobox.tsx (เฉพาะicon) และเอกสาร. ช่องข้อความตัวเลขวันที่คงเดิม; ไม่มีconnectsave/DB/APIหรือเดาชุดprovince/license-result/creditstart. เขต/Salesไม่ดึงข้อมูลปิดงานเขตเดิม.

ตรวจรับ: VAT/HQ/วิชาชีพ/เครดิต/ที่อยู่เริ่มต้นเลือกหรือค้นได้ ตัวเลือกจากmasterที่ยังไม่มีdisabledมีV. Tax13digitและดาวคงเดิม. SVGVกลางแทนตัวอักษร⌄และaccordionปิดdown/openup. ตรวจsharedcomboboxkeyboardและscopedlint/type/route.

⚠️ ต้องทดสอบโดยคุณ: หน้าcreateเปิดกล่องภาษี เลือกVAT/HQได้; วิชาชีพ/เครดิต/จัดส่งเริ่มต้นเลือกได้. ช่องภูมิศาสตร์/เขต/Salesรอข้อมูลและยังเลือกไม่ได้. ดูVcomboboxและลูกศรsummaryปิดลง/เปิดขึ้น. ทดสอบSearchComboboxที่หน้าอื่นว่ายังใช้ลูกศรEnter/Escapeได้.
