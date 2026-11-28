# TASK-297 — ช่องช่วงวันที่ในตัวกรองเป็นช่องเดียว — 16 ตุลาคม 2569

OWNER_APPROVED (16 ต.ค. 2569 "ปรับช่วงวันที่ให้เสร็จ"; ให้ icon ปฏิทิน SVG มาเอง เปลี่ยนสีได้).

## ลำดับ / ไฟล์

1. CalendarIcon ใน src/components/icons/status-icons.tsx (path จากเจ้าของ, stroke=currentColor).
2. src/components/ui/date-range-input.tsx: ช่องเดียว h-10 ป้าย "ช่วงวันที่", icon ปฏิทิน, แสดง วว/ดด/ปป – วว/ดด/ปป (พ.ศ. 2 หลัก), คลิกซ้าย/ขวาเปิดปฏิทิน ตั้งแต่/ถึง (min/max ผูกกัน), ปุ่ม ✕ ล้าง (ปิดใน expenses และรายงานที่มีค่าเริ่มต้นเดือนนี้).
3. แทนช่องวันที่คู่ในกล่องตัวกรอง 10 ที่: report-table, orders, quotes, billing, purchases, customers/requests, customers/dashboard, audit-logs, products/stock, expenses; ปรับ grid ให้พอดี.

ไม่แตะ: DateInput ในฟอร์มสร้าง/แก้ไขเอกสาร.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- tsc, eslint, route test, next build ผ่าน. หน้าจอจริงยังไม่ตรวจ.

⚠️ ต้องทดสอบโดยคุณ: /products/stock, /orders, /reports/sales/details → ช่อง ช่วงวันที่ สูงเท่าช่องอื่น มี icon ปฏิทิน; ยังไม่เลือกแสดง วว/ดด/ปป – วว/ดด/ปป; กดฝั่งซ้ายเลือกวันเริ่ม กดฝั่งขวาเลือกวันสิ้นสุด แสดงเช่น 01/10/69 – 16/10/69 และรายการกรองตาม; กด ✕ กลับไปทั้งหมด; /expenses และรายงานไม่มี ✕ (ค่าเริ่มต้นเดือนนี้); /audit-logs เลือกช่วงแล้วกดค้นหา; มือถือไม่ล้นจอ; Firefox/Safari ลองกดเปิดปฏิทินได้.

## เพิ่มเติม 16 ต.ค. 2569 — กล่องตัวกรองทุกหน้าแบบหน้าลูกค้า (เจ้าของส่งภาพ /customers: "ทำกล่องให้เท่าอันนี้แต่ค้นหาทำให้ใหญ่สุด")

- form-classes.ts: filterGridClass(others) — ค้นหา 2fr ช่องอื่น 1fr เท่ากัน (xl), sm 2 / lg 3 คอลัมน์, มือถือ 1 คอลัมน์.
- ใช้กับ 19 หน้ารายการ + report-table; ช่องค้นหามี SearchIcon + type="search" ทุกหน้า; label มี min-w-0.
- DateRangeInput กว้างเต็มช่อง (w-full) เท่า dropdown อื่น.
- audit-logs ปุ่มค้นหาอยู่ในคอลัมน์ของตัวเอง สูง h-10.
- tsc, eslint, route test, next build ผ่าน.

⚠️ ต้องทดสอบโดยคุณ: เปิด /orders, /products/stock, /expenses, /audit-logs, /reports/sales/details เทียบกับ /customers → ช่องค้นหากว้างสุดมีแว่นขยาย ช่องอื่นกว้างเท่ากัน สูงเท่ากัน ช่องช่วงวันที่ไม่ล้น; ย่อจอ/มือถือเรียงลงสวย.
