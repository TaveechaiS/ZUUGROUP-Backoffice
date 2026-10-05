# TASK-124 — ดาวแดงช่องบังคับสินค้า

สถานะ IMPLEMENTED / WAITING_FOR_UAT; 5 ตุลาคม 2569. ติดดาวแดง 9 ช่องและ aria-required 9 ช่องตรงกันแล้ว. Render ยืนยัน31ช่อง/13Comboboxเดิม ESLint/diff ผ่าน. ไม่เพิ่ม validation/API/DB และไม่ commit/deploy. ยังไม่ตรวจภาพหลัง login.

## แผนย่อย

1. ACTIVE/Specs/Plan/Task บันทึกขอบเขต.
2. product-create-preview.tsx ใช้ชุด requiredFields 9 ช่องตามร่างก่อนหน้า: รหัส/ชื่อเต็ม/ประเภท/หมวด/หน่วยขาย/หน่วยฐาน/ราคาขาย/ภาษี/สถานะ. ติด * สีแดงเฉพาะ label ในชุด และ aria-required ของ input/textarea/Combobox ตรงกัน.
3. ตรวจ ESLint/render/diff. ไม่เพิ่ม validation/submit/API/DB; conditional fields ยังไม่ติดดาวเพราะประเภทไม่ได้เลือกและยังไม่มีข้อมูล Combobox.

## ⚠️ ต้องทดสอบโดยคุณ

เปิดเพิ่มสินค้า ควรเห็นดาวแดงเฉพาะ 9 ช่องข้างต้น ช่องรายละเอียด/รูป/เอกสารไม่มีดาว. Combobox ยังคงไม่มีรายการ และยังไม่มีการบันทึก. ช่องตามประเภทรอสรุปกฎตอนเชื่อมตัวเลือกจริง.
