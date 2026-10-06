# TASK-195 — สถานะและอายุสินค้าแยกคลัง

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

แผนฉบับล่าสุดแทนข้อ 2–3 ด้านล่าง: products CTE เพิ่ม mainQuantity และ lotCount distinct>0 scoped; marketingLots query เฉพาะ products ใน page/คลัง MARKETING ที่ quantity>0 และคำนวณวัน Bangkok. UI marketing คงแถวสินค้าแล้วแสดงรายการวันรายล็อตและ ID ในสถานะ. ทุกตารางเพิ่มจำนวนสต็อกหลังราคาขาย. ไม่เปลี่ยน lots view หรือ safeLot ในรอบนี้; types เพิ่ม mainQuantity/lotCount/marketingLots. ตรวจ SQL paging/count/scope และยอดที่ไหลตามการโอนจริง ไม่ auto transfer.

1. บันทึก ACTIVE/Specs/Plan.
2. src/server/operations/service.ts: totals MAIN แยกจากยอดรวม/available; low/empty ใช้ mainQuantity ทั้ง data/count; MAIN ไม่ซ่อนสินค้ายอด0. lots warehouseCode scope ทั้ง ids/count และ categories สำหรับ filter; วันเหลือ Bangkok/status MARKETING และ blank DISPOSAL. src/types/api/operations.ts เพิ่ม mainQuantity/daysUntilExpiry.
3. src/app/products/page.tsx status MAIN. stock/[warehouse]/page.tsx marketing รายล็อตพร้อมวัน/ID/ยอดเฉพาะคลัง (view lots); main status MAIN; disposal ไม่มีสถานะ. ใช้ component กลางเดิมและเขียนใน page.
4. src/components/ui/status-badge.tsx เพิ่ม pattern เหลือวัน/หมดอายุวันนี้/แล้วกี่วัน ส่วนกลางตาม guide.
5. lint/type/diff/mock MAIN0/1/50/51 แม้รวม70, สองล็อต MARKETING คนละวัน/ไม่ปนยอดคลังอื่น, DISPOSALไม่มีสถานะ, SQL rows/count scoped/paging, Bangkokวันข้าม UTC. ไม่มี DB write/schema/transfer.

⚠️ ต้องทดสอบโดยคุณ: MAIN50+MARKETING20 ต้องใกล้หมดแม้รวม70; MAIN0แม้คลังอื่นมีต้องหมด. การตลาดแยก2ล็อตและวันเหลือของแต่ละล็อต/จำนวนคลังการตลาด; รอทำลายไม่แสดงสถานะทั้งคอมและมือถือ.

ผลตรวจ: scoped ESLint/TypeScript/diff ผ่าน. UI mock MAIN0/1/50/51 ไม่ขึ้นกับยอดรวม70หรือ available0, MARKETING2ล็อตคนละวันและ link detail, DISPOSALไม่มีหัวสถานะ/ป้าย, lotCount ผ่าน. Service mock rows/count ใช้ mainQuantity, MAINไม่มี scopeExists ที่ซ่อน0, count distinct positive scoped, marketing query เฉพาะ paged IDs/คลัง/positive และกันข้อมูลคนละสินค้า ผ่าน. SQL SELECT read-only บนฐานจริงยืนยัน aggregate totals/main/count และวันเหลือ; CTE VALUESจำลองโอน3MAIN→2MAIN+1MARKETING→2MAIN+0MARKETING+1DISPOSAL ผ่าน. ไม่เขียน DB ไม่ทำ auto transfer; ยังไม่ได้ตรวจเบราว์เซอร์.
