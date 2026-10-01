# TASK-058: คู่มือชื่อ API ใน Postman

เจ้าของขอคู่มือชื่อโฟลเดอร์ใน Collection `Zuugroup` ตามภาพ เป็นชื่อไทยและอังกฤษ พร้อมคำอธิบายว่าแต่ละส่วนทำอะไร.

- อ้างอิง `postman/Zuugroup.postman_collection.json`, `postman/README.md`, route ใน `src/app/api/` และ metadata โมดูลใน `src/features/records/modules.json`.
- ครอบคลุมทุกโฟลเดอร์ที่มีจริง 23 กลุ่ม พร้อมตัวอย่าง URL และความหมายของชื่อคำขอทั่วไป.
- แยกความต่างระหว่างชื่อโฟลเดอร์ Postman, ชื่อตาราง DB และ path ของ API โดยเฉพาะ `product_categories`, `dosage_forms`, `drugs`.
- อธิบายขอบเขตที่ยังไม่คำนวณหรือปรับยอดอัตโนมัติ เช่น `stock-counts`, รายงานการเงิน/คลัง และ `settings`; ไม่เดากฎธุรกิจที่ OPEN.
- เป็นงานเอกสาร ไม่เปลี่ยน Collection, endpoint, สิทธิ์หรือฐานข้อมูล และไม่ส่งคำขอจริง.

ตรวจรับ: คู่มืออ่านตามภาพได้ครบ 23 ชื่อ; URL ตัวอย่างตรง Collection; ไม่มีการกล่าวอ้างพฤติกรรมที่ยังไม่มีในระบบ.
