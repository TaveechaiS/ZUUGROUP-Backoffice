# TASK-223 — ลดช่องเขตขายและแสดงจำนวนคน

IMPLEMENTED / WAITING_FOR_UAT

1. บันทึกคำขอใน ACTIVE/Specs/Plan ก่อนแก้โค้ด.
2. territories/create/page.tsx และ territories/[id]/page.tsx ถอนช่องและรายละเอียด status/area/owner. รหัสเขต required คงเดิม. createส่งstatusใช้งานอยู่ตามค่าเริ่มต้นเดิม; editส่งเฉพาะfieldsที่ยังมีพร้อมexpectedUpdatedAt ไม่ล้างข้อมูลที่ถอน.
3. territories/page.tsx ถอนตัวกรอง/คอลัมน์สถานะ/พื้นที่/ผู้บันทึก/จำนวนลูกค้า ทั้งdesktop/mobile. คงรหัส/ชื่อ/Manager และเปลี่ยนSalesชื่อเป็นจำนวนคนตามคำตอบ. ชื่อรายคน/ลูกค้ายังคงในหน้าID.
4. ถ้าคอลัมน์countมีsort ใช้ SQL expression จากความสัมพันธ์จริงก่อนpagingใน server/records/service.ts ไม่sortแค่หน้าที่โหลด. ไม่เปลี่ยนกฎ1Manager/1Salesต่อเขต.
5. scripts/test-route-pages.mjs ปรับข้อยกเว้นเฉพาะUI fieldsที่เจ้าของถอน; ตรวจrenderไม่มีcontrolsที่ถอน และvalidatecreate/editไม่ทำข้อมูลเดิมหาย. Scoped ESLint/type/diff.

ไม่ลบcolumn/schema/ข้อมูลจริง ไม่เปลี่ยนสิทธิ์/กฎOPEN. นิยามcountถามไว้แล้ว กำลังรอคำตอบ.

## ⚠️ ต้องทดสอบโดยคุณ

- รายการเขตทั้งdesktop/mobileมีรหัสเขต/ชื่อ/Manager/จำนวนคนตามนิยามที่สรุป ไม่มีพื้นที่/ลูกค้า/สถานะ/ผู้บันทึก.
- เพิ่ม/แก้ไขมีรหัสเขตและต้องกรอก ไม่มีช่องสถานะ/พื้นที่/ผู้บันทึก; กรอกชื่อกับข้อมูลที่ต้องการแล้วบันทึกได้.
- รายละเอียดเขตยังเห็นManager/Salesเป็นชื่อจริงและลูกค้าที่ผูกกับเขต.
- แก้ชื่อเขตแล้วข้อมูลstatus/area/ownerที่มีเดิมต้องไม่ถูกล้างเพราะถอนช่องออกจากUI.

## นิยามและผลตรวจ

ขณะจบรอบยังไม่มีคำตอบasync จึงใช้จำนวนเฉพาะSalesตามคอลัมน์ฝ่ายขายเดิม (0/1จากsalesIdตามโครงสร้างที่มี). หากเจ้าของให้รวมManagerให้ปรับนิยามในรอบถัดไป ไม่ถือว่าคำตอบเงียบเป็นอนุมัติกฎใหม่. scripts/test-territory-fields.mjs ตรวจactualpage4columns/requiredcode/count0-1/nohiddenfieldsdesktopmobile/createผ่านcleanBody/editpartialไม่ล้างstatus-area-owner/expectedVersionผ่าน. recordListVMตรวจsalesCountSQLsortก่อนOFFSETและunknownsortrejectก่อนDBผ่าน. route77/fieldsets14/ESLint/diffผ่าน. TypeScriptยังติดgenerated routes/Prisma details-codeGroupIdเดิม. ไม่DBwrite/schema. ยังไม่ตรวจbrowser.
