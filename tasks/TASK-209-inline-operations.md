# TASK-209 — ย้าย operations UI เข้า page

IMPLEMENTED / WAITING_FOR_UAT — 6 ตุลาคม 2569

ย้ายครบ11pagesและถอนcomponents/operationsทั้ง5ไฟล์/โฟลเดอร์. ไม่มีUIimportเดิมในsrc; server/operationsและtypesAPIยังใช้เดิม. ESLint/TypeScript/diff/Productionbuildผ่าน และexistingtest-route-pagesผ่าน77routes/14fieldsets/serverguards. ไม่มีการเรียกHTTPwrite/DBwrite/commit/deploy; รอbrowserUAT.

1. สำรวจreferences: OrderWorkspaceในorders/page,orders/create/page,orders/[id]/page; LinkedRecordPanelในcustomers/[id]/page,customers/territories/[id]/page. Sharedmoney/dateในproducts/page,[id]/page,stock/page,stock/create/page,stock/[warehouse]/page,stock/receipts/[id]/page.
2. ย้ายโค้ดOrderWorkspaceพร้อมhooks/commands/UI/helpersเข้าแต่ละpageโดยใช้modeเดิมของrouteและไม่มีpropsmodeจากภายนอก. คงworkflow/permissions/idempotency/APIเดิม ไม่ปรับพฤติกรรมระหว่างrefactor.
3. ย้ายLinkedRecordPanel localลงท้ายdetailแต่ละหน้า; importsใช้กลางเดิม. ย้ายเฉพาะsharedsymbolsที่หน้านั้นใช้และdependencies. ไม่สร้างcomponentsเฉพาะหน้าใหม่.
4. ถอนcomponents/operations5ไฟล์รวมInventoryWorkspace/LotStockTableที่ไม่มีcaller. ไม่แตะserver/operationsหรือtypes/api/operations. ปรับexistingtestpathให้ตรวจsourceในpageจริง.
5. ตรวจไม่มีimportsoperationsUI; lint/type/build/test-route-pages/diff. UAT: orders3route,customers/territorylinkedrows/paging,productsstockThaiBE/date/price/sort10และalerts.

ไฟล์เปลี่ยน: 11pagesข้างต้น,components/operations5ไฟล์(ลบ),scripts/test-route-pages.mjs,Specs/Plan/ACTIVE/task. ไม่DBwrite/schema/Postman/commit/deploy.
