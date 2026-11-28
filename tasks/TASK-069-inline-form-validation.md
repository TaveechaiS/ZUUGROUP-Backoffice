# TASK-069 — ข้อความตรวจข้อมูลสีแดงในฟอร์ม

สถานะ: READY_FOR_USER_TEST — เจ้าของขอ 2026-10-02

## Specs

แทน browser validation tooltip ในฟอร์มรายการตามภาพ ด้วยข้อความไทยสีแดงใต้ช่อง เช่น “กรุณากรอกรหัส / เลขอ้างอิง” เครื่องหมาย * สีแดงหมายถึงจำเป็นต้องกรอก แสดงจาก field.required จริง รวม combobox ข้อมูลสัมพันธ์ ไม่ส่งคำขอหรือเปิดยืนยันแก้ไขจนผ่าน validation ฝั่งหน้าเว็บ คง validation API เดิม

## แผนย่อย

1. บันทึกข้อกำหนด ตรวจ shared RecordFormPage ที่ใช้งานเพิ่ม/แก้ไขรายโมดูล
2. เพิ่ม noValidate และ validation state รายช่อง ตรวจ required/ชนิด/ข้อจำกัดเดิม แสดงข้อความใต้ช่องพร้อม aria-invalid/aria-describedby และโฟกัสช่องผิดแรก
3. เปลี่ยน * เป็นสีแดง แก้ไขแล้วล้างข้อความของช่องนั้น และตรวจ type-check/lint/diff

ไฟล์: src/components/pages/record-form-page.tsx, Specs/Plan/ACTIVE และ Task นี้

ขอบเขตรอบนี้: shared record form ตามภาพ ไม่เปลี่ยนกฎธุรกิจ DB หรือฟอร์ม Auth/สินค้า/ผู้ใช้ที่ใช้ component คนละชุด

ผล: shared form เพิ่ม/แก้ไขใช้ noValidate แล้ว ตรวจค่าจำเป็นรวม relation ID และ validity ของ input/textarea แสดงข้อความไทยสีแดงใต้ช่องและขอบแดง โฟกัสช่องผิดแรก ล้าง error รายช่องเมื่อแก้ไข เครื่องหมาย * เฉพาะ required เป็นสีแดง type-check/eslint/diff-check ผ่าน ไม่ทดสอบหน้าเว็บหรือยิง API จริงอัตโนมัติ

## ⚠️ ต้องทดสอบโดยคุณ

กดบันทึกฟอร์มว่าง ต้องเห็นข้อความไทยสีแดงใต้ช่องที่ต้องกรอกและ * สีแดง ไม่มี browser tooltip/คำขอ API เติมข้อมูลแล้วบันทึกตามเดิม รวมช่องสัมพันธ์ required และหน้าแก้ไข
