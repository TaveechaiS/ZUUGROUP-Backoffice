# Product full edit — TASK-215

Adminแก้ทุกfields/รหัสcode/group/format/sequence/unitได้แม้มีreference. ไม่เพิ่มstatusเปิดปิดขาย; คงstatusปัจจุบัน. UUIDภายในไม่เปลี่ยนเพื่อรักษาFK. ไม่มีschemaใหม่.

- Product GET/layoutคืนversionopaque 32hex จากmd5ของrowในsnapshotเดียวกับข้อมูล.
- POST `/api/products/[id]/edit-requests`: `{requestId:UUID,expectedVersion:32hex,data:ProductDraft,keepFileIds:UUID[]}`. dataใช้fieldsIDตัวเลือก/sequence/filesmanifestใหม่เหมือนสร้าง. keepIdsต้องเป็นไฟล์ที่ติดสินค้าเป้าหมายปัจจุบัน ไม่ซ้ำnewIDs; validationactiveใหม่/คงinactiveเดิมได้เมื่อไม่เปลี่ยนID.
- GET/POST/DELETE `/api/products/full/requests/[requestId]`, POSTfilesเดิมใช้storedpurposedispatch editหรือcreate ห้ามfallbackcreateถ้าเป็นedit. OwnerAdminเท่านั้น. Begin/uploadยังไม่เปลี่ยนProduct; commitrowlock+versioncompare+unique+filescomplete+auditatomic. Complete retryคืนผลเดิม/ไม่auditซ้ำ. 409staleเก็บdraftและไม่save. Requestpayloadเดิม/keyเดิมเมื่อretry.
- GET `/api/products/[id]/history?limit=10&offset=0`: `{data:[{id,actorName,occurredAt,action,changes:[{field,before,after}]}],pagination}`. รองรับ10/20/50/100/sorttimestamp,actor; authenticate/visibleproduct, costredactเช่นGETเดิม. ไม่ส่งrawuseremail/filepath/fullAuditที่ไม่เกี่ยวข้อง.
- FileGETตรวจfileidอยู่ในdetails.filesของcurrentproductและrequestcomplete. EditfilesผูกtargetIDในpayload.edit. ลบออกจากสินค้าถอนmembershipทันทีและfileGET404; objectprivateและmetadataเก็บเพื่อประวัติ ยังไม่purgeจนตกลงretention. Cancelcleanupลบเฉพาะpendingrequestใหม่ ไม่แตะkeepFiles/currentProduct.
- UIprefillทุกช่อง/Comboboxครบชุด/files10MB/images+PDF/dirtycancel/uncertainretryใช้requestเดิม/freezeinputs/conflictชัด/SuccessAlertหลังcommit. Codeใหม่redirectURLหลังสำเร็จ; historyAccordionlazy/paged/BEBangkok.
