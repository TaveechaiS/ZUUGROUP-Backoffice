# แผนย่อย TASK-086 — Dashboard GET API

สถานะ: DRAFT / DEFERRED — เจ้าของขอค่อยทำเมื่อ 2026-10-03; เมื่อกลับมาทำต้องเลือก contract/สิทธิ์และอนุมัติก่อน implementation

## ลำดับงาน

1. ตรวจ source/API/types/หน้า Dashboard เดิม และบันทึกข้อเสนอใน [Specs](../specs/2026-10-03-dashboard-read-api.md). รอบนี้ทำเอกสารเท่านั้น.
2. เจ้าของเลือกชุดข้อมูล A/B และสิทธิ์รอบแรก. ระบุ fields/query/response ที่แน่นอน; ลงข้อสรุปใน Specs/Plan/Task ก่อนเริ่ม code.
3. แยก Dashboard types ไป `src/types/api/dashboard.ts`; เปลี่ยน imports ผู้ใช้เดิมพร้อมกัน. แยก reader ไป `src/server/dashboard/service.ts`; reports เก็บงานรายงานตามเดิม.
4. เพิ่ม `src/server/validation/dashboard.ts` สำหรับ include/activityLimit ตาม contract ที่อนุมัติ. อ่าน count/รายการล่าสุดด้วย query มีขอบเขต ไม่โหลดทุกแถวมา aggregate ใน browser. ใช้ read-only transaction เมื่อจำเป็นให้ summary/activity สอดคล้องกัน.
5. ปรับ `src/app/api/dashboard/route.ts`: GET เท่านั้น, auth/ขอบเขตที่อนุมัติ, try/catch, status ที่ถูกต้อง และ no-store. ไม่เปลี่ยน auth provider หรือ API โมดูลอื่น.
6. ปรับ `src/app/page.tsx` ให้เรียก GET เดียวและใช้ fields ตรงกัน; คงรูปแบบ UI ล่าสุด Loading/error/retry/StatusBadge และ Poppins. ถ้าชุด B ให้ตกลงรูปกราฟก่อนเพิ่ม UI.
7. อัปเดต catalog/คู่มือและคำขอ Dashboard ใน Postman เดิม. แก้ไฟล์ local ก่อน; การ sync cloud ต้องได้รับอนุมัติแยก.
8. ตรวจ type-check/lint/build และ offline tests ที่มีความหมาย: validation, aggregate meanings, empty data, ordering, role scoping/error statuses. ใช้ฐานข้อมูลทดสอบหรือ fixture ใน tests สำหรับการเทียบผล ไม่เพิ่ม mock ใน production API. นัดเจ้าของ UAT และบันทึกผล.

## ไฟล์ที่จะเปลี่ยนเมื่ออนุมัติ

- เพิ่ม: `src/types/api/dashboard.ts`, `src/server/dashboard/service.ts`, `src/server/validation/dashboard.ts` และชุด tests ที่เหมาะกับ contract.
- ปรับ: `src/types/api/reports.ts`, `src/server/records/reports.ts`, `src/app/api/dashboard/route.ts`, `src/app/page.tsx`.
- ตรวจและปรับจุดอ้างอิง: `src/app/api/route.ts`, registry/catalog ถ้ามี, `docs/API-CONTRACTS.md`, `docs/API-NAME-GUIDE.md`, collections เดิมใน postman และสคริปต์ตรวจ API/types ที่อ้าง Dashboard.
- เอกสาร: Specs/Plan นี้, Project Specs/Plan, TASK-086/ACTIVE.

## ผลลัพธ์

API GET สำหรับ Dashboard มี contract/service/types ของตนเอง. หน้าจอได้ข้อมูลสรุปที่พร้อมใช้จากเส้นเดียวและตรวจสิทธิ์บน server ตามข้อตกลง. ไม่เกิดการเขียนข้อมูลจากการเปิด Dashboard.

## วิธีตรวจรับ

เทียบจำนวนกับข้อมูลต้นทางที่ไม่ลบ, ตรวจ activityLimit ไม่เปลี่ยน counts, วันที่ ISO/แสดง พ.ศ.กรุงเทพฯ, กรณีไม่มีข้อมูล/error/retry และสิทธิ์ทุก Role ที่เปิด. ลอง POST/PATCH/DELETE ต้อง 405 และข้อมูลเดิมไม่เปลี่ยน. ชุด B ต้องตรวจกราฟ/status totals ตรงกับข้อมูลและช่วงเวลาเดียวกัน.

งานที่ยังไม่พร้อมเริ่ม: ยอดเงินเชิงธุรกิจ สต็อก/Lot/กำไร/ลูกหนี้ และขอบเขต Role ที่ยังไม่มีคำยืนยัน. ไม่ให้ข้อเสนอในเอกสารนี้ปิดกฎ OPEN โดยอัตโนมัติ.
