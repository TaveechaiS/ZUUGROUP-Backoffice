# งานที่กำลังทำ

## TASK-088 checkpoint verify — 2026-10-03

- IN_PROGRESS เจ้าของอนุมัติ checkpoint ก่อนต่อชุดทดสอบ. ขอบเขตเอกสาร checkpoint/Task/ACTIVE และ commit ไฟล์ค้าง TASK-086 (ร่างที่พัก)/087 ที่ตรวจรับแล้วบน AI. ลำดับบันทึก → ตรวจ diff/ไฟล์ sensitive → stage รายชื่อชัดเจน → commit → ตรวจสถานะ. ไม่ push/Deploy.

## TASK-087 รวมชุดตรวจด้วย verify — 2026-10-03

- COMPLETE เจ้าของยืนยัน “ok ครับ ผ่าน 9/9” เมื่อ 2026-10-03. บันทึกตรวจรับเฉพาะ tasks/ACTIVE.md และ TASK-087; ปิดงาน verify แล้ว. ยังไม่ได้ commit รอบนี้.

- READY_FOR_USER_TEST เพิ่ม npm run verify ครบ 9 ขั้นตอนและ verify:seed แยกแล้ว พร้อมคู่มือ. รันจริงผ่าน 9/9 ใน 33.0 วินาที; ตรวจจำลอง exit 17 หยุดก่อนขั้นถัดไป, SIGINT หยุด child/คืน code 130/ล้าง handler, ไม่มี snapshot แจ้ง error ผ่าน. git diff --check ผ่าน. ไม่ commit/push/Deploy; รอเจ้าของลองคำสั่งตาม docs/VERIFY-GUIDE.md.

- IN_PROGRESS เจ้าของอนุมัติ “ok” ให้ทำข้อ 1 รวมชุดตรวจที่มีอยู่เป็นคำสั่งเดียว. ขอบเขต `package.json`, `scripts/verify.mjs`, README/คู่มือ verify, Specs/Plan/Task/ACTIVE. ลำดับ: บันทึกแผน → runner ตามลำดับ/fail fast → npm verify → ตรวจผลสำเร็จ/หยุดเมื่อผิดพลาด. Core รวม lint/Next typegen/type-check/5 offline tests/build; seed test ที่ต้องใช้ snapshot เฉพาะเครื่องแยกคำสั่งเสริม. ไม่เปลี่ยน API/DB/ข้อมูล/Deploy.

## TASK-086 วางแผน API อ่าน Dashboard — 2026-10-03

- DEFERRED เจ้าของขอ “ค่อยทำ” แผน Dashboard เมื่อ 2026-10-03. เก็บร่าง Specs/Plan ไว้; ยังไม่เริ่ม implementation. เมื่อกลับมาทำต้องเลือกข้อมูลและสิทธิ์ก่อน. งานถัดไปเสนอจัดรายละเอียดข้อมูลจริงรายโมดูลตาม checkpoint; Deploy ยังพัก.

## TASK-085 ตรวจรับและ checkpoint — 2026-10-03

- CHECKPOINTED เจ้าของยืนยัน “ok แล้ว” กับรายการตรวจ UI/เพิ่มแก้ลบกู้คืน/confirmation/SuccessAlert/search/pagination และ commit/checkpoint รอบล่าสุด. บันทึกตรวจรับ TASK-078–084 พร้อม `tasks/CHECKPOINT-2026-10-03.md` บน AI ต่อจาก c7a3c92. ตรวจ staged 93 ไฟล์/diff/credential ผ่าน ไม่มี env/snapshots/secret เข้า Git; hash ดู Git log. Deploy ยังพักและรายละเอียดธุรกิจรอข้อมูลจริง.

## TASK-084 เครื่องหมายเมื่อไม่มีข้อมูล — 2026-10-03

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; เปลี่ยน fallback แสดงผล 37 ไฟล์: ฟิลด์รายละเอียด 62 จุดใช้ `?? '-'` พร้อมรองรับข้อความว่าง, ชื่อสัมพันธ์ 8 จุด และ Role ใน Header; placeholder ขีดยาวเดิมใน UI เป็น `-` ทั้งหมด. คงค่าว่างที่ใช้ฟอร์ม/search/ID/API. lint/type-check/diff-check ผ่าน; รอเจ้าของตรวจข้อมูล optional ว่างและค่า 0 ตาม `tasks/TASK-084-empty-display.md`.

## TASK-083 มาตรฐานคลาสสีและ Poppins — 2026-10-03

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; แก้ตามคำยืนยันเจ้าของแล้ว: เปลี่ยนเฉพาะสีที่เดิมอ้าง var เป็นชื่อ Tailwind; คืนค่า #hex เดิมครบ 63 ไฟล์/1,987 จุด และสีหลัก #1a58a7 ผ่าน blue theme tokens เดิม 11 ระดับ. คงงานฟอนต์/Loading/Header/fallback ที่ทำแล้ว. แก้กติกา AGENTS/Specs/Plan ให้รักษา hex เดิม. ตรวจเทียบค่า hex/lint/type-check/build ผ่าน; รอเจ้าของตรวจสีหน้าจอ.

- ผลรอบแรกที่แปลง hex เป็น palette ถูกแทนที่ด้วยข้อแก้ไขข้างต้นตามคำยืนยันเจ้าของ. รายละเอียดใน `tasks/TASK-083-tailwind-colors-poppins.md`.

## TASK-082 ล็อกแถบสีและ Header — 2026-10-03

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; ถอนการล็อก Header ตอนเลื่อนแล้ว: wrapper ใช้ border สี 10px ตาม flow ปกติ ไม่มี sticky/top/z-index. Header และแถบสีเลื่อนตามหน้าทั้ง desktop/mobile. ESLint เฉพาะไฟล์/type-check/diff-check ผ่าน. ข้อความรอบทดลอง sticky ด้านล่างเป็นประวัติที่ถูกแทนที่ด้วยคำขอล่าสุด.

- READY_FOR_USER_TEST คืน Header แบบ sticky ร่วมกับแถบสีตามคำขอล่าสุดแล้ว. Desktop top 0; mobile ใต้เมนูหลักตามสถานะย่อ/ขยาย. ESLint เฉพาะไฟล์และ type-check ผ่าน. การทดลองติดเฉพาะแถบสีด้านล่างเป็นประวัติที่ถูกแทนที่แล้ว.

- READY_FOR_USER_TEST งานติดตามล่าสุด: แยกแถบสี 10px เป็น sticky element ก่อน Header แล้ว; Header ชื่อหน้า/วันที่/บัญชีเลื่อนพร้อมเนื้อหา. Desktop แถบสีติด top 0; mobile ใต้เมนูหลักตามสถานะย่อ/ขยาย. ESLint เฉพาะไฟล์/type-check/Prettier/diff-check ผ่าน. รอเจ้าของเลื่อนหน้าตรวจเฉพาะแถบสีตาม TASK-082.

- ผลรอบแรกที่ล็อก Header ร่วมกับแถบสีถูกแทนที่ด้วยคำขอล่าสุดให้ติดเฉพาะแถบสี.

