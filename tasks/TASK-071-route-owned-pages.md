# TASK-071 — แยกโค้ดหน้าให้อยู่ใน Route ของตัวเอง

- สถานะ: READY_FOR_USER_TEST — เจ้าของอนุมัติ 2026-10-02 “ok ทำได้เลย”
- Branch: AI

- งานต่อที่อนุมัติ: เปลี่ยน `[ref]` เป็น `[id]` ใน customers/products รวม params/คู่มือ/ชุดตรวจ คง URL และค่ารหัสเดิม

ผลการเปลี่ยนชื่อ: ย้ายโฟลเดอร์และเปลี่ยน params ครบแล้ว typegen/type-check/test-route-pages/diff ผ่าน ไม่เหลือ ref routes ใน src/scripts

⚠️ ต้องทดสอบโดยคุณ: หยุด dev เดิมแล้วรัน npm run dev ใหม่ เปิดรายละเอียดลูกค้าและสินค้าโดยลิงก์เดิม ควรแสดงข้อมูลและแก้ไขได้เหมือนเดิม
- Specs: docs/specs/2026-10-02-route-owned-pages.md
- Plan: docs/plans/2026-10-02-route-owned-pages-plan.md

เจ้าของขอให้แก้รายการ/create/id เป็นอิสระ ไม่ import/re-export component ทั้งหน้าจาก components/pages สำรวจ18หน้ารายการทั่วไป14ชุดcreate/detail และหน้าพิเศษ users/products/audit/dashboard แล้ว เตรียมแผนคง API/สิทธิ์/pagination/validation/confirmation และ shared UI เล็กก่อนลงมือ รออนุมัติ Task และคำตอบขอบเขต shared primitive

เจ้าของตอบใช้ชิ้นส่วนเล็กร่วมกันได้ และแนบตัวอย่าง: page.tsx ต้องมี text/JSX/useState/useEffect/endpoint/query/API functions ของหน้าเอง ใช้ Get/Post transport, types และ Pagination/Combobox กลางได้ ไม่ copy mocks หรือ business logic ของตัวอย่าง ข้อกำหนดปรับใน Specs/Plan แล้ว รออนุมัติ TASK-071 ก่อน implementation ตาม AGENTS.md ข้อ3

## ⚠️ ต้องทดสอบโดยคุณ

ผล implementation: ย้าย54หน้ารายการ/เพิ่ม/รายละเอียดรวมฟอร์มeditและหน้าพิเศษเข้า page.tsx ของ route ตัวเอง ฟอร์ม JSX รายfieldและข้อความ/metadata validation อยู่ใน route ไม่ render จาก registryกลาง โหลด/บันทึก/query/pagination/ตัวเลือก Combobox อยู่ใน route ชิ้นส่วน SearchCombobox ไม่มีHTTP เก็บ server auth/data ใน layout และ RouteDataProvider ไม่มีทั้งหน้า ลบ components/pages/full-page content files/use-paginated-list hook และสคริปต์ย้ายครั้งเดียวแล้ว types/api.ts เก็บเฉพาะ response shape ไม่เปลี่ยน URL/API/DB

ตรวจผ่าน: Next typegen/type-check, lint ไม่มีwarning, build, test-pagination.mjs และ test-route-pages.mjs (60 route audit/14 fieldsets/guards/ไม่มี API ใน Combobox), diff-check รอ UAT ตาม docs/ROUTE-PAGES-GUIDE.md ไม่ยิง liveHTTP/login ไม่commit/push

คู่มือ: src/app/README.md และ docs/ROUTE-PAGES-GUIDE.md ลำดับ alias/reportcreate redirectเดิมคงไว้ ไม่สร้าง flow ใหม่

หลังทำครบ ลอง orders เพิ่ม/รายการ/filter/pagination/detail/แก้/ลบ/กู้คืน แล้วเทียบ purchases ว่าไม่ได้เปลี่ยน เปิด users/products/audit ทุก Role และตรวจ URL/ข้อมูล/CSV/ยืนยัน/ข้อความ required ยังเหมือนเดิม การแก้คอลัมน์ orders ต้องทำได้จาก orders/page.tsx โดยหน้าอื่นไม่เปลี่ยน
