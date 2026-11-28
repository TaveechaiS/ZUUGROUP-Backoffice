# TASK-144 — SVG Combobox กลางขวา

สถานะ: IMPLEMENTED / WAITING_FOR_UAT; อนุมัติจากคำขอเจ้าของ 5 ตุลาคม 2569

ผลตรวจ: ESLint สอง component และ git diff --check ผ่าน. ตรวจ SVG ตามขนาด/path/stroke ที่เจ้าของให้ wrapper จัดกลางแนวตั้งเฉพาะความสูงช่อง h-11 และชิดขวา right-3. คง pointer-events-none/aria-hidden. ยังไม่ตรวจภาพจริงในเบราว์เซอร์.

## แผนย่อย

1. อ่าน ACTIVE บันทึก Specs/Plan/Task ก่อนแก้.
2. แก้ src/components/products/product-create-preview.tsx และ product-name-combobox.tsx แทนลูกศรเดิมด้วย SVG 14×8/path/stroke ตามเจ้าของ วาง wrapper absolute right-3 top-0 h-11 flex items-center. คง aria-hidden/pointer-events-none และ padding ขวาช่องเดิม.
3. ตรวจ ESLint สองไฟล์และ git diff --check ตรวจ SVG/ตำแหน่งจากโค้ด.
4. บันทึกผล ACTIVE/Task ส่งตรวจรับ.

ไฟล์ที่เปลี่ยน: สอง component ข้างต้น, ACTIVE, Specs/Plan หลักและ Task นี้. ผลลัพธ์: ทุก Combobox ของ preview ใช้ลูกศรตามเจ้าของ กลางขวาช่องโดยไม่เลื่อนเมื่อมี error. ไม่แก้ product-ui.ts/API/DB.

## ⚠️ ต้องทดสอบโดยคุณ

เปิดหมวดหน้าเพิ่มสินค้า ตรวจ Combobox กลุ่มรหัส/รูปแบบ/ประเภท/หมวดหมู่/หน่วย/ข้อมูลยา รวมยี่ห้อและบริษัทผู้ผลิต: ไอคอน 14×8 สี #101828 อยู่กลางแนวตั้งด้านขวา ไม่มีสัญลักษณ์เดิม ไม่ทับข้อความ. คลิกช่อง/บริเวณไอคอนและพิมพ์ค้นหาได้เหมือนเดิม ตรวจคอมและมือถือ.
