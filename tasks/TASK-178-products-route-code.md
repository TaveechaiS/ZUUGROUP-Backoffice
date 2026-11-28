# TASK-178 — รวมโค้ดเฉพาะหน้าสินค้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ขอบเขตและลำดับ

1. บันทึกACTIVE/Specs/Planตามคำขอเจ้าของ: page/layoutเก็บโค้ดเฉพาะหน้า ส่วนกลางใช้componentเดิม.
2. src/app/products/create/page.tsx: แทนlegacyฟอร์มที่Shellเคยข้ามด้วยฟอร์มสร้างครบข้อมูล พร้อมฟังก์ชันpicker/ชื่อ/แนบไฟล์ในไฟล์เดียว.
3. src/app/products/[id]/page.tsx: โค้ดอ่านรายละเอียด/Accordion/localeditในpageโดยตรง คงlayoutguard/dataเดิม.
4. src/components/layout/admin-shell.tsx: ถอนimport/renderProductCreatePreview แล้วแสดงchildrenของroutecreate.
5. ลบsrc/components/products/product-create-preview.tsx, product-detail-preview.tsx, product-detail-legacy.tsx, product-option-combobox.tsx, product-name-combobox.tsx, product-attachment-field.tsxหลังย้ายและตรวจไม่มีimports. คงcomponentร่วมProductStockListที่ใช้หลายrouteและSuccessAlert/RouteDataProvider.
6. Prettierเฉพาะไฟล์เปลี่ยน ตรวจESLint/TypeScript/buildและdiff/imports. ไม่มีAPI/DBเปลี่ยน ไม่ต้องรันintegrationที่เขียนDBซ้ำเพราะย้ายfrontendเท่านั้น.

## ผลลัพธ์และตรวจรับ

ย้ายโค้ดครบแล้ว ถอนcomponentเฉพาะหน้าหกไฟล์ ตรวจไม่เหลือimportsเก่า. AdminShellใช้childrenสำหรับcreateแล้ว และpageexportเฉพาะdefault. Prettier/ESLint/TypeScript/production build/git diff --checkผ่าน. ไม่ได้ทดสอบกรอกผ่านbrowserในรอบย้ายโค้ดนี้; ไม่แก้API/DB/commit/deploy.

เปิดpageไฟล์เดียวเห็นโค้ดของหน้านั้นครบ ส่วนย่อยเป็นฟังก์ชันภายใน ไม่สร้างexportอื่นในNextpage. คงหน้าตา/การสร้างพร้อมไฟล์10MB/เลขถัดไป/รายละเอียด/localeditเดิม.

## ⚠️ ต้องทดสอบโดยคุณ

เปิดเพิ่มสินค้า เลือกกลุ่ม/รูปแบบแล้วต้องแสดงเลขถัดไปและรหัสเต็ม แนบไฟล์/บันทึกและเปิดรายละเอียดแล้วรีเฟรชต้องอ่านข้อมูลได้เหมือนเดิม. Accordionและปุ่มแก้ไข/ยกเลิกยังสลับได้ตามเดิม.
