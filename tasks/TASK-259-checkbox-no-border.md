# TASK-259 — ช่องติ๊กไม่มีกล่องกรอบ — 6 ตุลาคม 2569

เจ้าของให้ช่องติ๊กไม่ทำกรอบborder. ถอนborder/rounded/paddingจากwrappercheckboxในcustomer-choice-preview.tsx คงตัวcheckboxจริงและข้อความติ๊ก/ไม่ติ๊ก.

IMPLEMENTED / WAITING_FOR_UAT: ถอนกรอบแล้ว scopedESLintผ่าน.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customer-choice-preview.tsxคลาสwrapper → scopedlint → UAT. ไม่ค่า/required/combobox/API/DB.

⚠️ ต้องทดสอบโดยคุณ: เปิดcreateช่องVAT/HQ/จัดส่งเริ่มต้น/วิชาชีพไม่มีกรอบกล่องภายนอก ยังติ๊กและเอาติ๊กออกได้.
