# TASK-210 — Pagination เลือก10/20/50/100

IMPLEMENTED / WAITING_FOR_UAT — 6 ตุลาคม 2569

Cloudอ่านกลับZuugroup41requests/14pageddescriptionsตามTASK210/rootinfoเลือก10/20/50/100/defaultlimit10. ไม่มีการสร้างcollectionใหม่หรือเปลี่ยนURLs/ID. Productstockcontract14checksรวม100accept101rejectผ่าน. UI/pageSizeใช้กลาง26pages; API1–100คงรองรับdetail1และdefault10. UATต้องเลือกทุกขนาด/lastpage/filter-sort/zero/mobileด้วยuserจริง.

1. Componentกลางpagination-controls.tsxใช้nativebuttonsสไตล์ตัวอย่าง(svg16/activegreenhexเดิม/ellipsis/firstlast/aria-current/disabled/ภาษาไทย) พร้อมselectจำนวน. ไม่เพิ่มdependencyใหม่. Normalizeempty1page/invalidcurrentและmaxVisiblepages.
2. 14recordlistpages/Users/Audit/Products2+history+lots/Orders3/settingsoption/linkedcustomer2 ใช้componentกลาง, pageSizeuseState10/queryactual/resetpage1/Abort. UIเป็นตาราง ไม่แตะasyncrelationComboboxหรือfulloptionsbatch.
3. Serverpagination/operations/records/reports/warehouse/publicvalidatorsmax100โดยคงoffsetbound/detaillimit1/role/cost. productoptioncap100เดิม. Postmanlimitdefault10ปรับเลขได้100/อธิบายcontractไม่เปลี่ยนURL.
4. Tests: visiblepageedges/ellipsis/clickboundary/sizechange10→100/zero/lastpage, server100accept101reject/detail1, existingroutechecks; ESLint/type/build/diff. NoDBwrite.

ไฟล์: src/components/ui/pagination-controls.tsx,ทุกpageที่มีtablepaging,servervalidators/pagination/reports/warehouses/public,operations/recordsservices,Postmansourcecollection/docs/api/contracts,Specs/Plan/ACTIVE/task/tests. คงfilter/sort3จังหวะ/permissions/SSRguards/idempotency. UATเลือก10/20/50/100และเลขหน้า/firstlast/zero/min/max/มือถือ.

ผลตรวจระหว่างทำ: 26pagesใช้PaginationControlsกลางพร้อมpageSize/reset/limitจริง; TypeScript/ESLint/Productionbuildผ่าน. UIboundarytestและactualstockpageVM10→page3→100/page1→last49/Abortผ่าน, sharedpagination/usersquery100cap/101reject/detail1ผ่าน, route77/14fieldsetsและCombo25ค่าผ่าน. ไม่มีDBwrite/HTTPmutation. Full scripts/test-api-contracts.mjs ยังติดassertเดิมที่ห้ามruntimeconstantsในsrc/types/api/product-full.tsซึ่งมีอยู่ก่อนงานนี้; ไม่ลดความเข้มของassertเพื่อทำให้ผ่าน. Paginationboundsในscriptปรับ51→101ตามcontractใหม่. จำแนกผลfulllegacytestออกจากtestsเฉพาะงาน.
