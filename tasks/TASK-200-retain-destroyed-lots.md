# TASK-200 — แถวล็อตทำลายแล้วไม่หาย

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. ACTIVE/Specs/Plan อัปเดตแทนเงื่อนไขซ่อนแถว TASK-199.
2. src/server/operations/service.ts remaining scope positive OR EXISTS movement kindทำลายแล้วในDISPOSAL เมื่อscopeว่างหรือDISPOSAL. ใช้WHEREเดียวids/countก่อนpaging. MAIN/MARKETINGไม่รวมdestroyed rows.
3. คงUI flag/noninteractive labelและbalance0/countdistinctpositiveจากTask195/199. ไม่เพิ่มcolumnหรือเปลี่ยนreceivedquantity.
4. lint/type/mock all/disposal ORflag + rows/count, MAIN/MARKETINGยังpositive, summaryไม่นับ0. ไม่ DB write.

⚠️ ต้องทดสอบโดยคุณ: ทำลายล็อตแล้วรีเฟรชในDISPOSALแถวยังอยู่/คำทำลายแล้ว/คงเหลือ0 แต่ตารางคลังจำนวนล็อตและจำนวนสินค้าลดลงตามยอดที่ทำลาย.

ผล: scoped ESLint/TypeScript/diffผ่าน; mock all/DISPOSAL ORdestroyed vsMAIN/MARKETINGpositive/ids-countWHEREเดียวผ่าน; UI fresh componentอ่านflagqty0ยังแสดงID/ไม่มีปุ่มทำซ้ำผ่าน; SQLread-onlyVALUESเห็น1แถว active lotcount0 qty0ผ่าน. ไม่มีDBwriteจริง ยังไม่ได้browser.
