# TASK-193 — เปิด ID จากทั้งแถวประวัติเติมสต็อก

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. บันทึก ACTIVE/Specs/Plan และแผนย่อยนี้.
2. แก้ src/app/products/stock/page.tsx เพิ่ม router และ onClick/onKeyDown/tabIndex/hover/focus ในแถวเดิม คง semantic table และลิงก์เดิม.
3. ตรวจ scoped ESLint/TypeScript และ mock คลิกพื้นที่แถว/Enter/Space ไป lot.id ที่ถูกต้อง คลิกลิงก์ไม่เรียก row navigation.

⚠️ ต้องทดสอบโดยคุณ: คลิกช่องวันเวลา/จำนวน/ต้นทุนของแถว ต้องเปิดรายละเอียดรายการนั้น; Tab มาที่แถวแล้ว Enter/Space ต้องเปิดได้ และลิงก์สินค้ายังไปข้อมูลสินค้า.

ผล: scoped ESLint/TypeScript/diff ผ่าน; mock click สองแถวไป lot.id ของแต่ละแถว, Enter/Space/preventDefault, nested link guard ผ่าน. ไม่เขียน API/DB และยังไม่ได้ตรวจเบราว์เซอร์.
