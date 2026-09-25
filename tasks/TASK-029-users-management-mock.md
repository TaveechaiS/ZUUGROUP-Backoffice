# TASK-029 — เว็บ Mock สำหรับนำเสนอ (ทุกเมนู)

**สถานะ:** READY_FOR_USER_TEST
**Phase:** งาน UI Mock เพื่อนำเสนอ (ไม่ใช่งานระบบจริง)
**Specs:** [Project Specs §22.4](../docs/specs/2026-09-23-1550-project-specs.md)
**Plan:** [แผนย่อย TASK-029](../docs/plans/2026-09-25-users-management-mock-plan.md)

## ขอบเขต

- ทำหน้าจอ Mock ให้ครบเส้นทางเมนูหลักและเมนูรองใน `ADMIN_PAGES` ครอบคลุมข้อมูลลูกค้า สินค้า คลัง จัดซื้อ ขาย ส่งของ การเงิน รายงาน และจัดการระบบ.
- ทำหน้า Dashboard ที่ใช้ตัวเลขสมมุติและติดป้าย Mock เพื่อประกอบการนำเสนอ.
- หน้า `/users` สาธิตค้นหา/กรอง/เพิ่มบัญชี; ยึดผู้ใช้ 1 คนต่อ 1 Role; Role เป็นตำแหน่งงานที่กำหนดชุดสิทธิ์.
- ไม่ต่อ Supabase Auth, Prisma, API, Storage, Audit หรือระบบแจ้งเตือน; ไม่คงข้อมูลหลัง refresh และไม่เก็บรหัสผ่าน.
- ไม่สรุปกติกา OPEN เรื่องการลบ/ระงับ Admin, บัญชีเวียน, เอกสาร, อายุ Audit หรือ Archive.
- ปรับทุกหน้ารายการให้ไม่มี page title/description และ KPI; ย้ายปุ่มหลักเข้า filter row, เพิ่ม pagination/export; Dashboard คง KPI ตามภาพอ้างอิงล่าสุด.
- เก็บรายละเอียดตามภาพอ้างอิงใหม่: แท็บไม่ใส่จำนวน/ป้าย, แถวตัวกรองขนาดเล็ก, ตาราง 7 คอลัมน์แถวเตี้ย, ตัวเลขแบ่งหน้าและ Export จัดตำแหน่งตามภาพ โดยเริ่มที่หน้าลูกค้า.
- ตามคำขอล่าสุด ถอด Sidebar ย่อยของลูกค้าออกจากหน้าจอ Mock ก่อน; หน้า `/customers` ใช้พื้นที่เนื้อหาหลัง Sidebar หลักเต็มความกว้าง การแตกเมนูย่อยใหม่รอการออกแบบภายหลัง.
- ปรับขนาดเฉพาะเนื้อหาหน้าลูกค้าตามไฟล์ตัวอย่าง `Pasted text.txt`; Topbar ต้องคงเดิม และหน้าอื่นไม่อยู่ในขอบเขตการปรับครั้งนี้.
- แยกข้อมูลรายหน้าไว้ใน `src/features/mock/pages/<route>/data.ts`; แต่ละไฟล์เก็บ config, tabs, filters, columns และ rows ของ route นั้น. โครง UI/Mock ใช้ร่วมกัน ไม่ทำ page component ซ้ำ.

## ไฟล์

`src/app/page.tsx`, `src/app/[...segments]/page.tsx`, `src/features/users/users-management-mock.tsx`, `src/features/mock/*`, Specs, Plan, Handoff และไฟล์ Task.

## ผลดำเนินการ

