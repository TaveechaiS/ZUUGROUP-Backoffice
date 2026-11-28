
# TASK-231 — เขตคลิกทั้งแถว — 6 ตุลาคม 2569

APPROVED: ACTIVE/Specs/Plan → territories/page.tsxถอนth/tdจัดการ ใส่router navigationที่tr/tabIndex/EnterSpace/hoverfocus → test-territory-fieldsเปลี่ยนจาก3linksเป็น3rownavigation/12cells → scoped lint/type/offline test. ไม่API/DB. ตรวจรับ4คอลัมน์ กดช่องใดในแถวก็เปิดIDเดียวกัน กดTab+Enter/Spaceได้.
ผล: IMPLEMENTED / WAITING_FOR_UAT. ตาราง4คอลัมน์ไม่มีจัดการ คลิกแถวหรือEnter/SpaceเปิดIDตัวอย่าง. offline navigation tests/scoped lint/typeผ่าน ไม่API/DB/commit/push.

⚠️ ต้องทดสอบโดยคุณ: กดช่องรหัส ชื่อ ผู้จัดการ หรือจำนวนSalesในแถวเดียวกัน ควรเปิดIDเขตเดียวกัน; กดTabไปที่แถวแล้วEnter/Spaceต้องเปิดได้ คอลัมน์จัดการต้องหาย.