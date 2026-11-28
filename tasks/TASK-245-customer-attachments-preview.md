# TASK-245 — ปรับข้อมูลและเอกสารลูกค้า — 6 ตุลาคม 2569

เจ้าของให้ถอนสถานะลูกค้า เหตุผลระงับ ระดับราคา และติดดาวแดงทุกช่องข้อมูลติดต่อ (หลักและฝ่ายบัญชีรวม6ช่อง). เอกสารเป็นการอัปโหลดรูปแบบสินค้า.

IMPLEMENTED / WAITING_FOR_UAT: ถอนช่องและข้อความประวัติราคาแล้ว เปลี่ยนชื่อหมวดเขตขายและฝ่ายขาย. ติดต่อ6ช่องrequiredดาวแดง/aria-required. Attachmentclient5หมวดภาพ/PDFหลายไฟล์preview/เพิ่ม/ลบ/objectURLcleanup/error10MB. ScopedESLint/TypeScript/route77/diffผ่าน ยังไม่มีbrowserทดสอบเลือกไฟล์จริง; ไม่storage/API/DB/save.

ลำดับ: ACTIVE/Specs/Plan → createถอนfieldsและประวัติราคา/หมวดเขตขายและฝ่ายขาย/requiredทั้ง6 → isolatedclient attachment5หมวดเลือกหลายภาพ/PDFแสดงภาพชื่อขนาดลบและคืนobjectURL → lint/type/route → UAT.

ไฟล์: customers/create/page.tsx, customer-attachments-preview.tsx และเอกสารข้างต้น. ไฟล์อยู่ในbrowserเท่านั้น ไม่ส่งstorage/API/DB; บันทึกdisabled. รองรับJPEG/PNG/WebP/GIF/PDFไม่เกิน10MBเช่นสินค้า, ปฏิเสธไฟล์ว่าง/ไม่รองรับพร้อมerror. ไม่เปลี่ยนbusinessstatus/priceในDB.

⚠️ ต้องทดสอบโดยคุณ: หน้าcreateไม่มี3ช่องที่ถอน หมวดติดต่อทุกlabelมีดาวแดง. เปิดเอกสารแนบเลือกภาพหลายรูป/เพิ่ม/ลบและPDFได้ เห็นthumbnail/ชื่อ/ขนาด; ไฟล์ผิดชนิด/ว่าง/เกิน10MBเห็นerror. รีโหลดไฟล์ไม่คงอยู่และยังบันทึกไม่ได้. ทุกหมวดนอกจากทั่วไปเริ่มพับ.
