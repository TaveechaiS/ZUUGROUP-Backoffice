# TASK-161 — รายละเอียดสินค้าครบ

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: หน้าreadonlyทุกช่อง3กล่องพร้อมลิงก์กลับแล้ว. legacyย้ายเป็นsrc/components/products/product-detail-legacy.tsxเพื่อไม่exportพิเศษในNextpage. ESLint/diff/SSRfixtureตรวจหัวข้อ/ค่าเดิม/ไม่มีform-input-detailsผ่าน. TypeScriptยังติด3errorเดิมของPrismaในusersroute/prisma.ts ไม่มีerrorใหม่. รอตรวจbrowser.

1. บันทึกACTIVE/Specs/Plan.
2. แชร์sectionsจากproduct-create-preview.tsx และสร้างproduct-detail-preview.tsx ดูทุกกล่อง/ช่องแบบreadonly ข้อมูลมีจริงอ่านRouteData ช่องใหม่—.
3. products/[id]/page.tsxใช้detailใหม่และเก็บlegacyเดิม; admin-shell.tsxเปิดchildrenเฉพาะรายละเอียดสินค้า (ไม่create/stock).
4. ตรวจESLint/renderลำดับ/ค่าจริง/ช่องว่าง/diff. คงauth/notFound ไม่API/DB.

ตรวจรับ: กดแถวสินค้าเข้า/[รหัส] เห็นครบ3กล่องและช่องตามเพิ่มสินค้า ค่ารหัส/ชื่อ/หมวด/หน่วย/ขายเดิมตรง; ใหม่—. กลับรายการได้ จอเล็กไม่ล้น ไม่มีการบันทึกหรือแก้ข้อมูล.
