# TASK-120 — หน้าเพิ่มสินค้าแบบข้อความ

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569.

## ผลตรวจ

แสดงข้อความ 30 รายการใน 6 หมวด เฉพาะ /products/create ของ Admin. ยังไม่มีคำตอบแยก text-only กับ input จึงใช้ข้อความอย่างเดียว. ESLint 2 ไฟล์ผ่าน; renderToStaticMarkup ตรวจ 30 dt/6 section และไม่มี input/form/button ผ่าน; route checks 74 ผ่าน; diff whitespace ผ่าน. ฟอร์มธุรกิจเดิมเก็บไว้ ไม่ mount. ไม่เปลี่ยน API/DB/สิทธิ์ ไม่ commit/deploy; ยังไม่ตรวจภาพหลัง login.

## แผนย่อย

1. ACTIVE/Specs/Plan/Task บันทึกขอบเขตและถามความหมาย text-only หรือ text input. ถ้าไม่ตอบภายในช่วงทำแผน ใช้เฉพาะข้อความตามคำสั่ง.
2. src/components/products/product-create-preview.tsx จัด 30 ชื่อข้อมูลจากการสนทนาเป็นหมวด อ่านได้คอม/มือถือ ไม่มีเครื่องหมายบังคับเพราะเป็นข้อเสนอ.
3. src/components/layout/admin-shell.tsx แสดง preview เฉพาะ /products/create; หน้าอื่นคง NavigationOnlyTabs. ไม่ mount ฟอร์มบันทึกเดิม ไม่มีปุ่มบันทึก/upload/Combobox.
4. Scoped ESLint, routes และ diff whitespace. ไม่เปลี่ยน API/DB/สิทธิ์/รหัสสินค้า/การแปลงหน่วย.

## ⚠️ ต้องทดสอบโดยคุณ

Admin เปิดสินค้าและสต็อก → เพิ่มสินค้า ควรเห็นหัวข้อและชื่อข้อมูลที่คุยไว้ อ่านได้คอม/มือถือ. ไม่มีการบันทึกหรือเพิ่มข้อมูล DB. หน้าอื่นยังมีเฉพาะเมนู/Tab. ข้อมูลล็อตและต้นทุนรับเข้าจะอยู่ฝั่งเพิ่มสต็อกในงานถัดไป.
