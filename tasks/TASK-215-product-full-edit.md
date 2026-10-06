# TASK-215 — แก้ข้อมูลสินค้าเต็มจริง

IMPLEMENTED / WAITING_FOR_UAT; RULE_APPROVED — 6 ตุลาคม 2569

RULE_APPROVEDล่าสุด: เจ้าของให้แก้ทุกข้อมูลรวมIDที่แสดงcodeและหน่วย แม้มีreference ไม่ทำreference-lock. UUIDภายในรักษาFKเดิม; code/pairsequenceunique validationยังคง และunitไม่แปลงstockquantity. ข้อ4ด้านล่างเป็นประวัติก่อนคำตอบ.

1. สัญญา: POST /api/products/[id]/edit-requests {requestId,expectedVersion,data:ProductDraft,keepFileIds}; GET/upload/commit/cancelใช้full/requestsเดิมกับpurposeedit. แยกcreationcommit/editcommitตามstoredpurposeไม่ยอมใช้ผิด. GET /api/products/[id]/history paged10/20/50/100; auditก่อนหลัง/actor/time/เปลี่ยนfields/files. Adminwrite; authenticatedreadเฉพาะสินค้าที่มองเห็น/costprojection.
2. อ่านProduct+versionmd5(to_jsonb(row)::text)ในRepeatableReadเดียวกันไม่versionใหม่กับsnapshotเก่า. Versionopaqueไม่คอลัมน์ใหม่; commitrowlock+compareatomic409 stale; retrycompleteคืนผลเดิมไม่แก้ซ้ำ.
3. ใช้product_create_requests/product_filesเดิม: editpayloadมีtargetProductId/expectedVersion/keepIds; request.product_idrandomuniqueidentifier ไม่reuseactualidที่unique. Fileprivateอ่านได้เมื่อidยังอยู่details.filesของtargetproductปัจจุบันและrequestcomplete. ถอนfileไม่purgeobjectเดิมจนกำหนดretention แต่หมดสิทธิ์readผ่านAPI. Cancelล้างเฉพาะไฟล์pendingของeditrequestไม่ลบproductเดิม.
4. กติกาอนุมัติ: แก้code/group/format/sequence/unitได้แม้มีProductLots/OrderLines/เอกสารอ้างอิง. ตรวจuniqueและเก็บก่อนหลัง; UUIDภายในคงเดิมและไม่ปรับstockquantityตามunit. ไม่เพิ่มเปิด/ปิดขาย.
5. Page/[id]editdraftIDจริงoptions/comboboxbatchครบชุดprefill/privatefilesแนบหลายไฟล์/keep-remove-new10MB/manifesthash. Savebegin→upload→commit; pendingfrozenbody/keyเมื่อuncertainretry. Successเฉพาะservercommit. Conflictเก็บdraftและให้โหลดข้อมูลใหม่ชัด ไม่ทับหรือแสดงสำเร็จ. CanceldirtySuccessAlertเดิม+cleanup. HistoryAccordionlazytable+Pagination/Sortable/ผู้บันทึก/BEBangkok.
6. Verify: validation/fullfields/keepIdsownership/10MB/stale2edit/idempotency/noop/cancel/filedetach/auth/cost/referencepolicy/uniqueids→UIprefill/retry/alerts/history/paging→lint/type/build/Postmancontracts. ไม่มีwriteข้อมูลจริง; testsisolated/rollbackตามจำเป็นและcleanupเฉพาะfixtures. ไม่DBschema/role/stockqty/commit/deploy.

ไฟล์: server/products/full.ts/full-handler.ts/service.ts,typesapi/product-full/products,validationproduct-full,APIproducts/[id]/edit-requests+history,products/[id]/page.tsx/layout.tsx,Postmanscript/collection/binding/docs/tests/Specs/Plan/ACTIVE. ไม่สร้างcomponentsเฉพาะหน้า.

ผลตรวจ: DBจริงในtransaction rollback 14กรณีผ่าน (full create/edit, referenced lot/code/unit/quantity, staleสองคำขอ, duplicate, ownership,ไฟล์ถอด404/cancelรักษาไฟล์เก่า, inactiveunchanged, auditครั้งเดียว, history/cost/auth/origin/400). ไฟล์fixtureล้างครบและจำนวนproducts/stockกลับbaseline. UI actual-page VM ผ่าน prefillID/ครบfields/filesmanifest/lostresponse retryไม่commitซ้ำ/staleคงdraft/dirtycancel/nonAdmin. TypeScript, ESLint, productionbuild, productsstockcontracts14, routepages77และdiffผ่าน. CloudZuugroup43requestsอ่านกลับครบรวมใหม่สองเส้น/tests/examples/expectedVersion; IDsเดิมคง. ไม่มีschema/ธุรกิจwriteถาวร/commit/deploy.

⚠️ ต้องทดสอบโดยคุณ: เปิดสินค้าแก้ชื่อ/ราคา/รหัส/หน่วย/แนบหรือนำไฟล์ออก แล้วบันทึกและรีเฟรชต้องข้อมูลคงอยู่/codeURLใหม่/ล็อตจำนวนเดิม. เปิดสองแท็บของสินค้าเดียวกัน แท็บแรกบันทึกแล้วแท็บสองต้องแจ้งข้อมูลเปลี่ยน เก็บdraftและไม่ทับ. เปิดประวัติการแก้ไขต้องเห็นผู้บันทึก/วันเวลา พ.ศ./ก่อนหลัง และเลือก10/20/50/100หรือsortได้. ยกเลิกdirtyต้องมีAlertแล้วกลับปุ่มแก้ไขโดยข้อมูลเดิมไม่เปลี่ยน. ยังไม่ยืนยันbrowserUATจากผู้ใช้.
