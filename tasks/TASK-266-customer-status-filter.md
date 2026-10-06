# TASK-266 — ตัวกรองสถานะลูกค้า — 7 ตุลาคม 2569

OWNER_APPROVED: เพิ่มตัวกรอง สถานะ ในการ์ดตัวกรองหน้าลูกค้า.

ไฟล์: src/server/customers/service.ts (param licenseStatus + filters.licenseStatuses), src/types/api/customers.ts, src/app/customers/page.tsx (select สถานะ ช่องที่ 4, แสดงทั้งหมดล้างทุกตัวกรอง; การ์ด 4 ช่องบนจอใหญ่ 2 ช่องบนแท็บเล็ต 1 ช่องมือถือ), scripts/test-customer-full.mjs, scripts/build-postman-customers.mjs + Postman local, API-CONTRACTS.

ผล: IMPLEMENTED / WAITING_FOR_UAT. test-customer-full 10 checks ผ่าน (รวมกรองสถานะ/ยังไม่ระบุ), tsc/eslint ผ่าน.

⚠️ ต้องทดสอบโดยคุณ: เปิด /customers ตัวกรองมี ค้นหา/เขตขาย/จังหวัด/สถานะ; เลือก ผ่าน เหลือเฉพาะป้ายเขียว, ยังไม่ระบุ เหลือป้ายเทา; ใช้ร่วมกับเขต/จังหวัดได้; ไม่พบแล้วกด แสดงทั้งหมด ต้องล้างทุกตัวกรอง.
