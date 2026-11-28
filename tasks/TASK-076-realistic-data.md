# TASK-076 ชุดข้อมูลชื่อสมจริง

สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติ “ทำได้เลย” 2026-10-02

คำขอ: ชื่อจริงสมจริงและรายละเอียดครบทุกโมดูล แทนชื่อรันเลขซ้ำของชุดตั้งต้น
Specs: docs/specs/2026-10-02-realistic-data.md
Plan: docs/plans/2026-10-02-realistic-data-plan.md

ตรวจอ่าน DB ผ่าน Supabase connector แล้ว (pg ตรงถูก sandbox ปิดเครือข่าย จึงใช้ connector ที่เชื่อม project เดิม) พบ records 210/products16/warehouses18 ยังไม่ UPDATE/INSERT/DELETE หรือเขียน seed รอบนี้

ขอบเขตหลังอนุมัติ: catalog/seed/refresh/snapshot/rollback/offline checks/DB ธุรกิจ/คู่มือ ไม่มี Auth/schema/API/stock/ledger

ผล: ลง DB 240แถวไม่ซ้ำครบ14โมดูลและสินค้า/คลัง คงcode/ID/status/deletionและข้อมูลผู้ใช้เดิม เติมข้อมูลนำเข้าที่relationว่าง Guardtimestamp/ค่าเดิมทุกupdate; lint/offline/refresh SQL dry-run rollback/seed SQL dry-run rollback/DB readbackผ่าน Snapshot/rollbackพร้อม รายงาน docs/REALISTIC-DATA-RESULT.md รอUAT ไม่มีAPI/login/commit/push
