# TASK-158 — กล่องเต็มข้อมูลพื้นฐานสินค้า

สถานะ: COMPLETED

ผล: ใช้กล่องdiv border rounded พร้อมหัวข้อปกติแล้ว คง10กล่องย่อย. ESLint/diff whitespace ผ่าน; ยังไม่ตรวจภาพจริงในbrowser.

1. บันทึกข้อกำหนดใหม่แทนTASK157ในACTIVE/Specs/Plan.
2. product-options-manager.tsx ถอนstate/outerdetails/summary/ลูกศร ใช้divมีborder roundedและh2ปกติ. คงกล่องย่อยเดิม.
3. ตรวจ ESLint/diff และโครงสร้าง.

ไฟล์: product-options-manager.tsx และ ACTIVE/Specs/Plan/Taskนี้.

ตรวจรับ: หัวข้อข้อมูลพื้นฐานสินค้าไม่มีลูกศรหรือพับ เนื้อหาแสดงในกรอบมุมมนตลอด. กล่องย่อยยังทำงานเดิม.
