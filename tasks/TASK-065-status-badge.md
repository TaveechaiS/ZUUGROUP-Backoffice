# TASK-065 — ปรับดีไซน์ป้ายสถานะ

- สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติ 2026-10-02 พร้อม bg50/text600 ทุกสถานะ
- Branch: AI
- Specs: docs/specs/2026-10-02-status-badge.md
- Plan: docs/plans/2026-10-02-status-badge-plan.md

เจ้าของขอ UI status pill ตามภาพและยืนยันทุกสถานะรวมร่าง/ระงับ/มี/ไม่มี. ทำcomponentกลางแทนstyleซ้ำ users/products/sharedlists/detail/Dashboard;ไม่เปลี่ยน business logic/DB.

ทำแล้ว: StatusBadgeกลาง mappingemerald/orange/red/blue/slate bg50/text600, dotcurrentColor, fallbackเทาสำหรับlabelไม่รู้จัก. ใช้ในทุกจุดตามขอบเขตและเก็บข้อความเดิม. ลบ regexStatusPill ที่เคยจับผิดปกติเป็นปกติ. type-check/lint/diff-check ผ่าน; ไม่ทดสอบHTTPหรือหน้าจอจริง. งาน stylingไม่เพิ่มunit test/buildซ้ำโดยไม่มีความเสี่ยงใหม่. รอเจ้าของตรวจหน้าจอ.

## ⚠️ ต้องทดสอบโดยคุณ

งานหัวคอลัมน์: users/products/sharedlistมีหัว“สถานะ”พร้อมscope=col;แก้desktop RecordTableRow ที่ตกหล่นให้ใช้StatusBadge. Sharedmobileมีlabelสถานะ และdeletedcardมีป้ายลบแล้ว. อัปเดตมาตรฐานถาวรในAGENTS/คู่มือ. ตรวจtype-check/diff-checkผ่าน;เจ้าของตรวจdesktop/mobile.

งานต่อมาตรฐานถาวร: ตรวจป้ายสถานะทั้งsrcและเปลี่ยนModulePlaceholderที่เหลือแล้ว. เพิ่มAGENTS.mdข้อ14และdocs/STATUS-BADGE-GUIDE.mdให้สถานะใหม่ใช้componentกลางเสมอ. คำอธิบาย/ปุ่ม/selectคงเป็นcontrolsเดิม. type-check/lint/diff-checkผ่าน;รอเจ้าของตรวจหน้าจอ.

หลังทำ: เปิดรายการและรายละเอียดผู้ใช้/สินค้า/ข้อมูลรายโมดูล;เห็นพื้นอ่อน มุมมน จุดสีและlabelเดิม. Activeเขียว, ระงับ/ลบแดง, รอส้ม, ร่างเทา. ไม่เปลี่ยนข้อความเป็นสถานะยอดคลังโดยไม่มีข้อมูล.
