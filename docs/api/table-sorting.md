# การเรียงข้อมูลตาราง

GET รายการรองรับ `sortBy` และ `sortDirection=asc|desc`. ถ้าไม่ส่งใช้ลำดับเดิมของ API. API เรียงก่อน `offset`/`limit` และใช้ ID เป็นตัวตัดสินเมื่อค่าเท่ากัน; total/filters ไม่เปลี่ยนเพราะ sort. ชื่อคอลัมน์ ทิศทาง และพารามิเตอร์ซ้ำที่ไม่รองรับคืน 400 ไม่ใช้ข้อความจาก client เป็น SQL identifier.

ตัวอย่าง: `/api/inventory?view=products&warehouseCode=MAIN&sortBy=lotCount&sortDirection=desc&offset=0&limit=10`

| รายการ | sortBy |
| --- | --- |
| Records และรายงานที่อ้าง Records | field key ใน registry ของโมดูล; createdAt/updatedAt; memberCount สำหรับกลุ่มลูกค้า/เขต; managerName/salesName สำหรับลูกค้า/เขต; territoryName สำหรับลูกค้า |
| Inventory products | code, name, categoryName, unit, salePrice, quantity, lotCount, status, marketingDays |
| Inventory lots/receipt-items | receiptCode, lotNumber, productName, productCode, createdAt, manufacturedOn, expiresOn, receivedQuantity, condition, quantity, reserved, available, warehouseName, disposalDestroyed; totalCost/unitCost เฉพาะ ADMIN/ACCOUNTING_CFO |
| Inventory movements | occurredAt, productName, lotNumber, warehouseName, quantity, kind, actorName |
| Orders รายการ | code, customerName, territoryName, createdAt, amount, status |
| Users รวม export | name, employeeCode, email, team, status, lastLoginAt, deletedAt, role |
| Audit logs | occurredAt, action, actor, actorRole, target, requestId |
| Product options | code, name, active |
| Products API | name, code, categoryId, dosageFormId, unit, salePrice, status |
| Product edit history | occurredAt, actorName |
| รายงาน inventory legacy | name, code, category.name, dosageForm.name, unit, status |

`status` ใน Inventory products เรียงกลุ่มหมด/ใกล้หมด/อื่นตามยอด MAIN; `marketingDays` ใช้วันหมดอายุต่ำสุดของล็อตที่ MARKETING ยังมียอด. การเรียง view ไม่เปลี่ยน FEFO/การเลือกล็อต/ธุรกรรม. ไม่รองรับ sort ใหม่นี้ใน API stock/receipts เก่าที่ไม่ได้ใช้เป็นตาราง; รายงานรับเข้าปัจจุบันใช้ receipt-items.

UI ใช้ `src/components/ui/sortable-table.tsx`: ตารางแบ่งหน้าส่ง controlled sort และ allowlisted columns; ตารางรายละเอียดที่โหลดครบใช้ local sorter. คอลัมน์จัดการ/ปุ่มและราคาต้นทุน placeholder ไม่ให้ sort. เริ่มสีดำ เลือก asc ลูกศรขึ้นสีน้ำเงิน เลือก desc ลูกศรลงสีน้ำเงิน อีกทิศเป็นเทา; มี aria-sort และปุ่มรองรับคีย์บอร์ด. หน้าที่ mobile เป็นการ์ดใช้ TableSortControls กลางร่วม state เดียวกัน.
