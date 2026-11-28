# TASK-177 — สร้างสินค้าจริงครบข้อมูลและไฟล์

สถานะ: IMPLEMENTED / WAITING_FOR_UAT — 6 ตุลาคม 2569

## ขอบเขตที่อนุมัติ

เจ้าของขอเชื่อมการกรอกทั้งหมด รวมรูปและเอกสาร 10MBต่อไฟล์ ไม่จำกัดจำนวนเอง. TASK152เรื่องconditionalยาคงoptionalตามดาวทั่วไป ไม่เดาเพิ่มเติม.

## ลำดับ/ไฟล์/ผลลัพธ์

1. Specs/Plan/ACTIVE และdocs/examples/TASK-177-product-example.md: ตัวอย่างSUP-OTH/สำลีทดสอบพร้อมoptionที่มี/ช่องoptional.
2. prisma/schema.prisma+migrationใหม่ และscripts/setup-product-full.mjs: เพิ่มprofile/optiongroup-format/key constraints/files metadata/idempotency. ทำbackupสรุปcountsและnullablelegacyยา/คลังโดยไม่แก้recordsเดิม/stock.
3. types/api/product-full.ts, server/products/full.ts/validationและserverstorage, app/api/products/full/*: next/create/fileอ่าน ผู้ใช้/role/origin/UUIDs/activeoption/uniqueครบ; Storageprivatebucketตรวจmagic+10MB.
4. product-create-preview.tsx/picker/name/attachmentและdetail-preview/productsservice/types: statefields/optionIDs/files, nextcodeจริง, upload+commit/readback, แสดงDB/ไฟล์ในdetail. Legacyสร้างยังคงAPIเดิมรองรับ.
5. scripts/test-product-full.mjs: validate/next/duplicates/requestretry/อ่านรูปPDF/role/rollback/cleanupทดสอบไม่เพิ่มstock. Prisma generate/lint/type/renderเช็กflow. Supabaseadvisors/RLS/privatebucketตรวจ.

## ตรวจรับ

กรอกชุดตัวอย่าง+รูป+PDF กดบันทึกได้รหัสจริง เปิดdetail/รีเฟรชข้อมูลและไฟล์ยังอยู่. duplicateเลข/errorไฟล์>10MBไม่สร้างสำเร็จ ปุ่มไม่กดซ้ำ สินค้าไม่มียอดstockเพิ่ม. nonAdminสร้างไม่ได้และManagerไม่เห็นต้นทุน. no-publicfile/nonloginอ่านไม่ได้. รอบนี้ไม่แก้สินค้าexistingจริงหรือseedตัวอย่างธุรกิจโดยไม่ร้องขอ.

## ผลดำเนินการและตรวจสอบ

เชื่อมทุกช่องและไฟล์จริงแล้ว มี manifest ตรวจครบก่อน commit, UUID canonical lowercase, retry/cleanup และ audit. ติดตั้ง additive migration/private bucket แล้วพร้อม backup ใน local-backups ที่ไม่เข้า Git; สินค้าเดิม12รายการและ stock950คงเดิม. คู่มือ API: [product-full.md](../docs/api/product-full.md); ชุดกรอก: [ตัวอย่างสินค้า](../docs/examples/TASK-177-product-example.md).

Integration ผ่าน11กลุ่มกับ DB/Storage จริง: validation, next/kind, begin/retry, manifestครบ, PNG/PDF/upload retryรวมUUIDตัวพิมพ์ใหญ่, limit/MIME, commit/readbackทุกช่อง/ไฟล์/idempotency, duplicate, ต้นทุน/legacy, pendingcleanup/readguard, HTTPauth/origin/owner. DB rollbackและไฟล์ทดสอบลบหมด. Prisma generate/TypeScript/ESLint/production buildผ่าน; SSRตรวจform/ชื่อช่อง/submitผ่าน และ HTTPไม่login401ผ่าน. ยังไม่อ้างว่าทดสอบกรอกผ่านbrowserแล้ว.

## ⚠️ ต้องทดสอบโดยคุณ

1. หากไม่มีหมวดเวชภัณฑ์ทดสอบ ให้เพิ่มรหัส DEM ในตั้งค่าระบบ แล้วกรอกชุดตัวอย่าง แนบรูปและ PDF อย่างละไฟล์ กดบันทึก: ต้องได้รหัสจริงและแจ้งบันทึกสำเร็จ.
2. เปิดรายละเอียดและรีเฟรช: ข้อมูลทุกช่องกับรูป/เอกสารยังอยู่ ยอดคงเหลือ0จนรับสต็อกเข้า.
3. ลองไฟล์เกิน10MBและเลขลำดับซ้ำ: ต้องแจ้งข้อผิดพลาด ไม่แจ้งบันทึกสำเร็จ; แก้แล้วลองใหม่ได้.

ปุ่มแก้ไขรายละเอียดเดิมยังเป็น local preview ตามTASK165 ไม่ได้เชื่อม updateครบข้อมูลในงานนี้. ไม่เพิ่มกฎยา conditional ที่ยังOPEN ไม่seedธุรกิจ ไม่commit/deploy.
