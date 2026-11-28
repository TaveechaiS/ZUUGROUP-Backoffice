# TASK-196 — ล็อตคงเหลือในรายละเอียดสินค้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. ACTIVE/Specs/Plan.
2. src/server/operations/service.ts view lots remaining=true + warehouseCode EXISTS quantity>0 ใช้ whereเดียว rows/count; validate remaining boolean. ประวัติเดิมไม่ส่ง remaining จึงเหมือนเดิม.
3. src/app/products/[id]/page.tsx เรียก local LotHistory mode currentOnly อีกกล่องก่อนประวัติเดิม เปิดเริ่มต้น มีคลัง filter; query remaining/paging. แสดง balances เฉพาะ scope/positive และ sumคงเหลือเดียวกัน; product.id filter.
4. src/app/products/stock/[warehouse]/page.tsx hrefสินค้า query warehouse context และกล่องอ่าน contextบนclient.
5. lint/type/mock API2→1/warehouse scope/count/history unaffected, UIจำนวน/คลัง/context. ไม่ DB write/schema.

⚠️ ต้องทดสอบโดยคุณ: จากคลังหลักสินค้า2ล็อตเปิดรายละเอียด กล่องใหม่เลือกคลังหลักและมี2ล็อต; หลังล็อตหนึ่งหมดหรือโอนเต็มต้องเหลือ1 และอีกคลังเห็นล็อตที่โอนพร้อมจำนวนจริง. ประวัติเดิมยังมีล็อตเก่า.

ผล: scoped ESLint/TypeScript/diff ผ่าน. UI mockกล่องเปิด/contextMAIN/สองล็อต→หนึ่งMAINเมื่อโอน/allยังสองล็อต/ยอดคลังไม่ปน/old historyรวมล็อตหมดแล้วผ่าน. service mock positive scopeก่อนpagingทั้ง3คลัง/rows-count WHEREเดียว/product binding/ประวัติdefaultไม่กรอง/invalid400ผ่าน. ไม่มี DB write/schema/auto-transfer และยังไม่ได้ตรวจ browser. ตารางอ่านข้อมูลเมื่อเปิด/เปลี่ยนคลัง/เข้าหน้าใหม่ ไม่ใช่ realtime subscription.
