# TASK-181 — ย้าย ProductStockList เข้า page

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Task181 บันทึกคำสั่งย้ายโค้ดตารางสินค้าจากcomponentเข้าroute.
2. src/app/products/page.tsx: เก็บตาราง/state/loading/paging/tabในpage ใช้Pagination/StatusBadge/Loading/RequestState/moneyส่วนกลางต่อ.
3. src/app/products/stock/[warehouse]/page.tsx: เก็บตารางคลังในpage ไม่importpageรายการหรือcomponentเฉพาะหน้าใหม่. layout.tsxใหม่เก็บserverguardคลังเดิม; pageอ่านชื่อคลังจากuseParamsแล้วส่งให้ฟังก์ชันตารางในไฟล์เดียว ไม่เพิ่มfieldให้RouteDataProvider.
4. ถอนsrc/components/operations/product-stock-list.tsxหลังไม่เหลือimport.
5. Format/lint/type/build/diff. ไม่API/DBหรือintegrationที่เขียนข้อมูลซ้ำ.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: ย้ายโค้ดครบสองpageและถอนcomponentเดิมแล้ว ไม่มีimportproduct-stock-list. Prettier/ESLint/production build/TypeScript/git diff --checkผ่าน. TypeScriptรอบก่อนbuildเจอtypesrouteเก่าของNext; หลังbuildสร้างtypesใหม่ผ่านแล้ว. ไม่มีAPI/DB/commit/deploy ไม่ได้ตรวจคลิกbrowserในรอบนี้.

เปิดรายการสินค้า สลับทั้งหมด/ใกล้หมด/หมดและเปลี่ยนหน้า ต้องโหลดข้อมูลเหมือนเดิม. เปิดคลังหลัก/การตลาด/รอทำลาย ต้องแสดงยอดคลังที่เลือกเหมือนเดิม. เส้นคลังชื่อไม่ถูกต้องต้อง404.
