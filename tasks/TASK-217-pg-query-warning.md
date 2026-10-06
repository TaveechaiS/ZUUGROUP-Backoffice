# TASK-217 — pg query warning ใน Layout

IMPLEMENTED / WAITING_FOR_UAT

1. ทำซ้ำ product.findFirst(include relations) ใน READ ONLY transaction พร้อม trace-deprecation: พบ PgTransaction.performIO dispatch พร้อมกันภายใน Prisma.
2. เพิ่ม src/server/db/serialized-pg.ts ใช้ PrismaPg เดิมแต่คิว queryRaw/executeRaw ร่วมต่อ transaction. คงค่าคืน/error และรอคิวก่อน release เมื่อ commit/rollback. Pool queries/transaction อื่นยังทำงานแยกกัน.
3. src/server/db/prisma.ts ใช้ factory ใหม่และเปลี่ยน singleton version เพื่อไม่ค้าง adapter เก่าระหว่าง HMR.
4. scripts/test-serialized-pg.mjs ตรวจ concurrent reads/writes, error/recovery, release ordering, independent transactions โดยไม่ใช้ DB จริง.
5. ทำซ้ำการอ่าน DB แบบ READ ONLY ด้วย factory ใหม่ ตรวจ warning/result; ESLint/type/diff. ไม่แก้ schema/ธุรกิจ/UI หรือ generate Prisma ในงานนี้.

ไฟล์เอกสาร: ACTIVE, Specs, Plan, Task นี้. ผลลัพธ์: ไม่ dispatch query ซ้อนบน connection ของ transaction เดียว ไม่ซ่อน warning.

## ⚠️ ต้องทดสอบโดยคุณ

เปิดหน้าที่เคยแสดง error แล้วรีเฟรช รวมหน้ารายละเอียดสินค้าและเพิ่มสินค้า. ต้องโหลดข้อมูลเดิมได้ และไม่มี Calling client.query() when the client is already executing a query ใน Console/terminal. หาก HMR ยังแสดงข้อความเก่า ให้รีสตาร์ต dev server และตรวจใหม่.

## ผลตรวจ

ก่อนแก้ READ ONLY relation query ทำซ้ำ warning และ trace ถึง PgTransaction.performIO ได้. หลังแก้ DB READ ONLY 3รอบรวม relations/concurrent count-list ไม่พบ warning. Offline queue/ordering/error/recovery/drain/independent transactions ผ่าน; productsstock14 และ editpage ผ่าน. Scoped ESLint ผ่าน; TypeScript ยังติด generated route types และ generated Prisma details/codeGroupId ที่พบก่อนงานนี้ ไม่มี error ของ adapter ใหม่. ไม่ได้ตรวจใน browser.
