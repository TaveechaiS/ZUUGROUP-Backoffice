# แผน Zuugroup — APIสินค้า/สต็อกและการส่งข้อมูลเป็นชุด

สถานะ: อนุมัติและกำลังดำเนินการ TASK-207 — 6 ตุลาคม 2569

ผลTASK207: P0–P3เสร็จ/รอUAT; P4ประเมินfixtureและpayloadfieldsจริงแล้ว คงETag/thumbnail/uploadqueueไว้แบบมีเงื่อนไขจนมีmeasurementที่คุ้ม. ZuugroupCloud41requests/81examples/ครบdescriptionsและtests พร้อมlocalfiles/IDsสำหรับsync. ข้อจำกัดAPIแก้สินค้าfullเดิมไม่อยู่ในงานลดpayloadและCollectionระบุ409legacyชัด. ดูtasks/TASK-207-postman-products-stock-api.md.

## ข้อตกลงล่าสุดที่แทนข้อเสนอ Combobox ด้านล่าง

เจ้าของอนุมัติทำ Postman และแผนทั้งหมด โดย Combobox ไม่ค้น/โหลดเพิ่มครั้งละ10หรือดึงselectedIDเพื่อแบ่งหน้า: โหลดรายการทั้งหมดของประเภทที่ต้องใช้และค้นฝั่งเว็บ กล่องเห็นประมาณ10รายการและเลื่อนขึ้นลง. ใช้batchหลายkind/โหลดเมื่อเริ่มeditได้เพื่อลดrequestและเลี่ยงโหลดmastersในโหมดดู. Product selectorในstockเป็นComboboxจึงใช้กฎเดียวกัน; thinbootstrapแยกproduct listครบออกจากcustomers/users/metadataที่ไม่ใช้. ข้อเสนอlookup10/selectedIDsในข้อ3/4a/P2/ตรวจรับเดิมยกเลิกโดยข้อตกลงนี้. ตารางยัง10รายการต่อหน้า. P4ยังวัดประโยชน์ก่อนETag/thumbnail/queue.

## 1. ผลตรวจปัจจุบัน

- ผู้ใช้แจ้งลบชุดZuugroupในPostmanแล้ว; ในrepoยังมีCollectionเก่า115requests/21foldersและชุดauthenticated24requests/4folders. ไม่ถือว่าไฟล์เหล่านี้แทนสถานะCloudปัจจุบัน และไม่ใช้collectionIDเก่าสร้างทับโดยเดา.
- ตารางสินค้า/คลัง/รับเข้า/ประวัติล็อตมีlimit10/offset/sortก่อนpagingแล้ว. product-option comboboxใช้limit50บางจุด; การค้นหาทำบนserverและมีabort/debounceอยู่บางส่วน.
- `/api/inventory?view=options` ส่งproducts/customers/users/warehouses/policy/actor/nextReceiptCodeพร้อมกัน; ฟอร์มรับเข้าไม่ใช้customers/users. รายละเอียดรับเข้าเรียกoptionsเพิ่มเพียงใช้actor.roleId.
- productdetail layoutอ่านจากserverDBและhydrateRouteDataอยู่แล้ว การเพิ่มHTTPAPIระหว่างserverกับserverไม่ได้ลดงานเอง. ลดfields/แยกส่วนโหลดจึงมีประโยชน์กว่า.
- layoutเรียกproductMastersทุกครั้งและส่งmastersทั้งหมดเข้าฝั่งclient แม้เป็นโหมดดู. ควรถอนโหลดแม่ในreadmodeและขอlookupเมื่อเริ่มedit/เปิดcombo; reuseactorcapabilitiesจากserverแทนGEToptionsทั้งชุด. ตรวจใช้RoleIDจริงให้ตรงservice (ACCOUNTING_CFO ไม่ใช่ชื่อCFOที่บางlayoutยังใช้) ก่อนออกแบบpermissionsใหม่ ไม่สร้างRoleเพิ่ม.
- สินค้าเต็มมีbegin/status/uploadทีละไฟล์/commit/cancelและprivatefileGET. ไฟล์10MBต่อไฟล์พร้อมmanifest/hash/idempotencyต้องคงไว้.
- ไม่พบCLIบนPATHหรือเส้นทางมาตรฐานที่ตรวจ รอบPlanไม่install/init/pull/push/Cloudmutation. ก่อนimplementationตรวจbinary/binding/authและworkspaceจริงก่อน ไม่สร้างWorkspaceซ้ำ.

