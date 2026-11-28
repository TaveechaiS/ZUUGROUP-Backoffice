# TASK-218 — ชื่อหมวดสินค้า

COMPLETED

1. บันทึก ACTIVE/Specs/Plan ตามคำขอเปลี่ยนสินค้าและสต็อกเป็นสินค้า.
2. src/config/navigation.ts: label ของ /products เป็นสินค้า.
3. src/components/layout/admin-shell.tsx: Topbar หมวดสินค้าเป็นสินค้า.
4. src/components/layout/product-secondary-sidebar.tsx: aria-label เป็นเมนูสินค้า.
5. Scoped ESLint, ค้นชื่อเก่าใน src และ git diff --check.

ผลลัพธ์: ชื่อสินค้าในเมนูหลัก/Topbar/ชื่อสำหรับเครื่องอ่านหน้าจอสอดคล้องกัน. ไม่เปลี่ยน route/behavior/API/DB/เมนูสต็อกสินค้า.

ตรวจรับ: เปิดหน้าสินค้า เห็นชื่อสินค้าในเมนูหลักและ Topbar; เมนูรองเดิมยังอยู่.

ผลตรวจ: Scoped ESLint และ diff ผ่าน; ไม่พบชื่อเก่าใน src. ยังไม่ตรวจ browser.
