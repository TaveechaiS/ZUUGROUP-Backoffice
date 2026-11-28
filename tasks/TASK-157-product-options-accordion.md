# TASK-157 — Accordion ข้อมูลพื้นฐานสินค้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: Accordionระดับหัวข้อหลักพร้อมกรอบ/ลูกศรและopen stateแล้ว. ESLint/diff/SSR11details-summaryและouterเปิดเริ่มต้นผ่าน. รอตรวจคลิก/คีย์บอร์ดในbrowser.

1. บันทึก ACTIVE/Specs/Plan.
2. product-options-manager.tsx เปลี่ยนหัวข้อหลักเป็นsummaryในdetailsพร้อมกรอบและลูกศร. เปิดเริ่มต้นและพับได้ ไม่unmountกล่องย่อย.
3. ตรวจ ESLint/render/diff.

ไฟล์: product-options-manager.tsx และเอกสาร ACTIVE/Specs/Plan/Task นี้.

ตรวจรับ: กดข้อมูลพื้นฐานสินค้าหรือEnter/Spaceแล้วพับ/เปิดกล่องย่อยทั้งหมด ลูกศรเปลี่ยนตาม. ข้อมูลที่กรอกด้านในคงอยู่เมื่อพับและเปิดใหม่.