## 2. โครงสร้างCollectionที่เสนอ

```text
Zuugroup
├─ auth                         เข้าสู่ระบบ/ตัวแปรtoken (support)
├─ products
│  ├─ product                  list/detail/update/delete/restore ที่ใช้อยู่
│  ├─ product-option           รายการตามkind/ค้น/เพิ่ม/แก้/เปิดปิด
│  ├─ product-request          next/begin/status/upload/commit/cancel
│  └─ product-file             อ่านรูป/เอกสารตามfileId
└─ stock
   ├─ stock-summary            ยอด/จำนวนล็อต/3คลัง/หมด/ใกล้หมด
   ├─ stock-lot                ล็อตคงเหลือ/ประวัติ/ดูตามproductId
   ├─ stock-receipt            รายงาน10/detailล็อต/receive/correct
   ├─ stock-movement           ประวัติการเคลื่อนไหว10
   ├─ stock-action             transfer/adjust/condition/give/destroy
   └─ stock-options            bootstrapฟอร์มตามขอบเขต
```

Folderเป็นการจัดเอกสาร ไม่ใช่การrenameURL. ตัวอย่างmapping:

| Folder | เส้นจริงปัจจุบัน |
| --- | --- |
| products/product | GET `/api/inventory?view=products` สำหรับตารางปัจจุบัน; GET/PATCH/DELETE `/api/products/[id]`; PATCHrestoreตามcontractเดิม |
| products/product-option | GET/POST/PATCH `/api/product-options` |
| products/product-request | `/api/products/full/next`, `/api/products/full/requests`, `/api/products/full/requests/[id]`, `/api/products/full/requests/[id]/files` |
| products/product-file | GET `/api/products/full/files/[id]` |
| stock/stock-summary | GET `/api/inventory?view=products&warehouseCode=MAIN|MARKETING|DISPOSAL` |
| stock/stock-lot | GET `/api/inventory?view=lots&productId=...&remaining=true|false&warehouseCode=...` |
| stock/stock-receipt | GET `/api/inventory?view=receipt-items`, detailเพิ่มlotId; POST `/api/inventory` actionreceive/correct |
| stock/stock-movement | GET `/api/inventory?view=movements` |
| stock/stock-action | POST `/api/inventory` actionตามงานที่มีจริง รวมdestroy/idempotency/confirmed/expectedQuantity |
| stock/stock-options | GET `/api/inventory?view=options` เดิม; thincontractใหม่รอPhase2อนุมัติ |

ไม่copylegacyทุกโมดูลกลับเข้าชุดใหม่โดยอัตโนมัติ. เส้นpublic/legacyที่ไม่ใช้ในflowนี้เก็บในไฟล์เก่าไว้ก่อน ไม่ลบcode/ข้อมูลเพราะชื่อrequestไม่ได้ใช้. ตั้งmethod/nameภาษาอ่านง่ายพร้อมคำอธิบาย/query/body/response/success/errors/roles. Variablesเช่นbaseUrl/accessToken/productId/lotId/warehouseId/requestId/groupId/formatId/limit10/offset0; token/รหัสจริงไม่อยู่Collection. Writeใช้idempotencykeyเดิมเมื่อretry ไม่generateใหม่ทุกSend. Sortปกติไม่ส่งsortquery.

## 3. จุดที่ควรลดการส่งข้อมูล

