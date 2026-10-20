# TASK-290 — สิทธิ์ตาม Role — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ R1). แผน .jarvis/PLAN.md รอบ 2. ตามลำดับเจ้าของ: ทำทุกหน้าก่อนแล้วค่อยลดสิทธิ์.

## กฎที่ใช้

- Sales เห็นเฉพาะลูกค้าในเขตที่ตนเป็นสมาชิก (sales_territory_sales): รายชื่อ/รายละเอียดลูกค้า, ตัวเลือกลูกค้าในฟอร์ม, คำสั่งซื้อ, ใบเสนอราคา, ติดตามลูกค้า, ใบแจ้งหนี้, เอกสารลูกค้า, รายงานยอดขาย. สร้างคำสั่งซื้อ/ใบเสนอราคา/การติดตามให้ลูกค้านอกเขตไม่ได้ (403).
- Manager เห็นทั้งบริษัท (ค่าแนะนำ OPEN-01).
- ต้นทุน: จัดซื้อ (ใบสั่งซื้อ) อ่านได้เฉพาะ Admin/CFO; มูลค่าคลังเฉพาะ Admin/CFO (เดิม).
- การเงิน: ค่าใช้จ่าย และรายงานการเงิน อ่านได้ Admin/CFO/Manager; วางบิล Sales เห็นเฉพาะเขต.
- ผู้ใช้งาน/Audit Logs/ตั้งค่า: Admin (เดิม).

## ไฟล์

- src/server/access/scope.ts (customerScope, assertCustomerInScope, allowRead), src/config/access.ts (PAGE_ROLES, canSeePage), requirePage ใน src/server/auth/current-user.ts.
- ใช้ใน operations (orderRead/options/createOrder), quotes, billing, follow-ups, reports/sales, customers/service+handler, customers/documents, purchasing (allowRead), expenses (allowRead), reports/finance (allowRead).
- หน้า: layout requirePage สำหรับ /purchases, /expenses, /reports/finance; Sidebar หลักซ่อนเมนูตาม canSeePage และเมนูจัดซื้อของ Manager พาไปค่าใช้จ่าย; Side รองจัดซื้อแสดงตามสิทธิ์.
- Tests: scripts/test-access.mjs 4 ผ่าน; ปรับ fixture/ความคาดหวังใน test-purchasing, test-expenses (Sales อ่านไม่ได้), test-quotes/test-follow-ups/test-linked-operations (Sales อยู่ในเขตของลูกค้า), test-reports (สถานะรอบตรวจนับใหม่), test-customer-documents.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

ปิดภายหลัง: แดชบอร์ดหน้าแรกแยกตาม Role (TASK-301), ตัวกรองจังหวัด/เขตในหน้าลูกค้าตามเขตของ Sales (TASK-307).

⚠️ ต้องทดสอบโดยคุณ: ตั้ง Sales A อยู่เขต ก (ตั้งค่า > เขตขาย) → Login Sales A: หน้าลูกค้าเห็นเฉพาะลูกค้าเขต ก; สร้างคำสั่งซื้อมีเฉพาะลูกค้าเขต ก; รายงานยอดขาย/วางบิลเห็นเฉพาะเขต ก; เมนู จัดซื้อ & ค่าใช้จ่าย และรายงานการเงินไม่แสดง (เปิด URL ตรงถูกพากลับหน้าแรก) → Login Manager: เห็นลูกค้าทุกเขต เมนูจัดซื้อพาไปหน้าค่าใช้จ่าย ใบสั่งซื้อเปิดไม่ได้ → Login CFO: เห็นจัดซื้อ ค่าใช้จ่าย รายงานการเงิน.
