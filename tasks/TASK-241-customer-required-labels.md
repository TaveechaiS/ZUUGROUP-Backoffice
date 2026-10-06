# TASK-241 — ดาวแดงข้างชื่อช่อง — 6 ตุลาคม 2569

เจ้าของแก้ความต้องการ: ใส่ * สีแดงกับชื่อช่องบังคับ ไม่แสดงข้อความ “* ข้อมูลที่ต้องกรอก” แยกด้านบน.

IMPLEMENTED / WAITING_FOR_UAT: ถอนlegendแล้ว คงดาวแดงข้างlabelและaria-required. ScopedESLint/diffผ่าน.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/taskนี้ → customers/create/page.tsx ถอนlegend คงField requiredดาวแดง → scopedESLint/diff. ไม่เพิ่มข้อบังคับช่องใหม่/API/DB.

⚠️ ต้องทดสอบโดยคุณ: เปิด /customers/create ต้องไม่มีข้อความ “* ข้อมูลที่ต้องกรอก” ด้านบน ดาวแดงอยู่ข้างชื่อสถานประกอบการและสถานะลูกค้า.
