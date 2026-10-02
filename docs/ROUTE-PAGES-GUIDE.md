# แก้หน้าแต่ละ Route — TASK-071

โค้ด UI, ข้อความ, state, query และการเรียก API ของหน้าอยู่ใน page.tsx ของหน้านั้น ไม่ใช้ component กลางสร้างทั้งหน้า ไม่ต้องแก้ src/components/pages เพราะเอาออกแล้ว

## ตัวอย่าง Orders

| งาน | ไฟล์ |
|---|---|
| หัวข้อ คอลัมน์ ตาราง filter pagination และโหลดคำสั่งซื้อ | src/app/orders/page.tsx |
| ช่องกรอก ข้อความตรวจข้อมูล และสร้างคำสั่งซื้อ | src/app/orders/create/page.tsx |
| รายละเอียด ฟอร์มแก้ไข และลบคำสั่งซื้อ | src/app/orders/[id]/page.tsx |
| ตรวจสิทธิ์เปิดหน้าเพิ่ม | src/app/orders/create/layout.tsx |
| กฎ API/validation/DB ฝั่ง server | src/app/api/orders/* และ src/server/records/* |

แต่ละหน้าแยกไฟล์จริง ไม่ได้ re-export หน้าอื่น ตัวฟอร์มเขียน JSX รายช่องไว้ใน route มี metadata ของ field ในไฟล์เดียวสำหรับ validation; ปรับ label ให้ตรงทั้งข้อความ UI และ validation เมื่อเปลี่ยน label

## ส่วนที่ใช้ร่วมกัน

- service/http.ts: Get/Post/Update/Delete transport ตามเดิม endpoint/query/flow อยู่ใน route
- SearchCombobox: UI/คีย์บอร์ด รับ options และ callbacks การโหลดตัวเลือกอยู่ใน RelationPicker ของแต่ละหน้า
- StatusBadge/Pagination/Loading/dialog/SuccessAlert: ชิ้นส่วนเล็กตามมาตรฐาน ไม่ได้เลือกโมดูลหรือประกอบทั้งหน้า
- types/api.ts และ feature types: รูปร่างข้อมูล ไม่ใช่ API handler หรือทั้งหน้า
- RouteDataProvider: ส่งข้อมูลเริ่มต้นที่อ่านฝั่ง server ไป client ไม่มี layout UI ทั้งหน้า ข้อมูลสินค้า/ผู้ใช้/masters และ auth ยังอ่านใน layout.tsx ของ route ใช้ notFound/redirect และสิทธิ์เดิม

users/products/audit/dashboard ก็มีเนื้อหาใน page.tsx แล้ว ผู้ใช้ใช้ [employeeCode], ลูกค้าและสินค้าใช้ [id] โดย URL เดิมยังคงใช้ค่าเดิม (สินค้าคือรหัสสินค้า) Alias /customers/list/create และ report create ที่เดิม redirect คงเดิม ไม่สร้างกฎหรือฟอร์มใหม่

แก้ Orders ไม่เปลี่ยน Purchases หรือโมดูลอื่นโดยอัตโนมัติ การเพิ่ม field จริงใน DB/API ยังต้อง Specs/Task และ migration ตามกติกาเดิม ฟังก์ชัน UI แบบเดียวกันที่แยกไว้ต้องแก้แยกเมื่อความต้องการเปลี่ยน

## ตรวจแบบ Offline

- node scripts/test-route-pages.mjs: ไม่มี full-page imports/re-exports, field create/edit ไม่ตกหล่น, inline validation/auth guard ยังอยู่, Combobox ไม่เลือก endpoint
- node scripts/test-pagination.mjs: query contract เดิมยังผ่าน
- npm run type-check / lint / build

## ⚠️ ต้องทดสอบโดยคุณ

1. เปิด Orders และ Purchases ตรวจรายการ/ค้นหา/filter/pagination10/สถานะ desktop/mobile
2. Orders เพิ่มรายการ กรอกไม่ครบเห็นข้อความไทยสีแดง; Combobox ลูกค้า/สถานะค้นหาและเลือกได้ บันทึกแล้ว SuccessAlert เปิดรายละเอียด
3. รายละเอียดแก้ไข กดยกเลิกยืนยันต้องไม่บันทึก ยืนยันแล้วข้อมูลเปลี่ยน ลบและกู้คืนได้ตามเดิม
4. ผู้ใช้ทุก Role เปิดหน้าเพิ่มและ users/audit ต้องได้สิทธิ์เดิม Admin เท่านั้น; สินค้าอ่านได้ตามเดิม
5. users รายละเอียดตามemployeeCode รวมcanonical redirect, productsตามcode รวมลบแล้วสำหรับAdmin, CSVผู้ใช้ครบตามfilter
6. รายงานและ Dashboard ยังโหลดข้อมูลจริง ไม่เปลี่ยน URL หรือ API
7. แก้ข้อความหรือคอลัมน์ใน orders/page.tsx แล้วหน้า Purchases ต้องไม่เปลี่ยน

งานนี้ไม่แก้ DB/schema/seed และไม่ทดสอบ live HTTP/login อัตโนมัติ
