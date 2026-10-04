# งานที่กำลังทำ

## TASK-096 Checkpoint และ Commit — 2026-10-04

- CHECKPOINT_READY: บันทึกcheckpoint TASK092–095พร้อมงานค้างDesign; ตรวจTypeScript/route62และdiff whitespaceผ่านรอบนี้. เจ้าของอนุมัติcommitแล้ว; เก็บโค้ด/เอกสาร/migration/tests/ภาพDesignในAI โดยไม่รวมenv/backups/generated outputs. ไม่เปลี่ยนสถานะรับรองDesignหรือOPENและไม่push/deploy.

- IN_PROGRESS: เจ้าของสั่งcheckpointและcommitงานปัจจุบัน รวมTASK092–095 โดยยังไม่ถือว่าDesignผ่านตรวจรับ. ขอบเขตเอกสารcheckpoint/ACTIVEและGitบนbranchAI; ลำดับตรวจdiff/ไฟล์ที่จะบันทึก → บันทึกผลทดสอบเดิมและงานค้าง → ตรวจtypes/route/whitespace → stageและcommit → ตรวจสถานะสะอาด. ไม่แก้ฟังก์ชัน/ฐานข้อมูล/OPENและไม่push/deploy. เอกสารหลัก tasks/CHECKPOINT-2026-10-04.md; ตรวจรับด้วยcommit hashและสถานะGit.

## TASK-095 เอกสาร Design หน้าสินค้าและสต็อก — 2026-10-03

- DOCUMENTS_ONLY FOLLOWUP: เจ้าของกำหนดว่าถ้ามีTabเดียวไม่ต้องแสดง. ขอบเขตDesign/Specs/Plan/ACTIVEเท่านั้น; บันทึกกฎซ่อนแถวTabsและเริ่มFilterโดยไม่สร้างหัวเรื่องแทน. ปุ่มหลักถ้ามียังคงขวาบนเนื้อหา. ยังไม่แก้เว็บ และOPENตำแหน่งอื่นยังรอคำตอบเดิม.

- DOCUMENT_READY / WAITING_FOR_DESIGN_ANSWERS: สร้างMDพร้อมภาพอ้างอิงที่เก็บในrepoแล้ว; ระบุผัง/สัดส่วน/ลำดับคอลัมน์/สไตล์/OPEN/ข้อแตกต่างTASK094และแผนตรวจรับ. ส่งคำถาม3เรื่อง: ยอดจอง/พร้อมขาย, รายละเอียดล็อต/รับเข้า, ประวัติ/เกณฑ์อายุ. รอคำตอบก่อนเลือกตำแหน่งและแก้เว็บตามคำสั่งเจ้าของ. ตรวจสำเนาภาพ85366bytesตรงไฟล์อ้างอิง; ไม่เปลี่ยนเว็บ/API/DB/commit.

- IN_PROGRESS / DOCUMENTS_ONLY: เจ้าของแจ้งว่าหน้า TASK094 ยังไม่ตรง design และขอทำMDก่อนแก้เว็บ พร้อมถามตำแหน่งที่ไม่ชัดเจนก่อน. ขอบเขต ACTIVE/Specs/Plan, docs/designs/stock-screen-design.md และภาพอ้างอิงในdocs/designs/assets. ลำดับอ่านภาพ/กติกาเดิม → บันทึกผัง/ตำแหน่ง/สไตล์/ข้อแตกต่าง → แยกOPENที่ภาพไม่กำหนดและถามเจ้าของ → ส่งเอกสารตรวจ. ยังไม่แก้เว็บ/API/DB/commit. TASK094ยังไม่ผ่านตรวจdesignจากเจ้าของ; ผลทดสอบโค้ดไม่ใช่ผลตรวจdesign.

## TASK-094 วางหน้าจอสินค้าและคลังตามภาพ — 2026-10-03

- IMPLEMENTED / WAITING_FOR_UAT: เมนูสีอ่อนในbodyใต้Header, สินค้า/คลังสรุปต่อสินค้า, ล็อตต่อLot IDกดแถวขยายคลัง, Tabsและปุ่มตามภาพ, filters/paginationฝั่งserver. TypeScript/ESLint/route62ผ่าน; realDB18/18รวมTASK094และcleanupผ่าน. ยังไม่ตรวจหน้าจอหลังloginคอม/มือถือ; วิธีตรวจรับTASK094. ไม่commit/deploy. ขอบเขตIN_PROGRESSด้านล่างเป็นประวัติ.