## TASK-081 โลโก้ Loading — 2026-10-02

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; งานติดตาม 2026-10-03: ลดตัวโลโก้ให้ใกล้ขนาดไอคอนเดิม (~56px เต็มจอ/~32px ในตาราง) และคืนวงแหวนสองชั้นใน `src/components/ui/loading-component.tsx`; ใช้ภาพเดิม ไม่แก้ API/DB. lint, type-check แบบไม่เขียน incremental cache, build, Prettier, diff-check ผ่าน; รอเจ้าของตรวจ Loading ทั้งสองแบบและ reduced motion. รายละเอียดใน `tasks/TASK-081-loading-logo.md`.

- READY_FOR_USER_TEST เจ้าของระบุไฟล์จริง `public/Logoloading.png` ให้ใช้แทนไอคอน Loading. ตรวจภาพแล้วเป็น RGBA พื้นหลังโปร่งใส 594×420; ใช้ไฟล์เดิมตรง ๆ ทั้งเต็มหน้าจอ/ตาราง โดยจัดขนาดใน component ตามขอบ alpha และไม่ทับ `public/logo.png`. lint/type-check/build/Prettier/diff-check ผ่านก่อนปรับช่องว่างกรอบตารางเล็กน้อย; รอ UAT desktop/mobile/reduced motion. รายละเอียดใน `tasks/TASK-081-loading-logo.md`.

## TASK-080 Loading ในพื้นที่ตาราง — 2026-10-02

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; เจ้าของยืนยันหน้า `[id]` ใช้ได้แล้ว และขอให้ระหว่างพิมพ์ค้นหา/เปลี่ยนตัวกรอง Loading แสดงในกรอบตารางหรือส่วนข้อมูลแทน overlay ทั้งจอ. เพิ่ม content variant และย้ายจุดแสดงครบ 21 หน้ารายการ (โมดูล 18, สินค้า/ผู้ใช้/Audit 3); คง route/session loading เต็มจอและ detail loading เดิม. lint/type-check/build/route check/diff-check ผ่าน; รอเจ้าของ UAT desktop/mobile. ไม่แก้ API/DB; รายละเอียดใน `tasks/TASK-080-table-loading.md`.

## TASK-079 ตรวจหน้า `[id]` 404 — 2026-10-02

- COMPLETE เจ้าของยืนยัน 2026-10-02 ว่าหน้า `[id]` ใช้ได้แล้วหลังล้าง dev cache/เริ่ม dev ใหม่. รายละเอียดใน `tasks/TASK-079-id-route-404.md`; ไม่แก้ DB/API/ธุรกิจ.

## TASK-078 Dashboard retry Loading — 2026-10-02

- COMPLETE เจ้าของตรวจรับรายการล่าสุดแล้ว 2026-10-03; ติดตาม TASK-059 ที่อนุมัติแล้ว: `src/app/page.tsx` หลังโหลด Dashboard ผิดพลาด กด “ลองใหม่” จะล้าง error ก่อนส่งคำขอใหม่ ทำให้ Loading ปรากฏระหว่างรอ. ขอบเขต Specs/Plan TASK-059, `tasks/TASK-078-dashboard-retry-loading.md`, `tasks/ACTIVE.md` และ handler retry ใน Dashboard เท่านั้น. lint/type-check/diff-check ผ่าน; type-check ต้องสร้าง Next route types ใหม่และลบ validator ที่ Next dev สร้างค้าง. ไม่แก้ API/DB; รอเจ้าของ UAT.

## TASK-077 Commit และ checkpoint — 2026-10-02

- CHECKPOINTED เจ้าของสั่งcommit/checkpoint รวมworkingtreeหลัง17c7423 TASK-063–076 บนAI บันทึกพร้อมtasks/CHECKPOINT-2026-10-02.md/TASK-077 ตรวจstaged282files/diff/credentialผ่าน ไม่มีenv/snapshotsเข้าGit ไม่เปลี่ยนพฤติกรรม/DB ไม่push/deploy hashดูGit logและผลส่งมอบ ดูcheckpointสำหรับUATค้างและงานต่อ

## TASK-076 ชุดข้อมูลชื่อสมจริง — 2026-10-02

- READY_FOR_USER_TEST ลง DB แล้ว240แถวไม่ซ้ำ (records210/products15/warehouses15) ชื่อรันเลข/ชื่อซ้ำศูนย์ เติมnative fields/relationsว่าง คงID/code/status/softdelete/auth5/roles4/test productเดิม Snapshotก่อนหลัง/plan/rollbackอยู่scripts/snapshotsและignoreGit; seedcatalog/SQLใหม่พร้อมrunner ตรวจoffline/lint/SQLdryrollback/DBreadbackครบและrepeat plan0 changes ไม่มี API/login/Schema/stock/ledger/commit/push คู่มือ docs/REALISTIC-DATA-RESULT.md

- IN_PROGRESS เจ้าของอนุมัติ “ทำได้เลย” เริ่ม catalog/seed/refresh/snapshot/rollback/offline checks และลงDBธุรกิจ projectเดิมตามแผนย่อย ตรวจค่าเดิมรายฟิลด์รักษาข้อมูลผู้ใช้ ไม่ Auth/schema/API/stock/ledger ลำดับ snapshot → catalog → guarded plan/seed → offline → transaction → verify/UAT

- PLANNING เจ้าของขอชื่อสมจริง/รายละเอียด/ผู้ดูแลทุกข้อมูลแทนชื่อรันเลข ตรวจ registry/seed/schema และ DB read-only ผ่าน Supabase connector พบ14โมดูล×15=210records,16products,18warehouses จัด Specs/Plan/TASK-076 พร้อมตัวอย่างทุกกลุ่ม รออนุมัติเอกสารตาม AGENTSข้อ3 ก่อน seed/DB write ลำดับ catalog → snapshot/ค่าเดิม → seed/refresh → transaction → อ่านกลับ/UAT ไม่ Auth/schema/API/stock/ledger

## TASK-075 ชื่อฟิลด์ API — 2026-10-02

- READY_FOR_USER_TEST ปรับ native code/name/ฟิลด์ records และ query/filter keys, nested products/public/users/audit, reports, 46หน้า records และหน้าสินค้า/ผู้ใช้/Audit/CSV, state defaultWarehouseId; Postman local เดิม133+24คำขอ URL/method/scriptsเดิมพร้อมคู่มือ contract ตรวจ type-check/lint/build, 5ชุดทดสอบ offline (payload names/null/ISO/public allowlist/filters/reports + contracts/pagination/pages/resource guards), diff ผ่าน ดู docs/TEST-API-FIELD-NAMES.md ไม่ schema/DB/live HTTP/login/Cloudsync/commit/push

- IN_PROGRESS เจ้าของอนุมัติ “ok ปรับ” หลังรายงาน audit ชื่อ field ขอบเขต types/services records/products/public/users/audit/reports/handlers, page.tsx ผู้เรียกและ CSV, Postman local/คู่มือ/offline tests ตาม specs/2026-10-02-api-field-names.md และ plans/2026-10-02-api-field-names-plan.md ลำดับ contract → services/types → ผู้เรียก → Postman/docs → offline/type-check/lint/build ไม่ DB/live HTTP/login/commit/push

## ข้อกำหนดชื่อ Field API — 2026-10-02

- REVIEWED เจ้าของให้ตรวจว่ามีการเปลี่ยนชื่อหรือไม่ ตรวจ adapters records/products/public products/users/audit/reports/login และจุดเรียกหน้าเว็บ พบ aliases/flattened relations/ตัวแปรwarehouseId บันทึกผลใน docs/API-FIELD-NAMING-REVIEW.md รอบนี้เฉพาะตรวจ+เอกสาร ไม่เปลี่ยนcontract/source/DB ไม่HTTP/login ต้องจัดแผน contract migration ก่อนแก้จริง

