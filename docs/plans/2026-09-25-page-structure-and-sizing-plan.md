# TASK-030 — โครงหน้า App และขนาดเนื้อหา

## ขอบเขตและลำดับ

1. ตรวจขนาดจาก TPSO และตำแหน่ง UI/ข้อมูลของ ZUU; บันทึกเกณฑ์ใน Specs §22.9.
2. สร้าง `src/app/<route>/page.tsx` ทุกหน้าที่อยู่ใน `ADMIN_PAGES`; ย้าย `data.ts` ของหน้านั้นมาอยู่ในโฟลเดอร์เดียวกัน. ย้าย UI กลางออกจาก `features/mock` ไป component ที่ใช้ร่วมกัน และเก็บ UI ผู้ใช้ใน `src/app/users`.
3. ปรับขนาด Tab, Filter, ตาราง, Pagination, Export และกล่อง/ตัวอักษรในเนื้อหาตามสัดส่วน TPSO. คงสี, Sidebar, Topbar, responsive และ event handlers เดิม.
4. ปรับคู่มือจุดแก้ไฟล์และ Handoff; ตรวจความครบ route, TypeScript/lint/build และ diff; ส่งให้เจ้าของโครงการตรวจภาพและพฤติกรรม.

## ผลลัพธ์และไฟล์

- ทุก URL มีโฟลเดอร์ใน `src/app` พร้อม `page.tsx` และ `data.ts` ของหน้านั้น; ขนาดเนื้อหารายการสอดคล้องกันโดยไม่เปลี่ยนสีหรือการทำงาน.
- ไฟล์หลัก: `src/app/**/{page,data}.ts*`, `src/app/{dashboard-page-content,users/users-page-content}.tsx`, `src/components/pages/module-list-page.tsx`, `src/features/mock/mock-config.ts`, `src/config/navigation.ts` (อ่านเท่านั้น), เอกสาร Specs/Plan/Task/Handoff.
- ไม่แตะ API, Auth, DB, Storage, เมนู, Sidebar หรือ Topbar.

## วิธีตรวจรับ

- เปิด `/customers`, `/products`, `/users`, Dashboard และ route ย่อย; สี/เมนู/Topbar เหมือนเดิม แต่ขนาด Tab/Filter/ตาราง/กล่องตามเกณฑ์ §22.9.
- ค้นหา กรอง เปลี่ยน Tab เพิ่มข้อมูลตัวอย่าง Export และ Pagination ได้เหมือนก่อน; refresh แล้วข้อมูลที่เพิ่มหาย.
- แต่ละหน้าแก้ดีไซน์ที่ `src/app/<route>/page.tsx` และแก้ข้อมูลตัวอย่างที่ `data.ts`; route อื่นไม่เปลี่ยนโดยไม่ตั้งใจ.
