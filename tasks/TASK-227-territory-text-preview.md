
# TASK-227 — เขตขายใช้ text ก่อน — 6 ตุลาคม 2569

APPROVED: ACTIVE/Specs/Plan → territories/page.tsx ถอน API/live-state/CRUD/การนำทางข้อมูลจริงและใช้ข้อความตัวอย่างในรูปแบบเดิม → test-territory-fields เฉพาะpreview ตรวจไม่มีAPIและcontrolsdisabled → type-check/scoped ESLint/offline render. ไฟล์หน้าเขต/test/doc เท่านั้น ไม่ทำDBwriteหรือแก้user/customer. ตรวจรับเปิดหน้าเขตเห็นฟอร์ม/ตารางตามข้อมูลพื้นฐานสินค้า ใช้ตัวอย่าง3แถว ช่องและปุ่มยังใช้งานไม่ได้ ไม่มีข้อมูลจริงโหลด.
ผล TASK-227: IMPLEMENTED / WAITING_FOR_UAT. หน้ารายการเขตขายใช้ข้อความตัวอย่าง3แถว คงรูปแบบข้อมูลพื้นฐานสินค้า; ถอนservice/http, API, effects, mutationและdetailnavigation. ช่องและปุ่ม/Paginationdisabled. Type-check/scoped ESLint/offline renderผ่าน ยืนยันหน้าไม่มีAPItransport. ไม่DBwrite/commit/push; งาน225พักเดิม.

⚠️ ต้องทดสอบโดยคุณ: เปิดหน้าเขตขาย ควรเห็นรหัส ZONE-001–003 และชื่อผู้จัดการตัวอย่าง ฟอร์ม/ปุ่มแสดงรูปแบบแต่ยังใช้ไม่ได้ และไม่โหลด/บันทึกข้อมูลเขตจริง. ตรวจรูปแบบทั้งdesktop/mobile.