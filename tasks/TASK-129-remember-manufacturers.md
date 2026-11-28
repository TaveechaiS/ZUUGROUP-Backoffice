# TASK-129 — บริษัทผู้ผลิตพิมพ์เพิ่มและจำ

สถานะ IMPLEMENTED / WAITING_FOR_UAT; 5 ตุลาคม 2569. ผู้ผลิตใช้ Combobox จำชื่อแล้ว แยก key จากยี่ห้อและคงข้อมูลยี่ห้อเดิม. ESLint/persistence/dedupe/key compatibility/isolation/SSR labels/diff ผ่าน. ยังไม่ลอง browser หลัง login; ไม่มี API/DB/บันทึกสินค้า/commit/deploy.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan → เปลี่ยน product-brand-combobox.tsx เป็น product-name-combobox.tsx รองรับชนิด brand/manufacturer ใช้ label/key ตามชนิด และคงยี่ห้อ key เดิม → product-create-preview.tsx ใช้กับบริษัทผู้ผลิต → ESLint/ตรวจstorage isolation/dedupe/render/diff. ไม่แก้เจ้าของสิทธิ์/API/DB/ข้อมูลกลาง.

## ⚠️ ต้องทดสอบโดยคุณ

เพิ่มบริษัทผู้ผลิตด้วยชื่อใหม่ รีเฟรชและเลือกชื่อเดิมได้. ชื่อซ้ำต่าง case/ช่องว่างไม่เพิ่มซ้ำ. รายการยี่ห้อยังเดิมและไม่มีชื่อผู้ผลิตปนกัน. จำเฉพาะเบราว์เซอร์นี้.
