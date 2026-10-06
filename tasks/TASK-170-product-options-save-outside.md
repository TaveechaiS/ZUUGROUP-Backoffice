# TASK-170 — บันทึกนอกกรอบและลบborderรอบนอก

สถานะ: COMPLETED

ผล: ปุ่มบันทึก/ยกเลิกอยู่ใต้กรอบinputsในformเดิม outercontainerไม่มีborderแล้ว. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser.

1. บันทึกACTIVE/Specs/Plan.
2. product-options-manager.tsxถอนoutercontainerborder. formคงsubmitแต่ไม่มีกรอบ ใช้innerboxเฉพาะinputs/error ปุ่มบันทึก/ยกเลิกด้านล่างนอกกรอบ.
3. กล่องรายการความสูงเท่ากับinnerboxโดยจัดrowปุ่มต่ำกว่ากรอบตามgrid. ตรวจlint/diff.

ตรวจรับ: ปุ่มบันทึกอยู่นอกกรอบใต้ช่องกรอก ไม่เห็นborderใหญ่รอบข้อมูลพื้นฐานสินค้า. ยังคง2กล่อง/table borderและsubmitทำงานเดิม.
