# TASK-092 เชื่อมข้อมูลและเว็บ

สถานะ: IMPLEMENTED — รอเจ้าของทดสอบรวมก่อน commit

เจ้าของอนุมัติ implementation รวมและมอบหมายค้นอายุยา. ขอบเขต/contract ตาม docs/specs/2026-10-03-linked-operations.md และแผน docs/plans/2026-10-03-linked-operations-plan.md. ส่งตรวจรับรวม ไม่มี commit/push/Deploy รอบนี้.

## ผลงานและการตรวจ

- ลง migration บนฐานข้อมูลที่ตั้งไว้แล้ว สำรองลูกค้า/เขตก่อนเปลี่ยนใน local-backups (ไม่เข้า Git); เพิ่ม4เขต ไม่ใส่ยอดสินค้า/ล็อตสมมติ. Prisma validate/generate ผ่าน.
- เชื่อมเขตกับบัญชี Manager/Sales และลูกค้า; category คือกลุ่มลูกค้าเดียว; หน้ากลุ่มเดิม redirect และเก็บข้อมูลเก่า.
- API/UI รับหลายล็อต ยอดคลัง จอง โอน ปรับ แจก/บริจาค สภาพสินค้า และแก้รับภายใน7วัน; Ordersจองทันที FEFO, Managerอนุมัติ, Adminตัดเมื่อเสร็จสิ้น; try/catch, transaction, idempotency และ cost projection.
- verify ผ่าน10/10 รวม ESLint, types, contracts, pagination, route guards, resource API, field names, flow14/14 และ production build.
- real DB integration ผ่าน15/15 รวมคนซ้ำเขต/บทบาท, FEFO, สร้างพร้อมกัน, retry, จอง/คืน/ตัด, ต้นทุน, แก้รับหลังขาย/7วัน, โอน/ปรับ, บริจาค12เดือน, หมดอายุ/เสื่อมสภาพ และ RLS. ล้าง fixtures สำเร็จ.
- Browser เข้าเว็บแล้ว redirect login; ไม่ตรวจหน้าจอหลังล็อกอิน/มือถือหรือวงจร Auth ของ Sales/Manager จริง. UAT ยังต้องเจ้าของทำ.
- คู่มือและวิธีตรวจรับ: docs/LINKED-OPERATIONS-GUIDE.md.

## ⚠️ ต้องทดสอบโดยคุณ

ทำตามรายการ10ข้อในคู่มือ โดยเฉพาะเลือกคน/เขต, รับ2ล็อต, Salesสร้างจอง, Managerอนุมัติ, Adminยืนยัน → ต้องตัดครั้งเดียว และตรวจทั้งคอม/มือถือ. ยังไม่ถือว่าผ่าน UAT และยังไม่ commit.
