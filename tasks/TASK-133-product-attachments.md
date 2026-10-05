# TASK-133 — แนบรูปและเอกสารหลายไฟล์

สถานะ IMPLEMENTED / WAITING_FOR_UAT; 5 ตุลาคม 2569. แนบหลายไฟล์เพิ่มสะสม/thumbnailชื่อขนาดจำนวน/นำออกแล้ว. ESLint2ไฟล์, image/PDF accept-reject และrender2multipleช่องว่าง/diffผ่าน. ตรวจcleanup ObjectURLถอด/unmount/failureในโค้ดแล้ว ยังไม่เลือกไฟล์จริงในbrowserหลังlogin. ไม่มีupload/API/DB/จำนวนสูงสุด/commit/deploy.

## ลำดับ/ไฟล์/ผลลัพธ์

1. ACTIVE/Specs/Plan/Task บันทึกขอบเขต.
2. product-attachment-field.tsx ใหม่ เลือกmultiple รูปสินค้า image/* เอกสารรูป/PDF เพิ่มสะสมไม่มีจำนวนสูงสุด รายการthumbnail/ชื่อ/ขนาด/จำนวนและนำออก.
3. preview ใช้แทนtextareaรูป/เอกสาร full-row. Fileเก็บเฉพาะstate/ObjectURL local คืนURLเมื่อเอาออกและcomponentunmount. ไม่upload/API/DB/กำหนดขนาดสูงสุดเอง.
4. ESLint/render/diff; ทดสอบเลือกไฟล์จริงโดยเจ้าของ. ไฟล์หายเมื่อรีเฟรช/ออกหน้า.

## ⚠️ ต้องทดสอบโดยคุณ

เลือกรูปหลายรูป เห็นthumbnail/ชื่อ/จำนวนถูกต้อง เลือกเพิ่มอีกครั้งรูปเดิมยังอยู่ นำออกหนึ่งรูปจำนวนลด. เอกสารแนบรูปและPDFเห็นรายการชื่อ/ขนาดครบ; ไฟล์ชนิดไม่รองรับแจ้งชัด. รีเฟรชรายการหาย ไม่มีอัปโหลดถาวร.
