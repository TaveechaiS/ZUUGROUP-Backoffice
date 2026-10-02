# ตรวจ Pagination ผ่าน API — TASK-064

ใช้ดีไซน์เดิม ทุกหน้ารายการหลักดึงครั้งละ10 ไม่มีการแก้ schema/seed

| GET | สิทธิ์ | ตัวกรอง |
|---|---|---|
| `/api/products` | ผู้ใช้ active; deleted เฉพาะ Admin | search, categoryId UUID, status ACTIVE/INACTIVE, deleted false/true |
| `/api/products/filters` | ผู้ใช้ active | คืน categories id/name |
| `/api/users` | Admin | search, role, status ACTIVE/SUSPENDED, deleted false/true |
| `/api/users/export` | Admin | ตัวกรองเหมือน users ส่ง CSV ครบตามตัวกรอง |
| `/api/audit-logs` | Admin | q, action รวมจุด/ตัวพิมพ์เล็ก |
| `/api/audit-logs/filters` | Admin | คืน actions |

รายการรับ limit เริ่มต้น10 สูงสุด50 offset เริ่มต้น0 สูงสุด100000 เลขจำนวนเต็มผิดค่าได้400 คืน products/users/rows และ pagination `{page,pageSize,total,totalPages,offset,limit}` list/count ใช้ transaction RepeatableRead เรียง createdAt/id หรือ occurredAt/id

public products/masters เริ่มต้น10 คง data/pagination เดิม shared modules/reports ใช้ API10 เดิม เพิ่ม clamp เมื่อจำนวนหน้าลดและไม่รับผล request ที่ยกเลิก

## Offline

`node scripts/test-pagination.mjs` ตรวจ bounds/query/count/filter/สิทธิ์ deleted/CSV โดย stub DB ไม่เชื่อม Supabase จากนั้น type-check/lint/build

## ⚠️ ต้องทดสอบโดยคุณ

1. Admin เปิดสินค้า ผู้ใช้ ประวัติและโมดูลที่มีเกิน10รายการ หน้าแรก10 หน้าถัดไปที่เหลือ (15รายการ = 10/5)
2. Network ส่ง limit10 offset0,10 ไม่โหลดทั้งตาราง count ตรง filter
3. เปลี่ยนคำค้น/filter/tab กลับหน้า1 พิมพ์รัวและสลับเร็ว ผลล่าสุดตรงเงื่อนไข ไม่มีผลเก่าทับ
4. หมวดสินค้าโหลดแยกจากหน้าปัจจุบัน ตัวเลือกครบ
5. ลบรายการสุดท้ายหน้าสุดท้ายแล้วกลับรายการ ต้องไปหน้าที่มีข้อมูล ลองลบแล้ว/กู้คืนด้วย
6. CSV users หลายหน้าต้องครบตาม filter สูตรขึ้นต้น =/+/-/@ ถูก escape
7. Role อื่นเข้าถึง users/export/audit/filter ได้403 ไม่ล็อกอินได้401 ผู้ใช้ทั่วไปดู deleted products ได้403
8. Audit action ที่มีจุดค้นหาได้ วันที่ พ.ศ. Bangkok ไม่มี JSON before/after
9. API limit0/51/ทศนิยม/offsetติดลบได้400 โหลดล้มเหลวมีข้อความลองใหม่

ไม่รัน live HTTP/login หรือแก้ DB อัตโนมัติ ผลจริงต้องให้เจ้าของตรวจ
