# TASK-282 — ค่าใช้จ่าย — 14 ตุลาคม 2569

OWNER_APPROVED (14 ต.ค. 2569 อนุมัติทุกข้อ, ค่าแนะนำ E1). แผน .jarvis/PLAN.md รอบ 2.

## ลำดับ / ไฟล์

1. DB: prisma/migrations/20261014_expenses/migration.sql — customer_options เพิ่ม kind expenseCategory + seed 6 หมวด (ค่าเดินทาง/ค่าขนส่ง/ค่าสาธารณูปโภค/ค่าวัสดุอุปกรณ์/ค่าบริการ/ค่าใช้จ่ายอื่น); expenses เพิ่ม expense_date/category_id/payee/created_by_id/cancel_reason + CHECK; ตาราง expense_files (RLS+REVOKE). scripts/setup-expenses.mjs (dry-run → apply, รันซ้ำไม่ซ้ำ). prisma/schema.prisma.
2. Server: src/server/expenses/{service,handler}.ts; nextDocumentCode เพิ่ม EX. ไฟล์เก็บใน bucket customer-attachments path expenses/<id>/<fileId> ตรวจชนิดไฟล์จากเนื้อหา (ใช้ตัวตรวจของลูกค้า).
3. API: /api/expenses, /api/expenses/[id] (DELETE = ยกเลิก), /api/expenses/[id]/files (POST multipart), /api/expenses/files/[id] (เปิดไฟล์).
4. หน้า: /expenses (แท็บสถานะ, ช่วงวันที่ พ.ศ./ค้นหา/หมวด, ยอดรวมบันทึกแล้ว), /expenses/create (Admin/CFO), /expenses/[id] (ดู/แก้ไข/ยกเลิก/แนบไฟล์เพิ่ม). ฟอร์ม src/components/expenses/expense-form.tsx.
5. เมนู: หลัก "จัดซื้อ & ค่าใช้จ่าย"; Side รองเพิ่ม ค่าใช้จ่าย / เพิ่มค่าใช้จ่าย. หมวดจัดการได้ที่ ตั้งค่า > ข้อมูลพื้นฐานลูกค้า กลุ่ม ค่าใช้จ่าย (shortcut: เก็บใน customer_options).
6. ตรวจ: scripts/test-expenses.mjs (rolled back, mock storage), route test, Postman.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- DB apply แล้ว (expenses 0, หมวด 6). test-expenses 7 ผ่าน, route test ผ่าน, tsc/eslint ผ่าน. Postman local ค่าใช้จ่าย 6 คำขอ.

⚠️ ต้องทดสอบโดยคุณ: Login Admin → จัดซื้อ & ค่าใช้จ่าย → เพิ่มค่าใช้จ่าย → รายการ "ค่าน้ำมัน", หมวด ค่าเดินทาง, 1,250.50, แนบ PDF ใบเสร็จ → บันทึก ยืนยัน → ได้ EX-2569-0001 หน้ารายละเอียดมีไฟล์ กดเปิดได้ → รายการแสดงยอดรวมบันทึกแล้ว 1,250.50 → แก้จำนวนเป็น 900 → ยกเลิกพร้อมเหตุผล ยอดรวมไม่นับ; Login CFO เพิ่มได้; Login Sales เห็นรายการแต่ไม่มีเมนูเพิ่ม และเปิด /expenses/create แล้วถูกพากลับรายการ.
