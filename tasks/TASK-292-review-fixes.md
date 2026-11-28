# TASK-292 — แก้ผลรีวิว EDITH รอบ TASK-277–291 — 15 ตุลาคม 2569

OWNER_APPROVED (15 ต.ค. 2569 "ทำทั้งหมด").

## ลำดับ / ไฟล์

1. ไฟล์ค่าใช้จ่าย: `readExpenseFile(actor, fileId)` เช็ค Admin/CFO/Manager (src/server/expenses).
2. ไฟล์ลูกค้า: `readCustomerFile` รับ actor และกรอง `customerScope` — Sales นอกเขตได้ 404 (src/server/customers/full.ts, handler.ts).
3. รับชำระ: ล็อกแถวใบแจ้งหนี้ก่อน แล้วรวมยอดชำระในคำสั่งแยก (เห็นรายการที่ commit ก่อนหน้า) กันรับชำระเกินยอดเมื่อยิงพร้อมกัน; ใช้กับยกเลิกบิลด้วย. วันที่รับชำระต้องไม่ก่อนวันออกใบแจ้งหนี้ (src/server/billing/service.ts).
4. `/api/inventory?view=options&scope=receive` เฉพาะ Admin (มีต้นทุน PO) — หน้าที่เรียกเป็นงานเขียน Admin ทั้งหมด.
5. รายการรอวางบิล (`view=uninvoiced`) เฉพาะ Admin/CFO.
6. CSV: ค่าที่ขึ้นต้น `= + - @` และไม่ใช่ตัวเลข เติม `'` นำหน้า (src/components/reports/csv.ts).
7. อนุมัติคำขอเพิ่มลูกค้าที่ค้าง `pending` (มีผู้ตรวจแล้วแต่สร้างลูกค้าไม่สำเร็จ) กดอนุมัติซ้ำได้ (src/server/customers/requests.ts).
8. `likeOf` escape `\ % _` จริง (src/server/reports/range.ts).
9. ตรวจรูปแบบ UUID เต็มก่อน cast `::uuid` → 404 แทน 503 (billing, expenses, follow-ups, promotions, purchasing, quotes, stock-counts, operations, products/next-sequence).
10. ลบ src/app/reports/{finance,inventory,sales}/legacy (ไม่มีลิงก์ชี้).

เทสต์เพิ่ม: test-expenses (Sales เปิดไฟล์ 403), test-customer-full (Sales นอกเขต 404), test-billing (uninvoiced Sales 403, รับชำระก่อนวันออกบิล 400), test-csv (กันสูตร).

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- 16 ชุดเทสต์ผ่าน (csv, billing, expenses, customer-full, customer-requests, customer-documents, reports, follow-ups, promotions, purchasing, quotes, stock-counts, access, finance, linked-operations, route-pages); tsc/eslint/next build ผ่าน.

ค้าง (ไม่แก้รอบนี้): migration 20261014 ไม่มี backfill — ก่อน deploy DB ใหม่ต้องเช็คว่าไม่มีแถวเก่าที่คอลัมน์ใหม่เป็น NULL; CSV ตัด 10,000 แถวไม่แจ้งผู้ใช้; ปัดเศษส่วนลดรายบรรทัดในรายงานยอดขาย; ไฟล์ค่าใช้จ่ายค้างใน storage ถ้า commit ล้ม; ไม่มีเทสต์ยิงรับชำระพร้อมกันจริง.

⚠️ ต้องทดสอบโดยคุณ: Login Sales → เปิดลิงก์ไฟล์ค่าใช้จ่าย (/api/expenses/files/<id>) ได้ข้อความไม่มีสิทธิ์; เปิดไฟล์เอกสารลูกค้านอกเขตได้ "ไม่พบไฟล์"; Admin → ใบแจ้งหนี้ → รับชำระลงวันที่ก่อนวันออกบิล ได้ข้อความเตือน; รายงานใดก็ได้ ค้นหา `%` ต้องไม่แสดงทุกแถว; ส่งออก CSV ที่มีชื่อขึ้นต้น `=` เปิดใน Excel เห็นเป็นข้อความไม่ใช่สูตร.
