# TASK-053 — รวมการเรียก API ฝั่ง Client

- สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติ 2026-10-01 พร้อมตัวอย่าง Axios
- Branch: AI
- ผู้รับผิดชอบ: AI
- Specs: [ข้อกำหนด](../docs/specs/2026-10-01-client-api-layer.md)
- Plan: [แผนย่อย](../docs/plans/2026-10-01-client-api-layer-plan.md)

ขอบเขต: service กลางสำหรับคำขอ API ใน Client Component, ย้ายจุด fetch ตรง, try/catch และจัดการ 401/403. คง route.ts, URL, Server Action login และ Auth/RBAC เดิม.

ผลตรวจ: `npm run lint`, `npm run type-check`, `npm run build` และ `git diff --check` ผ่าน. ค้นใน `src` ฝั่ง Client แล้วเหลือ Axios เฉพาะ `src/service/http.ts`. ไม่ยิง HTTP/ล็อกอินจริงตามคำสั่งเดิม; รอ Browser UAT. การติดตั้ง Axios รักษารูปแบบ `package-lock.json` ที่มีการเปลี่ยนแปลงก่อนเริ่มงาน.

## ⚠️ ต้องทดสอบโดยคุณ

หลังทำ: เข้าสู่ระบบแล้วเปิดรายการและรายละเอียด; เพิ่ม/แก้/ลบ/กู้คืนข้อมูลด้วย Admin ควรใช้ข้อมูลเดิมและนำทางถูกต้อง. Role ที่ไม่มีสิทธิ์เขียนควรเห็นข้อผิดพลาด 403 โดยไม่ถูกออกจากระบบ; session หมดอายุและ API ตอบ 401 ควรไปหน้า Login.