- DOCUMENTED เจ้าของกำชับชื่อในการต่อ API ต้องตรงกัน ไม่ดึง product.name แล้วเปลี่ยนเป็น fieldชื่อใหม่เอง บันทึกในSpecs/Plan/API-CONTRACTSเฉพาะเอกสาร ไม่มีการเปลี่ยนcode/contract/DBในรอบนี้ งานถัดไปใช้ fieldตามresponseจริง และต้องตกลงcontractก่อนเปลี่ยนชื่อ

## TASK-074 รวม API ตามโมดูล (2026-10-02)

- READY_FOR_USER_TEST แก้ Cloud Collection Zuugroup เดิมแล้ว55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903: ลบ34requests อัปเดต46requests อ่านกลับ133คำขอ ไม่มีเส้น filters/config/options/restore เก่า restore14คำขอใช้PATCH action restore คงrequest IDs/auth/variables/scriptsครบ ใช้granular update/deleteหลังbulk connectorปฏิเสธschema ไม่สร้างCollectionใหม่ ไม่SendAPI/DB เติม_postman_idในไฟล์localเดิมเพื่อระบุCollectionตรงกัน

- IN_PROGRESS แก้ตามภาพเจ้าของ: ยืนยัน Cloud Collection Zuugroup เดิมใน workspace7734105b-3c13-40b1-8adc-cfa12f7e7db8 มี167คำขอยังไม่อัปเดต เจ้าของท้วงให้แก้ชุดที่เห็น จึงอัปเดต collection55942202-0b3c7e3b-7989-43ae-b40a-5dc7cf699903 เดิมให้133รายการตามไฟล์ local เก็บitem IDs/variables/auth/scripts ไม่สร้างCollectionใหม่ ไม่รันAPI/DB ตรวจอ่านกลับหลังupdate

- READY_FOR_USER_TEST ติดตาม Postmanตามคำสั่งเจ้าของ: ลบ44คำขอ เหลือ Zuugroup133/Authenticated24 รวม157app requests; ถอนกลุ่ม Supabase Data API และ filters/configแยก/combined examplesซ้ำ รวมmetadataในlist เก็บoptionsที่ฟอร์มใช้/Login4Role/CRUD จัดกลุ่มAuthenticatedตามโมดูล ถอน2variablesไม่มีผู้ใช้ คงIDsเดิม offline contract157ผ่าน ไม่แก้API/DB ไม่HTTP/Cloudsync/commit/push

- IN_PROGRESS ติดตามตามเจ้าของขอ “ใน postman อันไม่ใช้ลบออก”: ขอบเขตเฉพาะ collections local/คู่มือ/Specs/Plan/Task ลบ requests filters/config ซ้ำและกลุ่ม Supabase Data API ที่ยังไม่ได้ใช้ รวม metadata ใน list เก็บ view options ที่ฟอร์มใช้และ Login4Role/CRUD คง collection IDs ไม่แก้ API/DB ไม่ยิง HTTP ไม่ sync Cloud

- READY_FOR_USER_TEST ทำครบแล้ว: GET collection รองรับ include/view ตามโมดูล; DELETE users/products ใช้ transaction/guardsเดิม; PATCH restore; เพิ่ม GET detail users/products ตามสิทธิ์เดิม; ย้าย18หน้ารายการ+ฟอร์ม/รายละเอียด/Combobox ถอน65routesประกอบ; Postman local167+34คำขอ คง IDsเดิม; contracts/inventory/คู่มือครบ ตรวจ type-check/lint/build/offline contracts196app requests/pagination/59page integrity/resource dispatch+auth+last Admin/diff ผ่าน ไม่เปลี่ยน schema/DB ไม่ยิง live HTTP/login ไม่ syncCloud/Deploy/commit/push รอUAT

- IN_PROGRESS เจ้าของอนุมัติเอกสาร 2026-10-02 เริ่ม validators/types → routes/handlers → consumers/catalog → ถอนเส้นประกอบเก่า/Postman/docs → offline/type-check/lint/build ขอบเขตตามแผนย่อยเดิม ไม่ DB/live HTTP/Deploy/commit/push

- PLANNING เจ้าของตอบ “ok” กับแนวทางรวม resource/Method/include ตรวจ routes/consumer แล้ว จัด Specs/Plan/Task รออนุมัติเอกสารตาม AGENTS ข้อ3 ก่อน implementation ขอบเขต routes/services/validators/types/client pages/Postman local/docs/offline tests คง DB/RBAC/transaction/audit/last Admin guard ไม่รัน live HTTP/DB ไม่ deploy/commit/push

## TASK-073 จัด API types/validation/Postman (2026-10-02)

- READY_FOR_USER_TEST TASK-073 เจ้าของอนุมัติเอกสารแล้ว ทำ types6กลุ่ม/shared envelope + pure validators10ไฟล์ และย้าย client imports/response annotations ครบ Postman local167+29คำขอ/docs/API-CONTRACTS.md มี inventoryจากrouteจริง ตรวจtype-check/build/offline contracts191app requests/pagination/59page integrity/diffผ่าน full lint0errors แก้14unused type warningsและตรวจcreate filesซ้ำผ่าน เทียบ39validator outcomesก่อนหลังตรง ไม่DB/HTTP/login/cloudsync/Deploy/commit/push รอUAT

- PLANNING เจ้าของตกลงเดินงาน types/validation/Postman หลังยืนยันสิทธิ์4Roleใช้ได้และรอข้อมูลจริงก่อนกำหนด field/filter/scope เพิ่ม ตรวจปัจจุบัน: types/api.ts มีPagination, validationอยู่services/routes, collections v2.1 มี167+17คำขอ จัด Specs/Plan/Task รออนุมัติเอกสารตาม AGENTSข้อ3 ก่อน source changes คง endpoint/response/RBAC/DBและหน้าแยกเดิม ไม่ยิง liveAPI/login ไม่ sync Cloud

## TASK-072 วางแผนเก็บกวาดโค้ด (2026-10-02)

- READY_FOR_USER_TEST เจ้าของอนุมัติ “ok” ทำ TASK-072 ครบแล้ว ลบ dead exports/placeholders/fixture/เครื่องมือ import/preview/@heroui-react ปรับ Seed/ProductView/คู่มือ คง DB/schema/migrations/backup typegen/type-check/lint/build/offline integrity+pagination/seed static/diff ผ่าน ผล docs/CODE-CLEANUP-RESULT.md ไม่รัน live API/seed ไม่ commit/push

- ผลตรวจ exports เพิ่มในขอบเขตเก็บกวาด: formatThaiDate, listProducts, getProductById, listUsers, Logins พบเฉพาะ declaration ไม่มี consumer ใน src/scripts จะลบและคง paginated services/Next convention exports; @heroui/react ไม่ถูก import ถอนจาก package/lock แล้ว คง @heroui/styles ที่ CSS ใช้

