# TASK-165 — โหมดแก้ไขรายละเอียดสินค้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: ปุ่มและdraft/local snapshot/Alertครบแล้ว. ESLint/diffผ่าน; ทดสอบhandlersผ่านmockhooks: cleancancelไม่มีAlert dirtycancelมีAlertแล้วคืนค่า saveLocalมีAlert ค่าใหม่ และcancelรอบถัดไปคืนsnapshotล่าสุด/NonAdminไม่มีปุ่ม. TypeScriptยังมี3Prisma generated errorเดิมไม่มีerrorใหม่. ยังไม่ตรวจbrowser ไม่บันทึกDB/ไฟล์แนบ.

1. บันทึกACTIVE/Specs/Plan.
2. product-detail-preview.tsxเพิ่มstateโหมดแก้/draft/savedlocal/Alert. Adminเท่านั้นปุ่มแก้ไขท้ายหน้า.
3. แก้ช่องข้อความ/ราคาได้ สลับปุ่มยกเลิก/บันทึก; dirtyเทียบค่าก่อนแก้จริง ยกเลิกสะอาดทันที dirtyAlertก่อนคืนค่า. บันทึกเฉพาะlocalและAlertซื่อตรงไม่อ้างDB.
4. ตรวจlint/flow/render/diff. รูป/เอกสารยังไม่เชื่อม ไม่เปิดAPIหรือlegacymutation.

ไฟล์: product-detail-preview.tsx และACTIVE/Specs/Plan/Taskนี้.

ตรวจรับ: Adminแก้ไข→2ปุ่ม/inputs; ยกเลิกไม่เปลี่ยนไม่มีAlert; เปลี่ยนค่าแล้วcancelมีAlertปิดแล้วค่าเดิม/แก้ไขปุ่มเดียว; saveมีAlertค่าlocalใหม่/แก้ไขปุ่มเดียว; แก้อีกแล้วยกเลิกคืนค่าที่save localล่าสุด. NonAdminไม่มีปุ่มแก้. รีเฟรชคืนDBเดิมตามpreview.
