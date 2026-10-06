# TASK-194 — รายละเอียดการเติมสต็อกและแก้ข้อมูลผิด

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

1. บันทึก ACTIVE/Specs/Plan ก่อน code.
2. แก้เฉพาะ src/app/products/stock/receipts/[id]/page.tsx ใช้ components กลางเดิม ไม่สร้าง component ใหม่. อ่าน options เพื่อสิทธิ์ Admin; draft จำนวน/ต้นทุน/วันที่/คลัง/เหตุผล. คง read view และ balances table.
3. สลับปุ่ม แก้ไข/ยกเลิกบันทึก; cancel clean ทันที dirty ใช้ SuccessAlert. POST correct เดิม เก็บ idempotency key/payload เมื่อ 503/network และ lock form จน retry สำเร็จหรือ 4xx แน่นอน. โหลด lot ใหม่เมื่อสำเร็จ.
4. scoped lint/type/mock: default view, edit fields, cancel clean/dirty, validation, payload lot/warehouse, retry key เดิม, save alert/readback. ไม่แก้ server/schema ไม่ DB write รอบพัฒนา.

⚠️ ต้องทดสอบโดยคุณ: เปิดรายการใหม่ กดแก้ไข เปลี่ยนข้อมูลแล้วกดยกเลิกต้องมี alert และกลับค่าเดิม; บันทึกพร้อมเหตุผลต้องแสดงค่าที่บันทึกจริงหลังรีเฟรช. รายการเกิน 7 วันและลดจำนวนต่ำกว่ายอดใช้/จองต้องแสดงข้อผิดพลาดจาก API.

ผลตรวจ: scoped ESLint/TypeScript/diff ผ่าน; VM mock Admin-only/default/edit fields, clean/dirty cancel, required reason, correct lotId/warehouse payload, 503 retry key เดิมและ lock draft, success สลับปุ่ม/readback, 409 ปลดล็อกให้แก้/ยกเลิก ผ่าน. ใช้ API correct เดิมทั้งหมด ไม่เขียน server/schema ไม่ทดสอบเขียน DB จริง และยังไม่ได้ตรวจเบราว์เซอร์.
