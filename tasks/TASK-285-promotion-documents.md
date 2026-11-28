# TASK-285 — ผูกโปรโมชันกับใบเสนอราคา/คำสั่งซื้อ — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 "ok" + อนุมัติทุกข้อ, ค่าแนะนำ P1–P2). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_promotion_documents/migration.sql — sales_order_lines/quotation_lines เพิ่ม is_gift (+ warehouse_id ในใบเสนอราคา), unique เปลี่ยนเป็น (เอกสาร, สินค้า, is_gift), CHECK ของแถมราคา 0; sales_orders/quotations เพิ่ม promotion_id/promotion_snapshot/bill_discount. scripts/setup-promotion-documents.mjs. prisma/schema.prisma.
2. Server: src/server/promotions/apply.ts (evaluatePromotion ตรวจสถานะ/ช่วงวันที่/ขั้นต่ำจากสินค้าที่ร่วม คืนของแถม ส่วนลดท้ายบิล สำเนาเงื่อนไข). src/server/operations/service.ts — allocate รองรับบรรทัดของแถม (ราคา 0, จองจากคลังที่โปรกำหนด FEFO ไม่ใช้เกณฑ์อายุขาย), createOrder/edit รับ promotionId, amount = รวมบรรทัด − ส่วนลดท้ายบิล. src/server/quotes/service.ts — create/edit รับ promotionId, convert พาของแถมและส่วนลดตามใบเสนอราคา (ไม่คำนวณใหม่). src/server/reports/sales.ts ไม่นับบรรทัดของแถม และกระจายส่วนลดท้ายบิลตามสัดส่วนบรรทัด.
3. UI: document-form เลือกโปรสถานะใช้งาน (โหลด /api/promotions?status=ใช้งาน); Totals แสดงส่วนลดท้ายบิล; หน้ารายละเอียด QT/SO แสดงโปรโมชัน ป้ายของแถม (StatusBadge กลาง).
4. ตรวจ: scripts/test-promotion-documents.mjs 5 ผ่าน; regression test-quotes 11, test-reports 8, test-billing 6, test-finance 3 ผ่าน; Postman เอกสารขายเพิ่ม promotionId.

## ข้อกำหนดที่ใช้

- 1 โปรต่อเอกสาร; ของแถมจำนวนตามโปร ×1; ส่วนลด% คิดจากมูลค่าสินค้าที่ร่วม; ส่วนลดบาทไม่เกินมูลค่าสินค้าที่ร่วม.
- ใบเสนอราคาไม่จองสต็อก จึงตรวจของแถมพอเมื่อแปลงเป็นคำสั่งซื้อ.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

⚠️ ต้องทดสอบโดยคุณ: สร้างโปร "ซื้อ A ครบ 3 แถม A 1 (คลังการตลาด)" → รับเข้า A ในคลังการตลาดอย่างน้อย 1 → สร้างคำสั่งซื้อ A 3 ชิ้น เลือกโปร → บันทึก → รายละเอียดมีบรรทัด A ป้าย ของแถม ราคา 0 ล็อตจองจากคลังการตลาด ยอดรวมไม่เพิ่ม → สร้างคำสั่งซื้อ A 2 ชิ้นเลือกโปรเดิม ต้องขึ้น "ยังไม่ถึงเงื่อนไขโปรโมชัน" → โปรส่วนลด 10% เห็นแถว ส่วนลดท้ายบิล (โปรโมชัน) → ใบเสนอราคาเลือกโปร แล้วแปลงเป็นคำสั่งซื้อ ของแถมตามมา → ปิดคำสั่งซื้อ รายงานยอดขายไม่นับของแถม.