- IN_PROGRESS เจ้าของอนุมัติ “ลองทำดูก่อนจะได้ปรับถูก”. ขอบเขต Sidebar/AdminShell/เมนูย่อย, products page และ stock warehouse routes, InventoryWorkspace, inventory GET projections/types, เอกสารและการทดสอบอ่านยอด. ลำดับแก้ Specs/Plan → ย้ายเมนูใน body → สรุปสินค้า/ล็อตและตัวกรองฝั่ง API → Tabs/ปุ่ม/ตาราง → lint/types และตรวจยอด. ใช้พร้อมขาย MAIN หลังหักจองและกฎอายุเดิมสำหรับเตือน<50; ใกล้หมดอายุ90วันเริ่มต้น. ไม่แก้ schema/ยอด/คำสั่งเขียน/Auth และไม่ commit/deploy.

- PLANNING / DOCUMENTS_ONLY เจ้าของให้วางแผนก่อนและยืนยันตำแหน่งปุ่ม/แหล่งแจ้งเตือนแล้ว. ขอบเขตครั้งนี้ ACTIVE/Specs/Plan/Task เท่านั้น. ลำดับบันทึกภาพอ้างอิงและ5หน้าย่อยใน body → สรุปข้อมูลรวมกับข้อมูลแต่ละคลัง → Tabs อายุสินค้าและปุ่มขวาสุด → ตัวกรองและวิธีตรวจรับ. ยังไม่แก้เว็บ/API/DB/commit. แบบ TASK-093 ที่ซ้อนเมนูใน Sidebar หลักต้องปรับตามแผนนี้เมื่อเริ่ม implementation.

## TASK-093 Sidebar ย่อยสินค้าและสต็อก — 2026-10-03

- IMPLEMENTED / WAITING_FOR_UAT: เพิ่ม4เมนูย่อยพร้อมเปิด/ปิดและสถานะที่เลือก; แยก3หน้าเฉพาะคลังและหน้าล็อตรวม. ESLint, Next route typegen, TypeScript และ route checks (62หน้า) ผ่าน. หน้าจอคอม/มือถือหลังloginยังรอเจ้าของตรวจตาม TASK-093. ไม่ commit/Deploy. IN_PROGRESS ด้านล่างเป็นประวัติขอบเขต.

- IN_PROGRESS เจ้าของขอ4เมนูแยกใต้สินค้าและสต็อก: คลังหลัก คลังการตลาด คลังรอทำลาย ล็อตสินค้า. ขอบเขต navigation/sidebar, routes products/stock, InventoryWorkspace และเอกสาร. ลำดับบันทึก Specs/Plan → เมนูย่อยเปิด/ปิดและ active → หน้าแต่ละคลังกรองตาม MAIN/MARKETING/DISPOSAL โดยไม่แสดงคลังอื่นระหว่างโหลด → ล็อตรวมแยกเมนู → lint/typegen/types และตรวจรับคอม/มือถือ. ไม่เปลี่ยนฐานข้อมูลหรือกฎจอง/ขาย.

## TASK-092 เชื่อมงานธุรกิจข้อมูลและเว็บ — 2026-10-03

- IMPLEMENTED / WAITING_FOR_UAT: schema+API+web ตามขอบเขตที่สรุปพร้อมทดสอบรวม; migration applied และ local backup ไม่เข้า Git. verify10/10, flow14/14, realDB15/15 ผ่านและcleanup fixturesสำเร็จ. Browserถึงlogin ยังไม่ตรวจหน้าจอ/มือถือหลังlogin. วิธีตรวจรับและผลอยู่ TASK-092 และ docs/LINKED-OPERATIONS-GUIDE.md. ไม่ commit/push/Deploy จนเจ้าของตรวจรวม. บันทึก IN_PROGRESS ด้านล่างเป็นประวัติของ batch ที่ทำแล้ว.

- BATCH-6 IN_PROGRESS tests/QA: ทดสอบ service จริงกับ PostgreSQL โดยสร้าง fixture UUID เฉพาะงานแล้วล้างใน finally; ตรวจ FEFO, สร้างพร้อมกัน, จอง/คืน/ตัด, retry, visibilityต้นทุนและแก้รับเข้า7วัน; ปรับ route gate เฉพาะ Orders และ retired groups; ตรวจ lint/types/build และแก้ navigation/alias. ไม่แก้ข้อมูลใช้งานจริง.

- BATCH-3 FOLLOWUP รักษากติกา route-owned forms เดิม: คืนโครงหน้า customer/territory จาก checkpoint แล้วปรับเฉพาะ registry/ช่องกลุ่ม/managerId/salesId และ panelสัมพันธ์; ยกเลิก rendererทั่วไปที่ทำร่างไว้. Orders เปลี่ยนฟอร์มเป็น line items เฉพาะโมดูล จึงปรับ gate เฉพาะ Orders ให้ตรวจ workflow guards/actual line fields แทนหัวเอกสารเก่า ไม่ลด gate โมดูลอื่น.

