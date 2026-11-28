# TASK-287 — เอกสารลูกค้า — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ C2). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. Server: src/server/customers/documents.ts รวมไฟล์จาก customers.details.files + customer_files (ไม่สร้างตารางใหม่, ไม่ใช้ตาราง customer_documents เดิม). src/types/api/customer-documents.ts.
2. API: /api/customer-documents GET อย่างเดียว (ลบ /api/customer-documents/[id] เดิม). เปิดไฟล์ผ่าน /api/customers/files/[id] เดิม.
3. หน้า: /customers/documents รายการ (ค้นหา/ประเภทเอกสาร, ลูกค้า, ไฟล์, ขนาด, ใบอนุญาตหมดอายุ, แนบเมื่อ); ลบ /customers/documents/create และ /[id] เดิม. เมนูลูกค้า Side รอง เอกสารลูกค้า.
4. ตรวจ: scripts/test-customer-documents.mjs, route test.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- ตอนนี้ยังไม่มีไฟล์ลูกค้าในระบบ (customer_files 0) หน้าจะแสดง ไม่พบเอกสารลูกค้า จนกว่าจะแนบไฟล์จากหน้าเพิ่ม/แก้ไขลูกค้า.

⚠️ ต้องทดสอบโดยคุณ: แก้ไขลูกค้า 1 รายแนบไฟล์ PDF ใบอนุญาต → ลูกค้า → เอกสารลูกค้า เห็นไฟล์พร้อมประเภท/ขนาด/วันใบอนุญาตหมดอายุ → คลิกชื่อไฟล์เปิดได้ → กรองประเภทเอกสารได้.
