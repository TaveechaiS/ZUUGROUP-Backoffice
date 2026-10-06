# TASK-186 — รายงานรับเข้า5คอลัมน์และ[id]

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Task186 ยืนยันหนึ่งแถวต่อreceiptและ5คอลัมน์ตามเจ้าของ.
2. server/operations/service.ts: viewreceiptsoptionalreceiptId validatedUUID/boundfilterกับrows/count. คงauth/cost/revisionsเดิม.
3. app/products/stock/page.tsx: ถอนจำนวนล็อต/inlineรายละเอียด/คอลัมน์รายละเอียด เปลี่ยนเลขเป็นLinkdetail. รวมreceivedQuantitydistinctlotแยกหน่วย.
4. app/products/stock/receipts/[id]/page.tsx: โค้ดclientdetailในpage อ่านGETreceipts&receiptId มีloading/error/retry/notfound ข้อมูลรับและlotstable. ไม่componentเฉพาะหน้าใหม่.
5. components/layout/admin-shell.tsxให้detailrenderchildren; product[id]/page.tsxเลขreceiptlinkชี้idนั้น.
6. Lint/type/build/diff/mockSSR5columns/link/noinline/APIidfilter. ไม่DBwrite/DDL.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: ครบreport5คอลัมน์/receiptUUIDlink/detailpage/Shell/producthistorylink/APIreadfilterแล้ว. ESLint/TypeScript/production build/git diff --checkผ่าน. SSRmockตรวจ5headers/ลิงก์id/ไม่มีinlineหรือTab/lotซ้ำสองคลังนับ70boxและอีกหน่วย4bottle/รายละเอียดLOT1แสดงครั้งเดียว/เปลี่ยนidไม่แสดงreceiptเก่าผ่าน. ServiceVMmockตรวจfilterUUIDboundในrows/count+invalid400และlistเดิมไม่มีfilterผ่าน. SQLจริงreadonlyพบ1รายการตามidต้นทางและ0เมื่อidไม่มี. ไม่write/DBschema/seed/commit/deploy ยังไม่ทดสอบคลิกbrowser.

รายงาน5คอลัมน์ กดเลขรับเข้าเปิดรายละเอียดเลขเดียวกันพร้อมล็อตถูกชุดและข้อมูลผู้บันทึก/วันที่. กลับรายงานได้. หน้าไม่พบidต้องไม่แสดงข้อมูลรายการอื่น. รับที่กระจายสองคลังต้องนับยอดรับครั้งเดียว ต่างหน่วยแสดงแยกหน่วย.
