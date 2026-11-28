
# TASK-234 — ลำดับมาตรฐานทุกงาน — 6 ตุลาคม 2569

OWNER_WORKFLOW_CONFIRMED / DOCUMENTED. ทุกโมดูลเรียง หาตัวอย่าง/ปรับ → หน้าเพิ่ม/สร้างเพื่อทบทวนfields → หน้าแสดง → DB → API/Postman → เชื่อม → ทดสอบยิงข้อมูล → เช็คโค้ด. ขั้นUIใช้textก่อนจนเจ้าของตกลงให้เชื่อม. ก่อนแต่ละขั้นลงTaskเฉพาะ/แจ้งscope และปิดbusinessOPENที่มีผลก่อนimplementationตามAGENTS. ช่วงเชื่อมและทดสอบตรวจDB/API/UIตรงกัน แล้วทำtype/lint/buildหรือchecksที่เหมาะกับงาน พร้อมวิธีUAT. บันทึกข้อนี้เป็นแนวทางถาวร ไม่แก้code/DB/APIในTASK234.