| ลำดับ | จุด | การเปลี่ยนที่เสนอ | ผลที่คาดหวัง/วิธีตรวจ |
| --- | --- | --- | --- |
| 1 | optionsฟอร์มรับ | thinbootstrapเฉพาะwarehouses3/nextReceiptCode/permissions; productเลือกผ่านsearchlookup10 | ไม่มีproducts/customers/usersทั้งตารางในinitialpayload ตรวจkeys/bytes/DBqueries |
| 2 | รายละเอียดรับเข้า | รวมpermissionsในdetailหรือhydrateจากactorserverที่มี ไม่GEToptionsทั้งชุดเพิ่ม | รายละเอียดหนึ่งรายการ1requestแทน2 ไม่ลดrolevalidationserver |
| 3 | combobox | `search/kind/limit10/offset` และlookupselectedID/IDsเท่าที่ใช้งาน | เปิดได้10/ค้น/ถัดไป/ค่าที่เลือกเดิมไม่หายเมื่ออยู่นอกpage |
| 4 | list vsdetail | compactprojectionในlist ไม่ส่งdrugtext/files/lotsทั้งชุด; detailตามID/section | ตารางได้เพียงsummaryfields ยอด/จำนวนล็อตไม่เกิดN+1 |
| 4a | mastersในหน้าดูสินค้า | ไม่hydrateproductMastersทุกครั้งเมื่อดู; โหลดlookup10/selectedIDsเมื่อเข้าeditหรือเปิดcombobox | readmodeไม่ส่งcategories/forms/drugs/warehousesทั้งหมดโดยไม่ใช้ |
| 5 | Accordion/ล็อต/ไฟล์ | โหลดsectionเมื่อเปิด; history/currentlots10; รูปthumbnail/เอกสารbytesเมื่อดู | กล่องปิดไม่เรียกAPI; ไม่downloadเอกสารทุกไฟล์พร้อมหน้าแรก |
| 6 | metadataซ้ำ | ส่งmetadataพร้อมlistเฉพาะครั้งแรก/เมื่อเปลี่ยนkind; reuseตามactor/kindและinvalidateหลังแก้ | ลดlookupซ้ำ ไม่มีstaleactive/สิทธิ์ข้ามuser |
| 7 | batchอ่าน | รับselectedIDsหลายตัวพร้อมกันแบบbounded; metadataหลายkindเฉพาะที่formใช้ มีpaginationของแต่ละkind | ลดrequestทีละID/ทีละkind ไม่ส่งทุกชนิดทั้งหมดและต้องvalidatekind/permission |
| 8 | คำขอระหว่างพิมพ์ | ตรวจdebounce/abortที่มีแล้วและเติมจุดที่ขาด; deduplicatein-flightตามparams | เปลี่ยนsearchเร็วไม่ส่งทุกkeypress/responseเก่าไม่ทับใหม่ |
| 9 | cachevalidation | พิจารณาETag/If-None-Matchสำหรับข้อมูลพื้นฐานหลังออกแบบprivate/actor/versioninvalidate | 304เมื่อไม่เปลี่ยนลดresponsebytes ไม่อ้างว่าลดDBqueryอัตโนมัติ |
| 10 | ไฟล์หลายไฟล์ | คง10MB/fileและmanifestก่อนcommit; เสนอuploadqueueทีละ2ไฟล์ในphaseหลังวัด | ลดเวลารอจากsequential แต่ไม่ได้ลดbytes/requestcount; ไม่รวมหลาย10MBเป็นrequestใหญ่ |

รายการ1–6เหมาะทำก่อน; 7–10ทำเมื่อbaselineยืนยันประโยชน์. การbatchAPIอ่านกับการbatchธุรกรรมเขียนแยกกัน. ไม่รวมการเติมหลายล็อตเป็นรับเข้าเดียว: 1ครั้ง=1ล็อตตามข้อกำหนด. ไม่bundleรับ/โอน/ทำลายเพียงลดจำนวนrequest เพราะผล/idempotency/ธุรกรรมต่างกัน. ไม่เพิ่มauto-transferหรือเกณฑ์อายุที่ยังOPEN.

## 4. Contractส่งข้อมูลเป็นหน้า

```json
{
  "data": [],
  "pagination": { "limit": 10, "offset": 0, "total": 125, "hasMore": true }
}
```

ตัวอย่างschemaเพื่อใช้ให้สอดคล้องในproducts/stock ไม่ใช่responseจริงของทุกเส้นปัจจุบัน. offset0→10→20; หน้าสุดท้ายมีน้อยกว่า10ได้. Search/filter/sortทั้งหมดที่serverก่อนLIMIT/OFFSET. Sortเปลี่ยนหรือfilterเปลี่ยนกลับoffset0. Detailหนึ่งIDไม่ต้องใช้pagination. ยอด/จำนวนล็อตsummaryนับทั้งชุดตามคลัง ไม่sumจาก10แถวหน้าเดียว. pagination.totalของตารางล็อตอาจรวมแถวทำลายแล้ว ส่วนlotCountนับเฉพาะล็อตquantity>0ตามTASK200.

## 5. ลำดับทำหลังอนุมัติ

