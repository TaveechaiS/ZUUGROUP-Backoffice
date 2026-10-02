# TASK-075

สถานะ: READY_FOR_USER_TEST

อนุมัติ “ok ปรับ” ตามรายงานชื่อ field API 2026-10-02
Specs: docs/specs/2026-10-02-api-field-names.md
Plan: docs/plans/2026-10-02-api-field-names-plan.md
ขอบเขต: types/services/handlers/pages/CSV/Postman/docs/offline tests สำหรับชื่อฟิลด์และ nested relations ไม่มี DB migration/live requests

ผล: ปรับครบตามขอบเขต; type-check/lint/build/diff และ 5ชุดทดสอบ offline ผ่าน วันที่ ISO/null จัดแสดงไทยที่ UI/CSV ไม่มี alias เก่าในข้อมูลที่แก้ ส่วน settings.value เป็นฟิลด์จริงและ stock-counts.warehouseId เป็นชื่อจริงจึงคงไว้ Login contract ภายนอกเดิม

คู่มือตรวจรับ: docs/TEST-API-FIELD-NAMES.md ไม่มี live HTTP/login/DB mutation, ไม่มี Cloudsync/commit/push
