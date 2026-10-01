# แผนย่อย TASK-050 — GET สาธารณะสำหรับ Postman

## ลำดับและผลลัพธ์

อนุมัติแล้ว 2026-10-01; เพิ่ม list/getbyid, Params, pagination และโฟลเดอร์ตามตัวอย่าง Restful API จากเจ้าของโครงการ

1. ตรวจ `tasks/ACTIVE.md`, GET API เดิม, Specs สิทธิ์สินค้า และ Collection ปัจจุบัน
2. ร่าง Specs นี้กับ Task พร้อมรายการฟิลด์ที่เปิดเผยและขอบเขตที่ไม่เปิด; ให้เจ้าของโครงการยืนยันก่อนเปลี่ยนสิทธิ์ API ตาม AGENTS.md ข้อ 3
3. หลังอนุมัติ อ่านคู่มือ Next.js ใน `node_modules/next/dist/docs/` แล้วสร้าง GET `/api/public`, `/api/public/products`, `/api/public/products/masters` แบบเลือกฟิลด์และจำกัดแถว
4. สำรอง Collection เดิมในชื่อแยก แล้วสร้าง `Zuugroup` ใหม่ในไฟล์และ Postman Workspace ให้มีเฉพาะ GET ที่ไม่ใช้ Auth; ปรับคู่มือและ Task
5. ตรวจ TypeScript, lint และ build; ไม่ยิง GET จริงตามคำสั่งเดิมให้งดทดสอบ; ส่งกรณีใช้งานจริงให้เจ้าของโครงการทดสอบ

## ไฟล์ที่จะเปลี่ยนหลังอนุมัติ

- `src/app/api/public/route.ts`, `src/app/api/public/products/route.ts`, `src/app/api/public/products/masters/route.ts`
- `src/app/api/public/products/[id]/route.ts`, `src/app/api/public/masters/[type]/route.ts`, `src/app/api/public/masters/[type]/[id]/route.ts`, `src/app/api/public/_response.ts`
- `src/server/products/public-service.ts`, `src/proxy.ts` (ข้าม refresh Auth สำหรับ public API)
- `postman/Zuugroup.postman_collection.json`, ไฟล์สำรอง Collection เดิม, `postman/README.md`
- Specs/Plan หลัก, `tasks/TASK-050-public-get-preview.md`, `tasks/ACTIVE.md`

## วิธีตรวจรับ

ส่ง GET ทั้งสามเส้นทางโดยไม่เลือก Environment และไม่มี Authorization; ได้ HTTP 200 กับข้อมูลเฉพาะฟิลด์ที่อนุมัติ. GET เดิมที่ต้องมีสิทธิ์ยังตอบ 401 เมื่อไม่ล็อกอิน; ไม่มีข้อมูลผู้ใช้ ราคา คลัง หรือ Audit ในผลสาธารณะ
