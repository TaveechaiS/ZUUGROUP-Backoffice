# TASK-187 — IDรับเข้าเป็นล็อต

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/TaskบันทึกoneReceiveoneLot/visibleIDcode/ถอนsource-age/ต้นทุนสองแบบ.
2. stock/create/page: ถอนstatefieldsเลขล็อต/sourceและUIอายุ แสดงIDcodeยังautoeditable กับtotalCostกรอก/unitCostreadonlyตามจำนวน.
3. operations/service.tsreceive: validateexact1ล็อต codevalidatedก่อนinputs ใช้codeเดียวเป็นlotNumber ไม่มีfieldlotNumberจำเป็น. คงidempotency/unique/transaction/audit.
4. stock/page: ID/วันเวลา/จำนวนรับ/ผู้บันทึก4คอลัมน์ ไม่มีsource. stock/receipts/[id]/page: ไม่มีsourceหรือlotNumbercolumn ใส่total/unitcostตามrole. products/[id]/pagehistory: ไม่มีlotNumbercolumn IDreceiptlinkและสองต้นทุน.
5. Lint/type/mockrenderpayload/serveroneLot/ค่าต้นทุนderived/retry และdiff. ไม่มีDDL/DBwrite. ประวัติเก่าหลายล็อตไม่ลบ.

ปรับscripts/test-linked-operations.mjs fixtureเดิมสองล็อตในหนึ่งรับเป็นรับสองครั้งครั้งละหนึ่งล็อต คงการทดสอบFEFO/จองสองล็อตและretryไว้. ตรวจlint/scriptsyntaxไม่รันscriptนี้กับDBจริงในรอบนี้.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: form/report/detail/history/APIตามscopeพร้อมแล้ว. ESLint/TypeScript/production build/git diff --checkผ่าน. SSR/state mockตรวจถอนlotNumber/source/age, ต่อชิ้น5เมื่อtotal100/qty20, requestไม่มีสองfieldเก่า, confirmationและretrykeyเดิมผ่าน. MockserviceตรวจoneLot/lotNumber=code/create1ครั้ง/retryreturnidเดิม/2ล็อต400ก่อนwriteผ่าน. Scriptintegrationเก่าปรับfixture2รับเพื่อคง2ล็อต/ordertestsแล้วsyntax/lintผ่าน; ไม่รันscriptintegrationนี้กับDBจริงและไม่เพิ่ม/ลบข้อมูลธุรกิจในงานนี้. ยังไม่browser/commit/deploy.

เพิ่มสต็อกไม่มีเลขล็อต/source/age มีIDอัตโนมัติแก้ได้. จำนวน20ต้นทุนรวม100ต้องเห็นต่อชิ้น5. รับเข้ายืนยันแล้วรายงาน/รายละเอียด/historyใช้IDเดียวกันและหนึ่งล็อต. วันผลิต/หมดอายุยังกรอกได้. ต้นทุนผู้ไม่มีสิทธิ์ไม่เห็น.
