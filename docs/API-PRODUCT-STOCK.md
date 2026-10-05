# API ตารางสินค้า — TASK-149

อนุมัติ5ตุลาคม2569: ข้อมูลตัวอย่างสินค้าและตารางสี่หน้า ไม่ทำฟังก์ชันเพิ่มสินค้าใหม่.

## สัญญาอ่าน

TASK-150: UIสี่ตารางไม่ส่งfilterstatusและไม่แสดงป้ายACTIVE/INACTIVEแล้ว APIยังเก็บfieldและรองรับfilterเดิมสำหรับผู้เรียกอื่น. คอลัมน์สถานะแสดงเฉพาะคำเตือนสต็อก/ลบแล้ว ไม่มีคำเตือนแสดงขีด. ฟอร์มpreviewไม่มีช่องสถานะสินค้า.

GET `/api/inventory?view=products&limit=10&offset=0` สำหรับสินค้าทั้งหมด; เพิ่ม `warehouseCode=MAIN`, `MARKETING`, `DISPOSAL` สำหรับแต่ละคลัง. ต้องมี session หรือ Bearer token เดิม. ไม่มีสิทธิ์เข้าสู่ระบบคืน401; ตัวกรองผิดคืน400; ดูdeleted=trueได้เฉพาะAdmin มิฉะนั้น403. Cache-Control private,no-store.

Response `{ data: StockProductRow[], pagination: { total, limit, offset, page, pageSize, totalPages }, filters: { categories: [{id,name}] } }` ตาม typeจริงใน src/types/api/operations.ts. หนึ่งแถวต่อสินค้า: id,code,name,categoryId,categoryName,unit,salePrice,status,deletedAt,quantity,reserved,available,mainAvailable. salePriceเป็นstringทศนิยม; quantityรวมทุกคลังเมื่อไม่ระบุคลัง และเฉพาะคลังเมื่อระบุ. mainAvailableอิงMAINตามpolicyเดิม ไม่ใช่คงเหลือรวม. ไม่ส่งต้นทุนในresponseรายการสินค้า.

ตัวกรอง search(ค้นรหัสหรือชื่อ), categoryId(UUID), status(ACTIVE/INACTIVE), deleted(false/true), stock(ว่าง/low/emptyอิงMAIN), expiry(ว่าง/near/expired). limitรองรับ1–50 ตารางใช้10รายการ ใช้offsetแบ่งหน้า. รูป/จัดการไม่แสดง ตาราง7คอลัมน์เดิม. GET `/api/products` มีอยู่สำหรับรายการหลักสินค้า ไม่เพิ่มrouteซ้ำ.

## ข้อมูลตัวอย่าง

สินค้า12รายการ มีชื่อระบุข้อมูลตัวอย่างและis_sample=true ใช้schemaเดิม. คลัง3รหัสเดิมและpolicy6/12/90เติมเฉพาะแถวที่หาย. ล็อตหลัก/การตลาดปกติ ล็อตรอทำลายเสื่อมสภาพ. Receipt `SEED149-20261005` ระบุseed และมีประวัติรับเข้าตรงยอด ไม่ใช่ธุรกรรมของจริง. ไม่มีการจองหรือOrder. scriptหยุดเมื่อรหัสชนและกันseedซ้ำโดยไม่แก้ของเดิม.

## ⚠️ ต้องทดสอบโดยคุณ

ผลseed: หน้ารวม12สินค้า/950หน่วย; MAIN9สินค้า/835หน่วย; MARKETING11สินค้า/99หน่วย; DISPOSAL8สินค้า/16หน่วย. APIตรวจDBจริงผ่านโดยstubidentity ไม่มีการloginอัตโนมัติ ฟอร์มเพิ่มสินค้ายังไม่เชื่อมบันทึกตามคำขอ.

เข้าสู่ระบบและเปิดทั้งสี่ตาราง: หน้ารวมมี12สินค้าตัวอย่าง คลังกดแล้วเห็นเฉพาะสินค้ามียอดในคลังนั้น. ลองค้นหาชื่อ กรองหมวด/สถานะ เปลี่ยนหน้า2 และเทียบยอดกับผลตรวจในTask. รีเฟรชแล้วยังมีข้อมูล ไม่ต้องกดบันทึกในฟอร์มเพิ่มสินค้าซึ่งยังเป็นpreview.
