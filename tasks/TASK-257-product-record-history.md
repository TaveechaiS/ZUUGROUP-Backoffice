# TASK-257 — ประวัติข้อมูลสินค้า — 6 ตุลาคม 2569

เจ้าของขอนอกงานลูกค้า เพิ่มประวัติข้อมูลสินค้าในIDล่างสุดก่อนยกเลิก/บันทึก. เพิ่มกล่องmetadataผู้สร้าง/วันที่สร้าง/ผู้แก้ไขล่าสุด/วันที่แก้ล่าสุด แยกจากตารางประวัติการแก้ไขเดิม.

IMPLEMENTED / WAITING_FOR_UAT: กล่องmetadataวางก่อนfooterแล้ว อ่านlazyhistoryfirst/latestและวันที่สร้างจริง. actualcomponentchecksโหลดเมื่อเปิด/ชื่อจริง/BE/อ่านใหม่revision/empty/errorretryผ่าน; producteditregressionprefill/save/retry409/cancel/nonAdmin/scopedlint/type/diffผ่าน ไม่มีbrowserQAหรือDB/APIwrite.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → products/[id]/product-record-history.tsx lazyhistoryGETasc/descอย่างละlimit1 และproduct.createdAt → page.tsxวางก่อนfooterหลังerror/progress → lint/type/producteditregression → UAT.

ผู้สร้างใช้earliestactionPRODUCT_CREATED_FULLเท่านั้น ถ้าearliestupdateไม่เดาว่าเป็นผู้สร้าง. ผู้แก้ล่าสุดใช้latestactionPRODUCT_UPDATED_FULLเท่านั้น ไม่มีupdateแสดงยังไม่มีข้อมูล. วันที่แสดงBE/AsiaBangkok. กรณีเก่าไม่มีauditแสดงNotFoundและวันที่สร้างจริงจากproduct; errorretryไม่กลบเป็นempty. เปลี่ยนrevisionหลังsaveทำให้อ่านใหม่. ไม่schema/APIwrite/DBwrite.

เพิ่มscope scripts/test-product-edit-page.mjs เฉพาะstubcomponentใหม่ในharnessเพื่อรันregressionเดิม; ทดสอบstatecomponentใหม่แยกโดยmockHTTPโดยไม่เขียนDB.

⚠️ ต้องทดสอบโดยคุณ: เปิดIDสินค้าเลื่อนล่างก่อนปุ่ม เปิดกล่องประวัติเห็นข้อมูลผู้สร้าง/แก้ล่าสุดและวันที่พ.ศ. Saveแล้วประวัติอัปเดต; ไม่เคยแก้หรือไม่มีauditไม่แสดงชื่อ/เวลาปลอม. ยังแก้ยกเลิกบันทึกได้ตามเดิม.
