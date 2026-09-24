# Handoff — สถานะปัจจุบันของโครงการ

## เอกสารที่ต้องอ่านก่อนเริ่ม

1. [Project Specs](specs/2026-09-23-1550-project-specs.md) รุ่น 0.3 และข้อกำหนดสั้นล่าสุด — `APPROVED`
2. [Project Plan](plans/2026-09-23-1635-project-plan.md) รุ่น 0.2 และแผนย่อยล่าสุด — `APPROVED`
3. [ทะเบียนประเด็นรอตัดสินใจ](DECISIONS.md)
4. [กติกาสำหรับผู้ทำงาน](../AGENTS.md)
5. `tasks/ACTIVE.md` และ Task ที่ได้รับมอบหมาย

## สถานะปัจจุบัน

- Project Specs รุ่น 0.3 และ Project Plan รุ่น 0.2 ได้รับอนุมัติเมื่อ 2026-09-24
- Repository อยู่บน Branch `AI`; ใช้ได้เฉพาะ `AI`, `Dev`, `Main`
- มีโครง Next.js/TypeScript/Tailwind, Prisma/Docker configuration และหน้า UI พื้นฐาน; ยังไม่มี Schema/Migration/Seed, CRUD, Auth หรือ Dashboard KPI
- G-02 ผ่านแล้ว: ใช้ npm, Node.js 24.21.0 LTS, Next.js 16.x stable ล่าสุด, Prisma 7.x stable ล่าสุด และ Supabase Cloud; รุ่นแพ็กเกจจริงล็อกใน `package-lock.json`
- OPEN-09 ปิดแล้ว; password, Secret key และ connection string ที่มีรหัสผ่านต้องเก็บใน Environment เฉพาะเครื่อง ห้ามบันทึกใน Git หรือแชต
- TASK-015 บันทึกแล้วว่า filter อยู่ภายใน tab ของหน้าเดียวกัน ไม่มีหน้าแยกหรือ route แยก
- TASK-016 ปรับการย่อ Sidebar หลักและตำแหน่ง Sidebar ย่อยลูกค้าแล้ว; ผู้ใช้ทดสอบและยืนยันเมื่อ 2026-09-24
- TASK-006 ถึง TASK-014 และ TASK-017 ถึง TASK-023 อยู่ใน `READY_FOR_USER_TEST`; มีผลตรวจทางเทคนิคระบุใน `tasks/ACTIVE.md` แต่ยังรอผู้ใช้ตรวจรับตามขอบเขตแต่ละงาน
- ผู้ใช้เลื่อนการตรวจ Responsive ไปหลังงานหลัก; ให้ตรวจ Desktop UAT ก่อน

## วิธีรับงานต่อ

1. ตรวจ `tasks/ACTIVE.md` และลงทะเบียน Task พร้อมขอบเขตไฟล์ก่อนแก้ไข
2. ตรวจ Gate และ OPEN ใน `DECISIONS.md`; ถ้าคำตอบยังไม่ครบ ให้ทำเฉพาะส่วนที่ไม่พึ่งกติกานั้นหรือบันทึกเป็น `BLOCKED`
3. ขั้นต่อไปคือให้ผู้ใช้ตรวจรับงานที่ `READY_FOR_USER_TEST` โดยเริ่มจาก Desktop; ทดสอบ Responsive ภายหลังตามที่ผู้ใช้กำหนด
4. ก่อนเริ่ม Phase 3–4 ให้รอคำตอบ OPEN-10 และ OPEN-14; ก่อนเปิดงานพฤติกรรมของโมดูลอื่นให้ตรวจ Gate ที่เกี่ยวข้อง
5. ห้ามสร้าง Branch นอก `AI` / `Dev` / `Main`, ห้าม Force Push, และห้ามเพิ่ม Role `Inventory`
6. งานที่เปลี่ยนพฤติกรรมต้องส่งหัวข้อ **⚠️ ต้องทดสอบโดยคุณ** พร้อมข้อมูล ขั้นตอน และผลที่คาดหวัง

## ประเด็นรอคำตอบ

- OPEN-01 ถึง OPEN-07, OPEN-10 ถึง OPEN-16 ยังมีรายการรอคำตอบตามขอบเขตที่ระบุใน [DECISIONS.md](DECISIONS.md)
- OPEN-08 ตอบบางส่วนสำหรับ Design foundation; รายละเอียดที่ไม่มีใน Figma หรือคำยืนยันยังต้องถามก่อนกำหนด
- OPEN-09 ปิดแล้ว
- OPEN-12 อยู่นอกขอบเขตรุ่นแรกตามทะเบียน
