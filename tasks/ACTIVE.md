# งานที่กำลังทำ

## TASK-216 Checkpoint — 2026-10-06

- CHECKPOINT_READY: เอกสาร Checkpoint/HANDOFF/Specs/Plan/Task216พร้อม; TypeScript/ESLintไฟล์โค้ดเปลี่ยนทั้งหมด/diffผ่าน. เก็บงาน TASK154–215 เป็น local commit บน AI; hashจริงตรวจ Git log หลัง commit. คง WAITING_FOR_UAT ไม่ push/deploy/แก้DB. ไม่รวม secrets/backups/src generated/.next; next-env.d.ts เป็น ambient definition ที่ tracked และเปลี่ยนตาม production build.

- IN_PROGRESS: เจ้าของขอ checkpoint. Scopeเก็บงานที่อนุมัติ TASK154–215 และเอกสารส่งต่อเป็น local commit บน AI ตาม checkpoint เดิม; ไม่ push/deploy/แก้ DB. แผนย่อย: ตรวจ diff/ไฟล์ใหม่และไม่รวม secrets/generated/backups → Specs/Plan/HANDOFF/Checkpoint/Task216 → lint/type/diff และหลักฐานทดสอบล่าสุด → stage รายการที่ตรวจแล้ว → local commit → ตรวจ hash/status. งานพฤติกรรมที่ยังรอ UAT คงสถานะรอ ไม่ปิดแทนเจ้าของ.

## TASK-215 แก้สินค้าเต็ม/API/ไฟล์/version/history — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: Full edit บันทึกจริงทุกช่อง/code/unit/filesในpage; ไม่เปิดปิดขาย. Snapshotversion+rowlockกันทับ409และรักษาdraft; requestretryidempotent/auditก่อนหลัง/ประวัติAccordionpagedsort/BEBangkok. DBrollback14tests+UIactualpageVMผ่าน รวมreferencequantityไม่เปลี่ยน/ไฟล์ถอน404/cancelปลอดภัย/lostresponseไม่ซ้ำ/authcost. TypeScript/ESLint/build/contracts14/routes77/diffผ่าน; CloudZuugroup43requestsพร้อมตัวอย่างและtestsอ่านกลับ/expectedVersion/IDsเดิมคง. ไม่มีschema/ข้อมูลธุรกิจถาวร/commit/deploy. UATตาม tasks/TASK-215-product-full-edit.md.

- IMPLEMENTING / VERIFICATION: ปิด OPEN กฎรหัสและหน่วยแล้ว. API begin-edit/commit dispatch/version rowlock/full validation/files membership/history และฟอร์ม detail บันทึกจริงอยู่ใน page แล้ว. ทดสอบ DB transaction rollback 13 กรณีผ่าน รวมแก้รหัส/หน่วยแม้มีล็อต จำนวนคงเดิม stale409/ไฟล์ถอด404/cancelรักษาเดิม/idempotentaudit/costhistoryredact. กำลังตรวจ UI/retry/roles/build และ Postman 43 เส้น. ไม่มี schema ใหม่หรือข้อมูลธุรกิจถาวรเปลี่ยน.

- RULE_APPROVED: เจ้าของตอบแก้ข้อมูลได้ทุกอย่างรวมID. ขอบเขตIDตามคำถามคือรหัสสินค้า(codeที่แสดงเว็บ) กลุ่ม/รูปแบบ/เลขลำดับและunitแก้ได้แม้มีreference; ตรวจduplicatecode/sequenceเสมอ. UUIDภายในที่เป็นFKใช้ผูกข้อมูลเดิมไม่ใช่ช่องIDที่แสดง. ไม่ล็อกfieldsตามจำนวนreference ไม่แปลง/ปรับstockquantityเมื่อเปลี่ยนunit. Auditก่อนหลังcode/unit/fields/filesและredirectcodeใหม่หลังsave. OPENด้านกฎนี้ปิดแล้ว.

- IN_PROGRESS / CODE_UNIT_RULE_OPEN: เจ้าของอนุมัติแก้ข้อมูลสินค้าเต็มจริง/ไฟล์/กันทับ/ประวัติ ไม่เพิ่มเปิดปิดขาย. ถามกติกาcode/unitเมื่อมีreferenceแล้วรอคำตอบ ส่วนอื่นดำเนินได้. แผนย่อย: contract/types→reusependingrequest/fileuploadสำหรับeditpurposeในJSONpayload(ไม่มีschemaใหม่)→versionhashจากrowพร้อมsnapshotอ่าน→Admineditbegin/upload/commitatomic/idempotent409stale→historypagedAuditที่มีเดิม→detailpagecomboboxตามkind/ไฟล์keep/remove/new10MB/retry/conflict/SuccessAlert/historyAccordion→testsrollbackisolated/mock/readonly/lint/type/build/Postman. Editrequest.product_idเป็นUUIDเฉพาะrequestที่มีuniqueเดิม, targetProductIdในpayload.edit; ห้ามcreationcommitรับeditpurpose. ไฟล์ถูกถอนจากdetailsไม่อ่านได้อีก แต่เก็บprivateauditmetadata/objectเดิมจนมีretentionpolicy ไม่purgeของจริง. Scopeproducts/full/service/handler/types/validation/routesและproducts/[id]/page/layout/Postman/docs/tests. ใช้UIกลาง ไม่มีpagecomponentfilesใหม่. ไม่schema/roles/stockbusiness/เปิดปิดขาย/commit/deploy. จะแยกdependentcode/unitก่อนคำตอบ ไม่เดากฎOPEN.

## TASK-214 ลบเส้นบน Pagination — 2026-10-06

- COMPLETED: outerwrapperไม่มีborder-tแล้ว ESLint/diffผ่าน คงspacing/buttons/behavior.

- IN_PROGRESS: เจ้าของให้ลบเส้นด้านบนPagination. Scopepagination-controls.tsxถอนborder-tและbordercolorouterwrapperเท่านั้น คงspacing/ปุ่ม/behavior. Specs/Plan/task→class→lint/diff.

## TASK-213 สลับทิศลูกศร Sort — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ↓activeasc/↑activedescแล้ว ทุกตารางใช้กลางเดิม; คงsortdata/aria-sort/3จังหวะ. ESLint/diffผ่าน ไม่API/DB.

- IN_PROGRESS: เจ้าของให้↑มากไปน้อย(desc),↓น้อยไปมาก(asc). เปลี่ยนเฉพาะการจับคู่สีSVGในsortable-table.tsx ไม่เปลี่ยนasc/desc/API/aria-sort/กด3จังหวะ. Specs/Plan/task→สลับ2strokeconditions→lint/diff/ตรวจpath.

## TASK-212 Combobox ในข้อความจำนวน Pagination — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: summaryแสดง[select]จากtotalรายการแล้ว ลบlabelรายการต่อหน้าแยก คงhandler/options/สีเว็บ. ESLint/diff/Paginationcontrols/actualstockpageVMผ่าน; ไม่API/DB. UATเลือกจำนวนจากข้อความได้และกลับหน้า1ตามเดิม.

- IN_PROGRESS: เจ้าของให้ข้อความแสดง[select10]จาก13รายการ โดยselectแทนเลขแรกและไม่มีlabelแยกแสดงรายการต่อหน้า. ขอบเขตpagination-controls.tsx JSXsummaryเท่านั้น คงpageSize10/20/50/100/ARIAและhandlerเดิม; ไม่มีonPageSizeChangeยังแสดงcountตามเดิม. Specs/Plan/task→markup→lint/diff/ทดสอบPaginationเดิม. ไม่API/DB.

## TASK-211 Pagination สีหลักเว็บ — 2026-10-06

- COMPLETED: activebg/border/selectfocus/buttonfocusเป็น#1A58A7แล้ว ไม่มีสีเขียวเดิมในcomponent. ESLint/diffผ่าน. เปลี่ยนเฉพาะสี ไม่API/DB/พฤติกรรม.

- IN_PROGRESS: เจ้าของให้ใช้สีเว็บแทนสีเขียวตัวอย่าง. ขอบเขตpagination-controls.tsxเท่านั้น เปลี่ยน#015A32เป็น#1A58A7ทั้งactiveborder/bg/selectfocus/buttonfocus; คงlayout/จำนวนหน้า/pageSize/APIเดิม. Specs/Plan/task→สี→lint/diff/ค้นไม่มีเขียวเดิม.

## TASK-210 Pagination รูปแบบเจ้าของและเลือก10/20/50/100 — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: PaginationControlsSVG/active#015A32/first-last/ellipsis/select10-20-50-100กลางใน26pagesแล้ว. ทุกpageSize reset1/querylimit-offset/count/pagesและคำขอเก่าignore/Abort; APIcap100/detail1คง. Postman41requestsเดิม/14pageddescriptionsอัปเดตและอ่านกลับครบ/defaultlimit10. ESLint/TypeScript/Build/diff/UIboundary/actualstockPageVM/100cap101reject/detail1/14productstockcontracts/route77/Combo25ผ่าน. Fulllegacytest-api-contractsยังติดassertruntimeconstantsproduct-fullเดิม ระบุTaskไม่อ้างว่าผ่าน. ไม่DBwrite/schema/commit/deploy รอbrowserUAT.

