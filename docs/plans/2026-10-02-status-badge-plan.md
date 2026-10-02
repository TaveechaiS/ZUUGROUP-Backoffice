# แผนย่อย TASK-065 — Status pill

สถานะ IN_PROGRESS; เจ้าของอนุมัติให้ทุกสถานะและเลือกสีได้ตามbg50/text600 เมื่อ 2026-10-02. เพิ่ม RecordDetailPage ช่องstatus และ Dashboard activityในขั้น3. Mapping emerald/orange/red/blue/slate มี fallback; ไม่เปลี่ยนlabel/businesslogic.

1. ยืนยัน Specs/Task และสีตามภาพ; สำรวจ status ที่แสดงจริง.
2. สร้าง src/components/ui/status-badge.tsx ด้วย mapping tone และ markup+Tailwind เดียว;ไม่แก้globals/schema.
3. ใช้ใน src/components/pages/module-list-page.tsx (แทน StatusPill), src/app/users/users-list-content.tsx, src/app/users/[employeeCode]/user-detail-content.tsx, src/app/products/products-list.tsx, src/app/products/[ref]/product-detail.tsx. ถ้า dashboardมีbadgeใช้ component นี้ด้วย;ไม่ทำbadgeสำหรับข้อมูลที่ไม่ใช่สถานะ.
4. ตรวจ diff/lint/type-check และเจ้าของตรวจรายการ/detail+มือถือ. ไม่เพิ่ม unit tests สำหรับ styling หรือสร้างข้อมูลใน DB.

ตรวจรับ: ปกติเขียว, ต่ำกว่าปกติส้ม, ต่ำผิดปกติแดงตามภาพ;ข้อความจริงคงเดิม, dotไม่หด, ป้ายยาวไม่ดันตารางล้นผิดเดิม. Pagination/API taskอื่นคงสถานะเดิม.

ผล: component/การเชื่อมเสร็จ, type-check/lint/diff-checkผ่าน; READY_FOR_USER_TEST. Mappingสถานะครบที่สำรวจและfallbackเทาครอบคลุมค่าที่เพิ่มภายหลัง. ไม่แก้DBหรือคำนวณสถานะคลัง.

งานต่อที่เจ้าของยืนยัน: ตรวจstatusทั้งsrc → เชื่อมModulePlaceholderในcomponents/layout/admin-shell.tsxที่ยังใช้styleเก่า → เพิ่มmappingเตรียมโครงหน้าแล้ว → บันทึกมาตรฐานในAGENTS.md/STATUS-BADGE-GUIDE → type-check/lint/diff. ไม่มีmigrationหรือAPIchange.

งานแก้ตามคำท้วงหัวตาราง: module-list-page.tsx desktopcellใช้StatusBadge/mobilelabelสถานะ/deletedbadge;หัวshared/products/usersใช้scope=colโดยคงคำสถานะที่มีแล้ว. ตรวจtype-check/lintและdesktop/mobile UAT.