- PLANNING ตามคำขอ “ไล่ลบข้อมูลที่ไม่ใช้และ mock ที่เป็น code ออก plan ก่อน” ตรวจ src/scripts/package และจุดอ้างอิงแล้ว จัด Specs/Plan/Task เพื่ออนุมัติก่อน implementation รอบนี้แก้เฉพาะเอกสาร ไม่ลบโค้ด/DB ไม่รัน seed/live API ขอบเขต proposed: dead exports, fixture ไม่มีผู้ใช้, preview เก่า, สคริปต์ import ที่ถอนตารางแล้ว และปรับ seed เก็บ migrations/backup/ข้อมูล DB

## TASK-071 เปลี่ยนชื่อพารามิเตอร์ (2026-10-02)

- READY_FOR_USER_TEST เปลี่ยน customers/products `[ref]` เป็น `[id]` รวม params และคู่มือแล้ว คงรหัสใน URL/การค้นหาข้อมูลเดิม next typegen/type-check/offline integrity/diff ผ่าน ไม่เหลือ `[ref]` ใน src/scripts ไม่แก้ DB/API รอเจ้าของเปิดรายละเอียดเดิม

## TASK-071 เริ่มแยก Route (2026-10-02)

- READY_FOR_USER_TEST เจ้าของอนุมัติ “ok ทำได้เลย” ย้าย54หน้าให้ UI/text/state/query/API functions อยู่ในแต่ละ page.tsx รวม create/detail/edit แยกComboboxไม่มีHTTP, auth/server dataอยู่layout, ลบ full-page components/components/pages/hookโหลดหน้ากลางแล้ว ใช้endpointเดิมไม่เพิ่มGETเพราะใช้serverdataเดิมได้ type-check/lint/build/test-route-pages/test-pagination/diffผ่าน รอUAT docs/ROUTE-PAGES-GUIDE.md ไม่แก้DB/schema ไม่ยิงliveAPI ไม่commit/push

## แยกโค้ดรายหน้า — TASK-071 (2026-10-02)

- PLANNING เจ้าของขอทุก page มีโครงหน้าเองรวมcreate/id และเอา components/pages ออก ยืนยัน shared Pagination/Combobox ได้ พร้อมตัวอย่าง text/JSX/endpoint/query/API functions/state อยู่ใน page.tsx ปรับ Specs/Plan/Task-071 แล้ว รออนุมัติTaskตาม AGENTSข้อ3 ขอบเขต src/app/**/page.tsx, layouts/data boundary, shared UIเล็ก, ลบ full-page components และคู่มือ ไม่แก้DB/กฎธุรกิจ

## TASK-064 เริ่ม implementation (2026-10-02)

- READY_FOR_USER_TEST เจ้าของอนุมัติ “ทำ” หลังผลตรวจ ทำ pagination/query/API users/products/audit, filters/CSV, client pages, shared clamp/abort, public default10 และ Postman local แล้ว type-check/lint/build/offline query tests ผ่าน รอ UAT ตาม docs/TEST-API-PAGINATION.md ไม่แก้ schema/seed ไม่ยิง live API ไม่ commit/push

## ตรวจ Pagination รอบติดตาม (2026-10-02)

- TASK-064: สำรวจโค้ดทุกหน้ารายการตามคำขอเจ้าของ ไม่แก้ implementation รอบนี้ พบ shared list 18 URL ใช้ API limit10/offset แล้ว; products ไม่มี pagination, users แบ่ง10ใน browserแต่ดึงทั้งหมด, audit แบ่ง20ที่ DBผ่าน server page ไม่มี REST endpoint; รายละเอียดใน TASK-064 รออนุมัติแผน implementation เดิม

## สถานะ Combobox (2026-10-02)

- TASK-070: READY_FOR_USER_TEST ช่องสถานะใน shared record form เป็น combobox แล้ว ใช้ filters statuses API เดิมรวมค่าปัจจุบัน/ค่าเริ่มต้นเดิม ดึงครั้งเดียวและค้นหาฝั่งหน้าเว็บ คงค่าจนเลือกรายการ type-check/eslint/diff ผ่าน รอทดสอบตาม TASK-070 ไม่สร้างกฎธุรกิจ

## ข้อความตรวจฟอร์มและ * สีแดง (2026-10-02)

- TASK-069: READY_FOR_USER_TEST ตามคำขอเจ้าของ แก้ shared RecordFormPage ตามภาพแล้ว required * สีแดงและข้อความไทยใต้ช่องแทน native tooltip ตรวจ input/textarea/relation ก่อนส่งหรือยืนยันแก้ไข type-check/eslint/diff ผ่าน รอทดสอบตาม TASK-069 ไม่แก้ API/DB

## Combobox ค้นหาและเลือก (2026-10-02)

- TASK-068: READY_FOR_USER_TEST ตามคำขอเจ้าของ เปลี่ยน RelationPicker ใน record-form-page.tsx เป็นช่องเดียวค้นหา/เลือกผ่าน options API เดิมแล้ว รองรับคีย์บอร์ด pagination และคง ID ที่เลือก type-check/lint/diff ผ่าน รอทดสอบตาม TASK-068; ไม่แก้ DB หรือ filter ทั่วไป

## พื้นหลัง Filter สีขาว (2026-10-02)

- TASK-067: READY_FOR_USER_TEST เจ้าของขอ bg filter สีขาว ตรวจแถบ/ช่องค้นหาและตัวเลือกใน shared list/users/products/audit → บันทึก Specs/Plan → เปลี่ยนพื้นเทาเป็น bg-white ครบสี่จุดแล้ว lint/diff ผ่าน รอเจ้าของตรวจหน้าจอ

## ป้ายสถานะตามภาพอ้างอิง (2026-10-02)

- TASK-065 งานแก้หัวสถานะ/coverage: เจ้าของกำหนดหัวคอลัมน์ “สถานะ”. ตรวจพบทุกtableที่มีstatusมีheaderแล้ว แต่ RecordTableRow desktopยังrenderข้อความ. แก้ module-list-page.tsx desktop StatusBadge/mobilelabel/deletedbadge, scope=col ในหัว shared/products/users และบันทึกมาตรฐานheaderในAGENTS/คู่มือ/Specs/Plan/Task. ลำดับเอกสาร→render→type-check/lint;ไม่เพิ่มคอลัมน์สถานะที่ไม่มีข้อมูล.

- TASK-065 งานต่อ: เจ้าของกำหนดให้ทุกหน้าที่แสดงสถานะใช้รูปแบบนี้และเป็นมาตรฐานถาวร. ตรวจ src ทั้งหมด, เปลี่ยนสถานะใน ModulePlaceholder เป็น StatusBadge และบันทึกข้อ14ใน AGENTS.md/STATUS-BADGE-GUIDE.md. อัปเดต Specs/Plan/Taskก่อนโค้ด; ไม่เปลี่ยนข้อความอธิบายหรือformselectเป็นป้าย. ตรวจ type-check/lint/diff.

ผลมาตรฐานถาวร: ป้ายModulePlaceholderที่เหลือใช้StatusBadgeแล้ว; AGENTS.mdข้อ14/คู่มือกำหนดสถานะใหม่ต้องใช้componentกลาง. type-check/lint/diff-checkผ่าน;ไม่เพิ่มAPI/DBหรือcommit/push.

- TASK-065: IN_PROGRESS. เจ้าของยืนยันให้ทำทุกสถานะและให้เลือกสีได้ 2026-10-02: bgระดับ50/textระดับ600. ขอบเขต status-badge.tsx, shared module list/detail/activity, users list/detail, products list/detail, Dashboard status และ Specs/Plan/Task. ลำดับ: ลงข้อกำหนด → mappingสีชัดเจน+fallback → เชื่อมทุกป้าย → lint/type-check/diff-check/UAT. คงข้อความ/สถานะเดิม ไม่สร้างกฎสต็อก. TASK-064 pagination ยังรออนุมัติ.

