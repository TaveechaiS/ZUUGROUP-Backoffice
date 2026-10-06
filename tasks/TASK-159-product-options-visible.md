# TASK-159 — แสดงข้อมูลพื้นฐานสินค้าทันที

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: 10กล่องเต็มพร้อมpanelทั้งหมดและเลื่อนinitialKindแล้ว. ESLint/diff/SSR10formsไม่มีdetailsผ่าน; รอตรวจbrowserและCRUDจริง.

1. บันทึก ACTIVE/Specs/Plan.
2. product-options-manager.tsx ถอนdetails/summary/ลูกศร/state lazy mountระดับย่อย ใช้section border rounded แสดง10panelsทันที.
3. คงลิงก์kindใช้เลื่อนสู่กล่องนั้น ตรวจlint/diff.

ไฟล์: product-options-manager.tsx และเอกสารACTIVE/Specs/Plan/Taskนี้.

ตรวจรับ: เปิดหน้าข้อมูลพื้นฐานสินค้าเห็นค้นหา/ฟอร์ม/ตารางทุกหัวข้อทันที ไม่มีปุ่มเปิดกล่อง; ลิงก์kind=brandเลื่อนสู่ยี่ห้อ; CRUDและpaginationแยกกันเหมือนเดิม.
