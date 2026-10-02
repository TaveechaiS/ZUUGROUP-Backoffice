# TASK-064 — API pagination ทุกหน้ารายการ

- สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติให้ทำ 2026-10-02 หลังตรวจหน้าที่ขาด
- Branch: AI
- Specs: docs/specs/2026-10-02-api-pagination.md
- Plan: docs/plans/2026-10-02-api-pagination-plan.md

เจ้าของขอทำ pagination ผ่าน API โดยคง design เดิม. ขอบเขต users/products/audit และตรวจ shared lists/reports ที่มีอยู่; full filtered CSV คงเดิมผ่าน endpointแยก. รอบนี้จัด contract/เอกสาร ยังไม่แก้โค้ดจนอนุมัติ.

## ผลตรวจซ้ำ 2026-10-02

ตามคำขอ “ไล่เช็ค pagination” ตรวจโค้ดปัจจุบัน ยังไม่มี implementation ของ TASK-064:

- `/products`: ไม่มีปุ่ม pagination; page/service/API ดึงสินค้าทั้งหมดแล้วกรองใน browser
- `/users`: UI แบ่ง10ด้วย slice แต่ page และ GET /api/users ดึงผู้ใช้ทั้งหมด
- `/audit-logs`: มี pagination จริงที่ DB skip/take/count หน้า20รายการ อ่านด้วย server page; ยังไม่มี REST /api/audit-logs ไม่ตรงข้อกำหนด API10
- shared ModuleListPage 18 URL: `/customers`, `/customers/list`, `/customers/groups`, `/customers/territories`, `/customers/documents`, `/customers/dashboard`, `/suppliers`, `/purchases`, `/expenses`, `/quotes`, `/orders`, `/promotions`, `/billing`, `/stock-counts`, `/settings`, `/reports/sales`, `/reports/inventory`, `/reports/finance` มี API limit10/offset และปุ่มก่อนหน้า/เลขหน้า/ถัดไป desktop/mobile รวมแท็บลบแล้ว
- shared list ต้องตรวจกรณีจำนวนหน้าลดหลังลบ/กู้คืน: currentPage ยังไม่ได้ clamp ตาม total ใหม่ อาจค้างหน้าว่าง
- Dashboard เป็นรายการล่าสุด10และ design-preview เป็นหน้ารวมลิงก์ ไม่ใช่หน้ารายการทั้งหมด จึงไม่รวมเป็นหน้าขาด pagination

รอบนี้ตรวจ source code ไม่ทดสอบ HTTP/DB/หน้าจอจริงและไม่แก้ code โดยแผน/Specs TASK-064 ยังคง PLANNING รออนุมัติ

## ⚠️ ต้องทดสอบโดยคุณ

ผล implementation: users/products/audit อ่าน API10 และ count/list DB transaction RepeatableRead filter ฝั่ง DB ไม่มีเต็มตาราง props/slice แยก products/filters, audit/filters และ users/export คงCSVครบตามfilter Admin และ public default10 shared lists clamp/abort guard ใช้ดีไซน์เดิม เพิ่ม local Postman request/คู่มือแล้ว

ตรวจผ่าน: type-check, lint, build และ node scripts/test-pagination.mjs (offline DB stub) ไม่ยิง live API/login ไม่เปลี่ยน schema/seed ไม่ commit/push/Cloud sync ตรวจจริงตาม docs/TEST-API-PAGINATION.md

ไฟล์เพิ่มเติมตามแผน: src/service/use-paginated-list.ts, src/components/ui/list-request-state.tsx, src/components/ui/pagination-controls.tsx, scripts/test-pagination.mjs และ docs/TEST-API-PAGINATION.md

หน้าที่มี15รายการต้องได้หน้าแรก10/หน้าถัดไป5. Network เห็น limit10/offset0,10 ไม่ส่งข้อมูลทั้งหมด. เปลี่ยน search/filter/tab ต้องกลับหน้า1, count/emptyถูกต้อง. Roleอื่นอ่าน users/audit/deleted productsไม่ได้; CSVผู้ใช้คงส่งออกทุกแถวตามfilter.
