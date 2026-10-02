# รวม API ตามโมดูล — TASK-074

สถานะ: APPROVED เจ้าของอนุมัติเอกสาร 2026-10-02

## ข้อกำหนดเจ้าของ

เจ้าของต้องการรวม API ตามกลุ่มข้อมูล รวม delete/status/options/filter และตอบ “ok” กับข้อเสนอใช้ HTTP Method แยกคำสั่งและขอข้อมูลประกอบพร้อมรายการได้ เป้าหมายคือหา API ง่ายและลดคำขอซ้ำ คง pagination ฝั่ง DB ครั้งละ10รายการ

## Contract ที่เสนอ

| การทำงาน | เส้นทาง |
|---|---|
| รายการ/ค้นหา/กรอง/แบ่งหน้า | GET /api/{module}?limit=10&offset=0 |
| รายการพร้อมข้อมูลประกอบ | GET /api/{module}?limit=10&offset=0&include=filters,options,config |
| ตัวเลือกอย่างเดียวสำหรับ Combobox | GET /api/{module}?view=options&search=คำค้น&limit=10&offset=0 |
| ตัวกรองอย่างเดียวสำหรับฟอร์ม | GET /api/{module}?view=filters |
| การตั้งค่าหน้าอย่างเดียว | GET /api/{module}?view=config |
| รายละเอียด | GET /api/{module}/{id} ตามสิทธิ์/allowlist เดิม |
| เพิ่ม | POST /api/{module} |
| แก้ไข/เปลี่ยนสถานะ | PATCH /api/{module}/{id} |
| ลบเชิงตรรกะ | DELETE /api/{module}/{id} |
| กู้คืน | PATCH /api/{module}/{id} พร้อม action: restore |

- คง limit/offset/default10/max50 และขีดจำกัด offset เดิม ไม่เปลี่ยนชื่อ query เป็น page/pageSize
- คงชื่อข้อมูลรายการแต่ละกลุ่ม data/products/users/rows และ pagination เดิม เพิ่มเฉพาะ property ที่ขอด้วย include
- include/view รับเฉพาะค่าที่โมดูลรองรับ ค่าไม่ถูกต้องหรือใช้ include ซ้อน view ตอบ400; view ประกอบอย่างเดียวไม่โหลดรายการ
- options มีข้อมูลและ pagination ของตัวเอง คง ID/label/search เดิม ไม่ส่งทุกตัวเลือกไม่จำกัดจำนวน
- filters อ่านจาก DB ตามขอบเขตและสิทธิ์เดิม ไม่สร้างจาก10แถวในหน้าปัจจุบัน
- config/canWrite และข้อมูลประกอบต้องตรวจสิทธิ์เดิมแยกตามหน้าที่ ห้ามใช้สิทธิ์ GET รายการแทนสิทธิ์ข้อมูลประกอบ
- PATCH restore ไม่รับ field แก้ไขปะปน คงเหตุผล/expectedUpdatedAt และ validation ที่แต่ละโมดูลใช้ DELETE รับ JSON body เมื่อกฎเดิมต้องใช้
- สินค้า/ผู้ใช้ย้าย PATCH action delete เป็น DELETE โดยคง transaction/guards; role/password/profile/status ยังคง PATCH ตาม action เดิมเมื่อจำเป็น ไม่บังคับทุกโมดูลรับ body เดียวกัน
- Audit Logs/รายงานยัง read-only ไม่เพิ่ม mutation

## เส้นทางเฉพาะที่คงไว้

Auth login, export CSV, สร้างข้อมูลแม่สินค้า และ next-sequence มีหน้าที่เฉพาะ คงเส้นเดิมใน namespace ที่เกี่ยวข้อง ไม่เปลี่ยน Supabase Data API ภายนอกหรือ public allowlists งานนี้รวมเส้น filters/options/config/restore ที่หน้าเว็บใช้ก่อน

## การย้ายและการตรวจรับ

### ติดตาม Postman — เจ้าของสั่งลบรายการไม่ใช้ 2026-10-02

เจ้าของส่งภาพท้วงว่ายังมี filters/config และ POST restore ใน Postman ให้แก้ Collectionที่เปิดอยู่โดยตรง: ตรวจพบ Zuugroup Cloud167คำขอในworkspaceเดิม อัปเดตเฉพาะ Collectionนี้ให้ตรง local133คำขอ เก็บ IDs/auth/scripts/variablesของCloud ไม่สร้างCollectionซ้ำ ไม่รันคำขอเว็บ/DB ไม่เปลี่ยนCollectionตัวอย่างอื่น อ่านกลับตรวจจำนวนและmethod/query

ลบ requests view=filters/config ที่ซ้ำโดยเพิ่ม include ใน list เดิม เก็บ view=options เพราะฟอร์มต้องค้นหา/แบ่งหน้าตัวเลือก ลบกลุ่ม Supabase Data API ที่ยังไม่ได้ใช้ และตัวอย่าง combined GET ซ้ำข้าม Collectionเมื่อมีเส้นเดียวกันอยู่แล้ว เก็บ Login4Roleและpublic/protectedสินค้าเพราะสิทธิ์/responseต่างกัน ถอน variables ที่ไม่มีผู้ใช้หลังลบ เก็บcollection IDsเดิม ปรับคู่มือและตรวจ offline ไม่ syncCloud/ยิงAPI/แก้DB

ปรับทุกหน้า/types/API catalog/Postman local/คู่มือให้ใช้เส้นใหม่แล้วลบ routes ประกอบเก่าเมื่อหมดผู้เรียก ไม่มี alias ถาวร แจ้งให้ Import Postman ใหม่ คง JSX/text/state/API functions ในแต่ละ page.tsx

ไม่แก้ schema/migrations/seed/ข้อมูล DB/สิทธิ์4Role/กฎธุรกิจ OPEN ตรวจ type-check/lint/build และ offline contracts/pagination/route integrity พร้อม stub ตรวจ auth/metadata ไม่ยิง live HTTP/login/DB ไม่ sync Cloud/Deploy/commit/push

⚠️ ต้องทดสอบโดยคุณหลัง implementation: เปลี่ยนหน้า10แถว ตัวกรองต้องมีค่าจากนอกหน้าปัจจุบัน; Combobox ค้นหา/เลือกค่าต่างหน้าได้; เพิ่ม/แก้/ระงับ/ลบ/กู้คืนต้องมี dialog เดิม; Role ไม่มีสิทธิ์และการลบ/ระงับ Admin คนสุดท้ายหรือตนเองต้องยังถูกปฏิเสธตามกฎเดิม