- IN_PROGRESS: ใช้PaginationUIกลางตามตัวอย่าง(svgprevnext/first-last/ellipsis/active#015A32/nativebuttonคงlibเดิม) และselect10/20/50/100default10. Scopeทุกตารางที่มีpagingในเว็บ: 14recordlists/users/audit/products/warehouses/history/lots/orders/settings/linkedterritorycustomer. ไม่เปลี่ยนComboboxครบชุด/lookupฟอร์มเดิม. ลำดับ: Specs/Plan→กลางUI→localpageSize/querylimit/offset/totalPagesและresetหน้า1พร้อมcancelคำขอเก่า→servercap100(คงdetail1)→Postmanlimitvariableคำอธิบาย→testUIboundary/100API/route/lint/type/build. SharedcomponentอนุญาตเฉพาะPagination ไม่สร้างpagecomponents. คงsort/filter/metadata/roles/stockbusiness; ไม่DBschema/write/commit/deploy. ไฟล์pagingcomponent/25pages/servervalidators-services/tests/docs/Postmancollection.

## TASK-209 ย้าย components/operations เข้าแต่ละ page — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ย้าย11pagesครบ/ไม่มีoperationsUIimportsและถอนโฟลเดอร์components/operationsแล้ว. order3routesใช้workflowlocal/route modeเดิม; linkedpanel2pagesและsharedhelpersเลือกเฉพาะตัวใช้; unusedinventory/lotUIถอน. TypeScript/ESLint/diff/productionbuildผ่าน; existingtest-route-pagesผ่าน77routes/14fieldsets/guards. API/DB/server/operations/roles/idempotencyคงเดิม ไม่มีDBwrite/commit/deploy. UATorders3/customer-territory/productsstockตามTask209.

- IN_PROGRESS: เจ้าของให้ย้ายoperationsUIเข้าpageของจุดใช้งาน. Scopeคือcomponents/operations ไม่ใช่server/operationsหรือtypesAPI. ลำดับ: Specs/Plan/task→ย้ายOrderWorkspaceไปorders/list/create/detailแต่ละpageกำหนดmodeเดิม→LinkedRecordPanel localในcustomers/[id]และterritories/[id]→helperวันที่/ราคา/Field/Paging/styles localเฉพาะชื่อที่แต่ละpageใช้→ถอนinventory-workspace/lot-stock-tableที่ไม่มีcallerและไฟล์operationsUIเดิม→ปรับtest-route-pagesอ่านpageจริง→lint/type/build/tests/diff. ใช้UIกลางSort/Status/Pagination/SuccessAlert/Loading/Confirmationเดิมได้. ไม่API/DB/กฎธุรกิจ/สิทธิ์/commit/deploy. ไฟล์orders3/customerdetail2/products6/pagesและcomponents/operations5,script/docs. ตรวจรับrouteทุกจุด/commandrole/idempotency/วันที่ไทยsort/paging10คงเดิม.

## TASK-208 ย้าย ProductOptionsManager เข้า page — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: โค้ด/helpersทั้งชุดอยู่settings/product-options/page.tsxแล้ว; defaultPageclientใช้React.use(searchParams)คงkind/defaultcodeGroup. ลบcomponents/settings/product-options-manager.tsxและไม่มีreferenceในsrc. ESLint/TypeScript/diffผ่าน; คงAdminlayout/API/sharedcomponents/CRUD/sort/page10 ไม่API/DB/commit/deploy. ตรวจหน้า/URLkind/เพิ่มแก้ปิดตามTask208.

- IN_PROGRESS: ผู้ใช้ให้ย้ายโค้ดcomponents/settings/product-options-manager.tsxทั้งหมดเข้าapp/settings/product-options/page.tsx. ลำดับ: Specs/Plan/task → pageclientใช้React.useรับsearchParamsและdefaultkindcodeGroup → ย้ายhelpers/importsเดิม → ลบไฟล์เฉพาะหน้าที่ไม่มีผู้ใช้ → lint/type/diff. คงAdminserverlayout/API/ตาราง10/Sort/SuccessAlert/Combo/CRUDเดิม ไม่เพิ่มcomponentแยกหรือAPI/DB. ตรวจรับkindqueryถูกและเพิ่ม/แก้/ปิดรายการเหมือนเดิม.

## TASK-207 Postman และ API ตามแผนที่อนุมัติ — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: CloudZuugroup uid55942202-9e4e5e82-607d-4bea-9a5d-e1c9a9b8d12f อ่านกลับ41requests/41descriptions/41tests/81examples/10resourcefolders/auth/formdataครบ/secretblank. ComboครบชุดจากbatchSQLเดียว/scroll10/localfilter/cacheต่อformและfocusinvalidate; thinreceive3queriesแทน6/details1request; readSSRเลิกmasters,marketingminSQL/metadatareuse/lazyimages. Contract13cases+Combo25ค่าผ่าน lint/type/build/diffผ่าน; SupabaseSELECTใหม่จริงผ่าน. P4ประเมินpayloadจริงเฉพาะfieldsและfixture ไม่เพิ่มETag/thumbnail/queueตามเงื่อนไขวัดก่อน. ไม่writeDB/schema/commit/deploy. APIแก้full-productเป็นข้อจำกัดเดิมระบุในCollection/Task ไม่สร้างนอกงาน. รายละเอียด tasks/TASK-207-postman-products-stock-api.md.

- IN_PROGRESS: เจ้าของอนุมัติ TASK-206 ทั้งหมด โดยเปลี่ยน Combobox เป็นโหลดตัวเลือกทั้งหมดและเลื่อนในกล่องสูงสุดประมาณ10รายการ ไม่ค้น/โหลดเพิ่มทีละ10หรือ lookup selectedID เพื่อแบ่งหน้า. ตารางยัง10รายการ/หน้า. ขอบเขต: ปรับ Specs/Plan/contract → จัด Collection Zuugroup local/cloud ใน workspace ที่ตรวจพบ → thin receive options/capabilities → batch master เมื่อแก้สินค้า/ตัวเลือกทั้งหมดในcombo → lazy/history/projections ที่จำเป็น → ตรวจ lint/type/contracts/read-only. ไม่สร้าง component เฉพาะหน้า ไม่เปลี่ยนธุรกรรม1รับ1ล็อต/เกณฑ์คลัง/DBschema. ไฟล์: postman/*, docs/api/*, products create/detail/layout, stock create/receipt detail, server operations/products/options และtypes, search-combobox. Cache/thumbnail/queueประเมินตามP4 ไม่เพิ่มโดยไม่มีประโยชน์. ตรวจรับ: Collectionอ่านกลับตรงfolder, no secrets,combo scroll10ครบค่า, stock bootstrapไม่ส่งcustomers/users,detailไม่requestoptionsเพิ่ม, role/cost/stock/count/idempotencyคงเดิม.

## TASK-206 แผนPostmanZuugroup/products/stockและลดข้อมูล — 2026-10-06

- APPROVED: เจ้าของอนุมัติและแก้ComboตามTASK207; สถานะPlanReadyด้านล่างเป็นประวัติรอบก่อนอนุมัติ.

- PLAN_READY / WAITING_FOR_APPROVAL: แผนfolder→actualroutes/knownpagination10/50lookup/oversizedoptions/receiptactorrequest/SSRmasters/lazyfiles/batchread/cachevalidationพร้อมแล้ว. เอกสารระบุphases/files/checks/1รับ1ล็อต/role/idempotency/sourceofficial. รอบนี้แก้เอกสารเท่านั้น ไม่มีruntime/API/DB/Postman/localcollectionmutation.

- PLAN_ONLY: เจ้าของขอแผนก่อนสร้างชุดZuugroupใหม่หลังแจ้งลบในPostman. รอบนี้สำรวจโค้ด/routes/collectionsเก่า/แหล่งofficial และบันทึกSpecs/Plan/แผนย่อยเท่านั้น. CollectionเดียวZuugroupโฟลเดอร์products+stockและย่อยตามงาน authเป็นsupport. เสนอthinstockbootstrap/actorcapabilities/asynclookup10/pageprojection/lazysection-files/readbatch/metadatareuse. ปัจจุบันtable10มีแล้ว optionsค้นบางจุด50และinventoryoptionsส่งเกินความต้องการ. ไม่แก้code/API/DB/collectionไฟล์/CloudหรือinstallCLI. หลังอนุมัติค่อยเปิดimplementationtaskเฉพาะphase. CLIไม่พบในPATH ตรวจbinding/authก่อนเริ่มจริง.

## TASK-205 Sortสามจังหวะคืนลำดับเดิม — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: asc→desc→ไม่มีsortและใหม่ascแล้ว labelคืนลำดับเดิม. ESLint/TypeScript/diff/mockcycle/localoriginal/aria-none/colors/queryempty/callbackผ่าน ไม่API/DB/commit/deploy รอbrowser.

- IN_PROGRESS: shared useTableSort select samekey asc→desc→keyempty(defaultasc), keyใหม่asc; aria-label ครั้ง3คืนลำดับเดิม. Localไม่reorderเมื่อkeyempty/globalถอนqueryกลับAPIdefaultพร้อมpage1. เอกสาร→hook/label→lint/mockcycle+query/order. ไม่API/DB.

## TASK-204 Sortเล็กลงและสีอ่อนกลืนหัวตาราง — 2026-10-06

- COMPLETED: SVG12×11/defaultcurrentColor55%/active#65758b-inactive#cbd5e1แล้ว คงpath/gap/behavior. Scopedlint/diffผ่าน ไม่API/DB/commit/deploy.

- IN_PROGRESS: shared sortable-table.tsx SVG14×13→12×11 defaultcurrentColor opacity55%, active#65758b/อีกทิศ#cbd5e1 opacity100%. คงpath/ช่องว่าง/behavior. เอกสาร→style→lint/diff ไม่API/DB.

## TASK-203 ไอคอน sortเล็กและชิดข้อความ — 2026-10-06

- COMPLETED: sharedbuttonไม่w-full/betweenแล้ว gap1.5 SVG14×13 คงviewBox/path/colors/behavior. ScopedESLint/diffผ่าน ไม่API/DB/commit/deploy.

- IN_PROGRESS: sortable-table.tsx เฉพาะUIหัวsort ถอนw-full/justify-between ใช้gap1.5และSVG14×13คงviewBox/path/colors/aria/handlers. เอกสาร→sharedclasses/size→lint/diff. ไม่API/DB/behavior.

## TASK-202 ถอนราคาต้นทุนจากตารางสินค้าและคลัง — 2026-10-06

- COMPLETED: ถอน header/cell/sortplaceholder จากrootและทั้ง3คลังแล้ว คงต้นทุนล็อต. Scoped ESLint/TypeScript/diffและmock4scopeheader-cell-sortcountsตรง/root-MAIN-MARKETING8 DISPOSAL7ผ่าน ไม่ API/DBwrite/commit/deploy.

- IN_PROGRESS: products/page.tsx และstock/[warehouse]/page.tsx ถอนheaderราคาต้นทุน/cellplaceholder/columnsortnullให้ตรงกัน; คงต้นทุนล็อตในdetail/history/reportเดิม. เอกสาร→columns/cells→lint/type/headeralignment. ทำต่อเนื่องกับTASK201sortที่รอปิดผลตรวจ. ไม่ API/DB.

## TASK-201 Sort ทุกตารางพร้อมไอคอนขึ้นลง — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ทุก25ไฟล์tableใช้shared sorter/SVGตามเจ้าของ/สีขึ้นลง/aria-sortและmobilecontrols; globalAPIallowlist/orderก่อนpaging/idtie/costguard และlocalnumeric/date/stable/null-last. ESLint/TypeScript/buildผ่าน; mockSVG/arrows/numeric/date/ties/null/action/globalSQL/registry14/mobile/reportpage1/navigation/destroyretryผ่าน; EXPLAIN4queryบนDBread-onlyvalid. ไม่DBwrite/schema/commit/deploy ยังไม่ได้browserUAT. TASK202ถอนcostheaderต่อเนื่อง mappingเรียบร้อย.

- ขอบเขตเอกสารส่งมอบ: docs/api/table-sorting.md ระบุquery/allowlist/ตัวอย่างและสิทธิ์cost; บันทึกผล testsในTASK201/Planหลังbuild. ไม่มีPostmancloud mutation.

- ขอบเขตเพิ่ม: records/reports.ts inventory report ใช้Prismaก่อนpaging; api/users/export/route.ts invalidsort400. ระหว่างlintพบhookcallbackอ้างsetPageก่อนประกาศ จะย้ายหลังstateและusers/auditใช้callbackที่tableหลังuseList; แก้depsให้จับkey/directionไม่อ้างsortobjectทั้งตัว.

- ขอบเขตเพิ่มระหว่างตรวจ: api/users/route.ts และ api/audit-logs/route.ts รับ RecordError จากsortเป็น400; exportUsersคงsortเดียวกับหน้า; mobile record cardsเพิ่มSortControlsกลางเพราะtableเดิมซ่อนที่mobile. Inventory viewเปลี่ยนต้องreset sortป้องกันkeyข้ามview. ไม่เพิ่มเส้นAPIใหม่.

- IN_PROGRESS: ตารางทั้ง25ไฟล์ในsrc (record lists13, users/audit/options, products/stock/detail, operations workspaces/lot table). เพิ่ม shared sortable-table/useTableSort และ sorting validation server allowlist. Paged tablesส่งsortBy/sortDirection/APIORDERก่อนpaging (records/users/audit/options/inventory/orders/products legacy); local detail sortในหน้าโดยใช้ค่าข้อมูลจริง. UI SVGตามเจ้าของสองpath เปลี่ยนสีน้ำเงินทิศactive/อีกทิศเทา กดสลับasc/desc aria-sort/keyboard; actioncolumnsไม่sort. เอกสาร→shared→server→allpages→lint/type/mock/inventorycoverage. ไม่DBwrite/schema/businessrule.

## TASK-200 คงแถวล็อตทำลายหลังรีเฟรช — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: remaining all/DISPOSALรวมdestroyed movementแถว0แล้ว คงMAIN/MARKETINGpositive และsummarylotCountpositive/qty0. ESLint/TypeScript/diff/mockscoperows-count/UIfreshstateflagและSQLread-onlyfixture visible1/lotcount0/qty0ผ่าน ไม่ DBwrite/schema/commit/deploy รอbrowser.

- IN_PROGRESS: เจ้าของแก้ให้แถวทำลายคงอยู่หลังrefresh แต่ยอดและlotCountไม่นับ. service.ts remaining scopeเพิ่มORmovementทำลายแล้วเฉพาะDISPOSAL/all; main/marketingยังpositive. คงstock summarypositive countและยอด0เดิม. เอกสาร→API→mockscope/readback/lint/type. ไม่schema/DBwrite.

## TASK-199 ยืนยันทำลายล็อตในคลังรอทำลาย — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: Admin destroy DISPOSALทั้งยอด/confirm/expected qty/reserved/duplicate guard แล้ว ledger+auditในtransactionและflagถาวร. UIconfirm→SuccessAlert/คำทำลายแล้วกดไม่ได้ คงแถวรอบนี้ และhistoryflagหลังreload. ESLint/TypeScript/diff/UI+service mockผ่าน; SQLread-onlymarker/constraintตรวจแล้ว ไม่มี DB writeจริง/schema/commit/deploy รอbrowser+UATทำลายจริง.

- IN_PROGRESS: เจ้าของอนุมัติปุ่มทำลายจริงรายล็อต. products/[id]/page.tsx ปุ่มAdminในcurrentOnly DISPOSAL/confirm→POSTdestroy→SuccessAlert/disabledคำทำลายแล้วและpinแถวรอบนี้; historyแสดงflagถาวร. service.ts actiondestroy quantityทั้งหมดDISPOSAL/ไม่reserved/ไม่ซ้ำ/ledger+audit transactionเดิม และ stockSelect flagEXISTS; types/statusbadge. เอกสาร→API→UI→mock/lint/type. ไม่schemaหรือDBwriteจริงระหว่างพัฒนา.

## TASK-198 สถานะการตลาดแสดงวันต่ำสุด — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: MARKETING badgeเดียวจาก minวันของล็อตคงเหลือ ไม่มีID/จำนวน/วันที่ในcellแล้ว. ESLint/diff/mock30-10/zero-stock/today/expired/emptyผ่าน ไม่ API/DB/commit/deploy รอbrowser.

- IN_PROGRESS: stock/[warehouse]/page.tsx สถานะ MARKETING แสดง badge เดียวจาก min daysUntilExpiry ของ marketingLots quantity>0; ลบ ID/จำนวน/วันหมดอายุในcellและunusedimports. เอกสาร→UI→lint/mockค่าต่ำสุด/0/expired/empty. ไม่ API/DB.

## TASK-197 ย้ายแท็บจำนวนสินค้าไปคลังหลัก — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: MAINสามแท็บแล้ว root/MARKETING/DISPOSALมีทั้งหมดอย่างเดียว. ESLint/diff และ mockจำนวนแท็บ/querylow-emptyMAIN/offset0ผ่าน ไม่ API/DB/commit/deploy รอbrowser.

- IN_PROGRESS: products/page.tsx เหลือแท็บทั้งหมด; stock/[warehouse]/page.tsx เฉพาะ MAIN มีทั้งหมด/low/empty. คง API stock filter MAIN เดิมและ reset page1 เมื่อเปลี่ยนแท็บ. ลำดับ Specs/Plan/Task → tabs → lint/mock query. ไม่ API/DB.

## TASK-196 กล่องล็อตที่ยังเหลือในรายละเอียดสินค้า — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: กล่องล็อตสินค้าคงเหลือเปิดเริ่มต้น/tabsคลัง/contextจากตารางคลังแล้ว API positive EXISTS scopedก่อนpaging/count; แสดงยอด/balancesเฉพาะ scope และคงประวัติเดิม. ESLint/TypeScript/diff ผ่าน; UI mock2→1หลังโอน/context/all/old historyและ service mock3คลัง/count/invalidfilter ผ่าน. ไม่ DBwrite/schema/auto transfer/commit/deploy รอbrowser.

- IN_PROGRESS: products/[id]/page.tsx เพิ่มกล่องล็อตคงเหลือ ใช้ local LotHistory currentOnly โหมดใหม่/tabsคลังและ positive balances; service.ts lots remaining=true/warehouseCode EXISTS ก่อน paging/count. warehouse/page.tsx link product ส่ง warehouse context. ลำดับเอกสาร→API scope→กล่อง/tab/link→lint/type/mock. คง history เดิมรวมล็อตหมดแล้ว ไม่ schema/write/auto-transfer.

## TASK-195 สถานะแยกคลังและวันเหลือรายล็อต — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: API mainQuantity/lotCount scoped positive distinct; tabs low/empty นับ MAIN และ MAIN=0 ยังแสดง. ทุกตารางจำนวนสต็อกหลังราคาขาย; MARKETING รายการ ID/จำนวน/วันหมดอายุ/วันเหลือแต่ละล็อตจาก paged product IDs; DISPOSAL ไม่มีสถานะ. StatusBadge pattern กลาง. ESLint/TypeScript/diff/UI+service mocks ผ่าน; SQL read-only จริงและ CTE ตัวอย่างโอน 3→2/1→0/1 ผ่าน ไม่ DB write/schema/auto transfer/commit/deploy รอ browser UAT.

- ขอบเขตปรับตามเจ้าของ: ทุกคลังเพิ่มจำนวนสต็อกหลังราคาขาย นับ distinct ล็อต quantity>0 เฉพาะคลังนั้น. MARKETING คงแถวสินค้ารวมและแสดงรายการล็อต/วันเหลือในสถานะพร้อม ID link เพื่อเห็น lotCount รวม. API products เพิ่ม lotCount/marketingLots ด้วย query หลัง paging; ไม่ต้องเปลี่ยน lots view. แสดงจำนวนตามการโอนที่บันทึกจริง ไม่สร้างการโอนอัตโนมัติขณะเกณฑ์ OPEN.

- IN_PROGRESS: products/page.tsx status MAIN quantity และ stock tabs API ใช้ MAIN quantity; stock/[warehouse]/page.tsx MAIN status MAIN, MARKETING view lots แยก ID/วันที่/วันเหลือและยอดเฉพาะ MARKETING, DISPOSAL ถอนสถานะ. service.ts mainQuantity CTE/filters และ lots warehouseCode+positive scope/paging/categories/days status; types operations และ StatusBadge pattern กลาง. ลำดับเอกสาร→API→pages→lint/type/mock. ไม่ schema/DBwrite/auto-transfer.

## TASK-194 แก้รายละเอียดการเติมสต็อก — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: หน้าเดิมดูรายละเอียดก่อน Admin กดแก้สลับปุ่มล่างสุด ยกเลิก/บันทึก; dirty cancel alert คงค่าเดิม. POST correct จริงพร้อมเหตุผล/คลังและ retry key เดิมเมื่อผลไม่แน่นอน; สำเร็จ reload/alert. ไม่แก้ ID/สินค้า/กฎ backend. ESLint/TypeScript/diff/mock view/edit/cancel/validation/payload/retry/readback/409 ผ่าน ไม่มี DB write/schema/commit/deploy รอ browser UAT.

- IN_PROGRESS: receipts/[id]/page.tsx โหมดดู/แก้และปุ่มแก้ไข↔ยกเลิกบันทึกพร้อม SuccessAlert; ใช้ inventory correct API เดิมสำหรับจำนวน/ต้นทุน/วันผลิตหมดอายุ เหตุผล/คลังปรับผลต่าง. โหลด options เพื่อสิทธิ์ Admin. คง ID/สินค้าและยอดคงเหลือ readonly ไม่เปลี่ยนกฎ 7 วัน/จอง/ledger เดิม. ลำดับ Specs/Plan/Task → state/form/save/retry → lint/type/mock; ไม่ DB writes รอบพัฒนา.

## TASK-193 คลิกทั้งแถวประวัติเติมสต็อก — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: คลิกพื้นที่แถวและ Enter/Space เปิด lot.id แล้ว คงลิงก์สินค้าและ guard event ไม่เปิดซ้อน พร้อม hover/focus. ESLint/TypeScript/diff และ mock สองแถว/keyboard/nested link ผ่าน. ไม่ API/DB/commit/deploy รอตรวจเบราว์เซอร์.

- IN_PROGRESS: stock/page.tsx เปิดรายละเอียด lot.id เมื่อคลิกพื้นที่แถวหรือ Enter/Space บนแถว; คงลิงก์ ID/สินค้าโดยไม่ให้ event เปิดซ้อน. ลำดับ Specs/Plan/Task → row handlers/hover/focus → lint/type/mock. ไม่ API/DB.

## TASK-192 ลบคำอธิบายใต้ปุ่มเพิ่มสต็อก — 2026-10-06

- COMPLETED: ลบข้อความสองบรรทัดใต้ปุ่มแล้ว คงปุ่ม/handlers/dialog เดิม. Scoped ESLint และ diff check ผ่าน ไม่ API/DB/commit/deploy.

- IN_PROGRESS: ลบข้อความกลับไปประวัติการเติมของ/ยืนยันก่อนเพิ่มยอดเข้าคลังใน stock/create/page.tsx เท่านั้น. ลำดับบันทึก Specs/Plan/Task → ลบสองข้อความ → scoped lint/diff; คง handlers ของปุ่มและ dialog เดิม.

## TASK-191 IDตัวอักษรคงที่/ปี/เลขแก้ได้ — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ID เป็น GR-ปี พ.ศ.-เลข 5 หลัก; GR/ปี readonly เลขแก้ได้และเติมศูนย์. เลขอัตโนมัติแยกตามปี Bangkok; API ตรวจรูปแบบ/ปี/เลขและคงข้อมูลเดิม. ESLint/TypeScript ผ่าน; mock ฟอร์มแก้เลข/ยืนยัน/ยกเลิก/retry และ service เปลี่ยนปี/next/overflow/invalid ผ่าน ไม่มี DB write/schema/commit/deploy. รอตรวจในเบราว์เซอร์.

- IN_PROGRESS: เจ้าของให้IDเป็นตัวอักษรเปลี่ยนไม่ได้-ปี-เลขเปลี่ยนได้. ขอบเขตstock/create/page.tsxสามส่วนGR/yearreadonly/sequenceeditable, operations/service.tsnextGR-ปีพ.ศ.-เลข5หลักตามBangkokและvalidateprefix/currentyear, test-linked-operations.mjsfixtureเลขใหม่, ACTIVE/Specs/Plan/Task191. ลำดับเอกสาร→serverprefix/nextannual→UIseqแก้pad5→fixtures→lint/type/mockyear/manual/prefix/retry. ไม่schema/DBwriteและไม่แก้IDเก่า.

## TASK-190 วันหมดอายุเพิ่มสต็อกกว้างหนึ่งฝั่ง — 2026-10-06

- COMPLETED: expiresOnคงbasisครึ่งแถวที่mdและถอนgrowแล้ว มือถือเต็มแถว. ESLint/diffผ่าน ไม่API/DB/commit/deploy.

- IN_PROGRESS: เจ้าของให้วันหมดอายุกว้างเท่าหนึ่งฝั่ง ไม่เต็มแถว. ขอบเขตstock/create/page.tsxเฉพาะclassflexfieldexpiresOnและACTIVE/Specs/Plan/Task190. ลำดับเอกสาร→ถอนgrowของexpiresOnที่mdคงbasisครึ่งแถว/mobilesเต็ม→lint/diff. ไม่พฤติกรรม/API/DB/ฟิลด์อื่น.

## TASK-189 IDเปิดเฉพาะล็อตที่เติม — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: report/historylinkใช้lotUUIDแล้ว detailอ่านreceipt-items&lotIdแสดงสินค้าเดียว/จำนวนรับคงเหลือ/ต้นทุนตามrole/วันผลิตหมดอายุ/ตารางคลังเฉพาะล็อต ไม่มีbatchtable. APIfilterUUIDทั้งids/count คงlistingเดิม. ESLint/TypeScript/diffผ่าน; SSRmockA-BsharedreceiptกดAไม่B/costwarehouseไม่ปน/กดBไม่A/unknownไม่แสดงอื่นผ่าน; serviceMockexact1/boundrowscount/invalid400/unfiltered2ผ่าน. ไม่มีDBwrite/schema/commit/deploy รอbrowserclick.

- IN_PROGRESS: เจ้าของให้กดIDดูเฉพาะสินค้า/ล็อตของแถวนั้น ไม่ทั้งชุดรับ. ขอบเขตstock/page.tsxและproduct[id]/pagehistorylinkใช้lot.id, stock/receipts/[id]/page.tsxอ่านreceipt-items&lotIdและแสดงsingleitem, operations/service.tslotIdUUIDfilterทั้งids/count, ACTIVE/Specs/Plan/Task189. ลำดับเอกสาร→filterlotId→linklotUUID→singleitemรายละเอียด/ยอดคลัง→lint/type/mockisolation. คงrouteเดิมแต่[id]เป็นUUIDล็อต ไม่DBwrite/schemaหรือเปลี่ยนvisibleIDเก่า.

## TASK-188 ประวัติเติมหนึ่งแถวต่อสินค้า/ล็อตและIDเดียว — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: report5คอลัมน์ID/เวลา/สินค้า/จำนวนรับ/ต้นทุนรวมล็อตแล้ว หนึ่งแถวต่อล็อตและGETreceipt-itemspaging10ตามล็อตจริง/ล่าสุดก่อน คงlotvieworderbyเดิม. IDเดียวlinkdetailและformlabelIDไม่มีเลขรับ+เลขล็อต. แสดงreceivedQuantityไม่ใช่quantityคงเหลือ ต้นทุนตามrole. ESLint/TypeScript/diffผ่าน; SSRmock2สินค้าสองแถว/header5/IDlink/รับ20แม้เหลือ5/cost100ผ่าน; serviceMockdedupสองคลัง/totalcount2/order/paging/กรองต้นทุนSales/lotviewเดิมผ่าน. ไม่DBwrite/schema/commit/deploy รอbrowser.

- IN_PROGRESS: เจ้าของให้ตารางhistoryเป็นID/วันเวลา/สินค้า/จำนวนรับ/ต้นทุนรวมล็อต ไม่เลขรับ+เลขล็อตแยก. ขอบเขตstock/page.tsx, stock/create/page.tsxlabelID, operations/service.tsและhandlers.tsเพิ่มGETviewreceipt-itemsใช้lotsqueryเรียงรับล่าสุด/หนึ่งล็อตหนึ่งแถว/pagingต้นทุนตามrole, ACTIVE/Specs/Plan/Task188. ลำดับเอกสาร→readviewpaginateจริงตามล็อต→report5columns/linkID→labelID→lint/type/mockread/render. ไม่schema/DBwrite/เปลี่ยนIDเก่า.

## TASK-187 IDรับเข้าเป็นล็อต / ถอนแหล่งและอายุ / สองต้นทุน — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: form/report/detail/historyใช้IDรับเข้าแล้ว ไม่มีเลขล็อต/source/ageในUI รับใหม่APIexact1ล็อตใช้codeเป็นlot_number คงUUID/ข้อมูลเก่า. Totalกรอก/unitcostreadonlyคำนวณตามจำนวน รายละเอียด/historyมีทั้งสองต้นทุนตามrole. SSR/statemockไม่มี3ช่อง/unitcost5เมื่อ100/20/payloadไม่ส่งlotNumber-source/confirmretryผ่าน; mockserviceรับ1ล็อตcodeเดียว/retryไม่ซ้ำ/2ล็อต400ก่อนเขียนผ่าน. lint/type/build/diffผ่าน ปรับintegrationfixtureเป็น2รับเพื่อคง2ล็อตแล้วlintผ่าน แต่ไม่รันDBintegrationจริง/ไม่schema/DBwrite/commit/deploy. รอbrowser/UAT.

- ขอบเขตcompatibilitytests: ปรับscripts/test-linked-operations.mjs fixtureรับ2ล็อตให้เป็นรับ2ครั้งครั้งละ1ล็อตตามกฎใหม่ ยังคงFEFO/orderfixtures2ล็อตและretryassertionsเดิม ไม่มีรันintegrationนี้กับDBจริงในรอบนี้ เพราะmockreceiveตรวจruleโดยไม่เพิ่มข้อมูลแล้ว.

- IN_PROGRESS: เจ้าของให้เลขรับเข้าเป็นID และรับ1รอบ=1ล็อต ถอนเลขล็อต/อายุคำนวณ/แหล่งที่มา เพิ่มแสดงต้นทุนรวมล็อตและต่อชิ้น. ขอบเขตstock/create/page, stock/page, stock/receipts/[id]/page, product[id]history, operations/service.tsreceive, ACTIVE/Specs/Plan/Task187. ลำดับเอกสาร→createไม่มีlotNumber/source/ageและunitCostderived→serveroneLot/lotNumber=receiptcode→รายงาน/รายละเอียด/historyใช้IDไม่แยกเลขล็อตและถอนsource→lint/type/mockreceive/render. รักษาUUID/ข้อมูลเก่า/เลขautoeditable ไม่schema/DBwrite. ต้นทุนต่อชิ้นreadonly=total/quantityตามbackendเดิม.

## TASK-186 รายงานรับเข้า5คอลัมน์และหน้ารายละเอียด[id] — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: report5คอลัมน์/หนึ่งแถวต่อreceiptแล้ว กดเลขเปิดstock/receipts/[id]ข้อมูลตรงUUID/ล็อต/ยอดแยกคลัง; historyสินค้าlinkตรงreceiptด้วย. APIreceiptIdfilteruuidboundทั้งrows/countไม่เปลี่ยนlistเดิม. รวมdistinctlot/แยกหน่วยป้องกันยอดซ้ำ. ESLint/TypeScript/build/diffผ่าน; SSRmock5headers/link/70box+4bottle/noinline/detaildedup/wrongidไม่แสดงรายการอื่นผ่าน; mockservicefilterทั้ง2query/invalidid400/plainpagingผ่าน. SQLreadonlyจริงmatch1/missing0 ไม่DBwrite/schema/commit/deploy. รอbrowserclick/UAT.

- IN_PROGRESS: เจ้าของให้reportหนึ่งแถวต่อรับเข้าแสดงเลข/เวลา/แหล่ง/จำนวนรับ/ผู้บันทึก กดเลขเปิด[id]. ขอบเขตstock/page.tsx, stock/receipts/[id]/page.tsxใหม่, products/[id]/page.tsxreceiptlink, admin-shell, operations/service.tsรับreceiptIdfilter, ACTIVE/Specs/Plan/Task186. ลำดับเอกสาร→filterAPIuuidตรงรายการ/รวมcounts→reportถอนinline/จำนวนล็อต→detailอ่านreceiptและล็อต→Shell/link→lint/type/build/mockread. คงต้นทุนตามroleและไม่DBwrite/schema.

## TASK-185 เลขที่รับเข้าอัตโนมัติแก้เองได้ — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: GEToptionsAdminคืนnextReceiptCodeจากmaxGR+1แล้ว ฟอร์มเติมครั้งแรกและinputยังแก้เองได้/ไม่overwriteโหลดซ้ำ. ReadSQLจริงได้serial1จึงเสนอGR-00001. MockserviceตรวจAdmin-only/max/ขั้นต่ำ5หลัก/เลขใหญ่ผ่าน; SSR/stateตรวจprefillGR-00016/manualคงเมื่อโหลดซ้ำและreceiveconfirm/retryผ่าน. ESLint/TypeScript/diffผ่าน ไม่มีDBwrite/schema/commit/deploy.

- IN_PROGRESS: เจ้าของให้เลขรับเข้าสร้างเองแต่แก้ได้. ขอบเขตoperations/service.ts GEToptionsเพิ่มnextReceiptCode, types/api/operations.ts optionalfield, stock/create/page.tsxprefill, ACTIVE/Specs/Plan/Task185. เลขเริ่มGR-00001/maxเลขGRในDB+1ขั้นต่ำ5หลัก ไม่จองก่อนรับจริง คงmanualเลขเดิม/unique409/idempotencyretry. ลำดับเอกสาร→nextจากDB→เติมเฉพาะช่องว่างครั้งแรก→ทดสอบmax/pad/รักษาmanual/retry→lint/type. ไม่schema/DBwriteหรือเปลี่ยนflowรับเข้า.

## TASK-184 ประวัติเติมสต็อก / ประวัติล็อตในสินค้า / ฟอร์มรับเข้า — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: reportอ่านreceiptsไม่มีTabแล้ว แยกlotIdก่อนนับ/รวมรับเพื่อไม่ซ้ำเมื่อกระจายคลัง; [id]Accordionlazyอ่านlots/productId+paging; /stock/createฟอร์มflex/Accordion/iconเดิม เลือกMAIN/สินค้าprefillquery รับหนึ่งล็อตพร้อมConfirmationก่อนPOSTเดิม+SuccessAlert. Retryหลัง503คงpayload/idempotencyและไม่ปลดแก้ข้อมูลแม้ยกเลิกdialogretry เพื่อกันรับซ้ำ. Nav/Shellเปิดrouteใหม่ serverAdminguardและlegacyredirectครบ ไม่มีcomponentใหม่แยก. ESLint/TypeScript/build/diffและSSR/state mockผ่าน: defaultMAIN/product, validation, icon, confirmcancel,503retry, successpayload, dedup70แทน90, lazyhistoryscope. ไม่DB/APIเขียนจริงในtests ไม่แก้backend/กฎย้าย/commit/deploy. รอbrowser/UATรับจริง.

- IN_PROGRESS: เจ้าของยืนยันรายงานสต็อกคือประวัติเติมของไม่มีTab, [id]มีAccordionตารางประวัติล็อต, เพิ่มสต็อกเหมือนเพิ่มสินค้า/iconเดิม โค้ดในproducts/stockpageไม่สร้างcomponentแยก. ขอบเขตproducts/stock/page.tsx, stock/create/page.tsx+layout.tsxใหม่, products/[id]/page.tsx, navigation/SidebarShellเปิดroute, receipts/pagelegacyredirect, ACTIVE/Specs/Plan/Task184. ใช้GETinventory receipts/lots/optionsและPOSTreceiveเดิมพร้อมConfirmationDialog/idempotency ไม่แก้กฎย้ายOPENหรือDB. ลำดับcontractเอกสาร→readhistory→formรับเข้าเปลี่ยนชุดข้อมูล/defaultMAIN→navroute→lint/type/build/SSRmockformhistory. ไม่มีโอนล็อตอัตโนมัติ/stockattachmentsใหม่.

## TASK-183 แผนรับเข้า/ย้ายล็อต/นับของขายเฉพาะคลังหลัก — 2026-10-06

- ขอบเขตแผนหน้ารายงานเพิ่มเติม: เจ้าของขอPlanก่อน ถามจำนวนล็อต/อายุ/ยอดรวมทุกคลังและลิงก์ใกล้หมดไปเติมของ. แก้เอกสารสี่ไฟล์เดิมเพื่อเสนอsummaryสินค้า→detailล็อตแยกคลัง, จำนวนล็อตปัจจุบันdistinctล็อตที่มียอด, สถานะคลังหลักเปิดเพิ่มสต็อกprefillproduct/defaultMAINไม่ใช่เพิ่มสินค้าใหม่. เกณฑ์เวลา/auto/manualยังรอคำตอบ ไม่มีimplementation. แผนย่อยระบุลำดับ/ไฟล์คาดหมาย/ตรวจรับ.

- ขอบเขตเพิ่มเติมเอกสาร: เจ้าของยืนยันข้อมูลอายุยา/วันผลิต/วันหมดอายุแยกล็อต และสถานะแยกคลัง: MAINหมด/ใกล้หมดตามจำนวน, MARKETINGวันเหลือก่อนหมดอายุรายล็อต ไม่มีใกล้หมด, DISPOSALไม่มีสถานะ. ปรับSpecs/Plan/Task183ตามนี้เท่านั้น ยังไม่code/DB. กฎเวลาย้าย/วิธียืนยัน/สินค้าหลายล็อตในแถวเดียวและกรณีหมดอายุยังOPEN ไม่เดา.

- PLANNING / WAITING_FOR_RULES: เจ้าของยืนยันรับเข้าเลือกคลังได้ค่าเริ่มต้นMAIN เก็บยอดแยกล็อต/คลัง ล็อตเก่าย้ายไปMARKETINGต้องลดMAIN/เพิ่มMARKETINGจำนวนเดียวกัน และใกล้หมดนับเฉพาะMAIN. ขอบเขตเอกสารACTIVE/Specs/Plan/Task183เท่านั้น; ยังไม่แก้code/API/DB. ลำดับเทียบกฎเดิม→บันทึกยืนยัน/ตัวอย่าง20+50→ถามเวลานับจากรับเข้าหรือหมดอายุและmanual/auto→แผนหน้ารายงาน/เพิ่มสต็อกเมื่อกฎพร้อม. คงTASK179รอขอบเขตลบตาราง.

## TASK-182 ตั้งค่าระบบหน้าเปล่าและเข้าข้อมูลพื้นฐานจากSideรอง — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: /settingsคืนnullแล้ว Shellแสดงroutechildren ไม่มีหัวข้อ/การ์ดภาพ1 และถอนSettingsHome/หน้าlegacyเดิม. Sideรองคงลิงก์ข้อมูลพื้นฐานสินค้าพร้อมฟอร์ม/ตารางภาพ2. Prettier/ESLint/TypeScript/diff/importsผ่าน ไม่API/DB/commit/deploy รอเจ้าของตรวจคลิกหน้า.

- IN_PROGRESS: เจ้าของให้ลบหัวข้อ/การ์ดภาพ1 เปิดตั้งค่าระบบหน้าเปล่า และใช้หน้าข้อมูลพื้นฐานสินค้าภาพ2ผ่านSideรอง. ขอบเขตsettings/page.tsxคืนnull, admin-shellใช้routechildrenแทนSettingsHome, ถอนcomponents/settings/settings-home.tsx, ACTIVE/Specs/Plan/Task182. คงSideรอง/link/product-optionsmanagerรูป2และguardเดิม. ลำดับเอกสาร→ถอนการ์ด/หน้าเก่า→Shellchildren→lint/type/diff. ไม่API/DBเปลี่ยน.

## TASK-181 ย้าย ProductStockList เข้า pageสินค้า — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ตาราง/state/APIloading/tab/pagingอยู่products/page.tsxและstock/[warehouse]/page.tsxแล้ว ถอนcomponentเดิม/ไม่มีimportข้ามpage. Layoutคลังใหม่คงserver404เฉพาะmain/marketing/disposal. ใช้Pagination/StatusBadge/Loading/RequestState/moneyกลางเดิม. ESLint/production build/TypeScript/diffผ่าน หลังbuildอัปเดตNextroute typesที่ค้างก่อนเพิ่มlayout. ไม่API/DB/commit/deploy รอbrowserรายการและสามคลัง.

- IN_PROGRESS: เจ้าของให้ย้ายProductStockListเข้าproducts/page. ขอบเขตproducts/page.tsx, products/stock/[warehouse]/page.tsxกับlayout.tsxใหม่, components/operations/product-stock-list.tsxที่ถอน, ACTIVE/Specs/Plan/Task181. ลำดับเอกสาร→ย้ายตาราง/loader/stateเข้าpageทั้งรายการและคลังที่เคยใช้ร่วม→คงguardwarehouseในserverlayout→ถอนimport/componentเก่า→format/lint/type/build. คงส่วนกลางPagination/StatusBadge/Loading/RequestState/money. ไม่มีAPI/DBเปลี่ยน.

## TASK-180 ถอนต้นทุนและภาษีจากข้อมูลหลักสินค้า — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ถอนต้นทุน/ภาษีจากcreate/detail/contractแล้ว ไม่มี7%อัตโนมัติหรือvalidationบังคับสองช่อง. ราคาขายคงเดิม. Integration11กลุ่มผ่านพร้อมยืนยันสร้าง/อ่านกลับไม่มีสองค่าและlegacyต้นทุนยังกันสิทธิ์; rollbackและลบไฟล์ทดสอบหมด countsคง. ESLint/TypeScript/diffผ่าน ไม่migration/ลบข้อมูล/เพิ่มฟอร์มรับเข้าเอกสาร/commit/deploy. งานลบตารางTASK179ยังรอขอบเขต ไม่ถือว่าคำขอนี้อนุมัติรายการลบ.

- IN_PROGRESS: เจ้าของให้ราคาต้นทุนกำหนดตอนรับของเข้า ภาษีตอนทำเอกสาร. ถอนสองช่องจากcreate/pageและdetail/pageที่จัดแบบฟอร์มเดียวกัน รวมcontractPRODUCT_TEXT_FIELDS/validationไม่บังคับภาษี. ขอบเขตACTIVE/Specs/Plan/Task180, pagesสองไฟล์, types/api/product-full.ts, server/validation/product-full.ts, test-product-full.mjs, docs/api/product-full.mdและตัวอย่าง. คงข้อมูลเก่าที่บันทึกในDB/ต้นทุนล็อต/ตารางHeader-only ไม่เพิ่มฟอร์มรับเข้าหรือภาษีเอกสารในรอบนี้. ลำดับเอกสาร→ถอนUI/contract→ทดสอบสร้างไม่มีต้นทุนภาษี/ไฟล์→lint/type/diff.

## TASK-179 ตรวจตาราง Supabase ที่ยังไม่ใช้ — 2026-10-06

- DISCOVERY / WAITING_FOR_SCOPE: เจ้าของขอลบตารางที่ยังไม่ใช้เพื่อเห็นชุดที่ต้องพัฒนาต่อ. ตรวจpublic40ตาราง/counts/FKกับโค้ดจริงแล้ว พบหลายหน้าซ่อนแต่APIยังอ้าง จึงถามนิยามไม่ใช้: ไม่มีโค้ดเรียกเลย หรือพักโมดูลที่หน้ายังไม่เปิดและปรับAPIก่อนลบ. รอบนี้ขอบเขตเอกสารACTIVE/Specs/Plan/Task179และinventoryเท่านั้น ไม่มีDDL/ลบข้อมูล. ลำดับinventory→แยกใช้จริง/โมดูลพัก/legacy→รับขอบเขต→backup/แผนถอดdependencyก่อนลบแบบระบุชื่อตาราง ไม่CASCADEข้ามขอบเขต. คงauth/storageระบบSupabase.

## TASK-178 รวมโค้ดเฉพาะหน้าสินค้าใน route — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: โค้ดcreateพร้อมpicker/แนบไฟล์อยู่create/page.tsx และรายละเอียดอยู่[id]/page.tsxแล้ว ไม่มีimportcomponents/productsหรือexportส่วนย่อยข้ามpage. ถอนcomponentเฉพาะหน้าหกไฟล์รวมlegacyที่ไม่เรียก; AdminShellแสดงroutechildren. คงcomponentที่ใช้ร่วมหลายroute/SuccessAlert/RouteDataProviderและserverlayoutเดิม. Prettier/ESLint/TypeScript/production build/diffผ่าน ไม่เปลี่ยนAPI/DBหรือรันintegrationเขียนข้อมูลซ้ำ. รอเจ้าของตรวจหน้า/บันทึกผ่านbrowser.

- IN_PROGRESS: เจ้าของให้โค้ดหน้าสินค้าอยู่page/layout คงcomponentส่วนกลางที่ใช้ซ้ำ. ย้ายcreate/detail/ช่องเลือก/แนบไฟล์จากcomponents/productsเข้าcreate/page.tsxและ[id]/page.tsx ลบcomponentเก่าที่ไม่มีผู้ใช้ รวมlegacyที่ไม่ได้เรียก แก้AdminShellให้renderchildrenของcreate ไม่แทรกฟอร์มเอง. คงProductStockListที่ใช้ร่วมรายการและคลังหลายroute รวมSuccessAlert/RouteDataProvider/sidebarส่วนกลาง. ขอบเขตACTIVE/Specs/Plan/Task178, pagesสองไฟล์, components/productsหกไฟล์, admin-shell. ลำดับเอกสาร→ย้ายโค้ด/imports→ลบไฟล์ไม่ใช้→format/lint/type/build. ไม่แก้API/DB/กฎบันทึก/หน้าตา.

## TASK-177 เชื่อมสร้างสินค้าครบข้อมูลและไฟล์ — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: สร้างสินค้าครบฟอร์มพร้อมรูป/เอกสาร private ไม่เกิน10MBต่อไฟล์แล้ว เลขถัดไปจริง5หลักแก้ได้/ห้ามซ้ำ ตรวจ manifest ครบก่อน commit และ retry ไม่สร้างซ้ำ. Integration11กลุ่มผ่าน รวมอ่านกลับทุกช่อง/ไฟล์จริง UUIDตัวพิมพ์ใหญ่/เล็ก สิทธิ์/ต้นทุน/cleanup/เลขซ้ำ; rollbackและลบfixtureแล้ว สินค้า12รายการ/stock950คงเดิม. Prisma generate, ESLint, TypeScript, production build และ SSRฟอร์มผ่าน; HTTPanonymous401ตรวจจริง. Migration/bucketใช้จริงพร้อมbackupignored. ชุดตัวอย่างและAPIอยู่docs/examples/TASK-177-product-example.mdกับdocs/api/product-full.md. ยังไม่ตรวจกรอกผ่านbrowser; แก้รายละเอียดครบข้อมูลยังlocalตามTASK165. ไม่seedข้อมูลธุรกิจ/commit/deploy.

- ขอบเขตยืนยันไฟล์ครบ: requestpayloadเก็บmanifestUUID/kind/name/size/type/hashก่อนupload commitตรวจครบ ป้องกันpartialuploadsuccess. เพิ่มtestmissing/undeclared/tamperedmanifest ใช้JSONBเดิม.

- ขอบเขตเอกสารปิดงาน: docs/api/product-full.md สำหรับสัญญาAPI/lifecycle/ข้อจำกัดและdocs/examplesตัวอย่าง พร้อมปรับTask152และSpecs/Planให้สร้างจริงพร้อมแล้วแต่conditionalยา/แก้ไขครบข้อมูลยังไม่เปิด. จัดformatเฉพาะTS/MJSที่แก้ในTASK177เพื่ออ่านง่าย แล้วตรวจlint/type.

- ขอบเขตcompatibility: public-service.tsและrecords/reports.tsรองรับnullabledrug/dosageจากสินค้าที่ไม่ใช่ยา โดยไม่เปิดต้นทุนหรือเปลี่ยนรายงานธุรกิจ. เพิ่มmodelsrequest/files/relationsในPrismaให้ตรงmigration; เพิ่มAPIstatusretryไม่กดซ้ำ. Dry-run/applymigrationคงสินค้า12/stock950 มีbackupignored.

- IN_PROGRESS: เจ้าของขอข้อมูลตัวอย่าง/เชื่อมบันทึกทุกช่องและยืนยันรวมรูปเอกสาร10MBต่อไฟล์หลายไฟล์. ขอบเขตใหม่schema/migration, server/products full-service/validation/types, APIproducts full-create/full-next/files/detailอ่านprofile, Supabaseprivatebucket/serverstorage, create/pickers/attachment/detail UI, scriptssetup/testและชุดตัวอย่าง, ACTIVE/Specs/Plan/Task177. ลำดับcontract/แผน → additive migration/backup → validate/next/create/files → UI → integrationrollback/filescleanup/readback/lint/type. ไม่เปลี่ยนstock/สร้างยอด ไม่เดากฎบังคับยาเพิ่มเติม.

## TASK-176 เลขลำดับเริ่มต้นและรหัสเต็มตามตัวเลือก — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: sequenceเริ่ม00001แก้ได้และfullcodeตามselectedcode/paddedsequenceแล้ว pickercallbackส่งnullเมื่อรายการปิด/ตรวจไม่ได้. ESLint/diffและhandlerstate initial/เลือก/แก้/pad/0/changeformat/invalidผ่าน. ยังไม่nextDB/uniqueจริง ไม่API/DB/commit/deploy รอbrowser.

- IN_PROGRESS: รหัสสินค้าในหน้าเพิ่มสินค้าเลขเริ่ม00001แก้ได้ รหัสเต็มตามcodeGroup/codeFormat/sequence. ขอบเขตproduct-create-preview.tsx, product-option-combobox.tsx optionalonChange และACTIVE/Specs/Plan/Task176. ลำดับบันทึก → callbackเลือก/validateรายการ → parentรหัสประกอบ → lint/state/render/diff. ยังpreviewไม่nextDB/uniqueจริงตามTASK152.

## TASK-175 ดาวบังคับที่หัวข้อเพิ่ม — 2026-10-06

- COMPLETED: ดาวแดงท้ายหัวข้อเพิ่มแล้ว ถอนดาวและpaddingในช่องรหัสชื่อ คงrequired/validation. ESLint/diffผ่าน ไม่API/DB/commit/deploy.

- IN_PROGRESS: ถอนดาวในช่องรหัสชื่อ ย้ายดาวแดงหัวข้อเพิ่มkind คงaria-required/validation. ขอบเขตmanager.tsxและACTIVE/Specs/Plan/Task175. ลำดับบันทึก → ย้ายspan/removeinputpadding → lint/diff.

## TASK-174 กรอบร่วมรายการและส่วนเพิ่ม — 2026-10-06

- COMPLETED: topgridborder roundedครอบselector/form/รหัสชื่อ/ปุ่มแล้ว search/tableแยกด้านล่าง. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser ไม่API/DB/commit/deploy.

- IN_PROGRESS: กรอบเดียวครอบselectorรายการ/หัวข้อเพิ่ม/รหัสชื่อ/ปุ่ม ไม่ครอบค้นหาและtable. ขอบเขตmanager.tsxและACTIVE/Specs/Plan/Task174. ลำดับบันทึก → ส่งselectorเข้าตำแหน่งกรอบร่วมpanel → grid1:1ภายใน/tableแยก → lint/render/diff. คงCRUD.

## TASK-173 ถอนกรอบนอกส่วนรายการ — 2026-10-06

- COMPLETED: ถอนwrapperborder/rounded/paddingรายการแล้ว คงinputborder/h11. ESLint/diffผ่าน ไม่API/DB/commit/deploy.

- IN_PROGRESS: ถอนborder/rounded/paddingกรอบครอบComboboxรายการ คงinputborder/heightเดิม. ขอบเขตmanager.tsxและACTIVE/Specs/Plan/Task173. ลำดับบันทึก → wrapperclass → lint/diff.

## TASK-172 บันทึกชิดขวาสุด — 2026-10-06

- COMPLETED: justify-end/order-lastบันทึกขวาสุดแล้ว คงsubmitเดิม. ESLint/diffผ่าน ไม่API/DB/commit/deploy.

- IN_PROGRESS: จัดปุ่มบันทึกชิดขวาสุดส่วนเพิ่มข้อมูล คงยกเลิกก่อนบันทึกเวลาแก้. ขอบเขตmanager.tsxและACTIVE/Specs/Plan/Task172. ลำดับบันทึก → justify-end/order → lint/diff. ไม่เปลี่ยนsubmit.

## TASK-171 Placeholder รหัสชื่อ/ถอนกรอบช่องเพิ่ม — 2026-10-06

- COMPLETED: รหัส/ชื่อเป็นplaceholder/aria-labelแล้ว คงดาวแดงด้านขวาภายในช่องและrequired ถอดกรอบครอบinputs/padding คงinputborder. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser ไม่API/DB/commit/deploy.

- IN_PROGRESS: รหัส/ชื่อย้ายplaceholderและaria-label ถอนlabelที่มองเห็น/กรอบครอบinputs คงinputborder/ขนาด/requiredเดิม. ขอบเขตmanager.tsxและACTIVE/Specs/Plan/Task171. ลำดับบันทึก → labels/placeholder/innerborder → lint/diff.

## TASK-170 ปุ่มนอกกรอบและถอนกรอบใหญ่ — 2026-10-06

- COMPLETED: buttonsนอกinnerinputsbox คงformsubmitและถอนborderกรอบใหญ่แล้ว คง2กล่อง/table. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser ไม่API/DB/commit/deploy.

- IN_PROGRESS: ย้ายบันทึก/ยกเลิกออกนอกกรอบinputs และถอนborderกรอบใหญ่ครอบข้อมูลพื้นฐานสินค้า คงกรอบ2ส่วน/table. ขอบเขตmanager.tsxและACTIVE/Specs/Plan/Task170. ลำดับบันทึก → formนอกกรอบ/inputsinnerboxและbuttonsด้านล่าง → ถอนouterborder → lint/diff. คงsubmit/CRUDเดิม.

## TASK-169 หัวข้อและกล่องขนาดเท่ากัน — 2026-10-06

- COMPLETED: หัวข้อเพิ่มอยู่นอกกรอบ grid1:1/stretchกรอบเท่ากัน combo scopedh11 คงcode/namebasisเดิมแล้ว. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser ไม่API/DB/commit/deploy.

- IN_PROGRESS: หัวข้อเพิ่มอยู่นอกกรอบแบบรายการ สองส่วนกว้าง/สูงเท่ากันบนจอกว้าง inputsสูง44px คงbasisรหัส/ชื่อเดิม. ขอบเขต manager.tsxและACTIVE/Specs/Plan/Task169. ลำดับบันทึก → equalgrid/stretch/headeroutside → scopedcomboheight → lint/diff. คงCRUD.

## TASK-168 ฟอร์มเพิ่มขวารายการ — 2026-10-06

- COMPLETED: gridจอกว้างรายการซ้าย/ฟอร์มเพิ่มขวา ค้นหา/ตารางเต็มแถวล่าง มือถือเรียงลงแล้ว. ESLint/diffผ่าน ยังไม่ตรวจภาพbrowser ไม่API/DB/commit/deploy.

- IN_PROGRESS: ย้ายฟอร์มเพิ่มกลุ่มรหัส/หัวข้อที่เลือกขวาComboboxรายการ จอกว้าง2คอลัมน์ มือถือเรียงลง ตารางเต็มแถวล่าง. ขอบเขตproduct-options-manager.tsx และACTIVE/Specs/Plan/Task168. ลำดับบันทึก → grid/contents/span → lint/diff. คงAPI/CRUDเดิม.

## TASK-167 Combobox รายการ→ฟอร์ม→ตาราง — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: หน้าแสดงComboboxรายการ10kind→ฟอร์มเพิ่ม→ค้นหา/ตารางpanelเดียวแล้ว ใช้APICRUDเดิม. ESLint/diff/SSR1combo1form1tableลำดับ/รหัสเฉพาะcodeGroupเทียบbrandผ่าน. รอbrowser/CRUDจริง ไม่DBmutation/commit/deploy.

- IN_PROGRESS: เปิดเนื้อหาข้อมูลพื้นฐานสินค้าใหม่เป็นComboboxเลือก10kind ตามด้วยฟอร์มเพิ่มและตารางเฉพาะkind. ขอบเขต product-options-manager.tsx, settings/product-options/page.tsx และACTIVE/Specs/Plan/Task167. ลำดับบันทึก → reuseSearchComboboxชนิดstatic → panelเฉพาะkind/ย้ายค้นหาติดตาราง → routeเปิดmanager → lint/render/diff. APICRUDเดิมไม่เปลี่ยน.

## TASK-166 ล้างเนื้อหาหน้าข้อมูลพื้นฐานสินค้า — 2026-10-06

- COMPLETED: pageคืนnullแล้ว ไม่มีmanager/เนื้อหาภายใน คงShell/Sideรองเดิม. ESLint/diffผ่าน ไม่ลบDB/APIหรือcomponent ไม่commit/deploy.

- IN_PROGRESS: เจ้าของให้ถอนเนื้อหาทั้งหมดหน้าข้อมูลพื้นฐานสินค้า คงSideรองและShell. ขอบเขต settings/product-options/page.tsx และ ACTIVE/Specs/Plan/Task166. ลำดับบันทึก → pageคืนnullไม่mountmanager → lint/diff. คงAPI/DB/componentเดิมพักไว้ ไม่ลบรายการข้อมูลจริง.

## TASK-165 โหมดแก้ไขรายละเอียดสินค้าและ Alert — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: Adminแก้ไขท้ายหน้า→inputs/ยกเลิกบันทึก; cleanCancelทันที dirtyCancelAlert→คืนsnapshot; saveLocalAlert→โหมดดูแล้ว. ESLint/diffและstateflow clean/dirty/save/คืนsnapshotล่าสุด/Adminผ่าน. TypeScriptติด3Prismaเดิม ไม่มีerrorใหม่. ไม่API/DB/ไฟล์แนบใหม่/commit/deploy รอbrowser.

- IN_PROGRESS: ปุ่มแก้ไขล่างสุดAdmin สลับยกเลิก/บันทึก ช่องข้อมูลแก้localได้; ยกเลิกไม่dirtyกลับทันที dirtyAlertก่อนคืนค่า บันทึกlocalพร้อมAlertระบุยังไม่DB. ขอบเขต product-detail-preview.tsx และ ACTIVE/Specs/Plan/Task165. ลำดับบันทึก → draft/snapshot/buttons/Alert → lint/stateflow/render/diff. คงTASK152พัก API/ไฟล์แนบจริงไม่เชื่อม.

## TASK-164 Accordion รายละเอียดสินค้า — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: 3กล่องdetails/summaryพร้อมลูกศรpath/ขนาด/สี/หมุนแบบเพิ่มสินค้าและopen stateแล้ว. ข้อมูลทั่วไปเปิดเริ่มต้น คงข้อมูลreadonly. ESLint/diffผ่าน รอตรวจคลิกbrowser ไม่API/DB/commit/deploy.

- IN_PROGRESS: products/[id]เปลี่ยน3กล่องเป็นAccordion ใช้ลูกศร/styleเดียวเพิ่มสินค้า. ขอบเขต product-detail-preview.tsx และ ACTIVE/Specs/Plan/Task164. ลำดับบันทึก → details/summary/open state → lint/diff. เปิดข้อมูลทั่วไปเริ่มต้นแบบเพิ่มสินค้า คงข้อมูลreadonlyเดิม.

## TASK-163 ถอนแท็บลบแล้วและปุ่มเพิ่มข้างแท็บ — 2026-10-06

- COMPLETED: ถอนแท็บลบแล้ว/ปุ่มเพิ่มขวาแท็บแล้ว คง3แท็บ/Sideรอง. Requestdeleted=falseเสมอและstockfilterเดิม. ESLint/diffผ่าน ไม่API/DB/commit/deploy.

- IN_PROGRESS: ถอนแท็บลบแล้วและปุ่มเพิ่มสินค้าขวาแถวแท็บใน product-stock-list.tsx. ขอบเขตไฟล์นี้และ ACTIVE/Specs/Plan/Task163. ลำดับบันทึก → ถอนUI/import/statebranchที่ไม่ใช้ → lint/diff. คงเมนูเพิ่มสินค้าและAPIdeletedเดิม.

## TASK-162 แท็บหมดและใกล้หมดตามจำนวนคงเหลือ — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: SQLกรองquantity0/1–50ทั้งdata/count และป้ายUIquantityตรงแล้ว. ESLint/diff/SSRfixture0/1/50/51โดยmainAvailableสวนทาง+SQLcontractผ่าน. ไม่ทดสอบDBจริงหรือเปลี่ยนยอด รอbrowser ไม่commit/deploy.

- IN_PROGRESS: เกณฑ์ใหม่สินค้าหมดquantity=0 ใกล้หมดquantity1–50รวมขอบ พร้อมStatusBadgeตรงเกณฑ์. ขอบเขต product-stock-list.tsx และoperations/service.ts, ACTIVE/Specs/Plan/Task162. ลำดับบันทึก → SQLfilterquantityใช้ร่วมdata/count → UIstatusquantity → lint/boundary/diff. ไม่เปลี่ยนยอด/จอง/FEFO/DBdata.

## TASK-161 รายละเอียดสินค้าครบตามฟอร์ม — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: หน้าdetailครบ3กล่องทุกช่อง/รหัสแยก/ชื่อสองภาษา/ไฟล์แล้ว อ่านค่าที่มีจากRouteData ใหม่—. Legacyแยกไฟล์ไม่mount. ESLint/diff/renderreadonlyทุกกล่อง/ค่าจริงfixtureผ่าน. TypeScriptติด3errorPrismaเดิม ไม่มีerrorใหม่. รอbrowser ไม่API/DB/commit/deploy.

- ขอบเขตเพิ่ม: ย้ายโค้ดLegacyไปproduct-detail-legacy.tsx ไม่exportชื่อพิเศษจากNextpage เพื่อคงกติกาrouteของNext. pageใหม่มีdefaultอย่างเดียว.

- IN_PROGRESS: เปิดproducts/[id]ดูรายละเอียดครบหัวข้อแบบเพิ่มสินค้า โดยอ่านRouteDataเดิม/ช่องใหม่— ไม่มีCRUDใหม่. ขอบเขต product-create-preview.tsxแชร์sections, product-detail-preview.tsxใหม่, products/[id]/page.tsxคงlegacyfunction และ admin-shell.tsxเปิดchildrenเฉพาะrouteรายละเอียด. เอกสารACTIVE/Specs/Plan/Task161. ลำดับบันทึก → รายละเอียดreadonly → route/shell → lint/render/diff. ไม่API/DB/เปิดmutationsเดิม.

## TASK-160 คอลัมน์ราคาต้นทุนก่อนราคาขาย — 2026-10-06

- COMPLETED / HEADER_ONLY: เจ้าของตอบว่ายังไม่ต่อข้อมูล ทำHeaderก่อนเท่านั้น. หัวราคาต้นทุนก่อนราคาขายพร้อมแล้ว เซลล์—รองรับแนวคอลัมน์. ยกเลิกสถานะรอแหล่งต้นทุนในรอบนี้ ไม่ทำAPI/DBต่อจนมีคำสั่งใหม่.

- UI_IMPLEMENTED / WAITING_FOR_COST_SOURCE: คอลัมน์ราคาต้นทุนทางซ้ายราคาขายพร้อมเซลล์—และmin-width880แล้ว. ESLint/diffผ่าน. รอคำตอบแหล่งต้นทุนก่อนเชื่อมค่าจริง; ไม่แก้API/DB/commit/deploy.

- IN_PROGRESS: เพิ่มหัวตาราง/เซลล์ราคาต้นทุนก่อนราคาขายใน product-stock-list.tsx. ขอบเขตไฟล์นี้และ ACTIVE/Specs/Plan/Task160. ลำดับบันทึก → columnแสดง—เมื่อยังไม่มีข้อมูล → lint/diff. APIยังไม่มีต้นทุนระดับสินค้า รอเจ้าของเลือกแหล่ง ไม่เดาต้นทุนล็อต/สูตร ไม่แก้API/DB.

## TASK-159 แสดงข้อมูลพื้นฐานสินค้าทันที — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ทุก10หัวข้อเป็นกล่องเต็มแสดงฟอร์ม/ตารางทันทีแล้ว ไม่ต้องเปิดAccordion; kindลิงก์เลื่อนกล่องเป้าหมาย. ESLint/diff/SSR10formsและไม่มีdetailsผ่าน. ยังไม่ตรวจbrowser/CRUDจริง ไม่commit/deploy.

- IN_PROGRESS: เปิดข้อมูลพื้นฐานสินค้าแล้วแสดงเนื้อหาทั้ง10รายการทันที ไม่ต้องเปิดกล่องย่อย. ขอบเขต product-options-manager.tsx และ ACTIVE/Specs/Plan/Task159. ลำดับบันทึก → เปลี่ยนกล่องย่อยเป็นsectionเต็ม/เลิกlazy mount → lint/diff. คงAPI/CRUDเดิม.

## TASK-158 กล่องเต็มข้อมูลพื้นฐานสินค้า — 2026-10-06

- COMPLETED: หัวข้อหลักเป็นdiv border rounded แสดงเนื้อหาเต็ม ถอนouterAccordion/state/ลูกศรแล้ว คงกล่องย่อย. ESLint/diffผ่าน ไม่commit/deploy.

- IN_PROGRESS: เจ้าของไม่เอาAccordionหัวข้อหลัก ขอboxเต็ม border rounded. ขอบเขต product-options-manager.tsx และ ACTIVE/Specs/Plan/Task158. ลำดับบันทึก → ถอนouter details/summary/state/ลูกศร ใช้divกรอบ → lint/diff. คงกล่องย่อยและCRUDเดิม.

## TASK-157 Accordion หัวข้อข้อมูลพื้นฐานสินค้า — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: หัวข้อหลักเป็นAccordionเปิดเริ่มต้น/พับ10กล่องย่อยได้แล้ว คงเนื้อหาmounted. ESLint/diff/render11details-summaryและouterเปิดผ่าน. ยังไม่คลิกจริงในbrowser ไม่มีAPI/DB/commit/deploy.

- IN_PROGRESS: เปลี่ยนหัวข้อข้อมูลพื้นฐานสินค้าเป็นAccordionครอบ10กล่องเดิม. ขอบเขต product-options-manager.tsx และ ACTIVE/Specs/Plan/Task157. ลำดับบันทึก → details/summaryระดับหัวข้อ → lint/render/diff. เปิดเริ่มต้นเพื่อคงการเข้าหัวข้อจากลิงก์ และพับได้ไม่ล้างstate.

## TASK-156 ข้อมูลทั่วไปเปิดเริ่มต้นและรวมราคา — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: ข้อมูลทั่วไปเปิดเริ่มต้น กล่องอื่นพับ; ราคา3ช่องย้ายต่อบริษัทผู้ผลิตก่อนรายละเอียดสินค้า ถอนหมวดราคาแล้ว. ESLint/diff และrender3กล่อง/open state/lำดับ/ภาษี7ผ่าน. ยังไม่คลิกจริงในbrowser ไม่มีAPI/DB/commit/deploy.

- IN_PROGRESS: เปิดกล่องข้อมูลทั่วไปเริ่มต้นและย้ายราคาต้นทุน/ราคาขาย/ภาษีต่อจากบริษัทผู้ผลิต ก่อนรายละเอียดสินค้า ถอนกล่องราคาและการจำหน่าย. ขอบเขต product-create-preview.tsx, ACTIVE/Specs/Plan/Task156. ลำดับบันทึก → ย้าย fields/สถานะเปิดปิด → lint/render/diff. คงชนิด input/default/ดาว/previewเดิม.

## TASK-155 กล่องเปิดปิดข้อมูลพื้นฐานสินค้า — 2026-10-06

- IMPLEMENTED / WAITING_FOR_UAT: กล่อง10ชนิดเปิดปิดแยกได้ lazy mount/คง state และ initialKind เปิดหัวข้อจากลิงก์. Render10กล่อง/1panelเริ่มต้น/ไม่มีselectorเดิมและ diff ผ่าน; ESLint รอบแรกผ่าน. TypeScriptพบ3error Prisma generatedเดิมใน users route/prisma.ts ไม่มีerrorไฟล์ที่แก้. ยังไม่คลิกจริงหรือรันCRUDกับDBในงานนี้ ไม่commit/deploy.

- IN_PROGRESS: แยกรายการกลาง10ชนิดเป็น details/summary แบบเพิ่มสินค้า. ขอบเขต product-options-manager.tsx และ ACTIVE/Specs/Plan/Task155. ลำดับบันทึก → กล่อง10รายการ/ฟอร์มและตารางแยก → lazy mount เมื่อเปิดและเก็บ state เมื่อพับ → lint/type/diff. คง API/กฎCRUD/สถานะกลาง.

## TASK-154 ชื่อ Topbar ตั้งค่าระบบ — 2026-10-06

- COMPLETED: Topbar ของ /settings และหน้าย่อยใช้ชื่อ “ตั้งค่าระบบ” แล้ว คงชื่อเมนูรองเดิม. ESLint/diff ผ่าน. ไม่มี API/DB/commit/deploy.

- IN_PROGRESS: เจ้าของให้ Topbar หน้าตั้งค่าระบบแสดงตั้งค่าระบบ. ขอบเขต admin-shell.tsx และ ACTIVE/Specs/Plan/Task154. ลำดับบันทึก → ใช้ชื่อหมวดตั้งค่าระบบทั้งหน้าหลัก/หน้าย่อย → ESLint/diff. ไม่เปลี่ยนชื่อ Side รองหรือพฤติกรรม.

## TASK-153 Checkpoint งานสินค้าและรายการกลาง — 2026-10-05

- CHECKPOINT_READY: บันทึก checkpointรอบ2/HANDOFF/Specs/Plan/แผนย่อยครบ. TypeScriptและESLintทุกไฟล์โค้ดที่เปลี่ยน/ใหม่ผ่าน; diff whitespaceผ่าน. เก็บ local commit บน AI และยืนยัน hash/status ด้วย Git หลัง commit. ไม่มี DB mutation/push/deploy. TASK152ยังรอคำตอบตามเดิม.

- IN_PROGRESS: เจ้าของขอ checkpoint. ขอบเขต ACTIVE/Specs/Plan/HANDOFF/Checkpointรอบ2/Task153 และเก็บไฟล์งานปัจจุบันด้วย local commit บน AI. ลำดับตรวจ diff/ไฟล์ → บันทึกผล TASK139–152 และข้อค้าง → TypeScript/ESLint/diff → stageตรวจรายการไม่รวม secrets/backups → commit → ตรวจ hash/status. ไม่เปลี่ยน DB ไม่ push/deploy.

## TASK-152 เชื่อมการสร้างสินค้าจริง — 2026-10-05

- DISCOVERY / WAITING_FOR_SCOPE: เจ้าของขอ API เพื่อทดลองตั้งค่าข้อมูลพื้นฐานและสร้างสินค้า. API รายการกลาง GET/POST/PATCH พร้อมอยู่แล้วตาม TASK151. ตรวจพบ POST สินค้าเดิมยังใช้ชื่อเดียว/รหัส4หลัก/category+dosageForm ส่วนฟอร์มใหม่มีชื่อสองภาษา/รหัส5หลัก/codeGroup+codeFormatแยกกันและข้อมูลเพิ่มเติม. รอบสำรวจแก้เฉพาะ ACTIVE/Specs/Plan/Task152 และตรวจ API รายการกลาง; ยังไม่เปลี่ยน schema/API write/ฟอร์มจนสรุปขอบเขตไฟล์แนบ. ถามเจ้าของว่าจะเริ่มบันทึกครบทุกช่องโดยไม่แนบไฟล์ หรือรวมรูปและเอกสารด้วย. แผนย่อยอยู่ tasks/TASK-152-product-create-api.md.

## TASK-151 ตั้งค่ารายการกลางสินค้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ตั้งค่าระบบ→ข้อมูลพื้นฐานสินค้า10ชุด/40รายการในDBจริง; Adminเพิ่ม/แก้ชื่อ/ปิด-เปิดผ่านAPIพร้อมaudit/versionได้. PreviewมีpickerDB10ช่องเลือกอย่างเดียว ไม่มีlocalStorage/เพิ่มชื่อในdropdown ลิงก์ตั้งค่าแท็บใหม่และrefreshเมื่อกลับ. Shellแสดงhub/new pageจริง; settingsทั่วไปเดิมไม่เปิด. dry-run/seed/readback/seedซ้ำhashคงเดิม/APIintegration10หัวข้อ rollback/HTTP401/render shell+preview/ESLint/TypeScript/Prisma generate/diffผ่าน. RLS/revokeตรวจแล้ว advisoryใหม่INFO no-policyตรงserver-only design. สินค้า12/ยอด950คงเดิม. ยังไม่คลิก/ตรวจภาพจริงในbrowser. ขอบเขตปิดงานACTIVE/Task151/Specs.

- ขอบเขตงานย่อยUI: เพิ่ม settings-home.tsxและsettings/layout.tsxให้Adminเข้าhub/new page; ไม่แทนหน้าsettings/page.tsxทั่วไปเดิมที่ยังพัก. Shellแสดงhubเฉพาะ/settingsและchildrenหน้าproduct-options. ส่วนpickerโหลดAPIตามkind/queryแบบแบ่งหน้าและrefreshเมื่อกลับแท็บ ไม่ใช้localStorage. ทำตามแผนTASK151ข้อ4–5.

- IN_PROGRESS: เจ้าของอนุมัติย้ายเพิ่มรายการComboboxไปตั้งค่าระบบและเติมข้อมูล. ขอบเขต docs/specs/2026-10-05-product-options.md, ACTIVE/Specs/Plan/Task151, DB product_options/schema/migration+seed, API/server/type/configรายการกลาง, หน้าตั้งค่า/เมนูรอง/AdminShell, comboboxกลางและpreview. ลำดับสัญญา/เอกสาร → ตาราง/seedแบบไม่เขียนทับ+RLS → APIอ่าน/เพิ่ม/แก้ชื่อ/ปิด-เปิดเฉพาะAdmin → ตั้งค่า10ชุด+เชื่อมpickerเลือกอย่างเดียว → ทดสอบDB/API/สิทธิ์/ซ้ำ/concurrency/รายการปิดไม่ลบข้อมูลเดิม+lint/type-check → UAT. ไม่ทำบันทึกสินค้า/เลขรันจริง/ไฟล์อัปโหลด.

## TASK-150 ถอนสถานะใช้งานสินค้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ถอนป้ายและตัวกรองใช้งาน/ไม่ใช้งานจากตารางทั้งสี่พร้อมstate/query แล้ว ถอนช่องสถานะสินค้า/metadata/selectในpreview. คงหัวสถานะ7คอลัมน์ ป้ายเตือนสต็อก/ลบแล้วและขีดเมื่อไม่มีป้าย. ESLint/Prettier/diff และrenderข้อมูลจำลองสี่รูปแบบ+previewผ่าน ไม่มีDB/API mutation. ยังไม่ตรวจภาพจริงในbrowser. ขอบเขตปิดงานACTIVE/Task150.

- IN_PROGRESS: เจ้าของให้เอาสถานะใช้งานออกและถอนการกรอกในเพิ่มสินค้า. ขอบเขต product-stock-list.tsx/product-create-preview.tsx และ ACTIVE/Specs/Plan/Design/API doc/Task150. ลำดับเอกสาร → ถอนตัวกรองและป้ายใช้งาน/ไม่ใช้งานจากสี่ตาราง คงคอลัมน์สถานะสำหรับคำเตือนสต็อก/ลบแล้ว → ถอนช่องสถานะสินค้าในpreview → ESLint/render/diff → UAT. ไม่เปลี่ยนDB/APIหรือสถานะจริงที่ธุรกรรมเดิมใช้.

## TASK-149 ข้อมูลสินค้า DB และ API — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: seedจริง12สินค้า/28ล็อต/950หน่วย และpolicyเดิมที่หายแล้ว ไม่แก้ฟอร์มเพิ่มสินค้า. ALL12รายการ950หน่วย MAIN9รายการ835หน่วย MARKETING11รายการ99หน่วย DISPOSAL8รายการ16หน่วย. dry-run rollback/readback/handlerจริงกับDB(เฉพาะidentity stub)/pagination/search/status/warehouse/ledger/ไม่ส่งcost/400-401-403/HTTP401/seedซ้ำ/ESLint/Prettier/diffผ่าน. ใช้APIเดิมที่ตารางต่ออยู่ ไม่เพิ่มendpointซ้ำ. ยังไม่ตรวจ browser แบบloginจริง. ขอบเขตปิดงานACTIVE/Task149/API doc.

- IN_PROGRESS: เจ้าของเลือกข้อ1 เติมข้อมูลตัวอย่างและต่อ API ตาราง ไม่ทำฟังก์ชันเพิ่มสินค้าจนช่องครบ. ขอบเขต scripts/seed-product-stock-demo.mjs, scripts/verify-product-stock-demo.mjs, docs/API-PRODUCT-STOCK.md และ ACTIVE/Specs/Plan/Task-149. ลำดับเอกสาร/สัญญา → seed12สินค้า+รายการกลาง+ล็อต/ยอด/ประวัติสามคลังใน transaction และเติม policy เดิม6/12/90เฉพาะที่ว่าง → readback/ทดสอบ handler จริงกับDB+identity stub/401 HTTP/seedซ้ำ → lint/diff/UAT. ไม่แก้ schema/บัญชี/ฟอร์ม/API write และไม่ seed โมดูลอื่น.

- DISCOVERY / WAITING_FOR_SCOPE: เจ้าของขอทำข้อมูลสินค้าใน DB พร้อม API และเชื่อมหน้าเว็บ. ตรวจ DB ที่ .env.local ใช้พบ products/categories/dosage_forms/drugs/warehouses/receipts/lots/balances ว่าง ผู้ใช้มี5บัญชี. API /api/products และ /api/inventory?view=products มีแล้ว ตอบ401เมื่อไม่เข้าสู่ระบบ ตารางสี่หน้าเชื่อม inventory อยู่แล้ว. ขอบเขตเอกสาร ACTIVE/Specs/Plan/Task-149 ก่อน ยังไม่เขียน DB หรือเปลี่ยนโค้ด. รอแยกขอบเขตข้อมูลตัวอย่างสำหรับตารางกับการบันทึกทุกช่องในฟอร์มใหม่ซึ่งต้องขยาย schema/สรุปกฎ OPEN. ห้ามใช้ seed ทุกโมดูลนอกขอบเขตสินค้า.

## TASK-148 ตารางสินค้า 7 คอลัมน์ทั้งสี่หน้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT รอบแก้ไม่แสดง: AdminShell render children เฉพาะสี่หน้าที่อนุมัติแล้ว. ตรวจ render ผ่าน AdminShell รวม ProductStockList ด้วย mock ข้อมูล/hook พบตาราง7คอลัมน์ทั้งสี่ และหน้าลูกค้ายังพักตามเดิม. ESLint/Prettier/diff ผ่าน. ไม่มี browser ที่เครื่องมือเชื่อมอยู่จึงยังไม่ตรวจข้อมูลสด/ภาพจริง. ขอบเขตปิดงาน ACTIVE/Task-148.

- IN_PROGRESS รอบแก้ไม่แสดง: พบ AdminShell พัก children และแสดง NavigationOnlyTabs จึงไม่เห็นตารางที่แก้. ขอบเขตเพิ่ม src/components/layout/admin-shell.tsx และ ACTIVE/Specs/Plan/Task-148. ลำดับบันทึกข้อยกเว้นการพักเนื้อหาสี่หน้าที่อนุมัติ → render children เฉพาะ /products และ /products/stock/main,marketing,disposal → lint/render ผ่าน shell/diff → UAT. คงหน้าอื่นตามโหมดเดิม.

- IMPLEMENTED / WAITING_FOR_UAT: ตารางกลางทั้งสี่หน้ามี 7 คอลัมน์ ไม่มีรูป/จัดการ หัวคงเหลือรวมหน้ารวมและคงเหลือหน้าคลัง. คงคำเตือน MAIN ใต้สถานะ ขยายพื้นที่ชื่อเป็น 28% และลดความกว้างขั้นต่ำตารางเป็น760pxตามจำนวนคอลัมน์ที่ลด. ESLint/Prettier/diff ผ่าน render ข้อมูลจำลองทั้งสี่รูปแบบผ่านหัวและเซลล์7ช่อง. ยังไม่ตรวจภาพจริงหรือข้อมูลสดใน browser. ขอบเขตปิดงาน ACTIVE/Task-148/Specs.

- IN_PROGRESS: เจ้าของให้ทำชุดคอลัมน์ที่เสนอหลังตัดรูป/จัดการในสินค้าทั้งหมด MAIN/MARKETING/DISPOSAL. ขอบเขต product-stock-list.tsx และ ACTIVE/Specs/Plan/Design/Task-148. ลำดับเอกสาร → ตารางกลาง 7 คอลัมน์ ถอนจอง/พร้อมใช้/พร้อมขายคลังหลัก ย้ายคำเตือนเดิมไปสถานะ → lint/ตรวจ render สี่รูปแบบ/diff → ส่ง UAT. คงยอด quantity ที่ API กรองคลังแล้ว ไม่แก้ API/DB/product-ui.ts.

## TASK-147 ชื่อสินค้าไม่มีรูปและไม่มีจัดการ — 2026-10-05

- DOCUMENTED / WAITING_FOR_UAT: บันทึก Specs/Plan/Design แล้ว ตารางจริงตรงอยู่แล้วชื่อเป็นข้อความ ไม่มีรูปและคอลัมน์จัดการ. ตรวจโครงสร้างและ git diff --check ผ่าน ไม่แก้โค้ด ยังไม่ตรวจภาพจริง. ขอบเขตปิดงาน ACTIVE/Task-147/Design.

- IN_PROGRESS: เจ้าของยืนยันแก้ข้อเสนอตารางสินค้า ไม่แสดงรูปเล็กข้างชื่อ และไม่มีคอลัมน์จัดการ. ตรวจ product-stock-list.tsx แล้วตรงอยู่แล้ว ขอบเขตเอกสาร ACTIVE/Specs/Plan/stock-screen-design/Task-147 เท่านั้น. ลำดับบันทึกข้อยืนยัน → ปรับเอกสารออกแบบที่ขัดกัน → ตรวจ diff/คอลัมน์จริง → ส่งตรวจรับ. ไม่เปลี่ยนคอลัมน์อื่นหรือโค้ด.

## TASK-146 ถอนคำอธิบายและปรับชื่อสินค้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ถอนข้อความท้ายหน้าและ helper ใต้ช่อง/ปุ่มพร้อม ARIA ที่อ้างแล้ว ชื่อสินค้าเต็มใช้ gap/ความกว้างเท่าช่องทั่วไปและไม่มี mt-3 ส่วนเกิน. ESLint สองไฟล์และ git diff --check ผ่าน ตรวจโครงสร้างแล้ว ยังไม่ตรวจภาพจริงในเบราว์เซอร์. ขอบเขตปิดงาน ACTIVE/Task-146.

- IN_PROGRESS: อนุมัติจากคำขอเจ้าของ ขอบเขต product-create-preview.tsx, product-name-combobox.tsx และ ACTIVE/Specs/Plan/Task-146. ลำดับบันทึกเอกสาร → ถอนข้อความท้ายหน้าและคำอธิบายใต้ช่อง/ปุ่มพร้อม ARIA ที่อ้าง → ปรับระยะและความกว้างชื่อสินค้าเต็มเท่าช่องอื่น → ESLint/diff → ตรวจรับคอม/มือถือ. ไม่แก้ product-ui.ts/API/DB.

## TASK-145 ลดความเข้มไอคอน Combobox — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT รอบปรับเพิ่ม: ลูกศรทั้งสอง component ใช้ opacity-30 แล้ว. ESLint สองไฟล์และ diff whitespace ผ่าน ยังไม่ตรวจภาพจริง. ขอบเขตปิดงาน ACTIVE/Task-145.

- IN_PROGRESS รอบปรับเพิ่ม: เจ้าของขอให้อ่อนลงอีกหลัง opacity-50. ขอบเขตสอง component เดิมและ ACTIVE/Specs/Plan/Task-145; ลำดับบันทึกข้อปรับ → เปลี่ยนเฉพาะลูกศรเป็น opacity-30 → ESLint/diff → ตรวจรับภาพ.

- IMPLEMENTED / WAITING_FOR_UAT: เพิ่ม opacity-50 เฉพาะลูกศร Combobox ทั้งสอง component แล้ว. ESLint สองไฟล์และ diff whitespace ผ่าน ยังไม่ตรวจภาพจริง. ขอบเขตปิดงาน ACTIVE/Task-145.

- IN_PROGRESS: เจ้าของขอไอคอนอ่อนลงเพราะดูลอย. ขอบเขต product-create-preview.tsx, product-name-combobox.tsx และ ACTIVE/Specs/Plan/Task-145. ลำดับบันทึก → เพิ่ม opacity-50 ที่ wrapper ไอคอนทั้งสอง → ESLint/diff → ตรวจรับภาพ. คง SVG/stroke #101828/ตำแหน่งและพฤติกรรม ไม่แก้ product-ui.ts/API/DB.

## TASK-144 SVG Combobox กลางขวา — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Combobox ว่างและยี่ห้อ/ผู้ผลิตใช้ SVG 14×8 สี #101828 ตามเจ้าของแล้ว wrapper right-3/top-0/h-11/items-center ตรงกลางช่อง. ESLint สองไฟล์และ diff whitespace ผ่าน ยังไม่ตรวจภาพจริง. ขอบเขตปิดงาน ACTIVE/Task-144.

- IN_PROGRESS: เปลี่ยนลูกศร Combobox ในหน้าเพิ่มสินค้าเป็น SVG 14×8 ตามเจ้าของ และวางกลางแนวตั้งด้านขวาของช่อง h-11. ขอบเขต product-create-preview.tsx, product-name-combobox.tsx และ ACTIVE/Specs/Plan/Task-144. ลำดับบันทึก → เปลี่ยน SVG/คลาสตำแหน่งทั้ง Combobox ว่างและยี่ห้อ/ผู้ผลิต → ESLint/diff → ตรวจรับคอม/มือถือ. คงสี #101828/พฤติกรรมเดิม ไม่แก้ product-ui.ts/API/DB.

## TASK-143 ย่อขยายหมวดสินค้าเริ่มปิด — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ทั้งสี่หมวดใช้ details/summary เริ่มปิด SVG เจ้าของหมุนชี้ข้าง/ลงตามสถานะ รองรับ reduced motion/focus และคงช่อง mounted. ESLint เฉพาะไฟล์และ diff whitespace ผ่าน ตรวจโค้ดไม่ใส่ open/ไม่ unmount ช่องแล้ว ยังไม่คลิกหรือดูภาพจริงใน browser. ขอบเขตปิดงาน ACTIVE/Task-143.

- IN_PROGRESS: เจ้าของขอย่อ/ขยายทั้งสี่หมวด เริ่มปิด ใช้ SVG ลูกศรที่ให้และหมุนตามสถานะ. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task-143. ลำดับบันทึก → details/summary เริ่มปิด ลูกศรชี้ข้างตอนปิด/ชี้ลงตอนเปิด → ESLint/diff → ตรวจรับคลิก/คีย์บอร์ด/ข้อมูลคงอยู่. คงช่อง mounted เพื่อไม่ล้างค่าหรือไฟล์แนบ ไม่แก้ product-ui.ts/API/DB.

## TASK-142 ถอนชื่อเหนือช่องรหัสสามท่อน — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: label สามช่องใช้ sr-only แล้ว คงชื่อที่เข้าถึงได้/ช่อง/พฤติกรรมเดิม. ESLint เฉพาะไฟล์และ diff whitespace ผ่าน ยังไม่ตรวจภาพจริง. ขอบเขตปิดงาน ACTIVE/Task-142.

- IN_PROGRESS: ซ่อน label กลุ่มรหัส/รูปแบบ/เลขลำดับเหนือช่องตามคำขอ โดยใช้ sr-only เพื่อคงชื่อสำหรับโปรแกรมอ่านหน้าจอ. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task-142. ลำดับบันทึก → เปลี่ยนคลาส label สามช่อง → lint/diff. คงช่อง/placeholder/helper/legend/พฤติกรรมเดิม ไม่แก้ product-ui.ts/API/DB.

## TASK-141 ปุ่มเหนือเส้นข้อความสต็อก — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ย้ายกลุ่มปุ่มเหนือข้อความ border-t แล้ว คงข้อความ/คำอธิบาย/Alert เดิม. ESLint เฉพาะไฟล์และ diff whitespace ผ่าน ตรวจลำดับ JSX แล้ว ยังไม่ตรวจภาพหรือคลิกจริง. ขอบเขตปิดงาน ACTIVE/Task-141.

- IN_PROGRESS: ย้ายกลุ่มยกเลิก/บันทึกพร้อมคำอธิบายขึ้นเหนือเส้นและข้อความเรื่องข้อมูลรับเข้าสต็อกตามคำขอ. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task-141. ลำดับบันทึก → ย้ายข้อความ border-t ลงหลังกลุ่มปุ่ม → lint/diff → ตรวจรับคอม/มือถือ. คง Alert และข้อความเดิม ไม่เพิ่มหน้า/ช่องสต็อก/API/DB ไม่แก้ product-ui.ts.

## TASK-140 กรอบหมวดสินค้าและถอนการจัดเก็บ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: สี่หมวดมี border สีเดิม/rounded-lg/padding responsive แล้ว ถอนหมวดและ metadata เงื่อนไขจัดเก็บครบ. ESLint เฉพาะไฟล์และ diff whitespace ผ่าน ตรวจโค้ดชื่อสี่หมวด/ราคาต้นทุนยังอยู่. ยังไม่ตรวจภาพหรือคลิกจริงในเบราว์เซอร์. ขอบเขตปิดงาน ACTIVE/Task-140.

- IN_PROGRESS: เจ้าของขอกล่อง border/rounded ครอบข้อมูลทั่วไป ข้อมูลยาและทะเบียน ราคาและการจำหน่าย รูปสินค้าและเอกสาร และถอนการจัดเก็บ/เงื่อนไขจัดเก็บ. ขอบเขต src/components/products/product-create-preview.tsx, ACTIVE/Specs/Plan และ tasks/TASK-140-product-section-boxes.md. ลำดับบันทึก → กรอบสี่หมวด/ถอนหมวดและ metadata → ESLint/diff → ตรวจรับคอม/มือถือ. คงช่องอื่นรวมราคาต้นทุนและ preview เดิม ไม่แก้ product-ui.ts/API/DB.

## TASK-139 ราคาต้นทุนในราคาและการจำหน่าย — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: เพิ่มราคาต้นทุนก่อนราคาขายแล้ว รองรับทศนิยมเริ่มว่าง ไม่มีดาวบังคับ. ESLint เฉพาะไฟล์และ diff whitespace ผ่าน; ตรวจโค้ดลำดับ/ชนิดช่องแล้ว ยังไม่ทดสอบกรอกจริงในเบราว์เซอร์. คง preview ไม่เชื่อม API/DB. ขอบเขตปิดงาน ACTIVE/Task-139.

- IN_PROGRESS: เจ้าของขอเพิ่มราคาต้นทุนในหน้าเพิ่มสินค้า. ขอบเขต src/components/products/product-create-preview.tsx, ACTIVE, Specs, Plan และ tasks/TASK-139-product-cost-price.md. ลำดับบันทึกข้อกำหนด/แผน → เพิ่มช่องราคาต้นทุนก่อนราคาขาย → lint/diff → ตรวจรับคอม/มือถือ. ช่องตัวเลขทศนิยมเริ่มว่าง ไม่เพิ่มดาวบังคับหรือสูตรต้นทุน/API/DB. คง preview เดิม. ไม่แก้ src/app/products/product-ui.ts ที่เจ้าของมีงานค้าง.

## TASK-138 Checkpoint ก่อนพัก — 2026-10-05

- CHECKPOINT_READY: เอกสาร checkpoint/HANDOFF พร้อม; ESLint layout/products/navigation/reports, offline route checks 74 หน้า และ diff ผ่าน. เก็บด้วย local Git commit AI (ดู hash จาก Git log). ไม่ push/deploy; UAT/backend pending ตาม checkpoint.

- IN_PROGRESS: เจ้าของขอ checkpoint ก่อนพัก. ขอบเขตเอกสาร checkpoint/HANDOFF/ACTIVE/Specs/Plan/Task และ local Git commit ของงานปัจจุบัน TASK097–137 บน AI. ลำดับตรวจรายการ → บันทึกสถานะ/งานค้าง → lint/diff → commit → ตรวจ Git. ไม่ push/deploy ไม่รวม local-backups.

## TASK-137 ปุ่มบันทึก/ยกเลิกและ SuccessAlert — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ปุ่มขวาล่างพร้อมคำอธิบายและ Alert แยกบันทึก/ยกเลิกแล้ว ปิดกลับกรอกต่อ. ESLint/render initial state/diff ผ่าน ยังไม่คลิกจริงในเบราว์เซอร์. ไม่มีการบันทึก DB/ล้างข้อมูล/นำทาง/commit/deploy.

- IN_PROGRESS: เพิ่มปุ่มขวาล่างและ SuccessAlertComponent พร้อมคำอธิบายทั้งสองปุ่มในหน้า preview. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task-137. ลำดับบันทึก → ปุ่ม/สถานะ Alert → lint/render/diff. ยังไม่บันทึก DB/ล้างข้อมูล/นำทาง และข้อความไม่อ้างสำเร็จจริง.

## TASK-136 บริษัทผู้ผลิตข้างหน่วยสินค้า — 2026-10-05

- COMPLETED: บริษัทผู้ผลิตอยู่ถัดจากหน่วยสินค้า ก่อนรายละเอียดสินค้าแล้ว ใช้ flex สองคอลัมน์เดิม. ตรวจลำดับ/ESLint/diff ผ่าน. ไม่เปลี่ยนพฤติกรรม/API/DB ไม่ commit/deploy.

- IN_PROGRESS: ย้ายบริษัทผู้ผลิตถัดจากหน่วยสินค้าในข้อมูลทั่วไป เพื่ออยู่คู่กันบนจอกว้างและเรียงต่อกันบนมือถือ. ขอบเขต product-create-preview.tsx, ACTIVE/Specs/Plan และ tasks/TASK-136-manufacturer-beside-unit.md. ลำดับบันทึก → ย้ายลำดับ field → lint/diff. คงพฤติกรรม Combobox เดิม.

## TASK-135 ชื่อไทยอังกฤษและรหัสเต็มใน placeholder — 2026-10-05

- COMPLETED: ถอน3labelเหนือกล่องและใช้placeholder/aria-labelตรงชื่อแล้ว คงlegend/ดาว/readOnly. ESLint/diff whitespaceผ่าน ไม่มีAPI/DB/พฤติกรรมเปลี่ยน ไม่commit/deploy. ขอบเขตปิดงานACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งถอนชื่อสินค้าเต็มไทย/อังกฤษและรหัสสินค้าเต็มจากlabelบนช่อง ย้ายไปplaceholder. ขอบเขต product-create-preview.tsx และACTIVE/Specs/Plan/Task. ลำดับบันทึก → ถอน3labelที่มองเห็น ตั้งplaceholder/aria-label → lint/diff. คงหัวข้อกลุ่ม/ดาว/ช่อง/readOnlyเดิม. แผน tasks/TASK-135-product-placeholder-labels.md.

## TASK-134 ถอนคำอธิบายใต้หัวข้อหมวดสินค้า — 2026-10-05

- COMPLETED: ถอนdescription5หมวดและrenderแล้ว คงชื่อหมวด/ช่อง/helperรายช่อง. ESLint/diff whitespaceผ่าน ไม่มีพฤติกรรม/API/DBเปลี่ยน ไม่commit/deploy. ขอบเขตปิดงานACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งลบคำอธิบายใต้หัวข้อทั้ง5หมวด. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → ถอนsection.descriptionและข้อความrender → lint/diff. คงชื่อหมวด/ช่อง/helperรายช่อง/พฤติกรรมเดิม. แผน tasks/TASK-134-remove-product-section-descriptions.md.

## TASK-133 แนบรูปและเอกสารหลายไฟล์ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: แนบรูป/เอกสาร multiple เพิ่มสะสมได้ รายการthumbnail/ชื่อ/ขนาด/จำนวน/นำออกและดูไฟล์localครบ. ObjectURLคืนเมื่อถอด/unmountหรือpreviewสร้างล้มเหลว. ESLint2ไฟล์, image/PDF accept/reject และrender2multipleช่องว่าง/diffผ่าน. ยังไม่เลือกไฟล์จริงในbrowserหลังlogin; ตรวจรับTASK-133. ไม่มีupload/API/DB/จำนวนสูงสุด/commit/deploy. ขอบเขตปิดงานACTIVE/Task.

- IN_PROGRESS: เจ้าของขอแนบรูปสินค้า/เอกสารและโชว์ว่าแนบอะไร กี่รูปก็ได้. ขอบเขต product-attachment-field.tsx ใหม่, product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → file input multiple/เพิ่มสะสม → รูปthumbnail/เอกสารชื่อไฟล์/จำนวน/นำออก → จัดการobjectURLคืนเมื่อถอด/ออกหน้า → lint/render/diff. ไม่ตั้งจำนวนสูงสุดเอง ไม่upload/storage/DB; ไฟล์อยู่เฉพาะหน้า. แผน tasks/TASK-133-product-attachments.md.

## TASK-132 ราคาขาย ภาษี และสถานะเริ่มต้น — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ราคาขาย/ภาษีเปลี่ยนชื่อแล้ว ภาษีnumberเริ่ม7แก้ได้พร้อม% สถานะselectเริ่มเปิดขายและเลือกพักขาย/เลิกจำหน่ายได้ ถอน2ช่องแจ้งเตือนหมวดเหลือการจัดเก็บ. ESLint/render defaults/removed labels/diff whitespace ผ่าน; ยังไม่ลองพิมพ์จริงหลังlogin ตรวจรับTASK-132. ไม่แก้API/DB/สูตร/เกณฑ์แจ้งกลาง ไม่commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของเปลี่ยนราคาขายมาตรฐาน→ราคาขาย ประเภทภาษี→ภาษีเริ่ม7แก้เลขได้ สถานะเริ่มเปิดขาย ลบแจ้งใกล้หมดและเกณฑ์ใกล้หมดอายุ. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → labels/required metadata → ภาษีnumber7พร้อม%และสถานะselectเปิดขาย → ถอน2ช่อง/เปลี่ยนหัวข้อการจัดเก็บ → lint/render/diff. เป็นค่าเริ่มต้นUI ไม่เปลี่ยนสูตร/API/DB/กฎแจ้งเตือนกลาง. แผน tasks/TASK-132-product-price-tax-status.md.

## TASK-131 ถอนหมวดหน่วยและบรรจุภัณฑ์ — 2026-10-05

- COMPLETED: ถอนหมวด/5ช่องอื่นและ metadata แล้ว หน่วยสินค้าอยู่ข้อมูลทั่วไปเป็นComboboxว่าง/ดาวเดิม. ESLint/diff whitespace ผ่าน. ไม่เปลี่ยน schema/API/ธุรกรรม/commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของไม่เอาหมวดหน่วยและบรรจุภัณฑ์ ย้ายหน่วยขายหลักเป็นหน่วยสินค้าในข้อมูลทั่วไป. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → ย้าย/เปลี่ยนชื่อหน่วยสินค้า คงCombobox/required → ถอนหมวดและ metadata ของหน่วยย่อย/ฐาน/ขนาดบรรจุ/แปลงหน่วย/บาร์โค้ด → lint/diff. ไม่เปลี่ยน schema/API/กฎธุรกรรม. แผน tasks/TASK-131-product-unit-general.md.

## TASK-130 ถอนช่องบริษัทเจ้าของสิทธิ์ — 2026-10-05

- COMPLETED: ถอนบริษัทเจ้าของสิทธิ์จาก fields/Combobox metadata แล้ว คงผู้ผลิต/ยี่ห้อเดิม. ESLint/diff whitespace ผ่าน. ไม่เปลี่ยน API/DB/commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของไม่เอาบริษัทเจ้าของสิทธิ์. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → ถอน field/Combobox metadata → lint/diff. คงบริษัทผู้ผลิต/ยี่ห้อและข้อมูลเบราว์เซอร์เดิม ไม่เปลี่ยน API/DB. แผน tasks/TASK-130-remove-rights-company.md.

## TASK-129 ผู้ผลิตพิมพ์เพิ่มและจำ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ผู้ผลิตเพิ่ม/ค้นหา/เลือกชื่อเดิมได้ด้วย component เดียวกับยี่ห้อแล้ว แยก storage key และคงยี่ห้อ key เดิม. ESLint 2 ไฟล์, persistence/dedupe/key compatibility/isolation/SSR labels และ diff whitespace ผ่าน. ยังไม่ลอง browser หลัง login; ตรวจรับ TASK-129. ไม่มีเจ้าของสิทธิ์/API/DB/บันทึกสินค้า/commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของขอบริษัทผู้ผลิตทำเหมือนยี่ห้อ. ขอบเขต product-brand-combobox.tsx เปลี่ยนเป็น product-name-combobox.tsx ที่รองรับชนิด, product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → ใช้ component เดียวเลือก brand/manufacturer แยก storage key → ผู้ผลิตพิมพ์เพิ่ม/เลือกชื่อเดิมพร้อม dedupe → lint/storage isolation/render/diff. คงข้อมูลยี่ห้อเดิม ไม่ทำเจ้าของสิทธิ์/DB/ข้อมูลกลาง. แผน tasks/TASK-129-remember-manufacturers.md.

## TASK-128 ยี่ห้อพิมพ์เพิ่มและจำให้เลือก — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ยี่ห้อเป็น creatable/searchable Combobox จำรายการใน localStorage แล้ว ไม่มี seed. ตรวจ persistence/dedupe whitespace/case, invalid data ไม่ทับ, storage blocked และ empty SSR ผ่าน; ESLint 2 ไฟล์/diff whitespaceผ่าน. อ่านใหม่ตอนเปิดเพื่อเลือกชื่อเดิม ไม่บันทึกสินค้า/ไม่แชร์ข้ามเครื่อง/API/DB. ยังไม่ลองคลิก/คีย์บอร์ดจริงหลัง login; ตรวจรับ TASK-128. ไม่ commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของขอพิมพ์ยี่ห้อใหม่พร้อมจำเป็นตัวเลือกเดิม. ขอบเขต product-create-preview.tsx, product-brand-combobox.tsx ใหม่ และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → creatable/searchable brand Combobox ไม่มี seed → จำชื่อที่เลือกเพิ่มใน localStorage เบราว์เซอร์เดิมตามขอบเขตยังไม่DB → ป้องกันชื่อซ้ำ whitespace/case → lint/render/diff. ไม่บันทึกสินค้า/ไม่เชื่อมข้อมูลร่วมทุกเครื่อง. แผน tasks/TASK-128-remember-product-brands.md.

## TASK-127 ชื่อสินค้าเต็มไทย/อังกฤษ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: กลุ่มชื่อสินค้าเต็มแยก text ไทย/อังกฤษแล้ว flex คอมคู่/มือถือเต็มแถว. คงดาวกลุ่มและข้อความอย่างน้อยหนึ่งภาษา ไม่บังคับทั้งสองช่องแยก. ชื่อการค้าเดิมคงอยู่. ESLint/diff whitespace ผ่าน; ยังไม่ตรวจภาพหลัง login ตรวจรับ TASK-127. ไม่มี API/DB/validationบันทึก/commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งเพิ่มชื่อสินค้าเต็มไทย/อังกฤษ และถามความต่างจากชื่อการค้า. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → แยกชื่อเต็มเป็น 2 ช่องในกลุ่มชื่อสินค้าเต็ม → คงบังคับอย่างน้อยหนึ่งภาษาตามร่างเดิม ไม่บังคับทั้งสองภาษา → lint/render/diff → อธิบายตัวอย่าง. ไม่เพิ่ม API/DB/validationบันทึก. แผน tasks/TASK-127-product-bilingual-name.md.

## TASK-126 โครงช่องรหัสสินค้าแยกท่อน — 2026-10-05

- UI_IMPLEMENTED / BACKEND_PENDING: โครงรหัสเต็มแถวมี Combobox กลุ่มรหัส/รูปแบบว่าง เลขลำดับแก้ได้เป็น numeric text สูงสุด5หลักและเติมศูนย์เมื่อ blur กับรหัสเต็ม readOnly แล้ว. ESLint/render/diff ผ่าน; render15Combobox/ไม่มีoptions/IDlinkageถูกต้อง. ยังไม่รันเลข/เช็กซ้ำจริงกับ DB ตามขอบเขต preview; กฎใหม่บันทึกแล้วสำหรับงาน master/server/constraint. ยังไม่ลองพิมพ์จริงหลัง login ไม่ commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของยืนยันกลุ่มรหัส/รูปแบบเป็น Combobox เลขลำดับรันและแก้เองได้ห้ามซ้ำ. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึกกฎใหม่ → โครงรหัส 2 Combobox ว่าง + เลขลำดับแก้ได้ + รหัสเต็มอ่านอย่างเดียว → lint/render/diff. คงไม่โหลดข้อมูล/ไม่บันทึกตาม preview ก่อนหน้า. รัน/unique ตามคู่กลุ่มรหัสและรูปแบบที่คุยไว้; server เดิมใช้ category จึงยังใช้กับกฎใหม่ไม่ได้ ต้องทำ master/API/constraint แยกเมื่อเชื่อมจริง. ไม่อ้างว่า UI ตรวจเลขซ้ำ DB ได้. แผน tasks/TASK-126-product-code-fields.md.

## TASK-125 Flex ฟอร์มสินค้าเต็มกรอบ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ฟอร์ม w-full ไม่มี max-width แล้ว; flex-wrap/basis จัดทั่วไป 2 คอลัมน์และ textarea/มือถือเต็มแถว. ESLint/diff whitespace ผ่าน. ยังไม่ตรวจภาพขยาย/ย่อ Side จริง; ตรวจรับ TASK-125. คง31ช่อง/13Combobox/9ดาวและพฤติกรรมเดิม ไม่แก้ DB/commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งใช้ flex จัดและให้เต็มกรอบเมื่อขยาย. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึก → ลบ max-width/จัดกลาง → flex-wrap ช่องคอม 2 คอลัมน์ มือถือและ textarea เต็มแถว → lint/diff. ช่อง/required/Combobox/เมนู/DBเดิม. แผน tasks/TASK-125-product-flex-layout.md.

## TASK-124 ดาวแดงช่องบังคับสินค้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ดาวแดง 9 ช่องบังคับทั่วไปและ aria-required ตรงกันแล้ว; ช่องอื่นไม่มีดาว รวม31ช่อง/13Comboboxคงเดิม. ESLint/render count/diff whitespace ผ่าน. ไม่มี validation/API/DB ใหม่; conditional fields ยังรอประเภท/กฎ. ตรวจรับ TASK-124 ยังไม่ตรวจภาพหลัง login. ไม่ commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่ง * สีแดงเฉพาะช่องบังคับ. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึกขอบเขต → ทำ metadata 9 ช่องบังคับทั่วไปตามร่างก่อนหน้า → label ดาวแดงและ aria-required ตรงกัน → lint/render/diff. เป็นเครื่องหมายใน preview ไม่เพิ่ม validation/API/DB. ช่องตามประเภทไม่ติดดาวขณะยังไม่มีประเภทที่เลือก. แผน tasks/TASK-124-product-required-markers.md.

## TASK-123 ลบหัวข้อเกริ่นหน้าเพิ่มสินค้า — 2026-10-05

- COMPLETED: ลบ header ภายในฟอร์มทั้งหัวข้อและข้อความเกริ่น/เส้นคั่นแล้ว เริ่มที่ข้อมูลทั่วไป. Scoped ESLint/diff whitespace ผ่าน. ช่องกรอก/Combobox/Topbar/Side เดิม ไม่ commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งลบ “เพิ่มสินค้า” และข้อความเกริ่นชุดข้อมูลหลักเหนือฟอร์ม. ขอบเขต product-create-preview.tsx, ACTIVE/Specs/Plan/tasks/TASK-123-remove-product-intro.md. ลำดับบันทึกข้อยืนยัน → ลบ header ภายในฟอร์มทั้งชุด → lint/diff. คง Topbar/Side/ช่องกรอกและ Combobox เดิม ไม่มี API/DB.

## TASK-122 Combobox ว่างในหน้าเพิ่มสินค้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Combobox ว่าง 13 ช่องครบแล้ว แยกชื่อการค้า text จากยี่ห้อ รวม 31 ช่อง; ไม่มี options/ข้อมูลจำลองหรือคำค้นเป็นค่าที่เลือก. Focus/click/ArrowDown/Enter เปิด Escape/blur ปิดและล้างคำค้น. ESLint, render 13 Combobox/31 labels/10 textarea/ID linkage/ไม่มี options, route checks 74 และ diff whitespace ผ่าน. ยังไม่ลองคีย์บอร์ดจริงหลัง login; ตรวจรับ TASK-122. ไม่โหลด API/DB/submit ไม่ commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งช่องที่เป็น Combobox ให้ใช้เลยแต่ไม่มีข้อมูลด้านใน. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task. ลำดับบันทึกข้อยืนยัน → ช่องข้อมูลอ้างอิง 13 ช่องเป็น searchable Combobox ว่าง → label/keyboard/empty state → lint/render/routes/diff. แยกชื่อการค้า (ข้อความ) จากยี่ห้อ (Combobox) จึงรวม 31 ช่อง. ไม่มี options จำลอง/โหลด API/DB/submit/required ใหม่; รายละเอียดรูป/เอกสารยังข้อความ. แผน tasks/TASK-122-empty-product-combobox.md.

## TASK-121 ช่องกรอกแบบกล่องหน้าเพิ่มสินค้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: เปลี่ยน 30 รายการเป็น input text 20 ช่องและ textarea 10 ช่อง พร้อม label/help/focus และ responsive แล้ว. ข้อมูลอยู่เฉพาะช่องในหน้า ไม่มี submit/API/DB/Combobox/upload หรือ required ใหม่. Scoped ESLint และ route checks 74 ผ่าน; render ตรวจจำนวนและ label/help ผ่าน; diff whitespace ผ่าน. ยังไม่ตรวจพิมพ์จริงหลัง login; ตรวจรับตาม TASK-121. ไม่ commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งทำช่องกรอกเป็น box ต่อจาก text preview. ขอบเขต product-create-preview.tsx และ ACTIVE/Specs/Plan/Task เท่านั้น. ลำดับบันทึกข้อยืนยัน → เปลี่ยน 30 รายการเป็น input text/textarea พร้อม label/help → จัดคอม 2 คอลัมน์/มือถือ 1 คอลัมน์ → lint/render/routes/diff. พิมพ์ได้ในหน้าแต่ยังไม่บันทึก ไม่มี Combobox/upload/API/DB หรือ required ธุรกิจ; หน้าอื่นคงเดิม. แผน tasks/TASK-121-product-input-boxes.md.

## TASK-120 หน้าเพิ่มสินค้าแบบข้อความ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: /products/create สำหรับ Admin แสดง preview ข้อความ 30 รายการใน 6 หมวดแล้ว ผ่าน AdminShell; หน้าอื่นคง navigation-only และฟอร์มธุรกรรมเดิมไม่ mount. ไม่มี input/Combobox/ปุ่มบันทึกหรือ upload. ยังไม่มีคำตอบคำถาม text-only/input จึงยึดข้อความอย่างเดียว. ESLint 2 ไฟล์, renderToStaticMarkup ตรวจ 30 ชื่อ/6 หมวด/ไม่มี controls, route checks 74 และ diff whitespace ผ่าน. ยังไม่ตรวจภาพหลัง login; ไม่แก้ API/DB/สิทธิ์ ไม่ commit/deploy. ขอบเขตปิดงาน ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งทำหน้าเพิ่มสินค้าเป็น text ก่อน. ขอบเขต ACTIVE/Specs/Plan/Task, admin-shell.tsx และ product-create-preview.tsx ใหม่. ลำดับบันทึกแผน → จัดหัวข้อข้อมูลหลัก/ยา/หน่วย/ราคา/จัดเก็บ/เอกสาร → เปิด preview เฉพาะ /products/create → lint/routes/diff. รอคำตอบว่าเฉพาะข้อความหรือช่องกรอกข้อความ; ค่าเริ่มต้นยึด text-only. ไม่เปิดฟอร์มธุรกรรมเดิม/Combobox/บันทึก DB ไม่เดากฎบังคับ/แปลงหน่วย; หน้าอื่นยัง navigation-only.

## TASK-119 แผนชุดรหัสและ Combobox สินค้า — 2026-10-05

- DOCUMENTATION_ONLY: เจ้าของต้องการเพิ่มชุดรหัส/หมวดหมู่ภายหลังผ่านตั้งค่าระบบ และกรอกข้อมูลสินค้าแบบ Combobox. ขอบเขต ACTIVE/Specs/Plan/tasks/TASK-119-product-master-combobox-plan.md เท่านั้น. ลำดับตรวจ Combobox เดิม → บันทึกข้อยืนยัน → เสนอชุดข้อมูลและพฤติกรรมเลือก/ค้นหา/จัดการรายการ. ไม่แก้ UI/API/DB; ตัวอักษรรหัสจริง รายการตั้งต้น สิทธิ์เพิ่ม/แก้/ปิด และผลเปลี่ยนประเภทต่อรหัสเดิมยังต้องสรุปก่อน implementation.

## TASK-118 สต็อกสินค้าเป็นเมนูหลัก — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: สต็อกสินค้าเป็น Side หลักต่อจากโปรโมชันก่อนเขตแล้ว Side รองรายงานสต็อกสินค้า/เพิ่มสต็อกสินค้า routes เดิม. Header/active แยกจากสินค้า; คลังหลัก/การตลาด/รอทำลายยังอยู่หมวดสินค้า. ESLint 3 ไฟล์, route checks 74 หน้า, registry order/parent checks และ diff whitespace ผ่าน. ยังไม่ตรวจภาพหลัง login; ตรวจรับตาม TASK-118. ไม่แก้ฟอร์ม/API/DB/สิทธิ์ ไม่ commit/deploy. ขอบเขตปิดงานบันทึกผล ACTIVE/Task.

- IN_PROGRESS: เจ้าของสั่งย้ายล็อตสินค้าเป็น Side หลักชื่อสต็อกสินค้า ต่อจากโปรโมชัน & ของแถม (ก่อนเขต). Side รองรายงานสต็อกสินค้า/เพิ่มสต็อกสินค้า. ขอบเขต navigation.ts, admin-shell.tsx, stock-secondary-sidebar.tsx ใหม่ และ Specs/Plan/Task. ลำดับบันทึกข้อกำหนด → ย้าย /products/stock และเปลี่ยน parent /purchases/receipts ไปสต็อก → แยก Header/Side รองและ active → lint/routes/diff. ใช้ routes เดิม เก็บ Tab ล็อตเดิม; ไม่เพิ่มฟอร์ม/รายงาน/API/DB หรือกฎรับเข้า.

## TASK-117 ล้างรายการ Postman ที่เลิกใช้ — 2026-10-05

- COMPLETED / WAITING_FOR_UAT: ลบ 18 requests จาก Cloud/local แล้ว เหลือ 115/21 folders. อ่าน Cloud กลับตรวจ retained items คงเดิมทุกฟิลด์ ยกเว้น updatedAt โฟลเดอร์ orders ที่ Postman ปรับตามการลบ; variables/auth/events เดิมครบ. Local deep comparison ตรงกับ backup ที่ลบเป้าหมายเท่านั้น; authenticated 24 คำขอคงเดิม. Backup ignored TASK-117-cloud-before.json/TASK-117-local-before.json. ปรับคู่มือ/README แล้ว diff whitespace ผ่าน; ไม่ Send/เปลี่ยน backend/DB/commit/deploy. ขอบเขตปิดงานบันทึกผล ACTIVE/Task/Plan.

- IN_PROGRESS: เจ้าของสั่งลบชื่อเส้น API ที่ไม่ใช้ใน Postman. ขอบเขต Collection Cloud Zuugroup 55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903 และไฟล์ local เดิม, postman/README.md, docs/API-NAME-GUIDE.md, Specs/Plan/Task และ backup ignored. ตรวจข้อกำหนด/ผู้เรียก → สำรอง Cloud/local → ลบ customer-groups 8 และ billing 8; orders deleted/restore เดิม 2 → ตรวจอ่านกลับและเปรียบเทียบให้รายการอื่นคงเดิม. ไม่ลบ API implementation/DB หรือเรียก API ธุรกิจ. แผน tasks/TASK-117-postman-cleanup.md.

## TASK-116 ล้างข้อมูล DB ยกเว้นผู้ใช้ — 2026-10-05

- COMPLETED / WAITING_FOR_UAT: ล้าง 30 ตารางธุรกิจแล้ว ตรวจ readback ทุกตารางเหลือ 0; ผู้ใช้ 5 คนและ hash ทั้ง 7 ตารางที่เก็บตรงก่อนล้าง. สำรอง local-backups/TASK-116-2026-10-05T09-05-00-573Z-before-reset.json และผลตรวจไฟล์ชื่อเดียวกันลงท้าย result.json. node syntax/ESLint ผ่าน; ไม่ seed/เปลี่ยน schema/commit/deploy. ขอบเขตปิดงานเฉพาะบันทึกผลใน ACTIVE/Task/Plan.

- IN_PROGRESS: เจ้าของสั่งลบข้อมูล DB ทุกอย่างยกเว้น user เพื่อเริ่มใหม่. ขอบเขต Specs/Plan/Task, scripts/reset-business-data.mjs, local-backups ที่ ignore และข้อมูลตาราง public ของ DB ปัจจุบัน. ลำดับตรวจตาราง/เป้าหมาย/FK → สำรองข้อมูลจริงและล็อก transaction → ล้างข้อมูลธุรกิจโดยไม่ CASCADE → ตรวจเหลือศูนย์และ hash ผู้ใช้/สิทธิ์เท่าเดิม → commit transaction. เก็บ users/auth_accounts/user_roles/roles/permissions/role_permissions และ migration metadata เพื่อให้ผู้ใช้ล็อกอินได้; ไม่แตะ schema auth/storage หรือโครงสร้างตาราง. แผน tasks/TASK-116-reset-business-data.md.

## TASK-115 Topbar คอมรวม 82px — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: header คอมขั้นต่ำ 72px + แถบบน 10px รวม 82px แล้ว; fallback Side รอง/พื้นที่เนื้อหาปรับตรงกัน. มือถือคงเดิม. ESLint 2 ไฟล์และ diff whitespace ผ่าน; ยังไม่ตรวจภาพหลัง login ตรวจรับตาม TASK-115. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งลด Topbar เหลือ 82 หลังทราบรวมเดิม 102px. ขอบเขต Specs/Plan/Task, admin-shell.tsx, secondary-sidebar-frame.tsx; บันทึกข้อยืนยัน → header คอมขั้นต่ำ 72px รวมแถบบน 10px เป็น 82px → fallback/ระยะเนื้อหา 82px → ตรวจ lint/diff. มือถือคงรวม 90px; คง sticky/ข้อมูล/สีเดิม. แผน tasks/TASK-115-topbar-height.md.

## TASK-114 พักเนื้อหาทุกหน้า เหลือเมนูและ Tab — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: AdminShell หลัง login ไม่ mount children เนื้อหาเดิมแล้ว แสดงเฉพาะ Tab จาก metadata/สินค้า/ล็อต/ผู้ใช้ ซ่อน Tab เดียว; รายละเอียด/สร้าง/รายงานเป็นหน้าว่าง. คง Side หลัก/รองและ Topbar ที่ล็อกล่าสุดระหว่างรอคำตอบ; login และ guard เดิมคงอยู่. ESLint 2 ไฟล์และ route checks 74 หน้าผ่าน; diff whitespace ผ่าน. TypeScript ติด Prisma เดิม managerId/salesId/productLot 3 จุด. ไม่มี API/ข้อมูล/โค้ดธุรกิจถูกลบ ไม่ commit/deploy; เจ้าของตรวจ TASK-114.

- IN_PROGRESS: เจ้าของสั่งนำ filter และเนื้อหาทุกหน้าออกก่อน เหลือ Side หลัก/รอง/Tab. ขอบเขต Specs/Plan/Task, admin-shell.tsx และ navigation-only-tabs.tsx. ลำดับบันทึกข้อยืนยัน → แสดงเฉพาะ Tab เดิมจาก metadata/หมวดเฉพาะ โดยไม่ mount เนื้อหาเดิม → ตรวจ lint/types/routes/diff. หน้า login ยังใช้งาน; ไม่ลบข้อมูล/API/โค้ดธุรกิจ. Tab เดียวซ่อนตามกฎเดิม; ไม่มี Tab ใหม่ในหน้าสร้าง/รายละเอียด. รอคำตอบเรื่องคง Topbar ระหว่างทำส่วนอิสระ. แผน tasks/TASK-114-navigation-only-pages.md.

## TASK-113 เขตเป็น Side หลัก — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: เขตเป็นเมนูหลักต่อจากโปรโมชัน; Side รองรายงานเขต/เพิ่มเขต (Admin) และ Header เขต. ผู้ใช้เหลือรายชื่อ/เพิ่ม; เลือกเมนูหลักตรงจาก registry ไม่เลือกลูกค้าซ้ำ. ESLint 5 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติด Prisma เดิม managerId/salesId/productLot 3 จุด. ยังไม่ตรวจภาพหลัง login; รายงานเขตใช้รายการเดิม ไม่มีสูตร/ตัวเลขใหม่ ตรวจรับ TASK-113. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งเขตเป็น Side หลักต่อจากโปรโมชัน & ของแถม และ Side รองรายงานเขต/เพิ่มเขต. ขอบเขต Specs/Plan/Task, navigation.ts, admin-shell.tsx, sidebar.tsx, user-secondary-sidebar.tsx, territory-secondary-sidebar.tsx. ลำดับบันทึกข้อยืนยัน → ย้ายรายการหลัก/parent → แยกหมวด/Header/active → ตรวจ lint/types/routes/diff. ใช้รายการเขตเดิมเป็นรายงานเขต ไม่สร้างยอดรายงานใหม่; คง URL/ข้อมูล/filter/ตาราง/ฟอร์ม/guardเดิม. แผน tasks/TASK-113-territory-main-navigation.md.

## TASK-112 Side รองใบเสนอราคาและคำสั่งซื้อ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Side รองแต่ละหมวดมีรายการ/สร้างล่างสุดตามสิทธิ์เดิม พร้อม Header และ active หน้าเดิม. ESLint 3 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหา Prisma เดิม managerId/salesId/productLot 3 จุด. คง filter/ตาราง/ฟอร์ม/รายละเอียด/ธุรกรรม; Tabsและการชำระยังไม่ implement. ยังไม่ตรวจภาพหลัง login ตรวจรับ TASK-112. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของอนุมัติปรับสองหมวดตามโครงรายการ/สร้างล่างสุด. ขอบเขต Specs/Plan/Task, navigation.ts, admin-shell.tsx, sales-document-secondary-sidebar.tsx. ลำดับบันทึกแผน → เชื่อมหน้ารายการ/สร้างเดิมตาม guard → Header/สถานะรายละเอียด → ตรวจ lint/types/routes/diff. คง filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB/จอง/อนุมัติเดิม; Tabsรายละเอียดเก็บเป็นแผน และการชำระยังพัก. แผน tasks/TASK-112-sales-document-sidebar.md.

## TASK-111 ชื่อเมนูคำสั่งซื้อ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: label /orders เป็นคำสั่งซื้อแล้ว; ESLint navigation.ts และ diff whitespace ผ่าน. คง route/ข้อมูล/พฤติกรรมเดิม ตรวจเมนู/Headerตาม TASK-111. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งเปลี่ยนคำสั่งซื้อ & จัดส่ง เป็นคำสั่งซื้อ. ขอบเขต navigation.ts และ Specs/Plan/Task; บันทึกข้อยืนยัน → เปลี่ยน label /orders → ตรวจ lint/diff. คง route/ข้อมูล/พฤติกรรมเดิม. แผน tasks/TASK-111-order-menu-label.md.

## TASK-110 โลโก้คอม 60px — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: โลโก้คอม 60 × 60px แล้ว มือถือคง 42px. ESLint sidebar.tsx และ diff whitespace ผ่าน; เจ้าของตรวจภาพตาม TASK-110. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งโลโก้คอม 60 × 60px. ขอบเขต sidebar.tsx และ Specs/Plan/Task; บันทึกข้อยืนยัน → md:h/w-15 และ Image width/height 60 → ตรวจ lint/diff. คงมือถือ 42px สี/ชื่อ/ความกว้างเมนู. แผน tasks/TASK-110-sidebar-logo-size.md.

## TASK-109 ชื่อ ZUUGROUP ขนาด 2xl — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ชื่อบริษัทใช้ md:text-2xl แล้ว; ESLint sidebar.tsx และ diff whitespace ผ่าน. คงมือถือ text-lg/สี/น้ำหนัก/โลโก้เดิม รอเจ้าของตรวจตาม TASK-109. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งชื่อ ZUUGROUP เป็น 2xl บนคอม. ขอบเขต sidebar.tsx และ Specs/Plan/Task; บันทึกข้อกำหนด → md:text-3xl เป็น md:text-2xl → ตรวจ lint/diff. คงมือถือ text-lg/น้ำหนัก/สี/โลโก้/ความกว้างเดิม. แผน tasks/TASK-109-sidebar-brand-size.md.

## TASK-108 ความกว้าง Side หลักขยาย 275px — 2026-10-05

- FOLLOWUP IMPLEMENTED / WAITING_FOR_UAT: เจ้าของเปลี่ยนค่าจาก 250px เป็น 275px; อัปเดต globals.css/Specs/Plan/Task แล้ว ตรวจ token 275px/104px และ diff whitespace ผ่าน. รายการด้านล่างเป็นประวัติรอบ 250px. รอเจ้าของตรวจขอบเมนู/เนื้อหา ไม่ commit/deploy.

- IMPLEMENTED / WAITING_FOR_UAT: token expanded เป็น 250px แล้ว collapsed คง 104px; ตรวจ Sidebar/AdminShell ใช้ token เดียวกัน และ diff whitespace ผ่าน. ยังไม่ตรวจภาพหลัง login; เจ้าของตรวจขอบเนื้อหา/ชื่อเมนู/โลโก้ตาม TASK-108. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งลดตอนขยายเป็น 250px. ขอบเขต globals.css และ Specs/Plan/Task; บันทึกข้อยืนยัน → เปลี่ยน --expanded-sidebar-width 300px เป็น 250px → ตรวจ token และ diff. คงตอนย่อ 104px และมือถือเต็มจอ; AppShell ใช้ token เดียวกันจึงปรับระยะเนื้อหาตามอัตโนมัติ. แผน tasks/TASK-108-sidebar-width.md.

## TASK-107 เขตใน Side รองผู้ใช้งาน — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Side รองผู้ใช้งานมีรายชื่อ/เขต/เพิ่มเขต/เพิ่มผู้ใช้งาน พร้อม Header/Side หลักผู้ใช้งานในหน้าเขต URL เดิม; สถานะรายละเอียดและสร้างแยกถูกต้อง. ESLint 3 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหา Prisma เดิม 3 จุด managerId/salesId/productLot. คงข้อมูล/ฟอร์ม/filter/ตาราง/สิทธิ์เดิม; ยังไม่ตรวจภาพหลัง login ตรวจรับตาม TASK-107. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งเพิ่มเขต/เพิ่มเขตใน Side รองผู้ใช้งาน. ขอบเขต Specs/Plan/Task, navigation.ts, admin-shell.tsx, user-secondary-sidebar.tsx. ลำดับบันทึกข้อยืนยัน → ผูกเขต/สร้างเขตเดิมกับผู้ใช้ → สถานะเมนู/Header → ตรวจ lint/types/routes/diff. ลำดับรายชื่อผู้ใช้งาน/เขต/เพิ่มเขต/เพิ่มผู้ใช้งานล่างสุด คง filter/ตาราง/ฟอร์ม/API/DB/สิทธิ์เดิม. แผน tasks/TASK-107-user-territory-navigation.md.

## TASK-106 ล็อก Topbar — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Topbar/แถบสี sticky ทุกหน้า Side รอง offset ใต้ Topbar และ Side หลักมือถือด้วยความสูงจริงจาก ResizeObserver; คอมพื้นที่เมนูหักความสูง Topbar. ESLint 2 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหาเดิม managerId/salesId/productLot 3 จุดจาก generated Prisma Client. ยังไม่ตรวจเลื่อนหลัง login; เจ้าของตรวจตาม TASK-106. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งล็อก Topbar แทนกฎไม่ล็อกเดิม. ขอบเขต Specs/Plan/Task, admin-shell.tsx และ secondary-sidebar-frame.tsx. ลำดับบันทึกข้อยืนยัน → sticky Topbar พร้อมวัดความสูงจริง → offset Side รองใต้ Topbar และ Side หลักมือถือ → ตรวจ lint/types/routes/diff. คงขนาด/สี/เนื้อหา/ข้อมูลเดิม. แผน tasks/TASK-106-sticky-topbar.md.

## TASK-105 ตรึง Side รองเวลาเลื่อน — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Side รองทุกหมวดใช้กรอบ sticky กลาง คอมเลื่อนเมนูภายในได้ มือถือวัดความสูง Side หลักด้วย ResizeObserver เพื่อไม่ซ้อนกัน. ESLint layout, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหาเดิม managerId/salesId/productLot 3 จุดจาก generated Prisma Client. ยังไม่ได้ตรวจการเลื่อนหลัง login; เจ้าของตรวจตาม TASK-105. ไม่เปลี่ยน Header/เนื้อหา/ข้อมูล ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่ง Side รองไม่ไหลตามเนื้อหาเหมือน Side หลัก. ขอบเขต Specs/Plan/Task, admin-shell.tsx, secondary-sidebar-frame.tsx และ Side รองลูกค้า/สินค้า/ผู้ใช้/โปรโมชัน/รายงาน. ลำดับบันทึกแผน → กรอบ sticky กลางพร้อมเลื่อนเมนูภายในบนคอม → มือถือค้างใต้ Side หลักตามความสูงจริง → ตรวจ lint/types/routes/diff. ไม่เปลี่ยน Header/เนื้อหา/filter/ตาราง/ข้อมูล/สิทธิ์. แผน tasks/TASK-105-sticky-secondary-sidebar.md.

## TASK-104 Side รองรายงานยอดขายและคลัง — 2026-10-05

- NAVIGATION_IMPLEMENTED / REPORT_DATA_PENDING / WAITING_FOR_UAT: Side รอง 5 รายการต่อหมวดและหน้ารองรอข้อกำหนด/ข้อมูลครบ; หน้าแรก redirect สรุป มีลิงก์เปิดหน้าเดิมที่ legacy. ไม่แสดงตัวเลขสมมติ/API ใหม่. ESLint ไฟล์ที่เกี่ยวข้อง, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ยังติดข้อผิดพลาดเดิม managerId/salesId/productLot 3 จุดจาก generated Prisma Client. ยังไม่ตรวจภาพหลัง login; เจ้าของตรวจตาม TASK-104. กฎรายงานจริง/สิทธิ์และวันอ้างอิงรอแผนถัดไป ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของอนุมัติปรับ Side รองรายงานทั้งสองตามข้อเสนอ 5 รายการต่อหมวด. ขอบเขต Specs/Plan/Task, navigation.ts, admin-shell.tsx, report-secondary-sidebar.tsx และ src/app/reports/{sales,inventory}/**/page.tsx. ลำดับบันทึกข้อยืนยัน → เก็บหน้ารายงานเดิมที่ legacy → หน้าแรก/หน้ารองตามหมวด → ตรวจ lint/types/routes/diff. ยังไม่คำนวณยอดหรือสร้าง API/DB; รายงานใหม่เป็นหน้ารอข้อมูล/กฎ ไม่แสดงค่าจำลอง. คงรายงานเดิมรวม filter/ตารางที่ legacy. แผน tasks/TASK-104-report-secondary-sidebar.md.

## TASK-103 ถอดเมนูวางบิลและแผนชำระในเอกสารขาย — 2026-10-05

- MENU_IMPLEMENTED / PAYMENT_DEFERRED_BY_OWNER: ซ่อนวางบิล & ลูกหนี้จาก Side หลักแล้ว; ESLint navigation.ts และ diff whitespace ผ่าน. เจ้าของตอบ “เก็บไว้ก่อนเดียวค่อยทำอีกที”: เก็บข้อกำหนดทั้งหมด/ผ่อน/จำนวนเดือน/ยอดต่อเดือนไว้และพักฟอร์มชำระ ไม่ถามหรือ implement ต่อจนเจ้าของกลับมาสั่ง. คงข้อมูล/route/API/DB เดิม; ตรวจเมนูตาม TASK-103. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งนำวางบิล & ลูกหนี้ออกจากเมนู และกำหนดการชำระในขั้นสร้างใบเสนอราคาหรือคำสั่งซื้อ: ทั้งหมด/ผ่อน โดยผ่อนระบุจำนวนเดือนและยอดต่อเดือน. ขอบเขต navigation.ts และ Specs/Plan/Task เท่านั้น; บันทึกข้อยืนยัน/OPEN → ซ่อนเมนู billing → ตรวจ lint/diff. ไม่ลบข้อมูล/route/API หรือ implement คำนวณ/รับชำระ/DB ก่อนสรุปกฎ. แผน tasks/TASK-103-payment-navigation-plan.md.

## TASK-102 Side รองโปรโมชันและของแถม — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Side รองรายการโปรโมชัน/เพิ่มโปรโมชัน (Admin) ล่างสุด พร้อม Header ชื่อหมวดและสถานะหน้าเดิม. ESLint 3 ไฟล์, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหาเดิม 3 จุด managerId/salesId/productLot จาก generated Prisma Client ไม่ตรง schema. คง filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB; Tabsรายละเอียดและ OPEN ยังไม่เปลี่ยน. ยังไม่ได้ตรวจภาพหลัง login; เจ้าของตรวจตาม TASK-102. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของอนุมัติ “ปรับ” เมนูรายการโปรโมชัน/เพิ่มโปรโมชันล่างสุด. ขอบเขต Specs/Plan/Task, navigation.ts, admin-shell.tsx, promotion-secondary-sidebar.tsx. ลำดับบันทึกแผน → เชื่อมหน้าเดิม → ตรวจ lint/types/routes/diff. คง filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB และ guard Admin เดิมสำหรับสร้าง. ข้อเสนอ Tab ข้อมูลและเงื่อนไข/ของแถมบันทึกสำหรับแผนรายละเอียดหลังยืนยัน OPEN ไม่เพิ่ม Side ของแถมแยก. แผน tasks/TASK-102-promotion-secondary-sidebar.md.

## TASK-101 ย้ายหมวดโปรโมชันและของแถม — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: เปลี่ยน section ของ /promotions เป็นจัดการข้อมูลแล้ว; ESLint navigation.ts และ diff whitespace ผ่าน. คงหน้า/URL/กฎธุรกิจเดิม รอเจ้าของตรวจเมนูตาม TASK-101. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของสั่งย้ายโปรโมชัน & ของแถมไปจัดการข้อมูล. ขอบเขต navigation.ts และ Specs/Plan/Task เท่านั้น; บันทึกข้อยืนยัน → เปลี่ยน section ของ /promotions → ตรวจ ESLint/diff. คง URL/ชื่อ/ไอคอน/หน้าจอ/กฎธุรกิจเดิม. แผน tasks/TASK-101-promotions-navigation.md.

## TASK-100 Side รองผู้ใช้งาน — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: เพิ่ม Side รองรายชื่อผู้ใช้งาน/เพิ่มผู้ใช้งานสุดท้าย เฉพาะ Admin พร้อม Header ชื่อหมวดผู้ใช้งานและสถานะหน้ารายชื่อ/สร้าง/รายละเอียด. ESLint 3 ไฟล์, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ติดข้อผิดพลาดเดิม 3 จุด managerId/salesId/productLot จาก generated Prisma Client ไม่ตรง schema. คง filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB/สิทธิ์เดิม ไม่เพิ่มประวัติ. ยังไม่ตรวจภาพหลัง login; ตรวจรับตาม TASK-100. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของอนุมัติปรับเมนูผู้ใช้งาน → รายชื่อผู้ใช้งาน/เพิ่มผู้ใช้งาน (ล่างสุด). ขอบเขต Specs/Plan/Task, navigation.ts, admin-shell.tsx, user-secondary-sidebar.tsx. ลำดับบันทึกข้อยืนยัน/แผน → เชื่อมหน้ารายชื่อและเพิ่มเดิม → ตรวจ ESLint/types/routes/diff. คง filter/ตาราง/รายละเอียด/ฟอร์ม/API/DB/สิทธิ์ Admin เดิม ไม่เพิ่ม Tab ประวัติหรือเปลี่ยนการกด ID. แผน tasks/TASK-100-user-secondary-sidebar.md.

## TASK-099 เมนูผู้ใช้งานแทนจัดซื้อ — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: ย้ายผู้ใช้งานไปตำแหน่งเมนูจัดซื้อเดิมและซ่อนจัดซื้อจาก Sidebar หลักแล้ว. ESLint navigation.ts, route checks 62 หน้า และ diff whitespace ผ่าน. รอเจ้าของตรวจหน้าจอ/ย่อเมนู/มือถือ/Role ตาม TASK-099.

- IN_PROGRESS: เจ้าของสั่งลบเมนูจัดซื้อ & รับเข้าสต็อกและแทนด้วยผู้ใช้งาน. ขอบเขต navigation.ts และ Specs/Plan/Task; บันทึกข้อกำหนด → ซ่อนเมนูจัดซื้อหลักและย้ายผู้ใช้งานเข้าตำแหน่งเดิม → ตรวจ ESLint/routes/diff. ผู้ใช้งานแสดงเพียงครั้งเดียวและเฉพาะ Admin ตามสิทธิ์เดิม; หน้ารับสินค้าเข้าใน Side รองสินค้าใช้ได้ตามเดิม. แผน tasks/TASK-099-users-navigation.md.

## TASK-098 Side รองสินค้าและสต็อก — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: Side รองครบ 7 รายการสำหรับ Admin โดยรับสินค้าเข้าเชื่อมหน้าเดิมและเพิ่มสินค้าอยู่ท้ายสุด; Header/Side หลักของรับเข้ายังเป็นสินค้าและสต็อก. ESLint 4 ไฟล์, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ยังติดข้อผิดพลาดเดิม managerId/salesId/productLot 3 จุดจาก generated Prisma Client; ไม่แก้ในรอบเมนู. คง filter/ตาราง/ฟอร์ม/API/DB/สิทธิ์เดิม. ยังไม่ได้ตรวจหน้าจอหลัง login; วิธีตรวจรับ TASK-098. ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของอนุมัติ “ปรับ” ตามโครง 7 รายการ: สินค้าทั้งหมด/คลังหลัก/คลังการตลาด/คลังรอทำลาย/ล็อตสินค้า/รับสินค้าเข้า/เพิ่มสินค้า (ล่างสุด). ขอบเขต Specs/Plan/Task, navigation.ts, product-secondary-sidebar.tsx, admin-shell.tsx, sidebar.tsx. ลำดับบันทึกข้อยืนยันและแผน → เชื่อมหน้ารับเข้า/เพิ่มสินค้าเดิม → ปรับสถานะเมนูหลักและรอง → ตรวจ lint/types/routes/diff. คง filter/ตาราง/ฟอร์ม/API/DB/สิทธิ์เดิม ไม่แตะ OPEN Design ที่เหลือ. แผน tasks/TASK-098-product-secondary-sidebar.md.

## TASK-097 Side รองลูกค้า — 2026-10-05

- IMPLEMENTED / WAITING_FOR_UAT: เพิ่ม Side รองใต้ Header ชื่อลูกค้า: รายชื่อลูกค้า/เพิ่มลูกค้า (Admin) รายการสุดท้าย พร้อมสถานะที่เลือกและรูปแบบมือถือเดิม. ESLint ไฟล์ที่แก้, route checks 62 หน้า และ diff whitespace ผ่าน. TypeScript ยังไม่ผ่านข้อผิดพลาดเดิม 3 จุด: managerId/salesId ใน users API และ productLot ใน prisma.ts จาก generated client ไม่ตรง schema; ไม่แก้ในขอบเขตนี้. ยังไม่ได้ตรวจภาพหลัง login; เจ้าของตรวจตาม TASK-097. filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB ไม่เปลี่ยน; ไม่ commit/deploy.

- IN_PROGRESS: เจ้าของอนุมัติให้ลองปรับเฉพาะเมนู โดยยังไม่แก้ filter และตาราง. Side หลักลูกค้า → Side รองรายชื่อลูกค้า/เพิ่มลูกค้า (ล่างสุด); ไม่แสดงเขตและผู้แทนขายหรือเอกสารเป็นเมนูแยก. ขอบเขต Specs/Plan/Task, navigation.ts, admin-shell.tsx และ customer-secondary-sidebar.tsx. ลำดับบันทึกข้อยืนยันและแผน → เพิ่ม Side รองใต้ Header ตามรูปแบบเดิม → ตรวจ lint/types/routes/diff. คงหน้ารายการ/ฟอร์ม/รายละเอียด/API/DB/สิทธิ์เดิม; เรื่องเอกสารภายในรายละเอียดและการกด ID บันทึกไว้สำหรับรอบถัดไป ไม่แก้ตารางรอบนี้. แผนย่อย tasks/TASK-097-customer-secondary-sidebar.md.

## TASK-096 Checkpoint และ Commit — 2026-10-04

- CHECKPOINT_READY: บันทึกcheckpoint TASK092–095พร้อมงานค้างDesign; ตรวจTypeScript/route62และdiff whitespaceผ่านรอบนี้. เจ้าของอนุมัติcommitแล้ว; เก็บโค้ด/เอกสาร/migration/tests/ภาพDesignในAI โดยไม่รวมenv/backups/generated outputs. ไม่เปลี่ยนสถานะรับรองDesignหรือOPENและไม่push/deploy.

- IN_PROGRESS: เจ้าของสั่งcheckpointและcommitงานปัจจุบัน รวมTASK092–095 โดยยังไม่ถือว่าDesignผ่านตรวจรับ. ขอบเขตเอกสารcheckpoint/ACTIVEและGitบนbranchAI; ลำดับตรวจdiff/ไฟล์ที่จะบันทึก → บันทึกผลทดสอบเดิมและงานค้าง → ตรวจtypes/route/whitespace → stageและcommit → ตรวจสถานะสะอาด. ไม่แก้ฟังก์ชัน/ฐานข้อมูล/OPENและไม่push/deploy. เอกสารหลัก tasks/CHECKPOINT-2026-10-04.md; ตรวจรับด้วยcommit hashและสถานะGit.

## TASK-095 เอกสาร Design หน้าสินค้าและสต็อก — 2026-10-03

- DOCUMENTS_ONLY FOLLOWUP: เจ้าของกำหนดว่าถ้ามีTabเดียวไม่ต้องแสดง. ขอบเขตDesign/Specs/Plan/ACTIVEเท่านั้น; บันทึกกฎซ่อนแถวTabsและเริ่มFilterโดยไม่สร้างหัวเรื่องแทน. ปุ่มหลักถ้ามียังคงขวาบนเนื้อหา. ยังไม่แก้เว็บ และOPENตำแหน่งอื่นยังรอคำตอบเดิม.

- DOCUMENT_READY / WAITING_FOR_DESIGN_ANSWERS: สร้างMDพร้อมภาพอ้างอิงที่เก็บในrepoแล้ว; ระบุผัง/สัดส่วน/ลำดับคอลัมน์/สไตล์/OPEN/ข้อแตกต่างTASK094และแผนตรวจรับ. ส่งคำถาม3เรื่อง: ยอดจอง/พร้อมขาย, รายละเอียดล็อต/รับเข้า, ประวัติ/เกณฑ์อายุ. รอคำตอบก่อนเลือกตำแหน่งและแก้เว็บตามคำสั่งเจ้าของ. ตรวจสำเนาภาพ85366bytesตรงไฟล์อ้างอิง; ไม่เปลี่ยนเว็บ/API/DB/commit.

- IN_PROGRESS / DOCUMENTS_ONLY: เจ้าของแจ้งว่าหน้า TASK094 ยังไม่ตรง design และขอทำMDก่อนแก้เว็บ พร้อมถามตำแหน่งที่ไม่ชัดเจนก่อน. ขอบเขต ACTIVE/Specs/Plan, docs/designs/stock-screen-design.md และภาพอ้างอิงในdocs/designs/assets. ลำดับอ่านภาพ/กติกาเดิม → บันทึกผัง/ตำแหน่ง/สไตล์/ข้อแตกต่าง → แยกOPENที่ภาพไม่กำหนดและถามเจ้าของ → ส่งเอกสารตรวจ. ยังไม่แก้เว็บ/API/DB/commit. TASK094ยังไม่ผ่านตรวจdesignจากเจ้าของ; ผลทดสอบโค้ดไม่ใช่ผลตรวจdesign.

## TASK-094 วางหน้าจอสินค้าและคลังตามภาพ — 2026-10-03

- IMPLEMENTED / WAITING_FOR_UAT: เมนูสีอ่อนในbodyใต้Header, สินค้า/คลังสรุปต่อสินค้า, ล็อตต่อLot IDกดแถวขยายคลัง, Tabsและปุ่มตามภาพ, filters/paginationฝั่งserver. TypeScript/ESLint/route62ผ่าน; realDB18/18รวมTASK094และcleanupผ่าน. ยังไม่ตรวจหน้าจอหลังloginคอม/มือถือ; วิธีตรวจรับTASK094. ไม่commit/deploy. ขอบเขตIN_PROGRESSด้านล่างเป็นประวัติ.

- IN_PROGRESS เจ้าของอนุมัติ “ลองทำดูก่อนจะได้ปรับถูก”. ขอบเขต Sidebar/AdminShell/เมนูย่อย, products page และ stock warehouse routes, InventoryWorkspace, inventory GET projections/types, เอกสารและการทดสอบอ่านยอด. ลำดับแก้ Specs/Plan → ย้ายเมนูใน body → สรุปสินค้า/ล็อตและตัวกรองฝั่ง API → Tabs/ปุ่ม/ตาราง → lint/types และตรวจยอด. ใช้พร้อมขาย MAIN หลังหักจองและกฎอายุเดิมสำหรับเตือน<50; ใกล้หมดอายุ90วันเริ่มต้น. ไม่แก้ schema/ยอด/คำสั่งเขียน/Auth และไม่ commit/deploy.

- PLANNING / DOCUMENTS_ONLY เจ้าของให้วางแผนก่อนและยืนยันตำแหน่งปุ่ม/แหล่งแจ้งเตือนแล้ว. ขอบเขตครั้งนี้ ACTIVE/Specs/Plan/Task เท่านั้น. ลำดับบันทึกภาพอ้างอิงและ5หน้าย่อยใน body → สรุปข้อมูลรวมกับข้อมูลแต่ละคลัง → Tabs อายุสินค้าและปุ่มขวาสุด → ตัวกรองและวิธีตรวจรับ. ยังไม่แก้เว็บ/API/DB/commit. แบบ TASK-093 ที่ซ้อนเมนูใน Sidebar หลักต้องปรับตามแผนนี้เมื่อเริ่ม implementation.

## TASK-093 Sidebar ย่อยสินค้าและสต็อก — 2026-10-03

- IMPLEMENTED / WAITING_FOR_UAT: เพิ่ม4เมนูย่อยพร้อมเปิด/ปิดและสถานะที่เลือก; แยก3หน้าเฉพาะคลังและหน้าล็อตรวม. ESLint, Next route typegen, TypeScript และ route checks (62หน้า) ผ่าน. หน้าจอคอม/มือถือหลังloginยังรอเจ้าของตรวจตาม TASK-093. ไม่ commit/Deploy. IN_PROGRESS ด้านล่างเป็นประวัติขอบเขต.

- IN_PROGRESS เจ้าของขอ4เมนูแยกใต้สินค้าและสต็อก: คลังหลัก คลังการตลาด คลังรอทำลาย ล็อตสินค้า. ขอบเขต navigation/sidebar, routes products/stock, InventoryWorkspace และเอกสาร. ลำดับบันทึก Specs/Plan → เมนูย่อยเปิด/ปิดและ active → หน้าแต่ละคลังกรองตาม MAIN/MARKETING/DISPOSAL โดยไม่แสดงคลังอื่นระหว่างโหลด → ล็อตรวมแยกเมนู → lint/typegen/types และตรวจรับคอม/มือถือ. ไม่เปลี่ยนฐานข้อมูลหรือกฎจอง/ขาย.

## TASK-092 เชื่อมงานธุรกิจข้อมูลและเว็บ — 2026-10-03

- IMPLEMENTED / WAITING_FOR_UAT: schema+API+web ตามขอบเขตที่สรุปพร้อมทดสอบรวม; migration applied และ local backup ไม่เข้า Git. verify10/10, flow14/14, realDB15/15 ผ่านและcleanup fixturesสำเร็จ. Browserถึงlogin ยังไม่ตรวจหน้าจอ/มือถือหลังlogin. วิธีตรวจรับและผลอยู่ TASK-092 และ docs/LINKED-OPERATIONS-GUIDE.md. ไม่ commit/push/Deploy จนเจ้าของตรวจรวม. บันทึก IN_PROGRESS ด้านล่างเป็นประวัติของ batch ที่ทำแล้ว.

- BATCH-6 IN_PROGRESS tests/QA: ทดสอบ service จริงกับ PostgreSQL โดยสร้าง fixture UUID เฉพาะงานแล้วล้างใน finally; ตรวจ FEFO, สร้างพร้อมกัน, จอง/คืน/ตัด, retry, visibilityต้นทุนและแก้รับเข้า7วัน; ปรับ route gate เฉพาะ Orders และ retired groups; ตรวจ lint/types/build และแก้ navigation/alias. ไม่แก้ข้อมูลใช้งานจริง.

- BATCH-3 FOLLOWUP รักษากติกา route-owned forms เดิม: คืนโครงหน้า customer/territory จาก checkpoint แล้วปรับเฉพาะ registry/ช่องกลุ่ม/managerId/salesId และ panelสัมพันธ์; ยกเลิก rendererทั่วไปที่ทำร่างไว้. Orders เปลี่ยนฟอร์มเป็น line items เฉพาะโมดูล จึงปรับ gate เฉพาะ Orders ให้ตรวจ workflow guards/actual line fields แทนหัวเอกสารเก่า ไม่ลด gate โมดูลอื่น.

- BATCH-5 IN_PROGRESS apply/readback ฐานข้อมูลและ schema generation: ตรวจพบคลังจริง MAIN/MARKETING/DISPOSAL จึงใช้ code เดิมไม่สร้างคลังใหม่; สคริปต์สำรองลูกค้า/เขตก่อน migration เก็บใน local-backups ที่ ignore, tracking migration เดิม, Prisma validate/generate และ type-check. ไม่เติม stock ตัวอย่าง/ไม่ลบ records เดิม.

- BATCH-4 IN_PROGRESS หน้า stock/receipts/actions และ navigation: แสดงคงเหลือ/จอง/พร้อมขาย, รับหลายล็อต, แก้ภายใน7วัน, โอน/ปรับ/แจกพร้อมเหตุผลและ confirmation, trace ID และประวัติ. ใช้ loading เฉพาะเนื้อหา/SuccessAlert. เชื่อมสินค้า/จัดซื้อไปหน้าที่เกี่ยวข้องและคงสี/fontเดิม.

- BATCH-3 IN_PROGRESS เขต/ลูกค้า/UI: เพิ่ม managerId/salesId ใน registry และตรวจ role/unique; แสดงชื่อความสัมพันธ์และรายชื่อลูกค้าในเขต, รวมกลุ่มเป็น category เดียว, เปลี่ยนหน้า customer/territory เป็น component ใช้ registry; ซ่อนหน้ากลุ่มแยกแบบไม่ลบข้อมูล. ขอบเขต records service/registry/components/pages/navigation และ Orders create layout ให้ Sales เข้าตามคำสั่งที่ยืนยัน.

- BATCH-1 IN_PROGRESS schema/SQL migration/types/domain validation: เพิ่มเขต managerId/salesId, receipt/lot/balance/movement/order lines/reservations/idempotency; เก็บข้อมูลเก่าและ RLS. ขั้นถัดไป service/API transaction. อ่าน ACTIVE ก่อน batch แล้ว.

- BATCH-2 IN_PROGRESS server operations/handlers: SQL bound parameters, ล็อกสินค้าและคำสั่ง, รับเข้า/แก้/โอน/ปรับ/แจก/FEFO reservations/Orders transitions, projectionต้นทุนเฉพาะAdmin/CFO และ auditที่ไม่เผยต้นทุน. ขอบเขต src/server/operations/* และ routes/orders/inventory. รักษาอ่าน Orders เดิม ไม่ให้ generic write ข้าม workflow.

- IN_PROGRESS เจ้าของอนุมัติลงมือทั้งหมดที่คุยเพื่อกลับมาทดสอบ พร้อมอนุญาตค้น/เลือกแนวทางอายุยา. ขอบเขตเฉพาะ: เอกสาร Specs/Plan/Task; Prisma/migration/สคริปต์ apply; registry/records สำหรับลูกค้าและเขต; API/services/types/UI เขต/ล็อตรับเข้า/ยอดคลัง/ปรับยอด/โอน/แจก/Orders workflow; navigation/status badge; tests/คู่มือตรวจรับ. ไม่แตะ Auth credentials/Role ใหม่/Deploy/Dashboard redesign. ลำดับสรุป contract → schema+preserve data → transaction/API → UI → DB apply/readback → tests/verify → ส่ง UAT. คงกฎ OPEN ที่ยังไม่ยืนยันและไม่เดาใบขาย/ภาษี/เครดิต. ไม่สร้าง stock/ล็อตสมมติและไม่ commit จนเจ้าของทดสอบรวม.

- PLANNING ยืนยันจองเมื่อสร้าง Order สำเร็จ: มีของ 10 และ Order แรก 10 แล้ว คนอื่นสร้างเพิ่มไม่ได้. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกสูตรพร้อมขาย=คงเหลือ-จอง → แทนข้อเสนอจองหลังอนุมัติ → สรุป. ยังไม่ตัดของจน Admin ยืนยันเสร็จสิ้น. เมื่อ implement ต้องกันการสร้างพร้อมกันจองเกิน; วิธีคืน/ปรับจองเมื่อยกเลิกหรือส่งกลับแก้รอรายละเอียด.

- PLANNING คำยืนยันงานขายล่าสุด: ของไม่พอสร้างเอกสารไม่ได้; Manager/Admin ส่งกลับให้ Sales แก้ได้; Manager อนุมัติเป็นสถานะอนุมัติ จากนั้น Admin ตรวจและยืนยันอีกครั้งเป็นเสร็จสิ้นพร้อมตัดของคลังหลัก. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึก → ปรับ state/จุดตัดยอดในแผน → สรุป. ไม่มีเปลี่ยนโค้ด/DB/ยอด. การจองและ FEFO ยังรอยืนยัน; ส่งกลับแล้วต้องอนุมัติใหม่หรือไม่ยัง OPEN. ต้องวางป้องกันยอดไม่พอเมื่อมีหลายคำสั่งซื้อและการกดยืนยันซ้ำ.

- PLANNING ยืนยันเพิ่ม: จัดของในขั้น Admin หลัง Manager อนุมัติ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับระบุผู้จัดของ → ปรับลำดับแผน → สรุป. ไม่ implement/แก้ยอดหรือ DB; วิธีจัดล็อตอัตโนมัติยังรอยืนยัน.

- PLANNING เจ้าของยืนยันลำดับงานขาย: Sales สร้างเอกสาร, Manager ตรวจ/ปรับ/อนุมัติ, Admin ตรวจและจัดคำสั่งซื้อแล้วจึงตัดของจากคลัง. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกกฎแทนข้อเสนอเดิม → แยกขั้นอนุมัติจากตัดยอด → สรุปเพื่อคุยต่อ. ไม่ implement หรือปรับสิทธิ์จริง. FEFO/จังหวะจอง/วิธีตัดเมื่อจัดเสร็จยังเป็นรายละเอียดที่ต้องยืนยัน; ไม่ถือว่าการอนุมัติของ Manager ตัดของแล้ว.

- PLANNING งานขาย: เจ้าของขออธิบายผู้สร้าง/ลูกค้า/การยืนยัน/จังหวะตัดของ และให้ค้นแนวทางบริษัทใหญ่เพื่อเลือกล็อตอัตโนมัติ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับค้นเอกสารทางการ SAP/Microsoft → อธิบายตัวอย่าง → เสนอ FEFO/จองเมื่อยืนยันคำสั่งขาย/ตัดเมื่อยืนยันจ่ายจริง → รอเจ้าของเลือก. ข้อเสนอไม่ใช่กฎอนุมัติ ยังไม่เปลี่ยนสิทธิ์/ยอด/DB. ตรวจรับโดยเจ้าของอ่านแผนและให้รายละเอียดต่อ.

- PLANNING เจ้าของยืนยันการยกเลิกเพื่อแก้ข้อมูลรับเข้า: ของมาจริงแต่กรอกผิด ยกเลิกรายการผิดพร้อมเหตุผลแล้วบันทึกรายการถูกต้องเชื่อมต้นฉบับ เก็บประวัติ ยอดตรงของจริงไม่นับรับซ้ำ; การขาย/โอนเดิมยังตรวจย้อนถึงล็อตและข้อมูลแก้ไขได้. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกข้อยืนยัน → แยกการแก้ข้อมูลจากรับของใหม่/คืนของ → สรุปก่อนคุยต่อ. ไม่ implement/แก้ DB/ยอดจริง. วิธีคง ID และผลต่างรายการที่ใช้ไปแล้วต้องออกแบบตามกฎที่พร้อม.

- PLANNING คำยืนยันล่าสุด: ขายใช้คลังหลัก แจกใช้คลังการตลาด; ราคาขาย Admin กำหนดและแก้เอง ไม่เปลี่ยนตามต้นทุนล็อต. รับข้อมูลอายุยาสำหรับบริจาค/งดขาย/รอทำลายเป็นรายละเอียดประกอบ ยังมีช่วงและเงื่อนไขที่ต้องสรุปเป็นเกณฑ์เดียว. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึก → อธิบายยกเลิกรายการรับเข้าด้วยตัวอย่าง → ถามเกณฑ์อายุและพฤติกรรมย้าย/เลือกล็อตที่ยังค้าง. ไม่แก้ระบบ/DB/สิทธิ์หรือเดาผลย้อนธุรกรรม; ไม่อ้างข้อความทางการแพทย์/กฎหมายที่ส่งมาเป็นข้อเท็จจริงตรวจแล้ว.

- PLANNING คำยืนยันรับเข้ารอบถัดไป: ต้นทุนกรอกต่อ Lot (แผนตีความยอดรวมของล็อต ใช้จำนวนรับเข้าหาต้นทุนต่อหน่วย), ของมาถึงและตรวจแล้วจึงบันทึกล็อตใหม่; นับสิทธิ์ยกเลิก 7 วันจากเวลาบันทึกล็อต; ยกเลิกตรง ๆ ได้แม้ขาย/โอนแล้ว; แยกรายการปรับยอดพร้อมเหตุผลและผู้ทำ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับอัปเดตข้อยืนยัน → แยกผลการยกเลิกต่อยอด/เอกสารเป็น OPEN → ส่งสรุป. ยังไม่ implement/เปลี่ยนยอด/DB; ไม่ลบประวัติและไม่ทำให้ผลตรวจนับปรับยอดอัตโนมัติ.

- PLANNING รับกติกาสินค้ารอบล่าสุด: ต้นทุนแยกตามล็อตเห็นเฉพาะ Admin/CFO; Admin กำหนดราคาขายสินค้าเพื่อเทียบกำไรขาดทุน; รับหนึ่งครั้งหลายล็อตได้แต่ห้ามเติมล็อตเดิม; Admin รับเข้าโดยไม่มีขั้นอนุมัติแยก; ยกเลิกภายใน 7 วัน. ขอบเขต ACTIVE/Specs/Plan เท่านั้น. ลำดับบันทึกข้อยืนยัน → เสนอคลังหลักเป็นค่าเริ่มต้น/ย้ายคลังตามอายุ → เก็บ OPEN ต้นทุนต่อหน่วยหรือรวม, วันเริ่มนับ/รายการใช้ไปแล้ว, การย้ายจริง, และการปรับยอด. แหล่งที่มารอข้อมูลย่อยตามเจ้าของ. ไม่แก้โค้ด/DB/สิทธิ์จริงหรือ Ledger; ไม่ถือว่าคำว่าปรับสมดุลอนุมัติปรับยอดจากผลตรวจนับอัตโนมัติ.

- PLANNING คำยืนยันล็อตและที่มาข้อมูล: แต่ละล็อตต้องมี ID เฉพาะ ข้อมูลทั้งระบบต้องเชื่อมกลับไปยังต้นทางและตรวจสอบย้อนหลังได้. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกกติกา → แยก ID ภายใน/เลขล็อตที่ผู้ใช้เห็น → สรุปต้นทางและประวัติ → รอรายละเอียดธุรกรรม. ไม่แก้โค้ด/DB/Ledger. ตรวจรับแผนโดยเจ้าของอ่านความเชื่อมโยง; ไม่อ้างว่า ID ป้องกันความผิดพลาดได้ทั้งหมด.

- PLANNING รับคำอธิบายเติมสินค้า: สร้างข้อมูลสินค้าไว้ก่อน เช่น ยา A แล้วบันทึกของเข้าของสินค้าตัวเดิม ระบุแหล่งที่มา จำนวน (ตัวอย่าง 1000 ชุด) ต้นทุน วันผลิต วันหมดอายุ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกข้อมูลรับเข้า → สรุปแยกข้อมูลหลักกับรายการเติม → เก็บจุดค้างต้นทุนต่อหน่วย/รวมและความเชื่อมโยงล็อต/คลัง. ไม่เพิ่มข้อมูลจริง/โค้ด/DB/Ledger. หน่วยตัวอย่างยังไม่ถือเป็นอนุมัติการแปลงหน่วย.

- PLANNING หัวข้อถัดไปสินค้าและการเติมของ: ตรวจสถานะข้อมูลหลักสินค้า/คลัง เทียบงานรับเข้า/Lot/วันหมดอายุที่ยังไม่ implement และถามความหมายระยะเวลาสินค้าก่อน. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับตรวจของเดิม → บันทึกหัวข้อสนทนา → สรุปส่วนที่มีและจุดที่ต้องตกลง. ไม่แก้ระบบ/DB หรือเริ่ม Ledger.

- PLANNING เจ้าของให้เริ่มข้อมูลหลักและความเชื่อมโยงทั้งระบบก่อน ช่องข้อมูลย่อยเพิ่มภายหลัง. ขอบเขตรอบนี้ ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกลำดับความสำคัญ → เสนอภาพรวมโมดูลและความสัมพันธ์ → คุยทีละส่วนก่อนจัด implementation. ไม่เดากฎการแปลงเอกสาร/ยอดเงิน/สต็อก/สิทธิ์; ยังไม่เขียนโค้ดหรือแก้ DB. ตรวจรับโดยเจ้าของอ่านภาพรวมและให้รายละเอียดต่อ.

- PLANNING คำยืนยันล่าสุด: เอากลุ่มลูกค้าที่แยกเดิมออก และเปลี่ยนชื่อประเภทลูกค้าเป็นกลุ่มลูกค้า ให้เหลือข้อมูลจัดประเภทเพียงช่องเดียว. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกข้อกำหนดแทนข้อเสนอเดิม → ปรับแผน → ส่งสรุป. ยังไม่แก้โค้ด/API/DB หรือลบข้อมูลจริง; การจัดการโมดูลเดิมและข้อมูล category/groupId ต้องวางแผนเมื่อเริ่ม implementation. ตรวจรับเอกสารโดยเจ้าของอ่านสรุป.

- PLANNING ลูกค้า/กลุ่มลูกค้า: เจ้าของยืนยันเก็บกลุ่มลูกค้าไว้ใช้กรองร่วมกับเขตขาย; ชื่อกลุ่มจริงยังรอระบุ. รอบนี้ตรวจช่องลูกค้าปัจจุบันและเสนอข้อมูลเพิ่มเติมเป็นร่างเพื่อคุย ไม่ถือเป็นข้อกำหนดบังคับใหม่. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกคำยืนยัน → สรุปฟอร์มปัจจุบัน/ข้อเสนอ → รอรายละเอียด. ไม่แก้แอป/DB.

- PLANNING รับข้อมูลต่อเนื่อง: เจ้าของยืนยันเปลี่ยนเขตลูกค้าหลังสร้างได้ เหมือนเลือกเขตให้ลูกค้า; ให้จำประเด็นค้างไว้ก่อนเพราะยังมีรายละเอียดอีกมาก. เจ้าของระบุไม่มีเรื่องกลุ่มลูกค้าและขอคำอธิบายประโยชน์. ขอบเขตรอบนี้ ACTIVE/Specs/Plan เท่านั้น: บันทึกคำยืนยัน → อธิบายโมดูลเดิมโดยไม่เดากฎ → รอรายละเอียดต่อ. ไม่เริ่มแก้/ลบโมดูลหรือเปลี่ยนสิทธิ์.

## วางแผนเขตขาย — คำยืนยันรอบสอง 2026-10-03

- PLANNING ขอบเขต ACTIVE/Specs/Plan เท่านั้น: ยืนยันสมาชิกเป็น Sales, คนละเขตเดียว, ลูกค้าเขตเดียวเลือก/เปลี่ยนตอนสร้างลูกค้า, สร้างเขตก่อนเพิ่มคน, เขตเริ่มต้น เหนือ/ออก/ตก/ใต้. ลำดับลงข้อยืนยัน → ปรับแผน → สรุปความสัมพันธ์และจุดค้างให้เจ้าของ. ผลลัพธ์เอกสารตรงคำตอบ; ตรวจรับโดยอ่านสรุป. ยังไม่แก้ระบบ/DB/สิทธิ์หรือ commit รอบนี้. ขอบเขตสิทธิ์รายเขตและการย้ายลูกค้าหลังบันทึกยังรอรายละเอียด.

- CHECKPOINTED ชุดก่อน TASK-089–091 รวมใน commit 4a310a5 บน AI แล้ว; ตรวจ staged diff/รูปแบบข้อมูลลับผ่าน และ working tree สะอาดหลัง commit. ไม่ push/Deploy. สถานะรอ commit ด้านล่างเป็นบันทึกย้อนหลัง.

## Checkpoint ชุดทดสอบและเอกสาร — 2026-10-03

- IN_PROGRESS เจ้าของสั่ง commit ชุดก่อน แล้ววางแผนเขตขายก่อนลงมือ. ขอบเขตงานค้าง TASK-089–091 (tests/verify, คู่มือ/workbook/UAT, ฟอร์มพร้อมคำอธิบาย) รวมบันทึกข้อกำหนดที่รับไว้ซึ่งยังเป็นแผน. ลำดับตรวจ diff/รายชื่อไฟล์/ข้อมูลลับ → บันทึก checkpoint → stage เฉพาะไฟล์งาน → commit บน AI → ตรวจสถานะ. ใช้ผลตรวจเดิม tests 14/14 และ verify 10/10; ไม่มีการแก้ระบบใหม่ในรอบนี้. ผลลัพธ์ commit เดียวและ working tree สะอาด; ไม่ push/Deploy.

- PLANNING เขตขาย: เจ้าของย้ำให้วางแผนก่อน ยังไม่ลงมือแก้ระบบ. ข้อกำหนดรอบแรกเป็นข้อมูลประกอบการสนทนา; จุด OPEN รอคำตอบ.

## รายละเอียดธุรกิจรอบถัดไป — เขตขาย

- IN_PROGRESS รับกติกาเขตรอบแรก: Admin สร้างเขต (เหนือ/ออก/ตก/ใต้), เขตละ Manager 1 คนและสมาชิกอีก 1 คนซึ่งรอยืนยันว่าเป็น Sales, ลูกค้าผูกเขตและแสดงชื่อแทน ID. ขอบเขตรอบนี้ ACTIVE/Specs/Plan เท่านั้น. ลำดับตรวจโมดูลเดิม → บันทึกข้อยืนยันและ OPEN → สรุปให้เจ้าของตอบจุดค้าง. ผลลัพธ์เอกสารตรงคำอธิบาย; ตรวจรับโดยเจ้าของยืนยันความหมายสมาชิก/การผูกเขต/วิธีกรอกลูกค้า. ยังไม่แก้โค้ด ฐานข้อมูล หรือสิทธิ์.

- WAITING_FOR_REQUIREMENTS เจ้าของยืนยันฟอร์มโอเคแล้วและไม่ให้ปรับเพิ่มตอนนี้. กลุ่มงานที่เลือกคือ ลูกค้า/เขตขาย/ผู้ใช้งาน โดยเริ่มเจาะเขตขายก่อน อิงโมดูลที่มี. เจ้าของจะอธิบายรายละเอียดต่อ; คงสิทธิ์การใช้งานปัจจุบัน ยังไม่แยกสิทธิ์เพิ่มเติม. รอบนี้บันทึก ACTIVE/Specs/Plan เท่านั้น ก่อนแก้ข้อมูล/โครงสร้างต้องรับรายละเอียดและจัดแผนย่อยตามข้อยืนยัน.

## TASK-091 ฟอร์มกรอกข้อกำหนด — 2026-10-03

- READY_FOR_USER_TEST เพิ่มคำอธิบายไทย+ตัวอย่างทุกช่องและaria-describedbyแล้ว พร้อมชื่อส่วนงาน/Roleไทย. VMตรวจ2438control instancesใน22หัวข้อมีhelp/ร่างเดิมและสิทธิ์ที่ยังไม่สรุปคงอยู่ผ่าน. Browserเปิดข้อกำหนดอ่านuseเทียบrequiredได้จริง missinghelp0; มือถือ390pxไม่ล้น. JSsyntax/Prettier/diffผ่าน; ไม่เปลี่ยนJSONkeys/คำตอบ/กฎระบบ. รอownerตรวจชุดเดิมแล้วcommitรวม.

- IN_PROGRESS ตามคำขอล่าสุด: เพิ่มคำอธิบายใต้ทุกช่อง/ตัวเลือก พร้อมตัวอย่างและคำไทยสำหรับคนไม่ใช่สายเทคนิค. ขอบเขต HTML/คู่มือ/Specs/Plan/Task/ACTIVE. ลำดับบันทึก → helpertext+aria-describedby/ป้ายไทย → ตรวจcoverage/ร่างไม่เปลี่ยน/browser → ส่งตรวจรวม. ไม่เปลี่ยนkeys/คำตอบหรือกฎธุรกิจ.
- READY_FOR_USER_TEST ปรับแบบกรอกทีละจุดแล้ว: inputตัวอย่างแต่ละfield/6ตัวเลือกข้อกำหนด, สถานะ+workflowเพิ่มแถวได้, สิทธิ์รายคำสั่งและscope4Role, legacyรายละเอียดพับได้. Browserบนoriginทดสอบแยกตรวจเพิ่มแถว/switch/reloadค่าครบ; มือถือ390pxไม่ล้น. VMตรวจlegacy/save/JSONroundtrip/print/invalidimportผ่าน. ร่างของผู้ใช้ใน127.0.0.1ไม่ถูกแก้โดยการทดสอบ; ไม่commitแยก.

- IN_PROGRESS ติดตามคำขอใหม่: เปลี่ยนช่องอธิบายยาวเป็น inputรายฟิลด์/selectรายจุด/สถานะและworkflowเพิ่มแถวได้/permissionเลือกต่อคำสั่ง; ข้อมูลเดิมเก็บในหมายเหตุพับได้. ขอบเขต HTML/คู่มือ/Specs/Plan/Task/ACTIVE/UAT. ลำดับแก้Specs/Plan → schemaflatต่อยอดเดิม/atomiccontrols → save/import/print → browserตรวจ. รักษาdraftเก่า/JSONv1 ไม่commitแยก.
- READY_FOR_USER_TEST ส่ง standalone HTML กรอกได้ครบ22หัวข้อ/113field reference. Browserทดสอบเปลี่ยนโมดูล/reloadร่างผ่าน/มือถือ390pxไม่มีoverflow/ล้างคำตอบทดสอบแล้ว. VMตรวจsave/export-import JSON/printรวม2โมดูล/invalid importรักษาร่างผ่าน. UIส่งออกแสดงsuccessแต่automationจับdownload event timeout จึงตรวจpayload/roundtripด้วยVMแทน; ต้องลองdownloadจริงบนChrome/Edge. Google Formยังไม่สร้างต้องlogin. รอcommitรวม89–91หลังตรวจรับ.

- IN_PROGRESS เจ้าของขอแบบฟอร์มกรอกได้ โดย Google Forms เป็นทางเลือก. ตรวจแล้ว Google Forms ต้อง login และไม่มี connector สร้างฟอร์มโดยตรง. ทำ standalone HTML ใน docs/forms/business-requirements.html พร้อมข้อมูล registry ฝังในไฟล์ เลือกโมดูล/คำถาม/สิทธิ์/บันทึกร่าง/export-import JSON/พิมพ์; คู่มือและลิงก์เอกสาร. ลำดับลง Specs/Plan → สร้างฟอร์ม → ตรวจ UI/บันทึก/ส่งออก/มือถือ → ส่งมอบ. ไม่ส่งข้อมูลออกเว็บ ไม่แก้แอป/DB และรอรวม commit หลังตรวจรับครั้งเดียว.

## TASK-090 รวมงานเตรียมและตรวจรับครั้งเดียว — 2026-10-03

- READY_FOR_USER_TEST ชุดเตรียมครบ: workbook 14 โมดูล/113 ฟิลด์ พร้อมโมดูลเฉพาะ, คู่มือไทย, UAT ชุดเดียว. ตรวจ field/type/required/relation ตรง registry ครบ 113, 4 Role ทุกโมดูล, ลิงก์เอกสาร 8 จุด/รูปแบบ/diff ผ่าน. รอบนี้เปลี่ยนเฉพาะเอกสาร; ผล tests เดิม 14/14 และ verify 10/10 เจ้าของรับแล้วไม่รันซ้ำ. รอตรวจรับ TASK-090 แล้ว commit TASK-089/090 รวมครั้งเดียว. ยังไม่เริ่ม Dashboard/Deploy/กฎ OPEN.

- IN_PROGRESS เจ้าของสั่งทำงานเตรียมที่เหลือให้ครบ แล้วทดสอบครั้งเดียว/commit ครั้งเดียวหลังตรวจรับ. ขอบเขต docs/BUSINESS-REQUIREMENTS-WORKBOOK.md, docs/USER-MANUAL.md, docs/UAT-PREPARATION.md, README, Specs/Plan/Task/ACTIVE. ลำดับอ่านระบบ/OPEN → บันทึกแผน → แบบฟอร์มทุกโมดูล → คู่มือหน้าจอจริง → เช็กลิสต์รวม → ตรวจเอกสาร/verify → ส่งเจ้าของตรวจครั้งเดียว. ไม่เริ่ม Dashboard/Deploy/กฎธุรกิจที่พักไว้. TASK-089 เจ้าของยืนยันผ่านหมดแล้ว.

## TASK-089 ทดสอบ flow ด้วยข้อมูลจำลอง — 2026-10-03

- COMPLETE เจ้าของยืนยัน “ผ่านหมด” แล้ว. รวมงานนี้ไว้รอ commit ครั้งเดียวพร้อม TASK-090 หลังตรวจรับตามคำสั่งล่าสุด.
- READY_FOR_USER_TEST เพิ่ม test:flows ผ่าน 14/14 และรวม verify ผ่าน 10/10 ใน 29.8 วินาที exit 0. ตรวจ diff ผ่าน. ทดสอบ handler/service/validators จริงด้วย DB/Auth ในหน่วยความจำ ไม่เชื่อม DB/HTTP จริง; UI/browser/locking ไม่ครอบคลุม. งานใหม่ยังไม่ commit; checkpoint ก่อนหน้า 6c7916a สำเร็จแล้ว.

- IN_PROGRESS เจ้าของอนุมัติต่อชุดทดสอบหลัง checkpoint 6c7916a. ขอบเขต scripts/test-record-flows.mjs, package.json/verify runner/คู่มือ, Specs/Plan/Task/ACTIVE. ลำดับบันทึก → fixture และ DB/Auth adapter ในหน่วยความจำ → เรียก handler/service จริงเพื่อค้นหา/แบ่งหน้า/CRUD/สิทธิ์/conflict/audit rollback → รวม verify → รันตรวจ. ไม่เปลี่ยน production/กฎธุรกิจ/DB จริง. เป็น integration tests ฝั่ง server ไม่ใช่ browser UAT.

## TASK-088 checkpoint verify — 2026-10-03

- CHECKPOINTED commit 6c7916a บน AI สำเร็จ ตรวจ staged diff/credential patterns ผ่าน และ working tree สะอาดก่อน TASK-089. ไม่ push/Deploy.

## TASK-087 รวมชุดตรวจด้วย verify — 2026-10-03

- COMPLETE เจ้าของยืนยัน “ok ครับ ผ่าน 9/9” เมื่อ 2026-10-03. บันทึกตรวจรับเฉพาะ tasks/ACTIVE.md และ TASK-087; ปิดงาน verify แล้ว. ยังไม่ได้ commit รอบนี้.

- READY_FOR_USER_TEST เพิ่ม npm run verify ครบ 9 ขั้นตอนและ verify:seed แยกแล้ว พร้อมคู่มือ. รันจริงผ่าน 9/9 ใน 33.0 วินาที; ตรวจจำลอง exit 17 หยุดก่อนขั้นถัดไป, SIGINT หยุด child/คืน code 130/ล้าง handler, ไม่มี snapshot แจ้ง error ผ่าน. git diff --check ผ่าน. ไม่ commit/push/Deploy; รอเจ้าของลองคำสั่งตาม docs/VERIFY-GUIDE.md.

- IN_PROGRESS เจ้าของอนุมัติ “ok” ให้ทำข้อ 1 รวมชุดตรวจที่มีอยู่เป็นคำสั่งเดียว. ขอบเขต `package.json`, `scripts/verify.mjs`, README/คู่มือ verify, Specs/Plan/Task/ACTIVE. ลำดับ: บันทึกแผน → runner ตามลำดับ/fail fast → npm verify → ตรวจผลสำเร็จ/หยุดเมื่อผิดพลาด. Core รวม lint/Next typegen/type-check/5 offline tests/build; seed test ที่ต้องใช้ snapshot เฉพาะเครื่องแยกคำสั่งเสริม. ไม่เปลี่ยน API/DB/ข้อมูล/Deploy.

## TASK-086 วางแผน API อ่าน Dashboard — 2026-10-03

- DEFERRED เจ้าของขอ “ค่อยทำ” แผน Dashboard เมื่อ 2026-10-03. เก็บร่าง Specs/Plan ไว้; ยังไม่เริ่ม implementation. เมื่อกลับมาทำต้องเลือกข้อมูลและสิทธิ์ก่อน. งานถัดไปเสนอจัดรายละเอียดข้อมูลจริงรายโมดูลตาม checkpoint; Deploy ยังพัก.

## TASK-085 ตรวจรับและ checkpoint — 2026-10-03

- CHECKPOINTED เจ้าของยืนยัน “ok แล้ว” กับรายการตรวจ UI/เพิ่มแก้ลบกู้คืน/confirmation/SuccessAlert/search/pagination และ commit/checkpoint รอบล่าสุด. บันทึกตรวจรับ TASK-078–084 พร้อม `tasks/CHECKPOINT-2026-10-03.md` บน AI ต่อจาก c7a3c92. ตรวจ staged 93 ไฟล์/diff/credential ผ่าน ไม่มี env/snapshots/secret เข้า Git; hash ดู Git log. Deploy ยังพักและรายละเอียดธุรกิจรอข้อมูลจริง.

## TASK-084 เครื่องหมายเมื่อไม่มีข้อมูล — 2026-10-03

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; เปลี่ยน fallback แสดงผล 37 ไฟล์: ฟิลด์รายละเอียด 62 จุดใช้ `?? '-'` พร้อมรองรับข้อความว่าง, ชื่อสัมพันธ์ 8 จุด และ Role ใน Header; placeholder ขีดยาวเดิมใน UI เป็น `-` ทั้งหมด. คงค่าว่างที่ใช้ฟอร์ม/search/ID/API. lint/type-check/diff-check ผ่าน; รอเจ้าของตรวจข้อมูล optional ว่างและค่า 0 ตาม `tasks/TASK-084-empty-display.md`.

## TASK-083 มาตรฐานคลาสสีและ Poppins — 2026-10-03

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; แก้ตามคำยืนยันเจ้าของแล้ว: เปลี่ยนเฉพาะสีที่เดิมอ้าง var เป็นชื่อ Tailwind; คืนค่า #hex เดิมครบ 63 ไฟล์/1,987 จุด และสีหลัก #1a58a7 ผ่าน blue theme tokens เดิม 11 ระดับ. คงงานฟอนต์/Loading/Header/fallback ที่ทำแล้ว. แก้กติกา AGENTS/Specs/Plan ให้รักษา hex เดิม. ตรวจเทียบค่า hex/lint/type-check/build ผ่าน; รอเจ้าของตรวจสีหน้าจอ.

- ผลรอบแรกที่แปลง hex เป็น palette ถูกแทนที่ด้วยข้อแก้ไขข้างต้นตามคำยืนยันเจ้าของ. รายละเอียดใน `tasks/TASK-083-tailwind-colors-poppins.md`.

## TASK-082 ล็อกแถบสีและ Header — 2026-10-03

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; ถอนการล็อก Header ตอนเลื่อนแล้ว: wrapper ใช้ border สี 10px ตาม flow ปกติ ไม่มี sticky/top/z-index. Header และแถบสีเลื่อนตามหน้าทั้ง desktop/mobile. ESLint เฉพาะไฟล์/type-check/diff-check ผ่าน. ข้อความรอบทดลอง sticky ด้านล่างเป็นประวัติที่ถูกแทนที่ด้วยคำขอล่าสุด.

- READY_FOR_USER_TEST คืน Header แบบ sticky ร่วมกับแถบสีตามคำขอล่าสุดแล้ว. Desktop top 0; mobile ใต้เมนูหลักตามสถานะย่อ/ขยาย. ESLint เฉพาะไฟล์และ type-check ผ่าน. การทดลองติดเฉพาะแถบสีด้านล่างเป็นประวัติที่ถูกแทนที่แล้ว.

- READY_FOR_USER_TEST งานติดตามล่าสุด: แยกแถบสี 10px เป็น sticky element ก่อน Header แล้ว; Header ชื่อหน้า/วันที่/บัญชีเลื่อนพร้อมเนื้อหา. Desktop แถบสีติด top 0; mobile ใต้เมนูหลักตามสถานะย่อ/ขยาย. ESLint เฉพาะไฟล์/type-check/Prettier/diff-check ผ่าน. รอเจ้าของเลื่อนหน้าตรวจเฉพาะแถบสีตาม TASK-082.

- ผลรอบแรกที่ล็อก Header ร่วมกับแถบสีถูกแทนที่ด้วยคำขอล่าสุดให้ติดเฉพาะแถบสี.

## TASK-081 โลโก้ Loading — 2026-10-02

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; งานติดตาม 2026-10-03: ลดตัวโลโก้ให้ใกล้ขนาดไอคอนเดิม (~56px เต็มจอ/~32px ในตาราง) และคืนวงแหวนสองชั้นใน `src/components/ui/loading-component.tsx`; ใช้ภาพเดิม ไม่แก้ API/DB. lint, type-check แบบไม่เขียน incremental cache, build, Prettier, diff-check ผ่าน; รอเจ้าของตรวจ Loading ทั้งสองแบบและ reduced motion. รายละเอียดใน `tasks/TASK-081-loading-logo.md`.

- READY_FOR_USER_TEST เจ้าของระบุไฟล์จริง `public/Logoloading.png` ให้ใช้แทนไอคอน Loading. ตรวจภาพแล้วเป็น RGBA พื้นหลังโปร่งใส 594×420; ใช้ไฟล์เดิมตรง ๆ ทั้งเต็มหน้าจอ/ตาราง โดยจัดขนาดใน component ตามขอบ alpha และไม่ทับ `public/logo.png`. lint/type-check/build/Prettier/diff-check ผ่านก่อนปรับช่องว่างกรอบตารางเล็กน้อย; รอ UAT desktop/mobile/reduced motion. รายละเอียดใน `tasks/TASK-081-loading-logo.md`.

## TASK-080 Loading ในพื้นที่ตาราง — 2026-10-02

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; เจ้าของยืนยันหน้า `[id]` ใช้ได้แล้ว และขอให้ระหว่างพิมพ์ค้นหา/เปลี่ยนตัวกรอง Loading แสดงในกรอบตารางหรือส่วนข้อมูลแทน overlay ทั้งจอ. เพิ่ม content variant และย้ายจุดแสดงครบ 21 หน้ารายการ (โมดูล 18, สินค้า/ผู้ใช้/Audit 3); คง route/session loading เต็มจอและ detail loading เดิม. lint/type-check/build/route check/diff-check ผ่าน; รอเจ้าของ UAT desktop/mobile. ไม่แก้ API/DB; รายละเอียดใน `tasks/TASK-080-table-loading.md`.

## TASK-079 ตรวจหน้า `[id]` 404 — 2026-10-02

- COMPLETE เจ้าของยืนยัน 2026-10-02 ว่าหน้า `[id]` ใช้ได้แล้วหลังล้าง dev cache/เริ่ม dev ใหม่. รายละเอียดใน `tasks/TASK-079-id-route-404.md`; ไม่แก้ DB/API/ธุรกิจ.

## TASK-078 Dashboard retry Loading — 2026-10-02

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; ติดตาม TASK-059 ที่อนุมัติแล้ว: `src/app/page.tsx` หลังโหลด Dashboard ผิดพลาด กด “ลองใหม่” จะล้าง error ก่อนส่งคำขอใหม่ ทำให้ Loading ปรากฏระหว่างรอ. ขอบเขต Specs/Plan TASK-059, `tasks/TASK-078-dashboard-retry-loading.md`, `tasks/ACTIVE.md` และ handler retry ใน Dashboard เท่านั้น. lint/type-check/diff-check ผ่าน; type-check ต้องสร้าง Next route types ใหม่และลบ validator ที่ Next dev สร้างค้าง. ไม่แก้ API/DB; รอเจ้าของ UAT.

## TASK-077 Commit และ checkpoint — 2026-10-02

- CHECKPOINTED เจ้าของสั่งcommit/checkpoint รวมworkingtreeหลัง17c7423 TASK-063–076 บนAI บันทึกพร้อมtasks/CHECKPOINT-2026-10-02.md/TASK-077 ตรวจstaged282files/diff/credentialผ่าน ไม่มีenv/snapshotsเข้าGit ไม่เปลี่ยนพฤติกรรม/DB ไม่push/deploy hashดูGit logและผลส่งมอบ ดูcheckpointสำหรับUATค้างและงานต่อ

## TASK-076 ชุดข้อมูลชื่อสมจริง — 2026-10-02

- READY_FOR_USER_TEST ลง DB แล้ว240แถวไม่ซ้ำ (records210/products15/warehouses15) ชื่อรันเลข/ชื่อซ้ำศูนย์ เติมnative fields/relationsว่าง คงID/code/status/softdelete/auth5/roles4/test productเดิม Snapshotก่อนหลัง/plan/rollbackอยู่scripts/snapshotsและignoreGit; seedcatalog/SQLใหม่พร้อมrunner ตรวจoffline/lint/SQLdryrollback/DBreadbackครบและrepeat plan0 changes ไม่มี API/login/Schema/stock/ledger/commit/push คู่มือ docs/REALISTIC-DATA-RESULT.md

- IN_PROGRESS เจ้าของอนุมัติ “ทำได้เลย” เริ่ม catalog/seed/refresh/snapshot/rollback/offline checks และลงDBธุรกิจ projectเดิมตามแผนย่อย ตรวจค่าเดิมรายฟิลด์รักษาข้อมูลผู้ใช้ ไม่ Auth/schema/API/stock/ledger ลำดับ snapshot → catalog → guarded plan/seed → offline → transaction → verify/UAT

- PLANNING เจ้าของขอชื่อสมจริง/รายละเอียด/ผู้ดูแลทุกข้อมูลแทนชื่อรันเลข ตรวจ registry/seed/schema และ DB read-only ผ่าน Supabase connector พบ14โมดูล×15=210records,16products,18warehouses จัด Specs/Plan/TASK-076 พร้อมตัวอย่างทุกกลุ่ม รออนุมัติเอกสารตาม AGENTSข้อ3 ก่อน seed/DB write ลำดับ catalog → snapshot/ค่าเดิม → seed/refresh → transaction → อ่านกลับ/UAT ไม่ Auth/schema/API/stock/ledger

## TASK-075 ชื่อฟิลด์ API — 2026-10-02

- READY_FOR_USER_TEST ปรับ native code/name/ฟิลด์ records และ query/filter keys, nested products/public/users/audit, reports, 46หน้า records และหน้าสินค้า/ผู้ใช้/Audit/CSV, state defaultWarehouseId; Postman local เดิม133+24คำขอ URL/method/scriptsเดิมพร้อมคู่มือ contract ตรวจ type-check/lint/build, 5ชุดทดสอบ offline (payload names/null/ISO/public allowlist/filters/reports + contracts/pagination/pages/resource guards), diff ผ่าน ดู docs/TEST-API-FIELD-NAMES.md ไม่ schema/DB/live HTTP/login/Cloudsync/commit/push

- IN_PROGRESS เจ้าของอนุมัติ “ok ปรับ” หลังรายงาน audit ชื่อ field ขอบเขต types/services records/products/public/users/audit/reports/handlers, page.tsx ผู้เรียกและ CSV, Postman local/คู่มือ/offline tests ตาม specs/2026-10-02-api-field-names.md และ plans/2026-10-02-api-field-names-plan.md ลำดับ contract → services/types → ผู้เรียก → Postman/docs → offline/type-check/lint/build ไม่ DB/live HTTP/login/commit/push

## ข้อกำหนดชื่อ Field API — 2026-10-02

- REVIEWED เจ้าของให้ตรวจว่ามีการเปลี่ยนชื่อหรือไม่ ตรวจ adapters records/products/public products/users/audit/reports/login และจุดเรียกหน้าเว็บ พบ aliases/flattened relations/ตัวแปรwarehouseId บันทึกผลใน docs/API-FIELD-NAMING-REVIEW.md รอบนี้เฉพาะตรวจ+เอกสาร ไม่เปลี่ยนcontract/source/DB ไม่HTTP/login ต้องจัดแผน contract migration ก่อนแก้จริง

- DOCUMENTED เจ้าของกำชับชื่อในการต่อ API ต้องตรงกัน ไม่ดึง product.name แล้วเปลี่ยนเป็น fieldชื่อใหม่เอง บันทึกในSpecs/Plan/API-CONTRACTSเฉพาะเอกสาร ไม่มีการเปลี่ยนcode/contract/DBในรอบนี้ งานถัดไปใช้ fieldตามresponseจริง และต้องตกลงcontractก่อนเปลี่ยนชื่อ

## TASK-074 รวม API ตามโมดูล (2026-10-02)

- READY_FOR_USER_TEST แก้ Cloud Collection Zuugroup เดิมแล้ว55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903: ลบ34requests อัปเดต46requests อ่านกลับ133คำขอ ไม่มีเส้น filters/config/options/restore เก่า restore14คำขอใช้PATCH action restore คงrequest IDs/auth/variables/scriptsครบ ใช้granular update/deleteหลังbulk connectorปฏิเสธschema ไม่สร้างCollectionใหม่ ไม่SendAPI/DB เติม_postman_idในไฟล์localเดิมเพื่อระบุCollectionตรงกัน

- IN_PROGRESS แก้ตามภาพเจ้าของ: ยืนยัน Cloud Collection Zuugroup เดิมใน workspace7734105b-3c13-40b1-8adc-cfa12f7e7db8 มี167คำขอยังไม่อัปเดต เจ้าของท้วงให้แก้ชุดที่เห็น จึงอัปเดต collection55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903 เดิมให้133รายการตามไฟล์ local เก็บitem IDs/variables/auth/scripts ไม่สร้างCollectionใหม่ ไม่รันAPI/DB ตรวจอ่านกลับหลังupdate

- READY_FOR_USER_TEST ติดตาม Postmanตามคำสั่งเจ้าของ: ลบ44คำขอ เหลือ Zuugroup133/Authenticated24 รวม157app requests; ถอนกลุ่ม Supabase Data API และ filters/configแยก/combined examplesซ้ำ รวมmetadataในlist เก็บoptionsที่ฟอร์มใช้/Login4Role/CRUD จัดกลุ่มAuthenticatedตามโมดูล ถอน2variablesไม่มีผู้ใช้ คงIDsเดิม offline contract157ผ่าน ไม่แก้API/DB ไม่HTTP/Cloudsync/commit/push

- IN_PROGRESS ติดตามตามเจ้าของขอ “ใน postman อันไม่ใช้ลบออก”: ขอบเขตเฉพาะ collections local/คู่มือ/Specs/Plan/Task ลบ requests filters/config ซ้ำและกลุ่ม Supabase Data API ที่ยังไม่ได้ใช้ รวม metadata ใน list เก็บ view options ที่ฟอร์มใช้และ Login4Role/CRUD คง collection IDs ไม่แก้ API/DB ไม่ยิง HTTP ไม่ sync Cloud

- READY_FOR_USER_TEST ทำครบแล้ว: GET collection รองรับ include/view ตามโมดูล; DELETE users/products ใช้ transaction/guardsเดิม; PATCH restore; เพิ่ม GET detail users/products ตามสิทธิ์เดิม; ย้าย18หน้ารายการ+ฟอร์ม/รายละเอียด/Combobox ถอน65routesประกอบ; Postman local167+34คำขอ คง IDsเดิม; contracts/inventory/คู่มือครบ ตรวจ type-check/lint/build/offline contracts196app requests/pagination/59page integrity/resource dispatch+auth+last Admin/diff ผ่าน ไม่เปลี่ยน schema/DB ไม่ยิง live HTTP/login ไม่ syncCloud/Deploy/commit/push รอUAT

- IN_PROGRESS เจ้าของอนุมัติเอกสาร 2026-10-02 เริ่ม validators/types → routes/handlers → consumers/catalog → ถอนเส้นประกอบเก่า/Postman/docs → offline/type-check/lint/build ขอบเขตตามแผนย่อยเดิม ไม่ DB/live HTTP/Deploy/commit/push

- PLANNING เจ้าของตอบ “ok” กับแนวทางรวม resource/Method/include ตรวจ routes/consumer แล้ว จัด Specs/Plan/Task รออนุมัติเอกสารตาม AGENTS ข้อ3 ก่อน implementation ขอบเขต routes/services/validators/types/client pages/Postman local/docs/offline tests คง DB/RBAC/transaction/audit/last Admin guard ไม่รัน live HTTP/DB ไม่ deploy/commit/push

## TASK-073 จัด API types/validation/Postman (2026-10-02)

- READY_FOR_USER_TEST TASK-073 เจ้าของอนุมัติเอกสารแล้ว ทำ types6กลุ่ม/shared envelope + pure validators10ไฟล์ และย้าย client imports/response annotations ครบ Postman local167+29คำขอ/docs/API-CONTRACTS.md มี inventoryจากrouteจริง ตรวจtype-check/build/offline contracts191app requests/pagination/59page integrity/diffผ่าน full lint0errors แก้14unused type warningsและตรวจcreate filesซ้ำผ่าน เทียบ39validator outcomesก่อนหลังตรง ไม่DB/HTTP/login/cloudsync/Deploy/commit/push รอUAT

- PLANNING เจ้าของตกลงเดินงาน types/validation/Postman หลังยืนยันสิทธิ์4Roleใช้ได้และรอข้อมูลจริงก่อนกำหนด field/filter/scope เพิ่ม ตรวจปัจจุบัน: types/api.ts มีPagination, validationอยู่services/routes, collections v2.1 มี167+17คำขอ จัด Specs/Plan/Task รออนุมัติเอกสารตาม AGENTSข้อ3 ก่อน source changes คง endpoint/response/RBAC/DBและหน้าแยกเดิม ไม่ยิง liveAPI/login ไม่ sync Cloud

## TASK-072 วางแผนเก็บกวาดโค้ด (2026-10-02)

- READY_FOR_USER_TEST เจ้าของอนุมัติ “ok” ทำ TASK-072 ครบแล้ว ลบ dead exports/placeholders/fixture/เครื่องมือ import/preview/@heroui-react ปรับ Seed/ProductView/คู่มือ คง DB/schema/migrations/backup typegen/type-check/lint/build/offline integrity+pagination/seed static/diff ผ่าน ผล docs/CODE-CLEANUP-RESULT.md ไม่รัน live API/seed ไม่ commit/push

- ผลตรวจ exports เพิ่มในขอบเขตเก็บกวาด: formatThaiDate, listProducts, getProductById, listUsers, Logins พบเฉพาะ declaration ไม่มี consumer ใน src/scripts จะลบและคง paginated services/Next convention exports; @heroui/react ไม่ถูก import ถอนจาก package/lock แล้ว คง @heroui/styles ที่ CSS ใช้

- PLANNING ตามคำขอ “ไล่ลบข้อมูลที่ไม่ใช้และ mock ที่เป็น code ออก plan ก่อน” ตรวจ src/scripts/package และจุดอ้างอิงแล้ว จัด Specs/Plan/Task เพื่ออนุมัติก่อน implementation รอบนี้แก้เฉพาะเอกสาร ไม่ลบโค้ด/DB ไม่รัน seed/live API ขอบเขต proposed: dead exports, fixture ไม่มีผู้ใช้, preview เก่า, สคริปต์ import ที่ถอนตารางแล้ว และปรับ seed เก็บ migrations/backup/ข้อมูล DB

## TASK-071 เปลี่ยนชื่อพารามิเตอร์ (2026-10-02)

- READY_FOR_USER_TEST เปลี่ยน customers/products `[ref]` เป็น `[id]` รวม params และคู่มือแล้ว คงรหัสใน URL/การค้นหาข้อมูลเดิม next typegen/type-check/offline integrity/diff ผ่าน ไม่เหลือ `[ref]` ใน src/scripts ไม่แก้ DB/API รอเจ้าของเปิดรายละเอียดเดิม

## TASK-071 เริ่มแยก Route (2026-10-02)

- READY_FOR_USER_TEST เจ้าของอนุมัติ “ok ทำได้เลย” ย้าย54หน้าให้ UI/text/state/query/API functions อยู่ในแต่ละ page.tsx รวม create/detail/edit แยกComboboxไม่มีHTTP, auth/server dataอยู่layout, ลบ full-page components/components/pages/hookโหลดหน้ากลางแล้ว ใช้endpointเดิมไม่เพิ่มGETเพราะใช้serverdataเดิมได้ type-check/lint/build/test-route-pages/test-pagination/diffผ่าน รอUAT docs/ROUTE-PAGES-GUIDE.md ไม่แก้DB/schema ไม่ยิงliveAPI ไม่commit/push

## แยกโค้ดรายหน้า — TASK-071 (2026-10-02)

- PLANNING เจ้าของขอทุก page มีโครงหน้าเองรวมcreate/id และเอา components/pages ออก ยืนยัน shared Pagination/Combobox ได้ พร้อมตัวอย่าง text/JSX/endpoint/query/API functions/state อยู่ใน page.tsx ปรับ Specs/Plan/Task-071 แล้ว รออนุมัติTaskตาม AGENTSข้อ3 ขอบเขต src/app/**/page.tsx, layouts/data boundary, shared UIเล็ก, ลบ full-page components และคู่มือ ไม่แก้DB/กฎธุรกิจ

## TASK-064 เริ่ม implementation (2026-10-02)

- READY_FOR_USER_TEST เจ้าของอนุมัติ “ทำ” หลังผลตรวจ ทำ pagination/query/API users/products/audit, filters/CSV, client pages, shared clamp/abort, public default10 และ Postman local แล้ว type-check/lint/build/offline query tests ผ่าน รอ UAT ตาม docs/TEST-API-PAGINATION.md ไม่แก้ schema/seed ไม่ยิง live API ไม่ commit/push

## ตรวจ Pagination รอบติดตาม (2026-10-02)

- TASK-064: สำรวจโค้ดทุกหน้ารายการตามคำขอเจ้าของ ไม่แก้ implementation รอบนี้ พบ shared list 18 URL ใช้ API limit10/offset แล้ว; products ไม่มี pagination, users แบ่ง10ใน browserแต่ดึงทั้งหมด, audit แบ่ง20ที่ DBผ่าน server page ไม่มี REST endpoint; รายละเอียดใน TASK-064 รออนุมัติแผน implementation เดิม

## สถานะ Combobox (2026-10-02)

- TASK-070: READY_FOR_USER_TEST ช่องสถานะใน shared record form เป็น combobox แล้ว ใช้ filters statuses API เดิมรวมค่าปัจจุบัน/ค่าเริ่มต้นเดิม ดึงครั้งเดียวและค้นหาฝั่งหน้าเว็บ คงค่าจนเลือกรายการ type-check/eslint/diff ผ่าน รอทดสอบตาม TASK-070 ไม่สร้างกฎธุรกิจ

## ข้อความตรวจฟอร์มและ * สีแดง (2026-10-02)

- TASK-069: READY_FOR_USER_TEST ตามคำขอเจ้าของ แก้ shared RecordFormPage ตามภาพแล้ว required * สีแดงและข้อความไทยใต้ช่องแทน native tooltip ตรวจ input/textarea/relation ก่อนส่งหรือยืนยันแก้ไข type-check/eslint/diff ผ่าน รอทดสอบตาม TASK-069 ไม่แก้ API/DB

## Combobox ค้นหาและเลือก (2026-10-02)

- TASK-068: READY_FOR_USER_TEST ตามคำขอเจ้าของ เปลี่ยน RelationPicker ใน record-form-page.tsx เป็นช่องเดียวค้นหา/เลือกผ่าน options API เดิมแล้ว รองรับคีย์บอร์ด pagination และคง ID ที่เลือก type-check/lint/diff ผ่าน รอทดสอบตาม TASK-068; ไม่แก้ DB หรือ filter ทั่วไป

## พื้นหลัง Filter สีขาว (2026-10-02)

- TASK-067: READY_FOR_USER_TEST เจ้าของขอ bg filter สีขาว ตรวจแถบ/ช่องค้นหาและตัวเลือกใน shared list/users/products/audit → บันทึก Specs/Plan → เปลี่ยนพื้นเทาเป็น bg-white ครบสี่จุดแล้ว lint/diff ผ่าน รอเจ้าของตรวจหน้าจอ

## ป้ายสถานะตามภาพอ้างอิง (2026-10-02)

- TASK-065 งานแก้หัวสถานะ/coverage: เจ้าของกำหนดหัวคอลัมน์ “สถานะ”. ตรวจพบทุกtableที่มีstatusมีheaderแล้ว แต่ RecordTableRow desktopยังrenderข้อความ. แก้ module-list-page.tsx desktop StatusBadge/mobilelabel/deletedbadge, scope=col ในหัว shared/products/users และบันทึกมาตรฐานheaderในAGENTS/คู่มือ/Specs/Plan/Task. ลำดับเอกสาร→render→type-check/lint;ไม่เพิ่มคอลัมน์สถานะที่ไม่มีข้อมูล.

- TASK-065 งานต่อ: เจ้าของกำหนดให้ทุกหน้าที่แสดงสถานะใช้รูปแบบนี้และเป็นมาตรฐานถาวร. ตรวจ src ทั้งหมด, เปลี่ยนสถานะใน ModulePlaceholder เป็น StatusBadge และบันทึกข้อ14ใน AGENTS.md/STATUS-BADGE-GUIDE.md. อัปเดต Specs/Plan/Taskก่อนโค้ด; ไม่เปลี่ยนข้อความอธิบายหรือformselectเป็นป้าย. ตรวจ type-check/lint/diff.

ผลมาตรฐานถาวร: ป้ายModulePlaceholderที่เหลือใช้StatusBadgeแล้ว; AGENTS.mdข้อ14/คู่มือกำหนดสถานะใหม่ต้องใช้componentกลาง. type-check/lint/diff-checkผ่าน;ไม่เพิ่มAPI/DBหรือcommit/push.

- TASK-065: IN_PROGRESS. เจ้าของยืนยันให้ทำทุกสถานะและให้เลือกสีได้ 2026-10-02: bgระดับ50/textระดับ600. ขอบเขต status-badge.tsx, shared module list/detail/activity, users list/detail, products list/detail, Dashboard status และ Specs/Plan/Task. ลำดับ: ลงข้อกำหนด → mappingสีชัดเจน+fallback → เชื่อมทุกป้าย → lint/type-check/diff-check/UAT. คงข้อความ/สถานะเดิม ไม่สร้างกฎสต็อก. TASK-064 pagination ยังรออนุมัติ.

ผล TASK-065: READY_FOR_USER_TEST — StatusBadgeใช้ครบตามขอบเขต, bg50/text600/dot600, type-check/lint/diff-checkผ่าน. ไม่มีการเพิ่มข้อมูลหรือเปลี่ยนกฎธุรกิจ; รอตรวจหน้าเว็บจริง. ยังไม่ commit/push.

## Pagination ผ่าน API โดยคงดีไซน์เดิม (2026-10-02)

- TASK-064: PLANNING. เจ้าของขอทุกหน้ารายการ pagination ผ่าน API และย้ำว่ามี design แล้ว. สำรวจ shared list/reports ที่มี API10, จุดค้าง products/users/audit. ขอบเขตเอกสาร Specs/Plan/Task ก่อนอนุมัติ; ไม่แก้โค้ด/DB ในขั้นนี้. เสนอเปลี่ยนเฉพาะ data flow/query และใช้ markup pagination เดิม, default10/max50, total ฝั่ง DB, search/filter ฝั่ง DB; เก็บ CSV ผู้ใช้เป็นข้อมูลทั้งหมดตาม filter ผ่าน API ส่งออกแยก.

## แผน SuccessAlert ครบทุกการเปลี่ยนข้อมูล (2026-10-02)

- TASK-063 แก้ตามคำท้วงรอบนี้: จุดแก้ไขมี success หลังบันทึกแล้วแต่ยังไม่มี custom confirmation ก่อนบันทึก. เพิ่ม confirmation สำหรับ shared record edit, product edit และ user profile edit พร้อม pending snapshot/ยกเลิกไม่ส่งคำขอ; ปรับ ConfirmationDialog ให้รองรับ primary/ข้อความบันทึก. แก้เฉพาะไฟล์เหล่านี้และ Specs/Plan/Task/คู่มือ; ไม่แก้ API/DB. ไม่ขยายไปสร้างหรือปุ่มค้นหา. ตรวจ lint/type-check และเจ้าของ UAT.

ผลรอบแก้ไข: confirmation สำหรับแก้ข้อมูลครบสามกลุ่มแล้ว; type-check/lint/diff-check ผ่าน; รอเจ้าของทดสอบยกเลิก/ยืนยันและ success/error จริง.

- TASK-063: IN_PROGRESS เจ้าของอนุมัติ 2026-10-02 และกำหนดให้ใช้ modal ของเว็บแทน native alert/confirm ในภาพ. ขอบเขต confirmation-dialog.tsx, shared record CRUD/list, product create/detail, user create/detail, SuccessAlert เท่าที่จำเป็น และคู่มือ UAT/Specs/Plan/Task. ลำดับ: บันทึกข้อกำหนดใหม่ → custom confirm ลบรายการ/ผู้ใช้/สินค้า → pending guards/ข้อความสำเร็จครบทุก mutation → lint/type-check/build → เจ้าของตรวจหน้าจอ. ไม่แก้ API/DB; ไม่ยิง HTTP อัตโนมัติ.

ผล TASK-063: READY_FOR_USER_TEST — implementation และ lint/type-check/build/diff-check ผ่าน; ไม่พบ browser confirm/alert ใน src. รอ UAT ตาม docs/TEST-SUCCESS-ALERT.md; ยังไม่ commit/push งานนี้.

## แก้ dependency ในเครื่อง (2026-10-02)

- TASK-053 งานย่อย: เจ้าของรายงาน Cannot resolve axios; package.json/lock ระบุ axios 1.20.0 แล้วแต่ node_modules ไม่มี. ขอบเขตเฉพาะติดตั้ง dependency ตามข้อกำหนดที่อนุมัติเดิมและบันทึกผลในแผน/Task TASK-053; ไม่แก้ HTTP client/API/DB และเก็บ next-env.d.ts ที่เปลี่ยนก่อนงานนี้. ลำดับ: ตรวจ lock/installed → npm install โดยงด lifecycle scripts → resolve axios/type-check → ให้เจ้าของ reload หน้าเว็บ.

ผล: ติดตั้งแล้ว resolve axios 1.20.0 และ type-check ผ่าน; lockfile เนื้อหาเดิม. รอผู้ใช้ reload ตรวจรับ.

## ขอบเขตรอบนี้ (2026-10-01)

- TASK-062: เจ้าของสั่ง checkpoint และ commit งาน SuccessAlert หลัง `f25284d`. ตรวจ branch/diff และไฟล์ข้อมูลลับ; สร้าง `tasks/CHECKPOINT-2026-10-01-3.md` กับ `tasks/TASK-062-checkpoint-commit.md`; stage เฉพาะงานใน working tree, ตรวจ staged diff/secret แล้ว commit บน branch `AI` โดยไม่ push. ผลตรวจ static ของ TASK-061 ผ่านแล้ว; UAT ยังรอเจ้าของ.

- TASK-061: หลัง checkpoint `f25284d` เจ้าของแจ้งว่า SuccessAlertComponent ยังไม่เสร็จ. ตรวจ component และจุดสำเร็จจริง; เติม alert ใน `src/components/pages/record-form-page.tsx`, `src/components/pages/record-detail-page.tsx`, `src/app/products/create/create-product-form.tsx`, `src/app/users/create/create-user-form.tsx`, `src/app/users/[employeeCode]/user-detail-content.tsx` และปรับ `src/components/ui/success-alert-component.tsx` เท่าที่จำเป็น. บันทึก Specs/Plan/Task ก่อนโค้ด; ให้การนำทางหลังสร้าง/ลบเกิดหลังปิด alert; ไม่แก้ API/DB. ตรวจ lint/type-check/build และ UAT.

- TASK-060: เจ้าของสั่ง checkpoint และ commit งานปัจจุบันก่อนกลับไปแก้ SuccessAlertComponent. ตรวจ changed files/credential, ลด diff ของ `package-lock.json` เฉพาะรูปแบบบรรทัด/ย่อหน้าโดยคง JSON เดิม, สร้าง `tasks/CHECKPOINT-2026-10-01-2.md` และ `tasks/TASK-060-checkpoint-commit.md`, stage งานใน branch `AI`, ตรวจ staged diff/secret, commit โดยไม่ push. หลัง commit เปิด Task ใหม่เพื่อเติม SuccessAlert ตามคำท้วงของเจ้าของ.

- TASK-059: เจ้าของขอ Loading เต็มหน้าจอระหว่างเปลี่ยนหน้าและโหลดข้อมูล พร้อม icon และ motion ที่นุ่มขึ้น. ขอบเขต `src/components/ui/loading-component.tsx`, `src/components/icons/status-icons.tsx`, `src/app/loading.tsx`, `src/app/layout.tsx`, `src/app/dashboard-page-content.tsx`, `src/components/pages/module-list-page.tsx`, `src/components/pages/record-detail-page.tsx` และ Specs/Plan/Task. เพิ่ม Suspense รอบการอ่าน session ใน layout เพื่อให้หน้าแรกมี fallback; ไม่แก้ API/DB. ลำดับ: ลง Specs/Plan → ปรับ UI และเชื่อมจุดโหลด → lint/type-check/build และตรวจหน้าจอ → UAT.

- TASK-058: เจ้าของขอคู่มือชื่อโฟลเดอร์ API ใน Postman เป็นไทย/อังกฤษและอธิบายหน้าที่. ตรวจ Collection `postman/Zuugroup.postman_collection.json`, route และ metadata ที่มีจริง; สร้าง `docs/API-NAME-GUIDE.md`, เชื่อมจาก `postman/README.md`, บันทึก Specs/Plan/Task. งานเอกสารเท่านั้น ไม่แก้ endpoint/Collection/DB และไม่ส่งคำขอ API. ลำดับ: ตรวจชื่อ/URL → ลง Specs/Plan → เขียนคู่มือและลิงก์ → ตรวจครบ 23 กลุ่ม/167 คำขอและ diff.

- TASK-057: เจ้าของขอเปิดหน้ารายละเอียดเมื่อกดตำแหน่งใดก็ได้ของแถวตาราง แทนการกดชื่อหรือปุ่มคอลัมน์ท้าย. ขอบเขต `src/components/pages/module-list-page.tsx`, `src/app/products/products-list.tsx`, `src/app/users/users-list-content.tsx` และ Specs/Plan/Task; คงปุ่มกู้คืนในแท็บลบแล้วและตาราง Audit ที่ไม่มีหน้ารายละเอียด. ลำดับ: บันทึก Specs/Plan → ปรับแถว desktop/mobile และคีย์บอร์ด → lint/type-check/build → UAT.

- TASK-056: เจ้าของขอ SuccessAlertComponent, NotFoundComponent, LoadingComponent และที่เก็บ SVG ใน `src/components/icons/`. งานนี้ครอบคลุม Specs/Plan/Task, คอมโพเนนต์กลาง และการใช้ใน `src/components/pages/module-list-page.tsx`, `src/app/products/[ref]/product-detail.tsx`, `src/app/dashboard-page-content.tsx`; ไม่แก้ API, DB หรือกฎธุรกิจ. ลำดับ: บันทึกข้อกำหนดและแผน → สร้างคอมโพเนนต์/ไอคอน → เชื่อมสถานะโหลด/ว่าง/สำเร็จ → lint/type-check/build และ UAT.

- TASK-055: เจ้าของให้ลบข้อความประกอบที่ลอยหรือซ้ำกับชื่อหน้า เช่น คำบรรยายสินค้า, footer เขตเวลา/Zuugroup และบรรทัด “ข้อมูลในระบบ · แสดงครั้งละ 10 รายการ”. ตรวจและตัด caption ใน Topbar, รายการ/รายละเอียด/หน้าเพิ่มสินค้า, Audit Logs และรายการรายโมดูล โดยคงชื่อหน้า, จำนวนรายการ, สถานะว่างและคำอธิบายที่จำเป็นต่อการกรอกฟอร์ม. แก้ Specs/Plan/Task ก่อน component; ตรวจ lint/type-check/build และหน้าเว็บ.

- TASK-037 งานย่อย Login temporary 2026-10-01: เจ้าของรายงานข้อความ “ระบบเชื่อมต่อข้อมูลชั่วคราวไม่ได้”. ตรวจ `.env.local` แบบไม่แสดงค่า, DB SELECT/rollback update และ public GET แล้วผ่าน; ขยาย retry `P1017` เฉพาะการอัปเดต `lastLoginAt` ที่ใช้ timestamp เดิมเมื่อ retry และบันทึกรหัส error ที่ server โดยไม่แสดง credential. แก้ Specs/Plan/Task ก่อน `src/server/auth/login.ts`; ตรวจ static และรอเจ้าของ UAT Login.

- TASK-054: เจ้าของให้ค่า Supabase URL/publishable/secret/JWKS และข้อมูล host/port/database/user สำหรับ `.env.local`; ตรวจค่าโดยไม่แสดง secret, จับคู่ชื่อกับ environment ที่โค้ดใช้, ปรับเฉพาะ secret ที่ต่างและเพิ่ม JWKS, `DATABASE_URL` เชื่อมได้. หลังเจ้าของวางค่าชุดใหม่ `DIRECT_URL` ไม่มีในไฟล์ จึงต้องเติมจาก Supabase Dashboard ก่อนรัน migration; ไม่กระทบ Login. ไม่พิมพ์ credential ใน Specs/Plan/Task/ผลตรวจ.

- TASK-053: เจ้าของอนุมัติ 2026-10-01 ให้รวมการเรียก API จาก Client Component ผ่าน `src/service/http.ts` ตามตัวอย่าง 5 ฟังก์ชัน; คง Next.js route.ts/URL เดิม, ใช้ GET/POST/PATCH/DELETE, try/catch และ error/401 ส่วนกลาง. แก้เฉพาะ HTTP client, หน้า Client ที่เรียก fetch โดยตรง, dependency และเอกสาร; ไม่แตะ schema/seed/DB. ดู Specs/Plan/Task TASK-053. `next-env.d.ts` และ `package-lock.json` มีการเปลี่ยนแปลงก่อนเริ่มงาน; เก็บการเปลี่ยนแปลงเดิมไว้.

- เจ้าของสั่งหยุดและทำ checkpoint/commit/push 2026-10-01; อ่าน tasks/CHECKPOINT-2026-10-01.md ก่อนทำต่อ. รอบถัดไปทบทวน types/api.ts, validation Schema และ Seed โดยไม่แทน Next.js route.ts.

- TASK-052: อนุมัติแล้ว; ตารางรายโมดูล/CRUD/API/UI/Postman และเก็บประวัติ migration ก่อนถอน demo; เจ้าของเพิ่มคำขอเติมข้อมูลทุกโมดูล 2026-10-01: จัด seed ที่รันซ้ำได้ใน scripts/seed-operational-data.mjs และ SQL เพิ่มข้อมูลตั้งต้นให้เห็น pagination 10, รวมสินค้า/ข้อมูลแม่; ไม่มี Ledger/ยอดคลัง/รับชำระและไม่ทับข้อมูลเดิม; ใช้บัญชี 4 Role เดิม; เก็บงาน retirement migration, Postman response Variables และคู่มือ/static checks

- TASK-051: อนุมัติแล้ว ใช้ข้อมูลที่มีและฟิลด์หลักก่อน; ย้ายต้นฉบับ 19 ชุด/57 แถวเข้า DB, schema/migration/seed ใน prisma และ scripts, GET ใน src/server/demo และ src/app/api/demo, component/page เดิมอ่าน API ครั้งละ 10, proxy/Prisma refresh, Postman/คู่มือ; หยุดการบันทึก sessionStorage ของชุดนี้และไม่เดากฎธุรกิจ

- TASK-050: อนุมัติแล้ว; ทำ GET สาธารณะสินค้าและข้อมูลแม่ตามตัวอย่าง Restful API พร้อม list/getbyid และ Params; แก้ `src/app/api/public/*`, `src/server/products/public-service.ts`, Collection/คู่มือ และเอกสารงาน; สำรอง Collection เดิม; ไม่ยิงคำขอทดสอบตามคำสั่งเดิมของผู้ใช้

- TASK-049: เตรียม Postman เรียก Supabase Data API โดยตรงด้วย publishable key และ Bearer ของผู้ใช้; แก้เฉพาะ Specs/Plan/Task, Collection และคู่มือ; ไม่ใช้ secret key ใน Postman, ไม่แก้ GRANT/RLS/DB และไม่ส่งคำขอทดสอบตามคำสั่งผู้ใช้

- TASK-048: เพิ่ม Bearer token ให้ POST login/GET API และ POST แยก 4 บัญชีใน Collection Zuugroup พร้อมสคริปต์ Variables; อัปเดต Specs/Plan ก่อนโค้ด; ยังไม่ใส่รหัสผ่านหรือ token จริงในไฟล์/Workspace; ตรวจ Auth/RBAC และผล HTTP ตามระบบที่เข้าถึงได้
- TASK-046: นำ Collection GET ชื่อ `Zuugroup` ขึ้น Postman Workspace ที่เชื่อมแล้ว ตรวจจำนวนคำขอและโครงสร้างไฟล์ JSON ตาม Collection v2.1
- TASK-047: ตรวจความสามารถของเครื่องมือ Postman สำหรับ Data request, ปรับคู่มือ/สถานะตามผลจริง โดยไม่ส่งหรือบันทึก DB credential และไม่แก้ DB

| Task | ผู้รับผิดชอบ | สถานะ | ขอบเขต | หมายเหตุ |
|---|---|---|---|---|
| TASK-062 | AI | COMPLETE | checkpoint และ commit งาน SuccessAlert ใน TASK-061 | ตรวจ staged diff และ credential; commit บน branch AI โดยไม่ push; รอ UAT ของ TASK-061 |
| TASK-061 | AI | READY_FOR_USER_TEST | SuccessAlert สำหรับสร้าง/แก้/ลบ/กู้คืนในฟอร์มรายการ, สินค้า, ผู้ใช้ | flow ที่เปลี่ยนหน้ารอปิด alert; dialog รองรับ Tab และ entrance motion; lint/type-check/build/diff-check ผ่าน; รอ UAT |
| TASK-060 | AI | COMPLETE | checkpoint และ commit งานก่อน SuccessAlert | commit `f25284d` บน branch AI, 56 ไฟล์, ตรวจ staged secret และ `.env.local` ไม่ถูกติดตาม; ไม่ push |
| TASK-059 | AI | READY_FOR_USER_TEST | Loading เต็มหน้าจอ/ไอคอน/แอนิเมชัน ใน session fallback, route fallback และ GET หลัก | lint/type-check/build/Prettier/diff-check ผ่าน; CSS motion สร้างแล้ว; เครื่องมือ browser ไม่เริ่มทำงาน จึงรอเจ้าของดูจังหวะจริงและ reduced motion |
| TASK-058 | AI | READY_FOR_USER_REVIEW | คู่มือชื่อโฟลเดอร์ API ไทย/อังกฤษและหน้าที่; `docs/API-NAME-GUIDE.md`, `postman/README.md`, Specs/Plan/Task | ตรวจชื่อเรียงตรง Collection ครบ 23 โฟลเดอร์/167 คำขอ, URL ตัวอย่างตรงไฟล์, `git diff --check` ผ่าน; รอเจ้าของอ่านทวนคำอธิบาย |
| TASK-057 | AI | READY_FOR_USER_TEST | เปิดรายละเอียดจากทั้งแถวในรายการโมดูล/สินค้า/ผู้ใช้งาน | desktop/mobile ที่มี URL รองรับคลิกและ Enter/Space; คงปุ่มกู้คืน; lint/type-check/build/diff-check ผ่าน; รอเจ้าของทดสอบหน้าเว็บ |
| TASK-056 | AI | READY_FOR_USER_TEST | คอมโพเนนต์สถานะกลางและ SVG icon; หน้ารายการโมดูล/รายละเอียดสินค้า/Dashboard | สร้าง 3 คอมโพเนนต์และไอคอน 4 ตัว; lint/type-check/build ผ่าน; รอเจ้าของทดสอบสถานะโหลด/ว่าง/สำเร็จ |
| TASK-055 | AI | READY_FOR_USER_TEST | ลบข้อความประกอบที่ลอย/ซ้ำบน UI | Topbar/footer, สินค้า, Audit Logs, รายการรายโมดูล; ไม่พบข้อความตัวอย่างใน component; lint/type-check/build/diff-check ผ่าน; รอเจ้าของดูหน้า |
| TASK-054 | AI | COMPLETE | ตรวจและเชื่อมค่า Supabase ใน `.env.local` | URL/publishable/secret/JWKS มีค่า; DATABASE_URL เชื่อมได้; เจ้าของยืนยัน Login ใช้ได้; DIRECT_URL ต้องเติมก่อน migration |
| TASK-053 | AI | READY_FOR_USER_TEST | Client API service กลางและย้าย Client Component ที่เรียก fetch ตรง | Axios GET/POST/PATCH/DELETE/Login, try/catch, 401 ไป Login, 403 แสดง error; lint/type-check/build/diff-check ผ่าน; รอ Browser UAT |
| TASK-052 | AI | PAUSED_BY_OWNER | ตารางรายโมดูลจริง/ย้ายข้อมูล/CRUD/API/UI/Postman | DB/seed/API/UI/Postman ลงแล้ว; เจ้าของสั่ง checkpoint/commit/push; รายละเอียดงานต่อใน CHECKPOINT-2026-10-01.md |
| TASK-051 | AI | READY_FOR_USER_TEST | DB/API/UI/seed/Postman สำหรับข้อมูลตัวอย่างเดิม 19 ชุด | Migration และ seed ลง Supabase 19 ชุด/57 แถว; UI เลิกอ่าน data.ts และ sessionStorage; 77 GET ใหม่ รวม Collection 87 GET, list scripts 23; TypeScript/lint/build ผ่าน; ไม่ยิง HTTP ตามผู้ใช้ |
| TASK-050 | AI | READY_FOR_USER_TEST | Public GET สินค้า/ข้อมูลแม่ list/getbyid พร้อม Params, proxy ข้าม Auth, Collection/คู่มือและเอกสารงาน | อนุมัติแล้ว; build/TypeScript/lint ผ่าน; Workspace ใหม่ 5 กลุ่ม 10 GET No Auth; Collection เดิมเก็บชื่อ Authenticated; ยังไม่ยิง GET จริงตามคำสั่งผู้ใช้ |
| TASK-049 | AI | READY_FOR_USER_TEST | Postman GET Supabase Data API 5 ตารางด้วย publishable key: `postman/Zuugroup.postman_collection.json`, `postman/README.md`, Specs/Plan/Task | เพิ่มใน Workspace แล้ว; ไม่ยิงคำขอทดสอบตามผู้ใช้; DB ปัจจุบันยังถอน GRANT/เปิด RLS จึงรอ Task อนุมัติกฎสิทธิ์ก่อนอ่านข้อมูลตรงได้ |
| TASK-048 | AI | READY_FOR_USER_TEST | POST login คืน Bearer token, API ตรวจ token และ Collection มี POST แยก 4 บัญชี: `src/server/auth/login.ts`, `src/server/auth/current-user.ts`, `src/lib/supabase/server.ts`, `src/app/api/auth/login/route.ts`, `postman/*` และเอกสาร TASK-048 | POST 200 และ GET ตาม Role ผ่านกับ DB จริงทั้ง 4 บัญชี; Collection Workspace 4 POST/4 GET, lint/type-check/build ผ่าน; ระหว่างทดสอบซ้ำพบ DB 503 ชั่วคราวหนึ่งครั้งแล้วกลับมา 200; รอผู้ใช้ทดสอบ Variables ใน Postman Desktop |
| TASK-037 | AI | IN_PROGRESS | Auth/RBAC และจัดการผู้ใช้จริง; แก้ Login เมื่อ Prisma connection ปิดใน `src/server/db/prisma.ts`, `src/app/login/*`, `src/server/auth/current-user.ts` | เพิ่ม retry read และ `lastLoginAt` เมื่อ P1017; เจ้าของยืนยัน Login ใช้ได้ 2026-10-01, lint/type-check/build ผ่าน; UAT Auth/RBAC ส่วนอื่นยังค้าง |
| TASK-038 | AI | READY_FOR_USER_TEST | แยกฟอร์มเพิ่มรายการของหน้า Mock ที่ใช้ `ModuleListPage` ทั้ง 20 หน้าเป็น URL `<หน้ารายการ>/create`; คงการทำงานตัวอย่างในแท็บ | route ครบ 20/20; lint/type-check/build/diff-check และตรวจ storage ผ่าน; รอผู้ใช้ตรวจหน้าและการนำทาง |
| TASK-039 | AI | READY_FOR_USER_TEST | ปิดสิทธิ์เรียก `public.rls_auto_enable()` จากผู้ใช้ API ทั่วไปตาม Security Advisor โดยคง event trigger | Deploy migration แล้ว; `anon`/`authenticated` EXECUTE=false, trigger `ensure_rls` ยังเปิด, คำเตือนเดิมหาย; รอตรวจพฤติกรรม trigger ในสภาพแวดล้อมทดสอบ |
| TASK-040 | AI | READY_FOR_USER_TEST | ภาพรวมเส้นทาง Phase 3–9 และ Detail Mock ลูกค้า/สินค้า; ไฟล์ตามแผนย่อย TASK-040 | route และลิงก์รายการครบ, lint/type-check/build/diff-check ผ่าน; รอเจ้าของโครงการตรวจดีไซน์และการคลิก |
| TASK-041 | AI | COMPLETE | DB-first Specs/Plan และลำดับงาน; `docs/specs/2026-09-23-1550-project-specs.md`, `docs/specs/2026-10-01-db-first-amendment.md`, `docs/plans/2026-09-23-1635-project-plan.md`, `docs/plans/2026-10-01-db-first-plan.md`, `tasks/TASK-041-db-first.md`, `tasks/ACTIVE.md` | เจ้าของโครงการอนุมัติ 2026-10-01 และให้เริ่ม TASK-042 |
| TASK-042 | AI | READY_FOR_USER_TEST | ข้อมูลหลักสินค้าใน DB: `docs/specs/2026-10-01-product-master.md`, `docs/plans/2026-10-01-product-master-plan.md`, `tasks/TASK-042-product-master.md`, `prisma/schema.prisma`, `prisma/migrations/*`, `src/server/products/*`, `src/server/auth/api-authorization.ts`, `src/app/api/products/*`, `src/app/products/*`, `src/app/README.md`, `scripts/*`, `package.json`, `tasks/ACTIVE.md`; ไม่สร้างยอดสต็อก | Migration 2 ชุดและ seed ลง Supabase แล้ว; seed ซ้ำสินค้า 2/Audit 2, RLS และ grant ตรวจแล้ว; type-check/lint/build ผ่าน; รอ UAT ด้วยบัญชีจริง |
| TASK-043 | AI | READY_FOR_USER_TEST | แก้ Prisma Client ค้างหลัง generate โมเดลสินค้า: `src/server/db/prisma.ts`, `docs/plans/2026-10-01-prisma-client-refresh-plan.md`, `tasks/TASK-043-prisma-client-refresh.md`, `tasks/ACTIVE.md`; รีสตาร์ต dev server พอร์ต 5000 | generated Client มี Product; Prisma generate, TypeScript, ESLint, build ผ่าน; `/products` พาไป Login เมื่อยังไม่ลงชื่อเข้าใช้; รอผู้ใช้ทดสอบหน้ารายการหลังล็อกอิน |
| TASK-044 | AI | PLANNING | สำรวจหน้า Mock และจัดแผนย้ายข้อมูลเข้า DB ตามคำขอใหม่: `docs/specs/2026-10-01-mock-retirement.md`, `docs/plans/2026-10-01-mock-retirement-plan.md`, `tasks/TASK-044-mock-retirement.md`, `tasks/ACTIVE.md`; ยังไม่แก้ schema หรือหน้าเว็บ | TASK-045 ย้าย Audit Logs แล้ว; เหลือ Dashboard กับ 18 หน้ารายการ Mock; รอเลือกขอบเขต/seed และอนุมัติ Task รายโมดูลตาม AGENTS.md ข้อ 3 |
| TASK-045 | AI | READY_FOR_USER_TEST | ย้าย Audit Logs จาก Mock ไปอ่าน `audit_events`: `docs/specs/2026-10-01-audit-log-db-view.md`, `docs/plans/2026-10-01-audit-log-db-view-plan.md`, `tasks/TASK-045-audit-log-db-view.md`, `tasks/ACTIVE.md`, `src/app/audit-logs/*`, `src/server/audit-logs/*`, `src/app/README.md`; ไม่แก้ schema | เจ้าของโครงการอนุมัติ 2026-10-01; query จริงพบ 12 เหตุการณ์, TypeScript/lint/build ผ่าน, ปิด `/audit-logs/create`; รอ UAT ด้วยบัญชี Admin และ Role อื่น |
| TASK-046 | AI | READY_FOR_USER_TEST | จัด Postman Collection ชื่อ Zuugroup เฉพาะ GET ที่มีจริง: `docs/specs/2026-10-01-postman-get.md`, `docs/plans/2026-10-01-postman-get-plan.md`, `postman/*`, `tasks/TASK-046-postman-get.md`, `tasks/ACTIVE.md`; ไม่เพิ่ม API/DB | สร้าง Collection ใน Postman Workspace แล้ว ID `56ce2cc3-c4bc-4d0b-b84d-0f17bc254c64`; อ่านกลับพบ 4 GET ครบ; รอทดสอบด้วย Cookie ของบัญชีจริง |
| TASK-047 | AI | IN_PROGRESS | เตรียม Postman Data requests แบบอ่าน DB โดยตรง: `docs/specs/2026-10-01-postman-direct-db.md`, `docs/plans/2026-10-01-postman-direct-db-plan.md`, `postman/README.md`, `postman/sql/*`, `tasks/TASK-047-postman-direct-db.md`, `tasks/ACTIVE.md`; ไม่เก็บ credential และไม่แก้ DB | เชื่อม Postman Workspace แล้ว แต่ connector ไม่มีคำสั่งสร้าง Data request และไม่เห็น Postman Desktop; เตรียม SELECT และคู่มือ Read-only แล้ว รอสร้างคำขอใน Desktop |


## ตัวหนังสือปุ่มเพิ่มข้อมูล — 2026-10-02 (TASK-066)

เจ้าของขอข้อความสีขาว ปรับ text-white! ในปุ่มเพิ่ม shared list/users/products และพื้นน้ำเงินข้อความขาวในปุ่มเพิ่มรายการแม่แล้ว lint/diff ผ่าน รอเจ้าของตรวจหน้าจอ ปลายทางและพฤติกรรมเดิม
