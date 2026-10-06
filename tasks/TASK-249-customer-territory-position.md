# TASK-249 — ตำแหน่งเขตขายลูกค้า — 6 ตุลาคม 2569

เจ้าของให้ลบกล่องเขตขายและฝ่ายขาย ย้ายช่องเขตขายไปข้อมูลทั่วไปถัดจากชื่อสถานประกอบการ/บริษัท. ถอนช่องฝ่ายขายจากcreateในรอบนี้; ไม่ลบข้อมูลเดิมหรือเปลี่ยนความสัมพันธ์backend.

IMPLEMENTED / WAITING_FOR_UAT: ย้ายfieldและถอนsectionแล้ว scopedESLint/diffผ่าน.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customers/create/page.tsx ย้ายfieldและถอนsection → scopedlint/diff → UAT. คงเขตเป็นdisabledcomboboxpreview ไม่มีAPI/DB/requiredใหม่.

⚠️ ต้องทดสอบโดยคุณ: หน้าcreateข้อมูลทั่วไปเรียงชื่อสถานประกอบการ → เขตขาย → หมายเหตุ; ไม่มีกล่องเขตขายและฝ่ายขาย/ช่องSales. กล่องอื่นยังพับเริ่มต้น.