- BATCH-5 IN_PROGRESS apply/readback ฐานข้อมูลและ schema generation: ตรวจพบคลังจริง MAIN/MARKETING/DISPOSAL จึงใช้ code เดิมไม่สร้างคลังใหม่; สคริปต์สำรองลูกค้า/เขตก่อน migration เก็บใน local-backups ที่ ignore, tracking migration เดิม, Prisma validate/generate และ type-check. ไม่เติม stock ตัวอย่าง/ไม่ลบ records เดิม.

- BATCH-4 IN_PROGRESS หน้า stock/receipts/actions และ navigation: แสดงคงเหลือ/จอง/พร้อมขาย, รับหลายล็อต, แก้ภายใน7วัน, โอน/ปรับ/แจกพร้อมเหตุผลและ confirmation, trace ID และประวัติ. ใช้ loading เฉพาะเนื้อหา/SuccessAlert. เชื่อมสินค้า/จัดซื้อไปหน้าที่เกี่ยวข้องและคงสี/fontเดิม.

- BATCH-3 IN_PROGRESS เขต/ลูกค้า/UI: เพิ่ม managerId/salesId ใน registry และตรวจ role/unique; แสดงชื่อความสัมพันธ์และรายชื่อลูกค้าในเขต, รวมกลุ่มเป็น category เดียว, เปลี่ยนหน้า customer/territory เป็น component ใช้ registry; ซ่อนหน้ากลุ่มแยกแบบไม่ลบข้อมูล. ขอบเขต records service/registry/components/pages/navigation และ Orders create layout ให้ Sales เข้าตามคำสั่งที่ยืนยัน.

- BATCH-1 IN_PROGRESS schema/SQL migration/types/domain validation: เพิ่มเขต managerId/salesId, receipt/lot/balance/movement/order lines/reservations/idempotency; เก็บข้อมูลเก่าและ RLS. ขั้นถัดไป service/API transaction. อ่าน ACTIVE ก่อน batch แล้ว.

