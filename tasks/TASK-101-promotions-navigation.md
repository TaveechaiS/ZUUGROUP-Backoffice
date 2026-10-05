# TASK-101 — ย้ายหมวดโปรโมชัน & ของแถม

สถานะ IMPLEMENTED / WAITING_FOR_UAT; เจ้าของอนุมัติ 5 ตุลาคม 2569. ESLint navigation.ts และ diff whitespace ผ่าน; ยังไม่ตรวจหน้าจอหลัง login.

## แผนย่อย

1. บันทึกข้อยืนยันใน tasks/ACTIVE.md, ไฟล์นี้, docs/specs/2026-09-23-1550-project-specs.md และ docs/plans/2026-09-23-1635-project-plan.md.
2. เปลี่ยนเฉพาะ section ของ /promotions ใน src/config/navigation.ts จากการเงินเป็นจัดการข้อมูล.
3. ตรวจ ESLint navigation.ts และ diff whitespace. ไม่แก้ URL/ชื่อ/ไอคอน/หน้าจอ/API/DB/สิทธิ์หรือกฎธุรกิจ ไม่ commit/deploy.

## ⚠️ ต้องทดสอบโดยคุณ

เปิด Side หลักทั้งคอมและมือถือ: โปรโมชัน & ของแถมต้องอยู่หมวดจัดการข้อมูลเพียงครั้งเดียว และไม่อยู่หมวดการเงิน. กดแล้วเปิด /promotions เดิม; ย่อเมนูแล้วไอคอนยังเปิดหน้าเดิมได้.
