# TASK-222 — ทดลองเขตขายในตั้งค่าระบบ

IMPLEMENTED / WAITING_FOR_UAT

1. บันทึกคำขอใน ACTIVE/Specs/Plan ก่อนแก้โค้ด.
2. src/config/navigation.ts: เขตขายเป็น secondaryOnly/parent settings; เพิ่มเขตซ่อนจากเมนูรองตั้งค่า ใช้ปุ่มในรายการ. คงURLเดิม.
3. settings-secondary-sidebar.tsx เพิ่มเขตขายต่อข้อมูลพื้นฐานสินค้า activeครอบคลุมสร้าง/รายละเอียด; admin-shell.tsx จัดหน้าทั้งชุดเป็นตั้งค่าระบบและrenderchildren ไม่แสดงSideรองเขตเดิม.
4. customers/territories/page.tsx ใช้ตารางเฉพาะเขต รหัส/ชื่อ/พื้นที่/Manager/Sales/ลูกค้า/สถานะ จากAPIเดิม พร้อมsearch/status/sort/paging10/20/50/100, error/retry/mobile. เพิ่มและคลิกแถวเปิดหน้าเดิม. ไม่เพิ่มสูตรรายงานหรือสถานะใหม่.
5. customers/territories/layout.tsx ตรวจ requireActiveUser สำหรับอ่าน โดยสร้าง/แก้ใช้Adminguard/APIเดิม. เพิ่ม/รายละเอียดเปลี่ยนชื่อUIเป็นเขตขาย รหัสเขต ชื่อเขต; รายละเอียดแสดงManager/SalesจริงจากAPI.
6. scoped ESLint/routes/type/diff และตรวจ render/เมนู/คอลัมน์/role. ไม่แก้API/DB/กฎOPENหรือseed.

ผลลัพธ์: ตั้งค่าระบบมีข้อมูลพื้นฐานสินค้า/เขตขาย เปิดหน้ารายการ/เพิ่ม/รายละเอียดได้ ข้อมูลจริงมาจากAPIเดิม. ไม่ย้ายคน/ปิดเขต/กำหนดสิทธิ์รายเขตใหม่ในงานนี้.

## ⚠️ ต้องทดสอบโดยคุณ

- Admin เปิดตั้งค่าระบบ → เขตขาย เห็นรายการจริงและTopbarตั้งค่าระบบ ไม่มีเขตในSideหลัก.
- ตรวจdesktop/mobile: ชื่อManager/Sales ไม่แสดงUUID, คอลัมน์สถานะใช้ป้ายกลาง, ลูกค้าแสดงจำนวนจริง, เขตไม่มีผู้รับผิดชอบแสดง —.
- ค้นหา/กรองสถานะ/sort/เลือก10/20/50/100 ต้องข้อมูลและจำนวนหน้าถูกต้อง.
- กดเพิ่มเขตเปิดหน้าแยก; กดแถวเปิดรายละเอียดพร้อมผู้รับผิดชอบ/รายชื่อลูกค้า; กลับรายการแล้วเมนูเขตขายยังถูกเลือก.
- หากจะทดลองบันทึก ใช้ข้อมูลที่เจ้าของต้องการเก็บจริง: บันทึกแล้วรีเฟรชต้องยังอยู่; Manager/Salesซ้ำเขตต้องถูกปฏิเสธตามAPIเดิม. ไม่ต้องแก้ข้อมูลเพื่อทดสอบหน้าตา.

## ผลตรวจ

Scoped ESLint/diff ผ่าน. Route checks77และfieldsets14ผ่าน. Actual-component VM ตรวจเมนูตั้งค่า/active list-create-detail/Shellchildren/คอลัมน์7ช่องscope col/ManagerSalesชื่อจริง/pageSize20-total43=3pages/Admincreatevisibilityผ่าน. TypeScriptยังติดgenerated route typesและPrisma details/codeGroupIdที่พบก่อนงานนี้. CUAไม่มีbrowserและเปิดiabไม่ได้ จึงยังไม่ตรวจภาพจริง. ไม่writeDB/schema/API/role/กฎOPENใหม่.
