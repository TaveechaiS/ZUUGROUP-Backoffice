# แผนย่อย TASK-054 — เชื่อม `.env.local`

| ลำดับ | ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | ตรวจรับ |
|---|---|---|---|
| 1 | บันทึกข้อกำหนดและขอบเขตโดยไม่บันทึกค่า credential | Project Specs/Plan, Specs/Plan/Task TASK-054, `tasks/ACTIVE.md` | ไม่มี key/password ในไฟล์ที่ติดตามโดย Git |
| 2 | ตรวจชื่อและความตรงของค่าเดิมแบบไม่แสดงค่า; ปรับเฉพาะที่จำเป็น | `.env.local` | URL/publishable/secret/JWKS ตรงกับค่าที่เจ้าของให้; pooler metadata เดิมตรงและรหัสผ่านคงอยู่ |
| 3 | ตรวจการใช้งานและสถานะ Git | `tasks/TASK-054-local-env-connection.md` | ตัวแปรที่โค้ดต้องใช้มีค่า; `.env.local` ถูก ignore; ไม่ส่งคำขอเครือข่าย |
