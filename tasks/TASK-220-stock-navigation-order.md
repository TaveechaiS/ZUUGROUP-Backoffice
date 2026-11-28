# TASK-220 — สต็อกต่อจากสินค้า

IMPLEMENTED / WAITING_FOR_UAT

1. บันทึกขอบเขต ACTIVE/Specs/Plan ก่อนแก้โค้ด.
2. ย้าย entry /products/stock ใน src/config/navigation.ts มาไว้ถัดจาก /products โดยคงทุก property เดิม.
3. ตรวจ scoped ESLint, ลำดับเมนูหลักและ entry ไม่ซ้ำ, git diff --check.

ผลลัพธ์: สินค้า → สต็อก ในเมนูหลัก desktop/mobile. ไม่เปลี่ยน URL/ชื่อ/สิทธิ์/Side รอง.

## ⚠️ ต้องทดสอบโดยคุณ

รีเฟรชหน้าเว็บทั้ง desktop/mobile ต้องเห็นสต็อกถัดจากสินค้า และคลิกทั้งสองเมนูเปิดหน้าถูกต้อง.

ผลตรวจ: Scoped ESLint/diff ผ่าน; ลำดับเมนูทั้ง4Role สต็อกตามสินค้าและ entryไม่ซ้ำ. ยังไม่ตรวจ browser.
