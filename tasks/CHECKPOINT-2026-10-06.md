# Checkpoint — 6 ตุลาคม 2569 (Asia/Bangkok)

Branch AI. จุดก่อนหน้า bf32854. Local commit เท่านั้น; ดู hash checkpoint นี้ด้วย `git log -1 --oneline`. ไม่มี push/deploy/ธุรกรรม DB ในการทำ checkpoint.

## งานที่เก็บ TASK154–215

- เพิ่มสินค้า: ฟอร์มและส่วนย่อยอยู่ใน page; กลุ่มรหัส/รูปแบบ/เลขลำดับ5หลักแก้ได้ ตรวจซ้ำ รหัสเต็มแสดงตามที่เลือก. ตัวเลือกจากรายการกลาง ครบชุดและเลื่อนประมาณ10แถว. แนบรูป/เอกสารหลายไฟล์ ไม่เกิน10MBต่อไฟล์ เก็บ private และบันทึกจริงผ่าน pending/upload/commit. ต้นทุนอยู่ตอนรับเข้า ภาษีอยู่ตอนทำเอกสาร.
- ตั้งค่าระบบ: หน้าหลักว่าง; ข้อมูลพื้นฐานสินค้ามีฟอร์ม/ตาราง รายการกลางอยู่ใน page. เปลี่ยนได้ตาม kind/สิทธิ์/version เดิม.
- สต็อก: 1รับเข้า=1สินค้า=1ล็อต; IDข้อความ-ปี-เลข เลขแก้ได้. ประวัติเติมของไม่มี tabs คลิกทั้งแถวดู/แก้ receipt รายชิ้น. กรอกจำนวน ต้นทุนรวมล็อต วันผลิต/หมดอายุ; คง flow คลังหลัก→การตลาด→รอทำลายตามกติกาที่อนุมัติ.
- คลัง: จำนวนล็อตและสินค้าแยกแต่ละคลัง; หมด/ใกล้หมดคำนวณเฉพาะ MAIN. MARKETINGแสดงวันเหลือต่ำสุด. DISPOSALไม่มีสถานะใกล้หมด; ทำลายมี Alert เก็บแถวเดิมแต่ยอดล็อต/สินค้าไม่นับหลังทำลาย. ในสินค้า [id] มีตารางล็อตคงเหลือและประวัติ.
- โค้ดเฉพาะหน้าอยู่ page/layout; ถอน components/operations และ component เฉพาะสินค้า/ตั้งค่าที่ถูกย้าย. Shared pagination/sort/status/alerts ยังคงใช้กลาง.
- ตาราง: Sortสามจังหวะ asc→desc→ปกติ; ↓น้อยไปมาก/↑มากไปน้อย ขนาดเล็กชิดหัวข้อ. Paginationสีเว็บ #1A58A7 ข้อความแสดง [10] จากจำนวนทั้งหมด เลือก10/20/50/100 ไม่มีเส้นบน.
- API/Postman: Zuugroup43requests folder auth/products/stock แยกทรัพยากร. ตัวเลือกฟอร์มครบชุด batch; receive bootstrapเล็กลง; detail/ประวัติ paged; MARKETINGใช้ค่าต่ำสุดโดยไม่ส่งทุกล็อต; ไม่มี secret ใน Collection.
- TASK215: หน้า product [id] แก้ข้อมูลครบและไฟล์ผ่าน API จริง. แก้รหัส/IDที่แสดง กลุ่ม รูปแบบ เลขลำดับ หน่วยได้แม้มีล็อต/เอกสาร; UUIDภายในคงการอ้างอิงเดิมและไม่แปลงจำนวนสต็อก. ตรวจรหัสซ้ำ/versionก่อน commit ป้องกันทับกัน; retryไม่บันทึกหรือauditซ้ำ. Accordionประวัติแสดงผู้แก้/วันเวลา พ.ศ./ก่อนหลังและแบ่งหน้า. ไม่เพิ่มเปิดขาย/ปิดขาย.

## หลักฐานล่าสุด

- TASK215 production build และ TypeScript/ESLint ผ่าน.
- actual service/handler กับ DB transaction rollback14กรณีผ่าน รวม code/unitแม้มีล็อต/จำนวนเดิม/stale409/ไฟล์ถอน404/cancelปลอดภัย/idempotent audit/auth/origin/cost history. ไฟล์fixtureล้างครบ จำนวนproducts/stockกลับ baseline.
- actual page VM ผ่าน prefillID/ครบfields/manifestไฟล์/lostcommitresponse retry/Successหลังยืนยัน/staleคงdraft/dirtycancel/nonAdmin.
- products-stock API contracts14 และ route pages77/fieldsets14 ผ่าน. Pagination/Combobox fixturesผ่านใน Taskก่อนหน้า ตามเอกสารแต่ละ Task.
- Postmanอ่านกลับ43requests เส้นใหม่มีtests/examples ตัวแปรexpectedVersion ตัวอย่างGETมีversion และ IDsเดิมครบ41รายการคงเดิม.
- ไม่อ้างว่าทุก legacy testผ่าน: test-api-contracts มีข้อจำกัดเดิมเรื่องruntimeconstantsใน product-full.ts (บันทึก TASK210).

## เริ่มต่อ

อ่าน AGENTS.md → tasks/ACTIVE.md → Specs/Plan → TASK-215-product-full-edit.md. Task215เป็น IMPLEMENTED / WAITING_FOR_UAT. กติกาแก้รหัส/หน่วยได้รับคำตอบแล้ว อย่ากลับไปล็อกตามreferenceหรือเพิ่มเปิดปิดขาย. แยก UUIDภายในกับรหัสแสดงเสมอ.

เอกสาร API: docs/api/product-full.md, product-edit.md, table-sorting.md; Postman generator scripts/build-postman-products-stock.mjs และ binding postman/Zuugroup.remote.json. อย่าสร้าง Collectionซ้ำหรือเขียนทับ IDเดิม. ไฟล์ที่นำออกถอนสิทธิ์จาก product ทันที แต่ objectprivateเก็บไว้จนมีนโยบายretention; อย่าpurgeเอง.

## ⚠️ ต้องทดสอบโดยคุณ

1. แก้สินค้า/รหัส/หน่วย/แนบและนำไฟล์ออกแล้วบันทึก รีเฟรชต้องข้อมูลคงอยู่ URLเป็นรหัสใหม่ ล็อต/ยอดสินค้าเท่าเดิม.
2. เปิดสินค้าเดียวกันสองแท็บ แท็บแรกบันทึกแล้วแท็บสองต้องแจ้งข้อมูลเปลี่ยน เก็บdraftและไม่ทับ; ปุ่มโหลดล่าสุดบอกว่าจะแทนdraft.
3. ยกเลิกหลังแก้ต้องมี Alert และกลับปุ่มแก้ไข; ข้อมูลเดิม/ไฟล์เดิมไม่เปลี่ยน.
4. เปิดประวัติผู้แก้/ก่อนหลัง/เวลา พ.ศ. เลือก10/20/50/100และเรียงได้. ตรวจ dropdown/Accordion/ตารางทั้ง desktop/mobile.
5. รับเข้ารายชิ้น/แก้ข้อมูลผิด ยอดและล็อตแต่ละคลังตามกติกา; ทำลายเก็บแถวแต่จำนวนที่นับลดลง. ตรวจ UIเงินจริงด้วยบัญชีแต่ละ Role ก่อนปิด UAT.
