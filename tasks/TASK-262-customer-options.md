# TASK-262 — ข้อมูลพื้นฐานลูกค้า (ตั้งค่าระบบ) — 6 ตุลาคม 2569

OWNER_APPROVED. เจ้าของสั่งเพิ่มเมนูตั้งค่า "ข้อมูลพื้นฐานลูกค้า" คล้ายข้อมูลพื้นฐานสินค้า และเลือกรายการ:
- กลุ่มรหัสลูกค้า (codeGroup) — มีรหัส A-Z/0-9 2–3 ตัว บังคับ
- วันเริ่มนับเครดิต (creditStart)
- ระยะเวลาเครดิต (creditTerm) — บังคับจำนวนวัน 0–365 (0=เงินสด)
- รอบวางบิล (billingCycle) — ฟอร์มลูกค้าเลือกจากรายการหรือพิมพ์อิสระได้
- ประเภทเอกสารแนบ (documentType) — ช่องแนบไฟล์ในฟอร์มลูกค้าสร้างตามรายการที่เปิดใช้
ไม่ทำ: ประเภทใบอนุญาต/ผลตรวจใบอนุญาต (คงข้อความอิสระ), วิชาชีพ (คงติ๊กแพทย์/เภสัชกร).
ค่าเริ่มต้นเติมเฉพาะที่ตกลงแล้ว: 5 กลุ่มรหัส PHA/CLN/HOS/WSL/GOV, เครดิต เงินสด(0)/30/60/90 วัน, 5 ประเภทเอกสารตามฟอร์มเดิม. วันเริ่มนับเครดิต/รอบวางบิลว่างให้Adminเพิ่ม.

ลำดับ/ไฟล์: docs → migration prisma/migrations/20261006_customer_options + schema.prisma + scripts/setup-customer-options.mjs (transaction, seed idempotent) → src/config/customer-options.ts, src/types/api/customer-options.ts, src/server/customers/options.ts + options-handler.ts, src/app/api/customer-options/route.ts → src/app/settings/customer-options/page.tsx + settings-secondary-sidebar.tsx → Postman folder → tests/lint/type/build.
สิทธิ์: อ่าน=ผู้ใช้ login, เขียน=Admin same-origin, audit ทุกการเขียน, ปิดรายการแทนลบ, version กันแก้ทับ. RLS เปิด revoke anon/authenticated.

ผล: IMPLEMENTED / WAITING_FOR_UAT.
- DB: `node scripts/setup-customer-options.mjs` (เพิ่ม --dry-run ไม่บันทึก) ลง Supabase แล้ว; รันซ้ำไม่เพิ่มแถว. customer_options RLS เปิด, anon/authenticated ไม่มีสิทธิ์.
- ทดสอบ: `node --loader ./scripts/ts-test-loader.mjs scripts/test-customer-options.mjs` 10 checks ผ่านใน transaction ที่ rollback (seed, เพิ่ม/แก้/audit, days/code rules, ซ้ำ, version, ปิด/เปิด, validation/sort/page, role/origin/401, RLS).
- HTTP จริง: GET/POST anonymous 401; /settings/customer-options redirect /login เหมือนหน้าสินค้า. tsc/eslint ผ่าน.
- Postman local 4 คำขอ; Cloud ยังไม่ sync.

⚠️ ต้องทดสอบโดยคุณ: Login Admin → ตั้งค่าระบบ → ข้อมูลพื้นฐานลูกค้า. เลือก กลุ่มรหัสลูกค้า ต้องเห็น 5 แถว PHA/CLN/HOS/WSL/GOV; ระยะเวลาเครดิต เห็น เงินสด/30/60/90 วัน และฟอร์มมีช่องจำนวนวัน; ประเภทเอกสารแนบ 5 แถว; วันเริ่มนับเครดิต/รอบวางบิลว่าง (NotFound) ให้ลองเพิ่มเอง. ลองเพิ่มชื่อซ้ำต้องขึ้นข้อความซ้ำ; แก้ไข/ปิดรายการ/เปิดรายการได้ และ Alert สำเร็จ.
