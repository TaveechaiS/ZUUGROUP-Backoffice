
# TASK-232 — ถอนรายการในเพิ่มเขต — 6 ตุลาคม 2569

APPROVED: ACTIVE/Specs/Plan → territories/page.tsxถอนlabel/inputรายการและgridสองคอลัมน์ → scoped lint/diff. ตรวจรับส่วนเพิ่มเขตไม่มีรายการ เหลือชื่อเขตและหมายเหตุ ตารางเดิม.
ผล: IMPLEMENTED / WAITING_FOR_UAT. ถอนรายการและgridสองคอลัมน์แล้ว ฟอร์มชื่อ/หมายเหตุเต็มพื้นที่. scoped lint/diffผ่าน ไม่มีAPI/DB/commit/push.

⚠️ ต้องทดสอบโดยคุณ: ส่วนเพิ่มเขตต้องไม่มีช่องรายการ และเห็นชื่อเขตกับหมายเหตุเต็มพื้นที่.