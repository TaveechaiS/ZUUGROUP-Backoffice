# TASK-121 — ช่องกรอกแบบกล่องหน้าเพิ่มสินค้า

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569.

## ผลตรวจ

input text 20 ช่องและ textarea 10 ช่องครบ 30 รายการใน 6 หมวด. Label/help มี ID เชื่อมกันและไม่ซ้ำ; render ไม่มี form/button. ESLint ผ่าน, route checks 74 ผ่าน, diff whitespace ผ่าน. ยังไม่ตรวจการพิมพ์ผ่าน browser หลัง login. ไม่มี API/DB/Combobox/upload/การเก็บ draft ถาวร/required ใหม่ และไม่ commit/deploy.

## ลำดับ/ไฟล์/ผลลัพธ์

1. ACTIVE/Specs/Plan/Task บันทึกคำยืนยัน input box แทน text-only.
2. src/components/products/product-create-preview.tsx ช่องข้อความ 30 รายการ; textarea สำหรับรายละเอียด/ข้อบ่งใช้/คำเตือน/เงื่อนไข/บรรจุ/เอกสาร. Label ผูกช่องและคำอธิบายด้วย ID, focus สีเดิม. 6 หมวด คอม 2 คอลัมน์มือถือ 1 คอลัมน์.
3. ตรวจ ESLint/render/routes/diff. ไม่เพิ่ม API/DB/required/Combobox/upload/การเก็บ draft ถาวร. คงหน้าอื่นและสิทธิ์เดิม.

## ⚠️ ต้องทดสอบโดยคุณ

Admin เปิดสินค้าและสต็อก → เพิ่มสินค้า พิมพ์ในกล่องได้ครบ 30 ช่อง Tab เลื่อนไปช่องถัดไปได้ ช่องคำอธิบายพิมพ์หลายบรรทัดได้. มือถือแสดงหนึ่งคอลัมน์. ยังไม่มีการบันทึก จึงเมื่อรีเฟรชข้อความที่พิมพ์ไม่ถูกเก็บถาวรและ DB ไม่เปลี่ยน.
