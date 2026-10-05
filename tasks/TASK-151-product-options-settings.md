# TASK-151 — ตั้งค่ารายการกลางสินค้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT; อนุมัติ5ตุลาคม2569

## ผลที่ทำจริง

- มีDB product_options10ชุด40รายการ: กลุ่มรหัส3 รูปแบบรหัส4 ประเภทผลิตภัณฑ์5 หมวดหมู่1 ยี่ห้อ2 ผู้ผลิต2 ตัวยา11 รูปแบบยา3 ประเภทกฎหมาย1 หน่วย8. Brand/manufacturerเป็นตัวอย่างชัดเจน legalTypeเป็นรอตรวจสอบ ไม่จัดประเภทยาอัตโนมัติ.
- GET/POST/PATCH /api/product-options พร้อมrole/origin/validation/unique/version/audit. ปิดรายการไม่ลบสินค้า legacycategory/dosage/drugคงUUIDและแก้ชื่อในtransactionเดียว.
- /settings hubและSideรอง → /settings/product-options แสดงจริงผ่านAdminShell มี10ชุดและเพิ่ม/แก้ชื่อ/ปิด-เปิด. requireAdmin guard. ไม่แก้settings/page.tsxทั่วไปที่ถูกพัก.
- Preview10ComboboxเรียกAPIเลือกอย่างเดียว คีย์บอร์ด/โหลดเพิ่ม/ลิงก์ตั้งค่าแท็บใหม่/refreshและตรวจselectedIDเมื่อกลับ. ไม่มีlocalStorageหรือเมนูสร้างชื่อ. ยังคงpreviewไม่บันทึกและไม่รันเลขจริง.
- ผ่านdry-runrollback/seedcommit/readback/seedซ้ำตรวจSHA256ทุกID/name/code/active/versionคงเดิม; APIintegration10หัวข้อ(จริงกับDB stubเฉพาะidentity) rollbackfixturesทั้งหมด; duplicate409/stale409/400/401/403/origin/legacyFK/audit/RLS/no-client-grants/ยอด950. HTTPAPIจริง401เมื่อไม่มีsession. renderpreview10pickerและsettings10ชุดผ่าน รวมshellhubและchildrenหน้าใหม่.
- ESLint/Prettier/TypeScript/Prisma generate/git diff --checkผ่าน. ยังไม่ตรวจภาพ/คลิกจริงในbrowserหรือloginจริง.

คำสั่งsetup: `node scripts/setup-product-options.mjs` (เพิ่ม `--dry-run` ไม่บันทึก). ทดสอบDB/API: `node --loader ./scripts/ts-test-loader.mjs scripts/test-product-options.mjs`.

Supabase security advisor: product_optionsมีINFO [RLS Enabled No Policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) ตรงรูปแบบserver-only/revoke client rolesที่ตรวจผ่าน ไม่เปิดpolicyใหม่. ยังมีคำแนะนำเดิมเรื่อง [leaked password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) ของproject ไม่แก้Authนอกขอบเขตงานนี้.

## แผนย่อย

รายละเอียดหน้าตั้งค่า: เพิ่ม src/components/settings/settings-home.tsx และ src/app/settings/layout.tsx (requireAdmin). /settingsใช้hubในshell ส่วนsettings/page.tsxเดิมเก็บไว้ไม่แก้/เปิดตั้งค่าทั่วไปนอกขอบเขต. หน้า/settings/product-optionsแสดงchildrenจริงในshell และSideรองมีข้อมูลพื้นฐานสินค้า.

1. ACTIVE/Specs/Plan/API contractก่อนโค้ดทุกงานย่อย.
2. เพิ่มproduct_optionsผ่านSQLแบบadditiveพร้อมPrisma model/migrationและseedที่ไม่เขียนทับ. ต้นทุน/ยอด/สินค้า/บัญชีเดิมไม่แก้. ชุดlegacyคงUUIDและแก้ชื่อlegacyพร้อมกัน. ตรวจRLS/grants.
3. types/config10ชุดและserver/API GET/POST/PATCH, validation/duplicate/version/audit/role/origin.
4. หน้าตั้งค่า/settings hub/Sideรอง/navigationและAdminShell renderเฉพาะหน้าใหม่ที่อนุมัติ. UIชื่อไทย StatusBadgeกลางและscope col.
5. pickerกลางAPIเลือกอย่างเดียว คงSVG/opacity30/colors/keyboard. แทนlocal brand/manufacturerและempty pickersในpreviewทั้งหมด. ยังไม่บันทึกสินค้า/รันเลขจริง.
6. seedจริง readback; integrationทดสอบเพิ่ม/แก้/ปิด/เปิด/duplicate/version/roles/legacyชื่ออ้างอิงในtransaction rollback. lint/typecheck/render/HTTP401 และตรวจยอดตัวอย่างคง950. ส่งUAT.

ไฟล์: docs/specs/2026-10-05-product-options.md, ACTIVE/Specs/Plan/Taskนี้, prisma/schema.prismaและmigration, scripts/setup-product-options.mjs/test-product-options.mjs, src/config/product-options.ts, src/types/api/product-options.ts, src/server/products/options.ts+options-handler.ts, src/app/api/product-options/route.ts, src/app/settings/page.tsx+product-options/page.tsx, src/components/settings/product-options-manager.tsx, src/components/layout/settings-secondary-sidebar.tsx/admin-shell.tsx, src/config/navigation.ts, src/components/products/product-option-combobox.tsx/product-name-combobox.tsx/product-create-preview.tsx. ไฟล์เดิมตั้งค่าเป็นเนื้อหาที่ถูกพัก: เก็บการตั้งค่าทั่วไปเดิมไว้ในrepoไม่เปิดนอกขอบเขต.

## ⚠️ ต้องทดสอบโดยคุณ

ตามSpecs TASK151: Adminจัดการ10ชุดและเลือกข้อมูลDBในเพิ่มสินค้าได้ ลิงก์ตั้งค่าเปิดแท็บใหม่ข้อมูลฟอร์มไม่หาย ปิดรายการไม่ลบสินค้าหรือยอดเดิม ผู้ไม่ใช่Adminจัดการไม่ได้ ไม่มีบันทึกสินค้าใหม่.
