# TASK-043 — แก้ Prisma Client ค้างหลังเพิ่มสินค้า

- **สถานะ:** READY_FOR_USER_TEST
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Plan:** [แผนย่อย](../docs/plans/2026-10-01-prisma-client-refresh-plan.md)

## ขอบเขต

แก้ singleton ของ Prisma Client ที่อยู่ข้ามการ generate ใน dev server และรีสตาร์ต dev server เพื่อโหลดโมเดล Product ที่มีอยู่แล้ว. ไม่แก้ schema, migration หรือข้อมูลสินค้า

## ผลตรวจ

- generated Prisma Client มี delegate `product`; รัน `prisma generate` สำเร็จ
- TypeScript, ESLint และ production build ผ่าน
- รีสตาร์ต dev server พอร์ต 5000 แล้ว; `/products` ตอบ 307 ไปหน้า Login เมื่อยังไม่ลงชื่อเข้าใช้
- รอทดสอบรายการสินค้าด้วยบัญชีที่ล็อกอิน

## ⚠️ ต้องทดสอบโดยคุณ

หลังแก้ เปิด `/products` ด้วยบัญชีที่ล็อกอิน; ผลที่ควรเห็นคือรายการ `MED-TAB-0001` และ `MED-CAP-0001` โดยไม่มี Runtime Error
