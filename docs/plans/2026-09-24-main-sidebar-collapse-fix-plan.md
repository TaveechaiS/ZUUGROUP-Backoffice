# แผนสั้น — TASK-016

1. แยก Sidebar หลักกับ Sidebar ย่อยใน `src/components/layout/sidebar.tsx`; แถบย่อใช้รายการเมนูหลักทุกอัน.
2. วาง Sidebar ย่อยลูกค้าไว้ใน body ที่ `src/components/layout/admin-shell.tsx` ใต้ Top bar; จอแคบใช้แถบแนวนอน จอกว้างใช้คอลัมน์ และให้พื้นที่ body ใช้ความกว้างคงเหลือ.
3. ปรับ token ความกว้าง Sidebar ย่อใน `src/app/globals.css` เป็น 104px; ตรวจ lint, TypeScript, build และส่งให้ผู้ใช้ตรวจการย่อ/ขยายและนำทาง.

ผลลัพธ์: การย่อ Sidebar หลักไม่ทำให้ความกว้างรวมเพิ่ม; เมนูย่อยอยู่ใน body และแสดงอิสระจากสถานะ Sidebar หลัก.