1. **P0 — inventory/contract/Collection draft**: ตรวจCLIจริง/binding/authและworkspaceที่ownerใช้; sourceคือroutes+serviceไม่ใช่collectionเก่า. เตรียมCollectionใหม่Zuugroup localตามschemaที่CLIรองรับ/ลินต์ เติมexamples/query10/sort/roles/errorsและfolderข้างบน. ตรวจapprovedcontractก่อนCloudcreate/push. ไฟล์postman/และdocs/api/contracts; ถ้าเป็นfilesystemv3อ่านcollection-schema-v3ก่อนแก้.
2. **P1 — Postman publish**: เจ้าของอนุมัติแผน/การสร้างแล้วค่อยสร้างCollectionใหม่ในworkspaceเดิมที่ตรวจได้ ไม่createWorkspaceโดยเดา ไม่ใช้IDถูกลบ. อ่านกลับตรวจfolders/requests/variablesไม่มีsecret. รอบแรกใช้routesปัจจุบัน ไม่รอoptimizationทั้งหมด.
3. **P2 — thinbootstrap/permissions/lookup10**: แผนย่อยcontractของเส้นใหม่/ขยายincludeก่อนcode. ไฟล์operations/service/handlers/types, productoptions endpoints/types, stock/create/page, stock/receipts/[id]/page, products/create/page, settingsmanager. รักษาค่าprefill/queryproductId/selectedIDs/brandremember/manufacturerremember.
4. **P3 — projections/lazy/readbatch/metadatareuse**: หลังapprovecontractแต่ละส่วน ปรับproductsservices/detail/layout/types/ไฟล์routeเฉพาะที่จำเป็น. ไม่บังคับเปลี่ยนSSRdirectDBเป็นHTTP. Record/cacheตามactorและkind มีinvalidate; totalsเป็นaggregateSQLไม่N+1.
5. **P4 — วัด/ETag/files**: baselineจำนวนrequest/responsebytes/DBqueries/latencyก่อนหลังด้วยข้อมูลtestเดียวกัน. ทำconditionalGET/thumbnail/queueเฉพาะที่คุ้ม ไม่รับปากเปอร์เซ็นต์จากการเดา. Test+contract+Postman更新ทุกเส้นที่เปลี่ยน.

ก่อนแต่ละphaseอ่านACTIVEและบันทึกscope/files/steps/acceptanceเฉพาะ ห้ามข้ามOPENด้านธุรกรรม. เจ้าของอนุมัติดำเนินการ TASK-207 แล้วตามข้อตกลงล่าสุดด้านบน.

## 6. ตรวจรับเมื่อทำจริง

- CollectionZuugroupมีproducts/stockและย่อยตามแบบ ข้อมูลจริง/tokenไม่อยู่ไฟล์; ไม่มีเส้นเก่าที่ไม่ได้ใช้มาปะปนโดยอัตโนมัติ.
- ทุกlist/lookupเริ่ม10และpage2offset10ไม่มีซ้ำเมื่อข้อมูลไม่เปลี่ยน; count/hasMoreสุดท้ายถูก; sort3จังหวะและfilterกลับpage1.
- bootstrapไม่มีcustomers/users/productsทั้งชุด รายละเอียดรับเข้าไม่GEToptionsเพิ่มเพียงตรวจrole.
- selectedoptionนอกpageยังแสดงค่าเดิม; พิมพ์เร็วไม่responseเก่าทับ; แก้masterinvalidateเฉพาะkind/userที่เกี่ยวข้อง.
- closedsectionไม่fetchและprivatefileยังต้องauth; hiddencostไม่กลับมาจากbatch/projection/cacheของuserอื่น.
- stockreceiveยัง1ล็อต, correct/destroyretrykeyเดิมไม่ทำซ้ำ; ทำลายแล้วrowsคงอยู่/count0ตามcontractเดิม.
- เริ่มread-onlycollectiontestsก่อน mutationทดสอบบนรายการtestแยกที่เจ้าของอนุมัติ; ไม่ทำธุรกรรมจริงเพียงเพื่อวัดจำนวนrequest.

## แหล่งอ้างอิง

- [Postman: จัดCollection/folders](https://learning.postman.com/docs/use/use-collections/manage-collections)
- [MDN: If-None-Match และ304](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-None-Match)
- ตรวจโค้ดภายใน: operations/service.ts, products/full-handler.ts/full.ts, products/create/page.tsx, stock/create/page.tsx, stock/receipts/[id]/page.tsx, products/[id]/layout.tsx และCollectionJSONเดิม. ข้อเสนอoptimizationเป็นการวิเคราะห์จากโค้ด ยังไม่ได้benchmark.
