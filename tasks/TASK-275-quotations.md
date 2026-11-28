# TASK-275 — ใบเสนอราคาจริง (DB/API/หน้า) + ส่วนลดในคำสั่งซื้อ — 7 ตุลาคม 2569

OWNER_APPROVED. เจ้าของสั่ง "ทำใบเสนอราคาต่อ" และตอบ (7 ต.ค. 2569):
- อนุมัติ: Sales สร้าง → รออนุมัติ → Manager อนุมัติ/ไม่อนุมัติ/ส่งกลับ/แก้ได้ เหมือนคำสั่งซื้อ; Admin สร้างเองข้าม Manager (อนุมัติทันที).
- ส่วนลด: บาทต่อรายการ ราคารวม VAT; คำสั่งซื้อเพิ่มส่วนลดบาทต่อรายการให้ตรงกัน.
- ใช้ได้ถึง: ค่าเริ่มต้น 30 วัน แก้ได้; เลยวันแล้วแสดง หมดอายุ และแปลงเป็นคำสั่งซื้อไม่ได้.
- แปลง: ใบอนุมัติแล้วกด "สร้างคำสั่งซื้อ" ปุ่มเดียว → สร้าง SO จากรายการเดิม (ราคา/ส่วนลดตามใบเสนอราคา) จองสต็อกตอนนั้น; ใบเสนอราคาไม่จองสต็อก; แปลงได้ครั้งเดียว เก็บอ้างอิงสองทาง.
- เลขที่ QT-ปีพ.ศ.-0001 ระบบออกเอง เริ่มใหม่ทุกปี.
- Design ตามหน้าลูกค้า/สินค้า (เหมือน /orders TASK-274).

ลำดับ: บันทึก → migration (quotations เพิ่ม workflow/valid_until/territory/creator/approver/return_reason, ตาราง quotation_lines + RLS/REVOKE, sales_order_lines.discount, sales_orders.quotation_id unique) + Prisma schema + setup script dry-run/apply → server src/server/quotes (create/edit/approve/reject/return/cancel/convert, read list/detail) ใช้ command/idempotency/audit เดียวกับคำสั่งซื้อ → /api/quotes แทน records handler → ฟอร์มคำสั่งซื้อเพิ่มส่วนลด → หน้า /quotes รายการ/สร้าง/รายละเอียด → tests (rolled-back) + route test + Postman local → lint/tsc/build.

ไม่ทำ: PDF, ของแถม, สิทธิ์มองเห็นของ Sales/Manager, แจ้งเตือน. ใบเสนอราคาเดิม (records แบบหัวเอกสาร) แสดงอ่านอย่างเดียวเป็น "เอกสารเดิม".

ผล: IMPLEMENTED / WAITING_FOR_UAT (7 ตุลาคม 2569).
- DB (apply ลง Supabase แล้วผ่าน scripts/setup-quotations.mjs, dry-run ก่อน; ข้อมูลเดิม quotations/orders = 0): migration 20261007_quotations — quotations เพิ่ม workflow_managed/valid_until/territory_id/created_by_id/approved_by_id/return_reason + CHECK สถานะ; ตาราง quotation_lines (ราคา/ส่วนลด, RLS + REVOKE anon/authenticated); sales_order_lines.discount + CHECK; sales_orders.quotation_id unique (แปลงได้ครั้งเดียว). Prisma schema + generate.
- Server: src/server/quotes/{service,handler}.ts — create/edit/approve/reject/return/cancel/convert + list/detail (displayStatus หมดอายุ คำนวณจาก valid_until, กรองได้). ใช้ command/idempotency/audit เดียวกับคำสั่งซื้อ. /api/quotes แทน records handler เดิม.
- คำสั่งซื้อ: รับ discount ต่อบรรทัด, สินค้าเดิมคงราคาเดิมเมื่อแก้ (ราคาจากใบเสนอราคาไม่หาย), createOrder ใช้ร่วมกับ convert, อ่าน quotationCode. เลขเอกสาร SO/QT ใช้ nextDocumentCode ตัวเดียว.
- แก้บั๊ก: substring(code FROM $n) ส่งพารามิเตอร์เป็นข้อความ Postgres ตีความเป็น regex → ใบที่สองได้ 0010; cast ::int แล้ว (กระทบเลข SO ของ TASK-274 และเลขใบรับเข้า GR เดิมด้วย — ใน DB ยังไม่มีเลขรูปแบบ GR-2569-/SO- จึงยังไม่เกิดผลเสีย).
- หน้า: /quotes รายการ (แท็บ ทั้งหมด/รออนุมัติ/ส่งกลับแก้ไข/อนุมัติ/ไม่อนุมัติ/ยกเลิก/หมดอายุ), /quotes/create, /quotes/[id] (ปุ่มตามบทบาท, สร้างคำสั่งซื้อ, ลิงก์ SO). ฟอร์ม/ชิ้นส่วนกลางย้ายไป src/components/sales/document-{form,ui}.tsx ใช้ร่วมกับ /orders; มีส่วนลด, ใช้ได้ถึง (ปฏิทิน พ.ศ.), สรุป VAT. หน้าคำสั่งซื้อแสดงส่วนลด/สรุป VAT/ลิงก์ใบเสนอราคา. admin-shell เปิด /quotes; เมนูสร้างใบเสนอราคาให้ Sales/Admin; create layout requireActiveUser.
- Tests: scripts/test-quotes.mjs 11 checks ผ่าน (rolled back, จำนวนแถวไม่เปลี่ยน); route test 81 ผ่าน (เพิ่มเงื่อนไข quotes); tsc/eslint/next build ผ่าน.
- Postman local: scripts/build-postman-sales-documents.mjs เพิ่มโฟลเดอร์ ใบเสนอราคา 9 + คำสั่งซื้อ 8 คำขอ (Cloud ยังไม่ sync).

