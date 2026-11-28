# คู่มือตรวจโครงการ

หลังติดตั้ง dependencies ด้วย `npm ci` และเตรียม environment ตาม README ให้รันจากโครงการ:

```sh
npm run verify
```

คำสั่งตรวจตามลำดับ: ESLint → Next typegen → TypeScript → API contracts → pagination → route pages → resource API → API field names → record flows → production build รวม 10 ขั้นตอน

แต่ละขั้นแสดงชื่อและเวลาที่ใช้ หากไม่ผ่านจะหยุดทันที พร้อมชื่อขั้นและ exit code ไม่เป็นศูนย์ เมื่อผ่านทั้งหมดจะแสดง `ผ่าน 10/10 ขั้นตอน` กด Ctrl+C เพื่อหยุดชุดตรวจ

ชุดตรวจ API ทั้ง 6 ชุดใช้ข้อมูลจำลองหรืออ่านไฟล์ ไม่เรียก API จริงและไม่เชื่อมฐานข้อมูล คำสั่งนี้ไม่รัน migration, seed หรือแก้ข้อมูลธุรกิจ ทั้ง Next typegen และ build สร้างไฟล์ในเครื่อง; build อาจต้องใช้อินเทอร์เน็ตเพื่อโหลดฟอนต์เมื่อยังไม่มี cache จึงไม่รับประกันว่า verify ทั้งชุดจะทำงาน offline

รัน `npm run test:flows` เพื่อตรวจเฉพาะ 14 กรณีของ flow: ค้นหา/แบ่งหน้า/เพิ่ม/อ่าน/แก้/ลบ/กู้คืน/สิทธิ์/ข้อมูลซ้ำและแก้พร้อมกัน/audit rollback. เรียก handler/service/validators จริงของ shared record engine ผ่านโมดูลกลุ่มลูกค้า โดยใช้ DB/Auth adapter ในหน่วยความจำ. ไม่ได้ตรวจ browser interaction หรือการทำงานของ PostgreSQL จริง; หน้าจอ/Loading/SuccessAlert และ database locking ยังต้องทดสอบแยก.

อย่ารันพร้อม dev/build/verify อีกชุดที่เขียน `.next` เดียวกัน หากขั้นใดล้มเหลวให้แก้สาเหตุจากผลขั้นนั้นแล้วรันใหม่ ไม่ควรลด assertion เพื่อให้ผ่าน

## ข้อมูลตัวอย่าง

ข้อมูลอ้างอิงปัจจุบัน: สินค้า `scripts/seed-product-stock-demo.mjs` (ตรวจด้วย `scripts/verify-product-stock-demo.mjs`), ลูกค้า `scripts/seed-customer-demo.mjs` และธุรกรรม DEMO `scripts/seed-demo-business.mjs` (TASK-304). สคริปต์ seed TASK-052/076 และ `npm run verify:seed` เลิกใช้แล้ว (TASK-309)

## ⚠️ ต้องทดสอบโดยคุณ

รัน `npm run test:flows` ควรผ่าน 14/14 และ `npm run verify` ควรแสดงผ่าน 10/10 หากพบข้อผิดพลาดควรหยุดที่ขั้นนั้นและไม่เริ่มขั้นถัดไป การผ่านชุดนี้ยังต้องตรวจการใช้งานจริงและหน้าจอตามรายการตรวจรับของแต่ละ Task
