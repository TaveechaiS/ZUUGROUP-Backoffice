# TASK-112 — Side รองเอกสารขาย

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติ 5 ตุลาคม 2569.

ผลตรวจ: ESLint 3 ไฟล์, route checks 74 หน้า และ diff whitespace ผ่าน. TypeScript ติดปัญหา Prisma เดิม managerId/salesId/productLot 3 จุด. ยังไม่ได้ตรวจภาพหลัง login; คงฟอร์ม/ตาราง/ธุรกรรมเดิม. Tabsรายละเอียดและการชำระยังไม่ implement. ไม่ commit/deploy.

## ลำดับ/ผลลัพธ์/ไฟล์

1. tasks/ACTIVE.md, ไฟล์นี้ และ Project Specs/Plan บันทึกข้อยืนยัน.
2. src/config/navigation.ts เพิ่ม /quotes/create และ /orders/create เป็น Side รองใต้หมวดเดิม.
3. src/components/layout/sales-document-secondary-sidebar.tsx: รายการ/สร้างล่างสุด พร้อม active หน้า list/detail/create ใช้ SecondarySidebarFrame. สร้าง quotes แสดง Admin; orders แสดง Admin/Sales ตามสิทธิ์เดิม.
4. src/components/layout/admin-shell.tsx: แสดง Side รองและ Header หมวดใบเสนอราคา/คำสั่งซื้อ.
5. ตรวจ ESLint/types/routes/diff. ไม่แก้ filter/ตาราง/ฟอร์ม/รายละเอียด/API/DB/การจอง/อนุมัติ/ตัดยอด. Tabsรายละเอียด/ของแถม/ประวัติเป็นแผนรอบถัดไป และชำระยังพัก ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

- เปิดใบเสนอราคา/คำสั่งซื้อ: Side รองรายการและสร้างล่างสุดตามสิทธิ์.
- กดสร้าง: เปิดฟอร์มเดิมและเลือกเมนูสร้าง; กลับรายการได้.
- เปิดรายละเอียด: Header คงหมวดและเลือกเมนูรายการ.
- ย่อ/ขยาย/เลื่อนบนคอมและมือถือ: Side รองยังค้างใต้ Topbar และกดได้.
- Admin เห็นสร้างทั้งสอง; Sales เห็นสร้างคำสั่งซื้อ แต่ไม่เห็นสร้างใบเสนอราคาตาม guard ปัจจุบัน. ไม่เปลี่ยนสิทธิ์เดิม.
