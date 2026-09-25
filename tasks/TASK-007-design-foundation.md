# TASK-007 — Phase 2: Design foundation

| รายการ | รายละเอียด |
|---|---|
| Phase | 2 — UI และ Design foundation |
| ผู้รับผิดชอบ | AI |
| สถานะ | DONE |
| เอกสารอ้างอิง | Project Specs 0.2, Project Plan 0.1, `.impeccable.md`, Figma `Zuugroup` |
| Branch / Commit ตั้งต้น | `ai` / `20a4ba0` |

## ขอบเขต

- ทำ App shell สำหรับผู้ดูแลระบบบน Desktop ตามหน้า `Dektop` และใช้ส่วนประกอบจากหน้า `Components` ใน Figma
- ใช้ชุดสีน้ำเงิน 50–950 ตามที่เจ้าของโครงการส่งให้ โดย `#1A58A7` เป็นสีหลัก
- แสดง Dashboard เป็นหน้า placeholder ว่าง ไม่มี KPI หรือข้อมูลรวม จนกว่าจะทำโมดูลข้อมูลย่อยครบตามลำดับที่ตกลง
- ปรับหน้าให้รองรับ Mobile โดยยึดหน้า `Moble` ใน Figma เท่าที่มีข้อมูล
- ใช้ภาษาไทย และไม่สร้าง schema, API, auth, RBAC หรือ CRUD behavior ใน Task นี้

## นอกขอบเขต

- Dashboard จริง, KPI, กราฟ, รายงาน หรือข้อมูลจำลอง
- CRUD จริง, schema/migration, API, Auth/RBAC และการเปลี่ยนแปลง Cloud
- เพิ่ม Role `Inventory` หรืออนุมานกฎในรายการ OPEN
- แก้ไขไฟล์ Figma

## Gate และ OPEN

- G-03 ผ่านสำหรับ Design foundation: ผู้ใช้ยืนยันไฟล์ `Zuugroup` และให้ใช้หน้า `Dektop`/`Components`; ผู้ใช้กำหนด primary color scale แล้ว
- OPEN-08 ยังเปิดเฉพาะรายละเอียดที่ยังไม่มีใน Figma/ข้อมูลที่ผู้ใช้ให้ เช่นข้อกำหนดเพิ่มเติมของ font, icon หรือ responsive ที่มีผลเกินขอบเขตนี้
- G-04 และ Gate ของโมดูลธุรกิจยังไม่ผ่าน; จึงไม่มี behavior ด้านสิทธิ์หรือข้อมูล

## เกณฑ์พร้อมส่ง

- App shell และ Dashboard placeholder สอดคล้องกับ Figma และชุดสีที่ผู้ใช้ให้
- ไม่มี KPI, mock data, CRUD, schema หรือ role logic
- `npm run lint`, `npm run type-check`, `npm run build` ผ่าน

## ⚠️ ต้องทดสอบโดยคุณ

- เปิด `http://localhost:5000` แล้วควรเห็นเมนู Admin ภาษาไทย โทนหลัก `#1A58A7` และ Dashboard placeholder ที่ไม่มี KPI/ข้อมูลสรุป
- ย่อหน้าจอให้แคบแล้วตรวจว่า navigation และพื้นที่หลักยังอ่าน/ใช้งานได้ โดยไม่มีการตัดข้อมูลสำคัญ

**ผล UAT:** เจ้าของโครงการตรวจแล้วและยืนยันผ่านเมื่อ 2026-09-25.
