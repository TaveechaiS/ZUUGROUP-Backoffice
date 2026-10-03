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

## ตรวจแผน seed เพิ่มเติม

```sh
npm run verify:seed
```

เป็นชุดตรวจแยก ไม่รวม 10 ขั้นตอนข้างต้น ต้องมี `scripts/snapshots/TASK-076-before.json` จาก TASK-076 ในเครื่อง หากไม่พบจะขึ้นข้อความและจบด้วย exit code 1 โดยไม่ข้ามการตรวจ ชุดนี้จำลองแผนและตรวจ SQL ในหน่วยความจำ ไม่เขียนฐานข้อมูล ห้ามนำ snapshot ที่มีข้อมูลเฉพาะเครื่องเข้า Git

## ⚠️ ต้องทดสอบโดยคุณ

รัน `npm run test:flows` ควรผ่าน 14/14 และ `npm run verify` ควรแสดงผ่าน 10/10 หากพบข้อผิดพลาดควรหยุดที่ขั้นนั้นและไม่เริ่มขั้นถัดไป การผ่านชุดนี้ยังต้องตรวจการใช้งานจริงและหน้าจอตามรายการตรวจรับของแต่ละ Task
