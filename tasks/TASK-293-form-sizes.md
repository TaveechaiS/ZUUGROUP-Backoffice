# TASK-293 — ขนาดช่องกรอก / ปุ่ม / icon ให้ตรงกัน — 15 ตุลาคม 2569

OWNER_APPROVED (15 ต.ค. 2569 "ทำทั้งหมด", ตัวเลือก A สูง h-11).

## ลำดับ / ไฟล์

1. src/components/ui/form-classes.ts: `inputClass` (h-11, rounded-md, ขอบ #d9e3ee, ตัวหนังสือ #344256, focus ring; textarea สูงตาม rows), `primaryButtonClass`, `secondaryButtonClass` (h-11 rounded-md px-4 poppins-medium).
2. ลบ inputClass/buttonClass/fieldClass/control ที่ประกาศซ้ำในหน้า customers, products, settings, users, audit-logs, billing, expenses, promotions, stock-counts, report-table, document-ui (คง margin เดิมที่หน้าเรียก).
3. ปุ่มหลัก bg-[#1a58a7] ในฟอร์ม/หน้าแก้ไข ใช้ primaryButtonClass.
4. Icon: ChevronDown ค่าเริ่มต้น h-4 w-4 (ไม่ fix 20px), svg ไม่มีขนาดในหน้าสินค้าใส่ h-4 w-4; ค้นหา h-4, ปิดใน dialog h-5.

ไม่ทำ: สี #hex, pagination (ปุ่มเล็กโดยตั้งใจ), admin-shell icon (responsive), NotFound/Success, ปุ่ม secondary inline ตามหน้า.

## ผล — IMPLEMENTED / WAITING_FOR_UAT

- tsc/eslint/next build ผ่าน. หน้าจอจริงยังไม่ตรวจ.

⚠️ ต้องทดสอบโดยคุณ: เปิด /customers/create, /products/create, /products/stock/create, /users, /users/create, /audit-logs, /settings/customer-options, ฟอร์มใบเสนอราคา/คำสั่งซื้อ และตัวกรองใน /products, /expenses ทั้ง desktop และมือถือ → ช่องกรอก/select/ปุ่มหลักสูงเท่ากัน (44px) มุมเท่ากัน; textarea หลายบรรทัดเหมือนเดิม; icon ค้นหา/ลูกศร/ปิด ขนาดเท่ากันทุกหน้า. หมายเหตุ: users/audit-logs มุมและสีขอบเปลี่ยนตามมาตรฐาน, ลูกศรใน details เล็กลงเล็กน้อย.
