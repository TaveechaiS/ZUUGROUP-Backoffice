# TASK-086 — API อ่านข้อมูลสำหรับ Dashboard

สถานะ: DRAFT / DEFERRED — เจ้าของขอค่อยทำเมื่อ 2026-10-03; เก็บร่างไว้ ยังไม่อนุมัติ implementation

## ความต้องการที่ยืนยัน

Dashboard มี API สำหรับอ่านและจัดข้อมูลแสดงผลโดยเฉพาะ ใช้ GET อย่างเดียว. ไม่ใช้ endpoint นี้เพิ่ม/แก้/ลบข้อมูล. หน้า Dashboard เรียกผ่าน `Get` ใน service/http ตามมาตรฐานเดิม.

## สิ่งที่มีอยู่จริง

- `GET /api/dashboard` อยู่ที่ `src/app/api/dashboard/route.ts`; มี try/catch และ Cache-Control no-store.
- `dashboardData` ใน `src/server/records/reports.ts` อ่านจำนวน customers/products/orders/quotes ที่ไม่ลบ และเอกสารล่าสุด 10 รายการจาก quotes/purchases/billing.
- หน้า `src/app/page.tsx` เรียก endpoint นี้แล้ว; types อยู่ใน `src/types/api/reports.ts`.
- Response `{data:{counts,activity,unavailable}}`. ฟิลด์กิจกรรมคือ id/code/name/status/module/createdAt; เวลา JSON เป็น ISO.
- Route ปัจจุบันไม่ได้ตรวจผู้ใช้และเอกสาร API ระบุสาธารณะ. Project Specs §16 กำหนด Dashboard ตาม Role; ยังต้องเลือกขอบเขตสิทธิ์จริงก่อนขยายข้อมูล.

## ข้อเสนอสำหรับรอบแรก

ใช้ endpoint เดิม `GET /api/dashboard` และแยก service/types ของ Dashboard โดยเฉพาะ. อ่านจากข้อมูลต้นทางโดย aggregate ฝั่ง server; ส่งสรุปพร้อมใช้ในหน้าเดียว. คงชื่อ field เดิมและเปลี่ยนผู้เรียกพร้อมกันเมื่อ contract ใหม่อนุมัติ.

| Section / ชื่ออังกฤษ | ชื่อไทย | ข้อมูลและความหมาย |
|---|---|---|
| counts | จำนวนรายการ | customers/products/orders/quotes; จำนวนแถวที่ไม่ลบ ไม่ใช่ยอดเงินหรือยอดขายรับรู้ |
| activity | เอกสารล่าสุด | quotes/purchases/billing ตามชุดเดิม เรียง createdAt ลดลง และ id เป็นตัวตัดสินเมื่อเวลาซ้ำ |
| unavailable | ข้อมูลที่ยังไม่พร้อม | คงรายการเดิมจนกฎยอดขาย/ลูกหนี้/คลังพร้อม; ห้ามส่งศูนย์แทนยอดที่ยังคำนวณไม่ได้ |
| statusSummary (ตัวเลือกเพิ่มเติม) | จำนวนแยกสถานะ | `{module,status,count}` ใช้สถานะจริงจากข้อมูล ไม่จัดคำว่า approved/completed เป็นรายได้เอง |
| trends (ระยะถัดไป) | แนวโน้มจำนวนรายการ | `{module,date,count}` จำนวนรายการที่สร้างตาม createdAt; วันที่กรุงเทพฯ ไม่ใช่กราฟยอดขาย |

**ชุด A:** counts/activity/unavailable ตามหน้าปัจจุบัน — ขอบเขตเล็กและรองรับผู้เรียกเดิม.

**ชุด B:** เพิ่ม statusSummary/trends — ต้องเลือกโมดูล ช่วงเวลาและหน่วยวัน/เดือนก่อน implementation ของส่วนเหล่านี้. การเลือกชุดรอคำตอบเจ้าของ.

## GET contract ที่เสนอ

รอบแรกไม่มี query ต้องตอบ contract เดิมเพื่อให้ Dashboard ปัจจุบันใช้ได้. หากเพิ่ม sections ให้ใช้ query ในเส้นเดียว เช่น `?include=counts,activity,statusSummary&activityLimit=10`. ไม่มี endpoint แยกแต่ละ card.