ผล TASK-065: READY_FOR_USER_TEST — StatusBadgeใช้ครบตามขอบเขต, bg50/text600/dot600, type-check/lint/diff-checkผ่าน. ไม่มีการเพิ่มข้อมูลหรือเปลี่ยนกฎธุรกิจ; รอตรวจหน้าเว็บจริง. ยังไม่ commit/push.

## Pagination ผ่าน API โดยคงดีไซน์เดิม (2026-10-02)

- TASK-064: PLANNING. เจ้าของขอทุกหน้ารายการ pagination ผ่าน API และย้ำว่ามี design แล้ว. สำรวจ shared list/reports ที่มี API10, จุดค้าง products/users/audit. ขอบเขตเอกสาร Specs/Plan/Task ก่อนอนุมัติ; ไม่แก้โค้ด/DB ในขั้นนี้. เสนอเปลี่ยนเฉพาะ data flow/query และใช้ markup pagination เดิม, default10/max50, total ฝั่ง DB, search/filter ฝั่ง DB; เก็บ CSV ผู้ใช้เป็นข้อมูลทั้งหมดตาม filter ผ่าน API ส่งออกแยก.

## แผน SuccessAlert ครบทุกการเปลี่ยนข้อมูล (2026-10-02)

- TASK-063 แก้ตามคำท้วงรอบนี้: จุดแก้ไขมี success หลังบันทึกแล้วแต่ยังไม่มี custom confirmation ก่อนบันทึก. เพิ่ม confirmation สำหรับ shared record edit, product edit และ user profile edit พร้อม pending snapshot/ยกเลิกไม่ส่งคำขอ; ปรับ ConfirmationDialog ให้รองรับ primary/ข้อความบันทึก. แก้เฉพาะไฟล์เหล่านี้และ Specs/Plan/Task/คู่มือ; ไม่แก้ API/DB. ไม่ขยายไปสร้างหรือปุ่มค้นหา. ตรวจ lint/type-check และเจ้าของ UAT.

ผลรอบแก้ไข: confirmation สำหรับแก้ข้อมูลครบสามกลุ่มแล้ว; type-check/lint/diff-check ผ่าน; รอเจ้าของทดสอบยกเลิก/ยืนยันและ success/error จริง.

- TASK-063: IN_PROGRESS เจ้าของอนุมัติ 2026-10-02 และกำหนดให้ใช้ modal ของเว็บแทน native alert/confirm ในภาพ. ขอบเขต confirmation-dialog.tsx, shared record CRUD/list, product create/detail, user create/detail, SuccessAlert เท่าที่จำเป็น และคู่มือ UAT/Specs/Plan/Task. ลำดับ: บันทึกข้อกำหนดใหม่ → custom confirm ลบรายการ/ผู้ใช้/สินค้า → pending guards/ข้อความสำเร็จครบทุก mutation → lint/type-check/build → เจ้าของตรวจหน้าจอ. ไม่แก้ API/DB; ไม่ยิง HTTP อัตโนมัติ.

ผล TASK-063: READY_FOR_USER_TEST — implementation และ lint/type-check/build/diff-check ผ่าน; ไม่พบ browser confirm/alert ใน src. รอ UAT ตาม docs/TEST-SUCCESS-ALERT.md; ยังไม่ commit/push งานนี้.

## แก้ dependency ในเครื่อง (2026-10-02)

- TASK-053 งานย่อย: เจ้าของรายงาน Cannot resolve axios; package.json/lock ระบุ axios 1.20.0 แล้วแต่ node_modules ไม่มี. ขอบเขตเฉพาะติดตั้ง dependency ตามข้อกำหนดที่อนุมัติเดิมและบันทึกผลในแผน/Task TASK-053; ไม่แก้ HTTP client/API/DB และเก็บ next-env.d.ts ที่เปลี่ยนก่อนงานนี้. ลำดับ: ตรวจ lock/installed → npm install โดยงด lifecycle scripts → resolve axios/type-check → ให้เจ้าของ reload หน้าเว็บ.

ผล: ติดตั้งแล้ว resolve axios 1.20.0 และ type-check ผ่าน; lockfile เนื้อหาเดิม. รอผู้ใช้ reload ตรวจรับ.

## ขอบเขตรอบนี้ (2026-10-01)

- TASK-062: เจ้าของสั่ง checkpoint และ commit งาน SuccessAlert หลัง `f25284d`. ตรวจ branch/diff และไฟล์ข้อมูลลับ; สร้าง `tasks/CHECKPOINT-2026-10-01-3.md` กับ `tasks/TASK-062-checkpoint-commit.md`; stage เฉพาะงานใน working tree, ตรวจ staged diff/secret แล้ว commit บน branch `AI` โดยไม่ push. ผลตรวจ static ของ TASK-061 ผ่านแล้ว; UAT ยังรอเจ้าของ.

- TASK-061: หลัง checkpoint `f25284d` เจ้าของแจ้งว่า SuccessAlertComponent ยังไม่เสร็จ. ตรวจ component และจุดสำเร็จจริง; เติม alert ใน `src/components/pages/record-form-page.tsx`, `src/components/pages/record-detail-page.tsx`, `src/app/products/create/create-product-form.tsx`, `src/app/users/create/create-user-form.tsx`, `src/app/users/[employeeCode]/user-detail-content.tsx` และปรับ `src/components/ui/success-alert-component.tsx` เท่าที่จำเป็น. บันทึก Specs/Plan/Task ก่อนโค้ด; ให้การนำทางหลังสร้าง/ลบเกิดหลังปิด alert; ไม่แก้ API/DB. ตรวจ lint/type-check/build และ UAT.

- TASK-060: เจ้าของสั่ง checkpoint และ commit งานปัจจุบันก่อนกลับไปแก้ SuccessAlertComponent. ตรวจ changed files/credential, ลด diff ของ `package-lock.json` เฉพาะรูปแบบบรรทัด/ย่อหน้าโดยคง JSON เดิม, สร้าง `tasks/CHECKPOINT-2026-10-01-2.md` และ `tasks/TASK-060-checkpoint-commit.md`, stage งานใน branch `AI`, ตรวจ staged diff/secret, commit โดยไม่ push. หลัง commit เปิด Task ใหม่เพื่อเติม SuccessAlert ตามคำท้วงของเจ้าของ.

- TASK-059: เจ้าของขอ Loading เต็มหน้าจอระหว่างเปลี่ยนหน้าและโหลดข้อมูล พร้อม icon และ motion ที่นุ่มขึ้น. ขอบเขต `src/components/ui/loading-component.tsx`, `src/components/icons/status-icons.tsx`, `src/app/loading.tsx`, `src/app/layout.tsx`, `src/app/dashboard-page-content.tsx`, `src/components/pages/module-list-page.tsx`, `src/components/pages/record-detail-page.tsx` และ Specs/Plan/Task. เพิ่ม Suspense รอบการอ่าน session ใน layout เพื่อให้หน้าแรกมี fallback; ไม่แก้ API/DB. ลำดับ: ลง Specs/Plan → ปรับ UI และเชื่อมจุดโหลด → lint/type-check/build และตรวจหน้าจอ → UAT.

