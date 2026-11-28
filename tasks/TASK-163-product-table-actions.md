# TASK-163 — ถอนแท็บลบแล้วและปุ่มเพิ่มสินค้า

สถานะ: COMPLETED

ผล: ถอนUI/importไม่ใช้แล้ว คง3แท็บและAPIrequestdeleted=false. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser.

1. บันทึกACTIVE/Specs/Plan.
2. product-stock-list.tsxถอนแท็บลบแล้ว/ปุ่มเพิ่มขวาแถวแท็บ/importที่ไม่ใช้. APIrequestdeleted=falseคงstockfilterเดิม.
3. ตรวจESLint/diff.

ไฟล์: product-stock-list.tsx และACTIVE/Specs/Plan/Taskนี้.

ตรวจรับ: ตารางเหลือแท็บทั้งหมด/สินค้าใกล้หมด/สินค้าหมด ไม่มีปุ่มเพิ่มขวาแท็บ; เมนูเพิ่มสินค้าSideรองยังอยู่. ไม่มีAPI/DBเปลี่ยน.
