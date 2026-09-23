# ZUUGROUP

เว็บหลังบ้านสำหรับธุรกิจจัดจำหน่ายยาและเวชภัณฑ์ B2B

## สถานะปัจจุบัน

- Project Specs และ Project Plan อยู่ระหว่างตรวจ (`REVIEW`)
- ยังไม่มีโค้ด, ฐานข้อมูล, Migration, Seed หรือ Docker ใน Repository นี้
- เริ่มพัฒนาเมื่อผู้ใช้อนุมัติ Specs และ Plan แล้ว

## เอกสารที่ต้องอ่านก่อนทำงาน

1. [Project Specs](docs/specs/2026-09-23-1550-project-specs.md)
2. [Project Plan](docs/plans/2026-09-23-1635-project-plan.md)
3. [Code Style Guide](docs/specs/references/CODE_STYLE_GUIDE.md)
4. [กติกาสำหรับผู้ทำงาน](AGENTS.md)

## กติกา Git

- ใช้เฉพาะ Branch `AI`, `Dev`, `Main`
- AI ทำงานและ Commit/Push ใน `AI`
- ผู้ใช้ทำงานใน `Dev`
- `Main` ใช้สำหรับงานที่ผู้ใช้ตรวจรับแล้ว
- ห้ามสร้าง Branch ย่อย, Force Push หรือ Commit ค่า Secret

## ก่อนเริ่ม Task

- อ่าน Specs/Plan รุ่นล่าสุดและ `tasks/ACTIVE.md`
- ระบุผู้รับผิดชอบ, ขอบเขตไฟล์, ตาราง/API ที่กระทบ และ Gate/OPEN ที่เกี่ยวข้อง
- งานที่อยู่ใน OPEN ห้ามเดากฎธุรกิจหรือเริ่มคำสั่งที่ต้องใช้กฎนั้น
