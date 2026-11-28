# TASK-295 — จัดแท็บหน้ารายการ — 15 ตุลาคม 2569

OWNER_APPROVED (15 ต.ค. 2569 "อนุมัติหมด"; "อันไหนที่มีอันเดียวก็เอาออกได้").

## ลำดับ / ไฟล์

1. เอาแถบแท็บออกจากหน้าที่มีแท็บเดียว: audit-logs, customers/documents, products/stock, settings/customer-options, settings/product-options, report-table (ทุกรายงาน; ยอดรวม/ส่งออก CSV คงอยู่แถวบนชิดขวา), products/stock/[warehouse] ที่ไม่ใช่ MAIN (แสดงเมื่อมี > 1 แท็บ).
2. customers, customers/territories: แสดงแถบแท็บเฉพาะผู้มีสิทธิ์เขียน (เห็นแท็บ ลบแล้ว); customers แท็บแรก "รายชื่อลูกค้า" → "ทั้งหมด".
3. /products: แท็บ ทั้งหมด / สินค้าใกล้หมด / สินค้าหมด / ลบแล้ว (Admin) ใช้พารามิเตอร์ stock / deleted ของ /api/inventory ที่มีอยู่.
4. /users: แท็บ ทั้งหมด / ใช้งานอยู่ / ระงับการใช้งาน / ลบแล้ว แทน dropdown สถานะ (เหลือค้นหา + บทบาท). navigation-only-tabs ปรับให้ตรง.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- route test, tsc, eslint, next build ผ่าน. หน้าจอจริงยังไม่ตรวจ.

⚠️ ต้องทดสอบโดยคุณ: /audit-logs, /customers/documents, /products/stock, /settings/customer-options, /reports/sales/... ไม่มีแถบแท็บ (ปุ่มส่งออก/ยอดรวมของรายงานยังอยู่ขวาบน); /products คลิก สินค้าใกล้หมด / สินค้าหมด รายการตรงกับป้ายสถานะ, Admin เห็นแท็บ ลบแล้ว และเห็นสินค้าที่ลบ, Sales ไม่เห็นแท็บนี้; /users แท็บ ระงับการใช้งาน เห็นเฉพาะผู้ใช้ที่ถูกระงับ ส่งออก CSV ได้ตามแท็บ; Login Sales เปิด /customers และ /customers/territories ไม่มีแถบแท็บ.

## เพิ่มเติม 15 ต.ค. 2569 — เอาปุ่มขวาแถบแท็บออกชั่วคราว (เจ้าของ: "เอาออกก่อน เดี๋ยวค่อยเอากลับมา")

- /users: ลบปุ่ม "ส่งออก CSV" และ "+ เพิ่มผู้ใช้งาน" (เพิ่มผู้ใช้ยังเข้าได้จาก Side รอง). API /api/users/export ยังอยู่.
- รายงานทุกหน้า (report-table): ลบปุ่ม "ส่งออก CSV" คงยอดรวมขวาบน. src/components/reports/csv.ts + test-csv ยังอยู่ ใช้ตอนเอากลับมา (ดูโค้ดเดิมได้จาก commit afe9401 / diff TASK-291).
- tsc, eslint, route test, next build ผ่าน.

⚠️ ต้องทดสอบโดยคุณ: /users และ /reports/... ไม่มีปุ่มส่งออก/เพิ่มด้านขวาบน; รายงานที่มียอดรวมยังแสดงยอดรวมขวาบน; เพิ่มผู้ใช้จาก Side รองได้.
