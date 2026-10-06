# TASK-201 — Sort ทุกตาราง

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. สำรวจด้วย rg `<table` พบ25ไฟล์ บันทึก Specs/Plan/ACTIVEก่อนแก้.
2. สร้าง src/components/ui/sortable-table.tsx shared สำหรับไอคอน/button/th aria-sort และ local sort/controlled global sort; src/server/validation/table-sort.ts allowlistedparams/orderdirection. sourceข้อมูลจริงใช้numeric/date/text comparator ไม่DOMmutations.
3. Servers: src/server/records/service.ts, users/service.ts, audit-logs/service.ts, products/options.ts/service.ts, operations/service.ts. whitelistfields ORDERก่อนpaging/id tie-break ไม่countเปลี่ยน/ไม่allowclientfieldsไม่มีสิทธิ์.
4. UI record listsทุกไฟล์: expenses/billing/customers(+territories/documents/dashboard)/purchases/promotions/stock-counts/suppliers/quotes/reports(saleslegacy/finance/inventorylegacy). users/audit/optionsmanager. products/page, stock/[warehouse]/page, stock/page, product[id]/page, receipt[id]/page, operations inventory/order/lot-stock table. ใช้shared ไม่สร้างcomponentเฉพาะหน้าเพิ่ม.
5. tests lint/type: globalpagination/numeric/date/Thai/null/tiebreak/invalidsort/permission/SVGpaths&activecolors/keyboard/rowactions unaffected; coverageทุกtableใช้shared. ไม่DBwrite/schema.

⚠️ ต้องทดสอบโดยคุณ: กดหัวชื่อ/จำนวน/ราคา/วันที่สองครั้ง ต้องสลับasc/descและสีลูกศรทิศactive; ตารางหลายหน้าต้องเริ่มpage1และเรียงทั้งชุด; ปุ่มทำลาย/แก้ไข/เปิดIDยังใช้งานเดิม.

ผลตรวจ: shared sorter ครบ25ไฟล์เดิม (native tableเหลือที่componentกลางเท่านั้น), 14recordlists fieldkeysตรงregistry/related report และมีmobilecontrols. ESLintไม่มีerrors/warningsหลังแก้hooks/deps; TypeScriptและproductionbuildผ่าน. VM tests SVGpath/activeblue-inactivegrey/aria-sort, numeric2/10/100+comma/decimal/ThaiBEdate/ISO/stableties/null-last/actionnoicon/controlledrowไม่sortlocalผ่าน. API mocks SQLORDERก่อนpaging/countเดิม/idtie/injection-invaliddirection-duplicateparams400/rolecostguard, recordsderivedmemberCount/usersnull-date-role-export/auditactor/optionscodeผ่าน. Actual reportUI mock selectกลับpage1/queryasc-desc/IDrow+nestedlinkguardผ่าน; destroy flow cancel/503 retrykey/successflag/ยอดคลังอื่นเดิมผ่านหลังเพิ่มsort. EXPLAIN4queriesจริงproducts-price/receiptcost/orderamount/marketingminexpiryvalid แบบread-only. แก้quantitysortให้ตรงยอดaggregatedที่old warehouseId viewแสดง ขณะที่warehouseCode detailใช้scopeเฉพาะคลัง. ไม่มีDBwrite/schema/commit/deploy; ยังไม่browserUAT. Contract docs/api/table-sorting.md.

TASK202 ต่อเนื่องถอนคอลัมน์ต้นทุนplaceholderroot/คลังและปรับsortmappingให้ตรงกันแล้ว; ต้นทุนล็อตยังอยู่.
