# TASK-182 — ตั้งค่าระบบหน้าเปล่า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. บันทึกACTIVE/Specs/Planตามภาพเจ้าของ: rootsettingsว่าง ข้อมูลพื้นฐานอยู่Sideรอง.
2. src/app/settings/page.tsxคืนnull ถอนหน้าlegacyที่ถูกShellข้ามอยู่เดิม.
3. src/components/layout/admin-shell.tsx: ถอนSettingsHome แสดงchildrenเมื่อ/settingsAdmin.
4. ถอนsrc/components/settings/settings-home.tsxที่ไม่มีผู้ใช้. คงSideรอง/product-optionspage/managerตามภาพ2.
5. ตรวจlint/type/diff/imports ไม่เปลี่ยนAPI/DBหรือสร้างtestsสำหรับการถอนUI.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: pageคืนnull Shellใช้children ถอนSettingsHomeและไม่เหลือimport. Prettier/ESLint/TypeScript/git diff --checkผ่าน. คงSideรอง/product-options/guardAdmin ไม่API/DB/commit/deploy ยังไม่ตรวจคลิกbrowser.

กดตั้งค่าระบบต้องเนื้อหาว่าง ไม่มีหัวข้อ/การ์ดตามภาพ1; Topbar/Sideหลัก/Sideรองยังอยู่. กดข้อมูลพื้นฐานสินค้าSideรองต้องเปิดฟอร์ม/ตารางตามภาพ2ทันที.