คำถามค้าง: คำสั่งซื้อที่แปลงจากใบเสนอราคา (Manager อนุมัติแล้ว) ตอนนี้เข้าสถานะ รอตรวจ ต้องให้ Manager อนุมัติคำสั่งซื้ออีกรอบ — ต้องการข้ามเป็น อนุมัติ ทันทีหรือไม่.

⚠️ ต้องทดสอบโดยคุณ: Login Admin → ใบเสนอราคา → สร้าง: ช่องเลขที่อ่านอย่างเดียว, ใช้ได้ถึง = วันนี้+30 (พ.ศ.), เพิ่มสินค้า+ส่วนลด ยอด/VAT เปลี่ยน → บันทึก ได้ QT-2569-0001 สถานะ อนุมัติ → หน้ารายละเอียดกด สร้างคำสั่งซื้อ → ไป SO ที่มีส่วนลดเดิมและลิงก์กลับ QT; ใบเดิมกดสร้างซ้ำไม่ได้; แท็บ หมดอายุ แสดงใบที่เลยวัน; คำสั่งซื้อสร้างเองมีช่องส่วนลด.

ปรับตามเจ้าของ (7 ต.ค. 2569):
- "ไม่ต้องแยกกัน ใบเสนอคือราคาสินค้าใหม่ที่ตกลงกัน": คำสั่งซื้อที่แปลงจากใบเสนอราคาเข้าสถานะ อนุมัติ ทันที ผู้อนุมัติ = ผู้อนุมัติใบเสนอราคา (createOrder approvedById). test-quotes ตรวจสถานะ/ผู้อนุมัติแล้ว (11 ผ่าน). ข้อความยืนยันในหน้าและ Postman ปรับตาม.
- ลบ fixture T092 ที่ค้าง (ยกเว้น users ตามสั่ง): สมาชิกเขต 2, ลูกค้า 2, เขต 2, สินค้า ZZ-ZZ-9999 1 — ไม่มีล็อต/ใบรับ/คำสั่งซื้อผูก. รัน test-linked-operations ใหม่: ไม่ชน fixture แล้ว และเก็บกวาดของตัวเองสำเร็จ แต่ล้มที่ assertion เดิม TASK094 (คาดว่าสินค้าไม่มีล็อตไม่อยู่ในคลัง MAIN) ซึ่งขัดกับพฤติกรรมที่ checkpoint 22721c8 ตั้งใจให้ MAIN แสดงทุกสินค้า — test เก่าไม่ใช่ผลจากงานนี้ รอเจ้าของตัดสิน.

Postman Cloud (7 ต.ค. 2569): PAUSED_BY_OWNER — connector Postman ไม่ได้โหลดใน session นี้, เจ้าของให้เว้นไว้ก่อน. ไฟล์ local พร้อม 8 โฟลเดอร์; ทางสำรอง scripts/sync-postman-cloud.mjs (ต้องมี POSTMAN_API_KEY). ค้าง: collection variables บน Cloud มี loginEmail/loginPassword ของ Admin — เสนอย้ายไป Environment ส่วนตัว (เจ้าของยังไม่ตัดสิน).
