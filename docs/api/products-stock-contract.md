# สัญญา API สินค้าและสต็อก — TASK-207

TASK-210 (6 ตุลาคม 2569): ตารางเลือก10/20/50/100ต่อหน้า default10; maxlimit100โดยคงdetaillimit1. เปลี่ยนขนาดกลับoffset0 ค้น/Sortก่อนpagination; hasMore/totalPagesคำนวณตามlimitจริง. Comboครบชุดคงเดิม. ข้อความtable10ด้านล่างหมายถึงค่าเริ่มต้น.

อนุมัติ 6 ตุลาคม 2569. Collection Zuugroup ใช้ routes จริง; folder ไม่เปลี่ยน URL.

- ตารางสินค้า/คลัง/ล็อต/รับเข้า/เคลื่อนไหว: GET `/api/inventory` ตาม `view`; `limit=10&offset=0` ค่าเริ่มต้น. `{data,pagination:{offset,limit,total,hasMore}}`. Sort ก่อนแบ่งหน้า; ไม่ส่งsortเมื่อคืนลำดับเดิม. IDรายละเอียดรับเข้าใช้ UUID ของล็อต (`lotId`) ส่วนเลขGRเป็นรหัสแสดง.
- GET `/api/inventory?view=options&scope=receive`: `{data:{products:[{id,code,name,unit}],warehouses:[{id,code,name}],actor,nextReceiptCode?}}`. สินค้าactiveครบสำหรับCombo; ไม่มีcustomers/users/policy/available/ราคาขายหรือqueryยอดขายต่อสินค้า. legacy optionsไม่ส่งscopeยังคงเดิม.
- GET `/api/inventory?view=receipt-items&lotId=UUID&limit=1`: เพิ่ม `{capabilities:{canCorrectReceipt:boolean}}` จากactorของrequest ไม่ใช่สิทธิ์ที่clientส่ง. ฝั่งwriteยังตรวจAdminและเงื่อนไข7วัน/ยอดจอง/idempotency.
- GET `/api/product-options?kinds=codeGroup,codeFormat,...`: `{options:{kind:ProductOption[]}}` ครบactiveแต่ละkindจากqueryเดียว ไม่แบ่งหน้า ไม่รับfilterหรือsortอื่น. ชนิดไม่รู้จัก/ซ้ำ/ว่าง/เกินชนิดที่ระบบรองรับ →400; ไม่เข้าสู่ระบบ→401. Comboค้นในเว็บ ไม่เรียกAPIระหว่างพิมพ์หรือเลื่อน; dropdown10แถวสูง40px สูงสุด50vh. ข้อมูลcacheเฉพาะinstanceของฟอร์มและinvalidateเมื่อfocusกลับจากตั้งค่า; mutationตรวจactiveจริงอีกครั้ง.
- `/api/product-options?kind=...` สำหรับตารางตั้งค่าคงpagination (default10), POST/PATCHเดิมAdmin/version. ไม่เปลี่ยนรายการปิดให้กลับactive.
- GET `/api/inventory?view=products&warehouseCode=MARKETING&projection=summary`: ส่ง `marketingDays:number|null` (วันต่ำสุดจากล็อตquantity>0ทั้งหมด) แทนรายการล็อตครบ. ไม่มีล็อต→null; วันนี้0/หมดอายุติดลบคงเดิม. legacyไม่ส่งprojectionยังมีmarketingLots.
- `metadata=false` สำหรับviewproductsงดfilters/categories; หน้าตารางเก็บfiltersจากคำขอแรกและส่งfalseในคำขอถัดไป; กดโหลดใหม่ขอmetadataใหม่. แต่ละหน้าเก็บแยก ไม่มีcacheข้ามผู้ใช้. คำขอเก่าabortก่อนยอมรับresponse.
- หน้าดูสินค้าไม่โหลดproductMastersที่ไม่ใช้. กล่องปิดไม่mountรายละเอียด/รูป; ตารางล็อตlazy/paginationเดิม. รายละเอียดfull fieldsยังส่งครบเพื่อคงข้อมูลและการแก้ไขที่มีอยู่.
- รูป/PDFprivate10MBต่อไฟล์; begin→upload→commit/cancelตามproduct-full.md. stock POSTใช้1receive1lotและidempotencyKeyเดิมเมื่อretry. ทุกendpointno-store/privateตามเดิม; ไม่เพิ่มETagcacheธุรกรรม.

ตรวจ: batchเกิน10ค่าครบ/zeroข้อมูล/invalidkind/auth; thinoptionsไม่มีquerycustomers/users/policy/balance; detailAdmin/nonAdmin/costsafe; summaryminวัน/metadataomit; paging10ไม่ซ้ำ/sort3สถานะ; collectionfolders/URLs/bodies/ตัวแปรไม่มีsecret. ไม่ทดสอบwriteบนข้อมูลจริง.
