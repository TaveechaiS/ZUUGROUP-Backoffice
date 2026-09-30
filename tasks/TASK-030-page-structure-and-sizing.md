# TASK-030 — โครงหน้า App และขนาดเนื้อหา

- **สถานะ:** DONE — ผู้ใช้ยืนยันผ่านเมื่อ 2026-09-30
- **ผู้รับผิดชอบ:** AI
- **Branch:** AI
- **Specs:** Project Specs §22.9
**Plan:** [แผนย่อย](../docs/plans/2026-09-25-page-structure-and-sizing-plan.md)

## ขอบเขต

- จัด UI และข้อมูล Mock รายหน้าให้อยู่ใน `src/app` ตาม URL เพื่อให้แก้เฉพาะหน้าได้.
- ปรับขนาดตัวหนังสือ ระยะ Filter/Tab ตาราง กล่อง และ Pagination ตามแนว TPSO โดยใช้สีและฟังก์ชัน ZUU เดิม.
- ไม่แตะ Sidebar, Topbar, Auth, DB, API, สิทธิ์ หรือกฎธุรกิจ.

## ลำดับ / ผล / ไฟล์ / ตรวจรับ

ดู [แผนย่อย](../docs/plans/2026-09-25-page-structure-and-sizing-plan.md).

## ผลดำเนินการ

- ย้ายข้อมูล Mock ของทุก route เข้า `src/app/<route>/data.ts`; Dashboard ใช้ `src/app/data.ts`. สร้าง `page.tsx` เฉพาะทุก route และเลิกใช้ catch-all route กับ Mock registry.
- ย้าย Dashboard content ไป `src/app/dashboard-page-content.tsx`, Users content ไป `src/app/users/users-page-content.tsx` และ renderer ของหน้ารายการไป `src/components/pages/module-list-page.tsx`.
- ปรับ Tab, Filter, ปุ่ม, ตาราง, Pagination, Export และ Dashboard ให้ขนาดตัวอักษร/น้ำหนัก/ระยะเทียบ TPSO. คงสีและ event handlers ของ ZUU; Sidebar/Topbar ไม่ถูกแก้ใน Task นี้.
- เพิ่ม [แผนผังไฟล์รายหน้า](../src/app/README.md). Build แสดง route ทั้ง 22 หน้า; `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run type-check` และ `git diff --check` ผ่าน. ไม่ได้รันชุดทดสอบหรือทดสอบการใช้งานใน Browser.

## ⚠️ ต้องทดสอบโดยคุณ

1. เปิด `/customers`, `/products`, `/users` และ Dashboard เทียบกับ TPSO: Tab, Filter, ตาราง, Pagination, กล่องและข้อความมีขนาดตามแนว TPSO; สี Sidebar/Topbar/เนื้อหายังเป็นสี ZUU.
2. เปิดบนมือถือและ Desktop: ช่อง Filter ไม่ทับกัน ตารางหรือการ์ดอ่านได้ และ Topbar/Sidebar ยังอยู่ตำแหน่งเดิม.
3. ค้นหา กรอง สลับ Tab เปลี่ยนหน้า เพิ่มรายการตัวอย่าง และกด Export: ผลตอบสนองเหมือนก่อน; รีเฟรชแล้วรายการที่เพิ่มหาย.
4. เปิด route อื่นจาก [แผนผัง](../src/app/README.md): เข้าหน้าได้ครบและข้อมูลแต่ละหน้าไม่ปะปนกัน.
