# TASK-176 — เลขลำดับและรหัสเต็มตามเลือก

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: 00001และcallbackfullcodeพร้อมแล้ว. ESLint/diffผ่าน; mockhookhandlerตรวจinitialเลือกMD/TB→00001 แก้15/pad00015 เปลี่ยนCP→00003 เลข0/invalidselectionล้างfullcodeผ่าน. ยังไม่ตรวจbrowser/รันnextDB/ตรวจuniqueจริง.

1. บันทึกACTIVE/Specs/Plan.
2. product-option-combobox.tsxเพิ่มoptionalonChangeส่งProductOption/nullตอนเลือกและตรวจรายการเมื่อกลับfocus.
3. product-create-preview.tsxCodeFieldsเริ่ม00001รับgroup/formatและcomposecodeตามตัวเลือกกับsequence5หลัก. คงแก้ได้/เลข0-ว่างไม่compose.
4. ตรวจESLint/handlerstate/renders/diff. ไม่nextDB/ตรวจซ้ำจริง/API/schema.

ตรวจรับ: เปิดเพิ่มสินค้าเห็น00001 เลือกMD/TBรหัสMD-TB-00001ทันที แก้15เป็นMD-TB-00015 เปลี่ยนกลุ่ม/รูปแบบรหัสตามจริง กลุ่มถูกปิดจากsettingตรวจfocusแล้วfullcodeหาย. เลขจริง/uniqueรอbackend.
