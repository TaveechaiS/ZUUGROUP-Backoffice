# TASK-128 — ยี่ห้อพิมพ์เพิ่มและจำให้เลือก

สถานะ IMPLEMENTED / WAITING_FOR_UAT; 5 ตุลาคม 2569.

ผลตรวจ: ยี่ห้อจำใน localStorage และเลือก/เพิ่มได้แล้ว. ESLint 2 ไฟล์/diff ผ่าน; ตรวจ read-after-write, trim/collapse/case duplicate, blank/invalid/blocked storage และ SSR ไม่มี options ตั้งต้นผ่าน. ยังไม่ตรวจคลิก/คีย์บอร์ดจริงหลัง login. ไม่มี seed/API/DB/บันทึกสินค้า/commit/deploy และข้อมูลยังอยู่เฉพาะเบราว์เซอร์นี้.

## ลำดับ/ไฟล์/ผลลัพธ์

1. ACTIVE/Specs/Plan/Task บันทึกความต้องการและขอบเขตยังไม่DB.
2. product-brand-combobox.tsx ใหม่: creatable Combobox เลือก/ค้นหาเดิม พิมพ์ชื่อแล้วเพิ่มด้วย click/Enter. เก็บ localStorage เบราว์เซอร์นี้ ไม่มีข้อมูลจำลอง. อ่านตอนเปิดช่อง ป้องกันชื่อซ้ำ trim/ช่องว่าง/case. ArrowUp/Down/Enter/Escape/Tab และ aria labels.
3. product-create-preview.tsx ใช้กับยี่ห้อเท่านั้น ช่องอื่นเดิม. คำอธิบายระบุการจำในเบราว์เซอร์นี้.
4. lint/render/diff และตรวจ normalization/ไม่seed; ยังไม่บันทึกสินค้า/API/DB ข้อมูลไม่แชร์ข้ามเครื่อง.

## ⚠️ ต้องทดสอบโดยคุณ

พิมพ์ยี่ห้อใหม่แล้วกดเพิ่มหรือ Enter รีเฟรชกลับมาเปิดช่องควรเลือกชื่อเดิมได้. พิมพ์ชื่อเดิมต่างตัวพิมพ์/ช่องว่างไม่ควรเพิ่มซ้ำ. พิมพ์แล้วออกโดยไม่เลือกเพิ่มไม่ควรจำชื่อ. รายการอยู่เฉพาะเบราว์เซอร์นี้ หาก storage ถูกบล็อกต้องเห็นข้อความแจ้ง.
