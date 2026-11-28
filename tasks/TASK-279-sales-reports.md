# TASK-279 — รายงานยอดขาย 5 หน้า — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 "ok ลงมือทำได้"). แผนรวม .jarvis/PLAN.md Phase 3, ค่าแนะนำ R1–R3.

## ลำดับ / ไฟล์

1. Server: src/server/reports/sales.ts (+ range.ts, handler.ts). API: /api/reports/sales/[view] (summary|products|customers|sellers|details). API เดิม /api/reports/sales (หน้า legacy) คงไว้.
2. หน้า: /reports/sales/{summary,products,customers,sellers,details} ใช้ src/components/reports/{report-table,sales-report}.tsx (การ์ดตัวกรองช่วงวันที่ พ.ศ./ค้นหา, การ์ดยอดรวม 4 ช่อง, ตาราง Sortable + Pagination แบบหน้าสินค้า).
3. ตรวจ: scripts/test-reports.mjs (rolled back), Postman scripts/build-postman-promotions-reports.mjs.

## ข้อกำหนดที่ใช้

- นับเฉพาะคำสั่งซื้อ workflow สถานะ เสร็จสิ้น; วันที่ขาย = วันที่ตัดคลัง kind ขาย (Asia/Bangkok). ยกเลิก/ยังไม่เสร็จไม่นับ. ระบบยังไม่มีส่วนลดท้ายบิล จึงใช้ Σ(จำนวน×ราคา − ส่วนลดบรรทัด) รวม VAT; ก่อน VAT = ÷1.07 ปัด 2 ตำแหน่ง.
- ผู้ขาย = ผู้สร้างคำสั่งซื้อ. ช่วงเริ่มต้น วันที่ 1 ของเดือนนี้ถึงวันนี้; ไม่เกิน 366 วัน. ทุก Role ที่ login อ่านได้ (สิทธิ์รอบหลัง).

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- test-reports 8 ผ่าน (รวมรายงานคลัง TASK-280), test-quotes 11 ผ่าน, route test ผ่าน, tsc/eslint/next build ผ่าน. Postman local: รายงานยอดขาย 5 คำขอ.
- ข้อมูลจริงตอนนี้มีคำสั่งซื้อเสร็จสิ้น 1 ใบ.

ไม่ทำ: กำไร/ต้นทุนขาย, คืนสินค้า, ส่งออกไฟล์, จำกัดข้อมูลตาม Sales. หน้า legacy ยังเปิดได้ที่ /reports/sales/legacy แต่ไม่มีลิงก์จากหน้าสรุปแล้ว.

⚠️ ต้องทดสอบโดยคุณ: Login → รายงานยอดขาย → สรุปยอดขาย เห็นการ์ด คำสั่งซื้อ/จำนวน/ยอดรวม VAT/ก่อน VAT และแถววันที่ที่มี SO เสร็จสิ้น (วันที่ พ.ศ.) → เปลี่ยนช่วงวันที่เป็นเดือนก่อน ต้องขึ้น "ไม่มียอดขายในช่วงวันที่นี้" → ยอดขายตามสินค้า/ลูกค้า/ผู้ขาย ยอดรวมตรงกับการ์ด → รายละเอียดรายการขาย คลิกเลข SO เปิดคำสั่งซื้อได้; SO ที่ยกเลิกหรือยังไม่เสร็จไม่ปรากฏ.
