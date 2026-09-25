# TASK-013 — ย้ายสไตล์ UI ไป className

**สถานะ:** DONE

**Specs:** [ข้อกำหนดสั้น](../docs/specs/2026-09-24-ui-inline-utilities.md)

**Plan:** [แผนสั้น](../docs/plans/2026-09-24-ui-inline-utilities-plan.md)

ขอบเขต: CSS ที่ผู้ใช้แนบและ CSS โครง Sidebar ที่เกี่ยวข้องใน `src/app/globals.css`; ย้ายไป Tailwind utility ใน `sidebar.tsx` และ `admin-shell.tsx`. คงเฉพาะ imports, tokens และกฎ global ที่ใช้ทั้งแอป.

เกณฑ์รับ: Desktop ขยาย/ย่อ, Mobile, Topbar, Dashboard placeholder และ module placeholder คงรูปแบบเดิม; CSS ไม่มี selector ของ component; lint/type-check/build ผ่าน; ผู้ใช้ตรวจภาพอีกครั้ง.

ผลตรวจโดย AI: ESLint, TypeScript และ production build ผ่าน 2026-09-24. ยังรอเจ้าของโครงการตรวจภาพบน Desktop/Mobile และคลิกย่อ/ขยาย Sidebar.

**ผล UAT:** เจ้าของโครงการยืนยันว่าผ่านทั้งหมดเมื่อ 2026-09-25.
