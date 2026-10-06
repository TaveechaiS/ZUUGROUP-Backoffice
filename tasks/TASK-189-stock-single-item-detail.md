# TASK-189 — IDเปิดสินค้า/ล็อตเดียว

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Task189 ยืนยันsingleitemdetailไม่receiptbatch.
2. operations/service.ts lots/receipt-itemsอ่านlotId UUIDvalidatedเพิ่มANDl.idให้ids/count. หน้าlistingไม่ส่งlotIdคงเดิม.
3. stock/page.tsxกับproduct[id]/page.tsxhistorylinkใช้lot.id. stock/receipts/[id]/page.tsxอ่านreceipt-items&lotId มีloading/error/retry เลือกผลตรงidเท่านั้น.
4. detailpageข้อมูลสินค้า/จำนวนรับ/ต้นทุนตามrole/วันผลิตหมดอายุ พร้อมตารางยอดคลังเฉพาะล็อตนั้น ไม่มีสินค้าอื่นหรือรับรวมหลายล็อต.
5. Lint/type/diff/mockSSRสองล็อตreceiptเดียวแต่คลิกl1เห็นl1/ไม่l2/filterUUIDrowscount/invalidid. ไม่มีDBwrite/schema.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: links/filter/detailครบแล้ว. ESLint/TypeScript/git diff --checkผ่าน. SSRmock2ล็อตreceiptเดียวตรวจรายงานlinklotid/เลือกAไม่เห็นสินค้า-ราคา-คลังB/เลือกBไม่A/idไม่พบไม่แสดงใคร/querylotIdผ่าน. ServiceVMmockตรวจidbindทั้งids/count/exact1/invalid400/listไม่มีidยังครบ2ผ่าน. ไม่DBwrite/schema/commit/deploy ไม่ทดสอบคลิกbrowserและไม่buildซ้ำเพราะrouteเดิม/typeผ่าน.

กดIDแถวสินค้าAในreportหรือhistory ต้องเห็นเฉพาะA/ล็อตของแถวนั้น จำนวนและต้นทุนไม่รวมสินค้าBแม้เคยรับพร้อมกัน. กลับreportและกดBต้องเห็นเฉพาะB. idไม่พบไม่แสดงข้อมูลล็อตอื่น.
