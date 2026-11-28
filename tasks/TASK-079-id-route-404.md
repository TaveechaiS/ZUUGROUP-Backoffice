# TASK-079 — ตรวจหน้า `[id]` 404

สถานะ: COMPLETE — เจ้าของยืนยัน 2026-10-02 ว่าใช้งานได้แล้ว

เจ้าของรายงานหน้า id ได้ 404 หลังงาน TASK-071 ที่เปลี่ยนชื่อโฟลเดอร์ dynamic route ของลูกค้าและสินค้า. ยังรอ URL ที่เกิดปัญหาเพื่อยืนยันโมดูลและรหัสรายการ.

ผลตรวจเบื้องต้น: source มีหน้า `[id]` ครบ, ลิงก์รายการสินค้าใช้ code และรายการทั่วไปใช้ id, `.next/types/routes.d.ts` ตรง source; แต่ `.next/dev/types/routes.d.ts` ยังมี `[ref]` และ route ที่ถูกลบ. `node scripts/test-route-pages.mjs` ผ่าน 59 route. Localhost:5000 ไม่ตอบ จึงยังตรวจหน้า HTTP ไม่ได้.

ขอบเขตและลำดับ: [Specs](../docs/specs/2026-10-02-route-owned-pages.md) และ [Plan](../docs/plans/2026-10-02-route-owned-pages-plan.md) หัวข้องานติดตาม. ตรวจ cache ที่สร้างขึ้นจาก Next, ล้างเฉพาะ `.next/dev` หลังยืนยัน path ใน workspace, ตรวจ route สร้างใหม่ และเทียบ URL จริงเมื่อเจ้าของส่ง. ไม่เปลี่ยน API/DB/กฎธุรกิจ.

วิธีตรวจรับ: dev server ที่เริ่มใหม่ต้องรู้จัก `/customers/[id]` และ `/products/[id]`; กดแถวรายการแล้วเปิดรายละเอียดได้, 404 เฉพาะรหัสที่ไม่มีจริงหรือรายการที่ไม่มีสิทธิ์ดู.

ผลตรวจ: ล้างเฉพาะ `.next/dev` หลังยืนยัน path อยู่ใน workspace; เริ่ม `npm run dev` ใหม่แล้ว generated routes มี `[id]` และไม่มี `[ref]`. Next log ระบุว่า compile `/customers/[id]`; GET `/customers/CUS-1001`, `/products/TEST` และ `/orders/00000000-0000-0000-0000-000000000000` ตอบ HTTP 200 ในคำขอไม่มี session. การตอบ 200 นี้ยืนยันการจับคู่ route แต่ยังไม่ยืนยันข้อมูลหลัง login. หยุด dev server ที่เปิดเพื่อตรวจแล้ว; `next-env.d.ts` ที่ Next เปลี่ยนเองถูกคืนค่าเดิม. รอ URL จริงจากเจ้าของและทดสอบการเปิดรายการหลังเข้าสู่ระบบ.
