# TASK-190 — วันหมดอายุหนึ่งฝั่ง

สถานะ: COMPLETED

ถอนgrowเฉพาะexpiresOnแล้ว คงbasisครึ่งแถวและมือถือเต็ม. ESLint/git diff --checkผ่าน รอตรวจภาพbrowserตามขนาดหน้าจอ.

1. บันทึกACTIVE/Specs/Plan.
2. src/app/products/stock/create/page.tsx: เฉพาะexpiresOnwrapperถอนmd:flex-1 คงbasis-full/md:basisครึ่งแถว.
3. ESLint/git diff --check ไม่เพิ่มtestsสำหรับclasslayout.

ตรวจรับ: จอคอมวันหมดอายุกว้างเท่าฝั่งวันผลิต มือถือเต็มแถวเหมือนเดิม. ไม่API/DB/commit/deploy.
