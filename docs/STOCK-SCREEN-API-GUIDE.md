# API หน้าสินค้าและคลัง — Stock screens (TASK-094)

ใช้ API เดิม `/api/inventory` ผ่าน GET สำหรับอ่านข้อมูล โดยต้องเข้าสู่ระบบ. คำสั่งรับเข้า/โอน/ปรับ/แจกใช้ POST เดิม. ไม่มีการเปลี่ยน schema หรือยอดจากการเปิดหน้า.

| view | ชื่อไทย / English | หน้าที่ |
| --- | --- | --- |
| products | สรุปสินค้าและยอดคลัง / Product stock summary | หนึ่งแถวต่อสินค้า; รวมทุกคลัง หรือเลือก warehouseCode=MAIN/MARKETING/DISPOSAL |
| lots | รายการล็อต / Product lots | หนึ่งแถวต่อ Lot ID; balances เก็บยอดแต่ละคลังสำหรับรายละเอียดและคำสั่งจัดการ |
| stock | ยอดล็อตแยกคลัง / Lot warehouse balances | รูปแบบเดิมหนึ่งแถวต่อคู่ล็อต/คลัง ยังรองรับผู้เรียกเดิม |
| receipts | ประวัติรับเข้า / Receipts | ใบรับเข้า ล็อต และประวัติแก้ข้อมูล |
| movements | ความเคลื่อนไหว / Stock movements | อ้างอิงที่มาของยอดและผู้ทำ |

ทุกหน้ารองรับ search, offset, limit (เริ่มต้น10 สูงสุด50); ตัวกรองทำก่อนแบ่งหน้า. products เพิ่ม categoryId, status=ACTIVE/INACTIVE, deleted=true/false (ลบแล้วเฉพาะAdmin), stock=low/empty, expiry=near/expired. lots เพิ่ม productId, warehouseId, categoryId, expiry และ expiryBefore=YYYY-MM-DD.

products ส่ง quantity=คงเหลือในขอบเขตคลัง, reserved=จอง, available=คงเหลือลบจอง, mainAvailable=จำนวนขายได้ในMAINหลังหักจอง โดยผ่านกฎสภาพ/อายุขายเดิม. คำเตือน<50อิงmainAvailableเท่านั้น; stock=low คือ<50 และ empty คือ0. สินค้าไม่มีล็อตแสดง0ในทั้งหมด; หน้าคลังแสดงเฉพาะสินค้ามียอด>0ในคลังนั้น.

lots ส่งยอดรวมทุกคลังและรายละเอียด balances แม้ใช้warehouseIdกรองล็อต; ไม่รวมต้นทุนซ้ำเมื่ออยู่หลายคลัง. ต้นทุนทั้งแถวรวมและbalancesเห็นเฉพาะAdmin/CFO. near=หลังวันปัจจุบันถึงwarningDaysจากpolicy (เริ่มต้น90วัน); expired=วันปัจจุบันหรือก่อนหน้า ใช้วันAsia/Bangkok. การเตือนไม่เปลี่ยนสิทธิ์ขายหรือย้ายสินค้าอัตโนมัติ.
