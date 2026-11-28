# TASK-053 — รวมการเรียก API ฝั่ง Client

## แก้ dependency ในเครื่อง 2026-10-02

เจ้าของรายงาน Cannot resolve axios. package/lock ระบุ 1.20.0 แต่ node_modules ไม่มี. npm install --ignore-scripts --no-audit --no-fund เพิ่ม 11 packages สำเร็จ; resolve axios 1.20.0 ได้และ type-check ผ่าน. ไม่แก้ HTTP client/API/DB; lock JSON ไม่เปลี่ยนเนื้อหาและคืนรูปแบบเดิม. next-env.d.ts เปลี่ยนก่อนงานนี้และเก็บไว้. รอผู้ใช้ reload localhost:5000; ต้องไม่พบ Can't resolve axios.

- สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติ 2026-10-01 พร้อมตัวอย่าง Axios
- Branch: AI
- ผู้รับผิดชอบ: AI
- Specs: [ข้อกำหนด](../docs/specs/2026-10-01-client-api-layer.md)
- Plan: [แผนย่อย](../docs/plans/2026-10-01-client-api-layer-plan.md)

ขอบเขต: service กลางสำหรับคำขอ API ใน Client Component, ย้ายจุด fetch ตรง, try/catch และจัดการ 401/403. คง route.ts, URL, Server Action login และ Auth/RBAC เดิม.

ผลตรวจ: `npm run lint`, `npm run type-check`, `npm run build` และ `git diff --check` ผ่าน. ค้นใน `src` ฝั่ง Client แล้วเหลือ Axios เฉพาะ `src/service/http.ts`. ไม่ยิง HTTP/ล็อกอินจริงตามคำสั่งเดิม; รอ Browser UAT. การติดตั้ง Axios รักษารูปแบบ `package-lock.json` ที่มีการเปลี่ยนแปลงก่อนเริ่มงาน.

## ⚠️ ต้องทดสอบโดยคุณ

หลังทำ: เข้าสู่ระบบแล้วเปิดรายการและรายละเอียด; เพิ่ม/แก้/ลบ/กู้คืนข้อมูลด้วย Admin ควรใช้ข้อมูลเดิมและนำทางถูกต้อง. Role ที่ไม่มีสิทธิ์เขียนควรเห็นข้อผิดพลาด 403 โดยไม่ถูกออกจากระบบ; session หมดอายุและ API ตอบ 401 ควรไปหน้า Login.
