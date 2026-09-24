# Handoff — สถานะเริ่มต้นโครงการ

## เอกสารที่ต้องอ่านก่อนเริ่ม

1. [Project Specs](specs/2026-09-23-1550-project-specs.md) รุ่น 0.3 และข้อกำหนดสั้นล่าสุด — สถานะ `APPROVED`
2. [Project Plan](plans/2026-09-23-1635-project-plan.md) รุ่น 0.2 และแผนย่อยล่าสุด — สถานะ `APPROVED`
3. [ทะเบียนประเด็นรอตัดสินใจ](DECISIONS.md)
4. [กติกาสำหรับผู้ทำงาน](../AGENTS.md)
5. `tasks/ACTIVE.md` และ Task ที่ได้รับมอบหมาย

## สถานะปัจจุบัน

- Project Specs รุ่น 0.3 และ Project Plan รุ่น 0.2 ได้รับอนุมัติเมื่อ 2026-09-24
- Repository อยู่บน Branch `AI`; ใช้ได้เฉพาะ `AI`, `Dev`, `Main`
- มีโครง Next.js/TypeScript/Tailwind, Prisma/Docker configuration และหน้า UI พื้นฐาน; ยังไม่มี Schema/Migration/Seed, CRUD, Auth หรือ Dashboard KPI. Supabase Cloud project `zuugroup-web` อยู่ในองค์กร `zuugroup`, Region Singapore (`ap-southeast-1`), Project Ref `wiikzseotpjxssbcdayk`, URL `https://wiikzseotpjxssbcdayk.supabase.co`
- G-02 ผ่านแล้ว: ใช้ npm, Node.js 24.21.0 LTS, Next.js 16.x stable ล่าสุด, Prisma 7.x stable ล่าสุด และ Supabase Cloud; ให้ล็อกรุ่นแพ็กเกจจริงใน `package-lock.json`
- OPEN-09 ปิดแล้ว; password, Secret key และ connection string ที่มีรหัสผ่านต้องเก็บใน Environment เฉพาะเครื่อง ห้ามบันทึกใน Git หรือแชต

## วิธีรับงานต่อ

1. ตรวจ `tasks/ACTIVE.md` และลงทะเบียน Task พร้อมขอบเขตไฟล์ก่อนแก้ไข
2. ตรวจ Gate และ OPEN ใน `DECISIONS.md`; ถ้าคำตอบยังไม่ครบ ให้ทำเฉพาะส่วนที่ไม่พึ่งกติกานั้นหรือบันทึกเป็น `BLOCKED`
3. เริ่มตามลำดับ Project Plan: ปิดงาน Phase 0 ที่เหลือ → ยืนยัน G-02 → Phase 1 → Phase 2 และ Phase อื่นตาม Gate
4. ห้ามสร้าง Branch นอก `AI` / `Dev` / `Main`, ห้าม Force Push, และห้ามเพิ่ม Role `Inventory`
5. งานที่เปลี่ยนพฤติกรรมต้องส่งหัวข้อ **⚠️ ต้องทดสอบโดยคุณ** พร้อมข้อมูล ขั้นตอน และผลที่คาดหวัง

## งานที่ควรทำต่อ

- TASK-016 แก้การย่อ Sidebar หลักและย้าย Sidebar ย่อยลูกค้าเข้า body แล้ว; ผู้ใช้ทดสอบและยืนยัน 2026-09-24. งาน UI ก่อนหน้า TASK-007 ถึง TASK-014 ยังอยู่ใน `tasks/ACTIVE.md` สถานะ `READY_FOR_USER_TEST`.
- TASK-015 รอผู้ใช้ชี้แจงว่า filter “มีอีกหน้า” หมายถึงหน้าแยกหรือส่วนใน tab; ก่อนทำหน้าถัดไปให้รับรายการ sidebar ย่อย, tab และ filter ของหน้านั้น แล้ววาง Specs/Plan สั้น.
- จัดทำ Specs รายโมดูลของระบบ/ผู้ใช้งานเมื่อ OPEN-14 พร้อมตอบ; ไม่เพิ่ม business logic ระหว่างรอ.
