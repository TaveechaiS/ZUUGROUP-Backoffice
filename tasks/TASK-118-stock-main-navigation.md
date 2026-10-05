# TASK-118 — สต็อกสินค้าเป็นเมนูหลัก

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติปรับเมนู 5 ตุลาคม 2569.

## ผลตรวจ

ย้าย registry/parent และเพิ่ม StockSecondarySidebar กับ Header/section แล้ว. Scoped ESLint 3 ไฟล์ผ่าน; route checks 74 หน้าผ่าน; ตรวจลำดับโปรโมชัน/สต็อก/เขตและ parent ของรับเข้า/คลังเดิมผ่าน; diff whitespace ผ่าน. คง navigation-only/Tab เดิม ไม่เปลี่ยนธุรกรรม/DB/สิทธิ์ ไม่ commit/deploy. ยังไม่ทดสอบภาพและการคลิกหลังล็อกอินจริง.

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Task บันทึกขอบเขต.
2. src/config/navigation.ts ย้ายล็อตสินค้าเป็นสต็อกสินค้า ต่อจากโปรโมชัน ก่อนเขต. ย้ายรับเข้า /purchases/receipts เป็นเพิ่มสต็อกสินค้า parent /products/stock. ProductSecondarySidebar อ่าน parent เดิมจึงเหลือสินค้าทั้งหมด/คลังหลัก/คลังการตลาด/คลังรอทำลาย/เพิ่มสินค้า.
3. src/components/layout/stock-secondary-sidebar.tsx เพิ่ม Side รองรายงานสต็อกสินค้า/เพิ่มสต็อกสินค้า ด้วย frame เดิม.
4. src/components/layout/admin-shell.tsx แยก stockSection จาก registry ตั้ง Header และ Sidebar ให้ตรง; คลัง main/marketing/disposal ยังอยู่หมวดสินค้าเดิม.
5. ตรวจ ESLint เฉพาะไฟล์, route checks และ diff whitespace. ไม่มี route ใหม่/เปลี่ยน API/DB/สิทธิ์/ฟอร์ม/สูตรรายงาน. คงหน้าเนื้อหาว่างและ Tab เดิม.

## ⚠️ ต้องทดสอบโดยคุณ

คอม/มือถือ: เมนูโปรโมชัน → สต็อกสินค้า → เขต. เปิดสต็อกสินค้า Header ตรงชื่อ มีรายงานสต็อกสินค้า/เพิ่มสต็อกสินค้า. กดแต่ละเมนู active หลัก/รองถูกต้อง หน้าเพิ่มยังว่าง หน้า report มี Tab ล็อตเดิม. สินค้าและสต็อกไม่มีล็อต/รับเข้าแล้ว แต่คลังหลัก/การตลาด/รอทำลายยังเลือกหมวดสินค้าเดิม. Sidebar คงขนาดและ sticky เดิม.
