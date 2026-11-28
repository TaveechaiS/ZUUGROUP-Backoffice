# TASK-184 — รายงานประวัติเติมและฟอร์มเพิ่มสต็อก

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. บันทึกACTIVE/Specs/Planตามเจ้าของ หน้าreportเป็นประวัติเติมไม่มีTab; productdetailมีAccordionhistory; pageรับเข้าใช้รูปแบบ/iconเดิม.
2. src/app/products/stock/page.tsx: GETinventoryviewreceipts+paging ตารางเลขรับเข้า/วันเวลา/แหล่งที่มา/จำนวนล็อต/จำนวนรับรวมแบบdistinctlotไม่บวกซ้ำเมื่อกระจายคลัง/ผู้บันทึก เปิดdetailsดูล็อตได้. ไม่มีfilter/Tabใหม่.
3. src/app/products/[id]/page.tsx: เพิ่มฟังก์ชันประวัติล็อตภายในpage AccordionlazyGETlots/productId/limit10 paging วันผลิต/หมดอายุ/เหลือวัน ยอดคลัง/คงเหลือ/ต้นทุนตามAPIrole.
4. src/app/products/stock/create/page.tsx+layout.tsxใหม่: serverAdminguard; clientformสินค้า/คลัง/ล็อต/จำนวน/totalCost/วันผลิตหมดอายุ/code/source/notes; MAINdefault; ลูกศรเดิม/flex/style. ใช้GEToptions, POSTreceiveเดิม+ConfirmationDialog/idempotencyKeyคงpayloadretryและSuccessAlertหลังcommit. ไม่silentส่งfieldAPIไม่รองรับ ไม่เพิ่มuploadfilesในreceive.
5. src/config/navigation.ts, components/layout/admin-shell.tsx: navเปิดstock/createไม่ถูกตีความwarehouse route และแสดงchildrenของstock/report/create. purchases/receipts/page.tsxredirectlegacy.
6. Lint/type/build/SSRmockตรวจform/report/Accordion. ไม่มีbackend/DBเปลี่ยน ไม่ต้องทดสอบwriteintegrationซ้ำถ้าAPIเดิมคง; ตรวจcontractreceiveเทียบฟอร์มและreadroutes.

## ⚠️ ต้องทดสอบโดยคุณ

ผลดำเนินการ: ครบreport/history/create/nav/guard/redirect โค้ดเฉพาะหน้าในpage ใช้ส่วนกลางเดิม. POSTreceiveAPIเดิมพร้อมexplicitconfirmation กดบันทึกไม่เพิ่มยอดจนยืนยัน. Error503คงpendingpayload/idempotencyKeyเพื่อretryและปิดdialogretryไม่ล้างคำขอที่ผลไม่ชัดเจน; validation/4xxคืนแก้ข้อมูลได้. อายุยาแสดงจำนวนวันจากวันผลิตถึงวันหมดอายุ ไม่มีfieldอายุซ้ำที่APIไม่รองรับ.

ผลตรวจ: Prettier/ESLint/production build/TypeScript/git diff --checkผ่าน. ก่อนbuildtypeเก่าของNextไม่รู้create/layout หลังbuildgenerateผ่านแล้ว. SSR/state VMใช้mockHTTPไม่เขียนข้อมูล: defaultMAIN/productprefill, form/icon, quantity0reject, prepareไม่POST, cancelก่อนยืนยันไม่POST,503retry/cancelยังkeyเดิม, successpayload, receiptล็อตซ้ำสองคลังรวม70ไม่ใช่90/noTab, lazyhistory/productIdถูกตัวผ่าน. ทดสอบmockไม่ได้แทนbrowserรับจริง. ไม่มีbackend/DBschemaเปลี่ยนหรือseed/commit/deploy.

รายงานต้องไม่มีTabและแสดงประวัติเติมของ; productdetailเปิดประวัติล็อตต้องเห็นเฉพาะสินค้านั้น/เปลี่ยนหน้าได้. เพิ่มสต็อกเลือกMAINอัตโนมัติ กรอกข้อมูลแล้วบันทึกเปิดยืนยันรับก่อน เพิ่มจริงเมื่อยืนยัน สำเร็จเปิดreportมีรายการใหม่/lotในdetail. ยกเลิกยืนยันไม่เพิ่มยอด. ปุ่มไม่ทำซ้ำระหว่างrequest; retrysamepayloadไม่รับซ้ำ. iconทั้งสองแบบเดิม. ไม่ทดสอบผ่านbrowserแทนผู้ใช้จากSSR.
