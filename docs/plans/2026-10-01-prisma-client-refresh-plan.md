# แผนย่อย TASK-043 — Prisma Client ค้างหลังเพิ่ม Product

**สถานะ:** READY_FOR_USER_TEST
**อ้างอิง:** TASK-042, ข้อผิดพลาดที่ผู้ใช้แจ้ง 2026-10-01

## ลำดับและผลลัพธ์

1. ตรวจ `tasks/ACTIVE.md`, generated Prisma Client, singleton ใน `src/server/db/prisma.ts` และเวลาที่ dev server เริ่ม เพื่อยืนยันสาเหตุ
2. เมื่อ singleton เก่าขาด delegate `product` ให้สร้าง Prisma Client ใหม่จากโค้ดที่ generate ล่าสุด โดยไม่เปลี่ยน schema หรือข้อมูลใน DB
3. รีสตาร์ต dev server ที่พอร์ต 5000 และตรวจ route; รัน TypeScript, ESLint และ build
4. ให้เจ้าของโครงการเปิด `/products` ด้วยบัญชีที่ล็อกอิน และตรวจว่าเห็นสินค้าตัวอย่างแทน Runtime Error

## ไฟล์ที่จะเปลี่ยน

- `src/server/db/prisma.ts`
- `docs/plans/2026-10-01-prisma-client-refresh-plan.md`
- `tasks/TASK-043-prisma-client-refresh.md`, `tasks/ACTIVE.md`

## วิธีตรวจรับ

generated client มี `product`; การอ่าน `/products` หลังรีสตาร์ตไม่เกิด `Cannot read properties of undefined (reading 'findMany')`; หน้ารายการแสดงสินค้าตัวอย่างที่มีอยู่ใน DB
