# TASK-284 — รายงานการเงิน — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ F1). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. Server: src/server/reports/finance.ts (aging | payments | expenses), handler รองรับ finance. API /api/reports/finance/[view]; API เดิม /api/reports/finance คงไว้ให้หน้า legacy.
2. หน้า: /reports/finance → /reports/finance/aging; /reports/finance/{aging,payments,expenses} ใช้ src/components/reports/{report-table,finance-report}.tsx; หน้าเดิมย้ายไป /reports/finance/legacy. ReportTable เพิ่ม totalLabel แสดง totalAmount.
3. เมนู: รายงานการเงิน แสดงใน Side หลัก + Side รอง อายุลูกหนี้/รับชำระ/ค่าใช้จ่ายตามหมวด.
4. ตรวจ: scripts/test-finance.mjs (rolled back), Postman.

## ข้อกำหนดที่ใช้

- อายุลูกหนี้นับ ณ วันนี้ จากวันครบกำหนด เฉพาะใบ ค้างชำระ/ชำระบางส่วน หักรับชำระที่ไม่ถูกยกเลิก.
- ไม่ทำกำไรขาดทุน/งบการเงิน.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- test-finance 3 ผ่าน, tsc/eslint ผ่าน. Postman local รายงานการเงิน 3 คำขอ.

⚠️ ต้องทดสอบโดยคุณ: หลังทดสอบ TASK-283 (มีใบแจ้งหนี้และรับชำระ) → รายงานการเงิน → อายุลูกหนี้ เห็นลูกค้าและยอดค้างตามช่วงอายุ ยอดรวมตรงกับหน้าวางบิล → รับชำระ เห็นรายการที่บันทึก คลิกเลขใบแจ้งหนี้เปิดได้; รายการที่ยกเลิกไม่แสดง → ค่าใช้จ่ายตามหมวด ยอดรวมตรงกับหน้าค่าใช้จ่ายในช่วงเดียวกัน.
