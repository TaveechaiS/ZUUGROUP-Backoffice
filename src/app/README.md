# จุดแก้แต่ละหน้าของ ZUU

แต่ละ URL มีโฟลเดอร์ของตัวเองใน `src/app` เช่น:

| URL | ดีไซน์หน้า | แหล่งข้อมูล |
|---|---|---|
| `/` Dashboard | `page.tsx`, `dashboard-page-content.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/customers` ลูกค้า | `customers/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/customers/dashboard` | `customers/dashboard/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/customers/list` | `customers/list/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/customers/groups` | `customers/groups/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/customers/territories` | `customers/territories/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/customers/documents` | `customers/documents/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/products` สินค้า | `products/page.tsx`, `products/products-list.tsx` | ฐานข้อมูลจริง |
| `/products/create` เพิ่มสินค้า | `products/create/page.tsx`, `create-product-form.tsx` | ฐานข้อมูลจริง |
| `/products/<รหัสสินค้า>` รายละเอียดสินค้า | `products/[ref]/page.tsx`, `product-detail.tsx` | ฐานข้อมูลจริง |
| `/stock-counts` ตรวจนับ | `stock-counts/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/suppliers` ผู้ขาย | `suppliers/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/purchases` จัดซื้อ | `purchases/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/expenses` ค่าใช้จ่าย | `expenses/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/quotes` ใบเสนอราคา | `quotes/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/orders` คำสั่งซื้อ | `orders/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/billing` วางบิล | `billing/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/promotions` โปรโมชัน | `promotions/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/users` รายชื่อผู้ใช้งาน | `users/page.tsx`, `users/users-list-content.tsx` | ฐานข้อมูลจริง |
| `/users/create` เพิ่มผู้ใช้งาน | `users/create/page.tsx`, `create-user-form.tsx` | ฐานข้อมูลจริง |
| `/users/<รหัสพนักงาน>` รายละเอียดผู้ใช้งาน | `users/[employeeCode]/page.tsx`, `user-detail-content.tsx` | ฐานข้อมูลจริง |
| `/reports/sales` รายงานยอดขาย | `reports/sales/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/reports/inventory` รายงานคลัง | `reports/inventory/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/reports/finance` รายงานการเงิน | `reports/finance/page.tsx` | ตารางรายโมดูลจริงผ่าน API |
| `/audit-logs` ประวัติการทำรายการ | `audit-logs/page.tsx`, `audit-logs/audit-list.tsx` | ฐานข้อมูลจริง (`audit_events`) |
| `/settings` ตั้งค่า | `settings/page.tsx` | ตารางรายโมดูลจริงผ่าน API |

เริ่มจาก page.tsx ของหน้านั้นเพื่อปรับดีไซน์เฉพาะหน้า. ฟิลด์/ชื่อคอลัมน์อยู่ใน src/features/records/modules.json ซึ่งเป็น metadata เท่านั้น. รายการอ่าน DB ผ่าน API รายโมดูล ค้นหาและแบ่งหน้า default 10/max50 ฝั่ง DB.

ข้อมูลหลักและหัวเอกสาร 14 โมดูลใช้ RecordFormPage/RecordDetailPage ร่วม: หน้า create และหน้า UUID มีฟอร์มจริง; Admin สร้าง แก้ ลบเชิงตรรกะ และกู้คืนได้. Role อื่นอ่านตามขอบเขตที่อนุมัติ. ลูกค้า list ใช้ customers ตารางเดียวกับหน้าหลัก.

- Component ร่วม: src/components/pages/module-list-page.tsx, record-form-page.tsx, record-detail-page.tsx
- API: /api/<module>, /[id], /config, /filters, /options, /[id]/restore
- Dashboard: /api/dashboard นับต้นทาง; ไม่แสดงยอดรับรู้รายได้/หนี้สุทธิ/ยอด Lot ที่ยังไม่มี
- รายงาน: /api/reports/sales (หัวคำสั่งซื้อ), inventory (รายการสินค้า), finance (หัววางบิล); ไม่ใช่ผลสต็อก/รับชำระ
- Sidebar/Topbar: src/components/layout/sidebar.tsx, admin-shell.tsx
- เมนู: src/config/navigation.ts
- เติมข้อมูล: npm run seed:records (ไม่ทับข้อมูลเดิม; ไม่มีผลยอดคลัง)
- ประวัติย้ายข้อมูล: scripts/fixtures/operational-migration-backup.json เก็บออฟไลน์ ไม่ใช่แหล่ง runtime

ถอน /api/demo, component Mock และตาราง demo_rows/demo_datasets แล้ว. Users/Products/Audit ใช้ตารางจริงเดิม. สินค้าใหม่ราคาเริ่มต้น 0 ให้กรอกราคาจริงภายหลัง; ไม่มี Lot/ยอดคลังจากการ seed.
