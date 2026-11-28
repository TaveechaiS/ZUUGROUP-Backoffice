# หน้าแต่ละ Route มีโค้ดของตัวเอง — TASK-071

สถานะ: อนุมัติ 2026-10-02 เจ้าของให้เริ่ม TASK-071 รวมย้าย endpoint/API functions ในหน้า ใช้ URL/server route เดิม

## ข้อกำหนดเจ้าของ 2026-10-02

เพิ่มเติมที่อนุมัติ: ใช้ชื่อโฟลเดอร์ `[id]` แทน `[ref]` ในหน้ารายละเอียด customers/products โดยเปลี่ยนชื่อ params ตามกัน คงค่า URL และการค้นหาด้วยรหัสสินค้าเดิม ชื่อพารามิเตอร์ไม่ได้เปลี่ยนเป็น UUID

**ติดตาม 2026-10-02:** เจ้าของรายงานหน้า `[id]` ได้ 404. หน้า URL เดิมที่เปิดจากแถวรายการต้องเข้าถึงหน้ารายละเอียดที่มีข้อมูลได้หลังสร้าง route ใหม่; ตรวจแยก 404 จาก Next route, การค้นข้อมูล และสิทธิ์. ถ้า dev cache ยังมี `[ref]` ให้สร้างจาก source ปัจจุบันใหม่โดยไม่เปลี่ยน URL/API/DB.

ต้องการให้แต่ละหน้าแก้ได้อิสระ ตัวอย่าง src/app/orders/page.tsx ต้องมีโค้ดหน้ารายการเอง ไม่เป็นเพียง return ModuleListPage href=/orders รวม create และ dynamic detail ไม่ import/re-export ทั้งหน้าจาก components/pages และนำ components/pages ออกหลังย้ายครบ

## รูปแบบเป้าหมาย

## ข้อชี้แจงจากตัวอย่างเจ้าของ

เจ้าของเลือกใช้ชิ้นส่วนเล็กร่วมกันได้ โดยเฉพาะ Pagination/Combobox และแนบตัวอย่าง client page ที่มี useState/useEffect, endpoint BASE, query builder, ฟังก์ชันเรียก Get และ JSX อยู่ในไฟล์หน้าเดียว ใช้ตัวอย่างเป็นรูปแบบจัดโค้ดเท่านั้น ไม่ย้ายข้อมูล/กฎ/ม็อก/ไลบรารีเฉพาะของตัวอย่างเข้าระบบนี้

- ข้อความเฉพาะหน้า ชื่อหัวข้อ/คอลัมน์/ปุ่ม/ฟอร์มและข้อความตอบกลับให้อยู่ใน page.tsx นั้น ไม่ส่ง href/moduleKey ไปให้ shared component สร้างทั้งหน้า และไม่ซ่อนข้อความทั้งหมดไว้ใน registry ส่วนกลาง
- endpoint และฟังก์ชันโหลด/บันทึก/ประกอบquery/จัดการ pagination state ของหน้าอยู่ใน page.tsx เช่น BASE=/api/orders, loadOrders, saveOrder ใช้ Get/Post/Update/Delete จาก service/http ส่วนกลางได้ HTTP transport ไม่ใช่ business flow
- Pagination/Combobox/StatusBadge/dialog/loading เป็นชิ้นส่วนเล็กได้ รับข้อมูล/ข้อความ/callback จากหน้า ไม่เลือก endpoint หรือสร้าง layout ทั้งหน้าตามโมดูลเอง
- ฟอร์มต้องมี JSX แต่ละ field ใน route เพื่อแก้ label/ตำแหน่งได้สะดวก ไม่ย้าย generic fields.map ทั้งก้อนมาวางโดยยังให้ registry กลางกำหนด UI ทั้งหมด
- API types ใช้ไฟล์ type ส่วนกลางได้ แต่ไม่ย้าย route.ts หรือ server DB ไปเป็น types/API client โค้ด API ฝั่ง server คงสิทธิ์/validation จริง

- โครงหน้า JSX การจัดวางคอลัมน์/field/ปุ่ม และการโหลด/บันทึกอยู่ใน page.tsx ของ route นั้น แก้ orders ไม่กระทบ purchases
- คงชิ้นส่วนเล็กส่วนกลาง เช่น StatusBadge, Combobox, Pagination, dialog, loading และ HTTP transport ตามคำตอบเจ้าของ แยก data flow/state/query ของแต่ละหน้าออกจาก generic page hook
- เก็บ auth/data ที่จำเป็นฝั่ง server ใน layout หรือ data provider เฉพาะ route โดยไม่มีโครง UI ทั้งหน้าจากส่วนกลาง ไม่ย้าย secret/Prisma เข้าฝั่ง client
- ฟอร์มและรายละเอียดโมดูลทั่วไปย้ายทั้ง JSX และพฤติกรรมเข้า route ตนเอง รวมฟอร์มแก้ไขที่อยู่ใน detail ไม่ import ฟอร์มทั้งหน้าจากโมดูลอื่น
- users/products/audit/dashboard ที่มี content component ทั้งหน้าในไฟล์อื่น ย้ายโครงหน้าเข้า page.tsx เช่นกัน คงสิทธิ์เดิม ข้อมูลเริ่มต้นผ่าน API หรือ route server data ตามความจำเป็น
- ไม่เปลี่ยนชื่อ URL /orders เป็น /order ไม่เปลี่ยน API/DB/schema/กฎธุรกิจ ไม่สร้างฟอร์ม report หรือ alias route ที่เดิม redirect โดยยังไม่ได้ข้อกำหนด
- ทุกรายการคง API pagination10, filters, CSV, status style, success/confirmation, validation ไทย และการกู้คืนเดิม
- ไม่ใช้ script generate หน้าร่วมใน runtime หรือการ sync ที่จะเขียนทับการปรับรายหน้าในอนาคต การย้ายครั้งเดียวอาจใช้สคริปต์แต่ผลลัพธ์เป็นไฟล์ route ที่แก้เองได้

## การตรวจรับ

ไม่มี import components/pages และไม่มี full-page re-export ตรวจ diff หน้า orders ยืนยัน JSX อยู่ใน route จริงและการแก้ไขไม่ propagate ไปโมดูลอื่น ไม่เหลือ directory components/pages type-check/lint/build ผ่าน ผลจริงทุก flow ให้เจ้าของทดสอบ ไม่ยิง live HTTP/login อัตโนมัติ
