# TASK-250 — ช่องกรอกสองฝั่ง — 6 ตุลาคม 2569

เจ้าของให้ช่องกรอกสองฝั่งเท่ากัน ยกเว้นกล่องใหญ่พิมพ์อธิบายยาว.

IMPLEMENTED / WAITING_FOR_UAT: gridสองคอลัมน์เท่ากัน/textareaเต็มแถว มือถือหนึ่งคอลัมน์. Scopedlint/diffผ่าน ไม่มีbrowserตรวจภาพจริง.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customers/create/page.tsx และcustomer-billing-preview.tsx fieldsetsใช้gridหนึ่งคอลัมน์มือถือ/smสองคอลัมน์เท่ากัน textareaเต็มแถว → scopedlint/diff → UATdesktop/mobile. รหัสcombobox/เลขรันgridสองช่องเดิม เอกสารภาพpreviewเต็มพื้นที่คงเดิม. ไม่required/fields/API/DB.

⚠️ ต้องทดสอบโดยคุณ: หน้าcreateบนdesktopช่องสั้นแต่ละหมวดเป็นสองคอลัมน์กว้างเท่ากัน ช่องหมายเหตุ/ที่อยู่ออกบิล/ที่อยู่จัดส่งเต็มแถว; มือถือทุกช่องหนึ่งคอลัมน์ไม่ล้น.
