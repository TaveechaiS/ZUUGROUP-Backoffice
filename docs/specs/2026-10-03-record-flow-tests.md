# TASK-089 ชุดทดสอบ flow ข้อมูลจำลอง

เจ้าของอนุมัติ checkpoint ก่อนแล้วต่อชุดทดสอบอัตโนมัติเมื่อ 2026-10-03. checkpoint 6c7916a เสร็จแล้ว.

ใช้ handler/service/validators และ registry จริงของกลุ่มลูกค้าเป็นตัวแทน shared record engine. จำลองเฉพาะ DB/Auth ในหน่วยความจำ; ไม่อ่าน env ไม่เปิด network/ฐานข้อมูล ไม่เพิ่ม dependencies. ตรวจค้นหาไทย/อักขระ wildcard แบบ literal, pagination/total, เพิ่ม/อ่าน/แก้/ลบ/กู้คืน, validation, สิทธิ์เดิม, stale update, duplicate code, audit และ rollback เมื่อ audit ล้มเหลว. Adapter ต้อง reject SQL ที่ไม่รู้จัก ไม่คืนผลสำเร็จครอบจักรวาล.

เพิ่ม npm run test:flows และขั้นที่ 9 ก่อน build ใน verify (รวม 10 ขั้นตอน). ทดสอบ regression ฝั่ง server ไม่ใช่การรับรอง Postgres execution plan/locking หรือ browser interaction/Loading/SuccessAlert. รักษา tests เดิมและ production code/กฎธุรกิจเดิม.
