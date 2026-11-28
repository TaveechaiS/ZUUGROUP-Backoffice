# Checkpoint — 5 ตุลาคม 2569 รอบ2 (Asia/Bangkok)

Branch AI; จุดก่อนหน้า 8f065e8. เจ้าของขอ checkpoint. เก็บใน local Git เท่านั้น ดู hash จริงด้วย git log. ไม่มี push/deploy หรือ DB mutation ในการทำ checkpoint.

## งานที่เก็บ

- TASK139–146: ปรับช่องราคาต้นทุน/ราคา/ภาษี หมวดมีกรอบและย่อขยายเริ่มปิด ปุ่มขวาล่าง ถอน label ย่อยรหัสที่มองเห็น ใช้ SVG ลูกศร/opacity30 ถอน helper/comments และปรับพื้นที่ชื่อไทย/อังกฤษ.
- TASK147–148: สี่ตารางสินค้าทั้งหมด/MAIN/MARKETING/DISPOSAL มี7คอลัมน์ ไม่มีรูปเล็ก/จัดการ. AdminShell แสดง children จริงเฉพาะสี่หน้าที่อนุมัติ.
- TASK149: ลงข้อมูลตัวอย่างจริง12สินค้า28ล็อต950หน่วย. ALL12/950 MAIN9/835 MARKETING11/99 DISPOSAL8/16. Seedแยกเฉพาะสินค้าและรันซ้ำไม่เขียนทับ; script verify เชื่อม service/DB จริง. ไม่ใช้ seed โมดูลอื่น.
- TASK150: ถอนสถานะใช้งานและ filter จากตาราง/ช่องกรอก; คงคำเตือนสต็อกในคอลัมน์สถานะ. DB/API status เดิมยังอยู่สำหรับธุรกรรม.
- TASK151: ตั้งค่าระบบ→ข้อมูลพื้นฐานสินค้า10ชุด40รายการใน DB. GET/POST/PATCH /api/product-options; Adminเพิ่ม/แก้ชื่อ/ปิด-เปิด มีaudit/version/unique/RLS/revoke. Legacy UUID คงเดิม. Pickerทั้ง10ช่องเลือกจาก API ไม่มี localStorage/สร้างชื่อในdropdown; ลิงก์ตั้งค่าแท็บใหม่และrefreshกลับหน้า. Shellเปิดhub/settingsใหม่เท่านั้น ไม่เปิดsettingsทั่วไปเดิม.
- TASK152: สำรวจสร้างสินค้าใหม่และบันทึกแผนแล้ว ยังไม่ implement. POSTสินค้าเดิมชื่อเดียว/รหัส4หลัก/หมวด+รูปแบบยาไม่ตรงฟอร์มใหม่. ฟอร์มยัง preview และปุ่มไม่บันทึกจริง.

## สิ่งที่ต้องตอบก่อนทำต่อ

1. บันทึกข้อมูลทุกช่องก่อนโดยไม่แนบไฟล์ หรือรวมรูปและเอกสาร (ถ้ารวม ต้องกำหนด limits/storage/สิทธิ์ที่ยัง OPEN).
2. เมื่อเป็นยา บังคับตัวยา/รูปแบบยา/ทะเบียนอย่างไร ตาม conditional rules ที่ยัง OPEN ของ TASK124.

คำขอ checkpoint ไม่ใช่คำตอบคำถามเหล่านี้. ห้ามนำ category มาแทน codeGroup หรือ dosageForm มาแทน codeFormat. รหัสใหม่5หลักแยกคู่กลุ่ม+รูปแบบตาม TASK126; รักษารหัส/สินค้าเดิม. เพิ่มสินค้าอย่างเดียวไม่สร้าง Lot/ยอด/Ledger.

## หลักฐานและข้อจำกัด

- TASK149: dry-run/seed/readback/seedซ้ำและ actual services/handler + identity stub ผ่าน ยอดสต็อก950.
- TASK151: seedซ้ำ hash40รายการคงเดิม; integration10หัวข้อกับ DB จริงและ rollback fixtures ผ่าน รวม duplicate/version/roles/origin/legacy/RLS/audit. รันซ้ำล่าสุดใน TASK152 ผ่านทั้งหมด. HTTPจริงไม่เข้าสู่ระบบ401; render shell/settings/picker ผ่าน.
- TypeScript/ESLint/Prisma generate ผ่านใน TASK151; รอบ checkpoint ตรวจซ้ำและบันทึกผลใน Task153.
- ยังไม่ได้คลิก/login/ตรวจภาพ desktop/mobile จริงใน browser. รูปและเอกสารอยู่เฉพาะหน่วยความจำ ไม่มี upload/storage. หน้าอื่นส่วนใหญ่ยังพักเนื้อหาตาม TASK114.
- ไฟล์ .env.local, generated Prisma, local-backups ถูก ignored ไม่เข้า Git. Checkpointเก็บโค้ด/migration/scripts ไม่ใช่ snapshot DB.

## จุดเริ่มต่อ

อ่าน ACTIVE/Specs/Plan/Task152 แล้วรับคำตอบขอบเขต ก่อนบันทึกสัญญาใหม่และลง schema/API/form. ถ้าเจ้าของต้องการตรวจงานที่พร้อม เข้า settings/product-options จัดการรายการ แล้วกลับเพิ่มสินค้าเลือกข้อมูล DB. ตรวจตารางสี่หน้าหลัง login. ดู UAT รายละเอียดใน Task149–151.
