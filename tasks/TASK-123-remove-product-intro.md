# TASK-123 — ลบหัวข้อเกริ่นหน้าเพิ่มสินค้า

สถานะ COMPLETED; 5 ตุลาคม 2569. ลบ header ภายในฟอร์มแล้ว ESLint/diff whitespace ผ่าน. ไม่เปลี่ยนช่องกรอก/Combobox/Topbar/Side และไม่มี API/DB/commit/deploy.

ลำดับ: ACTIVE/Specs/Plan บันทึกขอบเขต → product-create-preview.tsx ลบ header หัวข้อเพิ่มสินค้าและข้อความเกริ่นพร้อมเส้นคั่น → ESLint/diff. ผลลัพธ์เริ่มที่ข้อมูลทั่วไป คงช่องกรอก/Combobox/Topbar/Side เดิม. ไม่มีพฤติกรรมใหม่/API/DB.

ตรวจรับ: เปิดเพิ่มสินค้า ควรไม่เห็นหัวข้อเพิ่มสินค้าซ้ำหรือข้อความเกริ่นเหนือข้อมูลทั่วไป.
