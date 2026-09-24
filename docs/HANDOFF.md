# Handoff — สถานะเริ่มต้นโครงการ

## เอกสารที่ต้องอ่านก่อนเริ่ม

1. [Project Specs](specs/2026-09-23-1550-project-specs.md) รุ่น 0.2 — สถานะ `APPROVED`
2. [Project Plan](plans/2026-09-23-1635-project-plan.md) รุ่น 0.1 — สถานะ `APPROVED`
3. [ทะเบียนประเด็นรอตัดสินใจ](DECISIONS.md)
4. [กติกาสำหรับผู้ทำงาน](../AGENTS.md)
5. `tasks/ACTIVE.md` และ Task ที่ได้รับมอบหมาย

## สถานะปัจจุบัน

- Project Specs และ Project Plan ได้รับอนุมัติจากเจ้าของโครงการเมื่อ 2026-09-23
- Repository อยู่บน Branch `AI`; ใช้ได้เฉพาะ `AI`, `Dev`, `Main`
- ยังไม่มีโค้ดแอป Schema/Migration/Seed หรือ Docker ใน Repository; มี Supabase Cloud project `zuugroup-web` ในองค์กร `zuugroup`, Region Singapore (`ap-southeast-1`), Project Ref `wiikzseotpjxssbcdayk`, URL `https://wiikzseotpjxssbcdayk.supabase.co`
- G-02 ผ่านแล้ว: ใช้ npm, Node.js 24.21.0 LTS, Next.js 16.x stable ล่าสุด, Prisma 7.x stable ล่าสุด และ Supabase Cloud; ให้ล็อกรุ่นแพ็กเกจจริงใน `package-lock.json`
- OPEN-09 ปิดแล้ว; password, Secret key และ connection string ที่มีรหัสผ่านต้องเก็บใน Environment เฉพาะเครื่อง ห้ามบันทึกใน Git หรือแชต

## วิธีรับงานต่อ

1. ตรวจ `tasks/ACTIVE.md` และลงทะเบียน Task พร้อมขอบเขตไฟล์ก่อนแก้ไข
2. ตรวจ Gate และ OPEN ใน `DECISIONS.md`; ถ้าคำตอบยังไม่ครบ ให้ทำเฉพาะส่วนที่ไม่พึ่งกติกานั้นหรือบันทึกเป็น `BLOCKED`
3. เริ่มตามลำดับ Project Plan: ปิดงาน Phase 0 ที่เหลือ → ยืนยัน G-02 → Phase 1 → Phase 2 และ Phase อื่นตาม Gate
4. ห้ามสร้าง Branch นอก `AI` / `Dev` / `Main`, ห้าม Force Push, และห้ามเพิ่ม Role `Inventory`
5. งานที่เปลี่ยนพฤติกรรมต้องส่งหัวข้อ **⚠️ ต้องทดสอบโดยคุณ** พร้อมข้อมูล ขั้นตอน และผลที่คาดหวัง

## งานที่ควรทำต่อ

- TASK-006 Phase 1 foundation is implemented and the app/database connection have been verified; status is READY_FOR_USER_TEST. Phase 2 waits for G-03 Figma/UI assets and access details.
- จัดทำ Specs รายโมดูลของระบบ/ผู้ใช้งานเมื่อ OPEN-14 พร้อมตอบ
- ระบุแหล่ง Figma/Asset/Component ตาม G-03 ก่อนงาน UI
