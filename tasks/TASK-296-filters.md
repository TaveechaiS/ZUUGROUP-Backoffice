# TASK-296 — ตัวกรองทุกหน้ารายการ — 15 ตุลาคม 2569

OWNER_APPROVED (15 ต.ค. 2569: ทำทั้ง 2 ระยะ; ช่องค้นหาเป็นช่องแรกเสมอ, ช่องช่วงวันที่อยู่ท้ายสุดของกล่องตัวกรอง; ทุกหน้ามีกล่องตัวกรอง).

## ระยะ 1 — UI (API รองรับแล้ว)

1. report-table: ลำดับ ค้นหา → ตัวกรองอื่น → ช่วงวันที่.
2. /products: ตัวกรองสถานะสินค้า (ใช้งาน/ปิดใช้งาน) `status=ACTIVE|INACTIVE`.
3. /settings/customer-options, /settings/product-options: ตัวกรองแสดงรายการปิดใช้งาน (`includeInactive`).

## ระยะ 2 — API + UI (MARK แล้ว VISION)

- ช่วงวันที่ `from`/`to` (ไม่ส่ง = ไม่กรอง): orders, quotes, purchases, billing, expenses, customer-requests, follow-ups, audit-logs, ประวัติเติมสต็อก (receipt-items).
- เขตขาย `territoryId` / ผู้ขาย `sellerId`: orders, quotes, billing; ตัวเลือกส่งมากับ list (ตามสิทธิ์; Sales ไม่แสดงตัวกรองเขต/ผู้ขาย).
- คลัง `warehouseCode`: stock-counts. ช่องทาง `channel`: follow-ups. `search`: รายงานสรุปยอดขาย.
- /products/stock: กล่องตัวกรอง ค้นหา + หมวดหมู่ + ช่วงวันที่รับเข้า.
- เทสต์ API ตัวกรองใหม่.

ไม่ทำ: เปลี่ยน DB schema, ตัวกรองใน API ที่ไม่ได้ระบุ.

## ผล — IMPLEMENTED / WAITING_FOR_UAT (15 ต.ค. 2569)

- ระยะ 1: report-table เรียง ค้นหา → ตัวกรอง → ช่วงวันที่; settings options 2 หน้า ตัวกรองสถานะ (ทั้งหมด / ใช้งานเท่านั้น). ไม่ทำตัวกรองสถานะสินค้า: ระบบไม่มีที่ตั้งสินค้าเป็น INACTIVE ตัวกรองจะไม่มีผล.
- ระยะ 2 API: optionalRange (src/server/reports/range.ts), salesFilters/salesFilterOptions (src/server/access/scope.ts). orders/quotes (created_at), billing (issue_date) + territoryId/sellerId + filters (ไม่ใช่ Sales; Sales ส่งมาจะถูกเมิน), purchases (order_date), customer requests (submitted_at), follow-ups (contacted_on + channel), audit-logs (occurredAt), receipt-items (created_at + ค้นเลขใบรับเข้า), stock-counts warehouseCode, sales summary search. expenses ใช้ reportRange เดิม (ค่าเริ่มต้นเดือนนี้).
- ระยะ 2 UI: orders/quotes/billing (ค้นหา เขตขาย ผู้ขาย วันที่), purchases, customers/requests, customers/dashboard (ช่องทาง), audit-logs, stock-counts (คลัง), products/stock (กล่องตัวกรองใหม่: ค้นหา หมวดหมู่ วันที่), expenses (ย้ายวันที่ไปท้าย), สรุปยอดขาย (ค้นหา).
- เทสต์ 17 ชุด + tsc + eslint + next build ผ่าน. หน้าจอจริงยังไม่ตรวจ.

ข้อสังเกต: ใบเสนอราคากรองตามวันที่สร้าง (ไม่ใช่วันใช้ได้ถึง); /products/stock ดึงหมวดหมู่จาก view=products ถ้าโหลดไม่ได้ช่องหมวดหมู่เหลือ "ทั้งหมด".

⚠️ ต้องทดสอบโดยคุณ: ทุกหน้ารายการช่องแรกคือ ค้นหา ช่องท้ายคือช่วงวันที่; ตั้งแต่วันที่ > ถึงวันที่ ต้องขึ้นข้อความผิดพลาด; Admin เปิด /orders /quotes /billing เลือกเขตขาย/ผู้ขาย ได้รายการตรง, Sales ไม่เห็นสองช่องนี้; /customers/dashboard เลือก โทร เหลือเฉพาะโทร; /stock-counts เลือกคลัง; /products/stock ค้นเลขล็อต/เลือกหมวด/ช่วงวันที่รับเข้า; /audit-logs ใส่ช่วงวันที่แล้วกดค้นหา; /reports/sales/summary พิมพ์ชื่อลูกค้า ยอดรายวันเปลี่ยนตาม; /expenses เปลี่ยนเป็นเดือนก่อนเห็นรายการเดือนก่อน.
