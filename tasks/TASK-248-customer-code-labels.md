# TASK-248 — กล่องรหัสตัวอย่างด้านล่าง — 6 ตุลาคม 2569

เจ้าของให้มีช่องโชว์รหัสตัวอย่างด้านล่าง ลบป้ายกลุ่มรหัสลูกค้า/เลขรัน/รหัสลูกค้าเต็ม และย้ายรหัสลูกค้าเต็มเป็นplaceholder.

IMPLEMENTED / WAITING_FOR_UAT: ป้ายที่มองเห็นออกแล้ว มีaccessiblelabel ช่องreadonlyด้านล่างmt4/blue50ใช้placeholderตามเจ้าของ. ScopedESLintผ่าน.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan/task → customer-code-preview.tsx ซ่อนlabelที่มองเห็นด้วยsr-only คงชื่อaccessible/ดาวหัวรหัสลูกค้า ช่องรหัสรวมreadonlyด้านล่างplaceholderรหัสลูกค้าเต็ม → scopedlint. คงกลุ่ม/เลขรัน/formatไม่API/DB.

⚠️ ต้องทดสอบโดยคุณ: หน้าcreateหัวรหัสลูกค้ามีcombobox+ช่องเลขโดยไม่มี3ป้ายเดิม ด้านล่างเห็นplaceholderรหัสลูกค้าเต็ม; เลือกPHAและกรอก1ต้องแสดงPHA-0001ในกล่องล่าง.
