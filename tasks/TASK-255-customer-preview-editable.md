# TASK-255 — ช่องกรอกลูกค้าพิมพ์ได้ — 6 ตุลาคม 2569

เจ้าของแจ้งช่องยังพิมพ์ไม่ได้ ให้เปิดช่องtext/textareaและfieldsetทั่วไป/ติดต่อ. คงpreviewไม่มีsave; mastercomboรอข้อมูลยังdisabled รหัสเต็มreadonlyและเพิ่มที่อยู่ยังdisabled.

IMPLEMENTED / WAITING_FOR_UAT: ช่องข้อความทุกหมวดและfieldsetเปิดพิมพ์ได้แล้ว คงดาวติดต่อ/requiredเดิม. Routeguardยืนยันไม่มีdisabledfieldsetแต่saveยังdisabled. ScopedESLint/TypeScript/route77ผ่าน ไม่มีbrowserQA/API/DB.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customers/create/page.tsx ถอนdisabledtext/textarea/fieldset → scripts/test-route-pages.mjsแก้guardเดิมที่คาดdisabledตามข้อกำหนดใหม่ → scopedlint/type/route → UAT. ไม่DB/API/requiredใหม่.

⚠️ ต้องทดสอบโดยคุณ: พิมพ์ชื่อบริษัท หมายเหตุ ผู้ติดต่อ เบอร์อีเมล ที่อยู่จัดส่ง เลขใบอนุญาต และวงเงินได้. เลขรันแก้ได้ รหัสรวมreadonly. Saveยังปิดและข้อมูลหายเมื่อรีโหลดตามpreview.
