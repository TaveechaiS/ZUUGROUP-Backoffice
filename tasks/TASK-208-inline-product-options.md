# TASK-208 — ย้าย ProductOptionsManager เข้า page

IMPLEMENTED / WAITING_FOR_UAT — 6 ตุลาคม 2569

ย้ายแล้วและลบcomponentเดิม. ESLint/TypeScript/diffผ่าน; rgในsrcไม่มีreferenceเดิม. คงAdminserverlayoutและAPI/พฤติกรรมเดิม ไม่ทดสอบเขียนDBจริง.

1. ตรวจreference: ใช้เฉพาะsettings/product-options/page.tsx; layoutsettingsตรวจAdminบนserverแล้ว.
2. ย้ายโค้ดทั้งไฟล์พร้อมhelpersไปpageclient; defaultPageใช้React.use(searchParams)เพื่อresolvekindก่อนuseState; defaultcodeGroupเมื่อkindไม่ถูกต้อง. ไม่ใช้windowqueryตอนSSR.
3. ลบไฟล์componentเดิมและimportเฉพาะหน้า; sharedSort/StatusBadge/SuccessAlert/SearchComboboxเดิม.
4. lint/type/diffและตรวจไม่มีreferencecodeเดิม. UATเข้าปกติ/URLkind/เลือกประเภท/ค้น/Sort/pagination/เพิ่มแก้ปิดเหมือนเดิม.

ไฟล์: src/app/settings/product-options/page.tsx, src/components/settings/product-options-manager.tsx (ลบ), Specs/Plan/ACTIVE/task. ไม่API/DB/commit/deploy.
