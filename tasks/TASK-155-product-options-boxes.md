# TASK-155 — กล่องข้อมูลพื้นฐานสินค้า

สถานะ: IMPLEMENTED / WAITING_FOR_UAT

ผล: กล่อง10ชนิดตาม styleเพิ่มสินค้า พร้อม state/query/form/pagination แยกและ ID error ไม่ซ้ำ. SSR render10details/1form initialKind=brand/ไม่มีselectorเดิมผ่าน; diffผ่าน. ESLintผ่านรอบแรกและตรวจซ้ำหลังปรับopen state. TypeScriptยังไม่ผ่านเพราะ3errorเดิม managerId/salesId/productLot ของ Prisma generated ใน users route/prisma.ts; ไม่พบerrorของไฟล์ที่แก้. รอตรวจ UI/CRUDจริงโดยเจ้าของ.

## แผนย่อย

1. บันทึก ACTIVE/Specs/Plan.
2. product-options-manager.tsx แยกกล่อง10หัวข้อ details/summary ตามหน้าเพิ่มสินค้า; แต่ละ panel ใช้ CRUD/filter/page state เดิม.
3. เปิด initialKind เริ่มต้น รองรับลิงก์จากสินค้า กล่องอื่นโหลดเมื่อเปิดครั้งแรกและพับได้โดยไม่ล้างข้อมูล.
4. แยก ID error ฟอร์มไม่ซ้ำ ตรวจ lint/type/diff/render.

ไฟล์: product-options-manager.tsx และ ACTIVE/Specs/Plan/Task นี้.

## ตรวจรับ

- เปิดหน้าข้อมูลพื้นฐานสินค้าเห็น10กล่องกดหัวข้อ/Enter/Space เปิดปิดได้ ลูกศรตรงสถานะ.
- เปิดหลายกล่องได้ พิมพ์ช่องชื่อ/ค้นหาคนละกล่องแล้วพับเปิดใหม่ ค่าคงอยู่และไม่ปนกัน.
- ลิงก์ ?kind=brand เปิดยี่ห้อเริ่มต้น; เพิ่ม/แก้/เปิดปิดรายการและตารางยังทำงานตาม API เดิม.
- คอม/มือถือไม่ล้นภายนอก ตารางเลื่อนในกล่องได้.
