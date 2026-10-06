# TASK-240 — พับกล่องสร้างลูกค้า — 6 ตุลาคม 2569

OWNER_APPROVED: เปิดเริ่มต้นเฉพาะกล่องแรก (ข้อมูลทั่วไป) อีก8กล่องเริ่มพับและกดเปิด/ปิดได้.

IMPLEMENTED / WAITING_FOR_UAT: open={index === 0} และถอนopenของประวัติแล้ว. ScopedESLint/diff-checkผ่าน. ไม่มีbrowserตรวจภาพจริง.

ลำดับและไฟล์: บันทึกACTIVE/Specs/Plan/taskนี้ → customers/create/page.tsx กำหนดopenเฉพาะindex0และถอนopenประวัติ → scopedESLint/diff. ไม่เปลี่ยนfieldsหรือข้อบังคับ/ไม่API/DB.

⚠️ ต้องทดสอบโดยคุณ: เปิดหรือรีโหลด /customers/create ต้องเห็นเฉพาะข้อมูลทั่วไปเปิดอยู่ หมวดอื่นพับไว้ กดชื่อหมวดหรือใช้คีย์บอร์ดEnter/Spaceเพื่อเปิดปิดได้.
