# TASK-219 — ชื่อสต็อก

COMPLETED

1. บันทึก ACTIVE/Specs/Plan ตามคำขอเปลี่ยนสต็อกสินค้าเป็นสต็อก.
2. src/config/navigation.ts: ชื่อเมนูสต็อก/เพิ่มสต็อกและคำอธิบาย.
3. src/components/layout/admin-shell.tsx และ stock-secondary-sidebar.tsx: Topbar/รายงานสต็อก/aria-label.
4. src/app/products/stock/page.tsx และ stock/receipts/[id]/page.tsx: ประวัติการเติมสต็อก/ข้อความไม่มีประวัติ/กลับรายงานสต็อก.
5. Scoped ESLint, ค้นชื่อเก่าใน src และ git diff --check.

ผลลัพธ์: ชื่อสต็อกสอดคล้องในทุกจุดที่ใช้คำเดิม. เปลี่ยนข้อความเท่านั้น ไม่เปลี่ยน URL/behavior/API/DB.

ตรวจรับ: เปิดเมนูสต็อก เห็นชื่อสต็อกในเมนูและ Topbar; รายงาน/เพิ่ม/ประวัติ/กลับใช้ชื่อสั้นตรงกัน.

ผลตรวจ: Scoped ESLint และ diff ผ่าน; ไม่พบสต็อกสินค้าใน src. ยังไม่ตรวจ browser.
