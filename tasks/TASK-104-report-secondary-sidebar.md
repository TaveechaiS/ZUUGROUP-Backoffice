# TASK-104 — Side รองรายงานยอดขายและคลังสินค้า

สถานะ NAVIGATION_IMPLEMENTED / REPORT_DATA_PENDING / WAITING_FOR_UAT; เจ้าของอนุมัติ 5 ตุลาคม 2569.

ผลตรวจ: ESLint ไฟล์ที่เกี่ยวข้อง, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ยังติดปัญหาเดิม managerId/salesId/productLot 3 จุดจาก generated Prisma Client. ยังไม่ได้ตรวจภาพหลัง login. หน้ารองใหม่เป็นโครงรอข้อมูล ไม่ใช่รายงานตัวเลขพร้อมใช้งาน; เนื้อหาเดิมเก็บที่ legacy. ไม่มี API/DB ใหม่ ไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. บันทึกใน tasks/ACTIVE.md, ไฟล์นี้, Project Specs/Plan.
2. src/app/reports/sales/page.tsx และ inventory/page.tsx: เปิดหน้าสรุปใหม่ เก็บเนื้อหาเดิมที่ legacy/page.tsx ทั้งสองหมวด ไม่แก้ filter/ตารางภายในเนื้อหาเดิม.
3. src/config/navigation.ts: เพิ่ม Side รอง 5 รายการต่อหมวด. src/components/layout/report-secondary-sidebar.tsx และ admin-shell.tsx: การเลือกหมวด/หน้ารองตามรูปแบบเดิม.
4. หน้ารอง sales/{summary,products,customers,sellers,details}/page.tsx และ inventory/{summary,movements,expiry,low-stock,counts}/page.tsx: ระบุรอข้อมูล/ข้อกำหนด ไม่มีตัวเลขสมมติ ไม่มี filter/ตารางใหม่/API/DB/การรับชำระ.
5. ตรวจ ESLint/TypeScript/routes/diff แล้วเจ้าของตรวจคอม/มือถือ. ไม่ commit/deploy.

หน้ารายงานจริงเป็นงานถัดไปหลังยืนยันนิยามยอดขาย/วันอ้างอิง/การคืน/สูตร/สิทธิ์และแผนข้อมูล ไม่ถือว่าโครงเมนูคือรายงานพร้อมใช้งาน.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดรายงานยอดขาย/คลัง: เห็น Side รองอย่างละ 5 รายการตาม Specs และเลือกหน้าสรุป.
- กดแต่ละรายการ: เปิดหัวข้อถูกต้องพร้อมข้อความรอข้อกำหนดหรือข้อมูล ไม่มีตัวเลขรายงานจำลอง.
- หน้าสรุปกดเปิดข้อมูลเดิมได้: รายการคำสั่งซื้อ/ข้อมูลหลักสินค้าและ filter/ตารางเดิมยังอยู่.
- ไม่มีเมนูเพิ่มรายงาน/Tab ใหม่; ย่อ Side หลักและมือถือยังเข้าถึงเมนูได้.
