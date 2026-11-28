# TASK-197 — แท็บจำนวนสินค้าในคลังหลัก

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. ACTIVE/Specs/Plan.
2. src/app/products/page.tsx tabs เหลือทั้งหมด. src/app/products/stock/[warehouse]/page.tsx MAINสามแท็บ ที่เหลือทั้งหมดอย่างเดียว.
3. scoped lint/mock: root1 MAIN3 MARKETING1 DISPOSAL1; กดlow/emptyส่ง warehouseCode=MAIN และ stock=low/empty พร้อมoffset0. คงกฎAPIเดิมไม่ DB write.

⚠️ ต้องทดสอบโดยคุณ: เปิดคลังหลักมี3แท็บ ใกล้หมดแสดงMAIN1–50 หมดแสดงMAIN0; หน้าสินค้าทั้งหมดไม่มีสองแท็บนี้.

ผล: scoped ESLint/diff ผ่าน; mock root1 MAIN3 MARKETING1 DISPOSAL1, กดlow/emptyส่งMAIN stockตรงและresetpage1/offset0ผ่าน. คงAPIเดิม ไม่มีDBwrite ยังไม่ได้ตรวจเบราว์เซอร์.
