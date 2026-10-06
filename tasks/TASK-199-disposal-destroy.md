# TASK-199 — ปุ่มทำลายแล้วรายล็อต

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. บันทึก ACTIVE/Specs/Plan ขอบเขตที่เจ้าของอนุมัติ.
2. service.ts destroy เดิมcommandtransaction ใช้balance lock/warehouse DISPOSAL/expectedQuantity/reserved/duplicate; update0และmovement/audit. stockSelect disposalDestroyed flag persist; operations types และ StatusBadge mapping กลาง.
3. products/[id]/page.tsx local LotHistory ใช้routeAdmin; currentOnly DISPOSAL action column, confirmรายละเอียดล็อต/จำนวน, Post+SuccessAlert; pendingpayload/keyfreezeเมื่อผลไม่แน่ชัด, 4xxปลดล็อก. After successปรับbalanceที่destroy0/read flag/disabledแถวเดิม; refresh historyอ่านflagจริง.
4. lint/type/mock APIrejectwrongwarehouse/changedquantity/reserved/duplicate, validupdateledger, retrykeyและUIsuccess/cancel/disabled. ไม่มี DBwriteจริงในการทดสอบ.

⚠️ ต้องทดสอบโดยคุณ: กดทำลายแล้วยืนยัน ต้องแจ้งสำเร็จ/แสดงทำลายแล้วกดซ้ำไม่ได้ ยอดDISPOSALเป็น0และจำนวนล็อตลด1หลังเปิดใหม่ ประวัติต้องยังเห็นทำลายแล้ว. กดยกเลิกdialogยอดต้องเดิม.

ผลตรวจ: scoped ESLint/TypeScript/diffผ่าน. UI VMmock confirm cancelไม่POST, disposal expectedqty, 503/cancel/retrykeyเดิม, successalert/ยอดDISPOSAL0/ยอดคลังอื่นเดิม/ไม่มีปุ่มทำซ้ำผ่าน. Service mockrejectrole/warehouse/reserved/changedqty/unconfirmedก่อนwrite, mockupdate0/ledger/audit, retrykeyเดิมไม่writeซ้ำและfreshkeyduplicate409ผ่าน. SQLอ่านmarker/ตรวจCHECKเท่านั้น ไม่ทำลายข้อมูลจริง ไม่schema และยังไม่ได้ตรวจbrowser.
