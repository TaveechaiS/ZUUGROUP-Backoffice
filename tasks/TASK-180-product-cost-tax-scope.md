# TASK-180 — ต้นทุนตอนรับเข้า ภาษีตอนทำเอกสาร

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ขอบเขตที่เจ้าของยืนยัน

ถอนราคาต้นทุนและภาษีจากหน้าเพิ่มสินค้า ต้นทุนอยู่ขั้นรับสินค้าเข้า ภาษีอยู่ขั้นทำเอกสาร. ไม่ตั้ง7%ในข้อมูลหลักสินค้าใหม่ ไม่ลบค่าเก่าหรือเปลี่ยนstock/ต้นทุนล็อต.

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Task180 บันทึกการเปลี่ยนกฎก่อนโค้ด.
2. src/app/products/create/page.tsx และ[id]/page.tsx: ถอนสองหัวข้อและUIเฉพาะภาษี/ต้นทุน คงราคาขายและlayoutเดิม.
3. src/types/api/product-full.ts และserver/validation/product-full.ts: ถอนสองfieldจากcreatecontract validateเฉพาะราคาขาย; ส่งชื่อfieldที่เลิกใช้คืนunsupportedfield ไม่เงียบทิ้งข้อมูล.
4. docs/examples/TASK-177-product-example.mdและdocs/api/product-full.md: ชุดตัวอย่างไม่มีสองช่อง ระบุจุดกำหนดใหม่.
5. scripts/test-product-full.mjs: fixtureไม่มีสองช่อง ยืนยันcreate/readbackไม่มีสองค่าและvalidationรับไม่ส่ง/ปฏิเสธfieldเก่า. คงguardต้นทุนข้อมูลเก่าทดสอบด้วยfixturelegacyในtransaction. Integrationrollback/Storagecleanup, lint/type/diff.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: integration11กลุ่มผ่านกับDB/Storageจริง สร้างโดยไม่มีต้นทุน/ภาษีและอ่านกลับไม่มีสองfield, ส่งfieldเก่าปฏิเสธ, fileflow/duplicate/สิทธิ์/legacycostguardผ่าน. RollbackDBและลบfixturefilesแล้ว countsคงเดิม. ESLint/TypeScript/diffผ่าน ยังไม่ตรวจกรอกbrowser. ไม่schema/migration/ลบข้อมูล/commit/deploy.

เปิดเพิ่มสินค้า ต้องไม่มีต้นทุนและภาษี กรอกข้อมูลที่มีดาว/ราคาขายและบันทึกได้โดยไม่ถามภาษี เปิดรายละเอียดและรีเฟรชต้องเห็นข้อมูล/ไฟล์ตามเดิม. รอบนี้ยังไม่เพิ่มช่องใหม่ในรับเข้าหรือเอกสาร.
