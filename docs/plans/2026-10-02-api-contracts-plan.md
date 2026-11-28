# แผน API contracts — TASK-073

สถานะ: READY_FOR_USER_TEST เจ้าของอนุมัติเอกสาร 2026-10-02 ทำครบตามลำดับ ตรวจtype-check/lint/build/offline contracts+pagination+route integrity/diffผ่าน รอเจ้าของตรวจเว็บ/Import Postman local ตาม docs/API-CONTRACTS.md

| ลำดับ | ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | วิธีตรวจรับ |
|---|---|---|---|
| 1 | ตารางสัญญาข้อมูลปัจจุบันและรายการ validators ที่ย้ายได้ | docs/API-CONTRACTS.md, Specs/Task/ACTIVE | ระบุแต่ละกลุ่ม response/auth/error จริง ไม่ถือทุก GET เป็น public |
| 2 | แยก shared types และปรับ import | src/types/api.ts, src/types/api/*, features/records/types.ts, app pages/product-ui และ server services/routes ที่อ้าง types | type-check, ไม่เพิ่ม runtime server dependency ใน client; UI/dataflow ยังอยู่รายroute |
| 3 | แยก validators เดิมเป็น pure functions | src/server/validation/*, users/products/records/auth services/routes, paginationเฉพาะจำเป็น | offline valid/invalid/null/array/unknown fields/required/limits/concurrency cases ตามพฤติกรรมเดิม |
| 4 | ปรับ collection และคู่มือจาก contract | postman/*.postman_collection.json, postman/README.md, docs/API-NAME-GUIDE.md | JSON schema/local references/URL-method-query-body-consistency ไม่มี credentials จริง ไม่ยิงrequests |
| 5 | ตรวจและส่งมอบ | scripts/offline contract test ตามความจำเป็น, Task/ACTIVE/คู่มือ | type-check/lint/build/offline tests/diff ผ่าน; เจ้าของตรวจเว็บและ Postman ต่อ |

ข้อจำกัด: ไม่ DB migration/seed ไม่ทดสอบ live HTTP/login ไม่กำหนดRole/filterใหม่ ไม่ cloud sync/commit/push

## ⚠️ ต้องทดสอบโดยคุณ หลัง implementation

เปิดหน้ารายการ/เพิ่ม/แก้ไขเดิม ควรใช้ข้อมูลและตอบ validation เหมือนเดิม Import Collection local แล้วลอง GET limit10/offset0 จากนั้น offset10 ควรได้ pagination เดิม Body ที่ขาดฟิลด์บังคับควรได้ error/status เดิม ทดลองเฉพาะข้อมูลที่ยอมให้เปลี่ยน ไม่ต้องทดสอบสิทธิ์ใหม่เพราะรอบนี้ไม่เปลี่ยนสิทธิ์
