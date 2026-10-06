# TASK-166 — ล้างเนื้อหาหน้าข้อมูลพื้นฐานสินค้า

สถานะ: COMPLETED

ผล: pageคืนnull ไม่mountmanagerแล้ว คงlayout/Sideรอง. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser.

1. บันทึกACTIVE/Specs/Plan.
2. src/app/settings/product-options/page.tsxคืนnull ถอนimport/render manager/searchParamsที่ไม่ใช้. ไม่แก้Shell/Sideรอง/guards/API/DB.
3. ตรวจESLint/diff.

ไฟล์: page.tsxดังกล่าว และACTIVE/Specs/Plan/Taskนี้.

ตรวจรับ: เปิด/settings/product-options เหลือSideหลัก/Sideรอง/Topbar แต่พื้นที่bodyว่าง ไม่มีหัวข้อ/กล่อง/ฟอร์ม/ตาราง. ข้อมูลจริงไม่ถูกลบ.
