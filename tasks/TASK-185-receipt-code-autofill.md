# TASK-185 — เลขรับเข้าอัตโนมัติ แก้เองได้

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

## ลำดับ / ไฟล์ / ผลลัพธ์

1. ACTIVE/Specs/Plan/Task185 ระบุGR-เลขขั้นต่ำ5หลัก/max+1/ยังแก้ได้.
2. src/server/operations/service.ts: operationOptionsอ่านstock_receiptsรหัสGR-ตัวเลขเท่านั้น maxแบบnumeric+1คืนstringpad5 เฉพาะAdmin ไม่รวมseed/manualprefixอื่น ไม่จำนวนแถว.
3. src/types/api/operations.ts: nextReceiptCodeoptionalไม่กระทบconsumerอื่น.
4. src/app/products/stock/create/page.tsx: initเติมcodeจากoptionsถ้ายังว่าง คงinputeditable ไม่overwriteโหลดซ้ำ/retrypending.
5. ตรวจmockoptionsquery max+padและUIprefill/manualคง รวมlint/type/diff. ไม่มีDBwrite/DDL. DBuniqueเดิม409ถ้าเลขชนและidempotencyเดิมสำหรับretry.

## ⚠️ ต้องทดสอบโดยคุณ

ผลตรวจ: GEToptions/ฟอร์มพร้อมแล้ว. SQLจริงreadonlyได้nextserial1 → GR-00001 ไม่มีข้อมูลรับใหม่ถูกเพิ่มในงานนี้. MockserviceAdmin-only/queryMAX/GRprefix/pad5/serialใหญ่ไม่เสียprecisionผ่าน. SSR/stateตรวจเลขอัตโนมัติ/แก้manualไม่ถูกทับตอนโหลดซ้ำ/confirm/retrypayloadcodeคงผ่าน. ESLint/TypeScript/git diff --checkผ่าน. ยังไม่กรอกจริงผ่านbrowser ไม่schema/DBwrite/commit/deploy.

เปิดเพิ่มสต็อกต้องเห็นเลขGR-00001หรือเลขถัดไป แก้เป็นเลขของตัวเองได้. บันทึกสำเร็จรายงานต้องใช้เลขที่เลือก. เลขซ้ำต้องแจ้งและแก้ใหม่ได้ ไม่เพิ่มยอดซ้ำ. โหลดตัวเลือกซ้ำต้องไม่เปลี่ยนเลขที่แก้ไว้.