- ทุกเมนูมีเนื้อหา Mock เฉพาะโมดูลแทน placeholder และมี responsive layout.
- `/users` แสดงผู้ใช้จำลอง, ค้นหา, ตัวกรองสถานะ/Role, responsive table/cards และแบบฟอร์มเพิ่มผู้ใช้แบบชั่วคราวใน Browser.
- หน้ารายการไม่มี Page header/KPI ซ้ำ, ปุ่มหลักอยู่ท้ายแถว Filter, ตารางกระชับมี pagination 10 รายการต่อหน้าและ Export; Dashboard ยังคง KPI.
- รหัสผ่านอยู่ใน input state ชั่วคราวและถูกล้างหลังปิด/ส่งฟอร์ม; ไม่ถูกนำเข้า object ผู้ใช้หรือบันทึก.
- ตรวจภาพจริงใน Browser ที่ Desktop (1366 × 768) สำหรับ `/customers`, `/users`, `/products` และมือถือขนาดเริ่มต้น (466 × 790) สำหรับ `/customers` แล้ว: แท็บ, ตัวกรอง, ตาราง, Pagination และ Export แสดงตามลำดับภาพอ้างอิง; มือถือแสดงรายการแบบการ์ด.
- `npm run lint`, `npm run type-check`, `npm run build` และ `git diff --check` ผ่านหลังปรับดีไซน์. ไม่ได้รันชุดทดสอบ.
- ถอด Sidebar ย่อยลูกค้าออกจาก App Shell และลบ component/รายการนำทางที่ไม่ใช้งาน; route Mock ย่อยเดิมยังเปิดด้วย URL ได้ แต่ไม่ปรากฏเป็นเมนูใน UI.
- ตรวจภาพ `/customers` ที่ Desktop 1366 × 768 และ Mobile 466 × 790 แล้ว: Topbar ต่อด้วย Tab/Filter/รายการโดยตรง ไม่มี Sidebar ย่อย; `npm run lint`, `npm run type-check`, `npm run build` และ `git diff --check` ผ่านหลังแก้.
- ใช้ไฟล์ตัวอย่างกำหนดขนาด Body ของ `/customers`: padding 24px, Tab 14px/padding-bottom 16px, Filter card padding 24px และช่องห่าง 20px, ตารางห่าง 24px, หัวตาราง 12px × 14px, แถว 16px × 14px และ Pagination vertical padding 20px. ยืนยันว่า Topbar และหน้าอื่นไม่เปลี่ยน; lint, type-check, build และ diff-check ผ่าน.
- แยกข้อมูลของ 20 route ใน Registry ออกไป `src/features/mock/pages/<route>/data.ts`; ย้ายข้อมูล Dashboard ไป `pages/dashboard/data.ts` และข้อมูล/Role/Tab ของผู้ใช้งานไป `pages/users/data.ts`. UI ยัง render ผ่าน component ร่วม ไม่มีการทำโครงหน้า Mock ซ้ำ.
- เพิ่ม `src/features/mock/pages/README.md` เป็นแผนผัง URL → ไฟล์ข้อมูล พร้อมอธิบายจุดแก้ชื่อหน้า, Tabs, Filters, คอลัมน์ และ rows.
- ตรวจ `npm run lint`, `npm run type-check`, `npm run build` และ `git diff --check` ผ่านหลังแยกไฟล์; build สร้าง static routes ครบ.

## ⚠️ ต้องทดสอบโดยคุณ

1. เปิดทุกกลุ่มเมนูและเส้นทางเมนูรอง ตรวจว่าหน้ารายการไม่มีชื่อหน้า/คำอธิบายซ้ำใน body, ไม่มี KPI (ยกเว้น Dashboard), และมีป้าย/ข้อมูลจำลอง.
2. เปิด `/users`, ค้นชื่อ/อีเมล, สลับ tab สถานะ, เลือก Role และส่งฟอร์มตัวอย่าง; ตรวจว่ามีหนึ่ง Role และแถวใหม่อยู่เฉพาะในหน้านี้.
3. ใช้ตัวกรองหรือ tab ในหน้าที่มี แล้วตรวจว่ารายการตัวอย่างเปลี่ยนตามตัวกรอง.
4. Refresh หน้า; แถวที่เพิ่มต้องหายไป. ตรวจว่าไม่มี Auth/DB/API call, upload หรือการเก็บรหัสผ่าน.
5. ตรวจว่าปุ่มหลักอยู่ปลายแถว Filter; ตารางมี Pagination ด้านล่างและปุ่ม Export อยู่ใต้ตาราง.
6. ย่อหน้าจอเป็นมือถือ; Dashboard, ตาราง/รายการ, filter และฟอร์มยังต้องอ่านและใช้งานได้.
7. เปิด `/customers` บน Desktop และ Mobile: ต้องไม่เห็น Sidebar ย่อยลูกค้า; รายการใช้พื้นที่หลักเต็ม และเมนูหลัก "ลูกค้า" ยังเปิดหน้านี้ได้.
8. เทียบขนาด Tab/Filter/แถวตาราง/Pagination ของ `/customers` กับไฟล์ตัวอย่าง; Topbar ต้องคงขนาดเดิม.
9. เลือก route จาก `src/features/mock/pages/README.md`, แก้ข้อมูลใน `data.ts` ของ route เดียว แล้วตรวจว่าหน้าอื่นไม่เปลี่ยน.

> หมายเหตุหลัง TASK-030: จุดแก้ข้อมูลรายหน้าย้ายไป `src/app/<route>/data.ts`; แผนผังปัจจุบันอยู่ที่ `src/app/README.md`. ข้อความข้างบนบันทึกผลของ TASK-029 ณ เวลาที่ส่งตรวจ.
