# TASK-130 — ถอนบริษัทเจ้าของสิทธิ์

สถานะ COMPLETED; 5 ตุลาคม 2569. ถอน field/Combobox metadata แล้ว ESLint/diff whitespace ผ่าน. คงผู้ผลิต/ยี่ห้อ ไม่เปลี่ยน API/DB/commit/deploy.

ลำดับ/ไฟล์: ACTIVE/Specs/Plan → product-create-preview.tsx ถอนบริษัทเจ้าของสิทธิ์จาก fields และ comboboxFields → ESLint/diff. ผลลัพธ์ไม่มีช่องบริษัทเจ้าของสิทธิ์ คงบริษัทผู้ผลิต/ยี่ห้อและการจำข้อมูลในเบราว์เซอร์เดิม. ไม่มี API/DB/พฤติกรรมใหม่.

ตรวจรับ: เปิดเพิ่มสินค้า ไม่พบช่องบริษัทเจ้าของสิทธิ์ แต่บริษัทผู้ผลิตยังอยู่.
