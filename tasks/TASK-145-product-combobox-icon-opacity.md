# TASK-145 — ลดความเข้มไอคอน Combobox

## แผนย่อยรอบปรับเพิ่ม

ผลรอบล่าสุด: เปลี่ยนลูกศรทั้งสอง component เป็น opacity-30 แล้ว ESLint สองไฟล์และ git diff --check ผ่าน. ยังไม่ตรวจภาพจริง.

เจ้าของขออ่อนลงอีกหลัง 50%: อ่าน ACTIVE/บันทึก Specs/Plan → เปลี่ยน opacity-50 เป็น opacity-30 ใน product-create-preview.tsx และ product-name-combobox.tsx → ESLint สองไฟล์/diff → บันทึกผล. ไฟล์เอกสารเดิมทั้งหมดอยู่ในขอบเขต. ผลลัพธ์/ตรวจรับ: ลูกศรแสดงความเข้ม 30% โดยช่องและข้อความคงเดิม.

สถานะ: IMPLEMENTED / WAITING_FOR_UAT; อนุมัติจากคำขอเจ้าของ 5 ตุลาคม 2569

ผลตรวจ: ESLint สอง component และ git diff --check ผ่าน. เพิ่ม opacity-50 เฉพาะ wrapper ลูกศร คง SVG และคลาสตำแหน่งเดิม. ยังไม่ตรวจภาพจริงในเบราว์เซอร์.

## แผนย่อย

1. อ่าน ACTIVE บันทึกข้อปรับใน Specs/Plan/Task.
2. แก้ src/components/products/product-create-preview.tsx และ product-name-combobox.tsx เพิ่ม opacity-50 เฉพาะ wrapper ลูกศร. คง SVG/สี stroke/ตำแหน่งและพฤติกรรมเดิม.
3. ตรวจ ESLint สองไฟล์และ git diff --check.
4. บันทึกผล ACTIVE/Task ส่งตรวจรับภาพ.

ไฟล์ที่เปลี่ยน: สอง component ข้างต้น, ACTIVE, Specs/Plan หลักและ Task นี้. ผลลัพธ์: ลูกศรอ่อนลง 50% โดยข้อความช่องคงเดิม.

## ⚠️ ต้องทดสอบโดยคุณ

เปิดหมวดหน้าเพิ่มสินค้าบนคอม/มือถือ: ลูกศร Combobox ควรอ่อนลงและกลืนกับช่องมากขึ้น ยังอยู่กลางขวา ข้อความและการเปิดรายการเหมือนเดิม.
