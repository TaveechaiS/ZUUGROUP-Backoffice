# TASK-188 — ประวัติเติมรายสินค้า/ล็อต

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Task188ตามชุดคอลัมน์ใหม่และIDเดียว.
2. server/operations/service.tsและhandlers.ts: receipt-itemsviewใช้lotspaging10/totalcountล็อต เรียงcreated_atdesc คงsafeLotกรองต้นทุนrole. ไม่มีwriteหรือเปลี่ยนviewlotsเดิม.
3. app/products/stock/page.tsx: PageDataLotRowหนึ่งแถวต่อล็อต IDจากreceiptCode/LinkreceiptId, วันรับ, ชื่อ+รหัสสินค้า, receivedQuantity+unit, totalCostตามrole. ไม่source/actor/lotNumbercolumn ไม่รวมสินค้าหลายตัวเป็นแถวเดียว.
4. stock/create/page.tsxlabelIDแทนIDรับเข้า คงcodeautoeditableและbodyเดิมoneLot.
5. Lint/type/mockrender5columns/receivednotremaining/dedup/APIorderby/paging/handlerallowed. ไม่DBwrite/schema/commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: report5columnsและGETreceipt-itemsพร้อมตามscope; formlabelIDเดียว. ESLint/TypeScript/git diff --checkผ่าน. SSRmockตรวจheader5/สินค้าA-Bคนละแถว/จำนวนรับ20แม้เหลือ5/ต้นทุน100/IDlink/ไม่มีlotlabelแยก/viewqueryผ่าน. ServiceVMmockตรวจ2lotsไม่ซ้ำจาก3balance/totalcount/paging10/createddesc/receivedQuantity/ต้นทุนSalesกรองทั้งrowและbalances/lotviewเดิมexpiryorderผ่าน. ไม่ทดสอบbrowserหรือAPIwriteจริง ไม่DBschema/seed/commit/deploy. ไม่รันbuildซ้ำเพราะrouteเดิมและtype/lintผ่าน ไม่มีปัญหาrouteใหม่.

ประวัติเติมมี5คอลัมน์และเห็นสินค้าของแต่ละรายการพร้อมจำนวนรับและต้นทุนรวม. กดIDเปิดรายละเอียดรายการเดียวกัน; ไม่มีเลขรับเข้า/เลขล็อตแยก. เมื่อของย้ายหลายคลังรายการรับยัง1แถวต่อlot. ผู้ไม่มีสิทธิ์ต้นทุนเห็น—. เปลี่ยนหน้าตามล็อต10แถว.
