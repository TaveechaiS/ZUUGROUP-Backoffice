# TASK-117 — ล้างรายการ Postman ที่เลิกใช้

สถานะ COMPLETED / WAITING_FOR_UAT; เจ้าของสั่ง 5 ตุลาคม 2569.

## ผลตรวจ

Cloud และ local เหลือ 115 requests/21 folders หลังลบ 18 เป้าหมาย. อ่าน Cloud กลับแล้ว retained items ตรงเดิมทุกฟิลด์ ยกเว้น updatedAt ของโฟลเดอร์ orders; auth/variables/events คงเดิม. Local deep comparison กับ backup หลังกรองเฉพาะเป้าหมายผ่าน. ชุด authenticated คง 24 คำขอ. Backup local-backups/TASK-117-cloud-before.json และ TASK-117-local-before.json ที่ ignore. diff whitespace ผ่าน. ไม่ส่ง API ธุรกิจ/ล็อกอิน/แก้ backend/DB/commit/deploy.

## ลำดับและไฟล์

1. ACTIVE/Specs/Plan/Task ระบุขอบเขต; ตรวจ Collection Cloud Zuugroup ID เดิมและ local.
2. สำรอง Cloud/local ใน local-backups ที่ ignore ก่อนแก้.
3. ลบ customer-groups 8, billing 8, orders deleted/restore 2 จาก Cloud และ postman/Zuugroup.postman_collection.json. ชุด authenticated คงเดิม.
4. ตรวจ JSON/ID/จำนวนรายการ และอ่าน Cloud กลับเทียบรายการที่เก็บรวม auth/variables/scripts. ปรับ postman/README.md และ docs/API-NAME-GUIDE.md ให้แสดงรายการปัจจุบัน.

เกณฑ์: เหลือ 115 requests/21 folders; 18 รายการเป้าหมายหาย รายการอื่นเดิมครบ. ไม่เปลี่ยน code API หรือ DB ไม่ Send/login/run collection.

## ⚠️ ต้องทดสอบโดยคุณ

Refresh Collection Zuugroup ใน Postman: customer-groups และ billing หาย; orders ไม่มี deleted/restore เดิม. Login และโมดูลที่เก็บยังอยู่. ชุด authenticated 24 คำขอคงเดิม.
