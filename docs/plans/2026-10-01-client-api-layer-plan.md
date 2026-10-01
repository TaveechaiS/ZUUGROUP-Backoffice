# แผนย่อย TASK-053 — ชั้นเรียก API ฝั่ง Client

| ลำดับ | ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | ตรวจรับ |
|---|---|---|---|
| 1 | บันทึกข้อกำหนดและขอบเขต | Project Specs/Plan, Specs/Plan/Task TASK-053, `tasks/ACTIVE.md` | ข้อกำหนดตรงคำขอและไม่เปลี่ยน URL/API server |
| 2 | รวม Axios, header/session/error/try-catch และฟังก์ชัน GET/POST/Update/DELETE/Login | `src/service/http.ts`, `package.json`, `package-lock.json` | 401 ไป login, 403 คงข้อความสิทธิ์, error ไทย, AbortSignal/DELETE body ทำงาน |
| 3 | ย้าย Client Component ที่เรียก fetch ตรงและ helper `readRecord` มาใช้ service | `src/features/records/types.ts`, `src/components/pages/*`, `src/app/products/*`, `src/app/users/*` | ทุก Client Component ใช้ service; รูป response/การนำทางเดิม |
| 4 | ตรวจ static และพฤติกรรม | `tasks/TASK-053-client-api-layer.md`, `src/app/README.md` | type-check/lint/build/diff-check; ผู้ใช้ทดสอบ login, list, CRUD, 401/403 |

ไม่ยิง HTTP ไป DB จริงตามคำสั่งเดิมของเจ้าของ. รักษาการแก้ไข `package-lock.json` และ `next-env.d.ts` ที่มีอยู่ก่อนเริ่มงาน.
