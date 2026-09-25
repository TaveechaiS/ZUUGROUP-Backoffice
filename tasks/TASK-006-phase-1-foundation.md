# TASK-006 — Phase 1 พื้นฐานโครงการ

| รายการ | รายละเอียด |
|---|---|
| Phase | 1 — พื้นฐานโครงการ |
| ผู้รับผิดชอบ | AI |
| สถานะ | DONE |
| เอกสารอ้างอิง | `SPEC-PROJECT-001` รุ่น 0.2, `PLAN-PROJECT-001` รุ่น 0.1, Code Style Guide |
| Commit ตั้งต้น | `42a8690` บน Branch `AI` |

## แผนก่อนลงมือ

1. ตรวจ runtime/เครื่องมือที่มีและเอกสารทางการของ Next.js, Prisma v7 และ Supabase
2. สร้างโครง App Router ภาษาไทยพร้อม TypeScript strict, Tailwind CSS, HeroUI และ alias `@/*`
3. วาง config/environment validation, HTTP service, Prisma v7 schema/config/adapter และ Supabase server client โดยไม่ตั้งกฎธุรกิจ
4. เตรียม Docker, `.env.example`, `.gitignore` และ README วิธีเริ่มงาน โดยไม่บันทึก credential จริง
5. ตรวจไฟล์และ diff; รายงานสิ่งที่ตรวจได้และสิ่งที่ยังต้องให้ผู้ใช้ทำ

## ขอบเขต

- สร้างพื้นฐานตาม Phase 1 ใน Project Plan
- เชื่อมค่าระบุตัว Cloud project: `https://wiikzseotpjxssbcdayk.supabase.co` และ ref `wiikzseotpjxssbcdayk`
- ใช้ Environment เฉพาะเครื่องสำหรับ password, publishable/secret keys และ connection URLs
- ใช้ Prisma ORM 7.x stable; ตรึง dependencies ใน `package-lock.json`
- ใช้ Node.js 24.21.0 LTS, npm, Next.js 16.x stable

## นอกขอบเขต

- Schema ธุรกิจ, migrations, seed, Auth/RBAC flow, Storage policies หรือข้อมูลจำลอง
- UI/Design ตาม Figma ซึ่งยังรอ G-03
- การเปลี่ยนค่าโปรเจกต์ Cloud ที่มีผลภายนอก/เพิ่มสิทธิ์ หรือการเก็บ Secret ใน repository

## ไฟล์ที่คาดว่าจะกระทบ

- `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`
- `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `postcss.config.mjs`
- `.gitignore`, `.env.example`, `Dockerfile`, `docker-compose.yml`
- `prisma/schema.prisma`, `prisma.config.ts`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/config/app.ts`, `src/lib/env.ts`, `src/lib/supabase/server.ts`
- `src/service/http.ts`, `src/server/db/prisma.ts`
- `README.md`, `tasks/ACTIVE.md`, `tasks/BLOCKED.md`, `tasks/COMPLETED.md`

## Gate และ OPEN

- G-01 ผ่าน; G-02 ผ่านแล้วตาม `docs/DECISIONS.md`
- G-03 ยังไม่ผ่าน; จึงใช้เพียงหน้าเริ่มต้นพื้นฐาน ไม่กำหนดระบบ Design เอง
- ห้ามเพิ่ม Role `Inventory` และห้ามแปลง OPEN เป็นกฎธุรกิจ

## นิยามพร้อมส่ง

- คำสั่งเริ่มระบบและบริการใน README สอดคล้องกับไฟล์จริง
- Secret ไม่อยู่ใน Git; `.env.example` มีชื่อและคำอธิบายตัวแปรเท่านั้น
- Prisma 7 ใช้ migration/runtime configuration ตามเอกสารรุ่นนั้น
- ไม่มี schema หรือพฤติกรรมธุรกิจที่ยังไม่ได้อนุมัติ

## ⚠️ ต้องทดสอบโดยคุณ

- คัดลอก `.env.example` เป็น `.env.local`, กรอก URL/keys/connection strings ในเครื่อง และทำตาม README เพื่อเปิดแอป
- ใช้ Prisma `db pull` หรือคำสั่งตรวจ connection ที่ README ระบุหลังใส่ `DATABASE_URL`; ผลที่ควรเห็นคือเชื่อมโปรเจกต์ `wiikzseotpjxssbcdayk` ได้ โดยยังไม่มีตารางธุรกิจ
- ตรวจว่าไม่มี password, Secret API key หรือ connection string ที่มีรหัสผ่านใน Git


## Verification results (2026-09-24)

- `npm run lint`, `npm run type-check`, and `npm run build` passed.
- The user confirmed the app opens at `http://localhost:5000`.
- A read-only `SELECT 1` using the configured `DATABASE_URL` returned `DATABASE_CONNECTED`; no database records were changed.
- Confirmed `.env.local` is ignored and not tracked by Git.
- Runtime used for these checks was Node.js 24.11.1; project target remains Node.js 24.21.0 as specified in `.nvmrc`.

**ผล UAT:** เจ้าของโครงการยืนยันว่าผ่านทั้งหมดเมื่อ 2026-09-25.
