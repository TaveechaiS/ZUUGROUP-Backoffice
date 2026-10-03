# TASK-086 — วางแผน GET Dashboard API

สถานะ: DEFERRED — เจ้าของขอค่อยทำเมื่อ 2026-10-03

เจ้าของขอแผน 2026-10-03: API เฉพาะ Dashboard ใช้ GET อ่านข้อมูลสำหรับจัดหน้า.

ตรวจแล้ว: endpoint มีอยู่และหน้า Dashboard เรียกใช้อยู่; service/types ยังอยู่ในกลุ่ม reports. API ปัจจุบันสาธารณะ; Specs กำหนดข้อมูลตาม Role และรายละเอียด scope ยังรอข้อมูลจริง.

ขอบเขตในรอบนี้: Specs/Plan/Task/ACTIVE และลิงก์จากเอกสารหลัก. จัด [Specs](../docs/specs/2026-10-03-dashboard-read-api.md) และ [แผนย่อย](../docs/plans/2026-10-03-dashboard-read-api-plan.md) แล้ว; รอเลือกชุดข้อมูล/สิทธิ์และอนุมัติก่อน source changes.

ข้อเสนอ: ใช้ GET /api/dashboard เดิม, แยก service/types, counts/activity เดิมเป็น MVP, statusSummary/trends เป็นตัวเลือก. ใช้ try/catch/status/no-store และยืนยันสิทธิ์ก่อนอ่านข้อมูลตามข้อตกลง. ไม่เริ่ม DB/implementation/commit/deploy ในรอบวางแผนนี้.

ผลตรวจเอกสาร: เทียบ route/service/types/schema/ผู้เรียก/Postman จริงแล้ว; diff-check ผ่าน. Route มี GET และ try/catch เดิมแต่ยังไม่มี auth. แผนระบุ method เขียนตอบ 405 และ HEAD/OPTIONS เป็น metadata ของ Next.js ตามคู่มือ local. รอคำตอบชุดข้อมูลและสิทธิ์; ไม่ถือว่าข้อเสนอ Admin-only หรือกราฟได้รับอนุมัติแล้ว.
