# ZUUGROUP

เว็บหลังบ้านสำหรับธุรกิจจัดจำหน่ายยาและเวชภัณฑ์ B2B

## สถานะปัจจุบัน

- Project Specs รุ่น 0.2 และ Project Plan รุ่น 0.1 ได้รับอนุมัติแล้วเมื่อ 2026-09-23
- Phase 1 กำลังทำใน `TASK-006`; ยังไม่มีตารางธุรกิจ, Migration หรือ Seed
- Supabase Mock เป็น Cloud project `zuugroup-web`, Region Singapore (`ap-southeast-1`), Project Ref `wiikzseotpjxssbcdayk`
- Project URL: `https://wiikzseotpjxssbcdayk.supabase.co`
- Runtime: Node.js 24.21.0, npm 11.x, Next.js 16.x, Prisma 7.x
- ห้าม Commit password, Secret key หรือ connection string ที่มี password

## เอกสารที่ต้องอ่านก่อนทำงาน

### ชุดเตรียมก่อนข้อมูลจริง

- [เปิดแบบฟอร์มกรอกข้อกำหนด](docs/forms/business-requirements.html) — เปิดด้วย Chrome/Edge แล้วส่งออกคำตอบเป็นไฟล์

- [แบบฟอร์มข้อกำหนดทุกโมดูล](docs/BUSINESS-REQUIREMENTS-WORKBOOK.md)
- [คู่มือใช้งาน](docs/USER-MANUAL.md)
- [รายการตรวจรับรวมครั้งเดียว](docs/UAT-PREPARATION.md)

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

## คู่มือเริ่มงานแบบย่อ

ใช้ลำดับนี้ทุกครั้งก่อนเริ่มงาน เพื่อให้ทำงานต่อจากเอกสารชุดเดียวกันและไม่แก้ส่วนที่ยังไม่พร้อม

1. อ่าน [Project Specs](docs/specs/2026-09-23-1550-project-specs.md), [Project Plan](docs/plans/2026-09-23-1635-project-plan.md) และ [กติกาสำหรับผู้ทำงาน](AGENTS.md) รุ่นล่าสุด
2. เปิด `tasks/ACTIVE.md` เพื่อดูงานที่กำลังทำและหลีกเลี่ยงการแก้ไฟล์หรือขอบเขตซ้ำกับผู้อื่น
3. ระบุ Gate และรายการ `OPEN` ที่เกี่ยวข้องกับงาน หากยังไม่มีคำตอบ ห้ามเดากฎธุรกิจหรือเริ่มส่วนที่ต้องใช้คำตอบนั้น
4. ลงทะเบียน Task ก่อนแก้ไฟล์ โดยระบุผู้รับผิดชอบ, เอกสารอ้างอิง, ขอบเขตที่ทำ/ไม่ทำ, ไฟล์ที่กระทบ และสถานะงาน
5. ทำเฉพาะขอบเขตที่ลงทะเบียนไว้; งานที่มีพฤติกรรมต้องแนบหัวข้อ **⚠️ ต้องทดสอบโดยคุณ** พร้อมวิธีทดสอบและผลที่ควรเห็น

## เช็กลิสต์ก่อนเริ่ม Task

- [ ] อ่าน Specs, Plan และ `AGENTS.md` รุ่นล่าสุดแล้ว
- [ ] ตรวจ `tasks/ACTIVE.md` แล้ว และไม่มีงานอื่นถือครองไฟล์/ขอบเขตเดียวกัน
- [ ] ระบุ Gate และ `OPEN` ที่เกี่ยวข้องแล้ว; ถ้าติดรายการใด ได้บันทึกสถานะหรือหยุดส่วนนั้นไว้โดยไม่เดากฎ
- [ ] บันทึกรหัส Task, ผู้รับผิดชอบ, ขอบเขตงาน, ไฟล์ที่กระทบ และสถานะในรายการงานแล้ว
- [ ] สำหรับงานที่เปลี่ยนพฤติกรรม: เตรียมหัวข้อ **⚠️ ต้องทดสอบโดยคุณ** พร้อมข้อมูลตัวอย่าง ขั้นตอน และผลที่คาดหวังแล้ว

## เริ่มระบบในเครื่อง

### ตรวจโครงการก่อนส่งงาน

รัน `npm run verify` เพื่อตรวจ lint, types, ชุดทดสอบ API/routes/flow ข้อมูล และ production build ตามลำดับ 10 ขั้นตอน โดยหยุดทันทีเมื่อไม่ผ่าน ดู [คู่มือ verify](docs/VERIFY-GUIDE.md) สำหรับรายละเอียดและชุดตรวจ seed เพิ่มเติม

1. ติดตั้ง Node.js `24.21.0` และ npm ที่มากับ Node.js รุ่นนี้
2. คัดลอก `.env.example` เป็น `.env.local`
3. เปิด Supabase Dashboard ของ `zuugroup-web` → **Connect** แล้วใส่ Publishable key และ connection strings ที่ได้ลงใน `.env.local` ด้วยตนเอง ห้ามส่ง password หรือ Secret key ในแชต
4. รัน `npm ci` เพื่อใช้รุ่นตาม `package-lock.json`; Prisma Client จะถูกสร้างหลังติดตั้ง
5. รัน `npm run dev` แล้วเปิด `http://localhost:5000`

Runtime `DATABASE_URL` ใช้ Session Pooler สำหรับการพัฒนาจากเครื่องที่อาจเป็น IPv4-only; `DIRECT_URL` ใช้สำหรับ Prisma CLI/Migration หากเครือข่ายเข้า Direct connection ไม่ได้ ให้ใช้ Session Pooler ตามคำแนะนำของ Supabase แทน

ใช้ Docker Compose ได้ด้วย `docker compose up --build` หลังเตรียม `.env.local` แล้ว บริการเว็บเชื่อมกับ Supabase Cloud โดยตรง ไม่มี PostgreSQL container แยก

ยังไม่สร้าง Migration เพราะยังไม่มี Model ที่ได้รับอนุมัติให้สร้างใน Phase 1
