# TASK-093 Sidebar ย่อยสินค้าและสต็อก

สถานะ: IMPLEMENTED — รอทดสอบหน้าจอโดยเจ้าของ

## ขอบเขตและลำดับ

1. เพิ่ม4รายการย่อยใต้สินค้าและสต็อก: คลังหลัก คลังการตลาด คลังรอทำลาย ล็อตสินค้า
2. Sidebar เปิด/ปิดรายการย่อยได้ แสดงรายการที่เลือก; เมื่อย่อเมนูแล้วกดสินค้า จะขยายให้เลือกรายการย่อย
3. แยกหน้า `/products/stock/main`, `/products/stock/marketing`, `/products/stock/disposal` โดยกรอง MAIN/MARKETING/DISPOSAL; รอข้อมูลเลือกคลังก่อนเรียกยอด ไม่โหลดรวมทุกคลังในหน้าเฉพาะคลัง
4. `/products/stock` เป็นล็อตสินค้า ดูข้อมูลรวมทุกคลังและประวัติเดิมได้

ไฟล์: src/config/navigation.ts, src/components/layout/sidebar.tsx, src/components/operations/inventory-workspace.tsx, src/app/products/stock/[warehouse]/page.tsx; Specs/Plan/ACTIVE/Task.

## ⚠️ ต้องทดสอบโดยคุณ

ตรวจ ESLint, Next route typegen, TypeScript และ route checks (62หน้า) ผ่าน. ยังไม่ตรวจหน้าจอหลังเข้าสู่ระบบบนคอม/มือถือ.

- เปิดสินค้าและสต็อก → เห็น4เมนูตามลำดับ; ลูกศรเปิด/ปิดได้
- เลือกแต่ละคลัง → หัวข้อและคอลัมน์คลังตรงกัน ไม่มีข้อมูลคลังอื่นปน
- เลือกล็อตสินค้า → ดูล็อตทุกคลังได้
- ตรวจเมนูที่เลือก ย่อ/ขยาย Sidebar และกดบนมือถือ → เข้าแต่ละหน้าได้

ไม่เปลี่ยนฐานข้อมูล กฎจอง/ขาย ต้นทุน หรือสิทธิ์เดิม; ยังไม่ commit/Deploy.
