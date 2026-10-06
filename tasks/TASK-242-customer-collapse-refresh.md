# TASK-242 — พับทุกหมวดยกเว้นแรก — 6 ตุลาคม 2569

เจ้าของย้ำข้อมูลติดต่อ ภาษี ที่อยู่จัดส่ง และหมวดอื่นทั้งหมดต้องพับ ยกเว้นข้อมูลทั่วไป.

IMPLEMENTED / WAITING_FOR_UAT: เปลี่ยนkeyของกล่องแล้ว คงopenเฉพาะindex0. ScopedESLintผ่าน ไม่มีbrowserQA.

ตรวจพบopen={index === 0}ถูกต้องอยู่แล้ว; DOM native detailsอาจคงopenเก่าระหว่างFastRefresh. เปลี่ยนkeyเพื่อสร้างDOMกล่องใหม่หลังปรับโค้ด รวมประวัติ. ไม่บังคับปิดซ้ำหลังผู้ใช้กดเปิด.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customers/create/page.tsx keyของdetails → scopedlint → UAT. ไม่DB/API/เปลี่ยนfields.

⚠️ ต้องทดสอบโดยคุณ: รีโหลด /customers/create ต้องเปิดเฉพาะข้อมูลทั่วไป อีก8หมวดพับและกดเปิดได้.