- BATCH-2 IN_PROGRESS server operations/handlers: SQL bound parameters, ล็อกสินค้าและคำสั่ง, รับเข้า/แก้/โอน/ปรับ/แจก/FEFO reservations/Orders transitions, projectionต้นทุนเฉพาะAdmin/CFO และ auditที่ไม่เผยต้นทุน. ขอบเขต src/server/operations/* และ routes/orders/inventory. รักษาอ่าน Orders เดิม ไม่ให้ generic write ข้าม workflow.

- IN_PROGRESS เจ้าของอนุมัติลงมือทั้งหมดที่คุยเพื่อกลับมาทดสอบ พร้อมอนุญาตค้น/เลือกแนวทางอายุยา. ขอบเขตเฉพาะ: เอกสาร Specs/Plan/Task; Prisma/migration/สคริปต์ apply; registry/records สำหรับลูกค้าและเขต; API/services/types/UI เขต/ล็อตรับเข้า/ยอดคลัง/ปรับยอด/โอน/แจก/Orders workflow; navigation/status badge; tests/คู่มือตรวจรับ. ไม่แตะ Auth credentials/Role ใหม่/Deploy/Dashboard redesign. ลำดับสรุป contract → schema+preserve data → transaction/API → UI → DB apply/readback → tests/verify → ส่ง UAT. คงกฎ OPEN ที่ยังไม่ยืนยันและไม่เดาใบขาย/ภาษี/เครดิต. ไม่สร้าง stock/ล็อตสมมติและไม่ commit จนเจ้าของทดสอบรวม.

- PLANNING ยืนยันจองเมื่อสร้าง Order สำเร็จ: มีของ 10 และ Order แรก 10 แล้ว คนอื่นสร้างเพิ่มไม่ได้. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกสูตรพร้อมขาย=คงเหลือ-จอง → แทนข้อเสนอจองหลังอนุมัติ → สรุป. ยังไม่ตัดของจน Admin ยืนยันเสร็จสิ้น. เมื่อ implement ต้องกันการสร้างพร้อมกันจองเกิน; วิธีคืน/ปรับจองเมื่อยกเลิกหรือส่งกลับแก้รอรายละเอียด.

- PLANNING คำยืนยันงานขายล่าสุด: ของไม่พอสร้างเอกสารไม่ได้; Manager/Admin ส่งกลับให้ Sales แก้ได้; Manager อนุมัติเป็นสถานะอนุมัติ จากนั้น Admin ตรวจและยืนยันอีกครั้งเป็นเสร็จสิ้นพร้อมตัดของคลังหลัก. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึก → ปรับ state/จุดตัดยอดในแผน → สรุป. ไม่มีเปลี่ยนโค้ด/DB/ยอด. การจองและ FEFO ยังรอยืนยัน; ส่งกลับแล้วต้องอนุมัติใหม่หรือไม่ยัง OPEN. ต้องวางป้องกันยอดไม่พอเมื่อมีหลายคำสั่งซื้อและการกดยืนยันซ้ำ.

- PLANNING ยืนยันเพิ่ม: จัดของในขั้น Admin หลัง Manager อนุมัติ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับระบุผู้จัดของ → ปรับลำดับแผน → สรุป. ไม่ implement/แก้ยอดหรือ DB; วิธีจัดล็อตอัตโนมัติยังรอยืนยัน.

- PLANNING เจ้าของยืนยันลำดับงานขาย: Sales สร้างเอกสาร, Manager ตรวจ/ปรับ/อนุมัติ, Admin ตรวจและจัดคำสั่งซื้อแล้วจึงตัดของจากคลัง. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกกฎแทนข้อเสนอเดิม → แยกขั้นอนุมัติจากตัดยอด → สรุปเพื่อคุยต่อ. ไม่ implement หรือปรับสิทธิ์จริง. FEFO/จังหวะจอง/วิธีตัดเมื่อจัดเสร็จยังเป็นรายละเอียดที่ต้องยืนยัน; ไม่ถือว่าการอนุมัติของ Manager ตัดของแล้ว.

- PLANNING งานขาย: เจ้าของขออธิบายผู้สร้าง/ลูกค้า/การยืนยัน/จังหวะตัดของ และให้ค้นแนวทางบริษัทใหญ่เพื่อเลือกล็อตอัตโนมัติ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับค้นเอกสารทางการ SAP/Microsoft → อธิบายตัวอย่าง → เสนอ FEFO/จองเมื่อยืนยันคำสั่งขาย/ตัดเมื่อยืนยันจ่ายจริง → รอเจ้าของเลือก. ข้อเสนอไม่ใช่กฎอนุมัติ ยังไม่เปลี่ยนสิทธิ์/ยอด/DB. ตรวจรับโดยเจ้าของอ่านแผนและให้รายละเอียดต่อ.

- PLANNING เจ้าของยืนยันการยกเลิกเพื่อแก้ข้อมูลรับเข้า: ของมาจริงแต่กรอกผิด ยกเลิกรายการผิดพร้อมเหตุผลแล้วบันทึกรายการถูกต้องเชื่อมต้นฉบับ เก็บประวัติ ยอดตรงของจริงไม่นับรับซ้ำ; การขาย/โอนเดิมยังตรวจย้อนถึงล็อตและข้อมูลแก้ไขได้. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกข้อยืนยัน → แยกการแก้ข้อมูลจากรับของใหม่/คืนของ → สรุปก่อนคุยต่อ. ไม่ implement/แก้ DB/ยอดจริง. วิธีคง ID และผลต่างรายการที่ใช้ไปแล้วต้องออกแบบตามกฎที่พร้อม.

- PLANNING คำยืนยันล่าสุด: ขายใช้คลังหลัก แจกใช้คลังการตลาด; ราคาขาย Admin กำหนดและแก้เอง ไม่เปลี่ยนตามต้นทุนล็อต. รับข้อมูลอายุยาสำหรับบริจาค/งดขาย/รอทำลายเป็นรายละเอียดประกอบ ยังมีช่วงและเงื่อนไขที่ต้องสรุปเป็นเกณฑ์เดียว. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึก → อธิบายยกเลิกรายการรับเข้าด้วยตัวอย่าง → ถามเกณฑ์อายุและพฤติกรรมย้าย/เลือกล็อตที่ยังค้าง. ไม่แก้ระบบ/DB/สิทธิ์หรือเดาผลย้อนธุรกรรม; ไม่อ้างข้อความทางการแพทย์/กฎหมายที่ส่งมาเป็นข้อเท็จจริงตรวจแล้ว.

- PLANNING คำยืนยันรับเข้ารอบถัดไป: ต้นทุนกรอกต่อ Lot (แผนตีความยอดรวมของล็อต ใช้จำนวนรับเข้าหาต้นทุนต่อหน่วย), ของมาถึงและตรวจแล้วจึงบันทึกล็อตใหม่; นับสิทธิ์ยกเลิก 7 วันจากเวลาบันทึกล็อต; ยกเลิกตรง ๆ ได้แม้ขาย/โอนแล้ว; แยกรายการปรับยอดพร้อมเหตุผลและผู้ทำ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับอัปเดตข้อยืนยัน → แยกผลการยกเลิกต่อยอด/เอกสารเป็น OPEN → ส่งสรุป. ยังไม่ implement/เปลี่ยนยอด/DB; ไม่ลบประวัติและไม่ทำให้ผลตรวจนับปรับยอดอัตโนมัติ.

- PLANNING รับกติกาสินค้ารอบล่าสุด: ต้นทุนแยกตามล็อตเห็นเฉพาะ Admin/CFO; Admin กำหนดราคาขายสินค้าเพื่อเทียบกำไรขาดทุน; รับหนึ่งครั้งหลายล็อตได้แต่ห้ามเติมล็อตเดิม; Admin รับเข้าโดยไม่มีขั้นอนุมัติแยก; ยกเลิกภายใน 7 วัน. ขอบเขต ACTIVE/Specs/Plan เท่านั้น. ลำดับบันทึกข้อยืนยัน → เสนอคลังหลักเป็นค่าเริ่มต้น/ย้ายคลังตามอายุ → เก็บ OPEN ต้นทุนต่อหน่วยหรือรวม, วันเริ่มนับ/รายการใช้ไปแล้ว, การย้ายจริง, และการปรับยอด. แหล่งที่มารอข้อมูลย่อยตามเจ้าของ. ไม่แก้โค้ด/DB/สิทธิ์จริงหรือ Ledger; ไม่ถือว่าคำว่าปรับสมดุลอนุมัติปรับยอดจากผลตรวจนับอัตโนมัติ.

- PLANNING คำยืนยันล็อตและที่มาข้อมูล: แต่ละล็อตต้องมี ID เฉพาะ ข้อมูลทั้งระบบต้องเชื่อมกลับไปยังต้นทางและตรวจสอบย้อนหลังได้. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกกติกา → แยก ID ภายใน/เลขล็อตที่ผู้ใช้เห็น → สรุปต้นทางและประวัติ → รอรายละเอียดธุรกรรม. ไม่แก้โค้ด/DB/Ledger. ตรวจรับแผนโดยเจ้าของอ่านความเชื่อมโยง; ไม่อ้างว่า ID ป้องกันความผิดพลาดได้ทั้งหมด.

- PLANNING รับคำอธิบายเติมสินค้า: สร้างข้อมูลสินค้าไว้ก่อน เช่น ยา A แล้วบันทึกของเข้าของสินค้าตัวเดิม ระบุแหล่งที่มา จำนวน (ตัวอย่าง 1000 ชุด) ต้นทุน วันผลิต วันหมดอายุ. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกข้อมูลรับเข้า → สรุปแยกข้อมูลหลักกับรายการเติม → เก็บจุดค้างต้นทุนต่อหน่วย/รวมและความเชื่อมโยงล็อต/คลัง. ไม่เพิ่มข้อมูลจริง/โค้ด/DB/Ledger. หน่วยตัวอย่างยังไม่ถือเป็นอนุมัติการแปลงหน่วย.

- PLANNING หัวข้อถัดไปสินค้าและการเติมของ: ตรวจสถานะข้อมูลหลักสินค้า/คลัง เทียบงานรับเข้า/Lot/วันหมดอายุที่ยังไม่ implement และถามความหมายระยะเวลาสินค้าก่อน. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับตรวจของเดิม → บันทึกหัวข้อสนทนา → สรุปส่วนที่มีและจุดที่ต้องตกลง. ไม่แก้ระบบ/DB หรือเริ่ม Ledger.

- PLANNING เจ้าของให้เริ่มข้อมูลหลักและความเชื่อมโยงทั้งระบบก่อน ช่องข้อมูลย่อยเพิ่มภายหลัง. ขอบเขตรอบนี้ ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกลำดับความสำคัญ → เสนอภาพรวมโมดูลและความสัมพันธ์ → คุยทีละส่วนก่อนจัด implementation. ไม่เดากฎการแปลงเอกสาร/ยอดเงิน/สต็อก/สิทธิ์; ยังไม่เขียนโค้ดหรือแก้ DB. ตรวจรับโดยเจ้าของอ่านภาพรวมและให้รายละเอียดต่อ.

- PLANNING คำยืนยันล่าสุด: เอากลุ่มลูกค้าที่แยกเดิมออก และเปลี่ยนชื่อประเภทลูกค้าเป็นกลุ่มลูกค้า ให้เหลือข้อมูลจัดประเภทเพียงช่องเดียว. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกข้อกำหนดแทนข้อเสนอเดิม → ปรับแผน → ส่งสรุป. ยังไม่แก้โค้ด/API/DB หรือลบข้อมูลจริง; การจัดการโมดูลเดิมและข้อมูล category/groupId ต้องวางแผนเมื่อเริ่ม implementation. ตรวจรับเอกสารโดยเจ้าของอ่านสรุป.

- PLANNING ลูกค้า/กลุ่มลูกค้า: เจ้าของยืนยันเก็บกลุ่มลูกค้าไว้ใช้กรองร่วมกับเขตขาย; ชื่อกลุ่มจริงยังรอระบุ. รอบนี้ตรวจช่องลูกค้าปัจจุบันและเสนอข้อมูลเพิ่มเติมเป็นร่างเพื่อคุย ไม่ถือเป็นข้อกำหนดบังคับใหม่. ขอบเขต ACTIVE/Specs/Plan เท่านั้น; ลำดับบันทึกคำยืนยัน → สรุปฟอร์มปัจจุบัน/ข้อเสนอ → รอรายละเอียด. ไม่แก้แอป/DB.

- PLANNING รับข้อมูลต่อเนื่อง: เจ้าของยืนยันเปลี่ยนเขตลูกค้าหลังสร้างได้ เหมือนเลือกเขตให้ลูกค้า; ให้จำประเด็นค้างไว้ก่อนเพราะยังมีรายละเอียดอีกมาก. เจ้าของระบุไม่มีเรื่องกลุ่มลูกค้าและขอคำอธิบายประโยชน์. ขอบเขตรอบนี้ ACTIVE/Specs/Plan เท่านั้น: บันทึกคำยืนยัน → อธิบายโมดูลเดิมโดยไม่เดากฎ → รอรายละเอียดต่อ. ไม่เริ่มแก้/ลบโมดูลหรือเปลี่ยนสิทธิ์.

## วางแผนเขตขาย — คำยืนยันรอบสอง 2026-10-03

- PLANNING ขอบเขต ACTIVE/Specs/Plan เท่านั้น: ยืนยันสมาชิกเป็น Sales, คนละเขตเดียว, ลูกค้าเขตเดียวเลือก/เปลี่ยนตอนสร้างลูกค้า, สร้างเขตก่อนเพิ่มคน, เขตเริ่มต้น เหนือ/ออก/ตก/ใต้. ลำดับลงข้อยืนยัน → ปรับแผน → สรุปความสัมพันธ์และจุดค้างให้เจ้าของ. ผลลัพธ์เอกสารตรงคำตอบ; ตรวจรับโดยอ่านสรุป. ยังไม่แก้ระบบ/DB/สิทธิ์หรือ commit รอบนี้. ขอบเขตสิทธิ์รายเขตและการย้ายลูกค้าหลังบันทึกยังรอรายละเอียด.

- CHECKPOINTED ชุดก่อน TASK-089–091 รวมใน commit 4a310a5 บน AI แล้ว; ตรวจ staged diff/รูปแบบข้อมูลลับผ่าน และ working tree สะอาดหลัง commit. ไม่ push/Deploy. สถานะรอ commit ด้านล่างเป็นบันทึกย้อนหลัง.

## Checkpoint ชุดทดสอบและเอกสาร — 2026-10-03

- IN_PROGRESS เจ้าของสั่ง commit ชุดก่อน แล้ววางแผนเขตขายก่อนลงมือ. ขอบเขตงานค้าง TASK-089–091 (tests/verify, คู่มือ/workbook/UAT, ฟอร์มพร้อมคำอธิบาย) รวมบันทึกข้อกำหนดที่รับไว้ซึ่งยังเป็นแผน. ลำดับตรวจ diff/รายชื่อไฟล์/ข้อมูลลับ → บันทึก checkpoint → stage เฉพาะไฟล์งาน → commit บน AI → ตรวจสถานะ. ใช้ผลตรวจเดิม tests 14/14 และ verify 10/10; ไม่มีการแก้ระบบใหม่ในรอบนี้. ผลลัพธ์ commit เดียวและ working tree สะอาด; ไม่ push/Deploy.

- PLANNING เขตขาย: เจ้าของย้ำให้วางแผนก่อน ยังไม่ลงมือแก้ระบบ. ข้อกำหนดรอบแรกเป็นข้อมูลประกอบการสนทนา; จุด OPEN รอคำตอบ.

## รายละเอียดธุรกิจรอบถัดไป — เขตขาย

- IN_PROGRESS รับกติกาเขตรอบแรก: Admin สร้างเขต (เหนือ/ออก/ตก/ใต้), เขตละ Manager 1 คนและสมาชิกอีก 1 คนซึ่งรอยืนยันว่าเป็น Sales, ลูกค้าผูกเขตและแสดงชื่อแทน ID. ขอบเขตรอบนี้ ACTIVE/Specs/Plan เท่านั้น. ลำดับตรวจโมดูลเดิม → บันทึกข้อยืนยันและ OPEN → สรุปให้เจ้าของตอบจุดค้าง. ผลลัพธ์เอกสารตรงคำอธิบาย; ตรวจรับโดยเจ้าของยืนยันความหมายสมาชิก/การผูกเขต/วิธีกรอกลูกค้า. ยังไม่แก้โค้ด ฐานข้อมูล หรือสิทธิ์.

- WAITING_FOR_REQUIREMENTS เจ้าของยืนยันฟอร์มโอเคแล้วและไม่ให้ปรับเพิ่มตอนนี้. กลุ่มงานที่เลือกคือ ลูกค้า/เขตขาย/ผู้ใช้งาน โดยเริ่มเจาะเขตขายก่อน อิงโมดูลที่มี. เจ้าของจะอธิบายรายละเอียดต่อ; คงสิทธิ์การใช้งานปัจจุบัน ยังไม่แยกสิทธิ์เพิ่มเติม. รอบนี้บันทึก ACTIVE/Specs/Plan เท่านั้น ก่อนแก้ข้อมูล/โครงสร้างต้องรับรายละเอียดและจัดแผนย่อยตามข้อยืนยัน.

## TASK-091 ฟอร์มกรอกข้อกำหนด — 2026-10-03

- READY_FOR_USER_TEST เพิ่มคำอธิบายไทย+ตัวอย่างทุกช่องและaria-describedbyแล้ว พร้อมชื่อส่วนงาน/Roleไทย. VMตรวจ2438control instancesใน22หัวข้อมีhelp/ร่างเดิมและสิทธิ์ที่ยังไม่สรุปคงอยู่ผ่าน. Browserเปิดข้อกำหนดอ่านuseเทียบrequiredได้จริง missinghelp0; มือถือ390pxไม่ล้น. JSsyntax/Prettier/diffผ่าน; ไม่เปลี่ยนJSONkeys/คำตอบ/กฎระบบ. รอownerตรวจชุดเดิมแล้วcommitรวม.

- IN_PROGRESS ตามคำขอล่าสุด: เพิ่มคำอธิบายใต้ทุกช่อง/ตัวเลือก พร้อมตัวอย่างและคำไทยสำหรับคนไม่ใช่สายเทคนิค. ขอบเขต HTML/คู่มือ/Specs/Plan/Task/ACTIVE. ลำดับบันทึก → helpertext+aria-describedby/ป้ายไทย → ตรวจcoverage/ร่างไม่เปลี่ยน/browser → ส่งตรวจรวม. ไม่เปลี่ยนkeys/คำตอบหรือกฎธุรกิจ.
- READY_FOR_USER_TEST ปรับแบบกรอกทีละจุดแล้ว: inputตัวอย่างแต่ละfield/6ตัวเลือกข้อกำหนด, สถานะ+workflowเพิ่มแถวได้, สิทธิ์รายคำสั่งและscope4Role, legacyรายละเอียดพับได้. Browserบนoriginทดสอบแยกตรวจเพิ่มแถว/switch/reloadค่าครบ; มือถือ390pxไม่ล้น. VMตรวจlegacy/save/JSONroundtrip/print/invalidimportผ่าน. ร่างของผู้ใช้ใน127.0.0.1ไม่ถูกแก้โดยการทดสอบ; ไม่commitแยก.

- IN_PROGRESS ติดตามคำขอใหม่: เปลี่ยนช่องอธิบายยาวเป็น inputรายฟิลด์/selectรายจุด/สถานะและworkflowเพิ่มแถวได้/permissionเลือกต่อคำสั่ง; ข้อมูลเดิมเก็บในหมายเหตุพับได้. ขอบเขต HTML/คู่มือ/Specs/Plan/Task/ACTIVE/UAT. ลำดับแก้Specs/Plan → schemaflatต่อยอดเดิม/atomiccontrols → save/import/print → browserตรวจ. รักษาdraftเก่า/JSONv1 ไม่commitแยก.
- READY_FOR_USER_TEST ส่ง standalone HTML กรอกได้ครบ22หัวข้อ/113field reference. Browserทดสอบเปลี่ยนโมดูล/reloadร่างผ่าน/มือถือ390pxไม่มีoverflow/ล้างคำตอบทดสอบแล้ว. VMตรวจsave/export-import JSON/printรวม2โมดูล/invalid importรักษาร่างผ่าน. UIส่งออกแสดงsuccessแต่automationจับdownload event timeout จึงตรวจpayload/roundtripด้วยVMแทน; ต้องลองdownloadจริงบนChrome/Edge. Google Formยังไม่สร้างต้องlogin. รอcommitรวม89–91หลังตรวจรับ.

- IN_PROGRESS เจ้าของขอแบบฟอร์มกรอกได้ โดย Google Forms เป็นทางเลือก. ตรวจแล้ว Google Forms ต้อง login และไม่มี connector สร้างฟอร์มโดยตรง. ทำ standalone HTML ใน docs/forms/business-requirements.html พร้อมข้อมูล registry ฝังในไฟล์ เลือกโมดูล/คำถาม/สิทธิ์/บันทึกร่าง/export-import JSON/พิมพ์; คู่มือและลิงก์เอกสาร. ลำดับลง Specs/Plan → สร้างฟอร์ม → ตรวจ UI/บันทึก/ส่งออก/มือถือ → ส่งมอบ. ไม่ส่งข้อมูลออกเว็บ ไม่แก้แอป/DB และรอรวม commit หลังตรวจรับครั้งเดียว.

## TASK-090 รวมงานเตรียมและตรวจรับครั้งเดียว — 2026-10-03

- READY_FOR_USER_TEST ชุดเตรียมครบ: workbook 14 โมดูล/113 ฟิลด์ พร้อมโมดูลเฉพาะ, คู่มือไทย, UAT ชุดเดียว. ตรวจ field/type/required/relation ตรง registry ครบ 113, 4 Role ทุกโมดูล, ลิงก์เอกสาร 8 จุด/รูปแบบ/diff ผ่าน. รอบนี้เปลี่ยนเฉพาะเอกสาร; ผล tests เดิม 14/14 และ verify 10/10 เจ้าของรับแล้วไม่รันซ้ำ. รอตรวจรับ TASK-090 แล้ว commit TASK-089/090 รวมครั้งเดียว. ยังไม่เริ่ม Dashboard/Deploy/กฎ OPEN.

- IN_PROGRESS เจ้าของสั่งทำงานเตรียมที่เหลือให้ครบ แล้วทดสอบครั้งเดียว/commit ครั้งเดียวหลังตรวจรับ. ขอบเขต docs/BUSINESS-REQUIREMENTS-WORKBOOK.md, docs/USER-MANUAL.md, docs/UAT-PREPARATION.md, README, Specs/Plan/Task/ACTIVE. ลำดับอ่านระบบ/OPEN → บันทึกแผน → แบบฟอร์มทุกโมดูล → คู่มือหน้าจอจริง → เช็กลิสต์รวม → ตรวจเอกสาร/verify → ส่งเจ้าของตรวจครั้งเดียว. ไม่เริ่ม Dashboard/Deploy/กฎธุรกิจที่พักไว้. TASK-089 เจ้าของยืนยันผ่านหมดแล้ว.

## TASK-089 ทดสอบ flow ด้วยข้อมูลจำลอง — 2026-10-03

- COMPLETE เจ้าของยืนยัน “ผ่านหมด” แล้ว. รวมงานนี้ไว้รอ commit ครั้งเดียวพร้อม TASK-090 หลังตรวจรับตามคำสั่งล่าสุด.
- READY_FOR_USER_TEST เพิ่ม test:flows ผ่าน 14/14 และรวม verify ผ่าน 10/10 ใน 29.8 วินาที exit 0. ตรวจ diff ผ่าน. ทดสอบ handler/service/validators จริงด้วย DB/Auth ในหน่วยความจำ ไม่เชื่อม DB/HTTP จริง; UI/browser/locking ไม่ครอบคลุม. งานใหม่ยังไม่ commit; checkpoint ก่อนหน้า 6c7916a สำเร็จแล้ว.

- IN_PROGRESS เจ้าของอนุมัติต่อชุดทดสอบหลัง checkpoint 6c7916a. ขอบเขต scripts/test-record-flows.mjs, package.json/verify runner/คู่มือ, Specs/Plan/Task/ACTIVE. ลำดับบันทึก → fixture และ DB/Auth adapter ในหน่วยความจำ → เรียก handler/service จริงเพื่อค้นหา/แบ่งหน้า/CRUD/สิทธิ์/conflict/audit rollback → รวม verify → รันตรวจ. ไม่เปลี่ยน production/กฎธุรกิจ/DB จริง. เป็น integration tests ฝั่ง server ไม่ใช่ browser UAT.

## TASK-088 checkpoint verify — 2026-10-03

- CHECKPOINTED commit 6c7916a บน AI สำเร็จ ตรวจ staged diff/credential patterns ผ่าน และ working tree สะอาดก่อน TASK-089. ไม่ push/Deploy.

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