- TASK-058: เจ้าของขอคู่มือชื่อโฟลเดอร์ API ใน Postman เป็นไทย/อังกฤษและอธิบายหน้าที่. ตรวจ Collection `postman/Zuugroup.postman_collection.json`, route และ metadata ที่มีจริง; สร้าง `docs/API-NAME-GUIDE.md`, เชื่อมจาก `postman/README.md`, บันทึก Specs/Plan/Task. งานเอกสารเท่านั้น ไม่แก้ endpoint/Collection/DB และไม่ส่งคำขอ API. ลำดับ: ตรวจชื่อ/URL → ลง Specs/Plan → เขียนคู่มือและลิงก์ → ตรวจครบ 23 กลุ่ม/167 คำขอและ diff.

- TASK-057: เจ้าของขอเปิดหน้ารายละเอียดเมื่อกดตำแหน่งใดก็ได้ของแถวตาราง แทนการกดชื่อหรือปุ่มคอลัมน์ท้าย. ขอบเขต `src/components/pages/module-list-page.tsx`, `src/app/products/products-list.tsx`, `src/app/users/users-list-content.tsx` และ Specs/Plan/Task; คงปุ่มกู้คืนในแท็บลบแล้วและตาราง Audit ที่ไม่มีหน้ารายละเอียด. ลำดับ: บันทึก Specs/Plan → ปรับแถว desktop/mobile และคีย์บอร์ด → lint/type-check/build → UAT.

- TASK-056: เจ้าของขอ SuccessAlertComponent, NotFoundComponent, LoadingComponent และที่เก็บ SVG ใน `src/components/icons/`. งานนี้ครอบคลุม Specs/Plan/Task, คอมโพเนนต์กลาง และการใช้ใน `src/components/pages/module-list-page.tsx`, `src/app/products/[ref]/product-detail.tsx`, `src/app/dashboard-page-content.tsx`; ไม่แก้ API, DB หรือกฎธุรกิจ. ลำดับ: บันทึกข้อกำหนดและแผน → สร้างคอมโพเนนต์/ไอคอน → เชื่อมสถานะโหลด/ว่าง/สำเร็จ → lint/type-check/build และ UAT.

- TASK-055: เจ้าของให้ลบข้อความประกอบที่ลอยหรือซ้ำกับชื่อหน้า เช่น คำบรรยายสินค้า, footer เขตเวลา/Zuugroup และบรรทัด “ข้อมูลในระบบ · แสดงครั้งละ 10 รายการ”. ตรวจและตัด caption ใน Topbar, รายการ/รายละเอียด/หน้าเพิ่มสินค้า, Audit Logs และรายการรายโมดูล โดยคงชื่อหน้า, จำนวนรายการ, สถานะว่างและคำอธิบายที่จำเป็นต่อการกรอกฟอร์ม. แก้ Specs/Plan/Task ก่อน component; ตรวจ lint/type-check/build และหน้าเว็บ.

- TASK-037 งานย่อย Login temporary 2026-10-01: เจ้าของรายงานข้อความ “ระบบเชื่อมต่อข้อมูลชั่วคราวไม่ได้”. ตรวจ `.env.local` แบบไม่แสดงค่า, DB SELECT/rollback update และ public GET แล้วผ่าน; ขยาย retry `P1017` เฉพาะการอัปเดต `lastLoginAt` ที่ใช้ timestamp เดิมเมื่อ retry และบันทึกรหัส error ที่ server โดยไม่แสดง credential. แก้ Specs/Plan/Task ก่อน `src/server/auth/login.ts`; ตรวจ static และรอเจ้าของ UAT Login.

- TASK-054: เจ้าของให้ค่า Supabase URL/publishable/secret/JWKS และข้อมูล host/port/database/user สำหรับ `.env.local`; ตรวจค่าโดยไม่แสดง secret, จับคู่ชื่อกับ environment ที่โค้ดใช้, ปรับเฉพาะ secret ที่ต่างและเพิ่ม JWKS, `DATABASE_URL` เชื่อมได้. หลังเจ้าของวางค่าชุดใหม่ `DIRECT_URL` ไม่มีในไฟล์ จึงต้องเติมจาก Supabase Dashboard ก่อนรัน migration; ไม่กระทบ Login. ไม่พิมพ์ credential ใน Specs/Plan/Task/ผลตรวจ.

- TASK-053: เจ้าของอนุมัติ 2026-10-01 ให้รวมการเรียก API จาก Client Component ผ่าน `src/service/http.ts` ตามตัวอย่าง 5 ฟังก์ชัน; คง Next.js route.ts/URL เดิม, ใช้ GET/POST/PATCH/DELETE, try/catch และ error/401 ส่วนกลาง. แก้เฉพาะ HTTP client, หน้า Client ที่เรียก fetch โดยตรง, dependency และเอกสาร; ไม่แตะ schema/seed/DB. ดู Specs/Plan/Task TASK-053. `next-env.d.ts` และ `package-lock.json` มีการเปลี่ยนแปลงก่อนเริ่มงาน; เก็บการเปลี่ยนแปลงเดิมไว้.

- เจ้าของสั่งหยุดและทำ checkpoint/commit/push 2026-10-01; อ่าน tasks/CHECKPOINT-2026-10-01.md ก่อนทำต่อ. รอบถัดไปทบทวน types/api.ts, validation Schema และ Seed โดยไม่แทน Next.js route.ts.

- TASK-052: อนุมัติแล้ว; ตารางรายโมดูล/CRUD/API/UI/Postman และเก็บประวัติ migration ก่อนถอน demo; เจ้าของเพิ่มคำขอเติมข้อมูลทุกโมดูล 2026-10-01: จัด seed ที่รันซ้ำได้ใน scripts/seed-operational-data.mjs และ SQL เพิ่มข้อมูลตั้งต้นให้เห็น pagination 10, รวมสินค้า/ข้อมูลแม่; ไม่มี Ledger/ยอดคลัง/รับชำระและไม่ทับข้อมูลเดิม; ใช้บัญชี 4 Role เดิม; เก็บงาน retirement migration, Postman response Variables และคู่มือ/static checks

- TASK-051: อนุมัติแล้ว ใช้ข้อมูลที่มีและฟิลด์หลักก่อน; ย้ายต้นฉบับ 19 ชุด/57 แถวเข้า DB, schema/migration/seed ใน prisma และ scripts, GET ใน src/server/demo และ src/app/api/demo, component/page เดิมอ่าน API ครั้งละ 10, proxy/Prisma refresh, Postman/คู่มือ; หยุดการบันทึก sessionStorage ของชุดนี้และไม่เดากฎธุรกิจ

- TASK-050: อนุมัติแล้ว; ทำ GET สาธารณะสินค้าและข้อมูลแม่ตามตัวอย่าง Restful API พร้อม list/getbyid และ Params; แก้ `src/app/api/public/*`, `src/server/products/public-service.ts`, Collection/คู่มือ และเอกสารงาน; สำรอง Collection เดิม; ไม่ยิงคำขอทดสอบตามคำสั่งเดิมของผู้ใช้

- TASK-049: เตรียม Postman เรียก Supabase Data API โดยตรงด้วย publishable key และ Bearer ของผู้ใช้; แก้เฉพาะ Specs/Plan/Task, Collection และคู่มือ; ไม่ใช้ secret key ใน Postman, ไม่แก้ GRANT/RLS/DB และไม่ส่งคำขอทดสอบตามคำสั่งผู้ใช้

