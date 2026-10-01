# TASK-051 — ย้ายข้อมูล data.ts เข้า DB และทำ GET API

วันที่ 2026-10-01 (Asia/Bangkok)
สถานะ: รอยืนยันวิธีเก็บและอนุมัติ Task ก่อน schema/API/UI

## คำขอและผลสำรวจ

เจ้าของโครงการให้พักการต่อ Supabase/Postman โดยตรงและ Render แล้วให้ย้าย Mock ใน data.ts เข้า DB พร้อม API; ความต้องการล่าสุดคือแยกเส้นตามชุดข้อมูล ใช้ Filter และ pagination 10 รายการที่ฝั่ง DB

พบ 19 ไฟล์ มี 57 แถวต้นฉบับ: 18 หน้ารายการรวม 54 แถว และ Dashboard activity 3 แถว. ตัวช่วย createMockConfig ทำซ้ำแต่ละหน้ารายการเป็น 30 แถว จึงเห็น 540 แถวบนหน้ารายการทั้งชุด; แถวที่ทำซ้ำไม่ใช่ข้อมูลต้นฉบับและไม่ควรนำเข้าเป็นรายการธุรกิจ

| ชุด | ไฟล์ | แถวต้นฉบับ |
|---|---|---|
| Dashboard | src/app/data.ts | 3 activity พร้อม metrics สาธิต |
| ลูกค้า | src/app/customers/data.ts | 4 |
| รายชื่อลูกค้า | src/app/customers/list/data.ts | 3 |
| Dashboard ลูกค้า | src/app/customers/dashboard/data.ts | 2 |
| กลุ่มลูกค้า | src/app/customers/groups/data.ts | 3 |
| เขตขาย | src/app/customers/territories/data.ts | 3 |
| เอกสารลูกค้า | src/app/customers/documents/data.ts | 3 |
| ผู้ขาย | src/app/suppliers/data.ts | 3 |
| จัดซื้อ | src/app/purchases/data.ts | 3 |
| ค่าใช้จ่าย | src/app/expenses/data.ts | 3 |
| ใบเสนอราคา | src/app/quotes/data.ts | 3 |
| คำสั่งซื้อ | src/app/orders/data.ts | 3 |
| โปรโมชั่น | src/app/promotions/data.ts | 3 |
| วางบิล | src/app/billing/data.ts | 3 |
| ตรวจนับ | src/app/stock-counts/data.ts | 2 |
| รายงานขาย | src/app/reports/sales/data.ts | 3 |
| รายงานคลัง | src/app/reports/inventory/data.ts | 3 |
| รายงานการเงิน | src/app/reports/finance/data.ts | 3 |
| ตั้งค่า | src/app/settings/data.ts | 4 |

## วิธีที่เสนอ: เก็บข้อมูลต้นฉบับเป็นชุดข้อมูลตัวอย่างใน DB

ข้อมูลเดิมมีหกฟิลด์ข้อความ ref/title/subtitle/owner/value/status โดยไม่มี FK ของผู้ดูแล รายการเอกสาร Lot หรือยอดต้นทางครบ จึงเก็บเป็นชุดข้อมูลตัวอย่างที่ติดป้ายอย่างชัดเจนก่อน ไม่ตีความยอดสาธิตเป็นยอดธุรกิจจริง

- ตารางชุดข้อมูลตัวอย่างเก็บ module key, แหล่งไฟล์เดิม และ metadata ของชุด; ตารางแถวตัวอย่างเก็บ ID, module key, หกฟิลด์เดิม, ลำดับ และ is_sample; แยกจากตารางธุรกิจจริง
- Seed เฉพาะ 57 แถวต้นฉบับ ไม่สร้างแถวซ้ำเพื่อเติม 30 แถว; รันซ้ำโดยไม่ทับข้อมูลธุรกิจ ผู้ใช้ สินค้า หรือ Audit จริง
- GET แยกชุดภายใต้ `/api/demo/<module>` และ `/api/demo/<module>/<id>`; module แยกตาม URL ของหน้าเดิม เช่น customers/groups, reports/sales ไม่ปะปนกับ API ธุรกิจ
- GET ตัวเลือก Filter `/api/demo/<module>/filters` อ่านค่า status/owner/type/detail จาก DB; GET list รับ search/status/owner/type/detail/offset/limit (ค่าเริ่มต้น 10 สูงสุด 50) และตอบ data/pagination พร้อม isSample
- ข้อมูลตัวอย่างที่ย้ายจากไฟล์เปิด GET แบบ No Auth เพื่อดูใน Postman ได้; ไม่เปิดตารางธุรกิจหรือข้อมูลผู้ใช้ผ่านเส้นทางนี้
- ข้อมูล Dashboard และ metrics สาธิตติดป้ายข้อมูลตัวอย่างใน DB; ไม่คำนวณยอดเงินจริงจากข้อความตัวอย่าง
- หน้าเว็บที่ย้ายเลิก import rows/metrics จาก data.ts และดึง GET ตามแท็บ/Filter/หน้า; โหลด 10 แถวจาก DB แทนการโหลดทั้งหมดแล้ว slice ใน browser
- โครงสร้าง UI และข้อความของเมนูเก็บเป็น config ได้; fixture สำหรับ seed ย้ายไป scripts/fixtures ไม่เป็นแหล่งอ่านข้อมูลของหน้าเว็บ
- การเพิ่ม/แก้เอกสาร การอนุมัติ เงิน และสต็อกยังต้องใช้ Specs ธุรกิจรายโมดูลที่อนุมัติ ไม่ใช้ข้อมูลตัวอย่างเป็นกฎจริง
- Collection Zuugroup เพิ่มโฟลเดอร์ชุดข้อมูลตัวอย่างพร้อม list/getbyid/filters และคำอธิบายว่าเป็นตัวอย่างที่อยู่ DB

## ทางเลือก: ตารางธุรกิจจริง

ถ้าเจ้าของโครงการต้องการให้แถวเหล่านี้เป็น Customer/Supplier/Order/Invoice จริง ต้องกำหนดฟิลด์ ความสัมพันธ์ สิทธิ์ ผู้ดูแล และกฎที่ยังอยู่ OPEN ก่อนทำแต่ละโมดูลตามแผน DB-first; ไม่ใส่ค่าเดาเพื่อให้บันทึกผ่าน

## การอนุมัติและขอบเขตหลัก

เจ้าของอนุมัติ 2026-10-01 ให้ใช้ข้อมูลที่มีไปก่อน ค่อยเพิ่มลดภายหลัง และทำเฉพาะข้อหลัก: ย้ายข้อมูลตัวอย่างเดิมเข้า DB พร้อม GET, detail, config, filters และ pagination 10. หน้าเพิ่มของชุดตัวอย่างยังไม่เปิดบันทึกและไม่ใช้ sessionStorage; ผู้ใช้และสินค้าจริงคงการทำงานตาม Specs เดิม. ไม่มีการเดากฎเงิน สต็อก หรืออนุมัติ
