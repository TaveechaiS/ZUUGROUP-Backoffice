# แผนรวม API ตามโมดูล — TASK-074

สถานะ: READY_FOR_USER_TEST เจ้าของอนุมัติ Specs และ Task 2026-10-02

| ลำดับ | ผลลัพธ์ | ไฟล์ที่จะเปลี่ยน | วิธีตรวจรับ |
|---|---|---|---|
| 1 | ตารางเส้นเดิม→ใหม่และ auth/body/response รายโมดูล | docs/API-CONTRACTS.md, Specs/Task/ACTIVE | แยก protected/public/read-only ไม่เปิดข้อมูลใหม่ |
| 2 | Validators include/view/action และ types | src/server/validation/*, src/types/api/* | offline invalid query/action/combination ตอบ400 |
| 3 | GET รายการ+ข้อมูลประกอบ/view; detail mutation ตาม Method | src/app/api/**/route.ts, records/handlers.ts, services ที่เกี่ยวข้อง | stub ตรวจ pagination/auth/last Admin/concurrency/audit เดิม |
| 4 | ย้าย consumer และลดคำขอซ้ำ | src/app/**/page.tsx, API catalog/data boundary ที่จำเป็น | หน้าแรกขอ metadata หน้าถัดไปขอรายการ; Combobox มี pagination; page ยังคงแยก |
| 5 | ลบเส้นประกอบเก่า ปรับ Postman/คู่มือ | routes filters/options/config/restore, postman/*.json, README/API guides | ไม่เหลือคำขอเส้นเก่าใน source/collection ไม่มี Cloud sync |
| 6 | ตรวจและส่งมอบ | scripts/test-api-contracts.mjs, test-pagination.mjs, test-route-pages.mjs, Task/ACTIVE | type-check/lint/build/offline/diff ผ่าน |

ไม่มี live HTTP/login/DB mutation/Deploy/commit/push

## ⚠️ ต้องทดสอบโดยคุณ หลัง implementation

1. Import Postman ใหม่ GET limit10/offset0 แล้ว offset10 ต้องได้รายการต่างหน้าและ pagination ถูกต้อง
2. include filters ต้องมีค่าที่อยู่นอก10แถวแรก เปลี่ยนหน้าแล้วตัวกรองไม่หาย
3. view options ค้นหาและแบ่งหน้าได้ ID ที่เลือกคงเดิม สถานะในฟอร์มเลือกได้
4. เพิ่ม/แก้/เปลี่ยนสถานะ/ลบ/กู้คืนข้อมูลที่ยอมให้แก้ ต้องมี dialog/ผลสำเร็จเดิม
5. Role ไม่มีสิทธิ์และการเปลี่ยน Admin ที่กฎเดิมห้ามต้องได้401/403/409ตามกรณี ไม่มีข้อมูลถูกเปลี่ยน


## ผลตรวจ

แก้ตามภาพ Postman: อ่าน Collection Cloudเต็ม → เก็บbackupในหน่วยความจำและIDs → แปลง/ลบคำขอเฉพาะขอบเขตเดียวกับlocal → update Collectionเดิม → อ่านกลับตรวจ133คำขอ/ไม่มีเส้นเก่า ไม่มีการSendเว็บ/DBหรือสร้างCollectionใหม่

ติดตามตามคำสั่งเจ้าของ 2026-10-02: ตรวจ requests → ย้าย filters/configเข้าinclude list → ลบ requests/group/variablesไม่มีผู้ใช้ → ปรับคู่มือ → ตรวจ JSON/route-contract/จำนวน/credentials ออฟไลน์ ไฟล์เฉพาะ postman/*.postman_collection.json, README, docs/API-NAME-GUIDE.md/API-CONTRACTS.md และเอกสาร Task ไม่แก้ source/DB ไม่ syncCloud

ทำครบแล้ว: GET collection รองรับ include/view ตามโมดูล; DELETE users/products ใช้ transaction/guardsเดิม; PATCH restore; เพิ่ม GET detail users/products ตามสิทธิ์เดิม; ย้าย18หน้ารายการ+ฟอร์ม/รายละเอียด/Combobox ถอน65routesประกอบ; Postman local167+34คำขอ คง IDsเดิม; contracts/inventory/คู่มือครบ ตรวจ type-check/lint/build/offline contracts196app requests/pagination/59page integrity/resource dispatch+auth+last Admin/diff ผ่าน ไม่เปลี่ยน schema/DB ไม่ยิง live HTTP/login ไม่ syncCloud/Deploy/commit/push รอUAT


## ผลแก้ Cloud ตามภาพเจ้าของ

READY_FOR_USER_TEST แก้ Cloud Collection Zuugroup เดิมแล้ว55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903: ลบ34requests อัปเดต46requests อ่านกลับ133คำขอ ไม่มีเส้น filters/config/options/restore เก่า restore14คำขอใช้PATCH action restore คงrequest IDs/auth/variables/scriptsครบ ใช้granular update/deleteหลังbulk connectorปฏิเสธschema ไม่สร้างCollectionใหม่ ไม่SendAPI/DB เติม_postman_idในไฟล์localเดิมเพื่อระบุCollectionตรงกัน

⚠️ ต้องทดสอบโดยคุณ: Refresh Postman/เปิดCollection Zuugroup เดิมใหม่ ต้องไม่เห็นfilters/configแยก และrestoreเป็นPATCH ไม่ต้องImportใหม่หรือSendAPIเพื่อเช็คการจัดรายการ