- TASK-048: เพิ่ม Bearer token ให้ POST login/GET API และ POST แยก 4 บัญชีใน Collection Zuugroup พร้อมสคริปต์ Variables; อัปเดต Specs/Plan ก่อนโค้ด; ยังไม่ใส่รหัสผ่านหรือ token จริงในไฟล์/Workspace; ตรวจ Auth/RBAC และผล HTTP ตามระบบที่เข้าถึงได้
- TASK-046: นำ Collection GET ชื่อ `Zuugroup` ขึ้น Postman Workspace ที่เชื่อมแล้ว ตรวจจำนวนคำขอและโครงสร้างไฟล์ JSON ตาม Collection v2.1
- TASK-047: ตรวจความสามารถของเครื่องมือ Postman สำหรับ Data request, ปรับคู่มือ/สถานะตามผลจริง โดยไม่ส่งหรือบันทึก DB credential และไม่แก้ DB

| Task | ผู้รับผิดชอบ | สถานะ | ขอบเขต | หมายเหตุ |
|---|---|---|---|---|
| TASK-062 | AI | COMPLETE | checkpoint และ commit งาน SuccessAlert ใน TASK-061 | ตรวจ staged diff และ credential; commit บน branch AI โดยไม่ push; รอ UAT ของ TASK-061 |
| TASK-061 | AI | READY_FOR_USER_TEST | SuccessAlert สำหรับสร้าง/แก้/ลบ/กู้คืนในฟอร์มรายการ, สินค้า, ผู้ใช้ | flow ที่เปลี่ยนหน้ารอปิด alert; dialog รองรับ Tab และ entrance motion; lint/type-check/build/diff-check ผ่าน; รอ UAT |
| TASK-060 | AI | COMPLETE | checkpoint และ commit งานก่อน SuccessAlert | commit `f25284d` บน branch AI, 56 ไฟล์, ตรวจ staged secret และ `.env.local` ไม่ถูกติดตาม; ไม่ push |
| TASK-059 | AI | READY_FOR_USER_TEST | Loading เต็มหน้าจอ/ไอคอน/แอนิเมชัน ใน session fallback, route fallback และ GET หลัก | lint/type-check/build/Prettier/diff-check ผ่าน; CSS motion สร้างแล้ว; เครื่องมือ browser ไม่เริ่มทำงาน จึงรอเจ้าของดูจังหวะจริงและ reduced motion |
| TASK-058 | AI | READY_FOR_USER_REVIEW | คู่มือชื่อโฟลเดอร์ API ไทย/อังกฤษและหน้าที่; `docs/API-NAME-GUIDE.md`, `postman/README.md`, Specs/Plan/Task | ตรวจชื่อเรียงตรง Collection ครบ 23 โฟลเดอร์/167 คำขอ, URL ตัวอย่างตรงไฟล์, `git diff --check` ผ่าน; รอเจ้าของอ่านทวนคำอธิบาย |
| TASK-057 | AI | READY_FOR_USER_TEST | เปิดรายละเอียดจากทั้งแถวในรายการโมดูล/สินค้า/ผู้ใช้งาน | desktop/mobile ที่มี URL รองรับคลิกและ Enter/Space; คงปุ่มกู้คืน; lint/type-check/build/diff-check ผ่าน; รอเจ้าของทดสอบหน้าเว็บ |
| TASK-056 | AI | READY_FOR_USER_TEST | คอมโพเนนต์สถานะกลางและ SVG icon; หน้ารายการโมดูล/รายละเอียดสินค้า/Dashboard | สร้าง 3 คอมโพเนนต์และไอคอน 4 ตัว; lint/type-check/build ผ่าน; รอเจ้าของทดสอบสถานะโหลด/ว่าง/สำเร็จ |
| TASK-055 | AI | READY_FOR_USER_TEST | ลบข้อความประกอบที่ลอย/ซ้ำบน UI | Topbar/footer, สินค้า, Audit Logs, รายการรายโมดูล; ไม่พบข้อความตัวอย่างใน component; lint/type-check/build/diff-check ผ่าน; รอเจ้าของดูหน้า |
| TASK-054 | AI | COMPLETE | ตรวจและเชื่อมค่า Supabase ใน `.env.local` | URL/publishable/secret/JWKS มีค่า; DATABASE_URL เชื่อมได้; เจ้าของยืนยัน Login ใช้ได้; DIRECT_URL ต้องเติมก่อน migration |
| TASK-053 | AI | READY_FOR_USER_TEST | Client API service กลางและย้าย Client Component ที่เรียก fetch ตรง | Axios GET/POST/PATCH/DELETE/Login, try/catch, 401 ไป Login, 403 แสดง error; lint/type-check/build/diff-check ผ่าน; รอ Browser UAT |
| TASK-052 | AI | PAUSED_BY_OWNER | ตารางรายโมดูลจริง/ย้ายข้อมูล/CRUD/API/UI/Postman | DB/seed/API/UI/Postman ลงแล้ว; เจ้าของสั่ง checkpoint/commit/push; รายละเอียดงานต่อใน CHECKPOINT-2026-10-01.md |
| TASK-051 | AI | READY_FOR_USER_TEST | DB/API/UI/seed/Postman สำหรับข้อมูลตัวอย่างเดิม 19 ชุด | Migration และ seed ลง Supabase 19 ชุด/57 แถว; UI เลิกอ่าน data.ts และ sessionStorage; 77 GET ใหม่ รวม Collection 87 GET, list scripts 23; TypeScript/lint/build ผ่าน; ไม่ยิง HTTP ตามผู้ใช้ |
| TASK-050 | AI | READY_FOR_USER_TEST | Public GET สินค้า/ข้อมูลแม่ list/getbyid พร้อม Params, proxy ข้าม Auth, Collection/คู่มือและเอกสารงาน | อนุมัติแล้ว; build/TypeScript/lint ผ่าน; Workspace ใหม่ 5 กลุ่ม 10 GET No Auth; Collection เดิมเก็บชื่อ Authenticated; ยังไม่ยิง GET จริงตามคำสั่งผู้ใช้ |
| TASK-049 | AI | READY_FOR_USER_TEST | Postman GET Supabase Data API 5 ตารางด้วย publishable key: `postman/Zuugroup.postman_collection.json`, `postman/README.md`, Specs/Plan/Task | เพิ่มใน Workspace แล้ว; ไม่ยิงคำขอทดสอบตามผู้ใช้; DB ปัจจุบันยังถอน GRANT/เปิด RLS จึงรอ Task อนุมัติกฎสิทธิ์ก่อนอ่านข้อมูลตรงได้ |
| TASK-048 | AI | READY_FOR_USER_TEST | POST login คืน Bearer token, API ตรวจ token และ Collection มี POST แยก 4 บัญชี: `src/server/auth/login.ts`, `src/server/auth/current-user.ts`, `src/lib/supabase/server.ts`, `src/app/api/auth/login/route.ts`, `postman/*` และเอกสาร TASK-048 | POST 200 และ GET ตาม Role ผ่านกับ DB จริงทั้ง 4 บัญชี; Collection Workspace 4 POST/4 GET, lint/type-check/build ผ่าน; ระหว่างทดสอบซ้ำพบ DB 503 ชั่วคราวหนึ่งครั้งแล้วกลับมา 200; รอผู้ใช้ทดสอบ Variables ใน Postman Desktop |
| TASK-037 | AI | IN_PROGRESS | Auth/RBAC และจัดการผู้ใช้จริง; แก้ Login เมื่อ Prisma connection ปิดใน `src/server/db/prisma.ts`, `src/app/login/*`, `src/server/auth/current-user.ts` | เพิ่ม retry read และ `lastLoginAt` เมื่อ P1017; เจ้าของยืนยัน Login ใช้ได้ 2026-10-01, lint/type-check/build ผ่าน; UAT Auth/RBAC ส่วนอื่นยังค้าง |
| TASK-038 | AI | READY_FOR_USER_TEST | แยกฟอร์มเพิ่มรายการของหน้า Mock ที่ใช้ `ModuleListPage` ทั้ง 20 หน้าเป็น URL `<หน้ารายการ>/create`; คงการทำงานตัวอย่างในแท็บ | route ครบ 20/20; lint/type-check/build/diff-check และตรวจ storage ผ่าน; รอผู้ใช้ตรวจหน้าและการนำทาง |
| TASK-039 | AI | READY_FOR_USER_TEST | ปิดสิทธิ์เรียก `public.rls_auto_enable()` จากผู้ใช้ API ทั่วไปตาม Security Advisor โดยคง event trigger | Deploy migration แล้ว; `anon`/`authenticated` EXECUTE=false, trigger `ensure_rls` ยังเปิด, คำเตือนเดิมหาย; รอตรวจพฤติกรรม trigger ในสภาพแวดล้อมทดสอบ |
| TASK-040 | AI | READY_FOR_USER_TEST | ภาพรวมเส้นทาง Phase 3–9 และ Detail Mock ลูกค้า/สินค้า; ไฟล์ตามแผนย่อย TASK-040 | route และลิงก์รายการครบ, lint/type-check/build/diff-check ผ่าน; รอเจ้าของโครงการตรวจดีไซน์และการคลิก |
| TASK-041 | AI | COMPLETE | DB-first Specs/Plan และลำดับงาน; `docs/specs/2026-09-23-1550-project-specs.md`, `docs/specs/2026-10-01-db-first-amendment.md`, `docs/plans/2026-09-23-1635-project-plan.md`, `docs/plans/2026-10-01-db-first-plan.md`, `tasks/TASK-041-db-first.md`, `tasks/ACTIVE.md` | เจ้าของโครงการอนุมัติ 2026-10-01 และให้เริ่ม TASK-042 |
| TASK-042 | AI | READY_FOR_USER_TEST | ข้อมูลหลักสินค้าใน DB: `docs/specs/2026-10-01-product-master.md`, `docs/plans/2026-10-01-product-master-plan.md`, `tasks/TASK-042-product-master.md`, `prisma/schema.prisma`, `prisma/migrations/*`, `src/server/products/*`, `src/server/auth/api-authorization.ts`, `src/app/api/products/*`, `src/app/products/*`, `src/app/README.md`, `scripts/*`, `package.json`, `tasks/ACTIVE.md`; ไม่สร้างยอดสต็อก | Migration 2 ชุดและ seed ลง Supabase แล้ว; seed ซ้ำสินค้า 2/Audit 2, RLS และ grant ตรวจแล้ว; type-check/lint/build ผ่าน; รอ UAT ด้วยบัญชีจริง |
| TASK-043 | AI | READY_FOR_USER_TEST | แก้ Prisma Client ค้างหลัง generate โมเดลสินค้า: `src/server/db/prisma.ts`, `docs/plans/2026-10-01-prisma-client-refresh-plan.md`, `tasks/TASK-043-prisma-client-refresh.md`, `tasks/ACTIVE.md`; รีสตาร์ต dev server พอร์ต 5000 | generated Client มี Product; Prisma generate, TypeScript, ESLint, build ผ่าน; `/products` พาไป Login เมื่อยังไม่ลงชื่อเข้าใช้; รอผู้ใช้ทดสอบหน้ารายการหลังล็อกอิน |
| TASK-044 | AI | PLANNING | สำรวจหน้า Mock และจัดแผนย้ายข้อมูลเข้า DB ตามคำขอใหม่: `docs/specs/2026-10-01-mock-retirement.md`, `docs/plans/2026-10-01-mock-retirement-plan.md`, `tasks/TASK-044-mock-retirement.md`, `tasks/ACTIVE.md`; ยังไม่แก้ schema หรือหน้าเว็บ | TASK-045 ย้าย Audit Logs แล้ว; เหลือ Dashboard กับ 18 หน้ารายการ Mock; รอเลือกขอบเขต/seed และอนุมัติ Task รายโมดูลตาม AGENTS.md ข้อ 3 |
| TASK-045 | AI | READY_FOR_USER_TEST | ย้าย Audit Logs จาก Mock ไปอ่าน `audit_events`: `docs/specs/2026-10-01-audit-log-db-view.md`, `docs/plans/2026-10-01-audit-log-db-view-plan.md`, `tasks/TASK-045-audit-log-db-view.md`, `tasks/ACTIVE.md`, `src/app/audit-logs/*`, `src/server/audit-logs/*`, `src/app/README.md`; ไม่แก้ schema | เจ้าของโครงการอนุมัติ 2026-10-01; query จริงพบ 12 เหตุการณ์, TypeScript/lint/build ผ่าน, ปิด `/audit-logs/create`; รอ UAT ด้วยบัญชี Admin และ Role อื่น |
| TASK-046 | AI | READY_FOR_USER_TEST | จัด Postman Collection ชื่อ Zuugroup เฉพาะ GET ที่มีจริง: `docs/specs/2026-10-01-postman-get.md`, `docs/plans/2026-10-01-postman-get-plan.md`, `postman/*`, `tasks/TASK-046-postman-get.md`, `tasks/ACTIVE.md`; ไม่เพิ่ม API/DB | สร้าง Collection ใน Postman Workspace แล้ว ID `56ce2cc3-c4bc-4d0b-b84d-0f17bc254c64`; อ่านกลับพบ 4 GET ครบ; รอทดสอบด้วย Cookie ของบัญชีจริง |
| TASK-047 | AI | IN_PROGRESS | เตรียม Postman Data requests แบบอ่าน DB โดยตรง: `docs/specs/2026-10-01-postman-direct-db.md`, `docs/plans/2026-10-01-postman-direct-db-plan.md`, `postman/README.md`, `postman/sql/*`, `tasks/TASK-047-postman-direct-db.md`, `tasks/ACTIVE.md`; ไม่เก็บ credential และไม่แก้ DB | เชื่อม Postman Workspace แล้ว แต่ connector ไม่มีคำสั่งสร้าง Data request และไม่เห็น Postman Desktop; เตรียม SELECT และคู่มือ Read-only แล้ว รอสร้างคำขอใน Desktop |


## ตัวหนังสือปุ่มเพิ่มข้อมูล — 2026-10-02 (TASK-066)

เจ้าของขอข้อความสีขาว ปรับ text-white! ในปุ่มเพิ่ม shared list/users/products และพื้นน้ำเงินข้อความขาวในปุ่มเพิ่มรายการแม่แล้ว lint/diff ผ่าน รอเจ้าของตรวจหน้าจอ ปลายทางและพฤติกรรมเดิม
