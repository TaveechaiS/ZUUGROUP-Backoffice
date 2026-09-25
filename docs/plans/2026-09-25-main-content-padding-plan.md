# TASK-031 — Padding กรอบเนื้อหาหลัก

## ลำดับงาน

1. ระบุตัว wrapper จากภาพและอ่าน className ปัจจุบันใน `src/components/layout/admin-shell.tsx`.
2. เปลี่ยนเฉพาะชุด padding ของ wrapper เป็น `p-6` โดยคงคลาส layout และองค์ประกอบอื่น.
3. ตรวจ diff ของไฟล์และส่งตำแหน่งให้เจ้าของโครงการตรวจภาพ.

## ผลลัพธ์ / ไฟล์ / ตรวจรับ

- Wrapper ใต้ Topbar ที่ครอบเนื้อหาหน้าและ Footer มี padding 24px ทุกด้านบนทุกขนาดจอ.
- ไฟล์: `src/components/layout/admin-shell.tsx`, Specs, Plan, Task, Handoff.
- ตรวจรับที่ `/customers`: ขอบซ้าย/ขวา/บน/ล่างของ wrapper เท่ากับ `p-6`; สีและการใช้งานเหมือนเดิม.
