# TASK-122 — Combobox ว่างสำหรับเพิ่มสินค้า

สถานะ IMPLEMENTED / WAITING_FOR_UAT; 5 ตุลาคม 2569.

## ผลตรวจ

13 Combobox ว่างและช่องอื่น 18 รวม 31 ช่อง. ESLint ผ่าน; render ตรวจ 13 role combobox/31 labels/10 textarea ไม่มี role option, ID ไม่ซ้ำและ label/help/controls เชื่อมถูกต้อง; route checks 74 ผ่าน; diff whitespace ผ่าน. ไม่มี options/ข้อมูลจำลอง/API/DB/submit. ยังไม่ตรวจการคลิกและคีย์บอร์ดใน browser หลัง login. ไม่ commit/deploy.

## แผนย่อย

1. ACTIVE/Specs/Plan/Task บันทึกการใช้ Combobox จริงที่ยังไม่มีรายการ.
2. product-create-preview.tsx แยกชื่อการค้า text กับยี่ห้อ Combobox. เปลี่ยน 13 ช่องข้อมูลกลางเป็น Combobox ว่าง มีช่องค้นหา ลูกศร และ empty state; ช่องอื่น 18 ช่องเป็น text/textarea.
3. เปิดด้วย focus/click/ArrowDown/Enter ปิด Escape/blur/Tab. ไม่ยอมรับคำค้นเป็นค่าที่เลือก ไม่มี options รวมตัวเลือกจำลอง/ยังไม่ระบุ. ไม่แตะ component ของฟอร์มธุรกิจเดิม.
4. ตรวจ lint/render/routes/diff; ไม่มี API/DB/submit/upload/required หรือข้อมูลจำลอง.

## ⚠️ ต้องทดสอบโดยคุณ

เปิดเพิ่มสินค้าด้วย Admin ช่องข้อมูลกลางมีลูกศร เปิดและค้นหาได้แต่แสดงยังไม่มีรายการ. Escape หรือคลิกนอกช่องปิดได้ คำค้นไม่เป็นค่าที่เลือก. ช่องชื่อการค้า/ชื่อสินค้า/รหัส/ตัวเลขและรายละเอียดพิมพ์ได้ตามเดิม ไม่มีการบันทึก.
