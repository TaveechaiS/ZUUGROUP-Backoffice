# แผนย่อย TASK-061: เติม SuccessAlert

1. อ่าน `tasks/ACTIVE.md`, component ปัจจุบันและ flow สำเร็จของฟอร์ม; บันทึก Specs/Plan/Task ก่อนโค้ด.
2. ปรับ `src/components/ui/success-alert-component.tsx` เฉพาะการปิดและ motion ให้ dialog ใช้งานได้ตาม props เดิม.
3. เชื่อม `src/components/pages/record-form-page.tsx`, `src/components/pages/record-detail-page.tsx`, `src/app/products/create/create-product-form.tsx`, `src/app/users/create/create-user-form.tsx`, `src/app/users/[employeeCode]/user-detail-content.tsx` โดยรอปิด alert ก่อนนำทางที่จำเป็น.
4. ตรวจ lint/type-check/build และ `git diff --check`; บันทึกผลใน `tasks/TASK-061-success-alert-completion.md` กับ `tasks/ACTIVE.md`.

ผลลัพธ์: การกระทำสำเร็จหลักแสดง SuccessAlert ให้เห็นจริง โดยไม่เปลี่ยนคำขอ API.

วิธีตรวจรับ: สร้าง/แก้/ลบ/กู้คืนรายการตัวอย่าง และสร้างสินค้า/ผู้ใช้; ตรวจว่า alert ขึ้นก่อนเปลี่ยนหน้า ปิดด้วยปุ่มหรือ Escape ได้ และไม่มี alert เมื่อ API ตอบ error.
