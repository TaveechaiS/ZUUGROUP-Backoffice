# API สร้างสินค้าครบฟอร์ม — TASK177

ปรับตามTASK180: createcontractไม่รับราคาต้นทุนหรือภาษี ไม่ตั้ง7%อัตโนมัติ. ต้นทุนกำหนดตอนรับสินค้าเข้า ภาษีตอนทำเอกสาร; ข้อมูลเดิมในDBไม่ลบ. ฟอร์มและส่วนย่อยอยู่src/app/products/create/page.tsxตามTASK178.

ทุกเส้นเป็น private/no-store. ใช้ session/Bearer เดิมของระบบ. Admin เท่านั้นสร้าง/จัดการคำขอ และตรวจ same-origin ผ่าน authorization กลาง. ไฟล์อ่านได้เฉพาะผู้ใช้ active ที่เห็นสินค้านั้น (สินค้าลบแล้วเฉพาะ Admin).

| Method | Endpoint | ข้อมูล/ผล |
|---|---|---|
| GET | `/api/products/full/next?groupId=UUID&formatId=UUID` | `{sequence:"00001"}` เลขถัดไปตามคู่กลุ่ม/รูปแบบ5หลัก รวมสินค้าที่ลบ |
| POST | `/api/products/full/requests` | `{requestId:UUID,data:{fields:{ชื่อช่อง:ค่าข้อความหรือUUIDตัวเลือก},sequence:"00001"}}` → requestId/status |
| GET | `/api/products/full/requests/[id]` | สถานะคำขอของAdminเจ้าของ; ถ้าcompleteมีproduct.id/code |
| POST | `/api/products/full/requests/[id]/files` | FormData `fileId:UUID`, `kind:image|document`, `file:File` ทีละไฟล์ → id/kind/name/type/size |
| POST | `/api/products/full/requests/[id]` | commitหลังไฟล์ครบ → `{product:{id,code}}` |
| DELETE | `/api/products/full/requests/[id]` | pending/cancelledเท่านั้น freezeเป็นcancelledก่อนล้างไฟล์; ลองซ้ำได้เมื่อcleanupล้มเหลว |
| GET | `/api/products/full/files/[fileId]` | bytesต้นฉบับจากStorageprivateหลังตรวจผู้ใช้และสถานะสินค้า; pending filesไม่อ่านได้ |

`fields`ใช้ค่าตาม `src/types/api/product-full.ts`. UUIDตัวเลือกต้องตรงkindและactive; ชื่อไทย/อังกฤษอย่างน้อยหนึ่ง; รหัส/รูปแบบ/ประเภท/หมวด/หน่วย/ราคาขายบังคับตามฟอร์ม. ข้อความอื่นoptional. ราคาขายตัวเลขตั้งแต่0 ทศนิยมสูงสุด2หลัก; เลขลำดับ1–99999 หรือว่างให้serverเลือกnext. ห้ามส่งช่องไม่รองรับเพราะจะไม่ทิ้งข้อมูลเงียบ ๆ. `data.files`เป็นmanifestของไฟล์ที่จะส่ง: array `{id:UUID,kind:image|document,name,type,size,digest:SHA256hex64}` หรือว่างถ้าไม่มีไฟล์. fileId/hash/ขนาด/ชนิด/ชื่อตอนuploadต้องตรงmanifest และcommitต้องครบทุกfileIdก่อนเสมอ ไม่ยอมสร้างสินค้าจากpartialupload. requestIdเดิมใช้manifestเดิมเมื่อretry.

รูปJPEG/PNG/WebP/GIF เอกสารรูปชนิดเดียวกัน/PDF ไม่เกิน10MBต่อไฟล์ ตรวจbytesกับMIMEจริง. หลายไฟล์อัปโหลดทีละไฟล์ ไม่มีจำนวนสูงสุดที่แอปตั้งเอง. Storagebucket `product-attachments` private ไม่มีpolicyให้anon/authenticatedเข้าตรง; keyserverไม่ส่งbrowser. ไม่ใช้public/signedURLในfrontend แสดงผ่านAPIตรวจauth.

วงจร: begin→pending→upload→commit→complete. requestId+payloaddigestกันคำขอซ้ำ; fileId+hashกันretryไฟล์ซ้ำ. commitใช้advisorylock/uniqueconstraintคู่รหัสและcode. การ retryคำขอcompleteคืนสินค้าเดิม ไม่สร้างซ้ำ. หากข้อมูลเปลี่ยนระหว่างretry UIตรวจคำขอเดิมก่อน ถ้าบันทึกแล้วแสดงผลเดิม ถ้ายังpendingล้างเฉพาะไฟล์requestเก่าก่อนส่งใหม่. cleanupล้มเหลวคงcancelledไม่ให้commitไฟล์ที่ลบไปแล้ว สามารถเรียกDELETEซ้ำตามidเจ้าของได้. ปิดหน้า/ขาดการเชื่อมต่ออาจมีpendingrequestส่วนตัวค้าง ไม่ลบอัตโนมัติเพราะยังไม่กำหนดอายุเก็บ; ตรวจ/l้างด้วยendpointนี้โดยAdminเจ้าของ.

HTTP: 400 validation, 401 login, 403 role/origin, 404 owner/request/fileไม่พบ, 409 duplicate/optionปิด/สถานะเปลี่ยน, 413 uploadbodyเกินlimit, 503 DB/Storageเชื่อมต่อไม่ได้. Frontendไม่แจ้งสำเร็จก่อนcommit. ค่าที่กรอก/ไฟล์ยังอยู่ในหน้าเมื่อerrorเพื่อแก้และretry.

สินค้าเดิมรหัส4หลักยังอยู่พร้อมlegacyAPI; สินค้าใหม่5หลัก/nullableข้อมูลยาและคลัง ไม่มีการเพิ่มstockเมื่อสร้างสินค้า. ProductView.detailsเก็บทุกช่อง/snapshotชื่อoption/UUID/filemetadata; ต้นทุนสินค้าในdetailsส่งเฉพาะAdmin/CFOผ่านdetailGET/layout ไม่ส่งpubliccatalog. TASK-215 ปุ่มแก้รายละเอียดบันทึกจริงผ่าน [API แก้ไขเต็ม](product-edit.md), รองรับไฟล์/version/history/code/unit แม้มีล็อต. legacyupdateยังป้องกันแก้สินค้ารุ่นใหม่ผ่านเส้นเดิม.

การติดตั้ง: `node scripts/setup-product-full.mjs --dry-run` แล้วรันโดยไม่flag. สำรองproducts/stock/indexesในlocal-backupsก่อนmigration และเช็กcount/stockคงเดิม. นี่เป็นmanualmigrationแบบเดียวกับproduct-options ต้องใช้setupสำหรับbucketด้วย ไม่เพียงdeploySQL. ตรวจซ้ำ: `node --loader ./scripts/ts-test-loader.mjs scripts/test-product-full.mjs` (rollbackDBและลบไฟล์fixture). อย่าใช้ข้อสรุปจากmockauthเป็นการตรวจloginUIแทนUAT.
