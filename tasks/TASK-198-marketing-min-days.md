# TASK-198 — สถานะคลังการตลาดแสดงวันน้อยสุด

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. ACTIVE/Specs/Plan.
2. src/app/products/stock/[warehouse]/page.tsx คำนวณ min daysUntilExpiry เฉพาะ quantity>0/finite; badgeเดียว คงกลาง StatusBadge/expiryข้อความเดิม. ลบ Link/dateOnly imports และรายละเอียดในcell.
3. lint/mock 30/10→10, ล็อต0ไม่นับ, min0และติดลบ, ไม่มีล็อตแสดง —; ไม่มี ID/qty/expiryในสถานะ. ไม่ API/DB.

⚠️ ต้องทดสอบโดยคุณ: สินค้า2ล็อตเหลือ30และ10วัน ช่องสถานะต้องแสดง “เหลือ 10 วัน” อย่างเดียว.

ผล: scoped ESLint/diff/mock passed: badgeเดียว min30/10=10, ไม่นับquantity0, today/expired/empty, ไม่ID/dateในcell. ไม่ API/DB write ยังไม่ได้ browser.
