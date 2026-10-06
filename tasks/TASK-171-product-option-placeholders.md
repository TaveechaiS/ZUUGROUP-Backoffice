# TASK-171 — รหัสชื่อในplaceholder

สถานะ: COMPLETED

ผล: placeholder/aria-labelและดาวแดงในช่องพร้อมแล้ว ถอนกรอบครอบinputs. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser.

1. บันทึกACTIVE/Specs/Plan.
2. product-options-manager.tsxถอนคำlabelและย้ายplaceholder/aria-labelรหัส/ชื่อ คงrequired. ถอนborder/paddingกรอบครอบinputs คงinputborderและbasisเดิม.
3. ตรวจESLint/diff.

ตรวจรับ: เห็นplaceholderรหัส/ชื่อ ไม่มีคำเหนือช่อง ไม่มีกรอบครอบช่องเพิ่ม. ช่องยังแก้ได้/requiredและvalidationเดิม.
