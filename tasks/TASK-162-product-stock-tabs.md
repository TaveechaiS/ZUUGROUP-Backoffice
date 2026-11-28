# TASK-162 — สินค้าหมดและใกล้หมด

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: SQLfilterquantityร่วมdata/countและป้ายUIตามquantityแล้ว. ESLint/diffผ่าน; SSRfixture0/1/50/51ที่mainAvailableสวนทางและSQLsourcecontractผ่าน. ยังไม่ทดสอบAPIกับDBจริงหรือbrowser ไม่เปลี่ยนข้อมูลจริง.

1. บันทึกcontractในSpecs: quantity0หมด, 1–50ใกล้หมด, >50ไม่มีป้าย.
2. operations/service.ts SQLfilterใช้quantityแทนmainAvailable ในwhereร่วมdata/countก่อนpagination.
3. product-stock-list.tsxแสดงStatusBadgeตามquantityเดียวกัน คงลบแล้ว.
4. ตรวจlint/boundary/sourcecontract/diff. ไม่ทำDBmutation.

ไฟล์: operations/service.ts, product-stock-list.tsx, ACTIVE/Specs/Plan/Taskนี้.

ตรวจรับ: หมดทุกแถวคงเหลือ0/ป้ายหมด; ใกล้หมดทุกแถว1–50/ป้ายใกล้หมด ไม่รวม0หรือ51; paginationนับตามfilter; ทั้งหมดค่า0/1/50/51ป้ายตรง. ไม่มีของคงเหลือจริงให้ทดสอบครบอาจต้องเตรียมfixtureที่อนุมัติภายหลัง ไม่เปลี่ยนของจริงเอง.
