# แผนสั้น — TASK-020

1. บันทึกข้อกำหนดเอาหัวข้อ, คำว่า “เมนูย่อย” และส่วนค้นหาออก โดยคงรายการนำทาง.
2. เอาหัวข้อและช่องค้นหาออกจาก `CustomerSecondarySidebar`; ลบ state/filter/no-results ที่ใช้เฉพาะการค้นหา.
3. ตั้ง padding container เป็นแนวนอน 0 และแนวตั้ง `py-2`; คง padding ภายในลิงก์, ความกว้าง 250px และ responsive layout เดิม.
4. ส่งให้เจ้าของโครงการตรวจ Sidebar ย่อยบน Desktop.

**ไฟล์:** `src/components/layout/sidebar.tsx`, Specs/Plan/Task และ `tasks/ACTIVE.md`.