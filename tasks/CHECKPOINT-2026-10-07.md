# Checkpoint — 7 ตุลาคม 2569 (Asia/Bangkok)

Branch AI. จุดก่อนหน้า 22721c8. Local commit เท่านั้น; ดู hash ด้วย `git log -1 --oneline`. ไม่มี push/deploy. เจ้าของสั่งพักงานหลัง checkpoint นี้.

## งานที่เก็บ

- TASK-217–260 (ก่อนรอบนี้, เคยอยู่ใน working tree): pg query queue, เมนูสินค้า/สต็อก, เขตขาย DB/API/Postman, หน้าเพิ่มลูกค้าแบบ preview, ประวัติข้อมูลสินค้า — ดู Task แต่ละรายการ.
- TASK-261: ตัวกรองลูกค้าใหม่ ถอนปุ่มเพิ่ม เพิ่มคอลัมน์จังหวัด.
- TASK-262: ตั้งค่าระบบ → ข้อมูลพื้นฐานลูกค้า (customer_options 5 ชุด: กลุ่มรหัส/ระยะเวลาเครดิต/วันเริ่มนับเครดิต/รอบวางบิล/ประเภทเอกสาร) + API + Postman.
- TASK-263: ลูกค้า DB/API/Postman/หน้า list-create-detail เชื่อมจริง, ไฟล์แนบ private bucket customer-attachments, เลขรันแยกต่อกลุ่ม.
- TASK-264: ลูกค้าตัวอย่าง 15 ราย + เขต (ภายหลังชื่อ ภาคตะวันออก/ภาคตะวันตก/ภาคใต้) ผ่านโค้ดจริง.
- TASK-265–266, 271: สถานะลูกค้าป้ายเดียว (ลบแล้ว → ระงับ/เลิกค้าขาย → ใบอนุญาตหมดอายุ → ใกล้หมดอายุ ≤30 วัน → ใช้งาน) + ตัวกรองสถานะช่องเดียว.
- TASK-267: เตือนใบอนุญาต, ตัดจังหวัดซ้ำ, ชื่อเขตเต็ม.
- TASK-268: แก้ไขลูกค้าทุกช่อง (กันแก้ทับ), สถานะ ใช้งาน/ระงับ/เลิกค้าขาย, ลบ/กู้คืน + แท็บลบแล้ว, ผู้สร้าง/ผู้แก้.
- TASK-269: แก้ไข/ลบ/กู้คืนเขต, ตารางลูกค้าในเขต, ตั้งผู้จัดการ/Sales จากหน้าเขต, แท็บลบแล้ว.
- TASK-270: ที่อยู่ไทย จังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์ (kongvut/thai-province-data MIT, public/data/thai-address.json + LICENSE).

## สถานะ DB (Supabase) ณ checkpoint

Migration ที่ลงแล้วผ่าน setup scripts (additive, transaction): 20261006_customer_options, 20261006_customer_full (+ bucket customer-attachments), 20261007_customer_status. ข้อมูล: customer_options seed ที่ตกลง, ลูกค้าตัวอย่าง 15 ราย (หมายเหตุ "ข้อมูลตัวอย่าง TASK-264"), เขต 4 เขต. ไม่มีการลบข้อมูลจริง.

## ตรวจแล้ว

eslint ทั้งโปรเจกต์ exit 0, tsc exit 0, next build ผ่าน. DB rollback tests: customer-full 12, customer-options 10, territory-live 22 (แก้ sortKey→sortBy ให้ไม่ flaky), territory-multiple-sales 17, route-pages 79. HTTP anonymous ทุก API ใหม่ 401, หน้า redirect /login.
ล้มเดิมไม่เกี่ยวรอบนี้: test-api-contracts (product-full.ts มี runtime code ใน src/types), test-api-field-names (table-sort.ts import Prisma ใน loader).

## ยังค้าง / ต้องทำต่อ

- Browser UAT ทุกงาน TASK-261–271 (ดูหัวข้อ ⚠️ ในแต่ละ Task).
- Postman Cloud ยังไม่ sync (session ไม่มีเครื่องมือ Postman) — Import `postman/Zuugroup.postman_collection.json` แบบ Replace.
- สิทธิ์มองเห็นลูกค้าของ Sales — เจ้าของพักไว้ (ทำเฉพาะ Admin).
- ยอดหนี้/วงเงินคงเหลือ, เชื่อมเอกสารขายกับที่อยู่จัดส่ง/เครดิต — รอโมดูลขาย.
- ลบข้อมูลตัวอย่าง TASK-264 เมื่อเจ้าของสั่ง.