- include: allowlist ของ sections ที่อนุมัติ; ไม่ส่ง query ให้เทียบเท่า counts/activity/unavailable เดิม.
- activityLimit: จำนวนเต็ม 1–50, default 10, ใช้เฉพาะ activity. ไม่กระทบจำนวนใน counts.
- ค่า unknown/ชนิดผิดให้ 400; ต้องเขียนขอบเขต include/unavailable ที่แน่นอนใน contract หลังเจ้าของเลือกชุด.
- Sections ที่ไม่ได้ร้องขอให้ไม่ส่ง field; sections ที่ร้องขอแต่ไม่มีแถวให้ count 0/array ว่าง. การถูกจำกัดสิทธิ์หรือยังไม่พร้อมคำนวณไม่แทนด้วย 0.
- สำเร็จ 200 `{data:{...}}`; error คง `{error:{message}}` และข้อความไทย. Query ผิด 400, ไม่ยืนยันตัวตน 401, ไม่มีสิทธิ์ 403, DB เชื่อมต่อไม่ได้ 503.
- Method สำหรับเขียน POST/PUT/PATCH/DELETE ตอบ 405 พร้อมตรวจว่าไม่เกิดการเขียนข้อมูล. HEAD/OPTIONS เป็น method ประกอบแบบอ่าน/metadata ตาม Route Handler ของ Next.js; ไม่เพิ่ม mutation handlers.
- ใช้ try/catch โดยรักษา status ของ validation/auth errors; unexpected DB failure เป็น 503 พร้อมข้อความกลาง.
- Cache-Control no-store ทุก response; ไม่มี cache ข้ามผู้ใช้.

ตัวอย่างรูปร่าง response (เป็นคำอธิบาย contract ไม่ใช่ข้อมูลจริง): counts มี number ทั้งสี่ key; activity มี array ของฟิลด์ต้นทางเดิม; statusSummary/trends มีเฉพาะเมื่ออนุมัติและร้องขอ. ห้ามส่งฟิลด์ secret หรือข้อมูลผู้ใช้ที่ไม่จำเป็น.

## สิทธิ์ — ข้อตกลงก่อนเริ่ม

ข้อเสนอคือ API Dashboard ต้องผ่านการยืนยันตัวตน. รอบแรกจำกัด Admin จนกว่าจะยืนยันการเปิดให้ Role อื่นและเงื่อนไขแถวได้ครบ; นี่เป็นข้อเสนอที่รออนุมัติ ไม่ใช่สิทธิ์ที่เปลี่ยนแล้ว.

Sales ตาม Specs ต้องเห็นข้อมูลตนเอง แต่ข้อมูล owner ปัจจุบันเป็นข้อความที่ยังไม่มีข้อตกลงจับคู่ผู้ใช้/ขอบเขต. ห้ามใช้การเทียบชื่อเพื่อเดาสิทธิ์ หรือให้ count/กราฟหลุดข้อมูลคนอื่น. Manager/Accounting ต้องยืนยัน modules/ยอดที่เห็นก่อนเปิด. หากเจ้าของต้องการคงสาธารณะ ต้องอนุมัติ allowlist ข้อมูลสาธารณะแยกชัดเจนก่อนพัฒนา.

## ขอบเขตที่พร้อมเสนอพัฒนา

ย้าย service/types, GET validation, aggregation ของ counts/activity ตามความหมายเดิม, การจัดการ errors และปรับหน้า Dashboard ให้ใช้ contract ที่อนุมัติ. ไม่เพิ่ม schema/seed และไม่มีการคำนวณ Ledger/Lot/ต้นทุน/กำไร/ลูกหนี้สุทธิ; เรื่องเหล่านั้นรอกฎธุรกิจตาม Project Specs.

## ตรวจรับ

1. GET ครั้งเดียวได้ counts/activity ตรงกับแถวต้นทางที่ไม่ลบ; counts ไม่ถูกจำกัดด้วย activityLimit.
2. ข้อมูลศูนย์/array ว่างใช้หน้าว่างได้; API failure หยุด Loading และแสดงลองใหม่.
3. Activity เรียงคงที่ ลิงก์ไปข้อมูลจริง และใช้ id/code/name/status ตามต้นทาง.
4. Query ผิด 400; สิทธิ์ตามที่อนุมัติได้ 401/403; Method เขียน 405; HEAD/OPTIONS ไม่มีผลต่อข้อมูล.
5. กรณี Role หลายขอบเขตต้องทดสอบ count/activity/status/chart พร้อมกัน ไม่รั่วข้อมูลผ่านยอดรวม.
6. ถ้าเลือก trends: ขอบวัน Asia/Bangkok และวันที่/เดือนที่ไม่มีรายการเป็นไปตาม contract ที่ตกลง; UI ใช้ภาษาไทย/พ.ศ.

## ข้อที่รอเลือก

- ชุด A หรือ B และโมดูลที่อยากมี card/กราฟ.
- สิทธิ์รอบแรก: Admin ตามข้อเสนอ หรือขอบเขตที่เจ้าของยืนยันสำหรับ Role อื่น.
- ถ้าเลือกกราฟ: ช่วงเวลา หน่วยวัน/เดือน และการเติมช่วงที่ไม่มีข้อมูล.
