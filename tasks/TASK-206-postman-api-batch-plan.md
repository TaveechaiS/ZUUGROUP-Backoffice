# TASK-206 — แผน Postmanและ API products/stock

สถานะ: PLAN_ONLY / WAITING_FOR_APPROVAL

ขอบเขตรอบนี้: สำรวจ25ตาราง/APIสินค้าเต็ม/สต็อก/options/ไฟล์และไฟล์Collectionเดิม แล้วบันทึกแผน ไม่แก้runtime/DB/Postman. เจ้าของแจ้งลบCloud Collection; ไม่ได้ยืนยันCloudstateจากการสำรวจนี้.

ไฟล์ที่เปลี่ยนรอบนี้: ACTIVE/Specs/Planหลัก/แผนย่อยนี้/docs/plans/2026-10-06-postman-products-stock-plan.md.

ผลสำรวจ: tablelimit10/defaultเดิม; productcomboboxบางจุด50; operationOptionsไม่มีpaginationของproducts/customers/usersและส่งทุกกลุ่ม; receipt detailGEToptionsเพียงหาroleควรลด; productdetail SSRอ่านตรงDBไม่ต้องเพิ่มHTTPเพื่ออ้างว่าเป็นAPI; fullcreateมีbegin→fileทีละตัว→commit/manifest/idempotency; oldlocalCollections115และ24requestไม่ครบnewfull/inventory flows. CLIไม่พบPATH/ตำแหน่งมาตรฐานที่ตรวจ ไม่ติดตั้งเพราะเจ้าของขอPlanก่อน. อนุมัติphaseค่อยresolveCLIจริง/binding/authและschemaตามskill.

ตรวจรับแผน: แยกข้อที่มีแล้ว/ข้อเสนอใหม่ ระบุfolder→URLจริง ลำดับfiles/checks/batchboundary/privacy/idempotency/ค่า10 และยอมรับ1รับ=1ล็อต. ยังไม่ทำHTTPmutationsหรือCollectionmutation.

เพิ่มเติมจากlayoutที่ตรวจ: productdetailhydrate mastersทุกครั้งแม้readmode เสนอlazylookupwhenedit และตรวจRoleIDcanonicalก่อนpermissionscontract. แผนเสร็จแล้ว ยังรออนุมัติimplementationตามคำสั่งPlanก่อน; ไม่มีCollection/API/DBmutation.
