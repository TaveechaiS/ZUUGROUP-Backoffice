# TASK-207 — Postman และ API สินค้า/สต็อก

IMPLEMENTED / WAITING_FOR_UAT — 6 ตุลาคม 2569. ผู้ใช้อนุมัติTASK206และแก้Comboเป็นครบทุกค่า/เลื่อนสูงสุด10แถว. ไม่มีpaginationหรือselectedIDfetchในCombo.

Cloudอ่านกลับ41requests/41descriptions/41tests/81examples/formdataถูกต้อง/tokenpasswordemailblank. ชื่อgiveแยกแจก/บริจาค. IDsสำหรับsyncเดิมในpostman/Zuugroup.remote.jsonและscriptbuildคงIDs ไม่สร้างซ้ำเมื่อต้องอัปเดต. ESLint/TypeScript/Productionbuild/diffผ่าน; backendcontract13และCombo25ค่าผ่าน. SQLใหม่SELECTจริงผ่าน. ยังไม่ทำHTTPmutationหรือUAT browserกับผู้ใช้จริง.

## ลำดับและผลลัพธ์

1. Specs/Plan/contract: บันทึกการอนุมัติและข้อยกเว้นCombo; สัญญาในdocs/api/products-stock-contract.md.
2. Collection: สร้างใหม่Zuugroupในworkspaceเดิม7734105b-3c13-40b1-8adc-cfa12f7e7db8; id55942202-9e4e5e82-607d-4bea-9a5d-e1c9a9b8d12f. 41requests/auth/products/stock/10resourcefolders. CLIไม่พบจึงใช้MCPกับไฟล์v2.1ที่repoใช้เดิม. Connectorcreateไม่รับexamples/events/description/formdataบางfields: จึงสร้างcoreก่อนแล้วใช้request/response endpointsเติมทีละรายการ. ไม่สร้างworkspaceซ้ำ/ลบcollectionอื่น. scriptbuildใช้sourcecontract ไม่คัดlegacyทั้งหมด.
3. Receiveoptions: scope=receiveไม่querypolicy/available/customers/users. สินค้าactiveครบตามข้อตกลงCombo; warehouses/nextID/actor. Receiptdetailรับcapabilitiesตรง ไม่GEToptionsเพิ่ม.
4. Combo: batch kindsรวม10ชนิดSQLเดียว,ข้อมูลครบ; cacheอยู่ในฟอร์มinstanceเดียว/inflightdedupe/windowfocusinvalidateก่อนvalidateค่าปิด. ไม่invalidateเมื่อfocusช่องในเว็บ. ค้นlocal/scroll10/keyboard/brandremember/manufacturerrememberเดิม; ไม่มีloadmore/idlookup. ไม่สร้างcomponentเฉพาะหน้าใหม่.
5. Detail/table: ถอนmastersSSRที่ไม่ใช้; canonicalACCOUNTING_CFO; ปิดกล่องไม่mountfields/images. ตารางรับmarketingDaysminจากSQLแทนล็อตทั้งหมด; categoriesmetadataครั้งแรก/retryเท่านั้นและreuseในinstance. ตาราง10/serverfilter-sort/count/ล็อตdestroyretainedคงเดิม.
6. ตรวจ13contractcases + actualCombo25options/localfilter/selectionbeyond10, lint/type/build, cloudreadback. ไม่HTTPwrite/DBwrite/commit/deploy.

## ไฟล์

postman/Zuugroup.postman_collection.json, scripts/build-postman-products-stock.mjs, scripts/test-products-stock-api.mjs, scripts/test-product-combobox.mjs; server/products/options/options-handler,operations/service,APIproducts/[id]; products/page/create/[id]layout+page,stock/[warehouse]/create/receipts/[id]; sharedsearch-combobox; typesoperations; Specs/Plan/contract/ACTIVE/task.

## P4 การประเมิน

Fixtureเดียวกัน: receivebootstrap3queries/319bytes เทียบlegacy6queries/407bytes. เป็นตัวอย่างควบคุม ไม่ใช่ตัวเลขproduction/latencyจริง. Detail2→1request; firstComboรวมหลายkind1request และtyping/scroll0request. readonlyproductSSRเลิกquerymasters4ชุด; summaryMARKETINGข้อมูลเติบโตตาม10productrowsแทนlotcount. ไม่เพิ่มETagเพราะชุดComboreuseในฟอร์มแล้วและยังไม่มีversioninvalidationที่พิสูจน์ว่าcacheข้ามnavigationคุ้ม; stock/capabilitiesคงno-store. รูปdownloadเมื่อเปิดAccordion/คลิกเอกสารแล้ว จึงไม่เพิ่มthumbnailmigrationหรือqueueconcurrentจนมีmeasurementไฟล์จริงที่คุ้มกับความซับซ้อนตามP4ที่อนุมัติแบบมีเงื่อนไข. ไม่อ้างเปอร์เซ็นต์ลดเวลาจริง.

ตรวจSQLจริงบนSupabase projectเดิมแบบSELECTเท่านั้น: activeoptions41แถว, productreceive12แถว (JSONเฉพาะproductfields2239bytes), summaryMARKETING9แถวจากproductpage10/minวัน730. Batch/receive/minGROUPBYทำงานกับschemaจริง ไม่สร้างschema/ข้อมูล/permission. SkillSupabase+postgres-best-practicesประกอบการตรวจ. Benchmarkfixtureข้างต้นแยกจากข้อมูลจริง ไม่แทนlatencyเว็บจริง.

เปรียบเทียบfieldprojectionกับข้อมูลจริงเดียวกัน: productsเดิม2670bytes →2239bytes; ตัดcustomersJSON2bytes/usersJSON427bytesและpolicyออกจากreceivepayload. จำนวนproduct12เท่าเดิมตามกฎComboครบทุกค่า. เป็นขนาดJSONส่วนข้อมูลจากPostgreSQL ไม่รวมHTTPheaders/actor/warehouse/การserializeฝั่งNext จึงไม่อ้างว่าเป็นขนาดresponseเว็บทั้งหมด.

## ต้องตรวจรับโดยเจ้าของ

- PostmanZuugroupfolderย่อยตรง/41เส้น; ใส่baseUrl/tokenในEnvironmentส่วนตัวแล้วเริ่มGET. ไม่Runทั้งCollectionกับข้อมูลจริงเพราะมีwrite.
- เพิ่มสินค้าComboมากกว่า10ค่าเลื่อนถึงท้าย/ค้นในเว็บ/เลือกและเลขรหัสยังถูก; กลับจากตั้งค่ารายการปิดต้องตรวจใหม่.
- เพิ่มสต็อกเลือกสินค้าและMAINเริ่มต้น/เลขGRแก้เลขได้; ดูรับเข้าไม่มีrequestoptionsเพิ่มและAdminแก้ได้ตามกฎเดิม.
- เปลี่ยนหน้า/search/sort3จังหวะตาราง10; MARKETINGminวันคงเดิม; กล่องรูปปิดไม่downloadรูป เปิดแล้วดูได้.
- การแก้ข้อมูลfull-productในหน้าดูยังเป็นข้อจำกัดของระบบเดิม: PATCHlegacyตอบ409เมื่อproduct.detailsมีค่า และUIเดิมแก้localเท่านั้น. Collectionระบุชัด ไม่สร้างendpointแก้fullโดยเดากฎ/สิทธิ์/ไฟล์เพิ่มในงานลดpayloadนี้.
